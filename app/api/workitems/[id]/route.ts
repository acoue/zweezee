import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const workItem =
      await prisma.workItem.update({
        where: {
          id,
        },

        data: {
          title: body.title,

          description:
            body.description || null,

          type: body.type,

          status: body.status,

          priority: body.priority,

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

    return NextResponse.json(workItem);
  } catch (error) {
    console.error(
      "Erreur modification WorkItem",
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
  _req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await params;

    await prisma.workItem.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "Erreur suppression WorkItem",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la suppression",
      },
      {
        status: 400,
      }
    );
  }
}