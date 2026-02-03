import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeProject } from "@/lib/serialization";
import { projectSchema } from "@/lib/validators";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(projects.map(serializeProject));
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const project = await prisma.project.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    },
  });

  return NextResponse.json(serializeProject(project));
}
