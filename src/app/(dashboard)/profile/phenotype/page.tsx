import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, UtensilsCrossed, Dumbbell, Brain } from "lucide-react";

const PHENOTYPE_DETAILS = {
  INSULIN_RESISTANT: {
    label: "Insulin-resistant PCOS",
    emoji: "🩸",
    description:
      "Your body has a harder time managing blood sugar, which drives the hormonal symptoms. This is the most common type — about 70% of women with PCOS have this.",
    diet: "Low-glycemic, high-protein meals. Focus on fiber-rich vegetables, lean proteins, and healthy fats. Reduce refined carbs and sugars. Consider smaller, more frequent meals.",
    exercise:
      "Strength training and resistance work are especially effective. Combine with steady-state cardio. HIIT can help but don't overdo it — monitor cortisol response.",
    insights:
      "Track your sugar cravings, energy crashes, and weight patterns. Many women notice their symptoms improve significantly with consistent blood sugar management.",
  },
  INFLAMMATORY: {
    label: "Inflammatory PCOS",
    emoji: "🔥",
    description:
      "Chronic low-grade inflammation is the main driver of your symptoms. Often shows up as joint pain, skin issues, and fatigue.",
    diet: "Anti-inflammatory foods: leafy greens, berries, fatty fish, turmeric, ginger. Reduce dairy, gluten, and processed foods. Omega-3 supplements may help.",
    exercise:
      "Moderate, consistent movement. Yoga, pilates, swimming, and walking are excellent. Avoid excessive high-intensity training that can increase inflammation.",
    insights:
      "Pay attention to how different foods affect your skin, energy, and joint comfort. An elimination diet can help identify specific triggers.",
  },
  ADRENAL: {
    label: "Adrenal PCOS",
    emoji: "⚡",
    description:
      "Your adrenal glands are producing extra androgens, often linked to chronic stress. Around 10% of PCOS cases are this type.",
    diet: "Stable blood sugar meals with adequate protein at breakfast. Magnesium-rich foods (dark leafy greens, nuts, seeds). Limit caffeine, especially on an empty stomach.",
    exercise:
      "Gentle, restorative movement. Yoga, walking, tai chi. Avoid excessive cardio or HIIT which can elevate cortisol further. Prioritize rest and recovery.",
    insights:
      "Stress management is your most powerful tool. Track your sleep quality, morning energy, and stress levels. Adaptogenic herbs may support adrenal function.",
  },
  LEAN: {
    label: "Lean PCOS",
    emoji: "🌱",
    description:
      "You have PCOS without significant insulin resistance — symptoms appear despite a normal weight. Often involves subtle hormonal imbalances.",
    diet: "Balanced macronutrients with emphasis on whole foods. You may be more sensitive to inflammation. Avoid extreme restriction or over-exercising.",
    exercise:
      "Moderate intensity with variety. Strength training, pilates, yoga, and brisk walking. Don't overtrain — rest days are important for hormonal balance.",
    insights:
      "Your symptoms may fluctuate more with stress and sleep than with diet alone. Focus on circadian rhythm alignment and sleep quality.",
  },
  UNKNOWN: {
    label: "Mixed Pattern",
    emoji: "🌀",
    description:
      "Your answers don't strongly match a single type, which is common — many women have features of multiple types.",
    diet: "Start with general PCOS-friendly nutrition: whole foods, balanced meals, adequate protein, and fiber. Track how different foods affect you personally.",
    exercise:
      "Mix of strength training, cardio, and restorative movement. Listen to your body and adjust based on how you feel.",
    insights:
      "Log consistently — the more data you track, the clearer your personal patterns will become. We'll refine your type as you log more.",
  },
} as const;

export default async function PhenotypeDetailPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!profile?.onboardingComplete) redirect("/welcome");

  const info = profile.phenotype
    ? PHENOTYPE_DETAILS[profile.phenotype]
    : PHENOTYPE_DETAILS.UNKNOWN;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-8">
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to dashboard
        </Link>
      </Button>

      <div className="space-y-2 mb-10">
        <Badge variant="outline">PCOS Type</Badge>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{info.emoji}</span>
          <h1 className="text-3xl font-semibold tracking-tight">{info.label}</h1>
        </div>
        <p className="text-muted-foreground">{info.description}</p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-primary mb-3">
              <UtensilsCrossed className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Nutrition guidance</h2>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">{info.diet}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-primary mb-3">
              <Dumbbell className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Exercise recommendations</h2>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">{info.exercise}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-primary mb-3">
              <Brain className="h-5 w-5" />
              <h2 className="text-lg font-semibold">What to track</h2>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">{info.insights}</p>
          </CardContent>
        </Card>
      </div>

      {!profile.phenotype && (
        <Card className="mt-6 border-dashed bg-accent/30">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Take the phenotype quiz</p>
                <p className="text-sm text-muted-foreground">
                  Find out your PCOS type for personalized insights.
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/phenotype">Take quiz</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
