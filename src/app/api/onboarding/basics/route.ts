import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const schema = z.object({
    dateOfBirth: z.string().min(1),
    heightCm: z.string().min(1),
    weightKg: z.string().min(1),
    lastPeriodStart: z.string().min(1),
});

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: "Please fill all fields." }, { status: 400 });
    }

    const { dateOfBirth, heightCm, weightKg, lastPeriodStart } = parsed.data;

    try {
        await prisma.$transaction([
            prisma.profile.update({
                where: { id: user.id },
                data: {
                    dateOfBirth: new Date(dateOfBirth),
                    heightCm: parseFloat(heightCm),
                    weightKg: parseFloat(weightKg),
                    onboardingStep: 1,
                },
            }),
            prisma.cycle.create({
                data: {
                    profileId: user.id,
                    startDate: new Date(lastPeriodStart),
                },
            }),
        ]);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Basics error:", error);
        return NextResponse.json({ error: "Save failed." }, { status: 500 });
    }
}