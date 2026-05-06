import { differenceInDays } from "date-fns";

export type CyclePhase = "menstrual" | "follicular" | "ovulatory" | "luteal" | "unknown";

/**
 * Determine the current cycle phase based on days since last period start.
 * Standard 28-day cycle assumptions:
 * - Menstrual: days 1-5
 * - Follicular: days 6-13
 * - Ovulatory: days 14-16
 * - Luteal: days 17-28+
 */
export function getCyclePhase(
    lastPeriodStart: Date | string | null | undefined,
    averageLength: number | null,
): CyclePhase {
    if (!lastPeriodStart) return "unknown";

    const cycleDay = differenceInDays(new Date(), new Date(lastPeriodStart)) + 1;
    const length = averageLength || 28;

    if (cycleDay >= 1 && cycleDay <= 5) return "menstrual";
    if (cycleDay <= Math.floor(length / 2) - 1) return "follicular";
    if (cycleDay <= Math.floor(length / 2) + 1) return "ovulatory";
    if (cycleDay <= length + 7) return "luteal";

    // Beyond expected cycle = late period, treat as luteal
    return "luteal";
}

export const PHASE_LABELS: Record<CyclePhase, string> = {
    menstrual: "Menstrual",
    follicular: "Follicular",
    ovulatory: "Ovulatory",
    luteal: "Luteal",
    unknown: "Unknown",
};

export const PHASE_DESCRIPTIONS: Record<CyclePhase, string> = {
    menstrual: "Your period. Energy may be lower — be gentle with yourself.",
    follicular: "Energy rising. Great time for new things and harder workouts.",
    ovulatory: "Peak energy. Body is at its strongest.",
    luteal: "Pre-period. Energy may dip, cravings may rise.",
    unknown: "Log a recent period to see your cycle phase.",
};