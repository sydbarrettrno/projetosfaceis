export type ChecklistCategory =
  | "Edificação"
  | "Regularização"
  | "Parcelamento"
  | "Demolição"
  | "Documentação"
  | "Processo especial";

export type ItemStatus = "unchecked" | "checked" | "pending" | "not_applicable";

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  reference?: string;
}

export interface ChecklistSection {
  id: string;
  title: string;
  description?: string;
  items: ChecklistItem[];
}

export interface ChecklistType {
  id: string;
  title: string;
  description: string;
  category: ChecklistCategory;
  version: string;
  source: string;
  icon: string; // emoji or lucide name
  sections: ChecklistSection[];
}

const docMinimos: ChecklistSection = {
  id: "doc-min",
  title: "Documentação mínima",
  description: "Documentos obrigatórios para protocolo do processo.",
  items: [
    { id: "d1", title: "Requerimento padrão preenchido e assinado", reference: "Art. 5º" },
    { id: "d2", title: "Cópia da matrícula atualizada do imóvel (até 90 dias)" },
    { id: "d3", title: "Cópia do RG e CPF do proprietário" },
    { id: "d4", title: "ART/RRT do responsável técnico", reference: "CAU/CREA" },
    { id: "d5", title: "Comprovante de pagamento da taxa de análise" },
  ],
};

export const CHECKLISTS: ChecklistType[] = [
  {
    id: "casa",
    title: "Casa Unifamiliar",
    description: "Análise de projeto para residência unifamiliar térrea.",
    category: "Edificação",
    version: "1.3",
    source: "Lei Municipal nº 4.829/2018 — Código de Obras",
    icon: "🏠",
    sections: [
      docMinimos,
      {
        id: "urb",
        title: "Parâmetros urbanísticos",
        items: [
          { id: "u1", title: "Recuo frontal mínimo atendido", reference: "Plano Diretor Art. 42" },
          { id: "u2", title: "Recuos laterais e fundos atendidos" },
          { id: "u3", title: "Taxa de ocupação dentro do limite da zona" },
          { id: "u4", title: "Coeficiente de aproveitamento respeitado" },
          { id: "u5", title: "Taxa de permeabilidade atendida" },
        ],
      },
      {
        id: "arq",
        title: "Projeto arquitetônico",
        items: [
          { id: "a1", title: "Planta baixa com cotas e áreas" },
          { id: "a2", title: "Cortes longitudinal e transversal" },
          { id: "a3", title: "Fachadas com indicação de altura" },
          { id: "a4", title: "Planta de cobertura com inclinação" },
          { id: "a5", title: "Quadro de áreas conferente" },
          { id: "a6", title: "Vaga de garagem dimensionada (mín. 2,40 × 4,50 m)" },
        ],
      },
    ],
  },
  {
    id: "comercio",
    title: "Comércio",
    description: "Análise de projeto para edificação de uso comercial.",
    category: "Edificação",
    version: "1.1",
    source: "Lei Municipal nº 4.829/2018 / NBR 9050",
    icon: "🏪",
    sections: [
      docMinimos,
      {
        id: "uso",
        title: "Compatibilidade de uso",
        items: [
          { id: "us1", title: "Atividade permitida na zona" },
          { id: "us2", title: "Estudo de impacto de vizinhança quando exigível" },
        ],
      },
      {
        id: "acess",
        title: "Acessibilidade (NBR 9050)",
        items: [
          { id: "ac1", title: "Rota acessível da calçada à entrada principal" },
          { id: "ac2", title: "Sanitário acessível dimensionado" },
          { id: "ac3", title: "Balcão de atendimento com altura acessível" },
        ],
      },
      {
        id: "seg",
        title: "Segurança contra incêndio",
        items: [
          { id: "s1", title: "Projeto aprovado pelo Corpo de Bombeiros" },
          { id: "s2", title: "Saídas de emergência dimensionadas" },
        ],
      },
    ],
  },
  {
    id: "edificio",
    title: "Edifício Multifamiliar",
    description: "Análise de projeto para edificação com múltiplas unidades.",
    category: "Edificação",
    version: "2.0",
    source: "Plano Diretor / Lei de Uso do Solo",
    icon: "🏢",
    sections: [
      docMinimos,
      {
        id: "urb",
        title: "Parâmetros urbanísticos",
        items: [
          { id: "u1", title: "Altura máxima da edificação atendida" },
          { id: "u2", title: "Gabarito e número de pavimentos compatíveis" },
          { id: "u3", title: "Taxa de ocupação e CA dentro do limite" },
          { id: "u4", title: "Recuos progressivos quando aplicável" },
        ],
      },
      {
        id: "circ",
        title: "Circulação e infraestrutura",
        items: [
          { id: "c1", title: "Escadas enclausuradas conforme NBR" },
          { id: "c2", title: "Elevadores dimensionados pelo cálculo de tráfego" },
          { id: "c3", title: "Reservatório superior e inferior dimensionados" },
          { id: "c4", title: "Vagas de garagem suficientes (incl. PCD)" },
        ],
      },
      {
        id: "amb",
        title: "Áreas comuns",
        items: [
          { id: "am1", title: "Área de lazer mínima atendida" },
          { id: "am2", title: "Hall de entrada acessível" },
        ],
      },
    ],
  },
  {
    id: "regularizacao",
    title: "Regularização de Edificação",
    description: "Regularização de obras existentes sem alvará.",
    category: "Regularização",
    version: "1.0",
    source: "Lei Municipal de Regularização Edilícia",
    icon: "📐",
    sections: [
      docMinimos,
      {
        id: "lev",
        title: "Levantamento da edificação existente",
        items: [
          { id: "l1", title: "Levantamento arquitetônico do existente" },
          { id: "l2", title: "Laudo técnico de estabilidade assinado" },
          { id: "l3", title: "Fotos atuais de todas as fachadas" },
          { id: "l4", title: "Declaração de época da construção" },
        ],
      },
      {
        id: "comp",
        title: "Conformidade urbanística",
        items: [
          { id: "co1", title: "Verificação de recuos do existente" },
          { id: "co2", title: "Cálculo das áreas a regularizar" },
          { id: "co3", title: "Identificação de não conformidades" },
        ],
      },
    ],
  },
  {
    id: "demolicao",
    title: "Demolição",
    description: "Autorização para demolição total ou parcial de edificação.",
    category: "Demolição",
    version: "1.0",
    source: "Código de Obras Municipal",
    icon: "🧱",
    sections: [
      docMinimos,
      {
        id: "dem",
        title: "Documentação específica",
        items: [
          { id: "de1", title: "Memorial descritivo do método de demolição" },
          { id: "de2", title: "Plano de gerenciamento de resíduos (CONAMA 307)" },
          { id: "de3", title: "ART de demolição" },
          { id: "de4", title: "Verificação de patrimônio histórico" },
          { id: "de5", title: "Comunicação aos vizinhos confrontantes" },
        ],
      },
    ],
  },
  {
    id: "desdobro-unificacao",
    title: "Desdobro / Unificação",
    description: "Parcelamento por desdobro, unificação ou desmembramento de lotes.",
    category: "Parcelamento",
    version: "1.2",
    source: "Lei Federal 6.766/79 e Lei Municipal de Parcelamento",
    icon: "🗺️",
    sections: [
      docMinimos,
      {
        id: "lote",
        title: "Conformidade dos lotes resultantes",
        items: [
          { id: "lo1", title: "Área mínima de lote da zona atendida" },
          { id: "lo2", title: "Testada mínima atendida" },
          { id: "lo3", title: "Acesso direto a via oficial" },
          { id: "lo4", title: "Levantamento topográfico georreferenciado" },
        ],
      },
      {
        id: "tec",
        title: "Peças técnicas",
        items: [
          { id: "t1", title: "Planta de situação atual" },
          { id: "t2", title: "Planta da proposta de parcelamento" },
          { id: "t3", title: "Memorial descritivo dos lotes resultantes" },
          { id: "t4", title: "Quadro de áreas (original × resultante)" },
        ],
      },
    ],
  },
];

export const CATEGORIES: ChecklistCategory[] = [
  "Edificação",
  "Regularização",
  "Parcelamento",
  "Demolição",
  "Documentação",
  "Processo especial",
];

export function getChecklist(id: string) {
  return CHECKLISTS.find((c) => c.id === id);
}

export function countTotalItems(c: ChecklistType) {
  return c.sections.reduce((acc, s) => acc + s.items.length, 0);
}
