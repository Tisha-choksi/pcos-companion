import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, subDays, format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Plus } from "lucide-react";
import { AddWorkoutSheet } from "./_components/AddWorkoutSheet";
import { DeleteWorkoutButton } from "./_components/DeleteWorkoutButton";

const WORKOUT_LABELS: Record<string, string> = {
    STRENGTH: "💪 Strength",
    WALK: "🚶 Walk",
    YOGA: "🧘 Yoga",
    CARDIO: "🏃 Cardio",
    HIIT: "🔥 HIIT",
    PILATES: "🤸 Pilates",
    OTHER: "🏋️ Other",
};

export default async function WorkoutsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const sevenDaysAgo = subDays(startOfDay(new Date()), 6);

    const workouts = await prisma.workoutLog.findMany({
        where: {
            profileId: user.id,
            date: { gte: sevenDaysAgo },
        },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });

    const totalMin = workouts.reduce((sum, w) => sum + w.durationMin, 0);
    const strengthCount = workouts.filter((w) => w.workoutType === "STRENGTH").length;

    return (
        <div className="mx-auto max-w-3xl px-6 py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Workouts</h1>
                    <p className="text-muted-foreground mt-1">
                        Strength training and walking are PCOS gold — track them here.
                    </p>
                </div>
                <AddWorkoutSheet>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Log workout
                    </Button>
                </AddWorkoutSheet>
            </div>

            {workouts.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-8">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Past 7 days</p>
                            <p className="text-2xl font-semibold mt-1">{workouts.length}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Total time</p>
                            <p className="text-2xl font-semibold mt-1">{totalMin}m</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Strength</p>
                            <p className="text-2xl font-semibold mt-1">{strengthCount}</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {workouts.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="p-12 text-center">
                        <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                            <Dumbbell className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <h3 className="font-medium mb-1">Nothing logged yet</h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                            Even a 20-minute walk counts. Consistency over intensity for PCOS.
                        </p>
                        <AddWorkoutSheet>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Log your first
                            </Button>
                        </AddWorkoutSheet>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {workouts.map((workout) => (
                        <Card key={workout.id}>
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <p className="font-medium">{WORKOUT_LABELS[workout.workoutType]}</p>
                                        <Badge variant="secondary" className="text-xs">
                                            {workout.durationMin} min
                                        </Badge>
                                        {workout.intensity && (
                                            <Badge variant="outline" className="text-xs">
                                                {workout.intensity.toLowerCase()}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(workout.date), "EEEE, MMM d")}
                                    </p>
                                    {workout.notes && (
                                        <p className="text-xs text-muted-foreground mt-1">{workout.notes}</p>
                                    )}
                                </div>
                                <DeleteWorkoutButton id={workout.id} />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}