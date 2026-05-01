import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  medications: z.array(
    z.object({
      name: z.string().min(1),
      category: z.enum([
        "INSULIN_SENSITIZER",
        "ANDROGEN_BLOCKER",
        "HORMONAL",
        "SUPPLEMENT",
        "OTHER",
      ]),
      startedAt: z.string().min(1),
    }),
  ),
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

  try {
    await prisma.$transaction([
      ...parsed.data.medications.map((m) =>
        prisma.medication.create({
          data: {
            profileId: user.id,
            name: m.name,
            category: m.category,
            startedAt: new Date(m.startedAt),
          },
        }),
      ),
      prisma.profile.update({
        where: { id: user.id },
        data: {
          onboardingStep: 4,
          onboardingComplete: true,
        },
      }),
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Medications error:", error);
    return NextResponse.json({ error: "Save failed." }, { status: 500 });
  }
}