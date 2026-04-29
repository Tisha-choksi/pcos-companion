import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, TrendingUp, Sparkles } from "lucide-react";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const profile = await prisma.profile.findUnique({
        where: { id: user.id },
        include: {
            cycles: {
                orderBy: { startDate: "desc" },
                take: 1,
            },
        },
    });

    if (!profile?.onboardingComplete) redirect("/welcome");

    const lastCycle = profile.cycles[0];
    const daysSinceLastPeriod = lastCycle
        ? Math.floor(
            (Date.now() - new Date(lastCycle.startDate).getTime()) /
            (1000 * 60 * 60 * 24),
        )
        : null;

    const bmi =
        profile.heightCm && profile.weightKg
            ? (profile.weightKg / (profile.heightCm / 100) ** 2).toFixed(1)
            : null;

    const firstName = profile.fullName?.split(" ")[0] || "there";

    return (
        <div className="mx-auto max-w-6xl px-6 py-12">
            <div className="mb-10">
                <h1 className="text-4xl font-semibold tracking-tight">
                    Hi, {firstName}
                </h1>
                <p className="text-muted-foreground mt-2">
                    Here&apos;s where you are today.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                : "Log your first cycle to start"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                            <TrendingUp className="h-4 w-4" />
                            <span>BMI</span>
                        </div>
                        <p className="text-3xl font-semibold">{bmi || "—"}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                            {profile.heightCm}cm · {profile.weightKg}kg
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
                            Log a few cycles and we&apos;ll start finding patterns.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}