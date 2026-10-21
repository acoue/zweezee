import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { ActionType } from "@prisma/client"; import {
  generateActionReference,
  generateRiskReference,
} from "@/lib/referenceGenerator";

const dt = (value: unknown) => {
  if (!value) {
    return undefined;
  }

  return new Date(String(value));
};

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ entity: string }>;
  }
) {
  const { entity } = await params;
  const body = await req.json();

  try {
    let result;

    switch (entity) {
      case "projects":
        result = await prisma.project.create({
          data: {
            name: body.name,
            description: body.description || null,
            phase: body.phase || "Cadrage",
            progress: Number(body.progress || 0),
            health: body.health || "GREEN",
            color: body.color || "sky",
          },
        });

        break;

      case "actions": {
        const type =
          (body.type ||
            "ACTION") as ActionType;

        const reference =
          await generateActionReference(
            type
          );

        result =
          await prisma.action.create({
            data: {
              reference,
              type,

              title:
                body.title,

              description:
                body.description ||
                null,

              startDate:
                body.startDate
                  ? new Date(
                    body.startDate
                  )
                  : null,

              dueDate:
                body.dueDate
                  ? new Date(
                    body.dueDate
                  )
                  : null,

              estimatedHours:
                body.estimatedHours
                  ? Number(
                    body.estimatedHours
                  )
                  : null,

              owner:
                body.owner ||
                null,

              status:
                body.status ||
                "TODO",

              priority:
                body.priority ||
                "MEDIUM",

              source:
                body.source ||
                null,

              projectId:
                body.projectId,
            },

            include: {
              project: true,
            },
          });

        break;
      }

      case "risks": {
        const reference =
          await generateRiskReference();

        result =
          await prisma.risk.create({
            data: {
              reference,

              title:
                body.title,

              probability:
                Number(
                  body.probability
                ),

              impact:
                Number(
                  body.impact
                ),

              level:
                body.level ||
                "Modéré",

              owner:
                body.owner ||
                null,

              mitigation:
                body.mitigation ||
                null,

              projectId:
                body.projectId,
            },

            include: {
              project: true,
            },
          });

        break;
      }

      // case "milestones": {
      //   const reference =
      //     await generateActionReference("milestone");

      //   result = await prisma.milestone.create({
      //     data: {
      //       reference,
      //       title: body.title,
      //       dueDate: dt(body.dueDate)!,
      //       status: body.status || "PLANNED",
      //       projectId: body.projectId,
      //     },
      //     include: {
      //       project: true,
      //     },
      //   });

      //   break;
      // }

      // case "events": {
      //   const reference =
      //     await generateActionReference("event");

      //   result = await prisma.event.create({
      //     data: {
      //       reference,
      //       title: body.title,
      //       startsAt: dt(body.startsAt)!,
      //       endsAt: dt(body.endsAt),
      //       type: body.type || "MEETING",
      //       projectId: body.projectId,
      //     },
      //     include: {
      //       project: true,
      //     },
      //   });

      //   break;
      // }

      case "timesheets": {
        result =
          await prisma.timesheetEntry.create({
            data: {
              date:
                new Date(
                  body.date
                ),

              hours:
                Number(
                  body.hours
                ),

              activity:
                body.activity,

              projectId:
                body.projectId,

              actionId:
                body.actionId ||
                null,
            },

            include: {
              project: true,

              action: {
                select: {
                  id: true,
                  reference: true,
                  title: true,
                  type: true,
                },
              },
            },
          });

        break;
      }

      default:
        return NextResponse.json(
          {
            error: "Entité inconnue",
          },
          {
            status: 404,
          }
        );
    }

    return NextResponse.json(result, {
      status: 201,
    });
  } catch (error) {
    console.error(error);

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