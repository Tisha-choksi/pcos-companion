"use client";

import { Card, CardContent } from "@/components/ui/card";

export function PageSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="space-y-2">
                <div className="h-8 w-48 bg-muted rounded-md" />
                <div className="h-4 w-64 bg-muted rounded-md" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-6 space-y-3">
                            <div className="h-4 w-20 bg-muted rounded-md" />
                            <div className="h-8 w-16 bg-muted rounded-md" />
                            <div className="h-3 w-32 bg-muted rounded-md" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Card>
                <CardContent className="p-6 space-y-3">
                    <div className="h-4 w-32 bg-muted rounded-md" />
                    <div className="h-10 w-full bg-muted rounded-md" />
                    <div className="h-10 w-full bg-muted rounded-md" />
                </CardContent>
            </Card>
        </div>
    );
}
