import type { AttentionLevel, DiagnosticAnswers, LeadData } from "@/data/diagnostico";

const LOCAL_EVENT_QUEUE_KEY = "projeto-facil-diagnostico-eventos-v01";

export type DiagnosticLeadEventType =
  | "lead_registered"
  | "complete_report_interest"
  | "professional_review_interest";

export interface DiagnosticLeadEvent {
  id: string;
  type: DiagnosticLeadEventType;
  source: "/diagnostico";
  createdAt: string;
  lead: LeadData;
  consent: {
    termsAccepted: true;
    marketingAccepted: boolean;
  };
  answers: DiagnosticAnswers;
  result: {
    attentionLevel: AttentionLevel;
    probableIssueCount: number;
  };
}

export type DiagnosticLeadEventInput = Omit<DiagnosticLeadEvent, "id" | "source" | "createdAt">;

export interface DiagnosticLeadGateway {
  submit(input: DiagnosticLeadEventInput): Promise<{ registeredAt: string }>;
}

class LocalDiagnosticLeadGateway implements DiagnosticLeadGateway {
  async submit(input: DiagnosticLeadEventInput) {
    const registeredAt = new Date().toISOString();
    const event: DiagnosticLeadEvent = {
      ...input,
      id: createEventId(),
      source: "/diagnostico",
      createdAt: registeredAt,
    };

    const current = readLocalQueue();
    window.localStorage.setItem(LOCAL_EVENT_QUEUE_KEY, JSON.stringify([...current, event]));

    return { registeredAt };
  }
}

// This adapter can be replaced by Supabase, a webhook, a spreadsheet service, or an API endpoint.
const gateway: DiagnosticLeadGateway = new LocalDiagnosticLeadGateway();

export function registerDiagnosticLeadEvent(input: DiagnosticLeadEventInput) {
  return gateway.submit(input);
}

function readLocalQueue(): DiagnosticLeadEvent[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_EVENT_QUEUE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DiagnosticLeadEvent[]) : [];
  } catch {
    return [];
  }
}

function createEventId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `diagnostico-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
