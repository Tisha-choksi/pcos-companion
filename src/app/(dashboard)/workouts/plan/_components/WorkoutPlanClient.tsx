"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    Dumbbell,
    Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Workout = {
    name: string;
    workout_type:
    | "STRENGTH"
    | "WALK"
    | "YOGA"
    | "CARDIO"
    | "HIIT"
    | "PILATES"
    | "OTHER";
    duration_min: number;
    intensity: "LIGHT" | "MODERATE" | "INTENSE";
    description: string;
    why_this: string;
    exercises?: string[];
};

const TYPE_EMOJI: Record<string, string> = {
    STRENGTH: "💪",
    WALK: "🚶",
    YOGA: "🧘",
    CARDIO: "🏃",
    HIIT: "🔥",
    PILATES: "🤸",
    OTHER: "🏋️",
};

const INTENSITY_COLORS: Record<string, string> = {
    LIGHT: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    MODERATE: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    INTENSE: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export function WorkoutPlanClient() {
    const router = useRouter();
    const [duration, setDuration] = useState("30");
    const [type, setType] = useState("anything");
    const [fitness, setFitness] = useState("intermediate");
    const [loading, setLoading] = useState(false);
    const [workouts, setWorkouts] = useState<Workout[] | null>(null);
    const [dailyTip, setDailyTip] = useState<string>("");
    const [phase, setPhase] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [addedIndices, setAddedIndices] = useState<Set<number>>(new Set());

    async function handleGenerate() {
        setLoading(true);
        setError(null);
        setWorkouts(null);
        setAddedIndices(new Set());

        try {
            const res = await fetch("/api/workouts/plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    preferredDuration: parseInt(duration),
                    preferredType: type,
                    fitnessLevel: fitness,
                    language: "english",
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Failed to generate.");
                setLoading(false);
                return;
            }

            setWorkouts(data.workouts);
            setDailyTip(data.dailyTip);
            setPhase(data.context.cyclePhase);
            setLoading(false);
        } catch (err) {
            setError("Something went wrong. Try again.");
            setLoading(false);
        }
    }

    async function handleAddToLog(index: number, workout: Workout) {
        const res = await fetch("/api/workouts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                date: new Date().toISOString().split("T")[0],
                workoutType: workout.workout_type,
                durationMin: workout.duration_min.toString(),
                intensity: workout.intensity,
                notes: `${workout.name}: ${workout.description}`,
            }),
        });

        if (res.ok) {
            setAddedIndices((prev) => new Set(prev).add(index));
            router.refresh();
        }
    }

    return (
        <div className="space-y-6">
            {/* Form */}
            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="duration">Time available (min)</Label>
                            <Select value={duration} onValueChange={setDuration} disabled={loading}>
                                <SelectTrigger className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="15">15 min</SelectItem>
                                    <SelectItem value="20">20 min</SelectItem>
                                    <SelectItem value="30">30 min</SelectItem>
                                    <SelectItem value="45">45 min</SelectItem>
                                    <SelectItem value="60">60 min</SelectItem>
                                    <SelectItem value="90">90 min</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="fitness">Fitness level</Label>
                            <Select value={fitness} onValueChange={setFitness} disabled={loading}>
                                <SelectTrigger className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="beginner">Beginner</SelectItem>
                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                    <SelectItem value="advanced">Advanced</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="type">What kind of workout?</Label>
                        <Select value={type} onValueChange={setType} disabled={loading}>
                            <SelectTrigger className="mt-2">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="anything">Anything — surprise me</SelectItem>
                                <SelectItem value="strength training">💪 Strength training</SelectItem>
                                <SelectItem value="walking">🚶 Walking</SelectItem>
                                <SelectItem value="yoga">🧘 Yoga</SelectItem>
                                <SelectItem value="pilates">🤸 Pilates</SelectItem>
                                <SelectItem value="cardio">🏃 Cardio</SelectItem>
                                <SelectItem value="HIIT">🔥 HIIT</SelectItem>
                                <SelectItem value="low impact">Low impact</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full"
                        size="lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating workout options...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                {workouts ? "Get new options" : "Get workout suggestions"}
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-md">
                    {error}
                </div>
            )}

            {workouts && (
                <>
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

                    <div className="space-y-3">
                        {workouts.map((workout, i) => {
                            const isAdded = addedIndices.has(i);
                            return (
                                <Card key={i}>
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                                    <span className="text-xl">{TYPE_EMOJI[workout.workout_type]}</span>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {workout.workout_type.toLowerCase()}
                                                    </Badge>
                                                    <Badge className={cn("text-xs", INTENSITY_COLORS[workout.intensity])}>
                                                        {workout.intensity.toLowerCase()}
                                                    </Badge>
                                                    <span className="inline-flex items-center text-xs text-muted-foreground">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {workout.duration_min} min
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold text-lg mb-1">{workout.name}</h3>
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {workout.description}
                                                </p>

                                                {workout.exercises && workout.exercises.length > 0 && (
                                                    <div className="mb-3 p-3 bg-muted/40 rounded-md">
                                                        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                                                            The plan
                                                        </p>
                                                        <ul className="space-y-1">
                                                            {workout.exercises.map((ex, idx) => (
                                                                <li key={idx} className="text-sm flex items-start gap-2">
                                                                    <Zap className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                                                                    <span>{ex}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                <div className="flex gap-2 items-start">
                                                    <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                                                    <p className="text-xs text-muted-foreground italic">
                                                        {workout.why_this}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant={isAdded ? "outline" : "default"}
                                                onClick={() => handleAddToLog(i, workout)}
                                                disabled={isAdded}
                                                className="flex-shrink-0"
                                            >
                                                {isAdded ? (
                                                    <>
                                                        <Check className="h-4 w-4 mr-1" />
                                                        Logged
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Done it
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

            {!workouts && !loading && !error && (
                <Card className="border-dashed">
                    <CardContent className="p-12 text-center">
                        <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                            <Dumbbell className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <h3 className="font-medium mb-1">Get personalized workouts</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            Pick your time and preference. We&apos;ll suggest workouts that match your
                            PCOS type and cycle phase.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}