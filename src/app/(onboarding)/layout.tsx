import { redirect } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const STEP_PATHS = ["/welcome", "/diagnosis", "/phenotype", "/setup-meds"];

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { onboardingComplete: true, onboardingStep: true },
  });

  if (profile?.onboardingComplete) redirect("/dashboard");

  // Get current path to check user is on the right step
  const headersList = await headers();
  const path = headersList.get("x-pathname") || "";
  const expectedPath = STEP_PATHS[profile?.onboardingStep ?? 0];

  // If user is trying to skip ahead, redirect them to current step
  // (skipping back is allowed — user might want to fix something)
  const currentStepIndex = STEP_PATHS.indexOf(expectedPath);
  const requestedStepIndex = STEP_PATHS.findIndex((p) => path.includes(p));

  if (requestedStepIndex > currentStepIndex && expectedPath) {
    redirect(expectedPath);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/40">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">Lumen</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}