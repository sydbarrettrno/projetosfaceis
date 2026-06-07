import {
  DOCUMENT_OPTIONS,
  PRIOR_PROTOCOL_OPTIONS,
  SERVICE_OPTIONS,
  SITUATION_OPTIONS,
  createEmptyAnswers,
  type CurrentSituation,
  type DiagnosticAnswers,
  type DocumentId,
  type LeadData,
  type PriorProtocol,
  type ServiceType,
} from "@/data/diagnostico";

const STORAGE_KEY = "projeto-facil-diagnostico-v02";

export type DiagnosticStep = "questions" | "preview" | "contact" | "result";

export interface DiagnosticDraft {
  step: DiagnosticStep;
  lead: LeadData;
  termsAccepted: boolean;
  marketingAccepted: boolean;
  leadRegisteredAt?: string;
  reportRequestedAt?: string;
  answers: DiagnosticAnswers;
  reviewRequested: boolean;
  reviewRequestedAt?: string;
}

export function createEmptyDiagnosticDraft(): DiagnosticDraft {
  return {
    step: "questions",
    lead: {
      name: "",
      whatsapp: "",
      email: "",
    },
    termsAccepted: false,
    marketingAccepted: false,
    answers: createEmptyAnswers(),
    reviewRequested: false,
  };
}

export function loadDiagnosticDraft(): DiagnosticDraft {
  if (typeof window === "undefined") return createEmptyDiagnosticDraft();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyDiagnosticDraft();

    const parsed = JSON.parse(raw) as Partial<DiagnosticDraft>;
    const empty = createEmptyDiagnosticDraft();
    const documents = Array.isArray(parsed.answers?.documents)
      ? parsed.answers.documents.filter(isDocumentId)
      : [];
    const answers: DiagnosticAnswers = {
      serviceType: isServiceType(parsed.answers?.serviceType)
        ? parsed.answers.serviceType
        : empty.answers.serviceType,
      currentSituation: isCurrentSituation(parsed.answers?.currentSituation)
        ? parsed.answers.currentSituation
        : empty.answers.currentSituation,
      documents,
      priorProtocol: isPriorProtocol(parsed.answers?.priorProtocol)
        ? parsed.answers.priorProtocol
        : empty.answers.priorProtocol,
    };
    const hasRequiredAnswers = Boolean(
      answers.serviceType && answers.currentSituation && answers.priorProtocol,
    );
    const requestedStep = isDiagnosticStep(parsed.step) ? parsed.step : "questions";
    const hasLead =
      typeof parsed.lead?.name === "string" &&
      parsed.lead.name.trim().length >= 2 &&
      typeof parsed.lead?.whatsapp === "string" &&
      typeof parsed.lead?.email === "string";
    const step = !hasRequiredAnswers
      ? "questions"
      : requestedStep === "result" && (!hasLead || parsed.termsAccepted !== true)
        ? "contact"
        : requestedStep;

    return {
      step,
      lead: {
        name: typeof parsed.lead?.name === "string" ? parsed.lead.name : "",
        whatsapp: typeof parsed.lead?.whatsapp === "string" ? parsed.lead.whatsapp : "",
        email: typeof parsed.lead?.email === "string" ? parsed.lead.email : "",
      },
      termsAccepted: parsed.termsAccepted === true,
      marketingAccepted: parsed.marketingAccepted === true,
      leadRegisteredAt:
        typeof parsed.leadRegisteredAt === "string" ? parsed.leadRegisteredAt : undefined,
      reportRequestedAt:
        typeof parsed.reportRequestedAt === "string" ? parsed.reportRequestedAt : undefined,
      answers,
      reviewRequested: parsed.reviewRequested === true,
      reviewRequestedAt:
        typeof parsed.reviewRequestedAt === "string" ? parsed.reviewRequestedAt : undefined,
    };
  } catch {
    return createEmptyDiagnosticDraft();
  }
}

export function saveDiagnosticDraft(draft: DiagnosticDraft) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // The diagnostic remains usable when local storage is unavailable.
  }
}

export function clearDiagnosticDraft() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing else is required when local storage is unavailable.
  }
}

const serviceTypes = new Set(SERVICE_OPTIONS.map((option) => option.value));
const currentSituations = new Set(SITUATION_OPTIONS.map((option) => option.value));
const priorProtocols = new Set(PRIOR_PROTOCOL_OPTIONS.map((option) => option.value));
const documentIds = new Set(DOCUMENT_OPTIONS.map((option) => option.value));

function isServiceType(value: unknown): value is ServiceType {
  return typeof value === "string" && serviceTypes.has(value as ServiceType);
}

function isCurrentSituation(value: unknown): value is CurrentSituation {
  return typeof value === "string" && currentSituations.has(value as CurrentSituation);
}

function isPriorProtocol(value: unknown): value is PriorProtocol {
  return typeof value === "string" && priorProtocols.has(value as PriorProtocol);
}

function isDocumentId(value: unknown): value is DocumentId {
  return typeof value === "string" && documentIds.has(value as DocumentId);
}

function isDiagnosticStep(value: unknown): value is DiagnosticStep {
  return value === "questions" || value === "preview" || value === "contact" || value === "result";
}
