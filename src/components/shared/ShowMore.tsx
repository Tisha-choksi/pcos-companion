"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

type ShowMoreProps = {
  children: ReactNode[];
  initial?: number;
  step?: number;
  label?: string;
};

export function ShowMore({
  children,
  initial = 5,
  step = 5,
  label = "Show more",
}: ShowMoreProps) {
  const [count, setCount] = useState(initial);
  const visible = children.slice(0, count);
  const hasMore = children.length > count;

  if (children.length <= initial) {
    return <>{children}</>;
  }

  return (
    <>
      {visible}
      {hasMore && (
        <div className="text-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCount((c) => c + step)}
            className="text-muted-foreground"
          >
            <ChevronDown className="h-4 w-4 mr-1" />
            {label} ({children.length - count} more)
          </Button>
        </div>
      )}
    </>
  );
}
