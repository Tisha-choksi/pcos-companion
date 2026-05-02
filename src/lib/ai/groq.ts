import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in environment variables");
}

export const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export const GROQ_MODEL = "llama-3.3-70b-versatile";

/**
 * Generate JSON output from Groq with retry logic.
 * Llama models support JSON mode, which forces valid JSON output.
 */
export async function generateJSON<T>(
    systemPrompt: string,
    userPrompt: string,
): Promise<T> {
    const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
        throw new Error("No content returned from Groq");
    }

    try {
        return JSON.parse(content) as T;
    } catch (error) {
        console.error("Failed to parse Groq response as JSON:", content);
        throw new Error("AI returned invalid JSON");
    }
}