"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Bell, Loader2 } from "lucide-react";

type Reminder = {
    id: string;
    title: string;
    description: string;
    date: string;
    type: "period" | "medication" | "general";
};

const TYPE_LABELS: Record<string, string> = {
    period: "Period",
    medication: "Medication",
    general: "General",
};

export default function RemindersPage() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        title: "",
        description: "",
        date: "",
        type: "general" as Reminder["type"],
    });

    useEffect(() => {
        const stored = localStorage.getItem("pcos-reminders");
        if (stored) {
            try {
                setReminders(JSON.parse(stored));
            } catch {
                // ignore
            }
        }
    }, []);

    function persist(data: Reminder[]) {
        setReminders(data);
        localStorage.setItem("pcos-reminders", JSON.stringify(data));
    }

    function addReminder() {
        if (!form.title || !form.date) return;
        const newReminder: Reminder = {
            id: crypto.randomUUID(),
            ...form,
        };
        persist([...reminders, newReminder]);
        setForm({ title: "", description: "", date: "", type: "general" });
        setShowForm(false);
    }

    function deleteReminder(id: string) {
        persist(reminders.filter((r) => r.id !== id));
    }

    const sorted = [...reminders].sort((a, b) => a.date.localeCompare(b.date));
    const today = new Date().toISOString().split("T")[0];
    const upcoming = sorted.filter((r) => r.date >= today);
    const past = sorted.filter((r) => r.date < today);

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Reminders</h1>
                    <p className="text-sm text-muted-foreground mt-1">Set reminders for periods, meds, and more.</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add reminder
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardContent className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Title *</Label>
                                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Take Metformin..." />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Date *</Label>
                                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Type</Label>
                            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Reminder["type"] })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="period">Period</SelectItem>
                                    <SelectItem value="medication">Medication</SelectItem>
                                    <SelectItem value="general">General</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Description</Label>
                            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional note..." rows={2} />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={addReminder} disabled={!form.title || !form.date}>Save</Button>
                            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {reminders.length === 0 && !showForm && (
                <Card className="border-dashed">
                    <CardContent className="p-12 text-center">
                        <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                            <Bell className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <h3 className="font-medium mb-1">No reminders</h3>
                        <p className="text-sm text-muted-foreground">Add reminders for upcoming periods, medications, or appointments.</p>
                    </CardContent>
                </Card>
            )}

            {upcoming.length > 0 && (
                <div>
                    <h2 className="font-semibold mb-3">Upcoming</h2>
                    <div className="space-y-2">
                        {upcoming.map((r) => (
                            <Card key={r.id}>
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{r.title}</p>
                                            <span className="text-xs bg-accent px-2 py-0.5 rounded-full">{TYPE_LABELS[r.type]}</span>
                                        </div>
                                        {r.description && <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>}
                                        <p className="text-xs text-primary mt-1">{new Date(r.date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteReminder(r.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {past.length > 0 && (
                <div>
                    <h2 className="font-semibold mb-3 text-muted-foreground">Past</h2>
                    <div className="space-y-2 opacity-60">
                        {past.map((r) => (
                            <Card key={r.id}>
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="flex-1">
                                        <p className="font-medium">{r.title}</p>
                                        {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
                                        <p className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString()}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteReminder(r.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
