import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  date: z.string().min(1),
  workoutType: z.enum(["STRENGTH", "WALK", "YOGA", "CARDIO", "HIIT", "PILATES", "OTHER"]),
  durationMin: z.string().min(1),
  intensity: z.enum(["LIGHT", "MODERATE", "INTENSE", ""]).optional(),
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
    const workout = await prisma.workoutLog.create({
      data: {
        profileId: user.id,
        date: new Date(parsed.data.date),
        workoutType: parsed.data.workoutType,
        durationMin: parseInt(parsed.data.durationMin),
        intensity: parsed.data.intensity && parsed.data.intensity !== ""
          ? parsed.data.intensity
          : null,
        notes: parsed.data.notes?.trim() || null,
      },
    });
    return NextResponse.json({ workout });
  } catch (error) {
    console.error("Workout create error:", error);
    return NextResponse.json({ error: "Save failed." }, { status: 500 });
  }
}