"use client";

import { useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export function LogCycleSheet({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        flowIntensity: "",
        notes: "",
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const res = await fetch("/api/cycles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        if (!res.ok) {
            const data = await res.json();
            setError(data.error || "Failed to save.");
            setLoading(false);
            return;
        }

        setOpen(false);
        setLoading(false);
        setForm({
            startDate: new Date().toISOString().split("T")[0],
            endDate: "",
            flowIntensity: "",
            notes: "",
        });
        router.refresh();
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Log a period</SheetTitle>
                    <SheetDescription>
                        Record when your period started. You can add more details now or later.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-5 px-4 mt-6">
                    <div className="space-y-2">
                        <Label htmlFor="startDate">Start date *</Label>
                        <Input
                            id="startDate"
                            type="date"
                            value={form.startDate}
                            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                            required
                            disabled={loading}
                            max={new Date().toISOString().split("T")[0]}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="endDate">End date</Label>
                        <Input
                            id="endDate"
                            type="date"
                            value={form.endDate}
                            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                            disabled={loading}
                            max={new Date().toISOString().split("T")[0]}
                            min={form.startDate}
                        />
                        <p className="text-xs text-muted-foreground">
                            Optional. Add it once your period ends.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="flowIntensity">Flow intensity</Label>
                        <Select
                            value={form.flowIntensity}
                            onValueChange={(v) => setForm({ ...form, flowIntensity: v })}
                            disabled={loading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="How heavy was it?" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SPOTTING">Spotting</SelectItem>
                                <SelectItem value="LIGHT">Light</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="HEAVY">Heavy</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Cramps, mood, anything worth remembering..."
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            disabled={loading}
                            rows={3}
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <SheetFooter className="px-0">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Save period"
                            )}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}