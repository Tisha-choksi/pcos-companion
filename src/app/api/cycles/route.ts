import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
    startDate: z.string().min(1),
    endDate: z.string().optional(),
    flowIntensity: z.enum(["SPOTTING", "LIGHT", "MEDIUM", "HEAVY"]).optional(),
    notes: z.string().optional(),
});

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid data. Please check the form." },
            { status: 400 },
        );
    }

    const { startDate, endDate, flowIntensity, notes } = parsed.data;

    // Validation: end date must be after start date
    if (endDate && new Date(endDate) < new Date(startDate)) {
        return NextResponse.json(
            { error: "End date must be after start date." },
            { status: 400 },
        );
    }

    try {
        const cycle = await prisma.cycle.create({
            data: {
                profileId: user.id,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                flowIntensity: flowIntensity || null,
                notes: notes?.trim() || null,
            },
        });

        return NextResponse.json({ cycle });
    } catch (error) {
        console.error("Cycle create error:", error);
        return NextResponse.json(
            { error: "Failed to save. Please try again." },
            { status: 500 },
        );
    }
}