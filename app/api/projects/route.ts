import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
    const body = await req.json();
    if (!body.name)
        return NextResponse.json({ error: "Nom requis" }, { status: 400 });
    const result =
        await prisma.project.create({
            data: {
                name: body.name,

                description:
                    body.description || null,

                projectEnabled:
                    body.projectEnabled ?? true,

                maintenanceEnabled:
                    body.maintenanceEnabled ?? false,

                phase:
                    body.projectEnabled
                        ? body.phase || "Cadrage"
                        : null,

                progress:
                    body.projectEnabled
                        ? Number(body.progress || 0)
                        : null,

                health:
                    body.health || "GREEN",

                color:
                    body.color || "sky",
            },
        });

    return NextResponse.json(result, { status: 201 });
}
