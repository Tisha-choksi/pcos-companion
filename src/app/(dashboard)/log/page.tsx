import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { format, startOfDay } from "date-fns";
import { LogForm } from "./_components/LogForm";

export default async function LogPage({
    searchParams,
}: {
    searchParams: Promise<{ date?: string }>;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const params = await searchParams;
    const targetDate = params.date
        ? startOfDay(new Date(params.date))
        : startOfDay(new Date());

    const existingLog = await prisma.symptomLog.findUnique({
        where: {
            profileId_date: {
                profileId: user.id,
                date: targetDate,
            },
        },
    });

    return (
        <div className="mx-auto max-w-2xl px-6 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold tracking-tight">
                    {isToday(targetDate) ? "How are you today?" : `Log for ${format(targetDate, "MMMM d")}`}
                </h1>
                <p className="text-muted-foreground mt-1">
                    {format(targetDate, "EEEE, MMMM d, yyyy")}
                </p>
            </div>

            <LogForm
                date={targetDate.toISOString()}
                existing={
                    existingLog
                        ? {
                            symptoms: existingLog.symptoms as Record<string, number>,
                            mood: existingLog.mood,
                            energy: existingLog.energy,
                            notes: existingLog.notes,
                        }
                        : null
                }
            />
        </div>
    );
}

function isToday(date: Date): boolean {
    const today = startOfDay(new Date());
    return date.getTime() === today.getTime();
}