import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ArrowRight, FileText } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { CATEGORIES, CHECKLISTS, type ChecklistCategory } from "@/data/checklists";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Portal de Checklists Técnicos" },
      {
        name: "description",
        content:
          "Consulte e utilize checklists técnicos para análise e aprovação de projetos municipais.",
      },
      { property: "og:title", content: "Portal de Checklists Técnicos" },
      {
        property: "og:description",
        content: "Checklists organizados para analistas técnicos de projetos municipais.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<ChecklistCategory | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CHECKLISTS.filter((c) => {
      const matchesQ =
        !q || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
      const matchesC = active === "all" || c.category === active;
      return matchesQ && matchesC;
    });
  }, [query, active]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Análise técnica · Projetos municipais
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
            Checklists técnicos centralizados,
            <br className="hidden sm:block" /> organizados e prontos para uso.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Localize rapidamente o checklist adequado ao tipo de projeto, conduza a
            conferência item a item e acompanhe o progresso da análise.
          </p>

          <div className="mt-6 flex max-w-xl items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-ring">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar checklist por nome (ex.: casa, comércio, demolição...)"
              className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              aria-label="Buscar checklist"
            />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap gap-2">
          <CategoryChip active={active === "all"} onClick={() => setActive("all")}>
            Todos
          </CategoryChip>
          {CATEGORIES.map((c) => (
            <CategoryChip key={c} active={active === c} onClick={() => setActive(c)}>
              {c}
            </CategoryChip>
          ))}
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          {filtered.length} checklist{filtered.length === 1 ? "" : "s"} disponível
          {filtered.length === 1 ? "" : "is"}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Link
              key={c.id}
              to="/checklist/$id"
              params={{ id: c.id }}
              className="group flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <span className="text-2xl" aria-hidden>
                  {c.icon}
                </span>
                <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {c.category}
                </span>
              </div>
              <h3 className="mt-3 text-base font-semibold text-foreground">{c.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  Versão {c.version}
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-primary group-hover:gap-1.5 transition-all">
                  Abrir <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-10 rounded-lg border border-dashed border-border bg-surface p-10 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum checklist encontrado para os filtros atuais.
            </p>
            <Button
              variant="ghost"
              className="mt-3"
              onClick={() => {
                setQuery("");
                setActive("all");
              }}
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </main>

      <footer className="mt-12 border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
          MVP Fase 1 · Visualização e conferência de checklists. Sem análise automática.
        </div>
      </footer>
    </div>
  );
}

function CategoryChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent",
      )}
    >
      {children}
    </button>
  );
}
