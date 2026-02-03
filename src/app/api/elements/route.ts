import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseFigmaUrl } from "@/lib/figma";
import { storeUpload } from "@/lib/upload";
import { serializeElement } from "@/lib/serialization";

export async function GET() {
  const elements = await prisma.figmaElement.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(elements.map(serializeElement));
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const figmaUrl = String(formData.get("figmaUrl") ?? "").trim();
  const titleRaw = String(formData.get("title") ?? "").trim();
  const projectId = String(formData.get("projectId") ?? "").trim();
  const image = formData.get("image");

  if (!figmaUrl) {
    return NextResponse.json(
      { error: "Figma URL is required." },
      { status: 400 },
    );
  }

  const parsed = parseFigmaUrl(figmaUrl);
  if (!parsed.isValid) {
    return NextResponse.json(
      { error: "Invalid Figma URL." },
      { status: 400 },
    );
  }

  if (!image || !(image instanceof File)) {
    return NextResponse.json(
      { error: "Image upload is required." },
      { status: 400 },
    );
  }

  try {
    const stored = await storeUpload(image);
    const element = await prisma.figmaElement.create({
      data: {
        title: titleRaw || "Untitled element",
        figmaUrl,
        figmaFileKey: parsed.fileKey ?? null,
        figmaNodeId: parsed.nodeId ?? null,
        imagePath: stored.path,
        imageName: stored.name,
        imageType: stored.type,
        imageSize: stored.size,
        projectId: projectId || null,
      },
    });

    return NextResponse.json({ id: element.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 500 },
    );
  }
}
