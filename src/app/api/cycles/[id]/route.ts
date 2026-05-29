import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

async function getOwnedCycle(id: string, userId: string) {
    const cycle = await prisma.cycle.findUnique({ where: { id } });
    if (!cycle) return null;
    if (cycle.profileId !== userId) return null;
    return cycle;
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    const cycle = await getOwnedCycle(id, user.id);
    if (!cycle) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const schema = z.object({
        startDate: z.string().optional(),
        endDate: z.string().nullable().optional(),
        flowIntensity: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
    });
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid data." }, { status: 400 });

    const updated = await prisma.cycle.update({
        where: { id },
        data: {
            ...(parsed.data.startDate && { startDate: new Date(parsed.data.startDate) }),
            ...(parsed.data.endDate !== undefined && { endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null }),
            ...(parsed.data.flowIntensity !== undefined && { flowIntensity: parsed.data.flowIntensity || null }),
            ...(parsed.data.notes !== undefined && { notes: parsed.data.notes || null }),
        } as Record<string, unknown>,
    });

    return NextResponse.json(updated);
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    const cycle = await getOwnedCycle(id, user.id);
    if (!cycle) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.cycle.delete({ where: { id } });
    return NextResponse.json({ success: true });
}