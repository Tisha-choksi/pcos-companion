import { describe, it, expect } from "vitest";
import { classifyPhenotype } from "@/lib/pcos/phenotype";

describe("classifyPhenotype", () => {
  it("classifies insulin-resistant PCOS", () => {
    const result = classifyPhenotype({
      irregularCycles: true,
      weightGainAround: "belly",
      acneType: "jaw_chin",
      hairGrowth: "face_chest",
      energyLevels: "fluctuates",
      sugarCravings: "intense",
      stressResponse: "tired",
      cardiovascular: "neither",
    });
    expect(result.phenotype).toBe("INSULIN_RESISTANT");
    expect(result.confidence).toBe("high");
  });

  it("classifies adrenal PCOS", () => {
    const result = classifyPhenotype({
      irregularCycles: true,
      weightGainAround: "even",
      acneType: "forehead",
      hairGrowth: "thinning",
      energyLevels: "low_morning",
      sugarCravings: "rare",
      stressResponse: "anxious",
      cardiovascular: "high_resting_hr",
    });
    expect(result.phenotype).toBe("ADRENAL");
  });

  it("returns LEAN for lean-leaning answers", () => {
    const result = classifyPhenotype({
      irregularCycles: false,  // +1 LEAN
      weightGainAround: "hips", // +1 LEAN
      acneType: "none",
      hairGrowth: "neither",
      energyLevels: "stable",   // +1 LEAN
      sugarCravings: "rare",    // +1 LEAN
      stressResponse: "fine",
      cardiovascular: "neither",
    });
    expect(result.phenotype).toBe("LEAN");
  });

  it("returns UNKNOWN when multiple phenotypes score equally", () => {
    const result = classifyPhenotype({
      irregularCycles: true,
      weightGainAround: "belly",     // +3 IR
      acneType: "back_chest",        // +2 INFLAMMATORY
      hairGrowth: "face_chest",      // +2 IR
      energyLevels: "low_morning",   // +2 ADRENAL
      sugarCravings: "occasional",   // +1 INFLAMMATORY
      stressResponse: "anxious",     // +3 ADRENAL
      cardiovascular: "neither",
    });
    // IR = 5, ADRENAL = 5, INFLAMMATORY = 3 → tie → low confidence → UNKNOWN
    expect(result.phenotype).toBe("UNKNOWN");
    expect(result.confidence).toBe("low");
  });
});
