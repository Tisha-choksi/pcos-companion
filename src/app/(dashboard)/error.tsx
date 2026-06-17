"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight mb-2">Something went wrong</h1>
      <p className="text-muted-foreground text-sm mb-6">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <Button onClick={reset}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Try again
      </Button>
    </div>
  );
}
