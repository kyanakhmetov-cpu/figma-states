"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, Copy, Share2 } from "lucide-react";
import { useLang } from "@/components/lang-provider";

export function NewElementPanel() {
  const { t } = useLang();
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium">{t("panel.title")}</p>
        <p className="text-xs text-muted-foreground">
          {t("panel.subtitle")}
        </p>
      </div>
      <Card className="space-y-3 border-border/60 p-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {t("panel.required")}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{t("panel.figmaLink")}</Badge>
            <Badge variant="secondary">{t("panel.imageUpload")}</Badge>
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {t("panel.after")}
          </p>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 text-emerald-500" />
              <span>{t("panel.step1")}</span>
            </div>
            <div className="flex items-start gap-2">
              <Copy className="mt-0.5 h-4 w-4 text-sky-500" />
              <span>{t("panel.step2")}</span>
            </div>
            <div className="flex items-start gap-2">
              <Share2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <span>{t("panel.step3")}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
