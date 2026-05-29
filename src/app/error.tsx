"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-7 w-7 text-destructive" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Unexpected error</h1>
        <p className="text-muted-foreground mb-8">
          {error.message || "Something went wrong. Please try again."}
        </p>
        <Button onClick={reset} size="lg">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
      </div>
    </div>
  );
}
