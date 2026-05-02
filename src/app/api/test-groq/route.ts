import { NextResponse } from "next/server";
import { generateJSON } from "@/lib/ai/groq";

export async function GET() {
    try {
        const result = await generateJSON<{ message: string }>(
            "You are a helpful assistant. Always respond in JSON format.",
            'Say hello in one short sentence. Format: { "message": "..." }',
        );

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error("Groq test failed:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}