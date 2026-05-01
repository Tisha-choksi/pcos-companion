import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "date-fns";

const schema = z.object({
    date: z.string(),
    symptoms: z.record(z.string(), z.number().min(0).max(5)),
    mood: z.number().min(1).max(5).optional(),
    energy: z.number().min(1).max(5).optional(),
    notes: z.string().optional(),
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
        return NextResponse.json({ error: "Invalid data." }, { status: 400 });
    }

    const { date, symptoms, mood, energy, notes } = parsed.data;
    const dayDate = startOfDay(new Date(date));

    try {
        const log = await prisma.symptomLog.upsert({
            where: {
                profileId_date: {
                    profileId: user.id,
                    date: dayDate,
                },
            },
            create: {
                profileId: user.id,
                date: dayDate,
                symptoms,
                mood: mood ?? null,
                energy: energy ?? null,
                notes: notes?.trim() || null,
            },
            update: {
                symptoms,
                mood: mood ?? null,
                energy: energy ?? null,
                notes: notes?.trim() || null,
            },
        });

        return NextResponse.json({ log });
    } catch (error) {
        console.error("Symptom log error:", error);
        return NextResponse.json(
            { error: "Failed to save." },
            { status: 500 },
        );
    }
}