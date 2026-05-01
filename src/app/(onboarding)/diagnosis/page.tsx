"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Stethoscope, Search, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { StepIndicator } from "../_components/StepIndicator";

const OPTIONS = [
    {
        value: "DIAGNOSED",
        label: "Yes, I've been diagnosed",
        description: "By a doctor, gynecologist, or endocrinologist",
        icon: Stethoscope,
    },
    {
        value: "SUSPECTED",
        label: "I suspect I have it",
        description: "Symptoms match but no formal diagnosis yet",
        icon: Search,
    },
    {
        value: "NOT_SURE",
        label: "I'm not sure",
        description: "I'm here to track and figure things out",
        icon: HelpCircle,
    },
];

export default function DiagnosisPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>("");
    const [diagnosedAt, setDiagnosedAt] = useState<string>("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!status) {
            setError("Please pick one option.");
            return;
        }
        setLoading(true);
        setError(null);

        const res = await fetch("/api/onboarding/diagnosis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                status,
                diagnosedAt: status === "DIAGNOSED" ? diagnosedAt : null,
            }),
        });

        if (!res.ok) {
            const data = await res.json();
            setError(data.error || "Something went wrong.");
            setLoading(false);
            return;
        }

        router.push("/phenotype");
        router.refresh();
    }

    return (
        <div>
            <StepIndicator currentStep={1} totalSteps={4} />

            <div className="space-y-2 mb-8">
                <p className="text-sm text-primary font-medium">Your PCOS</p>
                <h1 className="text-3xl font-semibold tracking-tight">
                    Have you been diagnosed?
                </h1>
                <p className="text-muted-foreground text-sm">
                    This helps us tailor what we show you. No judgment either way.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                {OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => setStatus(opt.value)}
                        className={cn(
                            "w-full text-left p-4 border rounded-lg transition flex items-start gap-3",
                            status === opt.value
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/40",
                        )}
                        disabled={loading}
                    >
                        <div
                            className={cn(
                                "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                                status === opt.value
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-accent text-accent-foreground",
                            )}
                        >
                            <opt.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium">{opt.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {opt.description}
                            </p>
                        </div>
                    </button>
                ))}

                {status === "DIAGNOSED" && (
                    <div className="space-y-2 pt-2">
                        <Label htmlFor="diagnosedAt">When were you diagnosed?</Label>
                        <Input
                            id="diagnosedAt"
                            type="date"
                            value={diagnosedAt}
                            onChange={(e) => setDiagnosedAt(e.target.value)}
                            max={new Date().toISOString().split("T")[0]}
                            disabled={loading}
                        />
                        <p className="text-xs text-muted-foreground">
                            Approximate is fine. Helps us track how long you&apos;ve been managing this.
                        </p>
                    </div>
                )}

                {error && (
                    <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                        {error}
                    </div>
                )}

                <Button type="submit" className="w-full" disabled={loading || !status}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
                </Button>
            </form>
        </div>
    );
}