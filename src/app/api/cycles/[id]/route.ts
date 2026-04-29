import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;

    try {
        // Important: ensure user owns this cycle before deleting
        const cycle = await prisma.cycle.findUnique({ where: { id } });

        if (!cycle) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        if (cycle.profileId !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.cycle.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Cycle delete error:", error);
        return NextResponse.json(
            { error: "Failed to delete." },
            { status: 500 },
        );
    }
}