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

export function AddMealSheet({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    mealType: "BREAKFAST",
    description: "",
    giCategory: "",
    notes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/diet", {
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
      mealType: "BREAKFAST",
      description: "",
      giCategory: "",
      notes: "",
    });
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Log a meal</SheetTitle>
          <SheetDescription>
            Quick description is enough — no need to weigh anything.
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
              <Label htmlFor="mealType">Meal *</Label>
              <Select
                value={form.mealType}
                onValueChange={(v) => setForm({ ...form, mealType: v })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BREAKFAST">🌅 Breakfast</SelectItem>
                  <SelectItem value="LUNCH">☀️ Lunch</SelectItem>
                  <SelectItem value="DINNER">🌙 Dinner</SelectItem>
                  <SelectItem value="SNACK">🥨 Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">What did you eat? *</Label>
            <Textarea
              id="description"
              placeholder="Oatmeal with berries and almonds"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="giCategory">Glycemic load</Label>
            <Select
              value={form.giCategory}
              onValueChange={(v) => setForm({ ...form, giCategory: v })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Optional — how carby was it?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">🟢 Low (veggies, protein, healthy fats)</SelectItem>
                <SelectItem value="MEDIUM">🟡 Medium (mixed carbs, fruits)</SelectItem>
                <SelectItem value="HIGH">🔴 High (white bread, sweets, soda)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Optional. Tracking helps spot how carbs affect your symptoms.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="How you felt after, cravings, etc."
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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save meal"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}