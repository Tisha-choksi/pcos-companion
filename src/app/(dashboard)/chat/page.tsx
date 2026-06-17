import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ChatClient } from "./_components/ChatClient";

export default async function ChatPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const profile = await prisma.profile.findUnique({
        where: { id: user.id },
        select: { fullName: true, phenotype: true },
    });

    const conversation = await prisma.conversation.findFirst({
        where: { profileId: user.id, archived: false },
        orderBy: { updatedAt: "desc" },
        include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    const conversations = await prisma.conversation.findMany({
        where: { profileId: user.id, archived: false },
        orderBy: { updatedAt: "desc" },
        select: {
            id: true,
            title: true,
            updatedAt: true,
            _count: { select: { messages: true } },
        },
    });

    const initialMessages = conversation
        ? conversation.messages.map((m) => ({
            id: m.id,
            role: m.role.toLowerCase() as "user" | "assistant",
            content: m.content,
        }))
        : [];

    return (
        <ChatClient
            initialMessages={initialMessages}
            initialConversationId={conversation?.id || null}
            conversations={conversations.map((c) => ({
                id: c.id,
                title: c.title,
                messageCount: c._count.messages,
                updatedAt: c.updatedAt.toISOString(),
            }))}
            userName={profile?.fullName?.split(" ")[0] || "there"}
            phenotype={profile?.phenotype}
        />
    );
}
