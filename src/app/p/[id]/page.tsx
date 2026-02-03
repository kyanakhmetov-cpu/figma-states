import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { serializeElement, serializeProject } from "@/lib/serialization";
import { ProjectViewer } from "@/components/project-viewer";
import { LangProvider } from "@/components/lang-provider";

export const dynamic = "force-dynamic";

type ProjectPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const resolvedParams = await params;
  if (!resolvedParams?.id) {
    notFound();
  }

  const project = await prisma.project.findUnique({
    where: { id: resolvedParams.id },
  });
  if (!project) {
    notFound();
  }

  const elements = await prisma.figmaElement.findMany({
    where: { projectId: resolvedParams.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <LangProvider storageKey="shared-lang">
      <ProjectViewer
        project={serializeProject(project)}
        elements={elements.map(serializeElement)}
      />
    </LangProvider>
  );
}
