"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Droplet, MoreVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

type Cycle = {
    id: string;
    startDate: Date;
    endDate: Date | null;
    flowIntensity: string | null;
    notes: string | null;
    lengthDays: number | null;
};

const flowLabels: Record<string, { label: string; color: string }> = {
    SPOTTING: { label: "Spotting", color: "bg-pink-100 text-pink-700" },
    LIGHT: { label: "Light", color: "bg-rose-100 text-rose-700" },
    MEDIUM: { label: "Medium", color: "bg-rose-200 text-rose-800" },
    HEAVY: { label: "Heavy", color: "bg-red-200 text-red-800" },
};

export function CycleListItem({ cycle }: { cycle: Cycle }) {
    const router = useRouter();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const start = new Date(cycle.startDate);
    const end = cycle.endDate ? new Date(cycle.endDate) : null;

    const periodLength = end
        ? Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
        : null;

    const flow = cycle.flowIntensity ? flowLabels[cycle.flowIntensity] : null;

    async function handleDelete() {
        setDeleting(true);
        const res = await fetch(`/api/cycles/${cycle.id}`, { method: "DELETE" });
        if (res.ok) {
            router.refresh();
        }
        setDeleting(false);
        setDeleteOpen(false);
    }

    return (
        <>
            <Card className="hover:border-primary/30 transition">
                <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                        <Droplet className="h-4 w-4 text-accent-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">
                                {start.toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </p>
                            {end && (
                                <span className="text-sm text-muted-foreground">
                                    → {end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                </span>
                            )}
                            {flow && (
                                <Badge variant="secondary" className="text-xs">
                                    {flow.label}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {periodLength && <span>{periodLength}-day period</span>}
                            {cycle.lengthDays && (
                                <>
                                    {periodLength && <span>·</span>}
                                    <span>{cycle.lengthDays}-day cycle</span>
                                </>
                            )}
                        </div>
                        {cycle.notes && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
                                {cycle.notes}
                            </p>
                        )}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => setDeleteOpen(true)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardContent>
            </Card>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete this cycle?</DialogTitle>
                        <DialogDescription>
                            This can&apos;t be undone. Your cycle history will be updated.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteOpen(false)}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}