import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, subDays, format, differenceInDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Calendar, Activity, UtensilsCrossed, Dumbbell, Pill } from "lucide-react";
import { computeCycleStats } from "@/lib/pcos/cycle-stats";
import { SYMPTOMS } from "@/lib/pcos/symptoms";

const PHENOTYPE_LABELS: Record<string, string> = {
  INSULIN_RESISTANT: "Insulin-resistant",
  INFLAMMATORY: "Inflammatory",
  ADRENAL: "Adrenal",
  LEAN: "Lean",
  UNKNOWN: "Mixed pattern",
};

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = startOfDay(new Date());
  const thirtyDaysAgo = subDays(today, 30);

  const [profile, cycles, recentSymptoms, activeMeds, recentMeals, recentWorkouts] =
    await Promise.all([
      prisma.profile.findUnique({ where: { id: user.id } }),
      prisma.cycle.findMany({
        where: { profileId: user.id },
        orderBy: { startDate: "desc" },
      }),
      prisma.symptomLog.findMany({
        where: { profileId: user.id, date: { gte: thirtyDaysAgo } },
        orderBy: { date: "desc" },
      }),
      prisma.medication.findMany({
        where: { profileId: user.id, stoppedAt: null },
      }),
      prisma.dietLog.findMany({
        where: { profileId: user.id, date: { gte: thirtyDaysAgo } },
        orderBy: { date: "desc" },
      }),
      prisma.workoutLog.findMany({
        where: { profileId: user.id, date: { gte: thirtyDaysAgo } },
        orderBy: { date: "desc" },
      }),
    ]);

  if (!profile?.onboardingComplete) redirect("/welcome");

  const stats = computeCycleStats(cycles);
  const firstName = profile.fullName?.split(" ")[0] || "User";

  // Symptom summary
  const symptomCounts: Record<string, number> = {};
  recentSymptoms.forEach((log) => {
    const sx = (log.symptoms as Record<string, number>) || {};
    Object.entries(sx).forEach(([key, severity]) => {
      if (severity > 0) symptomCounts[key] = (symptomCounts[key] || 0) + 1;
    });
  });
  const topSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, days]) => {
      const meta = SYMPTOMS.find((s) => s.key === key);
      return { label: meta?.label || key, emoji: meta?.emoji || "📊", days };
    });

  const totalWorkoutMin = recentWorkouts.reduce((s, w) => s + w.durationMin, 0);
  const strengthCount = recentWorkouts.filter((w) => w.workoutType === "STRENGTH").length;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <Button asChild variant="ghost" size="sm" className="-ml-3">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to dashboard
          </Link>
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <FileText className="h-4 w-4 mr-2" />
          Print / PDF
        </Button>
      </div>

      <div className="text-center mb-10">
        <Badge variant="outline" className="mb-4">Monthly summary</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">
          {firstName}&apos;s Health Report
        </h1>
        <p className="text-muted-foreground mt-2">
          {format(thirtyDaysAgo, "MMM d")} – {format(today, "MMM d, yyyy")}
        </p>
      </div>

      <div className="space-y-4">
        {/* Profile summary */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-primary mb-3">
              <Calendar className="h-5 w-5" />
              <h2 className="font-semibold">Profile</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Age</p>
                <p className="font-medium">
                  {profile.dateOfBirth
                    ? Math.floor(differenceInDays(new Date(), profile.dateOfBirth) / 365)
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">PCOS type</p>
                <p className="font-medium">{profile.phenotype ? PHENOTYPE_LABELS[profile.phenotype] : "Not classified"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Diagnosis</p>
                <p className="font-medium capitalize">{profile.diagnosisStatus?.toLowerCase().replace("_", " ") || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Cycles tracked</p>
                <p className="font-medium">{stats.totalCycles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cycle summary */}
        {cycles.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-primary mb-3">
                <Calendar className="h-5 w-5" />
                <h2 className="font-semibold">Cycle summary</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Avg length</p>
                  <p className="font-medium">{stats.averageLength ? `${stats.averageLength}d` : "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Variability</p>
                  <p className="font-medium">{stats.variability ? `±${stats.variability}d` : "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Shortest</p>
                  <p className="font-medium">{stats.shortestLength ? `${stats.shortestLength}d` : "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Longest</p>
                  <p className="font-medium">{stats.longestLength ? `${stats.longestLength}d` : "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Symptom summary */}
        {topSymptoms.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-primary mb-3">
                <Activity className="h-5 w-5" />
                <h2 className="font-semibold">Top symptoms (30 days)</h2>
              </div>
              <div className="space-y-2">
                {topSymptoms.map((s) => (
                  <div key={s.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span>{s.emoji}</span>
                      <span>{s.label}</span>
                    </div>
                    <span className="text-muted-foreground">{s.days} days</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity summary */}
        <div className="grid md:grid-cols-2 gap-4">
          {recentMeals.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-primary mb-3">
                  <UtensilsCrossed className="h-5 w-5" />
                  <h2 className="font-semibold">Diet (30 days)</h2>
                </div>
                <p className="text-sm font-medium">{recentMeals.length} meals logged</p>
                <p className="text-xs text-muted-foreground">
                  {recentMeals.filter((m) => m.giCategory === "LOW").length} low-GI,{" "}
                  {recentMeals.filter((m) => m.giCategory === "HIGH").length} high-GI
                </p>
              </CardContent>
            </Card>
          )}

          {recentWorkouts.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-primary mb-3">
                  <Dumbbell className="h-5 w-5" />
                  <h2 className="font-semibold">Workouts (30 days)</h2>
                </div>
                <p className="text-sm font-medium">{recentWorkouts.length} sessions</p>
                <p className="text-xs text-muted-foreground">
                  {totalWorkoutMin} total minutes · {strengthCount} strength sessions
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Medications */}
        {activeMeds.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-primary mb-3">
                <Pill className="h-5 w-5" />
                <h2 className="font-semibold">Active medications</h2>
              </div>
              <div className="space-y-2 text-sm">
                {activeMeds.map((m) => (
                  <div key={m.id} className="flex justify-between">
                    <span className="font-medium">{m.name}</span>
                    <span className="text-muted-foreground">
                      {m.dosage}{m.dosage && m.frequency ? " · " : ""}{m.frequency}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {recentSymptoms.length === 0 && recentMeals.length === 0 && recentWorkouts.length === 0 && (
          <Card className="border-dashed bg-accent/30">
            <CardContent className="p-12 text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">Start logging to generate reports</p>
              <p className="text-sm text-muted-foreground mt-1">
                Track symptoms, meals, and workouts consistently to get meaningful monthly summaries.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-10 leading-relaxed">
        This report is for personal reference. Share it with your healthcare provider
        as a supplementary summary — not a diagnostic tool.
      </p>
    </div>
  );
}
