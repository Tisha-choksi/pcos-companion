import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DietPlanClient } from "./_components/DietPlanClient";

export default async function DietPlanPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    return (
        <div className="mx-auto max-w-3xl px-6 py-12">
            <div className="mb-2">
                <Button asChild variant="ghost" size="sm" className="-ml-3">
                    <Link href="/diet">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to diet
                    </Link>
                </Button>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-semibold tracking-tight">Today&apos;s meal plan</h1>
                <p className="text-muted-foreground mt-1">
                    AI-generated suggestions based on your PCOS type and cycle phase.
                </p>
            </div>

            <DietPlanClient />
        </div>
    );
}