import { prisma } from "@/lib/prisma";
import { startOfDay, subDays, format, differenceInDays } from "date-fns";
import { computeCycleStats } from "@/lib/pcos/cycle-stats";
import { getCyclePhase, PHASE_LABELS } from "@/lib/pcos/cycle-phase";
import { SYMPTOMS } from "@/lib/pcos/symptoms";

export type UserContext = {
    basics: string;
    pcos: string;
    cycles: string;
    symptoms: string;
    medications: string;
    diet: string;
    workouts: string;
};

/**
 * Build a structured user context string for the AI system prompt.
 * Pulls data efficiently in parallel, then formats for the LLM.
 */
export async function buildUserContext(userId: string): Promise<UserContext> {
    const today = startOfDay(new Date());
    const fourteenDaysAgo = subDays(today, 14);
    const sevenDaysAgo = subDays(today, 7);

    const [profile, recentSymptoms, activeMeds, recentMeals, recentWorkouts] =
        await Promise.all([
            prisma.profile.findUnique({
                where: { id: userId },
                include: {
                    cycles: { orderBy: { startDate: "desc" }, take: 6 },
                },
            }),
            prisma.symptomLog.findMany({
                where: { profileId: userId, date: { gte: fourteenDaysAgo } },
                orderBy: { date: "desc" },
            }),
            prisma.medication.findMany({
                where: { profileId: userId, stoppedAt: null },
            }),
            prisma.dietLog.findMany({
                where: { profileId: userId, date: { gte: sevenDaysAgo } },
                orderBy: { date: "desc" },
                take: 10,
            }),
            prisma.workoutLog.findMany({
                where: { profileId: userId, date: { gte: sevenDaysAgo } },
                orderBy: { date: "desc" },
            }),
        ]);

    if (!profile) {
        return {
            basics: "User profile not found.",
            pcos: "",
            cycles: "",
            symptoms: "",
            medications: "",
            diet: "",
            workouts: "",
        };
    }

    // BASICS
    const age = profile.dateOfBirth
        ? Math.floor(differenceInDays(new Date(), new Date(profile.dateOfBirth)) / 365)
        : null;
    const bmi =
        profile.heightCm && profile.weightKg
            ? (profile.weightKg / (profile.heightCm / 100) ** 2).toFixed(1)
            : null;

    const basics = [
        profile.fullName ? `Name: ${profile.fullName.split(" ")[0]}` : null,
        age ? `Age: ${age}` : null,
        bmi ? `BMI: ${bmi}` : null,
    ]
        .filter(Boolean)
        .join(" · ");

    // PCOS DETAILS
    const phenotypeLabels: Record<string, string> = {
        INSULIN_RESISTANT: "insulin-resistant PCOS (most common type — body has trouble managing blood sugar)",
        INFLAMMATORY: "inflammatory PCOS (chronic low-grade inflammation drives symptoms)",
        ADRENAL: "adrenal PCOS (stress-related, adrenal glands produce extra androgens)",
        LEAN: "lean PCOS (PCOS without significant insulin resistance)",
        UNKNOWN: "mixed-pattern PCOS (features of multiple types)",
    };

    const diagnosisText =
        profile.diagnosisStatus === "DIAGNOSED"
            ? `Formally diagnosed${profile.diagnosedAt ? ` in ${format(new Date(profile.diagnosedAt), "MMM yyyy")}` : ""}`
            : profile.diagnosisStatus === "SUSPECTED"
                ? "Suspects she has PCOS (no formal diagnosis)"
                : "Tracking symptoms, unsure of diagnosis";

    const pcos = [
        profile.phenotype
            ? `Type: ${phenotypeLabels[profile.phenotype]}`
            : "Type: not yet classified",
        diagnosisText,
    ].join(". ");

    // CYCLES
    const stats = computeCycleStats(profile.cycles);
    const lastCycle = profile.cycles[0];
    const phase = getCyclePhase(lastCycle?.startDate, stats.averageLength);
    const cycleDay = lastCycle
        ? differenceInDays(new Date(), new Date(lastCycle.startDate)) + 1
        : null;

    const cycles = lastCycle
        ? [
            `Cycle day: ${cycleDay} (${PHASE_LABELS[phase]} phase)`,
            stats.averageLength ? `Average cycle: ${stats.averageLength} days` : null,
            stats.variability !== null ? `Variability: ±${stats.variability} days` : null,
            stats.isIrregular ? "Cycles are irregular." : null,
            `Cycles tracked: ${stats.totalCycles}`,
        ]
            .filter(Boolean)
            .join(". ")
        : "No cycles logged yet.";

    // SYMPTOMS — find patterns
    const symptomCounts: Record<string, { total: number; days: number; severitySum: number }> = {};
    recentSymptoms.forEach((log) => {
        const sx = (log.symptoms as Record<string, number>) || {};
        Object.entries(sx).forEach(([key, severity]) => {
            if (severity > 0) {
                if (!symptomCounts[key]) {
                    symptomCounts[key] = { total: 0, days: 0, severitySum: 0 };
                }
                symptomCounts[key].days += 1;
                symptomCounts[key].severitySum += severity;
            }
        });
    });

    const topSymptoms = Object.entries(symptomCounts)
        .sort((a, b) => b[1].days - a[1].days)
        .slice(0, 5)
        .map(([key, data]) => {
            const meta = SYMPTOMS.find((s) => s.key === key);
            const avgSev = (data.severitySum / data.days).toFixed(1);
            return `${meta?.label || key} (${data.days} days, avg severity ${avgSev}/5)`;
        });

    const symptoms =
        topSymptoms.length > 0
            ? `Top symptoms past 14 days: ${topSymptoms.join("; ")}`
            : "No symptoms logged in past 14 days.";

    // MEDICATIONS
    const medications =
        activeMeds.length > 0
            ? `Currently taking: ${activeMeds.map((m) => `${m.name}${m.dosage ? ` ${m.dosage}` : ""}`).join(", ")}`
            : "Not taking any medications.";

    // DIET
    const giCounts = recentMeals.reduce(
        (acc, m) => {
            if (m.giCategory) acc[m.giCategory] = (acc[m.giCategory] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>,
    );

    const diet =
        recentMeals.length > 0
            ? `Past 7 days: ${recentMeals.length} meals logged. ${giCounts.LOW || 0} low-GI, ${giCounts.MEDIUM || 0} medium-GI, ${giCounts.HIGH || 0} high-GI.`
            : "No meals logged in past 7 days.";

    // WORKOUTS
    const workoutMin = recentWorkouts.reduce((sum, w) => sum + w.durationMin, 0);
    const strengthCount = recentWorkouts.filter((w) => w.workoutType === "STRENGTH").length;
    const workouts =
        recentWorkouts.length > 0
            ? `Past 7 days: ${recentWorkouts.length} workouts (${workoutMin} total minutes), ${strengthCount} strength sessions.`
            : "No workouts logged in past 7 days.";

    return { basics, pcos, cycles, symptoms, medications, diet, workouts };
}

/**
 * Format the context object as a readable block for the system prompt.
 */
export function formatContextForPrompt(ctx: UserContext): string {
    return `USER CONTEXT (use this to personalize responses, but don't recite it back):

About her:
- ${ctx.basics}
- ${ctx.pcos}

Cycle:
- ${ctx.cycles}

Recent patterns:
- ${ctx.symptoms}
- ${ctx.medications}
- ${ctx.diet}
- ${ctx.workouts}`;
}