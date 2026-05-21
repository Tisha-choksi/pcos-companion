import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-8">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to home
          </Link>
        </Button>

        <h1 className="text-4xl font-semibold tracking-tight mb-8">Privacy Policy</h1>

        <div className="prose prose-neutral prose-sm max-w-none text-muted-foreground space-y-6">
          <p>Last updated: May 2026</p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. What we collect</h2>
            <p>
              We collect information you provide when creating an account (name, email) and
              health data you choose to log (cycle dates, symptoms, meals, workouts, and
              medications). We also collect basic usage data to improve the app.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. How we use your data</h2>
            <p>
              Your health data is used exclusively to power the app features: cycle predictions,
              pattern analysis, AI chat context, and personalized recommendations. We do not
              sell or share your personal data with third parties for advertising.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. AI processing</h2>
            <p>
              When you chat with the AI companion, your conversation history and relevant health
              context (cycle phase, phenotype, recent symptoms) are sent to Groq (our AI provider)
              to generate responses. This data is processed transiently and not used to train models.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Data storage</h2>
            <p>
              Your data is stored securely on Supabase (PostgreSQL) with encryption at rest.
              Authentication is managed by Supabase Auth using industry-standard practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Your rights</h2>
            <p>
              You can request export or deletion of your data at any time by contacting us.
              You can also delete your account and associated data directly through the app.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Medical disclaimer</h2>
            <p>
              Lumen is a wellness tool, not a medical device. Health data you enter is for
              personal tracking purposes. Always consult a healthcare provider for medical advice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Contact</h2>
            <p>
              For privacy questions, reach out at privacy@lumenhealth.app.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
