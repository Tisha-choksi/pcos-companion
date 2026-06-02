import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  date: z.string(),
  testName: z.string().min(1),
  value: z.number(),
  unit: z.string().optional(),
  range: z.string().optional(),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const labs = await prisma.labValue.findMany({
    where: { profileId: user.id },
    orderBy: [{ testName: "asc" }, { date: "desc" }],
  });

  return NextResponse.json(labs);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const lab = await prisma.labValue.create({
    data: {
      profileId: user.id,
      date: new Date(parsed.data.date),
      testName: parsed.data.testName,
      value: parsed.data.value,
      unit: parsed.data.unit ?? null,
      range: parsed.data.range ?? null,
    },
  });

  return NextResponse.json(lab, { status: 201 });
}
