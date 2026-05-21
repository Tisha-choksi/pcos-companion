"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const QUESTIONS = [
  {
    question: "Are your menstrual cycles irregular?",
    help: "Cycles shorter than 21 days, longer than 35 days, or you often skip months.",
    options: [
      { value: "yes", label: "Yes, frequently", score: 2 },
      { value: "sometimes", label: "Sometimes", score: 1 },
      { value: "no", label: "No, they're regular", score: 0 },
    ],
  },
  {
    question: "Do you struggle with unwanted hair growth?",
    help: "On your face, chin, chest, or other areas where men typically grow hair.",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "mild", label: "A little", score: 1 },
      { value: "no", label: "No", score: 0 },
    ],
  },
  {
    question: "Do you have persistent acne?",
    help: "Especially along your jawline, chin, or upper back.",
    options: [
      { value: "yes", label: "Yes, regularly", score: 2 },
      { value: "occasional", label: "Occasional breakouts", score: 1 },
      { value: "no", label: "Rarely or never", score: 0 },
    ],
  },
  {
    question: "Have you been struggling with hair thinning or hair loss on your scalp?",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "slight", label: "Slightly", score: 1 },
      { value: "no", label: "No", score: 0 },
    ],
  },
  {
    question: "Do you experience weight gain or difficulty losing weight?",
    help: "Especially around your belly area.",
    options: [
      { value: "yes", label: "Yes, hard to lose weight", score: 2 },
      { value: "moderate", label: "Some difficulty", score: 1 },
      { value: "no", label: "No issues", score: 0 },
    ],
  },
  {
    question: "Do you have skin darkening or skin tags?",
    help: "Dark, velvety patches on your neck, underarms, or inner thighs (acanthosis nigricans).",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "unsure", label: "Not sure", score: 1 },
      { value: "no", label: "No", score: 0 },
    ],
  },
];

type ResultTier = {
  label: string;
  message: string;
  action: string;
  color: string;
};

function getResult(score: number): ResultTier {
  if (score >= 8) {
    return {
      label: "Likely PCOS",
      message:
        "Your responses align with common signs of PCOS. We strongly recommend consulting a gynecologist or endocrinologist for proper evaluation — especially if you haven't already.",
      action: "Track your symptoms with Lumen and share the data with your doctor.",
      color: "from-red-100 to-rose-100",
    };
  }
  if (score >= 4) {
    return {
      label: "Possible risk",
      message:
        "You have some signs that could be related to PCOS. It's worth monitoring your symptoms and speaking with a healthcare provider if you're concerned.",
      action: "Start tracking your cycles and symptoms with Lumen to spot patterns.",
      color: "from-amber-100 to-orange-100",
    };
  }
  return {
    label: "Low likelihood",
    message:
      "Based on your responses, you show few signs commonly associated with PCOS. Remember that PCOS can still present differently for everyone.",
    action: "Use Lumen to stay informed and track any changes in your health.",
    color: "from-green-100 to-emerald-100",
  };
}

export default function RiskScreenerPage() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);

  const answered = answers[current] !== undefined;
  const isLast = current === QUESTIONS.length - 1;

  function select(value: number) {
    setAnswers({ ...answers, [current]: value });
  }

  function handleNext() {
    if (isLast) {
      setShowResult(true);
    } else {
      setCurrent(current + 1);
    }
  }

  function handleBack() {
    if (current > 0) setCurrent(current - 1);
  }

  function restart() {
    setAnswers({});
    setCurrent(0);
    setShowResult(false);
  }

  if (showResult) {
    const total = Object.values(answers).reduce((a, b) => a + b, 0);
    const result = getResult(total);

    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-6 py-24">
          <div className="text-center space-y-2 mb-10">
            <Badge variant="secondary" className="mb-4">Your results</Badge>
            <h1 className="text-4xl font-semibold tracking-tight">PCOS Risk Check</h1>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-20 dark:opacity-10",
                  result.color,
                )}
              />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-semibold">{result.label}</h2>
                </div>
                <p className="text-muted-foreground mb-4">{result.message}</p>
                <div className="bg-accent/50 rounded-lg p-4 mb-6">
                  <p className="text-sm font-medium">Recommended next step:</p>
                  <p className="text-sm text-muted-foreground mt-1">{result.action}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild className="flex-1">
                    <Link href="/register">
                      Start tracking with Lumen
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={restart}>
                    Retake screener
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground text-center mt-8 leading-relaxed max-w-lg mx-auto">
            This screening is for educational purposes only and is not a diagnostic tool.
            Only a healthcare professional can diagnose PCOS.
          </p>
        </div>
      </main>
    );
  }

  const q = QUESTIONS[current];
  const progress = ((current + 1) / QUESTIONS.length) * 100;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-24">
        <div className="flex items-center justify-between mb-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">Lumen</span>
          </Link>
          <span className="text-sm text-muted-foreground">
            {current + 1} of {QUESTIONS.length}
          </span>
        </div>

        <div className="h-1.5 bg-muted rounded-full mb-12">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-2 mb-8">
          <Badge variant="outline">PCOS Risk Check</Badge>
          <h1 className="text-2xl font-semibold tracking-tight">{q.question}</h1>
          {q.help && <p className="text-muted-foreground text-sm">{q.help}</p>}
        </div>

        <div className="space-y-2 mb-8">
          {q.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => select(opt.score)}
              className={cn(
                "w-full text-left p-4 border rounded-lg transition flex items-center gap-3",
                answers[current] === opt.score
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40",
              )}
            >
              <div
                className={cn(
                  "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0",
                  answers[current] === opt.score
                    ? "border-primary bg-primary"
                    : "border-muted-foreground",
                )}
              >
                {answers[current] === opt.score && (
                  <Check className="h-3 w-3 text-primary-foreground" />
                )}
              </div>
              <p className="font-medium">{opt.label}</p>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleBack} disabled={current === 0}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Button onClick={handleNext} disabled={!answered}>
            {isLast ? "See results" : "Next"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-12 leading-relaxed max-w-lg mx-auto">
          This screening is for educational purposes only. Only a healthcare professional can diagnose PCOS.
        </p>
      </div>
    </main>
  );
}
