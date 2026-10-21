import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
const dt = (v: any) => (v ? new Date(v) : null);
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ entity: string; id: string }> },
) {
  const { entity, id } = await params;
  const b = await req.json();
  try {
    let x: any;
    if (entity === "projects")
      x = await prisma.project.update({
        where: {
          id,
        },
        data: {
          name: b.name,
          description:
            b.description || null,
          projectEnabled:
            b.projectEnabled,
          maintenanceEnabled:
            b.maintenanceEnabled,
          phase:
            b.projectEnabled
              ? b.phase
              : null,
          progress:
            b.projectEnabled
              ? Number(b.progress ?? 0)
              : null,
          health:
            b.health,
          color:
            b.color,
        },
      });
    else if (entity === "actions")
      x = await prisma.action.update({
        where: {
          id,
        },

        data: {
          title: b.title,

          description:
            b.description || null,

          startDate:
            b.startDate
              ? new Date(b.startDate)
              : null,

          dueDate:
            b.dueDate
              ? new Date(b.dueDate)
              : null,

          estimatedHours:
            b.estimatedHours !== null &&
              b.estimatedHours !== undefined &&
              b.estimatedHours !== ""
              ? Number(b.estimatedHours)
              : null,

          owner:
            b.owner || null,

          status:
            b.status,

          priority:
            b.priority,

          source:
            b.source || null,

          projectId:
            b.projectId,
        },

        include: {
          project: true,
        },
      });
    else if (entity === "risks")
      x = await prisma.risk.update({
        where: { id },
        data: {
          title: b.title,
          probability: Number(b.probability),
          impact: Number(b.impact),
          level: b.level,
          owner: b.owner,
          mitigation: b.mitigation,
          projectId: b.projectId,
        },
        include: { project: true },
      });
    else if (entity === "timesheets")
      x = await prisma.timesheetEntry.update({
        where: {
          id,
        },

        data: {
          date:
            new Date(
              b.date
            ),

          hours:
            Number(
              b.hours
            ),

          activity:
            b.activity,

          projectId:
            b.projectId,

          actionId:
            b.actionId ||
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
    else
      return NextResponse.json({ error: "Entité inconnue" }, { status: 404 });
    return NextResponse.json(x);
  } catch (error) {
    console.error(
      "Erreur modification",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la modification",
      },
      {
        status: 400,
      }
    );
  }
}
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ entity: string; id: string }> },
) {
  const { entity, id } = await params;
  try {
    if (entity === "projects") await prisma.project.delete({ where: { id } });
    else if (entity === "actions") await prisma.action.delete({ where: { id } });
    else if (entity === "risks") await prisma.risk.delete({ where: { id } });
    else if (entity === "timesheets") await prisma.timesheetEntry.delete({ where: { id } });
    else return NextResponse.json({ error: "Entité inconnue" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
