import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { WorkoutPlanClient } from "./_components/WorkoutPlanClient";

export default async function WorkoutPlanPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    return (
        <div className="mx-auto max-w-3xl px-6 py-12">
            <div className="mb-2">
                <Button asChild variant="ghost" size="sm" className="-ml-3">
                    <Link href="/workouts">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to workouts
                    </Link>
                </Button>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-semibold tracking-tight">Today&apos;s workout plan</h1>
                <p className="text-muted-foreground mt-1">
                    AI-suggested workouts based on your PCOS type, cycle phase, and energy.
                </p>
            </div>

            <WorkoutPlanClient />
        </div>
    );
}