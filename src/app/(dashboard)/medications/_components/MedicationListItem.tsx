"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pill, MoreVertical, Trash2, Square } from "lucide-react";
import { differenceInDays, format } from "date-fns";

type Medication = {
    id: string;
    name: string;
    category: string;
    dosage: string | null;
    frequency: string | null;
    startedAt: Date | string;
    stoppedAt: Date | string | null;
    notes: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
    INSULIN_SENSITIZER: "Insulin sensitizer",
    ANDROGEN_BLOCKER: "Androgen blocker",
    HORMONAL: "Hormonal",
    SUPPLEMENT: "Supplement",
    OTHER: "Other",
};

export function MedicationListItem({ medication }: { medication: Medication }) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);

    const isActive = !medication.stoppedAt;
    const start = new Date(medication.startedAt);
    const end = medication.stoppedAt ? new Date(medication.stoppedAt) : new Date();
    const days = differenceInDays(end, start);

    async function handleStop() {
        setBusy(true);
        await fetch(`/api/medications/${medication.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stoppedAt: new Date().toISOString() }),
        });
        setBusy(false);
        router.refresh();
    }

    async function handleDelete() {
        setBusy(true);
        await fetch(`/api/medications/${medication.id}`, { method: "DELETE" });
        setBusy(false);
        router.refresh();
    }

    return (
        <Card className={isActive ? "" : "opacity-60"}>
            <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                    <Pill className="h-4 w-4 text-accent-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{medication.name}</p>
                        <Badge variant="secondary" className="text-xs">
                            {CATEGORY_LABELS[medication.category]}
                        </Badge>
                        {!isActive && (
                            <Badge variant="outline" className="text-xs">
                                Stopped
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {medication.dosage && <span>{medication.dosage}</span>}
                        {medication.frequency && (
                            <>
                                {medication.dosage && <span>·</span>}
                                <span>{medication.frequency}</span>
                            </>
                        )}
                        <span>·</span>
                        <span>
                            {isActive
                                ? `${days} days`
                                : `${format(start, "MMM d")} – ${format(new Date(medication.stoppedAt!), "MMM d, yyyy")}`}
                        </span>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={busy}>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {isActive && (
                            <DropdownMenuItem onClick={handleStop}>
                                <Square className="h-4 w-4 mr-2" />
                                Mark as stopped
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                            onClick={handleDelete}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardContent>
        </Card>
    );
}