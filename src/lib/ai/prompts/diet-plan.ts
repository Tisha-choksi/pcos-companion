import type { Phenotype } from "@prisma/client";

const PHENOTYPE_GUIDANCE: Record<Phenotype, string> = {
    INSULIN_RESISTANT:
        "Focus on LOW glycemic index foods. Prioritize protein, healthy fats, and fiber. Avoid refined carbs, sugar, and white flour. Pair carbs with protein/fat to slow glucose response.",
    INFLAMMATORY:
        "Focus on anti-inflammatory foods. Include omega-3 rich foods (fatty fish, flaxseed, walnuts), turmeric, ginger, leafy greens, berries. Avoid processed foods, trans fats, and excessive sugar.",
    ADRENAL:
        "Focus on stable blood sugar throughout the day. Include adequate protein at every meal, healthy fats, complex carbs. Avoid caffeine excess. Magnesium-rich foods help (leafy greens, nuts, dark chocolate).",
    LEAN:
        "Focus on nutrient-dense whole foods. Adequate protein and healthy fats. Don't restrict calories — focus on quality. Include cycle-supporting foods (seeds, leafy greens, healthy fats).",
    UNKNOWN:
        "Focus on balanced PCOS-friendly principles: low-to-medium glycemic load, adequate protein, anti-inflammatory ingredients, plenty of vegetables.",
};

const CYCLE_PHASE_GUIDANCE: Record<string, string> = {
    menstrual: "Focus on iron-rich foods (lentils, leafy greens, red meat if eaten). Warming foods. Easy-to-digest meals.",
    follicular: "Energy is higher — light, fresh foods work well. Sprouts, fermented foods, leaner proteins.",
    ovulatory: "Anti-inflammatory focus, antioxidant-rich foods. Cruciferous vegetables for hormone balance.",
    luteal: "Magnesium and B-vitamin rich foods help with PMS. Complex carbs, sweet potatoes, dark chocolate. Manage cravings with protein.",
};

export type DietPlanInput = {
    phenotype: Phenotype | null;
    cyclePhase: "menstrual" | "follicular" | "ovulatory" | "luteal" | "unknown";
    cuisine: string; // user-selected
    recentMeals: string[]; // last 3 days, to avoid repeats
    todayMealsAlready: string[]; // already-logged meals today
    activeMedications: string[];
    topSymptoms: string[]; // current symptoms
    language: "english" | "hindi-mixed";
};

export type DietPlanOutput = {
    plan: {
        breakfast: MealSuggestion;
        lunch: MealSuggestion;
        dinner: MealSuggestion;
        snack: MealSuggestion;
    };
    daily_tip: string;
};

export type MealSuggestion = {
    name: string;
    description: string;
    gi_category: "LOW" | "MEDIUM" | "HIGH";
    why_this: string; // 1-sentence reason for this user
    estimated_prep_min: number;
};

export const DIET_PLAN_SYSTEM = `You are a knowledgeable PCOS nutrition assistant. You generate practical, realistic meal suggestions based on the user's PCOS phenotype, cycle phase, and recent diet.

Your suggestions are:
- Practical and easy to prepare at home
- Specific (real meals, not categories like "a balanced breakfast")
- Backed by PCOS nutrition science
- Considerate of the user's recent meals (avoid suggesting the same thing twice in a few days)
- Honest about glycemic index — be accurate

Respond ONLY in valid JSON matching the requested format. No preamble, no markdown.`;

export function buildDietPlanPrompt(input: DietPlanInput): string {
    const phenotypeText = input.phenotype
        ? PHENOTYPE_GUIDANCE[input.phenotype]
        : PHENOTYPE_GUIDANCE.UNKNOWN;

    const phaseText = CYCLE_PHASE_GUIDANCE[input.cyclePhase] || "";

    const recentMealsText =
        input.recentMeals.length > 0
            ? `Avoid repeating these recent meals: ${input.recentMeals.join("; ")}`
            : "No recent meal history available.";

    const todayText =
        input.todayMealsAlready.length > 0
            ? `User has already logged today: ${input.todayMealsAlready.join("; ")}. Suggest meals for the remaining slots only, but include all four slots in the response (mark already-logged ones).`
            : "User has not logged any meals today yet.";

    const medsText =
        input.activeMedications.length > 0
            ? `User is taking: ${input.activeMedications.join(", ")}.`
            : "No active medications.";

    const symptomsText =
        input.topSymptoms.length > 0
            ? `Current symptoms to consider: ${input.topSymptoms.join(", ")}.`
            : "";

    return `Generate a PCOS-friendly daily meal plan for this user.

USER PROFILE:
- PCOS type: ${input.phenotype || "Unknown"}
- Cycle phase: ${input.cyclePhase}
- Cuisine preference: ${input.cuisine}
- Language: ${input.language}

GUIDANCE:
- Phenotype focus: ${phenotypeText}
- Cycle phase tips: ${phaseText}
- ${medsText}
- ${symptomsText}

CONTEXT:
- ${recentMealsText}
- ${todayText}

Generate 4 meal suggestions (breakfast, lunch, dinner, snack) in the user's preferred cuisine.

Respond in this exact JSON format:
{
  "plan": {
    "breakfast": {
      "name": "string (short, the meal name)",
      "description": "string (1-2 sentences describing what's in it)",
      "gi_category": "LOW" | "MEDIUM" | "HIGH",
      "why_this": "string (1 sentence explaining why this fits the user)",
      "estimated_prep_min": number
    },
    "lunch": { ... same structure },
    "dinner": { ... same structure },
    "snack": { ... same structure }
  },
  "daily_tip": "string (one practical tip for today, 1-2 sentences)"
}`;
}