import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Link2 } from "lucide-react";

type SymptomInfo = {
  key: string;
  label: string;
  emoji: string;
  days: number;
  avgSeverity: string;
  percentage: number;
};

type CorrelationInfo = {
  symptom: string;
  label: string;
  emoji: string;
  coSymptom: string;
  coLabel: string;
  coEmoji: string;
  count: number;
};

export function SymptomCorrelations({
  symptoms,
  correlations,
}: {
  symptoms: SymptomInfo[];
  correlations: CorrelationInfo[];
}) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
            <Activity className="h-4 w-4" />
            <span>Most frequent symptoms</span>
          </div>
          <div className="space-y-3">
            {symptoms.slice(0, 5).map((s) => (
              <div key={s.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{s.emoji}</span>
                  <span className="text-sm font-medium">{s.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {s.days}d · avg {s.avgSeverity}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {s.percentage}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {correlations.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
              <Link2 className="h-4 w-4" />
              <span>Common co-occurrences</span>
            </div>
            <div className="space-y-3">
              {correlations.map((c) => (
                <div key={c.symptom} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm">
                    <span>{c.emoji}</span>
                    <span className="font-medium">{c.label}</span>
                    <span className="text-muted-foreground">+</span>
                    <span>{c.coEmoji}</span>
                    <span className="font-medium">{c.coLabel}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {c.count}x together
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
