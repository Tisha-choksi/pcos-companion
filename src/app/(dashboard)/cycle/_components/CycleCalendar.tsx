"use client";

import { useState } from "react";
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    isSameMonth,
    isSameDay,
    isWithinInterval,
    addMonths,
    subMonths,
    isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Cycle = {
    id: string;
    startDate: Date | string;
    endDate: Date | string | null;
};

type CycleCalendarProps = {
    cycles: Cycle[];
    predictedDate: Date | null;
    predictionRange: { earliest: Date; latest: Date } | null;
};

export function CycleCalendar({
    cycles,
    predictedDate,
    predictionRange,
}: CycleCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    // Build a fast lookup: which days are inside any period?
    function getDayState(day: Date) {
        // Period day?
        for (const cycle of cycles) {
            const start = new Date(cycle.startDate);
            const end = cycle.endDate ? new Date(cycle.endDate) : start;
            if (isWithinInterval(day, { start, end })) {
                if (isSameDay(day, start)) return "period-start";
                if (isSameDay(day, end)) return "period-end";
                return "period";
            }
        }
        // Predicted period?
        if (predictedDate && isSameDay(day, predictedDate)) {
            return "predicted-exact";
        }
        if (
            predictionRange &&
            isWithinInterval(day, {
                start: predictionRange.earliest,
                end: predictionRange.latest,
            })
        ) {
            return "predicted-range";
        }
        return "normal";
    }

    return (
        <div className="border rounded-xl p-4 bg-card">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">
                    {format(currentMonth, "MMMM yyyy")}
                </h3>
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={() => setCurrentMonth(new Date())}
                    >
                        Today
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div
                        key={d}
                        className="text-xs font-medium text-muted-foreground text-center py-2"
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                    const state = getDayState(day);
                    const inMonth = isSameMonth(day, currentMonth);
                    const today = isToday(day);

                    return (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                "aspect-square flex items-center justify-center relative rounded-md text-sm transition",
                                !inMonth && "text-muted-foreground/40",
                                inMonth && state === "normal" && "hover:bg-accent",
                                state === "period" && "bg-rose-200 text-rose-900 font-medium",
                                state === "period-start" &&
                                "bg-rose-500 text-white font-semibold",
                                state === "period-end" &&
                                "bg-rose-300 text-rose-900 font-medium",
                                state === "predicted-exact" &&
                                "border-2 border-dashed border-primary text-primary font-semibold",
                                state === "predicted-range" &&
                                "bg-primary/10 text-primary border border-dashed border-primary/40",
                                today && "ring-2 ring-primary/40",
                            )}
                        >
                            {format(day, "d")}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-sm bg-rose-500" />
                    <span>Period start</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-sm bg-rose-200" />
                    <span>Period</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-sm border-2 border-dashed border-primary" />
                    <span>Predicted</span>
                </div>
            </div>
        </div>
    );
}