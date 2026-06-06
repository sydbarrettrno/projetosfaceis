import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  calculatePreliminaryDiagnosis,
  DOCUMENT_OPTIONS,
  PRELIMINARY_DISCLAIMER,
  PRIOR_PROTOCOL_OPTIONS,
  PROFESSIONAL_REVIEW_CTA,
  SERVICE_OPTIONS,
  SITUATION_OPTIONS,
  type AttentionLevel,
  type CurrentSituation,
  type DocumentId,
  type LeadData,
  type PriorProtocol,
  type ServiceType,
} from "@/data/diagnostico";
import {
  clearDiagnosticDraft,
  createEmptyDiagnosticDraft,
  loadDiagnosticDraft,
  saveDiagnosticDraft,
} from "@/lib/diagnostico-state";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/diagnostico")({
  head: () => ({
    meta: [
      { title: "Diagnóstico preliminar — Projeto Fácil" },
      {
        name: "description",
        content:
          "Orientação inicial sobre possíveis pendências de projeto residencial unifamiliar.",
      },
    ],
  }),
  component: DiagnosticoPage,
});

type LeadErrors = Partial<Record<keyof LeadData, string>>;
type AnswerErrors = Partial<Record<"serviceType" | "currentSituation" | "priorProtocol", string>>;

function DiagnosticoPage() {
  const [draft, setDraft] = useState(createEmptyDiagnosticDraft);
  const [hydrated, setHydrated] = useState(false);
  const [leadErrors, setLeadErrors] = useState<LeadErrors>({});
  const [answerErrors, setAnswerErrors] = useState<AnswerErrors>({});

  useEffect(() => {
    setDraft(loadDiagnosticDraft());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveDiagnosticDraft(draft);
  }, [draft, hydrated]);

  const result = useMemo(() => {
    if (
      draft.step !== 3 ||
      !draft.answers.serviceType ||
      !draft.answers.currentSituation ||
      !draft.answers.priorProtocol
    ) {
      return null;
    }
    return calculatePreliminaryDiagnosis(draft.answers);
  }, [draft.answers, draft.step]);

  const updateLead = (field: keyof LeadData, value: string) => {
    setDraft((current) => ({
      ...current,
      lead: { ...current.lead, [field]: value },
    }));
    if (leadErrors[field]) {
      setLeadErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const submitLead = (event: FormEvent) => {
    event.preventDefault();
    const errors = validateLead(draft.lead);
    setLeadErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setDraft((current) => ({ ...current, step: 2 }));
    scrollToTop();
  };

  const submitAnswers = (event: FormEvent) => {
    event.preventDefault();
    const errors: AnswerErrors = {};
    if (!draft.answers.serviceType) {
      errors.serviceType = "Selecione o tipo de serviço para continuar.";
    }
    if (!draft.answers.currentSituation) {
      errors.currentSituation = "Informe a situação atual do caso.";
    }
    if (!draft.answers.priorProtocol) {
      errors.priorProtocol = "Informe se já houve protocolo ou pendência anterior.";
    }
    setAnswerErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setDraft((current) => ({ ...current, step: 3 }));
    scrollToTop();
  };

  const toggleDocument = (documentId: DocumentId, checked: boolean) => {
    setDraft((current) => {
      const documents = checked
        ? Array.from(new Set([...current.answers.documents, documentId]))
        : current.answers.documents.filter((id) => id !== documentId);
      return {
        ...current,
        answers: { ...current.answers, documents },
      };
    });
  };

  const resetDiagnostic = () => {
    clearDiagnosticDraft();
    setDraft(createEmptyDiagnosticDraft());
    setLeadErrors({});
    setAnswerErrors({});
    scrollToTop();
  };

  const progress = draft.step === 1 ? 33 : draft.step === 2 ? 67 : 100;

  return (
    <div className="min-h-screen bg-background pb-16">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Início
          </Link>
          <Button type="button" variant="ghost" size="sm" onClick={resetDiagnostic}>
            <RotateCcw className="h-3.5 w-3.5" /> Recomeçar
          </Button>
        </div>

        <header className="mt-4 border-b border-border pb-5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Diagnóstico gratuito · Casa residencial unifamiliar simples
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
                Orientação inicial do seu caso
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Responda perguntas objetivas para identificar possíveis pendências e organizar os
                próximos passos.
              </p>
            </div>
            <span className="text-sm font-medium text-foreground">Etapa {draft.step} de 3</span>
          </div>
          <Progress value={progress} className="mt-4 h-2" />
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-7">
            {draft.step === 1 && (
              <form onSubmit={submitLead} noValidate>
                <StepHeading
                  eyebrow="Cadastro mínimo"
                  title="Como podemos identificar seu diagnóstico?"
                  description="Estes dados ficam salvos somente neste dispositivo nesta versão."
                />

                <div className="mt-6 grid gap-5">
                  <Field
                    id="lead-name"
                    label="Nome"
                    error={leadErrors.name}
                    input={
                      <Input
                        id="lead-name"
                        autoComplete="name"
                        value={draft.lead.name}
                        onChange={(event) => updateLead("name", event.target.value)}
                        placeholder="Ex.: Ana Souza"
                        aria-invalid={Boolean(leadErrors.name)}
                        aria-describedby={leadErrors.name ? "lead-name-error" : undefined}
                      />
                    }
                  />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      id="lead-whatsapp"
                      label="WhatsApp"
                      error={leadErrors.whatsapp}
                      input={
                        <Input
                          id="lead-whatsapp"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          value={draft.lead.whatsapp}
                          onChange={(event) => updateLead("whatsapp", event.target.value)}
                          placeholder="Ex.: (11) 99999-9999"
                          aria-invalid={Boolean(leadErrors.whatsapp)}
                          aria-describedby={leadErrors.whatsapp ? "lead-whatsapp-error" : undefined}
                        />
                      }
                    />
                    <Field
                      id="lead-email"
                      label="E-mail"
                      error={leadErrors.email}
                      input={
                        <Input
                          id="lead-email"
                          type="email"
                          autoComplete="email"
                          value={draft.lead.email}
                          onChange={(event) => updateLead("email", event.target.value)}
                          placeholder="Ex.: ana@email.com"
                          aria-invalid={Boolean(leadErrors.email)}
                          aria-describedby={leadErrors.email ? "lead-email-error" : undefined}
                        />
                      }
                    />
                  </div>
                </div>

                <div className="mt-7 flex justify-end">
                  <Button type="submit" size="lg">
                    Continuar <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}

            {draft.step === 2 && (
              <form onSubmit={submitAnswers}>
                <StepHeading
                  eyebrow="Perguntas rápidas"
                  title="Conte em que ponto o caso está"
                  description="Marque apenas o que você sabe agora. O resultado não pressupõe que os documentos foram validados."
                />

                <div className="mt-6 space-y-7">
                  <RadioQuestion
                    id="service-type"
                    label="Qual é o tipo de serviço?"
                    value={draft.answers.serviceType}
                    options={SERVICE_OPTIONS}
                    error={answerErrors.serviceType}
                    onChange={(value) => {
                      setDraft((current) => ({
                        ...current,
                        answers: {
                          ...current.answers,
                          serviceType: value as ServiceType,
                        },
                      }));
                      setAnswerErrors((current) => ({
                        ...current,
                        serviceType: undefined,
                      }));
                    }}
                  />

                  <RadioQuestion
                    id="current-situation"
                    label="Qual é a situação atual?"
                    value={draft.answers.currentSituation}
                    options={SITUATION_OPTIONS}
                    error={answerErrors.currentSituation}
                    onChange={(value) => {
                      setDraft((current) => ({
                        ...current,
                        answers: {
                          ...current.answers,
                          currentSituation: value as CurrentSituation,
                        },
                      }));
                      setAnswerErrors((current) => ({
                        ...current,
                        currentSituation: undefined,
                      }));
                    }}
                  />

                  <fieldset>
                    <legend className="text-sm font-semibold text-foreground">
                      Quais documentos você já possui?
                    </legend>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Você pode deixar todos desmarcados.
                    </p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {DOCUMENT_OPTIONS.map((option) => {
                        const checked = draft.answers.documents.includes(option.value);
                        return (
                          <label
                            key={option.value}
                            className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-surface px-3 py-3 text-sm text-foreground hover:border-primary/40"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) =>
                                toggleDocument(option.value, value === true)
                              }
                              aria-label={option.label}
                            />
                            <span>{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  <RadioQuestion
                    id="prior-protocol"
                    label="Já houve pendência ou protocolo anterior?"
                    value={draft.answers.priorProtocol}
                    options={PRIOR_PROTOCOL_OPTIONS}
                    error={answerErrors.priorProtocol}
                    onChange={(value) => {
                      setDraft((current) => ({
                        ...current,
                        answers: {
                          ...current.answers,
                          priorProtocol: value as PriorProtocol,
                        },
                      }));
                      setAnswerErrors((current) => ({
                        ...current,
                        priorProtocol: undefined,
                      }));
                    }}
                  />
                </div>

                <div className="mt-7 flex flex-wrap justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDraft((current) => ({ ...current, step: 1 }))}
                  >
                    <ArrowLeft className="h-4 w-4" /> Voltar
                  </Button>
                  <Button type="submit" size="lg">
                    Ver diagnóstico preliminar <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}

            {draft.step === 3 && result && (
              <div>
                <StepHeading
                  eyebrow={`Diagnóstico de ${draft.lead.name}`}
                  title="Resultado preliminar"
                  description="Uma leitura inicial para ajudar você a decidir o que conferir primeiro."
                />

                <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-border py-4">
                  <span className="text-sm text-muted-foreground">Nível de atenção</span>
                  <AttentionBadge level={result.attentionLevel} />
                </div>

                <ResultSection title="Resumo do caso">
                  <p className="text-sm leading-relaxed text-foreground">{result.summary}</p>
                </ResultSection>

                <ResultSection title="Possíveis pendências">
                  <ResultList items={result.possibleIssues} />
                </ResultSection>

                <ResultSection title="Próximos passos">
                  <ResultList items={result.nextSteps} ordered />
                </ResultSection>

                <div className="mt-7 rounded-lg border border-warning/40 bg-warning/10 p-4">
                  <p className="text-sm leading-relaxed text-warning-foreground">
                    {PRELIMINARY_DISCLAIMER}
                  </p>
                </div>

                <div className="mt-7 border-t border-border pt-7">
                  <h2 className="text-lg font-semibold text-foreground">
                    Conferência profissional
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {PROFESSIONAL_REVIEW_CTA}
                  </p>
                  <Button
                    type="button"
                    size="lg"
                    className="mt-4 w-full sm:w-auto"
                    disabled={draft.reviewRequested}
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        reviewRequested: true,
                        reviewRequestedAt: new Date().toISOString(),
                      }))
                    }
                  >
                    <ClipboardCheck className="h-4 w-4" />
                    {draft.reviewRequested
                      ? "Interesse registrado"
                      : "Solicitar conferência profissional"}
                  </Button>
                  {draft.reviewRequested && (
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground" role="status">
                      Interesse salvo neste dispositivo. Nenhuma solicitação foi enviada: a
                      integração comercial ainda não está ativa nesta V01.
                    </p>
                  )}
                </div>

                <div className="mt-7 flex flex-wrap gap-3 border-t border-border pt-5">
                  <Button asChild variant="outline">
                    <Link to="/preparacao">
                      Abrir trilha completa <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setDraft((current) => ({ ...current, step: 2 }))}
                  >
                    Revisar respostas
                  </Button>
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-primary">
                <FileSearch className="h-4 w-4" />
                <h2 className="text-sm font-semibold">O que você recebe</h2>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Resumo objetivo do caso informado.</li>
                <li>Possíveis pontos que merecem conferência.</li>
                <li>Nível de atenção e próximos passos.</li>
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-center gap-2 text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Limite desta análise</h2>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                O diagnóstico usa somente as respostas fornecidas. Nenhum documento é enviado, lido
                ou validado nesta etapa.
              </p>
            </div>
            <Link
              to="/preparacao"
              className="flex items-center justify-between rounded-lg border border-border bg-card p-4 text-sm font-medium text-foreground hover:border-primary/40"
            >
              Já quero usar a trilha completa
              <ArrowRight className="h-4 w-4 text-primary" />
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}

function StepHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  input,
}: {
  id: string;
  label: string;
  error?: string;
  input: ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-2">{input}</div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function RadioQuestion({
  id,
  label,
  value,
  options,
  error,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="text-sm font-semibold text-foreground">{label}</legend>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="mt-3 grid gap-2 sm:grid-cols-2"
        aria-invalid={Boolean(error)}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-surface px-3 py-3 text-sm text-foreground hover:border-primary/40"
          >
            <RadioGroupItem value={option.value} aria-label={option.label} />
            <span>{option.label}</span>
          </label>
        ))}
      </RadioGroup>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function AttentionBadge({ level }: { level: AttentionLevel }) {
  const styles = {
    baixo: "border-success/30 bg-success/10 text-success",
    moderado: "border-warning/40 bg-warning/15 text-warning-foreground",
    alto: "border-destructive/30 bg-destructive/10 text-destructive",
  }[level];

  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2.5 py-1 text-sm font-semibold capitalize",
        styles,
      )}
    >
      {level}
    </span>
  );
}

function ResultSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function ResultList({ items, ordered }: { items: string[]; ordered?: boolean }) {
  const Component = ordered ? "ol" : "ul";
  return (
    <Component className="space-y-2">
      {items.map((item, index) => (
        <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
          {ordered ? (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
              {index + 1}
            </span>
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          )}
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </Component>
  );
}

function validateLead(lead: LeadData): LeadErrors {
  const errors: LeadErrors = {};
  const name = lead.name.trim();
  const whatsappDigits = Array.from(lead.whatsapp).filter((char) =>
    "0123456789".includes(char),
  ).length;
  const email = lead.email.trim();
  const atIndex = email.indexOf("@");
  const dotIndex = email.lastIndexOf(".");

  if (name.length < 2) {
    errors.name = "Informe seu nome para identificar o diagnóstico.";
  }
  if (whatsappDigits < 10) {
    errors.whatsapp = "Informe um WhatsApp com DDD.";
  }
  if (atIndex <= 0 || dotIndex <= atIndex + 1 || dotIndex === email.length - 1) {
    errors.email = "Informe um e-mail válido. Exemplo: nome@email.com.";
  }

  return errors;
}

function scrollToTop() {
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
