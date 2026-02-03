/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  FileImage,
  Folder,
  Link2,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import type { SerializedProject } from "@/lib/serialization";
import { parseFigmaUrl } from "@/lib/figma";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/lang-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type NewElementFormProps = {
  projects: SerializedProject[];
};

export function NewElementForm({ projects }: NewElementFormProps) {
  const router = useRouter();
  const { t } = useLang();
  const [figmaUrl, setFigmaUrl] = useState("");
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState<string | undefined>();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );
  const parsedLink = useMemo(() => {
    if (!figmaUrl.trim()) return null;
    return parseFigmaUrl(figmaUrl.trim());
  }, [figmaUrl]);
  const isValidLink = parsedLink?.isValid ?? false;
  const canSubmit = Boolean(file) && isValidLink && !isSubmitting;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onSubmit = async () => {
    if (!figmaUrl.trim()) {
      toast.error(t("new.toast.pasteLink"));
      return;
    }
    if (!isValidLink) {
      toast.error(t("new.toast.invalidLink"));
      return;
    }
    if (!file) {
      toast.error(t("new.toast.uploadImage"));
      return;
    }
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("figmaUrl", figmaUrl.trim());
      data.append("title", title.trim());
      if (projectId) data.append("projectId", projectId);
      data.append("image", file);

      const response = await fetch("/api/elements", {
        method: "POST",
        body: data,
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.error ?? "Failed to create element.");
      }
      const payload = (await response.json()) as { id: string };
      toast.success(t("new.toast.created"));
      router.push(`/e/${payload.id}`);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : t("new.toast.createError"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {t("new.headerLabel")}
        </p>
        <h2 className="font-display text-3xl font-semibold">
          {t("new.headerTitle")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("new.headerSubtitle")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>{t("new.detailsTitle")}</CardTitle>
            <CardDescription>{t("new.detailsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="figma-url" className="text-sm font-medium">
                {t("new.figmaLabel")}
              </label>
              <div className="relative">
                <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="figma-url"
                  placeholder={t("new.figmaPlaceholder")}
                  value={figmaUrl}
                  onChange={(event) => setFigmaUrl(event.target.value)}
                  className="pl-10"
                />
              </div>
              {figmaUrl.trim().length > 0 ? (
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {isValidLink ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-rose-500" />
                  )}
                  <span>
                    {isValidLink
                      ? t("new.figmaDetected")
                      : t("new.figmaInvalid")}
                  </span>
                  {parsedLink?.fileKey ? (
                    <span className="rounded-full border border-border/60 bg-muted px-2 py-0.5 text-[11px]">
                      {t("new.fileChip", { value: parsedLink.fileKey })}
                    </span>
                  ) : null}
                  {parsedLink?.nodeId ? (
                    <span className="rounded-full border border-border/60 bg-muted px-2 py-0.5 text-[11px]">
                      {t("new.nodeChip", { value: parsedLink.nodeId })}
                    </span>
                  ) : null}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {t("new.tipNodeLink")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="element-title" className="text-sm font-medium">
                {t("new.titleOptional")}
              </label>
              <div className="relative">
                <FileImage className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="element-title"
                  placeholder={t("new.titlePlaceholder")}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="element-project" className="text-sm font-medium">
                {t("new.projectOptional")}
              </label>
              <div className="relative">
                <Folder className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger id="element-project" className="pl-10">
                    <SelectValue placeholder={t("new.projectPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("new.projectHint")}
              </p>
            </div>

            <Button
              size="lg"
              className="mt-2 w-full gap-2"
              onClick={onSubmit}
              disabled={!canSubmit}
            >
              {isSubmitting ? t("new.creatingButton") : t("new.createButton")}
            </Button>
            {!canSubmit ? (
              <p className="text-xs text-muted-foreground">
                {t("new.submitHint")}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>{t("new.screenshotTitle")}</CardTitle>
            <CardDescription>{t("new.screenshotDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={cn(
                "flex min-h-[260px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center transition",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border/70",
              )}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                const dropped = event.dataTransfer.files?.[0];
                if (dropped) setFile(dropped);
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const selected = event.target.files?.[0];
                  if (selected) setFile(selected);
                }}
              />
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="Element preview"
                    className="max-h-52 rounded-lg border object-contain shadow-sm"
                  />
                  <div className="text-xs text-muted-foreground">
                    {t("new.clickReplace")}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <UploadCloud className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {t("new.dragTitle")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("new.dragSubtitle")}
                    </p>
                  </div>
                </>
              )}
            </div>

            {file ? (
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs">
                <div className="flex items-center gap-2">
                  <FileImage className="h-4 w-4 text-muted-foreground" />
                  <span className="max-w-[180px] truncate">{file.name}</span>
                  <span className="text-muted-foreground">
                    {Math.round(file.size / 1024)} KB
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                >
                  {t("new.remove")}
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
