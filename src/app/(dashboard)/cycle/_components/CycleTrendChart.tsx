"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    CartesianGrid,
} from "recharts";

type CycleTrendChartProps = {
    cycleLengths: number[];
    averageLength: number | null;
};

export function CycleTrendChart({
    cycleLengths,
    averageLength,
}: CycleTrendChartProps) {
    if (cycleLengths.length < 2) {
        return (
            <div className="border border-dashed rounded-xl p-12 text-center bg-card">
                <p className="text-sm text-muted-foreground">
                    Log at least 3 cycles to see your trend.
                </p>
            </div>
        );
    }

    const data = cycleLengths.map((days, i) => ({
        cycle: `#${i + 1}`,
        days,
    }));

    // Y axis scale: pad above and below
    const minDays = Math.max(15, Math.min(...cycleLengths) - 3);
    const maxDays = Math.max(...cycleLengths) + 3;

    return (
        <div className="border rounded-xl p-4 bg-card">
            <div className="mb-4">
                <h3 className="font-semibold">Cycle length over time</h3>
                <p className="text-xs text-muted-foreground mt-1">
                    Each point is one cycle. The dashed line is your average.
                </p>
            </div>
            <div className="h-64 -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis
                            dataKey="cycle"
                            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            domain={[minDays, maxDays]}
                            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                            tickLine={false}
                            axisLine={false}
                            width={40}
                            label={{
                                value: "Days",
                                angle: -90,
                                position: "insideLeft",
                                style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
                            }}
                        />
                        <Tooltip
                            contentStyle={{
                                background: "hsl(var(--popover))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                                fontSize: "12px",
                            }}
                            formatter={(value) => [`${Number(value)} days`, "Length"]}
                        />
                        {averageLength && (
                            <ReferenceLine
                                y={averageLength}
                                stroke="hsl(var(--primary))"
                                strokeDasharray="4 4"
                                strokeOpacity={0.6}
                                label={{
                                    value: `Avg ${averageLength}d`,
                                    fill: "hsl(var(--primary))",
                                    fontSize: 11,
                                    position: "right",
                                }}
                            />
                        )}
                        <Line
                            type="monotone"
                            dataKey="days"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={{ fill: "hsl(var(--primary))", r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}