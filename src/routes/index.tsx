import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Home, ListChecks, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Disclaimer } from "@/components/Disclaimer";
import { Button } from "@/components/ui/button";
import { STAGES } from "@/data/trilha";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Projeto Fácil — Descomplicando Projetos" },
      {
        name: "description",
        content:
          "Trilha guiada de preparação de protocolo para projeto de casa residencial unifamiliar simples.",
      },
      { property: "og:title", content: "Projeto Fácil — Descomplicando Projetos" },
      {
        property: "og:description",
        content: "Prepare e confira seu projeto de casa unifamiliar etapa por etapa.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Trilha guiada de preparação
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-foreground sm:text-5xl">
            Projeto Fácil
          </h1>
          <p className="mt-2 text-base font-medium text-muted-foreground sm:text-lg">
            Descomplicando Projetos
          </p>
          <p className="mt-5 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Um caminho passo a passo para organizar e conferir a documentação do seu projeto
            de casa antes do protocolo. Sem planilhas longas, uma etapa por vez.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Home className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <span className="inline-flex rounded-md border border-border bg-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Único módulo desta versão
                </span>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">
                  Casa Residencial Unifamiliar
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Preparação de protocolo para projeto simples de casa residencial unifamiliar.
                  Siga as etapas e marque cada item à medida que conferir.
                </p>
              </div>
            </div>

            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {STAGES.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                    {s.number}
                  </span>
                  {s.shortTitle}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link to="/preparacao">
                  Iniciar preparação <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <ListChecks className="h-3.5 w-3.5" /> 7 etapas + resultado de conferência
              </span>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Como funciona
                </span>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-foreground">
                <li>• Uma etapa por vez, sem excesso de informação.</li>
                <li>• Cada item mostra o que é, onde conseguir e como apresentar.</li>
                <li>• Marque como conferido, pendente ou não se aplica.</li>
                <li>• Acompanhe o progresso e veja o resultado ao final.</li>
              </ul>
            </div>
            <Disclaimer />
          </aside>
        </div>
      </main>

      <footer className="mt-8 border-t border-border bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
          Projeto Fácil · Auxílio de preparação. Não substitui o profissional responsável nem
          a análise oficial do órgão competente.
        </div>
      </footer>
    </div>
  );
}
