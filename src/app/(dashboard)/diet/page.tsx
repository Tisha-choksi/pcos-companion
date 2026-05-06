import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, subDays, format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddMealSheet } from "./_components/AddMealSheet";
import { DeleteMealButton } from "./_components/DeleteMealButton";
import { UtensilsCrossed, Plus, Sparkles } from "lucide-react";

const MEAL_LABELS: Record<string, string> = {
    BREAKFAST: "🌅 Breakfast",
    LUNCH: "☀️ Lunch",
    DINNER: "🌙 Dinner",
    SNACK: "🥨 Snack",
};

const GI_COLORS: Record<string, string> = {
    LOW: "bg-green-100 text-green-800",
    MEDIUM: "bg-amber-100 text-amber-800",
    HIGH: "bg-red-100 text-red-800",
};

export default async function DietPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const sevenDaysAgo = subDays(startOfDay(new Date()), 6);

    const meals = await prisma.dietLog.findMany({
        where: {
            profileId: user.id,
            date: { gte: sevenDaysAgo },
        },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });

    // Group by date
    const byDate = new Map<string, typeof meals>();
    meals.forEach((m) => {
        const key = format(new Date(m.date), "yyyy-MM-dd");
        if (!byDate.has(key)) byDate.set(key, []);
        byDate.get(key)!.push(m);
    });

    // Stats
    const totalMeals = meals.length;
    const lowGiCount = meals.filter((m) => m.giCategory === "LOW").length;
    const highGiCount = meals.filter((m) => m.giCategory === "HIGH").length;

    return (
        <div className="mx-auto max-w-3xl px-6 py-12">
            <div className="flex items-center justify-between mb-8 gap-3">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Diet</h1>
                    <p className="text-muted-foreground mt-1">
                        Track meals to spot how food affects your symptoms.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline">
                        <Link href="/diet/plan">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Get plan
                        </Link>
                    </Button>
                    <AddMealSheet>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Log meal
                        </Button>
                    </AddMealSheet>
                </div>
            </div>

            {meals.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-8">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Past 7 days</p>
                            <p className="text-2xl font-semibold mt-1">{totalMeals} meals</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Low GI</p>
                            <p className="text-2xl font-semibold mt-1 text-green-700">{lowGiCount}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">High GI</p>
                            <p className="text-2xl font-semibold mt-1 text-red-700">{highGiCount}</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {meals.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="p-12 text-center">
                        <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                            <UtensilsCrossed className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <h3 className="font-medium mb-1">Nothing logged yet</h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                            Even a few meals a week reveals patterns over time.
                        </p>
                        <AddMealSheet>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Log your first meal
                            </Button>
                        </AddMealSheet>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {Array.from(byDate.entries()).map(([dateStr, dayMeals]) => (
                        <section key={dateStr}>
                            <h2 className="text-sm font-medium text-muted-foreground mb-2">
                                {format(new Date(dateStr), "EEEE, MMMM d")}
                            </h2>
                            <div className="space-y-2">
                                {dayMeals.map((meal) => (
                                    <Card key={meal.id}>
                                        <CardContent className="p-4 flex items-start gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-medium">
                                                        {MEAL_LABELS[meal.mealType]}
                                                    </span>
                                                    {meal.giCategory && (
                                                        <Badge className={`text-xs ${GI_COLORS[meal.giCategory]}`}>
                                                            {meal.giCategory} GI
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm">{meal.description}</p>
                                                {meal.notes && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {meal.notes}
                                                    </p>
                                                )}
                                            </div>
                                            <DeleteMealButton id={meal.id} />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}