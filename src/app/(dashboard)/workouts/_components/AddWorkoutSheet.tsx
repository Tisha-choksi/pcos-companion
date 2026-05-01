"use client";

import { ReactNode, useState } from "react";
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

export function AddWorkoutSheet({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    workoutType: "WALK",
    durationMin: "30",
    intensity: "",
    notes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/workouts", {
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
      date: new Date().toISOString().split("T")[0],
      workoutType: "WALK",
      durationMin: "30",
      intensity: "",
      notes: "",
    });
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Log a workout</SheetTitle>
          <SheetDescription>
            Strength training and walking help PCOS the most.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 px-4 mt-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                max={new Date().toISOString().split("T")[0]}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="durationMin">Duration (min) *</Label>
              <Input
                id="durationMin"
                type="number"
                min="1"
                max="600"
                value={form.durationMin}
                onChange={(e) => setForm({ ...form, durationMin: e.target.value })}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workoutType">Type *</Label>
            <Select
              value={form.workoutType}
              onValueChange={(v) => setForm({ ...form, workoutType: v })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STRENGTH">💪 Strength training</SelectItem>
                <SelectItem value="WALK">🚶 Walk</SelectItem>
                <SelectItem value="YOGA">🧘 Yoga</SelectItem>
                <SelectItem value="PILATES">🤸 Pilates</SelectItem>
                <SelectItem value="CARDIO">🏃 Cardio</SelectItem>
                <SelectItem value="HIIT">🔥 HIIT</SelectItem>
                <SelectItem value="OTHER">🏋️ Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="intensity">Intensity</Label>
            <Select
              value={form.intensity}
              onValueChange={(v) => setForm({ ...form, intensity: v })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="How did it feel?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LIGHT">Light — could chat easily</SelectItem>
                <SelectItem value="MODERATE">Moderate — slightly winded</SelectItem>
                <SelectItem value="INTENSE">Intense — couldn&apos;t talk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="How you felt, what you did..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <SheetFooter className="px-0">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save workout"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}