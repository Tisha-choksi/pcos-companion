"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sparkles,
    Loader2,
    Plus,
    Check,
    Clock,
    Lightbulb,
    Utensils,
} from "lucide-react";
import { cn } from "@/lib/utils";

const COMMON_CUISINES = [
    "Indian",
    "South Indian",
    "Gujarati",
    "Mediterranean",
    "Asian",
    "Continental",
    "Mixed / no preference",
];

type MealSuggestion = {
    name: string;
    description: string;
    gi_category: "LOW" | "MEDIUM" | "HIGH";
    why_this: string;
    estimated_prep_min: number;
};

type Plan = {
    breakfast: MealSuggestion;
    lunch: MealSuggestion;
    dinner: MealSuggestion;
    snack: MealSuggestion;
};

const MEAL_LABELS: Record<keyof Plan, string> = {
    breakfast: "🌅 Breakfast",
    lunch: "☀️ Lunch",
    dinner: "🌙 Dinner",
    snack: "🥨 Snack",
};

const MEAL_TYPE_VALUES: Record<keyof Plan, string> = {
    breakfast: "BREAKFAST",
    lunch: "LUNCH",
    dinner: "DINNER",
    snack: "SNACK",
};

const GI_COLORS: Record<string, string> = {
    LOW: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    MEDIUM: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    HIGH: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export function DietPlanClient() {
    const router = useRouter();
    const [cuisine, setCuisine] = useState("Indian");
    const [customCuisine, setCustomCuisine] = useState("");
    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState<Plan | null>(null);
    const [dailyTip, setDailyTip] = useState<string>("");
    const [phase, setPhase] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [addedMeals, setAddedMeals] = useState<Set<string>>(new Set());

    async function handleGenerate() {
        const cuisineToSend = cuisine === "custom" ? customCuisine : cuisine;
        if (!cuisineToSend.trim()) {
            setError("Pick a cuisine first.");
            return;
        }

        setLoading(true);
        setError(null);
        setPlan(null);
        setAddedMeals(new Set());

        try {
            const res = await fetch("/api/diet/plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cuisine: cuisineToSend, language: "english" }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to generate plan.");
                setLoading(false);
                return;
            }

            setPlan(data.plan);
            setDailyTip(data.dailyTip);
            setPhase(data.context.cyclePhase);
            setLoading(false);
        } catch (err) {
            setError("Something went wrong. Try again.");
            setLoading(false);
        }
    }

    async function handleAddToLog(mealKey: keyof Plan, meal: MealSuggestion) {
        const res = await fetch("/api/diet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                date: new Date().toISOString().split("T")[0],
                mealType: MEAL_TYPE_VALUES[mealKey],
                description: `${meal.name} — ${meal.description}`,
                giCategory: meal.gi_category,
            }),
        });

        if (res.ok) {
            setAddedMeals((prev) => new Set(prev).add(mealKey));
            router.refresh();
        }
    }

    return (
        <div className="space-y-6">
            {/* Cuisine selector + generate button */}
            <Card>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="cuisine">What kind of food do you want today?</Label>
                            <Select value={cuisine} onValueChange={setCuisine} disabled={loading}>
                                <SelectTrigger className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {COMMON_CUISINES.map((c) => (
                                        <SelectItem key={c} value={c}>
                                            {c}
                                        </SelectItem>
                                    ))}
                                    <SelectItem value="custom">Other (type it)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {cuisine === "custom" && (
                            <div>
                                <Input
                                    placeholder="e.g. Punjabi, Thai, Japanese..."
                                    value={customCuisine}
                                    onChange={(e) => setCustomCuisine(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        )}

                        <Button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full"
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Generating your plan...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    {plan ? "Regenerate plan" : "Generate today's plan"}
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-md">
                    {error}
                </div>
            )}

            {plan && (
                <>
                    {/* Daily tip */}
                    {dailyTip && (
                        <Card className="bg-accent/30 border-primary/20">
                            <CardContent className="p-4 flex gap-3">
                                <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-medium text-primary mb-1">
                                        Tip for today
                                        {phase && ` (${phase} phase)`}
                                    </p>
                                    <p className="text-sm">{dailyTip}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Meals */}
                    <div className="space-y-3">
                        {(Object.keys(plan) as Array<keyof Plan>).map((key) => {
                            const meal = plan[key];
                            const isAdded = addedMeals.has(key);
                            return (
                                <Card key={key}>
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                                    <span className="text-sm font-medium text-muted-foreground">
                                                        {MEAL_LABELS[key]}
                                                    </span>
                                                    <Badge className={cn("text-xs", GI_COLORS[meal.gi_category])}>
                                                        {meal.gi_category} GI
                                                    </Badge>
                                                    <span className="inline-flex items-center text-xs text-muted-foreground">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {meal.estimated_prep_min} min
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold text-lg mb-1">{meal.name}</h3>
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {meal.description}
                                                </p>
                                                <div className="flex gap-2 items-start">
                                                    <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                                                    <p className="text-xs text-muted-foreground italic">
                                                        {meal.why_this}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant={isAdded ? "outline" : "default"}
                                                onClick={() => handleAddToLog(key, meal)}
                                                disabled={isAdded}
                                                className="flex-shrink-0"
                                            >
                                                {isAdded ? (
                                                    <>
                                                        <Check className="h-4 w-4 mr-1" />
                                                        Added
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Add
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}

            {!plan && !loading && !error && (
                <Card className="border-dashed">
                    <CardContent className="p-12 text-center">
                        <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                            <Utensils className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <h3 className="font-medium mb-1">Get your personalized meal plan</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            Pick a cuisine and we&apos;ll suggest 4 PCOS-friendly meals tailored to your
                            type and cycle phase.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}