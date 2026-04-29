import { differenceInDays, addDays } from "date-fns";

export type CycleInput = {
  id: string;
  startDate: Date | string;
  endDate: Date | string | null;
};

export type CycleStats = {
  totalCycles: number;
  averageLength: number | null;
  shortestLength: number | null;
  longestLength: number | null;
  variability: number | null;
  isIrregular: boolean;
  cycleLengths: number[];
};

/**
 * Compute basic stats from a list of cycles ordered most recent first.
 * Cycle length = days between consecutive period start dates.
 */
export function computeCycleStats(cycles: CycleInput[]): CycleStats {
  // Sort oldest first for length computation
  const sorted = [...cycles].sort(
    (a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );

  const lengths: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const days = differenceInDays(
      new Date(sorted[i].startDate),
      new Date(sorted[i - 1].startDate),
    );
    if (days > 0 && days < 120) {
      // Exclude implausible gaps (data entry errors)
      lengths.push(days);
    }
  }

  if (lengths.length === 0) {
    return {
      totalCycles: cycles.length,
      averageLength: null,
      shortestLength: null,
      longestLength: null,
      variability: null,
      isIrregular: false,
      cycleLengths: [],
    };
  }

  const avg = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
  const shortest = Math.min(...lengths);
  const longest = Math.max(...lengths);
  const variability = longest - shortest;

  // PCOS clinical signal: variability > 7 days OR avg > 35 days = potentially irregular
  const isIrregular = variability > 7 || avg > 35 || avg < 21;

  return {
    totalCycles: cycles.length,
    averageLength: avg,
    shortestLength: shortest,
    longestLength: longest,
    variability,
    isIrregular,
    cycleLengths: lengths,
  };
}

/**
 * Predict the next period start date.
 * Uses average cycle length from history. Returns null if no data.
 */
export function predictNextPeriod(
  cycles: CycleInput[],
  averageLength: number | null,
): Date | null {
  if (cycles.length === 0 || !averageLength) return null;

  // Most recent cycle is the most recent start date
  const mostRecent = [...cycles].sort(
    (a, b) =>
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  )[0];

  return addDays(new Date(mostRecent.startDate), averageLength);
}

/**
 * Confidence band: returns the range of likely days based on variability.
 */
export function predictionRange(
  predicted: Date | null,
  variability: number | null,
): { earliest: Date; latest: Date } | null {
  if (!predicted) return null;
  const margin = variability ? Math.max(2, Math.ceil(variability / 2)) : 3;
  return {
    earliest: addDays(predicted, -margin),
    latest: addDays(predicted, margin),
  };
}