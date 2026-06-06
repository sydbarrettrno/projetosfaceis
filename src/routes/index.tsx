import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ClipboardCheck,
  FileText,
  Layers,
  PlayCircle,
  Ruler,
  ShieldCheck,
  Sparkles,
  Stamp,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Disclaimer } from "@/components/Disclaimer";
import { Button } from "@/components/ui/button";
import { STAGES } from "@/data/trilha";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Projeto Fácil — Descubra se seu projeto está pronto" },
      {
        name: "description",
        content:
          "Organize as informações do seu projeto de casa, confira pendências e reduza o risco de retrabalho antes do protocolo.",
      },
      { property: "og:title", content: "Projeto Fácil — Descomplicando Projetos" },
      {
        property: "og:description",
        content:
          "Diagnóstico preliminar guiado para projeto de casa residencial unifamiliar.",
      },
    ],
  }),
  component: HomePage,
});

const HERO_PILLS = [
  { icon: Layers, label: "7 etapas guiadas" },
  { icon: ClipboardCheck, label: "Pendências visíveis" },
  { icon: Sparkles, label: "Resultado preliminar" },
  { icon: ShieldCheck, label: "Sem promessa de aprovação" },
];

const PROJECT_ICONS = [
  { icon: Ruler, label: "Plantas e cotas" },
  { icon: FileText, label: "Documentos" },
  { icon: Stamp, label: "ART / RRT" },
  { icon: ClipboardCheck, label: "Análise técnica" },
];

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(80% 60% at 80% 0%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 60%), radial-gradient(60% 50% at 0% 100%, color-mix(in oklab, var(--info) 12%, transparent), transparent 60%)",
          }}
        />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              <Sparkles className="h-3 w-3" /> Diagnóstico preliminar de projeto
            </span>
            <h1 className="mt-4 text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
              Descubra se seu projeto está pronto para avançar
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Organize as informações do seu projeto, confira pendências e reduza o risco de
              retrabalho antes do protocolo.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="shadow-sm">
                <Link to="/preparacao">
                  Iniciar diagnóstico gratuito <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#como-funciona">
                  <PlayCircle className="mr-1.5 h-4 w-4" /> Ver como funciona
                </a>
              </Button>
            </div>

            <ul className="mt-8 grid grid-cols-2 gap-2 sm:max-w-lg">
              {HERO_PILLS.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card/70 px-3 py-2 text-xs font-medium text-foreground shadow-[0_1px_0_oklch(0_0_0/4%)]"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Decorative "blueprint" card */}
          <div className="relative">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xl shadow-primary/5 sm:p-6">
              <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Ruler className="h-3.5 w-3.5 text-primary" /> Prancha · Casa Unifamiliar
                </span>
                <span className="rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-success">
                  Prévia
                </span>
              </div>
              <div
                className="mt-4 aspect-[4/3] w-full rounded-lg border border-border"
                style={{
                  backgroundImage:
                    "linear-gradient(color-mix(in oklab, var(--primary) 12%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--primary) 12%, transparent) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                  backgroundColor: "var(--surface)",
                }}
                aria-hidden
              >
                <div className="relative h-full w-full p-4">
                  <div className="absolute left-[10%] top-[18%] h-[58%] w-[62%] rounded-md border-2 border-primary/60 bg-primary/5" />
                  <div className="absolute left-[14%] top-[26%] h-[20%] w-[26%] rounded-sm border border-primary/40" />
                  <div className="absolute left-[44%] top-[26%] h-[20%] w-[26%] rounded-sm border border-primary/40" />
                  <div className="absolute left-[14%] top-[52%] h-[22%] w-[56%] rounded-sm border border-primary/40" />
                  <div className="absolute bottom-3 right-3 rounded-md border border-border bg-card px-2 py-1 text-[10px] font-medium text-foreground shadow-sm">
                    Conferência: 62%
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {PROJECT_ICONS.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1 rounded-md border border-border bg-surface px-2 py-2 text-center"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-medium text-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <main id="como-funciona" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Como funciona
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-foreground sm:text-3xl">
              Uma etapa por vez, com pendências visíveis
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Você responde itens objetivos sobre o projeto e recebe um diagnóstico preliminar
              do que ainda falta antes do protocolo. Sem planilhas, sem promessas.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/preparacao">
              Iniciar agora <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((s) => (
            <li
              key={s.id}
              className="group rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {s.number}
                </span>
                <span className="text-sm font-semibold text-foreground">{s.shortTitle}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {s.description}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-base font-semibold text-foreground">O que você recebe ao final</h3>
            <ul className="mt-3 grid gap-2 text-sm text-foreground sm:grid-cols-2">
              <li className="flex gap-2"><Check /> Prontidão geral do projeto</li>
              <li className="flex gap-2"><Check /> Lista de pendências a resolver</li>
              <li className="flex gap-2"><Check /> Risco de retrabalho estimado</li>
              <li className="flex gap-2"><Check /> Próximo passo sugerido</li>
            </ul>
            <div className="mt-5">
              <Button asChild>
                <Link to="/preparacao">
                  Iniciar diagnóstico gratuito <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <Disclaimer />
        </div>
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
          Projeto Fácil · Ferramenta orientativa. Não substitui o profissional responsável nem
          a análise oficial do órgão competente.
        </div>
      </footer>
    </div>
  );
}

function Check() {
  return (
    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3}>
        <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
