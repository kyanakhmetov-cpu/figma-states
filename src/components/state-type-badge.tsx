"use client";

import type { ElementStateType } from "@prisma/client";
import { cn } from "@/lib/utils";
import { STATE_TYPE_STYLES } from "@/lib/serialization";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/lang-provider";
import { stateTypeLabel } from "@/lib/i18n";

type StateTypeBadgeProps = {
  type: ElementStateType;
  className?: string;
};

export function StateTypeBadge({ type, className }: StateTypeBadgeProps) {
  const { lang } = useLang();
  const style = STATE_TYPE_STYLES[type];

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-2 border text-xs font-semibold uppercase tracking-wide",
        style?.className,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style?.dot)} />
      {stateTypeLabel(lang, type)}
    </Badge>
  );
}
