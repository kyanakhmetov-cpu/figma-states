"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ClipboardCopy,
  CopyPlus,
  Trash2,
} from "lucide-react";
import type { SerializedState } from "@/lib/serialization";
import {
  STATE_TYPE_LABELS,
  STATE_TYPE_STYLES,
  stateCopyText,
} from "@/lib/serialization";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/lang-provider";
import { stateTypeLabel } from "@/lib/i18n";
import type { ElementStateType } from "@prisma/client";

type StateCardProps = {
  state: SerializedState;
  index: number;
  total: number;
  autoFocus?: boolean;
  disableMove?: boolean;
  onChange: (id: string, patch: Partial<SerializedState>) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
};

export function StateCard({
  state,
  index,
  total,
  autoFocus,
  disableMove,
  onChange,
  onMove,
  onDelete,
  onDuplicate,
}: StateCardProps) {
  const { t, lang } = useLang();
  const style = STATE_TYPE_STYLES[state.type];
  const messageRef = useRef<HTMLTextAreaElement | null>(null);
  const hasMeta = Boolean(
    state.condition || state.severity || (state.locale && state.locale !== "en"),
  );
  const [showMeta, setShowMeta] = useState(hasMeta);

  useEffect(() => {
    if (autoFocus && messageRef.current) {
      messageRef.current.focus();
    }
  }, [autoFocus]);

  const copyState = async (mode: "message" | "title-message") => {
    try {
      await navigator.clipboard.writeText(stateCopyText(state, mode));
      toast.success(t("state.copied"));
    } catch {
      toast.error(t("state.copyFailed"));
    }
  };

  const messageTrimmed = state.message.trim();
  const messageLength = messageTrimmed.length;
  const messageWords = messageTrimmed
    ? messageTrimmed.split(/\s+/).length
    : 0;

  return (
    <Card
      className={cn(
        "gap-2 border border-border/60 bg-background/80 p-3 shadow-sm transition",
        "border-l-4",
        style?.card ?? "",
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={state.type}
          onValueChange={(value) =>
            onChange(state.id, { type: value as SerializedState["type"] })
          }
        >
          <SelectTrigger
            className={`h-8 w-[160px] text-xs uppercase tracking-wide ${style?.select ?? ""}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(STATE_TYPE_LABELS) as ElementStateType[]).map(
              (value) => (
                <SelectItem key={value} value={value}>
                  {stateTypeLabel(lang, value)}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
        <Input
          value={state.title}
          onChange={(event) => onChange(state.id, { title: event.target.value })}
          placeholder={t("state.shortLabelPlaceholder")}
          className="h-9 min-w-[200px] flex-1 text-sm font-medium"
          aria-label="State title"
        />
        <div className="ml-auto flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => onMove(state.id, "up")}
                disabled={disableMove || index === 0}
                aria-label="Move up"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("state.moveUp")}</TooltipContent>
          </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => onMove(state.id, "down")}
                disabled={disableMove || index === total - 1}
                aria-label="Move down"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("state.moveDown")}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => onDuplicate(state.id)}
                aria-label="Duplicate state"
              >
                <CopyPlus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("state.duplicate")}</TooltipContent>
          </Tooltip>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                aria-label="Delete state"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("state.deleteTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("state.deleteDescription")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(state.id)}>
                  {t("common.delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="space-y-0">
        <Textarea
          ref={messageRef}
          value={state.message}
          onChange={(event) =>
            onChange(state.id, { message: event.target.value })
          }
          placeholder={t("state.messagePlaceholder")}
          rows={4}
          className="min-h-[110px] resize-y"
          aria-label="State message"
        />
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            {messageLength} chars · {messageWords} words
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyState("message")}
              className="gap-1"
            >
              <ClipboardCopy className="h-4 w-4" />
              {t("state.copyMessage")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyState("title-message")}
            >
              {t("state.copyLabelMessage")}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowMeta((prev) => !prev)}
          className="gap-1 text-muted-foreground"
          aria-expanded={showMeta}
        >
          {t("state.details")}
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              showMeta ? "rotate-180" : "",
            )}
          />
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          {state.condition ? (
            <Badge variant="secondary" className="max-w-[200px] truncate">
              {t("state.conditionBadge", { value: state.condition })}
            </Badge>
          ) : null}
          {state.severity ? (
            <Badge variant="secondary" className="max-w-[160px] truncate">
              {t("state.severityBadge", { value: state.severity })}
            </Badge>
          ) : null}
          {state.locale && state.locale !== "en" ? (
            <Badge variant="secondary">
              {t("state.localeBadge", { value: state.locale })}
            </Badge>
          ) : null}
          {!hasMeta ? (
            <span className="text-xs text-muted-foreground">
              {t("state.addMetaHint")}
            </span>
          ) : null}
        </div>
      </div>

      {showMeta ? (
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            value={state.condition ?? ""}
            onChange={(event) =>
              onChange(state.id, { condition: event.target.value })
            }
            placeholder={t("state.conditionPlaceholder")}
            aria-label="State condition"
          />
          <Input
            value={state.severity ?? ""}
            onChange={(event) =>
              onChange(state.id, { severity: event.target.value })
            }
            placeholder={t("state.severityPlaceholder")}
            aria-label="State severity"
          />
          <Input
            value={state.locale}
            onChange={(event) =>
              onChange(state.id, { locale: event.target.value })
            }
            placeholder={t("state.localePlaceholder")}
            aria-label="State locale"
          />
        </div>
      ) : null}
    </Card>
  );
}
