import { format, differenceInDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Sparkles } from "lucide-react";

type PredictionCardProps = {
    predictedDate: Date | null;
    range: { earliest: Date; latest: Date } | null;
    isIrregular: boolean;
};

export function PredictionCard({
    predictedDate,
    range,
    isIrregular,
}: PredictionCardProps) {
    if (!predictedDate || !range) {
        return (
            <Card className="border-dashed">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                        <Sparkles className="h-4 w-4" />
                        <span>Next period</span>
                    </div>
                    <p className="text-lg font-medium">Need more data</p>
                    <p className="text-xs text-muted-foreground mt-2">
                        Log a few cycles and we&apos;ll predict the next one.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const daysAway = differenceInDays(predictedDate, new Date());
    const isPast = daysAway < 0;

    let primary: string;
    if (isPast) {
        primary = `${Math.abs(daysAway)} days late`;
    } else if (daysAway === 0) {
        primary = "Today";
    } else if (daysAway === 1) {
        primary = "Tomorrow";
    } else {
        primary = `In ${daysAway} days`;
    }

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>Next period</span>
                </div>
                <p className="text-3xl font-semibold">{primary}</p>
                <p className="text-xs text-muted-foreground mt-2">
                    {format(predictedDate, "EEE, MMM d")} · likely {format(range.earliest, "MMM d")}–
                    {format(range.latest, "MMM d")}
                </p>
                {isIrregular && (
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-3">
                        Your cycles vary a lot, so this is an estimate.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}