import type { ItemStatus } from "@/data/checklists";
import { Check, Clock, MinusCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const config: Record<ItemStatus, { label: string; icon: typeof Check; cls: string }> = {
  checked: { label: "Conferido", icon: Check, cls: "bg-success/15 text-success border-success/30" },
  pending: { label: "Pendente", icon: Clock, cls: "bg-warning/20 text-warning-foreground border-warning/40" },
  not_applicable: { label: "N/A", icon: MinusCircle, cls: "bg-muted text-muted-foreground border-border" },
  unchecked: { label: "Não conferido", icon: Circle, cls: "bg-background text-muted-foreground border-border" },
};

export function StatusBadge({ status, className }: { status: ItemStatus; className?: string }) {
  const c = config[status];
  const Icon = c.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        c.cls,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  );
}
