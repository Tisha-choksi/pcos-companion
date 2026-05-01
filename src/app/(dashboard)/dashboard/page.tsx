import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Sparkles, ArrowRight, Plus, Activity } from "lucide-react";
import {
    computeCycleStats,
    predictNextPeriod,
    predictionRange,
} from "@/lib/pcos/cycle-stats";
import { SYMPTOMS } from "@/lib/pcos/symptoms";
import { LogCycleSheet } from "../cycle/_components/LogCycleSheet";
import { PredictionCard } from "../cycle/_components/PredictionCard";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const today = startOfDay(new Date());

    const [profile, todayLog] = await Promise.all([
        prisma.profile.findUnique({
            where: { id: user.id },
            include: {
                cycles: { orderBy: { startDate: "desc" } },
            },
        }),
        prisma.symptomLog.findUnique({
            where: {
                profileId_date: { profileId: user.id, date: today },
            },
        }),
    ]);

    if (!profile?.onboardingComplete) redirect("/welcome");

    const stats = computeCycleStats(profile.cycles);
    const predicted = predictNextPeriod(profile.cycles, stats.averageLength);
    const range = predictionRange(predicted, stats.variability);

    const lastCycle = profile.cycles[0];
    const daysSinceLastPeriod = lastCycle
        ? Math.floor(
            (Date.now() - new Date(lastCycle.startDate).getTime()) /
            (1000 * 60 * 60 * 24),
        )
        : null;

    const firstName = profile.fullName?.split(" ")[0] || "there";

    // Build today's symptom summary
    const todaySymptoms = (todayLog?.symptoms as Record<string, number>) || {};
    const activeSymptoms = Object.entries(todaySymptoms)
        .filter(([_, v]) => v > 0)
        .sort((a, b) => b[1] - a[1]);

    return (
        <div className="mx-auto max-w-6xl px-6 py-12">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-4xl font-semibold tracking-tight">
                        Hi, {firstName}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Here&apos;s where you are today.
                    </p>
                </div>
                <LogCycleSheet>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Log period
                    </Button>
                </LogCycleSheet>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                            <Calendar className="h-4 w-4" />
                            <span>Cycle day</span>
                        </div>
                        <p className="text-3xl font-semibold">
                            {daysSinceLastPeriod !== null ? `Day ${daysSinceLastPeriod + 1}` : "—"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            {lastCycle
                                ? `Last period: ${new Date(lastCycle.startDate).toLocaleDateString()}`
                                : "Log your first cycle"}
                        </p>
                    </CardContent>
                </Card>

                <PredictionCard
                    predictedDate={predicted}
                    range={range}
                    isIrregular={stats.isIrregular}
                />

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                            <TrendingUp className="h-4 w-4" />
                            <span>Mood today</span>
                        </div>
                        <p className="text-3xl font-semibold">
                            {todayLog?.mood ? `${todayLog.mood}/5` : "—"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            {todayLog?.energy ? `Energy ${todayLog.energy}/5` : "Not logged yet"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-dashed bg-accent/30">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                            <Sparkles className="h-4 w-4" />
                            <span>Insights</span>
                        </div>
                        <p className="text-lg font-medium">Coming soon</p>
                        <p className="text-xs text-muted-foreground mt-2">
                            AI-powered patterns from your data.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Today's symptoms section */}
            <Card className="mb-8">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <h2 className="font-semibold">Today&apos;s log</h2>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/log">
                                {todayLog ? "Edit" : "Log now"}
                                <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                        </Button>
                    </div>

                    {!todayLog ? (
                        <p className="text-sm text-muted-foreground py-4">
                            You haven&apos;t logged anything today yet.
                        </p>
                    ) : activeSymptoms.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4">
                            No symptoms logged today. Feeling good!
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {activeSymptoms.map(([key, severity]) => {
                                const meta = SYMPTOMS.find((s) => s.key === key);
                                if (!meta) return null;
                                return (
                                    <div
                                        key={key}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full text-xs"
                                    >
                                        <span>{meta.emoji}</span>
                                        <span className="font-medium">{meta.label}</span>
                                        <span className="text-muted-foreground">{severity}/5</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {profile.cycles.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold tracking-tight">Recent cycles</h2>
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/cycle">
                                View all
                                <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {profile.cycles.slice(0, 3).map((cycle) => (
                            <Card key={cycle.id} className="hover:border-primary/30 transition">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">
                                            {new Date(cycle.startDate).toLocaleDateString(undefined, {
                                                month: "long",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </p>
                                        {cycle.endDate && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Ended{" "}
                                                {new Date(cycle.endDate).toLocaleDateString(undefined, {
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        )}
                                    </div>
                                    {cycle.flowIntensity && (
                                        <span className="text-xs text-muted-foreground capitalize">
                                            {cycle.flowIntensity.toLowerCase()}
                                        </span>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}