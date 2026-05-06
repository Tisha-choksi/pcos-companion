import type { Phenotype } from "@prisma/client";

const PHENOTYPE_GUIDANCE: Record<Phenotype, string> = {
  INSULIN_RESISTANT:
    "Strength training is the #1 priority. It directly improves insulin sensitivity. Aim for 3-4 strength sessions per week. Walking after meals helps glucose. Avoid excessive cardio which can spike cortisol.",
  INFLAMMATORY:
    "Anti-inflammatory movement is best. Walking, swimming, yoga, gentle strength training. Avoid HIIT and intense cardio which increase inflammation. Cool-down and recovery matter as much as the workout.",
  ADRENAL:
    "Gentle, restorative movement. Yoga, walking, light strength training. AVOID HIIT, long runs, or intense cardio — these stress already-tired adrenals. Listen to your body.",
  LEAN:
    "Balanced approach: strength training 2-3x weekly, moderate cardio, yoga. Don't over-exercise — focus on quality over quantity. Energy expenditure is less of a focus than building muscle.",
  UNKNOWN:
    "Focus on PCOS-friendly fundamentals: strength training, walking after meals, yoga for stress, avoid excessive HIIT. Consistency over intensity.",
};

const CYCLE_PHASE_GUIDANCE: Record<string, string> = {
  menstrual:
    "Energy is lower. Prioritize gentle movement: walking, restorative yoga, light stretching. If energy permits, light strength training. Skip HIIT.",
  follicular:
    "Energy is rising. Best phase for harder workouts. Strength training, moderate HIIT (if phenotype allows), trying new things.",
  ovulatory:
    "Peak energy and strength. Best phase for heavy strength training and challenging workouts. Body is at its strongest.",
  luteal:
    "Energy may dip in second half. Strength training is still good. Moderate cardio. Reduce intensity if PMS is severe. Avoid pushing too hard.",
};

export type WorkoutPlanInput = {
  phenotype: Phenotype | null;
  cyclePhase: "menstrual" | "follicular" | "ovulatory" | "luteal" | "unknown";
  recentWorkouts: string[]; // last 7 days
  preferredDuration: number; // minutes user has available
  preferredType: string; // user picks from list
  fitnessLevel: "beginner" | "intermediate" | "advanced";
  topSymptoms: string[];
  language: "english" | "hindi-mixed";
};

export type WorkoutPlanOutput = {
  workouts: WorkoutSuggestion[];
  daily_tip: string;
};

export type WorkoutSuggestion = {
  name: string;
  workout_type:
    | "STRENGTH"
    | "WALK"
    | "YOGA"
    | "CARDIO"
    | "HIIT"
    | "PILATES"
    | "OTHER";
  duration_min: number;
  intensity: "LIGHT" | "MODERATE" | "INTENSE";
  description: string;
  why_this: string;
  exercises?: string[]; // optional list of specific exercises
};

export const WORKOUT_PLAN_SYSTEM = `You are a knowledgeable PCOS fitness assistant. You generate practical, realistic workout suggestions based on the user's PCOS phenotype, cycle phase, and recent activity.

Your suggestions are:
- PCOS-aware: strength training emphasized for insulin-resistant, gentle movement for adrenal/inflammatory
- Phase-aware: harder workouts in follicular/ovulatory, gentler in menstrual/luteal
- Realistic for the user's fitness level
- Specific (real workouts with exercise lists when applicable)
- Safe — never push intense workouts on adrenal phenotypes

Respond ONLY in valid JSON. No preamble, no markdown.`;

export function buildWorkoutPlanPrompt(input: WorkoutPlanInput): string {
  const phenotypeText = input.phenotype
    ? PHENOTYPE_GUIDANCE[input.phenotype]
    : PHENOTYPE_GUIDANCE.UNKNOWN;

  const phaseText = CYCLE_PHASE_GUIDANCE[input.cyclePhase] || "";

  const recentText =
    input.recentWorkouts.length > 0
      ? `Recent workouts (past 7 days): ${input.recentWorkouts.join("; ")}. Vary from these.`
      : "No recent workouts logged.";

  const symptomsText =
    input.topSymptoms.length > 0
      ? `Current symptoms: ${input.topSymptoms.join(", ")}. Adjust intensity accordingly.`
      : "";

  return `Generate 2-3 PCOS-friendly workout suggestions for the user today.

USER PROFILE:
- PCOS type: ${input.phenotype || "Unknown"}
- Cycle phase: ${input.cyclePhase}
- Fitness level: ${input.fitnessLevel}
- Time available today: ${input.preferredDuration} minutes
- Preferred workout type: ${input.preferredType}
- Language: ${input.language}

GUIDANCE:
- Phenotype focus: ${phenotypeText}
- Phase tips: ${phaseText}
- ${symptomsText}

CONTEXT:
- ${recentText}

Generate 2-3 workout options. The user picks which one to do. Total duration of EACH option should fit within their available time.

Respond in this exact JSON format:
{
  "workouts": [
    {
      "name": "string (short, descriptive)",
      "workout_type": "STRENGTH" | "WALK" | "YOGA" | "CARDIO" | "HIIT" | "PILATES" | "OTHER",
      "duration_min": number,
      "intensity": "LIGHT" | "MODERATE" | "INTENSE",
      "description": "string (1-2 sentences explaining what they'll do)",
      "why_this": "string (1 sentence explaining why this fits the user today)",
      "exercises": ["array of specific exercises if applicable, e.g. squats x 12, push-ups x 10"]
    }
  ],
  "daily_tip": "string (one tip for today, 1-2 sentences)"
}`;
}