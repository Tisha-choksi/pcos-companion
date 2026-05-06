import { NextResponse } from "next/server";
import { z } from "zod";
import { startOfDay, subDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { generateJSON } from "@/lib/ai/groq";
import {
    buildDietPlanPrompt,
    DIET_PLAN_SYSTEM,
    type DietPlanInput,
    type DietPlanOutput,
} from "@/lib/ai/prompts/diet-plan";
import { getCyclePhase } from "@/lib/pcos/cycle-phase";
import { computeCycleStats } from "@/lib/pcos/cycle-stats";
import { SYMPTOMS } from "@/lib/pcos/symptoms";

const schema = z.object({
    cuisine: z.string().min(1).max(50),
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
    const threeDaysAgo = subDays(today, 3);

    try {
        // Gather context for the AI
        const [profile, recentMeals, todayMeals, activeMeds, todayLog] =
            await Promise.all([
                prisma.profile.findUnique({
                    where: { id: user.id },
                    include: {
                        cycles: { orderBy: { startDate: "desc" }, take: 6 },
                    },
                }),
                prisma.dietLog.findMany({
                    where: {
                        profileId: user.id,
                        date: { gte: threeDaysAgo, lt: today },
                    },
                    select: { description: true },
                    take: 12,
                }),
                prisma.dietLog.findMany({
                    where: { profileId: user.id, date: today },
                    select: { description: true, mealType: true },
                }),
                prisma.medication.findMany({
                    where: { profileId: user.id, stoppedAt: null },
                    select: { name: true },
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

        // Get top symptoms (severity >= 3)
        const symptomData = (todayLog?.symptoms as Record<string, number>) || {};
        const topSymptoms = Object.entries(symptomData)
            .filter(([, v]) => v >= 3)
            .map(([k]) => SYMPTOMS.find((s) => s.key === k)?.label || k);

        const aiInput: DietPlanInput = {
            phenotype: profile.phenotype,
            cyclePhase: phase,
            cuisine: parsed.data.cuisine,
            recentMeals: recentMeals.map((m) => m.description).slice(0, 8),
            todayMealsAlready: todayMeals.map(
                (m) => `${m.mealType}: ${m.description}`,
            ),
            activeMedications: activeMeds.map((m) => m.name),
            topSymptoms,
            language: parsed.data.language,
        };

        const result = await generateJSON<DietPlanOutput>(
            DIET_PLAN_SYSTEM,
            buildDietPlanPrompt(aiInput),
        );

        return NextResponse.json({
            plan: result.plan,
            dailyTip: result.daily_tip,
            context: {
                phenotype: profile.phenotype,
                cyclePhase: phase,
            },
        });
    } catch (error) {
        console.error("Diet plan generation error:", error);
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