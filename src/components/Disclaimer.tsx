import { ShieldAlert } from "lucide-react";
import { DISCLAIMER } from "@/data/trilha";
import { cn } from "@/lib/utils";

export function Disclaimer({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-2.5 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-warning-foreground",
        compact && "text-xs",
        className,
      )}
    >
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
      <p className={cn("text-sm leading-relaxed", compact && "text-xs")}>{DISCLAIMER}</p>
    </div>
  );
}
