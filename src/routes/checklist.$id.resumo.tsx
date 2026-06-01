import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, FileBarChart2, ClipboardCheck, Info } from "lucide-react";
import { useMemo } from "react";
import { getChecklist, type ChecklistSection, type ChecklistItem } from "@/data/checklists";
import { SiteHeader } from "@/components/SiteHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { useChecklistState, useHydrate } from "@/lib/checklist-state";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/checklist/$id/resumo")({
  loader: ({ params }) => {
    const checklist = getChecklist(params.id);
    if (!checklist) throw notFound();
    return { checklist };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `Resumo — ${loaderData.checklist.title}` : "Resumo" },
      { name: "description", content: "Resumo da conferência do checklist técnico." },
    ],
  }),
  component: SummaryPage,
});

function SummaryPage() {
  useHydrate();
  const { checklist } = Route.useLoaderData();
  const { items } = useChecklistState(checklist.id);

  const stats = useMemo(() => {
    let total = 0,
      checked = 0,
      pending = 0,
      na = 0;
    const byStatus = { checked: [] as any[], pending: [] as any[], na: [] as any[], unchecked: [] as any[] };
    checklist.sections.forEach((s: ChecklistSection) =>
      s.items.forEach((it: ChecklistItem) => {
        total++;
        const state = items[it.id] ?? { status: "unchecked", observation: "" };
        const row = { section: s.title, item: it, observation: state.observation };
        if (state.status === "checked") {
          checked++;
          byStatus.checked.push(row);
        } else if (state.status === "pending") {
          pending++;
          byStatus.pending.push(row);
        } else if (state.status === "not_applicable") {
          na++;
          byStatus.na.push(row);
        } else byStatus.unchecked.push(row);
      }),
    );
    const considered = checked + na;
    const pct = total === 0 ? 0 : Math.round((considered / total) * 100);
    return { total, checked, pending, na, pct, unchecked: total - checked - pending - na, byStatus };
  }, [checklist, items]);

  return (
    <div className="min-h-screen bg-background pb-16">
      <SiteHeader />

      <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6">
        <Link
          to="/checklist/$id"
          params={{ id: checklist.id }}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao checklist
        </Link>
      </div>

      <header className="mx-auto mt-4 max-w-4xl px-4 sm:px-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Resumo da conferência
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">{checklist.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Versão {checklist.version} · {checklist.source}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <BigStat label="Total" value={stats.total} />
            <BigStat label="Conferidos" value={stats.checked} tone="success" />
            <BigStat label="Pendentes" value={stats.pending} tone="warning" />
            <BigStat label="Não se aplica" value={stats.na} tone="muted" />
          </div>

          <div className="mt-5">
            <div className="flex items-end justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Conclusão
              </span>
              <span className="text-sm font-semibold text-foreground">{stats.pct}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${stats.pct}%` }}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              onClick={() =>
                toast.info("Geração de relatório técnico definitivo será habilitada na Fase 2.", {
                  description: "Por enquanto, o resumo está disponível nesta tela.",
                })
              }
            >
              <FileBarChart2 className="mr-1.5 h-4 w-4" /> Preparar relatório futuro
            </Button>
            <Button variant="outline" asChild>
              <Link to="/checklist/$id" params={{ id: checklist.id }}>
                <ClipboardCheck className="mr-1.5 h-4 w-4" /> Continuar conferência
              </Link>
            </Button>
          </div>

          <p className="mt-4 inline-flex items-start gap-2 rounded-md border border-info/20 bg-info/5 px-3 py-2 text-xs text-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 text-info" />
            Esta fase do MVP é dedicada a visualizar e conduzir checklists. A geração
            automática de relatórios técnicos não está incluída na Fase 1.
          </p>
        </div>
      </header>

      <main className="mx-auto mt-6 max-w-4xl space-y-4 px-4 sm:px-6">
        <Group title="Itens pendentes" items={stats.byStatus.pending} status="pending" empty="Sem pendências registradas." />
        <Group title="Itens conferidos" items={stats.byStatus.checked} status="checked" empty="Nenhum item conferido ainda." />
        <Group title="Itens não conferidos" items={stats.byStatus.unchecked} status="unchecked" empty="Todos os itens foram avaliados." />
        <Group title="Não se aplica" items={stats.byStatus.na} status="not_applicable" empty="Nenhum item marcado como não aplicável." />
      </main>
    </div>
  );
}

function BigStat({
  label,
  value,
  tone = "info",
}: {
  label: string;
  value: number;
  tone?: "info" | "success" | "warning" | "muted";
}) {
  const toneCls = {
    info: "border-border",
    success: "border-success/30 bg-success/5",
    warning: "border-warning/40 bg-warning/10",
    muted: "border-border bg-muted/40",
  }[tone];
  return (
    <div className={`rounded-lg border ${toneCls} p-3`}>
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</div>
    </div>
  );
}

function Group({
  title,
  items,
  status,
  empty,
}: {
  title: string;
  items: { section: string; item: { id: string; title: string }; observation: string }[];
  status: "checked" | "pending" | "not_applicable" | "unchecked";
  empty: string;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border bg-surface px-5 py-3">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <span className="text-xs text-muted-foreground">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="px-5 py-4 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((r) => (
            <li key={r.item.id} className="px-5 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.item.title}</p>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {r.section}
                  </p>
                  {r.observation && (
                    <p className="mt-1 rounded-md bg-surface px-2 py-1 text-xs text-foreground">
                      “{r.observation}”
                    </p>
                  )}
                </div>
                <StatusBadge status={status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
