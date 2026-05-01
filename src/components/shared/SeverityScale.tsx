"use client";

import { cn } from "@/lib/utils";

type SeverityScaleProps = {
    value: number;
    onChange: (value: number) => void;
    disabled?: boolean;
};

export function SeverityScale({
    value,
    onChange,
    disabled,
}: SeverityScaleProps) {
    return (
        <div className="flex gap-1">
            {[0, 1, 2, 3, 4, 5].map((n) => {
                const active = n <= value;
                const isZero = n === 0;
                return (
                    <button
                        key={n}
                        type="button"
                        onClick={() => onChange(n === value ? 0 : n)}
                        disabled={disabled}
                        className={cn(
                            "h-8 w-8 rounded-md text-xs font-medium transition border",
                            active && !isZero && "bg-primary text-primary-foreground border-primary",
                            active && isZero && "bg-muted text-muted-foreground border-border",
                            !active && "bg-background hover:bg-accent border-border text-muted-foreground",
                            disabled && "opacity-50 cursor-not-allowed",
                        )}
                        aria-label={`Severity ${n}`}
                    >
                        {n}
                    </button>
                );
            })}
        </div>
    );
}