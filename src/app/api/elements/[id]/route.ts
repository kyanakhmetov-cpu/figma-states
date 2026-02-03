import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { elementUpdateSchema } from "@/lib/validators";
import { parseFigmaUrl } from "@/lib/figma";
import { serializeElement } from "@/lib/serialization";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const resolvedParams = await params;
  if (!resolvedParams?.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const element = await prisma.figmaElement.findUnique({
    where: { id: resolvedParams.id },
  });
  if (!element) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json(serializeElement(element));
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const resolvedParams = await params;
  if (!resolvedParams?.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const body = await request.json();
  const parsed = elementUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const data: {
      title?: string;
      projectId?: string | null;
      figmaUrl?: string;
      figmaFileKey?: string | null;
      figmaNodeId?: string | null;
    } = {};

    if (parsed.data.title !== undefined) {
      data.title = parsed.data.title;
    }
    if (parsed.data.projectId !== undefined) {
      data.projectId = parsed.data.projectId;
    }
    if (parsed.data.figmaUrl !== undefined) {
      const figmaUrl = parsed.data.figmaUrl.trim();
      const parsedFigma = parseFigmaUrl(figmaUrl);
      if (!parsedFigma.isValid) {
        return NextResponse.json(
          { error: "Invalid Figma URL." },
          { status: 400 },
        );
      }
      data.figmaUrl = figmaUrl;
      data.figmaFileKey = parsedFigma.fileKey ?? null;
      data.figmaNodeId = parsedFigma.nodeId ?? null;
    }

    const element = await prisma.figmaElement.update({
      where: { id: resolvedParams.id },
      data,
    });
    return NextResponse.json(serializeElement(element));
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update element." },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const resolvedParams = await params;
  if (!resolvedParams?.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    await prisma.figmaElement.delete({
      where: { id: resolvedParams.id },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete element." },
      { status: 500 },
    );
  }
}
