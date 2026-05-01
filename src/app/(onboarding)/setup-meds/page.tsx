"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, X, Pill } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StepIndicator } from "../_components/StepIndicator";

const COMMON_MEDS = [
    { name: "Metformin", category: "INSULIN_SENSITIZER" },
    { name: "Inositol (Myo + D-Chiro)", category: "SUPPLEMENT" },
    { name: "Spironolactone", category: "ANDROGEN_BLOCKER" },
    { name: "Birth control pill", category: "HORMONAL" },
    { name: "Vitamin D", category: "SUPPLEMENT" },
    { name: "Omega-3", category: "SUPPLEMENT" },
    { name: "Berberine", category: "SUPPLEMENT" },
    { name: "NAC", category: "SUPPLEMENT" },
];

type SelectedMed = {
    name: string;
    category: string;
    startedAt: string;
    custom?: boolean;
};

export default function MedicationsPage() {
    const router = useRouter();
    const [selected, setSelected] = useState<SelectedMed[]>([]);
    const [customName, setCustomName] = useState("");
    const [loading, setLoading] = useState(false);

    function toggleCommon(med: { name: string; category: string }) {
        const exists = selected.find((s) => s.name === med.name);
        if (exists) {
            setSelected(selected.filter((s) => s.name !== med.name));
        } else {
            setSelected([
                ...selected,
                {
                    name: med.name,
                    category: med.category,
                    startedAt: new Date().toISOString().split("T")[0],
                },
            ]);
        }
    }

    function addCustom() {
        if (!customName.trim()) return;
        setSelected([
            ...selected,
            {
                name: customName.trim(),
                category: "OTHER",
                startedAt: new Date().toISOString().split("T")[0],
                custom: true,
            },
        ]);
        setCustomName("");
    }

    function removeMed(name: string) {
        setSelected(selected.filter((s) => s.name !== name));
    }

    function updateStartDate(name: string, date: string) {
        setSelected(
            selected.map((s) => (s.name === name ? { ...s, startedAt: date } : s)),
        );
    }

    async function handleSubmit() {
        setLoading(true);
        const res = await fetch("/api/onboarding/medications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ medications: selected }),
        });

        if (res.ok) {
            router.push("/dashboard");
            router.refresh();
        } else {
            setLoading(false);
        }
    }

    async function handleSkip() {
        setLoading(true);
        const res = await fetch("/api/onboarding/medications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ medications: [] }),
        });

        if (res.ok) {
            router.push("/dashboard");
            router.refresh();
        } else {
            setLoading(false);
        }
    }

    return (
        <div>
            <StepIndicator currentStep={3} totalSteps={4} />

            <div className="space-y-2 mb-8">
                <p className="text-sm text-primary font-medium">Medications</p>
                <h1 className="text-3xl font-semibold tracking-tight">
                    What are you taking?
                </h1>
                <p className="text-muted-foreground text-sm">
                    Pick anything you take regularly. Skip if none — you can add later.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-6">
                {COMMON_MEDS.map((med) => {
                    const isSelected = selected.find((s) => s.name === med.name);
                    return (
                        <button
                            key={med.name}
                            type="button"
                            onClick={() => toggleCommon(med)}
                            className={`text-left p-3 border rounded-lg transition ${isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/40"
                                }`}
                        >
                            <p className="font-medium text-sm">{med.name}</p>
                        </button>
                    );
                })}
            </div>

            <div className="flex gap-2 mb-6">
                <Input
                    placeholder="Add custom medication"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addCustom();
                        }
                    }}
                    disabled={loading}
                />
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addCustom}
                    disabled={loading || !customName.trim()}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            {selected.length > 0 && (
                <div className="space-y-2 mb-6">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                        When did you start?
                    </Label>
                    {selected.map((med) => (
                        <Card key={med.name}>
                            <CardContent className="p-3 flex items-center gap-3">
                                <Pill className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <p className="font-medium text-sm flex-1 min-w-0 truncate">
                                    {med.name}
                                </p>
                                <Input
                                    type="date"
                                    value={med.startedAt}
                                    onChange={(e) => updateStartDate(med.name, e.target.value)}
                                    className="w-36 text-xs"
                                    max={new Date().toISOString().split("T")[0]}
                                    disabled={loading}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => removeMed(med.name)}
                                    disabled={loading}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <div className="flex gap-2">
                <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleSkip}
                    disabled={loading}
                >
                    Skip
                </Button>
                <Button
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        `Finish${selected.length > 0 ? ` (${selected.length})` : ""}`
                    )}
                </Button>
            </div>
        </div>
    );
}