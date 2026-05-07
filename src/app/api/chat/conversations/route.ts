import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // For v1: return the most recent active conversation with its messages
    const conversation = await prisma.conversation.findFirst({
        where: { profileId: user.id, archived: false },
        orderBy: { updatedAt: "desc" },
        include: {
            messages: { orderBy: { createdAt: "asc" } },
        },
    });

    return NextResponse.json({ conversation });
}