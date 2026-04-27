import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Activity,
  Brain,
  HeartPulse,
  Microscope,
  TrendingUp,
  ArrowRight,
  Check,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Nav />
      <Hero />
      <Features />
      <HowItWorks />
      <FinalCTA />
      <Footer />
    </main>
  );
}

function Nav() {
  return (
    <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">Lumen</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition">Features</Link>
          <Link href="#how" className="hover:text-foreground transition">How it works</Link>
          <Link href="/risk-screener" className="hover:text-foreground transition">Risk check</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm hidden sm:block hover:text-foreground transition text-muted-foreground">
            Log in
          </Link>
          <Button asChild size="sm">
            <Link href="/register">Get started</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="max-w-3xl">
          <Badge variant="secondary" className="mb-6 gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Built for women with PCOS
          </Badge>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05]">
            Understand your body.
            <br />
            <span className="text-primary">Decode your PCOS.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Lumen is an intelligent PCOS health companion. Track cycles, log symptoms,
            and discover patterns your doctor would miss — powered by AI trained on
            real PCOS research.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="text-base h-12 px-6">
              <Link href="/register">
                Start free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base h-12 px-6">
              <Link href="/risk-screener">Take the PCOS risk check</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>Free forever</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>Your data is private</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>Backed by research</span>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute top-40 -left-24 h-72 w-72 rounded-full bg-accent/40 blur-3xl pointer-events-none" />
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: Activity,
      title: "Smart cycle tracking",
      description: "Predictions that adapt to your irregular cycles. No more 28-day assumptions.",
    },
    {
      icon: Brain,
      title: "Pattern intelligence",
      description: "Discover what triggers your symptoms. \"Your acne flares 3 days after high-carb meals.\"",
    },
    {
      icon: Microscope,
      title: "Lab report decoder",
      description: "Upload any PDF lab report. Track your hormones, insulin, and vitamin D over time.",
    },
    {
      icon: HeartPulse,
      title: "Phenotype-aware",
      description: "Lean PCOS, insulin-resistant, inflammatory — your plan adapts to your type.",
    },
    {
      icon: TrendingUp,
      title: "Doctor-shareable reports",
      description: "Generate a clean monthly summary to bring to your next gyno or endocrinologist visit.",
    },
    {
      icon: Sparkles,
      title: "AI companion",
      description: "Ask anything about PCOS. Get answers grounded in real medical research, not blog SEO.",
    },
  ];

  return (
    <section id="features" className="py-24 border-t border-border/40">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl mb-16">
          <Badge variant="outline" className="mb-4">Features</Badge>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Not just another tracker.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Most period apps are built for women without PCOS. Lumen is built for the 1 in 10 who actually need it.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <Card key={f.title} className="border-border/60 hover:border-primary/40 transition group">
              <CardContent className="p-6">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center mb-5 group-hover:bg-primary/10 transition">
                  <f.icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Tell us about you", desc: "Quick onboarding to identify your PCOS phenotype and current symptoms." },
    { n: "02", title: "Log what matters", desc: "Cycles, symptoms, meals, workouts. Takes 30 seconds a day." },
    { n: "03", title: "Discover patterns", desc: "Lumen analyzes your data nightly and surfaces insights you can act on." },
  ];

  return (
    <section id="how" className="py-24 bg-secondary/40 border-y border-border/40">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl mb-16">
          <Badge variant="outline" className="mb-4">How it works</Badge>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Three steps. Real insights.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.n}>
              <div className="text-sm font-mono text-primary mb-3">{s.n}</div>
              <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
          Stop guessing.
          <br />
          Start understanding.
        </h2>
        <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
          Join women taking control of their PCOS, one cycle at a time.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="text-base h-12 px-8">
            <Link href="/register">
              Get started free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base h-12 px-8">
            <Link href="/risk-screener">Take the risk check first</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/40 py-12">
      <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
            <Sparkles className="h-3 w-3 text-primary-foreground" />
          </div>
          <span className="text-sm text-muted-foreground">© 2026 Lumen. Built with care.</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground transition">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground transition">Terms</Link>
          <Link href="/about" className="hover:text-foreground transition">About</Link>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 mt-8">
        <p className="text-xs text-muted-foreground/70 text-center max-w-2xl mx-auto leading-relaxed">
          Lumen is a wellness tool, not a medical device. Information provided is for
          educational purposes only and is not a substitute for professional medical
          advice, diagnosis, or treatment. Always consult your healthcare provider.
        </p>
      </div>
    </footer>
  );
}