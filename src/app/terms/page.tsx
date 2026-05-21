import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-8">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to home
          </Link>
        </Button>

        <h1 className="text-4xl font-semibold tracking-tight mb-8">Terms of Service</h1>

        <div className="prose prose-neutral prose-sm max-w-none text-muted-foreground space-y-6">
          <p>Last updated: May 2026</p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance</h2>
            <p>
              By using Lumen, you agree to these terms. If you do not agree, please do not use
              the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Not a medical device</h2>
            <p>
              Lumen is a wellness tracking and educational tool. It is not a substitute for
              professional medical advice, diagnosis, or treatment. Never disregard professional
              medical advice because of something you read or input into Lumen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Your responsibility</h2>
            <p>
              You are responsible for the accuracy of data you enter. You must be at least 18
              years old to use this service. You agree not to use Lumen for any unlawful purpose.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Account security</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials.
              Notify us immediately if you suspect unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Service availability</h2>
            <p>
              We strive to keep Lumen available and reliable, but we do not guarantee
              uninterrupted service. We may update, modify, or discontinue features with notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Limitation of liability</h2>
            <p>
              Lumen and its creators are not liable for any damages arising from your use of
              the service. The app is provided &quot;as is&quot; without warranties of any kind.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Changes</h2>
            <p>
              We may update these terms. Continued use after changes constitutes acceptance of
              the new terms. We will notify users of material changes via email or in-app notice.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
