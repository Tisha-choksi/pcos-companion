import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Microscope, Plus } from "lucide-react";
import { AddLabSheet } from "./_components/AddLabSheet";
import { LabsChart } from "./_components/LabsChart";
import { format } from "date-fns";

const TEST_CATEGORIES = [
  { label: "Hormones", tests: ["LH", "FSH", "Testosterone (total)", "Testosterone (free)", "DHEA-S", "SHBG", "Prolactin"] },
  { label: "Metabolic", tests: ["Fasting glucose", "HbA1c", "Fasting insulin", "HOMA-IR"] },
  { label: "Lipids", tests: ["Total cholesterol", "HDL", "LDL", "Triglycerides"] },
  { label: "Thyroid", tests: ["TSH", "T3 (free)", "T4 (free)"] },
  { label: "Vitamin & minerals", tests: ["Vitamin D", "Ferritin", "Iron", "Magnesium"] },
  { label: "Inflammation", tests: ["CRP (hs-CRP)", "ESR"] },
];

export default async function LabsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile?.onboardingComplete) redirect("/welcome");

  const labs = await prisma.labValue.findMany({
    where: { profileId: user.id },
    orderBy: [{ testName: "asc" }, { date: "desc" }],
  });

  const byTest = new Map<string, typeof labs>();
  labs.forEach((l) => {
    if (!byTest.has(l.testName)) byTest.set(l.testName, []);
    byTest.get(l.testName)!.push(l);
  });

  const grouped = Array.from(byTest.entries()).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between mb-8 gap-3">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-3 mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to dashboard
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
              <Microscope className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Lab reports</h1>
              <p className="text-muted-foreground mt-1">
                Track your blood work and lab values over time.
              </p>
            </div>
          </div>
        </div>
        <AddLabSheet testCategories={TEST_CATEGORIES}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add value
          </Button>
        </AddLabSheet>
      </div>

      {labs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
              <Microscope className="h-6 w-6 text-accent-foreground" />
            </div>
            <h3 className="font-medium mb-1">No lab values yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Upload or manually enter lab reports to track your hormones, metabolic markers,
              and more over time.
            </p>
            <AddLabSheet testCategories={TEST_CATEGORIES}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add your first value
              </Button>
            </AddLabSheet>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map(([testName, values]) => (
            <Card key={testName}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-lg">{testName}</h2>
                  <span className="text-xs text-muted-foreground">
                    {values.length} entry{values.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {values.length >= 2 && (
                  <div className="h-32 mb-4">
                    <LabsChart
                      data={values
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map((v) => ({
                          date: format(new Date(v.date), "MMM d"),
                          value: v.value,
                        }))}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  {values.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between py-2 border-b border-border/40 last:border-0"
                    >
                      <div>
                        <span className="text-sm font-medium">
                          {v.value} {v.unit || ""}
                        </span>
                        {v.range && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (range: {v.range})
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(v.date), "MMM d, yyyy")}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
