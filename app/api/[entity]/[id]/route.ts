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
        where: { id },
        data: {
          title: b.title,
          owner: b.owner,
          dueDate: dt(b.dueDate),
          status: b.status,
          priority: b.priority,
          source: b.source,
          projectId: b.projectId,
        },
        include: { project: true },
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
    else if (entity === "events")
      x = await prisma.event.update({
        where: { id },
        data: {
          title: b.title,
          startsAt: dt(b.startsAt)!,
          endsAt: dt(b.endsAt),
          type: b.type,
          projectId: b.projectId,
        },
        include: { project: true },
      });
    else if (entity === "milestones")
      x = await prisma.milestone.update({
        where: { id },
        data: {
          title: b.title,
          dueDate: dt(b.dueDate)!,
          status: b.status,
          projectId: b.projectId,
        },
        include: { project: true },
      });
    else if (entity === "timesheets")
      x = await prisma.timesheetEntry.update({
        where: { id },
        data: {
          date: dt(b.date)!,
          activity: b.activity,
          hours: Number(b.hours),
          projectId: b.projectId,
        },
        include: { project: true },
      });
    else
      return NextResponse.json({ error: "Entité inconnue" }, { status: 404 });
    return NextResponse.json(x);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ entity: string; id: string }> },
) {
  const { entity, id } = await params;
  try {
    if (entity === "projects") await prisma.project.delete({ where: { id } });
    else if (entity === "actions")
      await prisma.action.delete({ where: { id } });
    else if (entity === "risks") await prisma.risk.delete({ where: { id } });
    else if (entity === "events") await prisma.event.delete({ where: { id } });
    else if (entity === "milestones")
      await prisma.milestone.delete({ where: { id } });
    else if (entity === "timesheets")
      await prisma.timesheetEntry.delete({ where: { id } });
    else
      return NextResponse.json({ error: "Entité inconnue" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
