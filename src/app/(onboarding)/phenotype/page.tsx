"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { StepIndicator } from "../_components/StepIndicator";
import { PHENOTYPE_QUESTIONS } from "@/lib/pcos/phenotype-questions";

type Answers = Record<string, string | boolean>;

export default function PhenotypePage() {
    const router = useRouter();
    const [questionIndex, setQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Answers>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const q = PHENOTYPE_QUESTIONS[questionIndex];
    const isLast = questionIndex === PHENOTYPE_QUESTIONS.length - 1;
    const currentValue = answers[q.key];

    async function handleNext() {
        if (!isLast) {
            setQuestionIndex(questionIndex + 1);
            return;
        }

        // Submit
        setLoading(true);
        setError(null);

        const res = await fetch("/api/onboarding/phenotype", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answers }),
        });

        if (!res.ok) {
            const data = await res.json();
            setError(data.error || "Something went wrong.");
            setLoading(false);
            return;
        }

        router.push("/setup-meds");
        router.refresh();
    }

    function handleBack() {
        if (questionIndex > 0) {
            setQuestionIndex(questionIndex - 1);
        } else {
            router.push("/diagnosis");
        }
    }

    function selectAnswer(value: string | boolean) {
        setAnswers({ ...answers, [q.key]: value });
    }

    return (
        <div>
            <StepIndicator currentStep={2} totalSteps={4} />

            <div className="flex items-center justify-between mb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="-ml-3"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                </Button>
                <p className="text-xs text-muted-foreground">
                    {questionIndex + 1} of {PHENOTYPE_QUESTIONS.length}
                </p>
            </div>

            <div className="space-y-2 mb-8">
                <p className="text-sm text-primary font-medium">PCOS type</p>
                <h1 className="text-2xl font-semibold tracking-tight">{q.question}</h1>
                {q.helpText && (
                    <p className="text-muted-foreground text-sm">{q.helpText}</p>
                )}
            </div>

            <div className="space-y-2 mb-8">
                {q.type === "boolean" ? (
                    <>
                        <button
                            type="button"
                            onClick={() => selectAnswer(true)}
                            className={cn(
                                "w-full text-left p-4 border rounded-lg transition",
                                currentValue === true
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/40",
                            )}
                        >
                            <p className="font-medium">Yes</p>
                        </button>
                        <button
                            type="button"
                            onClick={() => selectAnswer(false)}
                            className={cn(
                                "w-full text-left p-4 border rounded-lg transition",
                                currentValue === false
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/40",
                            )}
                        >
                            <p className="font-medium">No</p>
                        </button>
                    </>
                ) : (
                    q.options?.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => selectAnswer(opt.value)}
                            className={cn(
                                "w-full text-left p-4 border rounded-lg transition flex items-center gap-3",
                                currentValue === opt.value
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/40",
                            )}
                        >
                            {opt.emoji && <span className="text-xl">{opt.emoji}</span>}
                            <p className="font-medium">{opt.label}</p>
                        </button>
                    ))
                )}
            </div>

            {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md mb-4">
                    {error}
                </div>
            )}

            <Button
                className="w-full"
                onClick={handleNext}
                disabled={loading || currentValue === undefined}
            >
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : isLast ? (
                    "See my type"
                ) : (
                    "Next"
                )}
            </Button>
        </div>
    );
}