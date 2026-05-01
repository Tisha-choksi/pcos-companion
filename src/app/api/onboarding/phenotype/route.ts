import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { classifyPhenotype, type PhenotypeAnswers } from "@/lib/pcos/phenotype";

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json();
    const answers = body.answers as PhenotypeAnswers;

    if (!answers || typeof answers !== "object") {
        return NextResponse.json({ error: "Invalid answers." }, { status: 400 });
    }

    const result = classifyPhenotype(answers);

    try {
        await prisma.profile.update({
            where: { id: user.id },
            data: {
                phenotype: result.phenotype,
                phenotypeAnswers: answers as never,
                onboardingStep: 3,
            },
        });
        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error("Phenotype error:", error);
        return NextResponse.json({ error: "Save failed." }, { status: 500 });
    }
}