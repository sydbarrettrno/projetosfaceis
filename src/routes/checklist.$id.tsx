import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, FileText, RotateCcw, ClipboardList } from "lucide-react";
import { getChecklist, type ItemStatus } from "@/data/checklists";
import { SiteHeader } from "@/components/SiteHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { useChecklistState, useHydrate } from "@/lib/checklist-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

export const Route = createFileRoute("/checklist/$id")({
  loader: ({ params }) => {
    const checklist = getChecklist(params.id);
    if (!checklist) throw notFound();
    return { checklist };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.checklist.title} — Portal de Checklists` : "Checklist" },
      {
        name: "description",
        content: loaderData?.checklist.description ?? "Checklist técnico",
      },
    ],
  }),
  component: ChecklistDetail,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold">Checklist não encontrado</h1>
        <Link to="/" className="mt-4 inline-block text-sm text-primary underline">
          Voltar para o início
        </Link>
      </div>
    </div>
  ),
});

function ChecklistDetail() {
  useHydrate();
  const { checklist } = Route.useLoaderData();
  const { items, setStatus, setObservation, reset } = useChecklistState(checklist.id);

  const stats = useMemo(() => {
    let total = 0;
    let checked = 0;
    let pending = 0;
    let na = 0;
    checklist.sections.forEach((s) =>
      s.items.forEach((it) => {
        total++;
        const st = items[it.id]?.status ?? "unchecked";
        if (st === "checked") checked++;
        else if (st === "pending") pending++;
        else if (st === "not_applicable") na++;
      }),
    );
    const considered = checked + na;
    const pct = total === 0 ? 0 : Math.round((considered / total) * 100);
    return { total, checked, pending, na, pct, unchecked: total - checked - pending - na };
  }, [checklist, items]);

  return (
    <div className="min-h-screen bg-background pb-16">
      <SiteHeader />

      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Todos os checklists
        </Link>
      </div>

      {/* Header */}
      <header className="mx-auto mt-4 max-w-5xl px-4 sm:px-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface text-2xl">
                {checklist.icon}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {checklist.category}
                  </span>
                  <span className="text-xs text-muted-foreground">Versão {checklist.version}</span>
                </div>
                <h1 className="mt-1.5 text-2xl font-semibold text-foreground">{checklist.title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{checklist.description}</p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  Origem: {checklist.source}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={reset}>
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reiniciar
              </Button>
              <Button asChild size="sm">
                <Link to="/checklist/$id/resumo" params={{ id: checklist.id }}>
                  <ClipboardList className="mr-1.5 h-3.5 w-3.5" /> Ver resumo
                </Link>
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6">
            <div className="flex items-end justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Progresso da conferência
              </span>
              <span className="text-sm font-semibold text-foreground">{stats.pct}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${stats.pct}%` }}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <Stat label="Total" value={stats.total} tone="info" />
              <Stat label="Conferidos" value={stats.checked} tone="success" />
              <Stat label="Pendentes" value={stats.pending} tone="warning" />
              <Stat label="Não se aplica" value={stats.na} tone="muted" />
            </div>
          </div>
        </div>
      </header>

      {/* Sections */}
      <main className="mx-auto mt-6 max-w-5xl space-y-6 px-4 sm:px-6">
        {checklist.sections.map((section, idx) => (
          <section
            key={section.id}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
          >
            <div className="border-b border-border bg-surface px-5 py-3">
              <h2 className="text-sm font-semibold text-foreground">
                <span className="text-muted-foreground">{String(idx + 1).padStart(2, "0")} ·</span>{" "}
                {section.title}
              </h2>
              {section.description && (
                <p className="mt-0.5 text-xs text-muted-foreground">{section.description}</p>
              )}
            </div>
            <ul className="divide-y divide-border">
              {section.items.map((item) => {
                const state = items[item.id] ?? { status: "unchecked" as ItemStatus, observation: "" };
                return (
                  <li key={item.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={state.status} />
                          {item.reference && (
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              {item.reference}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm font-medium text-foreground">{item.title}</p>
                        {item.description && (
                          <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <StatusButton
                          active={state.status === "checked"}
                          tone="success"
                          onClick={() => setStatus(item.id, "checked")}
                        >
                          Conferido
                        </StatusButton>
                        <StatusButton
                          active={state.status === "pending"}
                          tone="warning"
                          onClick={() => setStatus(item.id, "pending")}
                        >
                          Pendente
                        </StatusButton>
                        <StatusButton
                          active={state.status === "not_applicable"}
                          tone="muted"
                          onClick={() => setStatus(item.id, "not_applicable")}
                        >
                          N/A
                        </StatusButton>
                      </div>
                    </div>
                    <Textarea
                      value={state.observation}
                      onChange={(e) => setObservation(item.id, e.target.value)}
                      placeholder="Observação (opcional)"
                      className="mt-3 min-h-[44px] resize-none bg-surface text-sm"
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "info" | "success" | "warning" | "muted";
}) {
  const toneCls = {
    info: "bg-info/10 text-info border-info/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/15 text-warning-foreground border-warning/30",
    muted: "bg-muted text-muted-foreground border-border",
  }[tone];
  return (
    <div className={cn("flex items-center justify-between rounded-md border px-3 py-2", toneCls)}>
      <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
      <span className="text-base font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function StatusButton({
  active,
  tone,
  children,
  onClick,
}: {
  active: boolean;
  tone: "success" | "warning" | "muted";
  children: React.ReactNode;
  onClick: () => void;
}) {
  const inactive = "border-border bg-card text-muted-foreground hover:bg-accent";
  const activeCls = {
    success: "border-success bg-success text-success-foreground",
    warning: "border-warning bg-warning text-warning-foreground",
    muted: "border-muted-foreground/40 bg-muted text-foreground",
  }[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border px-2.5 py-1 text-xs font-medium transition",
        active ? activeCls : inactive,
      )}
    >
      {children}
    </button>
  );
}
