import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { STAGES } from "@/data/trilha";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/piloto")({
  head: () => ({
    meta: [
      { title: "Piloto de análise — Projeto Fácil" },
      {
        name: "description",
        content: "Piloto de análise técnica binária para casa residencial unifamiliar.",
      },
    ],
  }),
  component: PilotoPage,
});

type ReviewStatus = "not_reviewed" | "compliant" | "error" | "not_applicable";

interface ReviewState {
  status: ReviewStatus;
  error: string;
  location: string;
}

const EMPTY_REVIEW: ReviewState = {
  status: "not_reviewed",
  error: "",
  location: "",
};

function PilotoPage() {
  const [reviews, setReviews] = useState<Record<string, ReviewState>>({});
  const [showResult, setShowResult] = useState(false);

  const items = useMemo(
    () =>
      STAGES.flatMap((stage) =>
        stage.items.map((item) => ({
          key: `${stage.id}::${item.id}`,
          stage,
          item,
        })),
      ),
    [],
  );

  const getReview = (key: string) => reviews[key] ?? EMPTY_REVIEW;

  const updateReview = (key: string, patch: Partial<ReviewState>) => {
    setReviews((current) => {
      const next = { ...(current[key] ?? EMPTY_REVIEW), ...patch };
      if (next.status !== "error") {
        next.error = "";
        next.location = "";
      }
      return { ...current, [key]: next };
    });
    setShowResult(false);
  };

  const errors = items.filter(({ key }) => getReview(key).status === "error");
  const allReviewed = items.every(({ key }) => getReview(key).status !== "not_reviewed");
  const allErrorsComplete = errors.every(({ key }) => {
    const review = getReview(key);
    return review.error.trim().length > 0 && review.location.trim().length > 0;
  });
  const ready = allReviewed && allErrorsComplete;
  const result = errors.length === 0 ? "DEFERIDO." : "INDEFERIDO.";

  const reset = () => {
    setReviews({});
    setShowResult(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Início
          </Link>
          <Button type="button" variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" /> Reiniciar
          </Button>
        </div>

        <header className="mt-5 border-b border-border pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Piloto · Casa Residencial Unifamiliar
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            Análise técnica padronizada
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            As categorias existentes foram mantidas. Avalie cada item e registre descrição e local
            somente quando houver erro.
          </p>
        </header>

        <div className="mt-6 space-y-6">
          {STAGES.map((stage) => (
            <section key={stage.id} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="border-b border-border bg-surface px-4 py-3 sm:px-5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Categoria {stage.number}
                </p>
                <h2 className="mt-0.5 text-base font-semibold text-foreground">{stage.title}</h2>
              </div>

              <div className="divide-y divide-border">
                {stage.items.map((item) => {
                  const key = `${stage.id}::${item.id}`;
                  const review = getReview(key);
                  return (
                    <article key={item.id} className="p-4 sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                        <span className="text-xs text-muted-foreground">{item.id}</span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <ReviewButton
                          active={review.status === "compliant"}
                          onClick={() => updateReview(key, { status: "compliant" })}
                        >
                          Atende
                        </ReviewButton>
                        <ReviewButton
                          active={review.status === "error"}
                          tone="error"
                          onClick={() => updateReview(key, { status: "error" })}
                        >
                          Erro
                        </ReviewButton>
                        <ReviewButton
                          active={review.status === "not_applicable"}
                          tone="muted"
                          onClick={() => updateReview(key, { status: "not_applicable" })}
                        >
                          Não se aplica
                        </ReviewButton>
                      </div>

                      {review.status === "error" && (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor={`${key}-error`}
                              className="text-xs font-medium text-foreground"
                            >
                              Descrição objetiva do erro
                            </label>
                            <Textarea
                              id={`${key}-error`}
                              value={review.error}
                              onChange={(event) =>
                                updateReview(key, { error: event.target.value })
                              }
                              placeholder="Ex.: Recuo frontal inferior ao mínimo exigido."
                              className="mt-1 min-h-20 resize-none"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor={`${key}-location`}
                              className="text-xs font-medium text-foreground"
                            >
                              Local exato da evidência
                            </label>
                            <Input
                              id={`${key}-location`}
                              value={review.location}
                              onChange={(event) =>
                                updateReview(key, { location: event.target.value })
                              }
                              placeholder="Ex.: Prancha 02, implantação, cota frontal de 3,20 m."
                              className="mt-1"
                            />
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-7 rounded-xl border border-border bg-card p-5 sm:p-6">
          {!ready && (
            <p className="text-sm text-muted-foreground">
              Avalie todos os itens e complete a descrição e o local de cada erro para gerar o
              resultado.
            </p>
          )}

          <Button
            type="button"
            className="mt-4"
            disabled={!ready}
            onClick={() => setShowResult(true)}
          >
            Gerar resultado
          </Button>

          {showResult && ready && (
            <div className="mt-6 border-t border-border pt-6" aria-live="polite">
              <p className="text-2xl font-bold tracking-tight text-foreground">{result}</p>

              {errors.length > 0 && (
                <div className="mt-6 space-y-5">
                  {errors.map(({ key }, index) => {
                    const review = getReview(key);
                    return (
                      <div key={key}>
                        <p className="text-sm font-medium text-foreground">
                          Item {String(index + 1).padStart(2, "0")} — {review.error.trim()}
                        </p>
                        <p className="mt-1 text-sm text-foreground">
                          Local: {review.location.trim()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function ReviewButton({
  active,
  tone = "default",
  children,
  onClick,
}: {
  active: boolean;
  tone?: "default" | "error" | "muted";
  children: ReactNode;
  onClick: () => void;
}) {
  const activeClass = {
    default: "border-success bg-success text-success-foreground",
    error: "border-destructive bg-destructive text-destructive-foreground",
    muted: "border-muted-foreground/40 bg-muted text-foreground",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border px-3 py-1.5 text-xs font-medium transition",
        active
          ? activeClass
          : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
