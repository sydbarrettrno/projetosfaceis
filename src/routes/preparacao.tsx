import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  HelpCircle,
  Info,
  ListChecks,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Disclaimer } from "@/components/Disclaimer";
import { AutosaveStatus } from "@/components/AutosaveStatus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { STAGES, type TrailItem, type ItemStatus } from "@/data/trilha";
import { useHydrate, useTrilhaState } from "@/lib/trilha-state";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/preparacao")({
  head: () => ({
    meta: [
      { title: "Preparação — Projeto Fácil" },
      {
        name: "description",
        content: "Trilha guiada de preparação do projeto de casa residencial unifamiliar.",
      },
    ],
  }),
  component: PreparacaoPage,
});

function PreparacaoPage() {
  useHydrate();
  const { snapshot, get, setStatus, setObservation, setValue, reset } = useTrilhaState();
  const [stageIdx, setStageIdx] = useState(0);

  const stats = useMemo(() => {
    let total = 0;
    let checked = 0;
    let pending = 0;
    let na = 0;
    let notStarted = 0;
    STAGES.forEach((s) =>
      s.items.forEach((it) => {
        total++;
        const st = snapshot[`${s.id}::${it.id}`]?.status ?? "not_started";
        if (st === "checked") checked++;
        else if (st === "pending") pending++;
        else if (st === "not_applicable") na++;
        else notStarted++;
      }),
    );
    const considered = checked + na;
    const pct = total === 0 ? 0 : Math.round((considered / total) * 100);
    return { total, checked, pending, na, notStarted, pct };
  }, [snapshot]);

  const stage = STAGES[stageIdx];
  const nextStage = STAGES[stageIdx + 1];
  const prevStage = STAGES[stageIdx - 1];

  const stageStats = useMemo(() => {
    let done = 0;
    stage.items.forEach((it) => {
      const st = snapshot[`${stage.id}::${it.id}`]?.status ?? "not_started";
      if (st === "checked" || st === "not_applicable") done++;
    });
    return { done, total: stage.items.length };
  }, [snapshot, stage]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Início
        </Link>
      </div>

      {/* Progress header */}
      <header className="mx-auto mt-4 max-w-6xl px-4 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
                Preparação · Casa Residencial Unifamiliar
              </p>
              <h1 className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">
                Etapa {stage.number} de {STAGES.length} — {stage.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{stage.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <AutosaveStatus trigger={snapshot} />
              <Button variant="outline" size="sm" onClick={reset}>
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reiniciar
              </Button>
              <Button asChild size="sm">
                <Link to="/preparacao/resultado">
                  <ClipboardCheck className="mr-1.5 h-3.5 w-3.5" /> Diagnóstico
                </Link>
              </Button>
            </div>
          </div>

          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Você está preparando o projeto para conferência preliminar.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <div className="flex items-end justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Percentual de preparação
                </span>
                <span className="text-lg font-semibold tabular-nums text-foreground">
                  {stats.pct}%
                </span>
              </div>
              <Progress value={stats.pct} className="mt-2 h-2.5" />
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
                <MiniStat label="Conferidos" value={stats.checked} tone="success" />
                <MiniStat label="Pendentes" value={stats.pending} tone="warning" />
                <MiniStat label="Não se aplica" value={stats.na} tone="muted" />
                <MiniStat label="Não iniciados" value={stats.notStarted} tone="info" />
              </div>
            </div>
            <div className="rounded-lg border border-border bg-surface p-3 text-sm sm:min-w-[220px]">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Próximo passo
              </p>
              <p className="mt-1 font-medium text-foreground">
                {nextStage
                  ? `Etapa ${nextStage.number} · ${nextStage.shortTitle}`
                  : "Ver resultado de conferência"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Esta etapa: {stageStats.done}/{stageStats.total} concluídos
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Stage tracker */}
      <nav className="mx-auto mt-5 max-w-6xl px-4 sm:px-6" aria-label="Etapas">
        <ol className="flex flex-nowrap gap-2 overflow-x-auto pb-2">
          {STAGES.map((s, i) => {
            const total = s.items.length;
            let done = 0;
            s.items.forEach((it) => {
              const st = snapshot[`${s.id}::${it.id}`]?.status ?? "not_started";
              if (st === "checked" || st === "not_applicable") done++;
            });
            const complete = done === total;
            const active = i === stageIdx;
            return (
              <li key={s.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setStageIdx(i)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : complete
                        ? "border-success/40 bg-success/10 text-success"
                        : "border-border bg-card text-foreground hover:border-primary/40",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold",
                      active
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : complete
                          ? "bg-success text-success-foreground"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {complete && !active ? <CheckCircle2 className="h-3 w-3" /> : s.number}
                  </span>
                  <span className="whitespace-nowrap">{s.shortTitle}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Stage content */}
      <main className="mx-auto mt-4 max-w-6xl px-4 sm:px-6">
        {stage.note && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-info/30 bg-info/5 px-4 py-3 text-sm text-foreground">
            <Info className="mt-0.5 h-4 w-4 text-info" />
            <span>{stage.note}</span>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="grid gap-4 md:grid-cols-2">
              {stage.items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  state={get(stage.id, item.id)}
                  onStatus={(s) => setStatus(stage.id, item.id, s)}
                  onObs={(v) => setObservation(stage.id, item.id, v)}
                  onValue={(v) => setValue(stage.id, item.id, v)}
                />
              ))}
            </div>

            {/* Nav buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
              <Button
                variant="outline"
                disabled={!prevStage}
                onClick={() => prevStage && setStageIdx(stageIdx - 1)}
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                {prevStage ? `Etapa ${prevStage.number} · ${prevStage.shortTitle}` : "Anterior"}
              </Button>
              {nextStage ? (
                <Button onClick={() => setStageIdx(stageIdx + 1)}>
                  Etapa {nextStage.number} · {nextStage.shortTitle}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/preparacao/resultado">
                    Ver diagnóstico preliminar <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>

            <Disclaimer className="mt-8" compact />
          </div>

          <ContextualHelpPanel
            stageTitle={stage.shortTitle}
            stageNote={stage.note}
            pendentes={stage.items
              .filter((it) => {
                const st = snapshot[`${stage.id}::${it.id}`]?.status ?? "not_started";
                return st === "pending" || st === "not_started";
              })
              .slice(0, 6)
              .map((it) => it.title)}
            nextStageLabel={
              nextStage ? `Etapa ${nextStage.number} · ${nextStage.shortTitle}` : "Diagnóstico preliminar"
            }
          />
        </div>
      </main>
    </div>
  );
}

function ContextualHelpPanel({
  stageTitle,
  stageNote,
  pendentes,
  nextStageLabel,
}: {
  stageTitle: string;
  stageNote?: string;
  pendentes: string[];
  nextStageLabel: string;
}) {
  return (
    <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-primary">
          <HelpCircle className="h-4 w-4" />
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Assistente de preenchimento
          </span>
        </div>
        <h3 className="mt-2 text-sm font-semibold text-foreground">{stageTitle}</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {stageNote ??
            "Marque cada item como conferido, pendente ou não se aplica. Use o campo de observação quando precisar registrar uma decisão técnica."}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-warning-foreground">
            <AlertCircle className="h-3.5 w-3.5" /> Pendências da etapa
          </span>
          <span className="text-xs font-semibold tabular-nums text-muted-foreground">
            {pendentes.length}
          </span>
        </div>
        {pendentes.length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Nenhuma pendência registrada nesta etapa.
          </p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {pendentes.map((t) => (
              <li key={t} className="flex items-start gap-1.5 text-xs text-foreground">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-warning" />
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
          <ListChecks className="h-3.5 w-3.5" /> Próximo passo
        </span>
        <p className="mt-1 text-sm font-medium text-foreground">{nextStageLabel}</p>
      </div>
    </aside>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "info" | "success" | "warning" | "muted";
}) {
  const toneCls = {
    info: "border-info/20 bg-info/5 text-info",
    success: "border-success/30 bg-success/10 text-success",
    warning: "border-warning/40 bg-warning/15 text-warning-foreground",
    muted: "border-border bg-muted text-muted-foreground",
  }[tone];
  return (
    <div className={cn("flex items-center justify-between rounded-md border px-2.5 py-1.5", toneCls)}>
      <span className="font-medium uppercase tracking-wider">{label}</span>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function ItemCard({
  item,
  state,
  onStatus,
  onObs,
  onValue,
}: {
  item: TrailItem;
  state: { status: ItemStatus; observation: string; value: string };
  onStatus: (s: ItemStatus) => void;
  onObs: (v: string) => void;
  onValue: (v: string) => void;
}) {
  const isField = item.kind === "field";
  return (
    <article className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-snug text-foreground">{item.title}</h3>
        <StatusBadge status={state.status} />
      </div>

      {isField && (
        <div className="mt-3">
          <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {item.fieldLabel ?? "Valor"}
          </label>
          <Input
            value={state.value}
            onChange={(e) => onValue(e.target.value)}
            placeholder={item.placeholder ?? "Informe o valor"}
            className="mt-1"
          />
        </div>
      )}

      <dl className="mt-4 space-y-2 text-xs">
        <Row label="O que é" value={item.what} />
        <Row label="Onde conseguir" value={item.where} />
        <Row label="Como apresentar" value={item.how} />
        <Row label="Erro comum" value={item.commonError} tone="warn" />
      </dl>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <StatusButton active={state.status === "checked"} tone="success" onClick={() => onStatus("checked")}>
          Conferido
        </StatusButton>
        <StatusButton active={state.status === "pending"} tone="warning" onClick={() => onStatus("pending")}>
          Pendente
        </StatusButton>
        <StatusButton active={state.status === "not_applicable"} tone="muted" onClick={() => onStatus("not_applicable")}>
          Não se aplica
        </StatusButton>
        <StatusButton active={state.status === "not_started"} tone="neutral" onClick={() => onStatus("not_started")}>
          Não iniciado
        </StatusButton>
      </div>

      <Textarea
        value={state.observation}
        onChange={(e) => onObs(e.target.value)}
        placeholder="Observação (opcional)"
        className="mt-3 min-h-[44px] resize-none bg-surface text-sm"
      />
    </article>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "warn" }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2">
      <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className={cn("text-foreground", tone === "warn" && "text-warning-foreground")}>
        {value}
      </dd>
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
  tone: "success" | "warning" | "muted" | "neutral";
  children: React.ReactNode;
  onClick: () => void;
}) {
  const inactive = "border-border bg-card text-muted-foreground hover:bg-accent";
  const activeCls = {
    success: "border-success bg-success text-success-foreground",
    warning: "border-warning bg-warning text-warning-foreground",
    muted: "border-muted-foreground/40 bg-muted text-foreground",
    neutral: "border-border bg-surface text-foreground",
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
