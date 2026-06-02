import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft, ClipboardCheck, FileCheck2, RotateCcw } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Disclaimer } from "@/components/Disclaimer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { STAGES, type ItemStatus } from "@/data/trilha";
import { useHydrate, useTrilhaState } from "@/lib/trilha-state";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/preparacao/resultado")({
  head: () => ({
    meta: [
      { title: "Resultado de Conferência — Projeto Fácil" },
      { name: "description", content: "Resultado da preparação do projeto de casa unifamiliar." },
    ],
  }),
  component: ResultadoPage,
});

interface Row {
  stage: string;
  itemId: string;
  title: string;
  status: ItemStatus;
  observation: string;
  value: string;
}

function ResultadoPage() {
  useHydrate();
  const { snapshot, reset } = useTrilhaState();

  const data = useMemo(() => {
    const rows: Row[] = [];
    let checked = 0,
      pending = 0,
      na = 0,
      notStarted = 0;
    const stageProgress: { id: string; title: string; number: number; done: number; total: number }[] = [];
    STAGES.forEach((s) => {
      let sDone = 0;
      s.items.forEach((it) => {
        const st = snapshot[`${s.id}::${it.id}`] ?? { status: "not_started", observation: "", value: "" };
        rows.push({
          stage: s.title,
          itemId: it.id,
          title: it.title,
          status: st.status,
          observation: st.observation,
          value: st.value,
        });
        if (st.status === "checked") {
          checked++;
          sDone++;
        } else if (st.status === "pending") pending++;
        else if (st.status === "not_applicable") {
          na++;
          sDone++;
        } else notStarted++;
      });
      stageProgress.push({ id: s.id, title: s.shortTitle, number: s.number, done: sDone, total: s.items.length });
    });
    const total = rows.length;
    const pct = total === 0 ? 0 : Math.round(((checked + na) / total) * 100);
    return { rows, checked, pending, na, notStarted, total, pct, stageProgress };
  }, [snapshot]);

  const pendentes = data.rows.filter((r) => r.status === "pending");
  const conferidos = data.rows.filter((r) => r.status === "checked");
  const naItens = data.rows.filter((r) => r.status === "not_applicable");
  const naoIniciados = data.rows.filter((r) => r.status === "not_started");
  const observacoes = data.rows.filter((r) => r.observation.trim().length > 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <SiteHeader />

      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <Link
          to="/preparacao"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar à preparação
        </Link>
      </div>

      <header className="mx-auto mt-4 max-w-5xl px-4 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Etapa 8 · Resultado de Conferência
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            Resultado de Conferência
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Casa Residencial Unifamiliar — preparação consolidada para protocolo.
          </p>

          <div className="mt-5">
            <div className="flex items-end justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Percentual final de preparação
              </span>
              <span className="text-2xl font-semibold tabular-nums text-foreground">
                {data.pct}%
              </span>
            </div>
            <Progress value={data.pct} className="mt-2 h-3" />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <BigStat label="Conferidos" value={data.checked} tone="success" />
            <BigStat label="Pendentes" value={data.pending} tone="warning" />
            <BigStat label="Não se aplica" value={data.na} tone="muted" />
            <BigStat label="Não iniciados" value={data.notStarted} tone="info" />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/preparacao">
                <ClipboardCheck className="mr-1.5 h-4 w-4" /> Continuar preparação
              </Link>
            </Button>
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="mr-1.5 h-4 w-4" /> Reiniciar preparação
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-6 max-w-5xl space-y-5 px-4 sm:px-6">
        {/* Etapas concluídas */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FileCheck2 className="h-4 w-4 text-primary" /> Etapas
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {data.stageProgress.map((s) => {
              const pct = s.total === 0 ? 0 : Math.round((s.done / s.total) * 100);
              const complete = s.done === s.total;
              return (
                <li
                  key={s.id}
                  className="rounded-lg border border-border bg-surface px-3 py-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {s.number}. {s.title}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-semibold tabular-nums",
                        complete ? "text-success" : "text-muted-foreground",
                      )}
                    >
                      {s.done}/{s.total} · {pct}%
                    </span>
                  </div>
                  <Progress value={pct} className="mt-1.5 h-1.5" />
                </li>
              );
            })}
          </ul>
        </section>

        <Group title="Itens pendentes" items={pendentes} empty="Sem pendências registradas." />
        <Group title="Itens conferidos" items={conferidos} empty="Nenhum item conferido ainda." />
        <Group title="Não se aplica" items={naItens} empty="Nenhum item marcado como não aplicável." />
        <Group title="Itens não iniciados" items={naoIniciados} empty="Todos os itens foram avaliados." />

        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">Observações do profissional</h2>
          {observacoes.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Nenhuma observação registrada.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {observacoes.map((r) => (
                <li key={r.itemId} className="rounded-md border border-border bg-surface px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{r.title}</p>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {r.stage}
                  </p>
                  <p className="mt-1 text-sm text-foreground">“{r.observation}”</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Disclaimer className="mt-2" />
      </main>
    </div>
  );
}

function BigStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "info" | "success" | "warning" | "muted";
}) {
  const toneCls = {
    info: "border-border bg-surface",
    success: "border-success/30 bg-success/10",
    warning: "border-warning/40 bg-warning/15",
    muted: "border-border bg-muted/40",
  }[tone];
  return (
    <div className={cn("rounded-lg border p-3", toneCls)}>
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</div>
    </div>
  );
}

function Group({ title, items, empty }: { title: string; items: Row[]; empty: string }) {
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
            <li key={`${r.stage}-${r.itemId}`} className="px-5 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{r.title}</p>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {r.stage}
                  </p>
                  {r.value && (
                    <p className="mt-1 text-xs text-foreground">
                      <span className="text-muted-foreground">Valor: </span>
                      {r.value}
                    </p>
                  )}
                </div>
                <StatusBadge status={r.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
