import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Building2,
  ClipboardList,
  FileSearch,
  Home,
  ListChecks,
  ShieldCheck,
} from "lucide-react";
import { Disclaimer } from "@/components/Disclaimer";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Projeto Fácil — Diagnóstico preliminar de projetos" },
      {
        name: "description",
        content:
          "Receba uma orientação inicial sobre possíveis pendências de uma casa residencial unifamiliar simples.",
      },
      {
        property: "og:title",
        content: "Projeto Fácil — Descomplicando Projetos",
      },
      {
        property: "og:description",
        content:
          "Identifique possíveis pendências e próximos passos antes de protocolar seu projeto.",
      },
      {
        property: "og:image",
        content: "/images/hero-casa-contemporanea.jpg",
      },
    ],
  }),
  component: HomePage,
});

const VALUE_POINTS = [
  "Resultado preliminar em poucos minutos",
  "Pendências e próximos passos visíveis",
  "Sem promessa de aprovação",
];

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section
        className="relative flex min-h-[max(500px,calc(100svh-140px))] items-center overflow-hidden border-b border-border bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/hero-casa-contemporanea.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black/45" aria-hidden />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="max-w-2xl text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
              Diagnóstico preliminar gratuito
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">
              Receba uma orientação inicial sobre possíveis pendências antes de protocolar seu
              projeto.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              Responda perguntas rápidas e veja um resumo do caso, o nível de atenção e os próximos
              passos para uma casa residencial unifamiliar simples.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="shadow-lg">
                <Link to="/diagnostico">
                  Iniciar diagnóstico gratuito <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Link
                to="/preparacao"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-white/50 bg-black/20 px-4 text-sm font-medium text-white backdrop-blur-sm hover:bg-black/35"
              >
                Abrir trilha completa <ListChecks className="h-4 w-4" />
              </Link>
            </div>

            <ul className="mt-7 flex max-w-xl flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-white/85">
              {VALUE_POINTS.map((point) => (
                <li key={point} className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Como funciona
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
              Valor primeiro, aprofundamento depois
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              O diagnóstico curto organiza o caso sem obrigar você a preencher toda a trilha antes
              de receber uma orientação útil.
            </p>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <Step
              number="1"
              icon={<ClipboardList className="h-5 w-5" />}
              title="Conte o básico"
              description="Informe seu contato e responda quatro perguntas objetivas."
            />
            <Step
              number="2"
              icon={<FileSearch className="h-5 w-5" />}
              title="Receba a orientação"
              description="Veja possíveis pendências, nível de atenção e próximos passos."
            />
            <Step
              number="3"
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Escolha como seguir"
              description="Continue na trilha gratuita ou registre interesse na conferência individual."
            />
          </div>
        </section>

        <section className="border-y border-border bg-surface">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Projeto começa com clareza
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
                Menos retrabalho na preparação
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Casas e edifícios dependem de informações coerentes, documentos conferidos e
                decisões técnicas registradas. Nesta versão, o fluxo funcional permanece limitado a
                casa residencial unifamiliar simples.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/diagnostico">
                    Começar agora <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/preparacao">
                    <ListChecks className="h-4 w-4" /> Ver as 7 etapas
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <figure className="overflow-hidden rounded-lg border border-border bg-card">
                <img
                  src="/images/casa-urbana.jpg"
                  alt="Casa urbana contemporânea de dois pavimentos"
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
                <figcaption className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                  <Home className="h-3.5 w-3.5 text-primary" />
                  Casa residencial unifamiliar
                </figcaption>
              </figure>
              <figure className="overflow-hidden rounded-lg border border-border bg-card">
                <img
                  src="/images/edificio-residencial.jpg"
                  alt="Edifício residencial contemporâneo com varandas arborizadas"
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
                <figcaption className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  Contexto visual de projetos residenciais
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-5 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Home className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Escopo funcional desta versão
                </p>
                <h2 className="mt-1 text-lg font-semibold text-foreground">
                  Casa Residencial Unifamiliar
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Diagnóstico curto e trilha detalhada para preparação e conferência orientativa,
                  sem garantir aprovação.
                </p>
              </div>
            </div>
          </div>
          <Disclaimer compact />
        </section>
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
          Projeto Fácil · Auxílio de preparação e conferência. Não substitui o profissional
          responsável nem a análise oficial do órgão competente.
        </div>
      </footer>
    </div>
  );
}

function Step({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-primary">{icon}</span>
        <span className="text-xs font-semibold text-muted-foreground">{number}/3</span>
      </div>
      <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </article>
  );
}
