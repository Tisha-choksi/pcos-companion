import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const lab = await prisma.labValue.findUnique({ where: { id } });
  if (!lab) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (lab.profileId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.labValue.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
