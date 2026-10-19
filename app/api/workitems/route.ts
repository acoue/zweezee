import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { generateReference } from "@/lib/referenceGenerator";

function getReferenceType(type: string) {
    switch (type) {
        case "BUG":
            return "bug";

        case "INCIDENT":
            return "incident";

        case "EVOLUTION":
            return "evolution";

        case "TASK":
            return "task";

        default:
            throw new Error(
                `Type de WorkItem inconnu : ${type}`
            );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const referenceType =
            getReferenceType(body.type);

        const reference =
            await generateReference(referenceType);

        const workItem =
            await prisma.workItem.create({
                data: {
                    reference,

                    title: body.title,
                    description:
                        body.description || null,

                    type: body.type,

                    status:
                        body.status || "TODO",

                    priority:
                        body.priority || "MEDIUM",

                    owner:
                        body.owner || null,

                    dueDate:
                        body.dueDate
                            ? new Date(body.dueDate)
                            : null,

                    projectId: body.projectId,
                },

                include: {
                    project: true,
                },
            });

        return NextResponse.json(
            workItem,
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error(
            "Erreur création WorkItem",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Erreur lors de la création",
            },
            {
                status: 400,
            }
        );
    }
}
