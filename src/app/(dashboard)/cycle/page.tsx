import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import {
    computeCycleStats,
    predictNextPeriod,
    predictionRange,
} from "@/lib/pcos/cycle-stats";
import { LogCycleSheet } from "./_components/LogCycleSheet";
import { CycleListItem } from "./_components/CycleListItem";
import { CycleCalendar } from "./_components/CycleCalendar";
import { CycleTrendChart } from "./_components/CycleTrendChart";
import { PredictionCard } from "./_components/PredictionCard";

export default async function CyclePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const cycles = await prisma.cycle.findMany({
        where: { profileId: user.id },
        orderBy: { startDate: "desc" },
    });

    const stats = computeCycleStats(cycles);
    const predicted = predictNextPeriod(cycles, stats.averageLength);
    const range = predictionRange(predicted, stats.variability);

    // Add cycle length to each item (for the list)
    const sortedAsc = [...cycles].sort(
        (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );
    const lengthMap = new Map<string, number>();
    for (let i = 1; i < sortedAsc.length; i++) {
        const days = Math.round(
            (new Date(sortedAsc[i].startDate).getTime() -
                new Date(sortedAsc[i - 1].startDate).getTime()) /
            (1000 * 60 * 60 * 24),
        );
        lengthMap.set(sortedAsc[i].id, days);
    }
    const cyclesWithLength = cycles.map((c) => ({
        ...c,
        lengthDays: lengthMap.get(c.id) ?? null,
    }));

    return (
        <div className="mx-auto max-w-6xl px-6 py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Your cycles</h1>
                    <p className="text-muted-foreground mt-1">
                        Track every period to spot patterns over time.
                    </p>
                </div>
                <LogCycleSheet>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Log period
                    </Button>
                </LogCycleSheet>
            </div>

            {cycles.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="space-y-8">
                    {/* Top row: stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground">Tracked</p>
                                <p className="text-2xl font-semibold mt-1">{stats.totalCycles}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground">Average</p>
                                <p className="text-2xl font-semibold mt-1">
                                    {stats.averageLength ? `${stats.averageLength}d` : "—"}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground">Variability</p>
                                    {stats.isIrregular && (
                                        <Badge variant="secondary" className="text-[10px]">
                                            Irregular
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-2xl font-semibold mt-1">
                                    {stats.variability !== null ? `±${stats.variability}d` : "—"}
                                </p>
                            </CardContent>
                        </Card>
                        <PredictionCard
                            predictedDate={predicted}
                            range={range}
                            isIrregular={stats.isIrregular}
                        />
                    </div>

                    {/* Calendar + Trend chart */}
                    <div className="grid lg:grid-cols-2 gap-6">
                        <CycleCalendar
                            cycles={cycles}
                            predictedDate={predicted}
                            predictionRange={range}
                        />
                        <CycleTrendChart
                            cycleLengths={stats.cycleLengths}
                            averageLength={stats.averageLength}
                        />
                    </div>

                    {/* History list */}
                    <section>
                        <h2 className="font-semibold text-lg mb-3">History</h2>
                        <div className="space-y-2">
                            {cyclesWithLength.map((cycle) => (
                                <CycleListItem key={cycle.id} cycle={cycle} />
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

function EmptyState() {
    return (
        <Card className="border-dashed">
            <CardContent className="p-12 text-center">
                <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="font-medium mb-1">No cycles yet</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                    Log your first period to start understanding your patterns.
                </p>
                <LogCycleSheet>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Log your first period
                    </Button>
                </LogCycleSheet>
            </CardContent>
        </Card>
    );
}