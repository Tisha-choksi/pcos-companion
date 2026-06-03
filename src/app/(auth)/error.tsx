"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="text-center space-y-4">
      <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground text-sm">
        {error.message || "An unexpected error occurred."}
      </p>
      <Button onClick={reset}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Try again
      </Button>
    </div>
  );
}
