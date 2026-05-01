export type SymptomKey =
  | "acne"
  | "fatigue"
  | "mood_low"
  | "cravings"
  | "bloating"
  | "headache"
  | "cramps"
  | "hair_loss"
  | "anxiety"
  | "sleep_issues";

export type SymptomMeta = {
  key: SymptomKey;
  label: string;
  emoji: string;
  category: "physical" | "mental" | "pcos_specific";
  pcosRelevant: boolean;
};

export const SYMPTOMS: SymptomMeta[] = [
  { key: "acne", label: "Acne", emoji: "🔴", category: "pcos_specific", pcosRelevant: true },
  { key: "hair_loss", label: "Hair loss", emoji: "💇", category: "pcos_specific", pcosRelevant: true },
  { key: "fatigue", label: "Fatigue", emoji: "😴", category: "physical", pcosRelevant: true },
  { key: "bloating", label: "Bloating", emoji: "🫃", category: "physical", pcosRelevant: true },
  { key: "cravings", label: "Cravings", emoji: "🍫", category: "physical", pcosRelevant: true },
  { key: "cramps", label: "Cramps", emoji: "💢", category: "physical", pcosRelevant: false },
  { key: "headache", label: "Headache", emoji: "🤕", category: "physical", pcosRelevant: false },
  { key: "mood_low", label: "Low mood", emoji: "😔", category: "mental", pcosRelevant: true },
  { key: "anxiety", label: "Anxiety", emoji: "😰", category: "mental", pcosRelevant: true },
  { key: "sleep_issues", label: "Sleep issues", emoji: "🌙", category: "mental", pcosRelevant: true },
];

export type SymptomScores = Partial<Record<SymptomKey, number>>; // 0-5 severity

export const SEVERITY_LABELS = ["None", "Mild", "Moderate", "Strong", "Severe", "Extreme"];