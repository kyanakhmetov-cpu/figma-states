"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, FolderPlus, FileText, Sparkles } from "lucide-react";
import type { SerializedElement, SerializedProject } from "@/lib/serialization";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLang } from "@/components/lang-provider";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ElementSidebarProps = {
  elements: SerializedElement[];
  projects: SerializedProject[];
  currentElementId?: string;
};

export function ElementSidebar({
  elements,
  projects,
  currentElementId,
}: ElementSidebarProps) {
  const router = useRouter();
  const { lang, setLang, t } = useLang();
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [projectOptions, setProjectOptions] =
    useState<SerializedProject[]>(projects);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);

  const filteredElements = useMemo(() => {
    if (selectedProject === "all") return elements;
    return elements.filter((element) => element.projectId === selectedProject);
  }, [elements, selectedProject]);

  const projectLookup = useMemo(() => {
    const map = new Map<string, SerializedProject>();
    projectOptions.forEach((project) => map.set(project.id, project));
    return map;
  }, [projectOptions]);

  const projectCounts = useMemo(() => {
    const counts = new Map<string, number>();
    elements.forEach((element) => {
      if (!element.projectId) return;
      counts.set(
        element.projectId,
        (counts.get(element.projectId) ?? 0) + 1,
      );
    });
    return counts;
  }, [elements]);


  const createProject = async () => {
    if (!projectName.trim()) {
      toast.error(t("sidebar.projectNameRequired"));
      return;
    }
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName.trim(),
          description: projectDescription.trim() || null,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create project.");
      }
      const payload = (await response.json()) as SerializedProject;
      setProjectOptions((prev) => [...prev, payload]);
      setSelectedProject(payload.id);
      setProjectName("");
      setProjectDescription("");
      setProjectDialogOpen(false);
      toast.success(t("sidebar.projectCreated"));
    } catch (error) {
      console.error(error);
      toast.error(t("sidebar.projectCreateError"));
    }
  };

  return (
    <aside className="flex h-full min-h-0 flex-col gap-4 rounded-2xl border border-border/60 bg-card/90 p-4 shadow-sm backdrop-blur">
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            {t("sidebar.library")}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-base font-semibold">{t("sidebar.elements")}</p>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              {filteredElements.length}
            </span>
          </div>
        </div>
        <Button
          size="sm"
          className="w-full justify-between gap-2"
          onClick={() => router.push("/")}
        >
          {t("sidebar.newElement")}
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">
            {t("sidebar.project")}
          </p>
          <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t("sidebar.newProject")}
              >
                <FolderPlus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("sidebar.createProjectTitle")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  placeholder={t("sidebar.projectName")}
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                />
                <Textarea
                  placeholder={t("sidebar.projectDescription")}
                  value={projectDescription}
                  onChange={(event) => setProjectDescription(event.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button onClick={createProject}>{t("sidebar.create")}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder={t("sidebar.allProjects")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex w-full items-center justify-between gap-3">
                <span>{t("sidebar.allProjects")}</span>
                <span className="text-xs text-muted-foreground">
                  {elements.length}
                </span>
              </div>
            </SelectItem>
            {projectOptions.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                <div className="flex w-full items-center justify-between gap-3">
                  <span>{project.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {projectCounts.get(project.id) ?? 0}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <Command className="flex min-h-0 flex-1 flex-col border border-border/60 bg-background/70">
        <CommandInput placeholder={t("sidebar.searchPlaceholder")} />
        <CommandList className="flex-1 min-h-0">
          <CommandEmpty>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t("sidebar.noMatches")}
              </p>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => router.push("/")}
              >
                <Sparkles className="h-4 w-4" />
                {t("sidebar.createElement")}
              </Button>
            </div>
          </CommandEmpty>
          <ScrollArea className="h-full">
            <CommandGroup heading={t("sidebar.groupElements")} className="space-y-1">
              {filteredElements.map((element) => {
                const projectName = element.projectId
                  ? projectLookup.get(element.projectId)?.name
                  : undefined;
                const fileLabel = element.figmaFileKey
                  ? `File ${element.figmaFileKey}`
                  : "No file key";
                const isActive = currentElementId === element.id;
                return (
                  <CommandItem
                    key={element.id}
                    value={`${element.title} ${fileLabel} ${projectName ?? ""}`}
                    className={`group mb-1 flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors last:mb-0 focus-visible:ring-1 focus-visible:ring-border/40 ${
                      isActive
                        ? "bg-muted/70 text-foreground ring-1 ring-border/60"
                        : "text-foreground/90 hover:bg-muted/40 hover:text-foreground"
                    }`}
                    onSelect={() => router.push(`/e/${element.id}`)}
                  >
                    <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">
                          {element.title}
                        </span>
                      </div>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </ScrollArea>
        </CommandList>
      </Command>

      <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
        <span className="text-xs text-muted-foreground">
          {t("language.label")}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant={lang === "en" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setLang("en")}
          >
            {t("language.en")}
          </Button>
          <Button
            variant={lang === "ru" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setLang("ru")}
          >
            {t("language.ru")}
          </Button>
        </div>
      </div>
    </aside>
  );
}
