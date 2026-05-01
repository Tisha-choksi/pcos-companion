import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const schema = z.object({
    date: z.string().min(1),
    mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
    description: z.string().min(1),
    giCategory: z.enum(["LOW", "MEDIUM", "HIGH", ""]).optional(),
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
        const meal = await prisma.dietLog.create({
            data: {
                profileId: user.id,
                date: new Date(parsed.data.date),
                mealType: parsed.data.mealType,
                description: parsed.data.description,
                giCategory: parsed.data.giCategory && parsed.data.giCategory !== ""
                    ? parsed.data.giCategory
                    : null,
                notes: parsed.data.notes?.trim() || null,
            },
        });
        return NextResponse.json({ meal });
    } catch (error) {
        console.error("Diet create error:", error);
        return NextResponse.json({ error: "Save failed." }, { status: 500 });
    }
}