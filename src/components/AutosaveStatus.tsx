import { useEffect, useState } from "react";
import { Check, CloudUpload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type State = "idle" | "pending" | "saving" | "saved";

/**
 * Visual local autosave indicator.
 * Reacts to changes on a key (e.g. snapshot reference) and cycles
 * pending -> saving -> saved. Não representa persistência remota.
 */
export function AutosaveStatus({ trigger, className }: { trigger: unknown; className?: string }) {
  const [state, setState] = useState<State>("idle");
  const [firstRun, setFirstRun] = useState(true);

  useEffect(() => {
    if (firstRun) {
      setFirstRun(false);
      return;
    }
    setState("pending");
    const t1 = setTimeout(() => setState("saving"), 250);
    const t2 = setTimeout(() => setState("saved"), 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps

  const label =
    state === "pending"
      ? "Alterações pendentes"
      : state === "saving"
        ? "Salvando…"
        : state === "saved"
          ? "Rascunho salvo automaticamente"
          : "Rascunho local";

  const Icon = state === "saving" ? Loader2 : state === "saved" ? Check : CloudUpload;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-muted-foreground",
        state === "saved" && "border-success/30 text-success",
        className,
      )}
      aria-live="polite"
    >
      <Icon className={cn("h-3 w-3", state === "saving" && "animate-spin")} />
      {label}
    </span>
  );
}
