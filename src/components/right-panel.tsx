/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Copy,
  ExternalLink,
  FileJson,
  ImageUp,
  Link as LinkIcon,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";
import type { SerializedElement, SerializedState } from "@/lib/serialization";
import { serializeStatesJSON, serializeStatesText } from "@/lib/serialization";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/lang-provider";

type RightPanelProps = {
  element: SerializedElement;
  states: SerializedState[];
  readOnly?: boolean;
};

export function RightPanel({ element, states, readOnly }: RightPanelProps) {
  const router = useRouter();
  const { t, lang } = useLang();
  const [zoom, setZoom] = useState(1);
  const [imagePath, setImagePath] = useState(element.imagePath);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canEdit = !readOnly;
  const shareLink = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/e/${element.id}?view=1`;
  }, [element.id]);
  const zoomLabel = `${Math.round(zoom * 100)}%`;

  useEffect(() => {
    setImagePath(element.imagePath);
  }, [element.imagePath]);

  const updateZoom = (next: number) => {
    const clamped = Math.min(1.6, Math.max(0.6, Number(next.toFixed(2))));
    setZoom(clamped);
  };

  const uploadImage = async (file: File) => {
    if (!canEdit) return;
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch(`/api/elements/${element.id}/image`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? t("right.toast.imageUpdateError"));
      }
      const updated = (await response.json()) as SerializedElement;
      setImagePath(updated.imagePath);
      toast.success(t("right.toast.imageUpdated"));
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : t("right.toast.imageUpdateError"),
      );
    } finally {
      setIsUploading(false);
    }
  };

  const copyShareLink = async () => {
    try {
      const link =
        shareLink || `${window.location.origin}/e/${element.id}?view=1`;
      await navigator.clipboard.writeText(link);
      toast.success(t("right.toast.shareCopied"));
    } catch {
      toast.error(t("right.toast.shareError"));
    }
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(serializeStatesText(states, lang));
      toast.success(t("right.toast.copyAllSuccess"));
    } catch {
      toast.error(t("right.toast.copyAllError"));
    }
  };

  const exportJson = () => {
    const content = serializeStatesJSON(element, states);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${element.title.replace(/\\s+/g, "-").toLowerCase()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium">{t("right.preview")}</p>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/80 p-1 shadow-xs">
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={() => updateZoom(zoom - 0.1)}
              aria-label={t("right.zoomOut")}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="min-w-[46px] text-center text-[11px] text-muted-foreground">
              {zoomLabel}
            </span>
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={() => updateZoom(zoom + 0.1)}
              aria-label={t("right.zoomIn")}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={() => updateZoom(1)}
              aria-label={t("right.zoomReset")}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <Card
          className={cn(
            "relative flex min-h-[240px] items-center justify-center overflow-hidden border-border/60 bg-muted/30",
            canEdit && isDragActive ? "ring-2 ring-primary/40" : "",
          )}
          onDragOver={
            canEdit
              ? (event) => {
                  event.preventDefault();
                  if (!isDragActive) setIsDragActive(true);
                  event.dataTransfer.dropEffect = "copy";
                }
              : undefined
          }
          onDragLeave={canEdit ? () => setIsDragActive(false) : undefined}
          onDrop={
            canEdit
              ? (event) => {
                  event.preventDefault();
                  setIsDragActive(false);
                  const file = event.dataTransfer.files?.[0];
                  if (file) {
                    uploadImage(file);
                  }
                }
              : undefined
          }
        >
          <img
            src={imagePath}
            alt={element.title}
            className="max-h-[280px] object-contain transition"
            style={{ transform: `scale(${zoom})` }}
          />
          {canEdit && isDragActive ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/70 text-sm font-medium">
              {t("right.dropReplace")}
            </div>
          ) : null}
        </Card>
        {canEdit ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <ImageUp className="h-4 w-4" />
              {isUploading ? t("right.uploading") : t("right.replaceImage")}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  uploadImage(file);
                }
                event.target.value = "";
              }}
            />
          </>
        ) : null}
      </div>

      <Separator />

      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium">{t("right.actions")}</p>
          <p className="text-xs text-muted-foreground">
            {t("right.actionsHint")}
          </p>
        </div>
        <div className="space-y-2">
          <Button className="w-full gap-2" onClick={copyShareLink}>
            <LinkIcon className="h-4 w-4" />
            {t("right.copyShare")}
          </Button>
          <Button variant="secondary" className="w-full gap-2" onClick={copyAll}>
            <Copy className="h-4 w-4" />
            {t("right.copyAll")}
          </Button>
          <Button
            variant="secondary"
            className="w-full gap-2"
            onClick={exportJson}
          >
            <FileJson className="h-4 w-4" />
            {t("right.exportJson")}
          </Button>
          <Button
            variant="secondary"
            className="w-full gap-2"
            onClick={() => window.open(element.figmaUrl, "_blank")}
          >
            <ExternalLink className="h-4 w-4" />
            {t("right.openFigma")}
          </Button>
        </div>
      </div>
    </div>
  );
}
