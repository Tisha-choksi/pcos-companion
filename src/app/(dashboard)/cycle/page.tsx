import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogCycleSheet } from "./_components/LogCycleSheet";
import { CycleListItem } from "./_components/CycleListItem";
import { Plus, Calendar as CalendarIcon } from "lucide-react";

export default async function CyclePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cycles = await prisma.cycle.findMany({
    where: { profileId: user.id },
    orderBy: { startDate: "desc" },
  });

  // Compute cycle lengths: difference between consecutive start dates
  const cyclesWithLength = cycles.map((cycle, i) => {
    const next = cycles[i + 1];
    const lengthDays = next
      ? Math.round(
          (new Date(cycle.startDate).getTime() -
            new Date(next.startDate).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : null;
    return { ...cycle, lengthDays };
  });

  // Average length (excludes the most recent which has no "next")
  const completedLengths = cyclesWithLength
    .map((c) => c.lengthDays)
    .filter((l): l is number => l !== null);
  const avgLength =
    completedLengths.length > 0
      ? Math.round(
          completedLengths.reduce((a, b) => a + b, 0) / completedLengths.length,
        )
      : null;

  // Variability = max - min (a simple PCOS-relevant metric)
  const variability =
    completedLengths.length >= 2
      ? Math.max(...completedLengths) - Math.min(...completedLengths)
      : null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Your cycles</h1>
          <p className="text-muted-foreground mt-1">
            Track every period to spot patterns over time.
          </p>
        </div>
        <LogCycleSheet>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Log period
          </Button>
        </LogCycleSheet>
      </div>

      {cycles.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total tracked</p>
              <p className="text-2xl font-semibold mt-1">{cycles.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Average length</p>
              <p className="text-2xl font-semibold mt-1">
                {avgLength ? `${avgLength}d` : "—"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Variability</p>
                {variability !== null && variability > 7 && (
                  <Badge variant="secondary" className="text-[10px]">
                    Irregular
                  </Badge>
                )}
              </div>
              <p className="text-2xl font-semibold mt-1">
                {variability !== null ? `±${variability}d` : "—"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {cycles.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          {cyclesWithLength.map((cycle) => (
            <CycleListItem key={cycle.id} cycle={cycle} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="p-12 text-center">
        <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
          <CalendarIcon className="h-6 w-6 text-accent-foreground" />
        </div>
        <h3 className="font-medium mb-1">No cycles yet</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
          Log your first period to start understanding your patterns.
        </p>
        <LogCycleSheet>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Log your first period
          </Button>
        </LogCycleSheet>
      </CardContent>
    </Card>
  );
}