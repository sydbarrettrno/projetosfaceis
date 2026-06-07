import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  FileText,
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
import { registerDiagnosticLeadEvent, type DiagnosticLeadEventType } from "@/lib/diagnostico-lead";
import {
  clearDiagnosticDraft,
  createEmptyDiagnosticDraft,
  loadDiagnosticDraft,
  saveDiagnosticDraft,
  type DiagnosticStep,
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

type LeadErrorField = keyof LeadData | "termsAccepted";
type LeadErrors = Partial<Record<LeadErrorField, string>>;
type AnswerErrors = Partial<Record<"serviceType" | "currentSituation" | "priorProtocol", string>>;

const STEP_DETAILS: Record<DiagnosticStep, { number: number; progress: number }> = {
  questions: { number: 1, progress: 25 },
  preview: { number: 2, progress: 50 },
  contact: { number: 3, progress: 75 },
  result: { number: 4, progress: 100 },
};

function DiagnosticoPage() {
  const [draft, setDraft] = useState(createEmptyDiagnosticDraft);
  const [hydrated, setHydrated] = useState(false);
  const [leadErrors, setLeadErrors] = useState<LeadErrors>({});
  const [answerErrors, setAnswerErrors] = useState<AnswerErrors>({});
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [offerSubmitting, setOfferSubmitting] = useState<DiagnosticLeadEventType | null>(null);
  const [offerError, setOfferError] = useState("");

  useEffect(() => {
    setDraft(loadDiagnosticDraft());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveDiagnosticDraft(draft);
  }, [draft, hydrated]);

  const result = useMemo(() => {
    if (
      !draft.answers.serviceType ||
      !draft.answers.currentSituation ||
      !draft.answers.priorProtocol
    ) {
      return null;
    }
    return calculatePreliminaryDiagnosis(draft.answers);
  }, [draft.answers]);

  const updateLead = (field: keyof LeadData, value: string) => {
    setDraft((current) => ({
      ...current,
      lead: { ...current.lead, [field]: value },
    }));
    if (leadErrors[field]) {
      setLeadErrors((current) => ({ ...current, [field]: undefined }));
    }
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

    setDraft((current) => ({ ...current, step: "preview" }));
    scrollToTop();
  };

  const submitLead = async (event: FormEvent) => {
    event.preventDefault();
    const errors = validateLead(draft.lead, draft.termsAccepted);
    setLeadErrors(errors);
    setRegistrationError("");
    if (Object.keys(errors).length > 0 || !result) return;

    const normalizedLead = {
      name: draft.lead.name.trim(),
      whatsapp: draft.lead.whatsapp.trim(),
      email: draft.lead.email.trim(),
    };

    setLeadSubmitting(true);
    try {
      const { registeredAt } = await registerDiagnosticLeadEvent({
        type: "lead_registered",
        lead: normalizedLead,
        consent: {
          termsAccepted: true,
          marketingAccepted: draft.marketingAccepted,
        },
        answers: draft.answers,
        result: {
          attentionLevel: result.attentionLevel,
          probableIssueCount: result.possibleIssues.length,
        },
      });

      setDraft((current) => ({
        ...current,
        step: "result",
        lead: normalizedLead,
        leadRegisteredAt: registeredAt,
      }));
      scrollToTop();
    } catch {
      setRegistrationError(
        "O resultado foi liberado, mas não foi possível registrar seus dados neste dispositivo.",
      );
      setDraft((current) => ({
        ...current,
        step: "result",
        lead: normalizedLead,
      }));
      scrollToTop();
    } finally {
      setLeadSubmitting(false);
    }
  };

  const registerOfferInterest = async (
    type: "complete_report_interest" | "professional_review_interest",
  ) => {
    if (!result) return;

    setOfferSubmitting(type);
    setOfferError("");
    try {
      const { registeredAt } = await registerDiagnosticLeadEvent({
        type,
        lead: draft.lead,
        consent: {
          termsAccepted: true,
          marketingAccepted: draft.marketingAccepted,
        },
        answers: draft.answers,
        result: {
          attentionLevel: result.attentionLevel,
          probableIssueCount: result.possibleIssues.length,
        },
      });

      setDraft((current) =>
        type === "complete_report_interest"
          ? { ...current, reportRequestedAt: registeredAt }
          : {
              ...current,
              reviewRequested: true,
              reviewRequestedAt: registeredAt,
            },
      );
    } catch {
      setOfferError("Não foi possível registrar este interesse no dispositivo. Tente novamente.");
    } finally {
      setOfferSubmitting(null);
    }
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
    setRegistrationError("");
    setOfferError("");
    scrollToTop();
  };

  const stepDetails = STEP_DETAILS[draft.step];

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
            <span className="text-sm font-medium text-foreground">
              Etapa {stepDetails.number} de 4
            </span>
          </div>
          <Progress value={stepDetails.progress} className="mt-4 h-2" />
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-7">
            {draft.step === "questions" && (
              <form onSubmit={submitAnswers}>
                <StepHeading
                  eyebrow="Perguntas rápidas"
                  title="Conte em que ponto o caso está"
                  description="Marque apenas o que você sabe agora. Nenhum contato é solicitado nesta etapa."
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

                <div className="mt-7 flex justify-end">
                  <Button type="submit" size="lg">
                    Ver prévia do resultado <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}

            {draft.step === "preview" && result && (
              <div>
                <StepHeading
                  eyebrow="Prévia do resultado"
                  title="Sua orientação preliminar está pronta"
                  description="Veja uma prévia antes de decidir se quer acessar o resultado completo."
                />

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-surface p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Nível de atenção
                    </p>
                    <div className="mt-3">
                      <AttentionBadge level={result.attentionLevel} />
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-surface p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Pendências prováveis
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">
                      {result.possibleIssues.length}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-lg border border-primary/25 bg-primary/5 p-4">
                  <p className="text-sm font-medium text-foreground">
                    Preencha o cadastro mínimo para ver o resumo, as possíveis pendências e os
                    próximos passos.
                  </p>
                </div>

                <div className="mt-7 flex flex-wrap justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDraft((current) => ({ ...current, step: "questions" }))}
                  >
                    <ArrowLeft className="h-4 w-4" /> Revisar respostas
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => {
                      setDraft((current) => ({ ...current, step: "contact" }));
                      scrollToTop();
                    }}
                  >
                    Ver resultado completo <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {draft.step === "contact" && result && (
              <form onSubmit={submitLead} noValidate>
                <StepHeading
                  eyebrow="Cadastro mínimo"
                  title="Como podemos identificar seu diagnóstico?"
                  description="Nome, WhatsApp e e-mail são os únicos dados pessoais solicitados."
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

                  <div className="space-y-3 border-t border-border pt-5">
                    <label className="flex cursor-pointer items-start gap-3 text-sm text-foreground">
                      <Checkbox
                        checked={draft.termsAccepted}
                        onCheckedChange={(value) => {
                          const accepted = value === true;
                          setDraft((current) => ({
                            ...current,
                            termsAccepted: accepted,
                          }));
                          if (accepted) {
                            setLeadErrors((current) => ({
                              ...current,
                              termsAccepted: undefined,
                            }));
                          }
                        }}
                        aria-invalid={Boolean(leadErrors.termsAccepted)}
                        aria-describedby={
                          leadErrors.termsAccepted ? "terms-accepted-error" : undefined
                        }
                      />
                      <span>Li e aceito os Termos de Uso e a Política de Privacidade.</span>
                    </label>
                    {leadErrors.termsAccepted && (
                      <p id="terms-accepted-error" className="text-xs text-destructive">
                        {leadErrors.termsAccepted}
                      </p>
                    )}

                    <label className="flex cursor-pointer items-start gap-3 text-sm text-foreground">
                      <Checkbox
                        checked={draft.marketingAccepted}
                        onCheckedChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            marketingAccepted: value === true,
                          }))
                        }
                      />
                      <span>
                        Aceito receber contato sobre análise, relatório ou conferência profissional
                        por WhatsApp/e-mail.
                      </span>
                    </label>
                  </div>
                </div>

                <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
                  Nesta V01, os dados ficam registrados somente neste dispositivo. A integração de
                  envio ainda não está ativa.
                </p>

                {registrationError && (
                  <p className="mt-3 text-sm text-destructive" role="alert">
                    {registrationError}
                  </p>
                )}

                <div className="mt-7 flex flex-wrap justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDraft((current) => ({ ...current, step: "preview" }))}
                  >
                    <ArrowLeft className="h-4 w-4" /> Voltar à prévia
                  </Button>
                  <Button type="submit" size="lg" disabled={leadSubmitting}>
                    {leadSubmitting ? "Registrando..." : "Ver resultado completo"}
                    {!leadSubmitting && <ArrowRight className="h-4 w-4" />}
                  </Button>
                </div>
              </form>
            )}

            {draft.step === "result" && result && (
              <div>
                <StepHeading
                  eyebrow={`Diagnóstico de ${draft.lead.name}`}
                  title="Resultado preliminar"
                  description="Uma leitura inicial para ajudar você a decidir o que conferir primeiro."
                />

                {draft.leadRegisteredAt && (
                  <div
                    className="mt-5 rounded-lg border border-success/30 bg-success/10 p-4"
                    role="status"
                  >
                    <p className="text-sm text-foreground">
                      Seu interesse foi registrado neste dispositivo. A integração de envio ainda
                      não está ativa.
                    </p>
                  </div>
                )}
                {registrationError && (
                  <p className="mt-5 text-sm text-destructive" role="alert">
                    {registrationError}
                  </p>
                )}

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
                    Como você pode continuar
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Escolha o próximo passo mais adequado para o seu caso.
                  </p>

                  <div className="mt-5 grid gap-3">
                    <OfferCard
                      icon={<FileText className="h-4 w-4" />}
                      title="Relatório completo"
                      description="Registre seu interesse em uma leitura mais detalhada e organizada do caso."
                      action={
                        <Button
                          type="button"
                          variant="outline"
                          disabled={
                            Boolean(draft.reportRequestedAt) ||
                            offerSubmitting === "complete_report_interest"
                          }
                          onClick={() => registerOfferInterest("complete_report_interest")}
                        >
                          {draft.reportRequestedAt
                            ? "Interesse registrado"
                            : offerSubmitting === "complete_report_interest"
                              ? "Registrando..."
                              : "Tenho interesse no relatório"}
                        </Button>
                      }
                    />

                    <OfferCard
                      icon={<ClipboardCheck className="h-4 w-4" />}
                      title="Conferência profissional"
                      description={PROFESSIONAL_REVIEW_CTA}
                      action={
                        <Button
                          type="button"
                          disabled={
                            draft.reviewRequested ||
                            offerSubmitting === "professional_review_interest"
                          }
                          onClick={() => registerOfferInterest("professional_review_interest")}
                        >
                          {draft.reviewRequested
                            ? "Interesse registrado"
                            : offerSubmitting === "professional_review_interest"
                              ? "Registrando..."
                              : "Solicitar conferência"}
                        </Button>
                      }
                    />

                    <OfferCard
                      icon={<ArrowRight className="h-4 w-4" />}
                      title="Continuar na trilha completa"
                      description="Organize as informações e acompanhe as etapas da preparação orientativa."
                      action={
                        <Button asChild variant="outline">
                          <Link to="/preparacao">
                            Abrir trilha completa <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      }
                    />
                  </div>

                  {(draft.reportRequestedAt || draft.reviewRequested) && (
                    <p className="mt-4 text-xs leading-relaxed text-muted-foreground" role="status">
                      Seu interesse foi registrado neste dispositivo. A integração de envio ainda
                      não está ativa.
                    </p>
                  )}
                  {offerError && (
                    <p className="mt-4 text-sm text-destructive" role="alert">
                      {offerError}
                    </p>
                  )}
                </div>

                <div className="mt-7 border-t border-border pt-5">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setDraft((current) => ({ ...current, step: "questions" }))}
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
            {draft.step === "result" && (
              <Link
                to="/preparacao"
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 text-sm font-medium text-foreground hover:border-primary/40"
              >
                Continuar na trilha completa
                <ArrowRight className="h-4 w-4 text-primary" />
              </Link>
            )}
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

function OfferCard({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action: ReactNode;
}) {
  return (
    <article className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      <div className="mt-4">{action}</div>
    </article>
  );
}

function validateLead(lead: LeadData, termsAccepted: boolean): LeadErrors {
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
  if (!termsAccepted) {
    errors.termsAccepted = "Aceite os Termos de Uso e a Política de Privacidade para continuar.";
  }

  return errors;
}

function scrollToTop() {
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
