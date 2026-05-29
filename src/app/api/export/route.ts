import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "cycles";

    let csv = "";
    let filename = "";

    switch (type) {
        case "cycles": {
            filename = "cycles.csv";
            csv = "Start Date,End Date,Flow Intensity,Length Days,Notes\n";
            const cycles = await prisma.cycle.findMany({
                where: { profileId: user.id },
                orderBy: { startDate: "desc" },
            });
            for (const c of cycles) {
                const start = c.startDate.toISOString().split("T")[0];
                const end = c.endDate ? c.endDate.toISOString().split("T")[0] : "";
                csv += `${start},${end},${c.flowIntensity || ""},${c.notes || ""}\n`;
            }
            break;
        }
        case "symptoms": {
            filename = "symptoms.csv";
            csv = "Date,Symptoms,Mood,Energy,Notes\n";
            const symptoms = await prisma.symptomLog.findMany({
                where: { profileId: user.id },
                orderBy: { date: "desc" },
            });
            for (const s of symptoms) {
                const date = s.date.toISOString().split("T")[0];
                const symptomsStr = typeof s.symptoms === "object" ? JSON.stringify(s.symptoms).replace(/,/g, ";") : String(s.symptoms);
                csv += `${date},"${symptomsStr}",${s.mood ?? ""},${s.energy ?? ""},"${s.notes || ""}"\n`;
            }
            break;
        }
        case "labs": {
            filename = "lab_results.csv";
            csv = "Date,Test Name,Value,Unit,Reference Range\n";
            const labs = await prisma.labValue.findMany({
                where: { profileId: user.id },
                orderBy: { date: "desc" },
            });
            for (const l of labs) {
                const date = l.date.toISOString().split("T")[0];
                csv += `${date},${l.testName},${l.value},${l.unit || ""},${l.range || ""}\n`;
            }
            break;
        }
        case "all": {
            filename = "pcos_companion_export.zip";
            return NextResponse.json({ error: "ZIP export not implemented yet. Export individual types." }, { status: 501 });
        }
        default:
            return NextResponse.json({ error: "Invalid type. Use: cycles, symptoms, labs" }, { status: 400 });
    }

    return new NextResponse(csv, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="${filename}"`,
        },
    });
}
