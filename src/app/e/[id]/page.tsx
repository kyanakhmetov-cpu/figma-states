import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  serializeElement,
  serializeProject,
  serializeState,
} from "@/lib/serialization";
import { AppShell } from "@/components/app-shell";
import { ElementEditor } from "@/components/element-editor";
import { ElementViewer } from "@/components/element-viewer";
import { RightPanel } from "@/components/right-panel";
import { LangProvider } from "@/components/lang-provider";

export const dynamic = "force-dynamic";

type ElementPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ElementPage({
  params,
  searchParams,
}: ElementPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  if (!resolvedParams?.id) {
    notFound();
  }

  const element = await prisma.figmaElement.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!element) {
    notFound();
  }

  const states = await prisma.elementState.findMany({
    where: { elementId: element.id },
    orderBy: { sortOrder: "asc" },
  });

  const serializedElement = serializeElement(element);
  const serializedStates = states.map(serializeState);
  const viewMode =
    resolvedSearchParams?.view === "1" ||
    resolvedSearchParams?.view === "true" ||
    resolvedSearchParams?.mode === "view";

  if (viewMode) {
    let project = null;
    let projectElements = [] as typeof serializedElement[];
    if (element.projectId) {
      const [projectRecord, elements] = await Promise.all([
        prisma.project.findUnique({ where: { id: element.projectId } }),
        prisma.figmaElement.findMany({
          where: { projectId: element.projectId },
          orderBy: { updatedAt: "desc" },
        }),
      ]);
      project = projectRecord ? serializeProject(projectRecord) : null;
      projectElements = elements.map(serializeElement);
    }

    return (
      <LangProvider storageKey="shared-lang">
        <ElementViewer
          element={serializedElement}
          states={serializedStates}
          project={project}
          projectElements={projectElements}
        />
      </LangProvider>
    );
  }

  const [elements, projects] = await Promise.all([
    prisma.figmaElement.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.project.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <AppShell
      elements={elements.map(serializeElement)}
      projects={projects.map(serializeProject)}
      currentElementId={element.id}
      rightPanel={<RightPanel element={serializedElement} states={serializedStates} />}
    >
      <ElementEditor element={serializedElement} states={serializedStates} />
    </AppShell>
  );
}
