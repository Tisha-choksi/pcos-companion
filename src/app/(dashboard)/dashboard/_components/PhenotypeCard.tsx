import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowRight } from "lucide-react";
import type { Phenotype } from "@prisma/client";

const PHENOTYPE_INFO: Record<Phenotype, { label: string; emoji: string; color: string }> = {
    INSULIN_RESISTANT: { label: "Insulin-resistant", emoji: "🩸", color: "from-amber-100 to-orange-100" },
    INFLAMMATORY: { label: "Inflammatory", emoji: "🔥", color: "from-red-100 to-rose-100" },
    ADRENAL: { label: "Adrenal", emoji: "⚡", color: "from-purple-100 to-pink-100" },
    LEAN: { label: "Lean", emoji: "🌱", color: "from-green-100 to-emerald-100" },
    UNKNOWN: { label: "Mixed pattern", emoji: "🌀", color: "from-blue-100 to-indigo-100" },
};

type PhenotypeCardProps = {
    phenotype: Phenotype | null;
};

export function PhenotypeCard({ phenotype }: PhenotypeCardProps) {
    if (!phenotype) {
        return (
            <Card className="border-dashed">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                        <Sparkles className="h-4 w-4" />
                        <span>Your type</span>
                    </div>
                    <p className="text-lg font-medium">Take the quiz</p>
                    <p className="text-xs text-muted-foreground mt-2">
                        Find out your PCOS type for personalized insights.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const info = PHENOTYPE_INFO[phenotype];

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-6 relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${info.color} opacity-30 dark:opacity-10`} />
                <div className="relative">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                        <Sparkles className="h-4 w-4" />
                        <span>Your type</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{info.emoji}</span>
                        <p className="text-2xl font-semibold">{info.label}</p>
                    </div>
                    <Link
                        href="/profile/phenotype"
                        className="text-xs text-muted-foreground mt-2 inline-flex items-center hover:text-foreground transition"
                    >
                        Learn more
                        <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}