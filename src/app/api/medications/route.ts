import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const schema = z.object({
    name: z.string().min(1),
    category: z.enum([
        "INSULIN_SENSITIZER",
        "ANDROGEN_BLOCKER",
        "HORMONAL",
        "SUPPLEMENT",
        "OTHER",
    ]),
    dosage: z.string().optional(),
    frequency: z.string().optional(),
    startedAt: z.string().min(1),
    notes: z.string().optional(),
});

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    try {
        const med = await prisma.medication.create({
            data: {
                profileId: user.id,
                name: parsed.data.name,
                category: parsed.data.category,
                dosage: parsed.data.dosage || null,
                frequency: parsed.data.frequency || null,
                startedAt: new Date(parsed.data.startedAt),
                notes: parsed.data.notes?.trim() || null,
            },
        });
        return NextResponse.json({ medication: med });
    } catch (error) {
        console.error("Med create error:", error);
        return NextResponse.json({ error: "Save failed." }, { status: 500 });
    }
}