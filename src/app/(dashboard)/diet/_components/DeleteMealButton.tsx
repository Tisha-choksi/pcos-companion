"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteMealButton({ id }: { id: string }) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);

    async function handleDelete() {
        if (!confirm("Delete this meal?")) return;
        setBusy(true);
        await fetch(`/api/diet/${id}`, { method: "DELETE" });
        setBusy(false);
        router.refresh();
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            disabled={busy}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    );
}