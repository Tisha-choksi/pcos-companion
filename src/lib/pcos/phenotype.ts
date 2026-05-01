import type { Phenotype } from "@prisma/client";

export type PhenotypeAnswers = {
    irregularCycles: boolean;
    weightGainAround: "belly" | "hips" | "even" | "none";
    acneType: "jaw_chin" | "forehead" | "back_chest" | "none";
    hairGrowth: "face_chest" | "thinning" | "both" | "neither";
    energyLevels: "low_morning" | "low_evening" | "stable" | "fluctuates";
    sugarCravings: "intense" | "occasional" | "rare";
    stressResponse: "anxious" | "tired" | "fine";
    cardiovascular: "high_resting_hr" | "feels_inflamed" | "neither";
};

export type PhenotypeResult = {
    phenotype: Phenotype;
    confidence: "high" | "medium" | "low";
    scores: Record<Phenotype, number>;
    description: string;
    summary: string;
};

const DESCRIPTIONS: Record<Phenotype, { summary: string; description: string }> = {
    INSULIN_RESISTANT: {
        summary: "Insulin-resistant PCOS",
        description:
            "Your body has a harder time managing blood sugar, which drives the hormonal symptoms. The most common type — about 70% of women with PCOS have this. Diet and strength training make the biggest difference here.",
    },
    INFLAMMATORY: {
        summary: "Inflammatory PCOS",
        description:
            "Chronic low-grade inflammation is the main driver of your symptoms. Often shows up as joint pain, skin issues, and fatigue. Anti-inflammatory diet changes and stress management tend to help most.",
    },
    ADRENAL: {
        summary: "Adrenal PCOS",
        description:
            "Your adrenal glands are producing extra androgens, often linked to chronic stress. Less common, around 10% of cases. Stress reduction, sleep, and supporting your nervous system matter most.",
    },
    LEAN: {
        summary: "Lean PCOS",
        description:
            "You have PCOS without significant insulin resistance — symptoms appear despite a normal weight. Often involves subtle hormonal imbalances. Targeted nutrition and gentle movement work better than aggressive interventions.",
    },
    UNKNOWN: {
        summary: "Mixed pattern",
        description:
            "Your answers don't strongly match a single type, which is common — many women have features of multiple types. We'll refine this as you log more data over time.",
    },
};

/**
 * Score each phenotype based on answers. Highest score wins.
 * The scoring weights are based on common clinical patterns,
 * not a diagnostic tool.
 */
export function classifyPhenotype(answers: PhenotypeAnswers): PhenotypeResult {
    const scores: Record<Phenotype, number> = {
        INSULIN_RESISTANT: 0,
        INFLAMMATORY: 0,
        ADRENAL: 0,
        LEAN: 0,
        UNKNOWN: 0,
    };

    // Weight gain pattern
    if (answers.weightGainAround === "belly") scores.INSULIN_RESISTANT += 3;
    if (answers.weightGainAround === "even") scores.INFLAMMATORY += 2;
    if (answers.weightGainAround === "none") scores.LEAN += 3;
    if (answers.weightGainAround === "hips") scores.LEAN += 1;

    // Acne pattern
    if (answers.acneType === "jaw_chin") scores.INSULIN_RESISTANT += 2;
    if (answers.acneType === "forehead") scores.ADRENAL += 2;
    if (answers.acneType === "back_chest") scores.INFLAMMATORY += 2;

    // Hair pattern
    if (answers.hairGrowth === "face_chest") scores.INSULIN_RESISTANT += 2;
    if (answers.hairGrowth === "thinning") scores.ADRENAL += 1;
    if (answers.hairGrowth === "both") {
        scores.INSULIN_RESISTANT += 1;
        scores.ADRENAL += 1;
    }

    // Energy levels
    if (answers.energyLevels === "low_morning") scores.ADRENAL += 2;
    if (answers.energyLevels === "low_evening") scores.INSULIN_RESISTANT += 1;
    if (answers.energyLevels === "fluctuates") scores.INSULIN_RESISTANT += 2;
    if (answers.energyLevels === "stable") scores.LEAN += 1;

    // Sugar cravings
    if (answers.sugarCravings === "intense") scores.INSULIN_RESISTANT += 3;
    if (answers.sugarCravings === "occasional") scores.INFLAMMATORY += 1;
    if (answers.sugarCravings === "rare") scores.LEAN += 1;

    // Stress response
    if (answers.stressResponse === "anxious") scores.ADRENAL += 3;
    if (answers.stressResponse === "tired") scores.INSULIN_RESISTANT += 1;

    // Cardiovascular
    if (answers.cardiovascular === "high_resting_hr") scores.ADRENAL += 1;
    if (answers.cardiovascular === "feels_inflamed") scores.INFLAMMATORY += 3;

    // Irregular cycles is a baseline of all types
    if (!answers.irregularCycles) {
        // Without irregular cycles, lean is more likely
        scores.LEAN += 1;
    }

    // Find winner
    const candidates: Phenotype[] = ["INSULIN_RESISTANT", "INFLAMMATORY", "ADRENAL", "LEAN"];
    const sorted = candidates.sort((a, b) => scores[b] - scores[a]);
    const top = sorted[0];
    const second = sorted[1];

    const confidence: "high" | "medium" | "low" =
        scores[top] - scores[second] >= 3
            ? "high"
            : scores[top] - scores[second] >= 1
                ? "medium"
                : "low";

    // If confidence is too low, mark as unknown
    const finalPhenotype: Phenotype = confidence === "low" ? "UNKNOWN" : top;

    return {
        phenotype: finalPhenotype,
        confidence,
        scores,
        description: DESCRIPTIONS[finalPhenotype].description,
        summary: DESCRIPTIONS[finalPhenotype].summary,
    };
}