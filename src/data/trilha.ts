export type ItemStatus = "not_started" | "checked" | "pending" | "not_applicable";

export type ItemKind = "check" | "field";

export interface TrailItem {
  id: string;
  title: string;
  what: string;          // o que é
  where: string;         // onde conseguir
  how: string;           // como apresentar
  commonError: string;   // erro comum
  kind?: ItemKind;       // default: check
  fieldLabel?: string;   // for kind: field
  placeholder?: string;
}

export interface TrailStage {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  description: string;
  note?: string;
  items: TrailItem[];
}

export const DISCLAIMER =
  "Este sistema é um auxílio de preparação e conferência. Ele não substitui a análise técnica do profissional responsável, não substitui a análise oficial do órgão competente e não garante aprovação.";

export const LEGISLACAO_GENERICA =
  "Conferir conforme legislação municipal aplicável, Plano Diretor, Código de Obras, zoneamento vigente e documentos oficiais do imóvel.";

export const STAGES: TrailStage[] = [
  {
    id: "identificacao",
    number: 1,
    shortTitle: "Identificação",
    title: "Identificação do imóvel",
    description: "Reúna as informações básicas que identificam o terreno e os responsáveis pelo projeto.",
    items: [
      {
        id: "endereco",
        title: "Endereço / Logradouro",
        what: "Endereço completo onde o imóvel está localizado.",
        where: "Matrícula do imóvel, IPTU ou cadastro municipal.",
        how: "Informe rua, número e complemento, conforme consta em documento oficial.",
        commonError: "Usar nome popular do logradouro em vez do nome oficial.",
        kind: "field",
        fieldLabel: "Endereço",
        placeholder: "Ex.: Rua das Acácias, 123",
      },
      {
        id: "bairro",
        title: "Bairro / Localidade",
        what: "Bairro oficial onde o imóvel se encontra.",
        where: "Matrícula, IPTU ou cadastro municipal.",
        how: "Use a denominação oficial registrada pelo município.",
        commonError: "Informar bairro vizinho por proximidade.",
        kind: "field",
        fieldLabel: "Bairro",
      },
      {
        id: "quadra",
        title: "Quadra",
        what: "Quadra do parcelamento em que o lote está inserido.",
        where: "Matrícula do imóvel ou planta do loteamento.",
        how: "Informe exatamente como consta na matrícula.",
        commonError: "Confundir quadra com setor cadastral.",
        kind: "field",
        fieldLabel: "Quadra",
      },
      {
        id: "lote",
        title: "Lote",
        what: "Número do lote dentro da quadra.",
        where: "Matrícula do imóvel ou planta do loteamento.",
        how: "Informe o número conforme registro.",
        commonError: "Trocar o número do lote após desdobro não averbado.",
        kind: "field",
        fieldLabel: "Lote",
      },
      {
        id: "inscricao",
        title: "Inscrição imobiliária",
        what: "Código fiscal que identifica o imóvel junto ao município.",
        where: "Carnê do IPTU ou cadastro municipal.",
        how: "Copie o código exatamente como aparece no documento.",
        commonError: "Informar inscrição antiga, anterior a recadastramento.",
        kind: "field",
        fieldLabel: "Inscrição imobiliária",
      },
      {
        id: "cadastro",
        title: "Cadastro municipal",
        what: "Número de cadastro do imóvel ou do proprietário no município.",
        where: "Prefeitura ou portal do contribuinte.",
        how: "Informe o número vigente.",
        commonError: "Confundir cadastro municipal com inscrição imobiliária.",
        kind: "field",
        fieldLabel: "Cadastro municipal",
      },
      {
        id: "area-terreno",
        title: "Área do terreno",
        what: "Área total do lote em metros quadrados.",
        where: "Matrícula do imóvel e levantamento topográfico, quando houver.",
        how: "Informe em m², com no máximo duas casas decimais.",
        commonError: "Usar área aproximada em vez da área registrada.",
        kind: "field",
        fieldLabel: "Área do terreno (m²)",
      },
      {
        id: "testada",
        title: "Testada",
        what: "Largura do terreno voltada para a via pública.",
        where: "Matrícula do imóvel ou levantamento topográfico.",
        how: "Informe em metros lineares.",
        commonError: "Medir a testada por dentro do recuo.",
        kind: "field",
        fieldLabel: "Testada (m)",
      },
      {
        id: "proprietario",
        title: "Proprietário",
        what: "Nome completo do proprietário do imóvel.",
        where: "Matrícula do imóvel e documento de identificação.",
        how: "Informe o nome conforme registro atualizado.",
        commonError: "Usar nome de antigo proprietário antes da averbação.",
        kind: "field",
        fieldLabel: "Proprietário",
      },
      {
        id: "responsavel",
        title: "Responsável técnico",
        what: "Profissional habilitado responsável pelo projeto.",
        where: "Registro no conselho profissional (CAU/CREA).",
        how: "Informe nome completo e número de registro.",
        commonError: "Indicar profissional sem registro ativo.",
        kind: "field",
        fieldLabel: "Responsável técnico",
      },
    ],
  },
  {
    id: "urbanistico",
    number: 2,
    shortTitle: "Dados urbanísticos",
    title: "Dados urbanísticos",
    description: "Parâmetros do terreno conforme zoneamento e legislação aplicável.",
    note: "Os parâmetros urbanísticos devem ser conferidos na legislação municipal aplicável e nos documentos oficiais do imóvel.",
    items: [
      { id: "zoneamento", title: "Zoneamento", what: "Zona em que o imóvel se enquadra.", where: "Mapa de zoneamento municipal.", how: "Informe a sigla da zona.", commonError: "Adotar zona vizinha por aproximação.", kind: "field", fieldLabel: "Zona" },
      { id: "uso", title: "Uso pretendido", what: "Uso que será atribuído à edificação.", where: "Definido com o proprietário e compatível com o zoneamento.", how: "Informar 'residencial unifamiliar' para casa.", commonError: "Declarar uso diferente do pretendido para evitar exigências.", kind: "field", fieldLabel: "Uso pretendido" },
      { id: "recuo-frontal", title: "Recuo frontal", what: "Distância mínima entre a edificação e o alinhamento da via.", where: "Legislação municipal aplicável para a zona.", how: "Informe o valor adotado em metros.", commonError: "Considerar a calçada como recuo.", kind: "field", fieldLabel: "Recuo frontal adotado (m)" },
      { id: "afast-laterais", title: "Afastamentos laterais", what: "Distância entre a edificação e as divisas laterais.", where: "Legislação municipal aplicável.", how: "Informe os valores adotados.", commonError: "Esquecer de medir o afastamento em pontos críticos da fachada.", kind: "field", fieldLabel: "Afastamentos laterais (m)" },
      { id: "afast-fundos", title: "Afastamento de fundos", what: "Distância entre a edificação e a divisa de fundos.", where: "Legislação municipal aplicável.", how: "Informe o valor adotado.", commonError: "Confundir afastamento com recuo frontal.", kind: "field", fieldLabel: "Afastamento de fundos (m)" },
      { id: "taxa-ocupacao", title: "Taxa de ocupação permitida", what: "Percentual máximo do terreno que pode ser ocupado pela projeção da edificação.", where: "Legislação municipal aplicável.", how: "Informe em porcentagem.", commonError: "Comparar com a taxa calculada antes de conferir o limite vigente.", kind: "field", fieldLabel: "TO permitida (%)" },
      { id: "taxa-permeabilidade", title: "Taxa de permeabilidade mínima", what: "Percentual mínimo de área permeável exigido.", where: "Legislação municipal aplicável.", how: "Informe em porcentagem.", commonError: "Considerar piso intertravado sem comprovação como permeável.", kind: "field", fieldLabel: "Permeabilidade mínima (%)" },
      { id: "coeficiente", title: "Coeficiente de aproveitamento", what: "Relação máxima entre área construída computável e área do terreno.", where: "Legislação municipal aplicável.", how: "Informe o coeficiente máximo permitido.", commonError: "Esquecer de descontar áreas não computáveis.", kind: "field", fieldLabel: "CA máximo" },
      { id: "pavimentos", title: "Número de pavimentos", what: "Quantidade máxima de pavimentos permitida.", where: "Legislação municipal aplicável.", how: "Informe o limite vigente.", commonError: "Contar mezanino fora das regras de cômputo.", kind: "field", fieldLabel: "Pavimentos máx." },
      { id: "lote-min", title: "Lote mínimo", what: "Área mínima de lote exigida na zona.", where: "Legislação municipal aplicável.", how: "Informe em m².", commonError: "Aceitar lote abaixo do mínimo sem averbação regular.", kind: "field", fieldLabel: "Lote mínimo (m²)" },
      { id: "testada-min", title: "Testada mínima", what: "Testada mínima exigida na zona.", where: "Legislação municipal aplicável.", how: "Informe em metros.", commonError: "Medir testada incluindo área de curva da via.", kind: "field", fieldLabel: "Testada mínima (m)" },
    ],
  },
  {
    id: "documentos",
    number: 3,
    shortTitle: "Documentos",
    title: "Documentos necessários",
    description: "Documentação que costuma ser exigida para o protocolo do projeto.",
    items: [
      { id: "matricula", title: "Matrícula ou registro do imóvel", what: "Documento oficial do cartório que comprova a propriedade.", where: "Cartório de registro de imóveis.", how: "Apresente cópia atualizada.", commonError: "Apresentar matrícula com mais de 90 dias quando exigida atualizada." },
      { id: "doc-proprietario", title: "Documento do proprietário", what: "Identificação oficial com foto e CPF.", where: "Com o proprietário.", how: "Cópia legível.", commonError: "Documento ilegível ou cortado." },
      { id: "requerimento", title: "Requerimento", what: "Formulário de solicitação ao órgão competente.", where: "Site ou balcão do órgão.", how: "Preencher integralmente e assinar.", commonError: "Esquecer campos obrigatórios ou assinatura." },
      { id: "art-rrt", title: "ART, RRT ou TRT", what: "Anotação ou registro de responsabilidade técnica.", where: "Conselho profissional do responsável técnico.", how: "Emitir, pagar e anexar a guia quitada.", commonError: "Anexar ART não quitada." },
      { id: "declaracao-ciencia", title: "Declaração de ciência e responsabilidade", what: "Declaração de que o proprietário tem ciência do projeto e responsabilidades.", where: "Modelo do órgão ou redigido pelo responsável técnico.", how: "Assinatura do proprietário e do responsável técnico.", commonError: "Faltar assinatura de uma das partes." },
      { id: "termo-esgoto", title: "Termo de responsabilidade do sistema de esgoto", what: "Termo sobre o sistema de tratamento de esgoto adotado.", where: "Modelo do órgão competente, quando exigido.", how: "Assinar conforme orientação.", commonError: "Omitir o termo em áreas sem rede coletora." },
      { id: "procuracao", title: "Procuração, quando aplicável", what: "Documento que autoriza terceiros a representar o proprietário.", where: "Cartório ou modelo do órgão.", how: "Apresentar quando o protocolo for feito por terceiros.", commonError: "Procuração sem poderes específicos para o ato." },
      { id: "complementares", title: "Documentos complementares, quando aplicável", what: "Outros documentos eventualmente exigidos.", where: "Solicitação do órgão competente.", how: "Anexar conforme exigência.", commonError: "Ignorar exigências adicionais publicadas pelo órgão." },
    ],
  },
  {
    id: "pranchas",
    number: 4,
    shortTitle: "Projetos e pranchas",
    title: "Projetos e pranchas",
    description: "Peças gráficas do projeto arquitetônico.",
    items: [
      { id: "arquitetonico", title: "Projeto arquitetônico", what: "Conjunto de peças gráficas que representa o projeto.", where: "Elaborado pelo responsável técnico.", how: "Apresentar pranchas legíveis e assinadas.", commonError: "Pranchas sem carimbo ou sem assinatura." },
      { id: "situacao", title: "Planta de situação / localização", what: "Localização do imóvel na quadra.", where: "Elaborada pelo responsável técnico, com base na matrícula.", how: "Indicar norte, vias, quadra e lote.", commonError: "Omitir orientação do norte." },
      { id: "implantacao", title: "Implantação", what: "Disposição da edificação no terreno.", where: "Elaborada pelo responsável técnico.", how: "Mostrar recuos, acessos e cotas gerais.", commonError: "Não indicar cotas de recuos." },
      { id: "planta-baixa", title: "Planta baixa", what: "Representação dos pavimentos.", where: "Elaborada pelo responsável técnico.", how: "Apresentar cotas, áreas e nomes dos ambientes.", commonError: "Faltar cotas internas." },
      { id: "cortes", title: "Cortes", what: "Cortes longitudinal e transversal da edificação.", where: "Elaborados pelo responsável técnico.", how: "Mostrar pés-direitos, níveis e alturas.", commonError: "Cortes que não passam por áreas críticas." },
      { id: "fachadas", title: "Fachadas", what: "Vistas externas da edificação.", where: "Elaboradas pelo responsável técnico.", how: "Indicar altura total e elementos relevantes.", commonError: "Omitir cota de altura máxima." },
      { id: "cobertura", title: "Planta de cobertura", what: "Representação do telhado.", where: "Elaborada pelo responsável técnico.", how: "Mostrar inclinação, beirais e caimentos.", commonError: "Faltar indicação de inclinação." },
      { id: "quadro-areas", title: "Quadro de áreas", what: "Tabela com áreas do projeto.", where: "Elaborado pelo responsável técnico.", how: "Compatibilizar com a planta baixa.", commonError: "Quadro divergente da planta." },
      { id: "estatistica", title: "Tabela estatística", what: "Resumo dos dados urbanísticos do projeto.", where: "Elaborada pelo responsável técnico.", how: "Compatibilizar com a legislação e o quadro de áreas.", commonError: "Valores arredondados de forma inconsistente." },
      { id: "esgoto-detalhe", title: "Detalhe ou projeto do sistema de tratamento de esgoto, quando aplicável", what: "Detalhamento do sistema individual de tratamento.", where: "Elaborado pelo responsável técnico, quando não há rede coletora.", how: "Apresentar planta, corte e dimensões.", commonError: "Apresentar detalhe genérico sem dimensionamento." },
    ],
  },
  {
    id: "estatisticas",
    number: 5,
    shortTitle: "Dados e estatísticas",
    title: "Dados e estatísticas do projeto",
    description: "Valores calculados do projeto, conferidos com plantas, tabela e ART/RRT.",
    items: [
      { id: "area-terreno", title: "Área do terreno", what: "Área total do lote.", where: "Matrícula e levantamento.", how: "Informe em m².", commonError: "Divergir da matrícula sem justificativa.", kind: "field", fieldLabel: "Área do terreno (m²)" },
      { id: "area-total", title: "Área construída total", what: "Soma das áreas construídas.", where: "Calculada do projeto.", how: "Informe em m².", commonError: "Esquecer de somar áreas cobertas externas.", kind: "field", fieldLabel: "Área construída total (m²)" },
      { id: "area-terreo", title: "Área do pavimento térreo", what: "Área construída no pavimento térreo.", where: "Calculada do projeto.", how: "Informe em m².", commonError: "Incluir varanda descoberta no cômputo.", kind: "field", fieldLabel: "Área pav. térreo (m²)" },
      { id: "area-superior", title: "Área do pavimento superior, se houver", what: "Área construída no pavimento superior.", where: "Calculada do projeto.", how: "Informe em m².", commonError: "Esquecer áreas em balanço.", kind: "field", fieldLabel: "Área pav. superior (m²)" },
      { id: "area-nova", title: "Área nova", what: "Área a ser construída.", where: "Calculada do projeto.", how: "Informe em m².", commonError: "Misturar área nova e existente.", kind: "field", fieldLabel: "Área nova (m²)" },
      { id: "area-existente", title: "Área existente / legalizada, se houver", what: "Área já construída e regularizada.", where: "Documentação anterior do imóvel.", how: "Informe em m².", commonError: "Considerar como existente área sem regularização anterior.", kind: "field", fieldLabel: "Área existente (m²)" },
      { id: "area-ampliacao", title: "Área de ampliação, se houver", what: "Área acrescida ao existente.", where: "Calculada do projeto.", how: "Informe em m².", commonError: "Lançar ampliação como área nova.", kind: "field", fieldLabel: "Área de ampliação (m²)" },
      { id: "area-nao-comput", title: "Área não computável, se houver", what: "Áreas não computadas no coeficiente.", where: "Calculada conforme legislação aplicável.", how: "Informe em m².", commonError: "Classificar como não computável áreas que são computáveis.", kind: "field", fieldLabel: "Área não computável (m²)" },
      { id: "area-permeavel", title: "Área permeável", what: "Área permeável do terreno.", where: "Calculada do projeto.", how: "Informe em m².", commonError: "Considerar pisos impermeáveis como permeáveis.", kind: "field", fieldLabel: "Área permeável (m²)" },
      { id: "to-calc", title: "Taxa de ocupação calculada", what: "Percentual ocupado pela projeção da edificação.", where: "Calculado: projeção / área do terreno.", how: "Informe em porcentagem.", commonError: "Incluir beirais fora do cômputo previsto.", kind: "field", fieldLabel: "TO calculada (%)" },
      { id: "perm-calc", title: "Taxa de permeabilidade calculada", what: "Percentual de área permeável sobre o terreno.", where: "Calculado: área permeável / área do terreno.", how: "Informe em porcentagem.", commonError: "Arredondar para cima sem critério.", kind: "field", fieldLabel: "Permeabilidade calculada (%)" },
      { id: "ca-calc", title: "Coeficiente de aproveitamento calculado", what: "Relação área computável / área do terreno.", where: "Calculado do projeto.", how: "Informe o valor calculado.", commonError: "Esquecer de descontar áreas não computáveis declaradas.", kind: "field", fieldLabel: "CA calculado" },
      { id: "n-pav", title: "Número de pavimentos", what: "Pavimentos do projeto.", where: "Definido em projeto.", how: "Informe o número total.", commonError: "Não contar pavimento em desnível.", kind: "field", fieldLabel: "Nº de pavimentos" },
    ],
  },
  {
    id: "saneamento",
    number: 6,
    shortTitle: "Saneamento",
    title: "Saneamento e complementares",
    description: "Soluções de esgoto, drenagem e complementares apresentadas com o projeto.",
    items: [
      { id: "tipo-esgoto", title: "Tipo de sistema de tratamento de esgoto", what: "Solução adotada para o esgoto sanitário.", where: "Definido conforme disponibilidade de rede e características do lote.", how: "Indicar se é rede coletora ou sistema individual.", commonError: "Indicar rede coletora onde não existe.", kind: "field", fieldLabel: "Tipo adotado" },
      { id: "tanque", title: "Tanque séptico", what: "Unidade de tratamento primário.", where: "Detalhado no projeto, quando aplicável.", how: "Apresentar dimensionamento.", commonError: "Apresentar tanque sem cálculo de volume." },
      { id: "filtro", title: "Filtro anaeróbio", what: "Unidade de tratamento complementar ao tanque séptico.", where: "Detalhado no projeto, quando aplicável.", how: "Apresentar dimensionamento.", commonError: "Omitir o filtro em sistemas que o exigem." },
      { id: "sumidouro", title: "Sumidouro", what: "Unidade de infiltração final do efluente tratado.", where: "Detalhado no projeto, quando aplicável.", how: "Indicar dimensão e profundidade.", commonError: "Posicionar sumidouro próximo a poços." },
      { id: "volumes", title: "Volumes ou dimensões informadas", what: "Dimensões das unidades de tratamento.", where: "Memorial ou prancha do projeto.", how: "Indicar volumes e dimensões.", commonError: "Volumes incompatíveis com o número de moradores." },
      { id: "compat", title: "Compatibilidade com o projeto", what: "Coerência entre detalhe sanitário e o projeto arquitetônico.", where: "Comparação entre as peças.", how: "Conferir posição, recuos e acessos.", commonError: "Sistema sanitário sobre área construída." },
      { id: "pluviais", title: "Águas pluviais", what: "Solução para captação e destino das águas pluviais.", where: "Detalhada no projeto, quando exigido.", how: "Indicar caimento e destino final.", commonError: "Lançar pluviais em rede de esgoto sanitário." },
      { id: "calcada", title: "Calçada / acesso, quando aplicável", what: "Calçada e acesso de veículos.", where: "Detalhado no projeto, quando exigido.", how: "Indicar largura, rampa e acessibilidade.", commonError: "Acesso de veículos invadindo calçada sem rampa adequada." },
    ],
  },
  {
    id: "revisao",
    number: 7,
    shortTitle: "Revisão final",
    title: "Revisão final",
    description: "Conferência geral antes do protocolo.",
    items: [
      { id: "anexos", title: "Documentos anexados", what: "Conjunto de documentos do processo.", where: "Pasta do protocolo.", how: "Conferir lista completa.", commonError: "Anexar documentos faltando páginas." },
      { id: "legibilidade", title: "Pranchas legíveis", what: "Qualidade visual das pranchas.", where: "Arquivos do projeto.", how: "Conferir escala, traços e textos.", commonError: "Pranchas exportadas em baixa resolução." },
      { id: "assinaturas", title: "Assinaturas e responsabilidade técnica", what: "Assinaturas nas peças e documentos.", where: "Pranchas, documentos e ART/RRT.", how: "Verificar assinatura digital ou física.", commonError: "Pranchas sem assinatura do responsável técnico." },
      { id: "areas-compat", title: "Áreas compatíveis entre prancha, tabela e ART/RRT", what: "Coerência entre áreas declaradas.", where: "Quadro de áreas, tabela estatística e ART/RRT.", how: "Comparar valores.", commonError: "ART com área diferente do projeto." },
      { id: "urb-preenchido", title: "Dados urbanísticos preenchidos", what: "Parâmetros declarados na tabela.", where: "Tabela estatística do projeto.", how: "Conferir cada parâmetro.", commonError: "Campos em branco na tabela." },
      { id: "estat-conf", title: "Estatísticas conferidas", what: "Valores calculados do projeto.", where: "Tabela estatística.", how: "Conferir cálculos.", commonError: "Cálculos inconsistentes entre si." },
      { id: "saneamento-apres", title: "Saneamento apresentado", what: "Solução sanitária do projeto.", where: "Pranchas e memoriais.", how: "Conferir presença e coerência.", commonError: "Esquecer o detalhe sanitário." },
      { id: "obs", title: "Observações revisadas", what: "Anotações registradas no preparo.", where: "Anotações desta trilha.", how: "Reler todas as observações.", commonError: "Esquecer pendências registradas no início." },
      { id: "pendencias", title: "Pendências listadas", what: "Lista de itens marcados como pendentes.", where: "Resultado de conferência.", how: "Resolver antes do protocolo.", commonError: "Protocolar com itens em aberto." },
    ],
  },
];

export function totalItems() {
  return STAGES.reduce((acc, s) => acc + s.items.length, 0);
}
