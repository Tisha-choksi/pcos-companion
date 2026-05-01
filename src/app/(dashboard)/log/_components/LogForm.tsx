"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SeverityScale } from "@/components/shared/SeverityScale";
import { SYMPTOMS, type SymptomScores } from "@/lib/pcos/symptoms";
import { Loader2, Check } from "lucide-react";

type LogFormProps = {
    date: string;
    existing: {
        symptoms: Record<string, number>;
        mood: number | null;
        energy: number | null;
        notes: string | null;
    } | null;
};

export function LogForm({ date, existing }: LogFormProps) {
    const router = useRouter();
    const [symptoms, setSymptoms] = useState<SymptomScores>(
        (existing?.symptoms as SymptomScores) || {},
    );
    const [mood, setMood] = useState<number>(existing?.mood ?? 3);
    const [energy, setEnergy] = useState<number>(existing?.energy ?? 3);
    const [notes, setNotes] = useState(existing?.notes || "");
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function setSymptom(key: string, value: number) {
        setSymptoms((prev) => {
            const next = { ...prev };
            if (value === 0) {
                delete next[key as keyof SymptomScores];
            } else {
                next[key as keyof SymptomScores] = value;
            }
            return next;
        });
        setSaved(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSaved(false);

        const res = await fetch("/api/symptoms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date, symptoms, mood, energy, notes }),
        });

        if (!res.ok) {
            const data = await res.json();
            setError(data.error || "Failed to save.");
            setLoading(false);
            return;
        }

        setSaved(true);
        setLoading(false);
        router.refresh();

        setTimeout(() => setSaved(false), 2500);
    }

    // Group symptoms by category
    const physical = SYMPTOMS.filter((s) => s.category === "physical");
    const pcosSpecific = SYMPTOMS.filter((s) => s.category === "pcos_specific");
    const mental = SYMPTOMS.filter((s) => s.category === "mental");

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Overall mood + energy */}
            <Card>
                <CardContent className="p-6 space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <Label className="text-base">Overall mood</Label>
                            <span className="text-xs text-muted-foreground">{mood}/5</span>
                        </div>
                        <SeverityScale value={mood} onChange={setMood} disabled={loading} />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <Label className="text-base">Energy level</Label>
                            <span className="text-xs text-muted-foreground">{energy}/5</span>
                        </div>
                        <SeverityScale value={energy} onChange={setEnergy} disabled={loading} />
                    </div>
                </CardContent>
            </Card>

            {/* PCOS-specific symptoms */}
            <SymptomGroup
                title="PCOS-related"
                items={pcosSpecific}
                symptoms={symptoms}
                onChange={setSymptom}
                disabled={loading}
            />

            {/* Physical symptoms */}
            <SymptomGroup
                title="Physical"
                items={physical}
                symptoms={symptoms}
                onChange={setSymptom}
                disabled={loading}
            />

            {/* Mental symptoms */}
            <SymptomGroup
                title="Mental & emotional"
                items={mental}
                symptoms={symptoms}
                onChange={setSymptom}
                disabled={loading}
            />

            {/* Notes */}
            <Card>
                <CardContent className="p-6">
                    <Label htmlFor="notes" className="text-base mb-3 block">
                        Anything else?
                    </Label>
                    <Textarea
                        id="notes"
                        placeholder="Stressful day, ate lots of sugar, slept badly..."
                        value={notes}
                        onChange={(e) => {
                            setNotes(e.target.value);
                            setSaved(false);
                        }}
                        disabled={loading}
                        rows={3}
                    />
                </CardContent>
            </Card>

            {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    {error}
                </div>
            )}

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : saved ? (
                        <>
                            <Check className="h-4 w-4 mr-2" />
                            Saved
                        </>
                    ) : existing ? (
                        "Update log"
                    ) : (
                        "Save log"
                    )}
                </Button>
            </div>
        </form>
    );
}

function SymptomGroup({
    title,
    items,
    symptoms,
    onChange,
    disabled,
}: {
    title: string;
    items: typeof SYMPTOMS;
    symptoms: SymptomScores;
    onChange: (key: string, value: number) => void;
    disabled: boolean;
}) {
    return (
        <Card>
            <CardContent className="p-6">
                <h3 className="font-medium text-sm text-muted-foreground mb-4 uppercase tracking-wide">
                    {title}
                </h3>
                <div className="space-y-4">
                    {items.map((s) => (
                        <div
                            key={s.key}
                            className="flex items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="text-xl">{s.emoji}</span>
                                <span className="text-sm font-medium truncate">{s.label}</span>
                            </div>
                            <SeverityScale
                                value={symptoms[s.key] || 0}
                                onChange={(v) => onChange(s.key, v)}
                                disabled={disabled}
                            />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}