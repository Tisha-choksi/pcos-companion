import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    const workout = await prisma.workoutLog.findUnique({ where: { id } });
    if (!workout || workout.profileId !== user.id) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.workoutLog.delete({ where: { id } });
    return NextResponse.json({ success: true });
}