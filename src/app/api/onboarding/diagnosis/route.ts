import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  status: z.enum(["DIAGNOSED", "SUSPECTED", "NOT_SURE"]),
  diagnosedAt: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const { status, diagnosedAt } = parsed.data;

  try {
    await prisma.profile.update({
      where: { id: user.id },
      data: {
        diagnosisStatus: status,
        diagnosedAt: diagnosedAt ? new Date(diagnosedAt) : null,
        onboardingStep: 2,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Diagnosis error:", error);
    return NextResponse.json({ error: "Save failed." }, { status: 500 });
  }
}