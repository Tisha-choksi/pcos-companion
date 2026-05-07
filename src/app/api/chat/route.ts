import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { groq, GROQ_MODEL } from "@/lib/ai/groq";
import { CHAT_SYSTEM_PROMPT } from "@/lib/ai/prompts/chat-system";
import {
    buildUserContext,
    formatContextForPrompt,
} from "@/lib/ai/build-user-context";

export const maxDuration = 30;

const schema = z.object({
    message: z.string().min(1).max(2000),
    conversationId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    const { message, conversationId: providedConvId } = parsed.data;

    try {
        // Get or create conversation
        let conversationId = providedConvId;
        if (!conversationId) {
            const newConv = await prisma.conversation.create({
                data: { profileId: user.id },
            });
            conversationId = newConv.id;
        } else {
            // Verify ownership
            const conv = await prisma.conversation.findUnique({
                where: { id: conversationId },
            });
            if (!conv || conv.profileId !== user.id) {
                return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
            }
        }

        // Save user message
        await prisma.message.create({
            data: {
                conversationId,
                role: "USER",
                content: message,
            },
        });

        // Build full context (parallel: user data + recent messages)
        const [userContext, recentMessages] = await Promise.all([
            buildUserContext(user.id),
            prisma.message.findMany({
                where: { conversationId },
                orderBy: { createdAt: "asc" },
                take: 30,
            }),
        ]);

        const systemPrompt = `${CHAT_SYSTEM_PROMPT}\n\n${formatContextForPrompt(userContext)}`;

        // Build message history for Groq
        const groqMessages = [
            { role: "system" as const, content: systemPrompt },
            ...recentMessages.map((m) => ({
                role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
                content: m.content,
            })),
        ];

        // Stream from Groq
        const stream = await groq.chat.completions.create({
            model: GROQ_MODEL,
            messages: groqMessages,
            temperature: 0.7,
            max_tokens: 1024,
            stream: true,
        });

        let fullResponse = "";

        const responseStream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();

                // Send conversation ID first as a special marker
                controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: "conv", id: conversationId })}\n\n`),
                );

                try {
                    for await (const chunk of stream) {
                        const content = chunk.choices[0]?.delta?.content || "";
                        if (content) {
                            fullResponse += content;
                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify({ type: "token", content })}\n\n`),
                            );
                        }
                    }

                    // Save full assistant response
                    await prisma.message.create({
                        data: {
                            conversationId,
                            role: "ASSISTANT",
                            content: fullResponse,
                        },
                    });

                    // Auto-generate conversation title from first user message if not set
                    const conv = await prisma.conversation.findUnique({
                        where: { id: conversationId },
                    });
                    if (conv && !conv.title) {
                        const title = message.slice(0, 60) + (message.length > 60 ? "..." : "");
                        await prisma.conversation.update({
                            where: { id: conversationId },
                            data: { title },
                        });
                    }

                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
                    controller.close();
                } catch (error) {
                    console.error("Stream error:", error);
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({ type: "error", message: "Something went wrong" })}\n\n`,
                        ),
                    );
                    controller.close();
                }
            },
        });

        return new Response(responseStream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache, no-transform",
                Connection: "keep-alive",
            },
        });
    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json(
            { error: "Failed to send message. Please try again." },
            { status: 500 },
        );
    }
}