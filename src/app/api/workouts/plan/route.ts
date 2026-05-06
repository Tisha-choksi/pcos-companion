import { NextResponse } from "next/server";
import { z } from "zod";
import { startOfDay, subDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { generateJSON } from "@/lib/ai/groq";
import {
  buildWorkoutPlanPrompt,
  WORKOUT_PLAN_SYSTEM,
  type WorkoutPlanInput,
  type WorkoutPlanOutput,
} from "@/lib/ai/prompts/workout-plan";
import { getCyclePhase } from "@/lib/pcos/cycle-phase";
import { computeCycleStats } from "@/lib/pcos/cycle-stats";
import { SYMPTOMS } from "@/lib/pcos/symptoms";

const schema = z.object({
  preferredDuration: z.number().min(10).max(180),
  preferredType: z.string().min(1).max(50),
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]),
  language: z.enum(["english", "hindi-mixed"]).optional().default("english"),
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

  const today = startOfDay(new Date());
  const sevenDaysAgo = subDays(today, 7);

  try {
    const [profile, recentWorkouts, todayLog] = await Promise.all([
      prisma.profile.findUnique({
        where: { id: user.id },
        include: {
          cycles: { orderBy: { startDate: "desc" }, take: 6 },
        },
      }),
      prisma.workoutLog.findMany({
        where: {
          profileId: user.id,
          date: { gte: sevenDaysAgo },
        },
        orderBy: { date: "desc" },
      }),
      prisma.symptomLog.findUnique({
        where: { profileId_date: { profileId: user.id, date: today } },
      }),
    ]);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const stats = computeCycleStats(profile.cycles);
    const lastPeriod = profile.cycles[0]?.startDate || null;
    const phase = getCyclePhase(lastPeriod, stats.averageLength);

    const symptomData = (todayLog?.symptoms as Record<string, number>) || {};
    const topSymptoms = Object.entries(symptomData)
      .filter(([, v]) => v >= 3)
      .map(([k]) => SYMPTOMS.find((s) => s.key === k)?.label || k);

    const aiInput: WorkoutPlanInput = {
      phenotype: profile.phenotype,
      cyclePhase: phase,
      recentWorkouts: recentWorkouts.map(
        (w) => `${w.workoutType.toLowerCase()} (${w.durationMin}min)`,
      ),
      preferredDuration: parsed.data.preferredDuration,
      preferredType: parsed.data.preferredType,
      fitnessLevel: parsed.data.fitnessLevel,
      topSymptoms,
      language: parsed.data.language,
    };

    const result = await generateJSON<WorkoutPlanOutput>(
      WORKOUT_PLAN_SYSTEM,
      buildWorkoutPlanPrompt(aiInput),
    );

    return NextResponse.json({
      workouts: result.workouts,
      dailyTip: result.daily_tip,
      context: {
        phenotype: profile.phenotype,
        cyclePhase: phase,
      },
    });
  } catch (error) {
    console.error("Workout plan generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate plan. Please try again.",
      },
      { status: 500 },
    );
  }
}