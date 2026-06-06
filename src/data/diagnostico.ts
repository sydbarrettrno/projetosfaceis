export type ServiceType = "projeto_novo" | "regularizacao" | "reforma_ampliacao" | "retomada";

export type CurrentSituation = "inicio" | "reunindo_documentos" | "projeto_pronto" | "protocolado";

export type PriorProtocol = "nao" | "sem_pendencia" | "com_pendencia" | "devolvido";

export type DocumentId =
  | "matricula"
  | "documentos_proprietario"
  | "projeto_arquitetonico"
  | "art_rrt"
  | "formularios_municipais";

export type AttentionLevel = "baixo" | "moderado" | "alto";

export interface LeadData {
  name: string;
  whatsapp: string;
  email: string;
}

export interface DiagnosticAnswers {
  serviceType: ServiceType | "";
  currentSituation: CurrentSituation | "";
  documents: DocumentId[];
  priorProtocol: PriorProtocol | "";
}

export interface DiagnosticResult {
  attentionLevel: AttentionLevel;
  summary: string;
  possibleIssues: string[];
  nextSteps: string[];
}

export const PRELIMINARY_DISCLAIMER =
  "Este diagnóstico é preliminar e orientativo. Ele ajuda a identificar possíveis pendências e próximos passos, mas não substitui análise técnica individual, conferência documental ou aprovação pelo órgão competente.";

export const PROFESSIONAL_REVIEW_CTA =
  "Quer uma análise completa? Podemos revisar seu caso individualmente, conferir documentos e gerar um relatório técnico mais detalhado para reduzir riscos antes do protocolo.";

export const SERVICE_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: "projeto_novo", label: "Projeto novo" },
  { value: "regularizacao", label: "Regularização de construção existente" },
  { value: "reforma_ampliacao", label: "Reforma ou ampliação" },
  { value: "retomada", label: "Retomar caso com protocolo ou pendência anterior" },
];

export const SITUATION_OPTIONS: { value: CurrentSituation; label: string }[] = [
  { value: "inicio", label: "Estou começando e ainda preciso me organizar" },
  { value: "reunindo_documentos", label: "Já estou reunindo documentos" },
  { value: "projeto_pronto", label: "Já tenho projeto ou documentação técnica" },
  { value: "protocolado", label: "O caso já foi protocolado" },
];

export const DOCUMENT_OPTIONS: { value: DocumentId; label: string }[] = [
  { value: "matricula", label: "Matrícula ou documento do imóvel" },
  { value: "documentos_proprietario", label: "Documentos do proprietário" },
  { value: "projeto_arquitetonico", label: "Projeto arquitetônico" },
  { value: "art_rrt", label: "ART ou RRT" },
  { value: "formularios_municipais", label: "Formulários ou requerimentos municipais" },
];

export const PRIOR_PROTOCOL_OPTIONS: { value: PriorProtocol; label: string }[] = [
  { value: "nao", label: "Não houve protocolo anterior" },
  { value: "sem_pendencia", label: "Já houve protocolo, sem pendência informada" },
  { value: "com_pendencia", label: "Já houve exigência ou pendência" },
  { value: "devolvido", label: "O processo foi devolvido ou não prosseguiu" },
];

const serviceLabels = Object.fromEntries(
  SERVICE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<ServiceType, string>;

const situationLabels = Object.fromEntries(
  SITUATION_OPTIONS.map((option) => [option.value, option.label]),
) as Record<CurrentSituation, string>;

export function createEmptyAnswers(): DiagnosticAnswers {
  return {
    serviceType: "",
    currentSituation: "",
    documents: [],
    priorProtocol: "",
  };
}

export function calculatePreliminaryDiagnosis(answers: DiagnosticAnswers): DiagnosticResult {
  if (!answers.serviceType || !answers.currentSituation || !answers.priorProtocol) {
    throw new Error("O diagnóstico precisa de todas as respostas obrigatórias.");
  }

  const documents = new Set(answers.documents);
  const possibleIssues: string[] = [];
  const nextSteps: string[] = [];
  let score = 0;

  if (!documents.has("matricula")) {
    score += 2;
    possibleIssues.push(
      "Matrícula ou documento do imóvel ainda não informado para conferir titularidade e identificação.",
    );
  }
  if (!documents.has("documentos_proprietario")) {
    score += 1;
    possibleIssues.push("Documentos do proprietário ainda não estão na relação informada.");
  }
  if (!documents.has("projeto_arquitetonico")) {
    score += 2;
    possibleIssues.push("Projeto arquitetônico ainda não foi indicado como disponível.");
  }
  if (!documents.has("art_rrt")) {
    score += 2;
    possibleIssues.push("ART ou RRT ainda não foi indicada para conferência.");
  }
  if (!documents.has("formularios_municipais")) {
    score += 1;
    possibleIssues.push(
      "Formulários e requerimentos específicos do município ainda precisam ser confirmados.",
    );
  }

  if (answers.serviceType === "regularizacao") {
    score += 2;
    possibleIssues.push(
      "Regularizações podem exigir levantamento da construção existente e verificação de compatibilidade urbanística.",
    );
  } else if (answers.serviceType === "reforma_ampliacao") {
    score += 1;
    possibleIssues.push(
      "Reforma ou ampliação exige conferir a situação aprovada existente antes de comparar as alterações.",
    );
  } else if (answers.serviceType === "retomada") {
    score += 2;
    possibleIssues.push(
      "A retomada depende da leitura do histórico, dos documentos já apresentados e do motivo da interrupção.",
    );
  }

  if (answers.currentSituation === "inicio") {
    score += 1;
  } else if (answers.currentSituation === "protocolado") {
    score += 2;
    possibleIssues.push(
      "Como já existe protocolo, prazos, comunicações e exigências do processo precisam ser verificados.",
    );
  }

  if (answers.priorProtocol === "com_pendencia") {
    score += 3;
    possibleIssues.push(
      "A exigência anterior precisa ser comparada item a item com a documentação disponível.",
    );
  } else if (answers.priorProtocol === "devolvido") {
    score += 4;
    possibleIssues.push(
      "É necessário identificar por que o processo não prosseguiu antes de uma nova apresentação.",
    );
  }

  if (possibleIssues.length === 0) {
    possibleIssues.push(
      "Mesmo com os principais documentos informados, ainda é necessário confirmar as exigências específicas do município e a consistência técnica do conjunto.",
    );
  }

  const missingDocuments = DOCUMENT_OPTIONS.filter((option) => !documents.has(option.value)).map(
    (option) => option.label,
  );

  if (missingDocuments.length > 0) {
    nextSteps.push(`Reunir ou confirmar: ${missingDocuments.join(", ")}.`);
  } else {
    nextSteps.push("Conferir se os documentos disponíveis estão atualizados e coerentes entre si.");
  }

  if (answers.priorProtocol === "com_pendencia" || answers.priorProtocol === "devolvido") {
    nextSteps.push(
      "Separar a comunicação oficial anterior e registrar quais itens ainda precisam de resposta.",
    );
  } else {
    nextSteps.push(
      "Confirmar a lista de documentos e parâmetros exigidos pelo órgão competente do município.",
    );
  }

  nextSteps.push(
    "Submeter o caso e os documentos à conferência do profissional técnico responsável antes do protocolo.",
  );

  const attentionLevel: AttentionLevel = score >= 8 ? "alto" : score >= 4 ? "moderado" : "baixo";

  return {
    attentionLevel,
    summary: `${serviceLabels[answers.serviceType]}. Situação informada: ${situationLabels[answers.currentSituation]}. ${answers.documents.length} de ${DOCUMENT_OPTIONS.length} grupos de documentos foram marcados como disponíveis.`,
    possibleIssues,
    nextSteps,
  };
}
