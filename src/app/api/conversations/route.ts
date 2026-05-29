import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const conversations = await prisma.conversation.findMany({
        where: { profileId: user.id, archived: false },
        orderBy: { updatedAt: "desc" },
        select: {
            id: true,
            title: true,
            updatedAt: true,
            _count: { select: { messages: true } },
        },
    });

    return NextResponse.json(conversations);
}

export async function DELETE(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing conversation id" }, { status: 400 });

    const conv = await prisma.conversation.findUnique({ where: { id } });
    if (!conv || conv.profileId !== user.id) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.conversation.update({
        where: { id },
        data: { archived: true },
    });

    return NextResponse.json({ success: true });
}
