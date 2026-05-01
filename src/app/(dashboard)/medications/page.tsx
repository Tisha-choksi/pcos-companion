import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill, Plus } from "lucide-react";
import { AddMedicationSheet } from "./_components/AddMedicationSheet";
import { MedicationListItem } from "./_components/MedicationListItem";

export default async function MedicationsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const allMeds = await prisma.medication.findMany({
        where: { profileId: user.id },
        orderBy: [{ stoppedAt: "asc" }, { startedAt: "desc" }],
    });

    const active = allMeds.filter((m) => !m.stoppedAt);
    const stopped = allMeds.filter((m) => m.stoppedAt);

    return (
        <div className="mx-auto max-w-3xl px-6 py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Medications</h1>
                    <p className="text-muted-foreground mt-1">
                        Track what you&apos;re taking to spot how it affects your symptoms.
                    </p>
                </div>
                <AddMedicationSheet>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                    </Button>
                </AddMedicationSheet>
            </div>

            {allMeds.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="p-12 text-center">
                        <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                            <Pill className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <h3 className="font-medium mb-1">Nothing added yet</h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                            Track Metformin, inositol, supplements, birth control — anything you take.
                        </p>
                        <AddMedicationSheet>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add your first
                            </Button>
                        </AddMedicationSheet>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-8">
                    {active.length > 0 && (
                        <section>
                            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                                Currently taking ({active.length})
                            </h2>
                            <div className="space-y-2">
                                {active.map((med) => (
                                    <MedicationListItem key={med.id} medication={med} />
                                ))}
                            </div>
                        </section>
                    )}

                    {stopped.length > 0 && (
                        <section>
                            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                                Stopped ({stopped.length})
                            </h2>
                            <div className="space-y-2">
                                {stopped.map((med) => (
                                    <MedicationListItem key={med.id} medication={med} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}