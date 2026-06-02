import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
    fullName: z.string().max(100).optional(),
    dateOfBirth: z.string().nullable().optional(),
    heightCm: z.number().positive().nullable().optional(),
    weightKg: z.number().positive().nullable().optional(),
    phenotype: z.enum(["INSULIN_RESISTANT", "INFLAMMATORY", "ADRENAL", "LEAN", "UNKNOWN"]).nullable().optional(),
    diagnosisStatus: z.enum(["DIAGNOSED", "SUSPECTED", "NOT_SURE"]).nullable().optional(),
    diagnosedAt: z.string().nullable().optional(),
});

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const profile = await prisma.profile.findUnique({
        where: { id: user.id },
    });

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    return NextResponse.json(profile);
}

export async function PATCH(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid data." }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (parsed.data.fullName !== undefined) data.fullName = parsed.data.fullName;
    if (parsed.data.dateOfBirth !== undefined) data.dateOfBirth = parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null;
    if (parsed.data.heightCm !== undefined) data.heightCm = parsed.data.heightCm;
    if (parsed.data.weightKg !== undefined) data.weightKg = parsed.data.weightKg;
    if (parsed.data.phenotype !== undefined) data.phenotype = parsed.data.phenotype;
    if (parsed.data.diagnosisStatus !== undefined) data.diagnosisStatus = parsed.data.diagnosisStatus;
    if (parsed.data.diagnosedAt !== undefined) data.diagnosedAt = parsed.data.diagnosedAt ? new Date(parsed.data.diagnosedAt) : null;

    const updated = await prisma.profile.update({
        where: { id: user.id },
        data,
    });

    return NextResponse.json(updated);
}
