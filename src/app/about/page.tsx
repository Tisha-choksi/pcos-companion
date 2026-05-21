import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Heart, Shield, Lightbulb } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-8">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to home
          </Link>
        </Button>

        <div className="space-y-2 mb-10">
          <Badge variant="outline">About Lumen</Badge>
          <h1 className="text-4xl font-semibold tracking-tight">Built for the 1 in 10</h1>
          <p className="text-muted-foreground text-lg">
            Lumen is an AI-powered health companion designed specifically for women with PCOS.
          </p>
        </div>

        <div className="grid gap-4 mb-10">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-primary mb-3">
                <Heart className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Why Lumen exists</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Most period tracking apps assume a perfect 28-day cycle.                 But PCOS doesn&apos;t work
                that way. Lumen was created to fill the gap — a tracker that understands irregular
                cycles, distinguishes between PCOS phenotypes, and provides guidance that actually
                applies to your specific type of PCOS.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-primary mb-3">
                <Lightbulb className="h-5 w-5" />
                <h2 className="text-lg font-semibold">What makes Lumen different</h2>
              </div>
              <ul className="text-muted-foreground text-sm leading-relaxed space-y-2">
                <li>
                  <strong>Phenotype-aware:</strong> Lumen classifies your PCOS type (insulin-resistant,
                  inflammatory, adrenal, or lean) and adapts recommendations accordingly.
                </li>
                <li>
                  <strong>Smart predictions:</strong> Cycle predictions that work with irregular
                  cycles, adjusting as you log more data.
                </li>
                <li>
                  <strong>AI companion:</strong> An AI powered by Groq (LLaMA 3.3 70B) that knows
                  your phenotype, cycle phase, symptoms, and medications.
                </li>
                <li>
                  <strong>Pattern discovery:</strong> Track symptoms, diet, workouts, and medications
                  to discover what affects your PCOS.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-primary mb-3">
                <Shield className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Our approach to privacy</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your health data is yours. We encrypt it at rest, never sell it to third parties,
                and only use it to power the features you use. AI conversations are processed
                transiently and not used for training. See our{" "}
                <Link href="/privacy" className="underline hover:text-foreground">
                  Privacy Policy
                </Link>{" "}
                for details.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button asChild>
            <Link href="/register">Get started free</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
