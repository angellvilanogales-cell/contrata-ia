export const LB108_ECONOMIC_STARTING_POINT_VERSION = "LB108-ECONOMIC-STARTING-POINT-V1" as const;

const LCSP_URL = "https://www.boe.es/buscar/act.php?id=BOE-A-2017-12902";

export type EconomicStartingPoint = "KNOWN_CREDIT_LIMIT" | "NEED_PENDING_VALUATION";
export type CreditScope = "INITIAL_PERIOD" | "ENTIRE_CONTRACT_LIFE";
export type InitialEconomicContractType = "SUPPLY" | "SERVICE";
export type ValuationMethodology = "MARKET_CONSULTATION" | "PRIOR_CONTRACTS" | "QUOTES_OR_CATALOGUES" | "COST_STUDY";
export type ValuationSupport = "TECHNICAL_SCOPE" | "HISTORICAL_CONSUMPTION" | "PRIOR_AWARD" | "MARKET_QUOTES" | "PUBLIC_CATALOGUE" | "UNIT_COSTS" | "LABOUR_COSTS" | "PRICE_INDEX" | "EXPERT_REPORT";

export interface SupportingDocumentReference { id: string; fileName: string; sha256: string; size: number; mediaType: string; }

export interface EconomicLegalBasis {
  id: string;
  norm: "Ley 9/2017, de Contratos del Sector Público";
  article: string;
  paragraph: string;
  relevantOfficialExcerpt: string;
  officialUrl: string;
  sourceAuthority: "BOE";
  consolidatedAt: "2026-04-09";
}

export interface KnownCreditInput {
  startingPoint: "KNOWN_CREDIT_LIMIT";
  contractType: InitialEconomicContractType;
  grossCreditLimitCents: number;
  contractBudgetVatIncludedCents?: number;
  directCostsExVatCents?: number;
  indirectCostsExVatCents?: number;
  otherCostsExVatCents?: number;
  costPercentages?: { direct: number; indirect: number; other: number };
  lotPblAllocations?: readonly { lotId: string; lot: string; pblVatIncludedCents: number }[];
  lotPblPercentages?: readonly { lotId: string; lot: string; percentage: number }[];
  vatRatePercent: number;
  creditScope: CreditScope;
  initialDurationMonths: number;
  extensionMonths: number;
  extensionAmountExVatCents?: number;
  plannedModificationPercent: number;
  optionsAmountExVatCents?: number;
  otherEstimatedValueComponentsCents?: number;
  successiveNeeds?: boolean;
  valuationEvidence: string;
  valuationMethodologies?: readonly ValuationMethodology[];
  /** Compatibilidad con expedientes LB108 anteriores a la selección múltiple. */
  valuationMethodology?: ValuationMethodology;
  valuationSupports?: readonly ValuationSupport[];
  supportingDocuments?: readonly SupportingDocumentReference[];
}

export interface PendingValuationInput {
  startingPoint: "NEED_PENDING_VALUATION";
  contractType: InitialEconomicContractType;
  valuationRoute?: ValuationMethodology;
  knownTechnicalFacts?: string;
}

export type EconomicStartingPointInput = KnownCreditInput | PendingValuationInput;

export interface ProcedureCandidate {
  code: "MINOR_REVIEW" | "OPEN_SIMPLIFIED_ABBREVIATED_REVIEW" | "OPEN_SIMPLIFIED_REVIEW" | "OPEN_OR_OTHER_JUSTIFIED_REVIEW" | "PENDING";
  label: string;
  reasoning: string;
  conditions: readonly string[];
  humanValidationRequired: true;
}

export interface EconomicStartingPointResult {
  version: typeof LB108_ECONOMIC_STARTING_POINT_VERSION;
  startingPoint: EconomicStartingPoint;
  status: "CALCULATED_FOR_HUMAN_REVIEW" | "VALUATION_REQUIRED";
  budget?: {
    availableCreditVatIncludedCents: number;
    baseTenderBudgetExVatCents: number;
    vatAmountCents: number;
    baseTenderBudgetVatIncludedCents: number;
    maximumApprovedBudgetCents?: number;
    budgetCoversEntireContractLife: boolean;
    costBreakdown: { directPercent: number; indirectPercent: number; otherPercent: number; directCostsExVatCents: number; indirectCostsExVatCents: number; otherCostsExVatCents: number };
    lotPblAllocations: readonly { lotId: string; lot: string; percentage: number; pblVatIncludedCents: number }[];
  };
  estimatedValue?: {
    initialBaseCents: number;
    extensionsCents: number;
    plannedModificationsCents: number;
    optionsCents: number;
    otherComponentsCents: number;
    legalEstimatedValueCents: number;
    calculationMethod: string;
  };
  valuationPlan: {
    proposedMethodology: ValuationMethodology;
    selectedMethodologies: readonly ValuationMethodology[];
    /** Compatibilidad de lectura con expedientes LB108 anteriores. */
    selectedMethodology?: ValuationMethodology;
    rationale: string;
    allowedSupports: readonly ValuationSupport[];
    selectedSupports: readonly ValuationSupport[];
    supportingDocuments: readonly SupportingDocumentReference[];
    evidenceSufficient: boolean;
  };
  procedure: ProcedureCandidate;
  warnings: readonly string[];
  nextActions: readonly string[];
  legalBasis: readonly EconomicLegalBasis[];
  humanValidationRequired: true;
  generationBlocked: boolean;
  productionReady: false;
}

const basis = (id: string, article: string, paragraph: string, excerpt: string): EconomicLegalBasis => ({
  id,
  norm: "Ley 9/2017, de Contratos del Sector Público",
  article,
  paragraph,
  relevantOfficialExcerpt: excerpt,
  officialUrl: `${LCSP_URL}#a${article.replace(/[^0-9]/g, "")}`,
  sourceAuthority: "BOE",
  consolidatedAt: "2026-04-09",
});

const LEGAL = {
  pbl: basis("LCSP-100.1", "100", "1", "El presupuesto base de licitación es el límite máximo de gasto, incluido el IVA, salvo disposición en contrario."),
  market: basis("LCSP-100.2", "100", "2", "El presupuesto base de licitación debe ser adecuado a los precios del mercado y expresar su desglose."),
  estimatedValue: basis("LCSP-101.1.a", "101", "1.a", "En obras, suministros y servicios se toma el importe total estimado sin incluir el IVA."),
  components: basis("LCSP-101.2", "101", "2", "El valor estimado incorpora opciones, prórrogas y el importe máximo de las modificaciones al alza previstas."),
  method: basis("LCSP-101.4-5", "101", "4 y 5", "El método no puede eludir normas de adjudicación y debe figurar en el PCAP."),
  preliminaryConsultation: basis("LCSP-115.1", "115", "1", "El órgano de contratación puede realizar estudios y consultas de mercado para preparar correctamente la licitación."),
  file: basis("LCSP-116.4.d", "116", "4.d", "El expediente debe justificar adecuadamente el valor estimado del contrato con sus conceptos integrantes."),
  procedure: basis("LCSP-159.1", "159", "1", "El procedimiento abierto simplificado exige límites de valor estimado y condiciones sobre los criterios de adjudicación."),
  abbreviated: basis("LCSP-159.6", "159", "6", "La tramitación abreviada se aplica bajo sus límites de valor estimado y requisitos específicos."),
  minor: basis("LCSP-118.1-2", "118", "1 y 2", "El contrato menor se define por valor estimado y exige justificar necesidad y ausencia de fraccionamiento."),
  successiveNeeds: {
    ...basis("LCSP-DA33", "DA 33.ª", "único", "En suministros o servicios sucesivos por necesidades y precios unitarios debe aprobarse un presupuesto máximo."),
    officialUrl: `${LCSP_URL}#da-33`,
  },
} as const;

const SUPPORTS_BY_METHOD: Record<ValuationMethodology, readonly ValuationSupport[]> = {
  MARKET_CONSULTATION: ["TECHNICAL_SCOPE", "MARKET_QUOTES", "PUBLIC_CATALOGUE", "EXPERT_REPORT"],
  PRIOR_CONTRACTS: ["TECHNICAL_SCOPE", "HISTORICAL_CONSUMPTION", "PRIOR_AWARD", "PRICE_INDEX"],
  QUOTES_OR_CATALOGUES: ["TECHNICAL_SCOPE", "MARKET_QUOTES", "PUBLIC_CATALOGUE", "HISTORICAL_CONSUMPTION"],
  COST_STUDY: ["TECHNICAL_SCOPE", "UNIT_COSTS", "LABOUR_COSTS", "PRICE_INDEX", "EXPERT_REPORT"],
};

const SUPPORT_REQUIREMENTS: Record<ValuationMethodology, { all: readonly ValuationSupport[]; any?: readonly ValuationSupport[] }> = {
  MARKET_CONSULTATION: { all: ["TECHNICAL_SCOPE", "MARKET_QUOTES"] },
  PRIOR_CONTRACTS: { all: ["TECHNICAL_SCOPE", "PRIOR_AWARD"] },
  QUOTES_OR_CATALOGUES: { all: ["TECHNICAL_SCOPE"], any: ["MARKET_QUOTES", "PUBLIC_CATALOGUE"] },
  COST_STUDY: { all: ["TECHNICAL_SCOPE"], any: ["UNIT_COSTS", "LABOUR_COSTS"] },
};

function validateMethodSupport(methodology: ValuationMethodology, supports: readonly ValuationSupport[]): void {
  const requirement = SUPPORT_REQUIREMENTS[methodology];
  const missing = requirement.all.filter(item => !supports.includes(item));
  if (missing.length) throw new Error(`La metodología ${methodology} requiere los apoyos: ${missing.join(", ")}.`);
  if (requirement.any && !requirement.any.some(item => supports.includes(item))) throw new Error(`La metodología ${methodology} requiere al menos uno de estos apoyos principales: ${requirement.any.join(", ")}.`);
}

function proposedMethodology(contractType: InitialEconomicContractType, successiveNeeds = false): { methodology: ValuationMethodology; rationale: string } {
  if (contractType === "SUPPLY") return successiveNeeds
    ? { methodology: "QUOTES_OR_CATALOGUES", rationale: "En un suministro sucesivo por precios unitarios conviene contrastar el catálogo de referencias con precios o tarifas de mercado y consumos históricos." }
    : { methodology: "QUOTES_OR_CATALOGUES", rationale: "En un suministro definido, las ofertas y catálogos comparables permiten contrastar precios unitarios y condiciones homogéneas." };
  return { methodology: "COST_STUDY", rationale: "En servicios, el estudio de costes permite justificar dedicaciones, costes laborales, medios, costes indirectos y demás componentes de la prestación." };
}

function normalizedDocuments(documents: readonly SupportingDocumentReference[] = []): SupportingDocumentReference[] {
  return documents.map(document => ({ id: String(document.id || "").trim(), fileName: String(document.fileName || "").trim(), sha256: String(document.sha256 || "").trim().toLowerCase(), size: integer(document.size, "El tamaño del documento"), mediaType: String(document.mediaType || "application/octet-stream").trim() }))
    .filter(document => document.id && document.fileName && /^[a-f0-9]{64}$/.test(document.sha256) && document.size > 0);
}

function integer(value: number, label: string, maximum = Number.MAX_SAFE_INTEGER): number {
  if (!Number.isInteger(value) || value < 0 || value > maximum) throw new Error(`${label} debe ser un número entero no negativo.`);
  return value;
}

function percentage(value: number, label: string): number {
  if (!Number.isFinite(value) || value < 0 || value > 100) throw new Error(`${label} debe estar entre 0 y 100.`);
  return value;
}

function procedureCandidate(type: InitialEconomicContractType, estimatedValueCents: number): ProcedureCandidate {
  const euros = estimatedValueCents / 100;
  if (euros < 15_000) return {
    code: "MINOR_REVIEW",
    label: "Revisar posible contrato menor",
    reasoning: "El valor estimado está por debajo del umbral cuantitativo de suministros y servicios del artículo 118 LCSP.",
    conditions: ["Acreditar que no existe fraccionamiento.", "Comprobar que la necesidad no es recurrente ni exige una licitación ordinaria.", "Justificar necesidad y aprobar el gasto."],
    humanValidationRequired: true,
  };
  if (euros < 60_000) return {
    code: "OPEN_SIMPLIFIED_ABBREVIATED_REVIEW",
    label: "Estudiar abierto simplificado abreviado",
    reasoning: "El valor estimado es inferior a 60.000 euros, límite del artículo 159.6 para suministros y servicios.",
    conditions: ["Todos los criterios deben ser cuantificables mediante fórmulas.", ...(type === "SERVICE" ? ["Comprobar que no sea una prestación de carácter intelectual."] : []), "Verificar los restantes requisitos del artículo 159.6."],
    humanValidationRequired: true,
  };
  if (euros < 140_000) return {
    code: "OPEN_SIMPLIFIED_REVIEW",
    label: "Estudiar abierto simplificado",
    reasoning: "El valor estimado es inferior al umbral vigente al que remite el artículo 159.1 para suministros y servicios.",
    conditions: ["Definir los criterios y comprobar el límite de juicio de valor.", "Verificar publicidad, solvencia y demás condiciones del artículo 159."],
    humanValidationRequired: true,
  };
  return {
    code: "OPEN_OR_OTHER_JUSTIFIED_REVIEW",
    label: "Determinar procedimiento ordinario y posible regulación armonizada",
    reasoning: "La cuantía no permite proponer el abierto simplificado por el solo dato económico.",
    conditions: ["Identificar el tipo de órgano de contratación.", "Comprobar los umbrales de regulación armonizada vigentes.", "Valorar si concurre una causa legal para un procedimiento distinto del abierto."],
    humanValidationRequired: true,
  };
}

function pendingResult(input: PendingValuationInput): EconomicStartingPointResult {
  const route = input.valuationRoute;
  const proposed = proposedMethodology(input.contractType);
  return {
    version: LB108_ECONOMIC_STARTING_POINT_VERSION,
    startingPoint: input.startingPoint,
    status: "VALUATION_REQUIRED",
    valuationPlan: { proposedMethodology: proposed.methodology, selectedMethodologies: route ? [route] : [], selectedMethodology: route, rationale: proposed.rationale, allowedSupports: SUPPORTS_BY_METHOD[route ?? proposed.methodology], selectedSupports: [], supportingDocuments: [], evidenceSufficient: false },
    procedure: {
      code: "PENDING",
      label: "Procedimiento pendiente de valoración económica",
      reasoning: "Sin presupuesto y valor estimado trazables no puede proponerse responsablemente un procedimiento de adjudicación.",
      conditions: ["Definir suficientemente la prestación.", "Obtener precios o costes de mercado trazables.", "Calcular PBL y valor estimado como magnitudes separadas."],
      humanValidationRequired: true,
    },
    warnings: [
      "La existencia de una necesidad permite preparar y definir la contratación, pero no autoriza a inventar un precio.",
      "No debe elegirse el procedimiento ni generar los apartados económicos de los pliegos hasta cerrar la valoración.",
    ],
    nextActions: route ? [
      `Aplicar el cauce de valoración elegido: ${route}.`,
      "Conservar las fuentes, fecha, unidades, precios y supuestos utilizados.",
      "Volver a este bloque para validar PBL, IVA y valor estimado.",
    ] : [
      "Elegir entre consulta preliminar de mercado, contratos comparables, ofertas o catálogos y estudio de costes.",
      "Concretar unidades, duración, condiciones de ejecución y demás inductores del coste.",
      "Volver a este bloque para validar PBL, IVA y valor estimado.",
    ],
    legalBasis: [LEGAL.market, LEGAL.estimatedValue, LEGAL.preliminaryConsultation, LEGAL.file, LEGAL.method],
    humanValidationRequired: true,
    generationBlocked: true,
    productionReady: false,
  };
}

export function evaluateEconomicStartingPoint(input: EconomicStartingPointInput): EconomicStartingPointResult {
  if (input.contractType !== "SUPPLY" && input.contractType !== "SERVICE") throw new Error("El bloque económico inicial solo puede continuar tras validar suministro o servicio.");
  if (input.startingPoint === "NEED_PENDING_VALUATION") return pendingResult(input);

  const gross = integer(input.grossCreditLimitCents, "El límite de crédito con IVA");
  if (gross === 0) throw new Error("El límite de crédito con IVA debe ser superior a cero.");
  const contractBudgetGross = integer(input.contractBudgetVatIncludedCents ?? gross, "El PBL propuesto con IVA");
  if (contractBudgetGross === 0) throw new Error("El PBL propuesto con IVA debe ser superior a cero.");
  if (contractBudgetGross > gross) throw new Error("El PBL propuesto con IVA no puede superar el crédito máximo disponible.");
  const vatRate = integer(input.vatRatePercent, "El tipo de IVA", 100);
  const initialDuration = integer(input.initialDurationMonths, "La duración inicial", 1_200);
  if (initialDuration === 0) throw new Error("La duración inicial debe ser superior a cero.");
  const extensionMonths = integer(input.extensionMonths, "La duración de las prórrogas", 1_200);
  const modificationPercent = integer(input.plannedModificationPercent, "El porcentaje de modificación prevista", 100);
  const options = integer(input.optionsAmountExVatCents ?? 0, "El importe de opciones");
  const other = integer(input.otherEstimatedValueComponentsCents ?? 0, "Los demás componentes del valor estimado");
  const extension = input.creditScope === "ENTIRE_CONTRACT_LIFE"
    ? 0
    : integer(input.extensionAmountExVatCents ?? 0, "El importe de las prórrogas");
  if (input.creditScope === "INITIAL_PERIOD" && extensionMonths > 0 && extension === 0) {
    throw new Error("Si el crédito cubre solo el periodo inicial y existen prórrogas, debe valorarse su importe sin IVA.");
  }
  if (!input.valuationEvidence.trim()) throw new Error("Debe indicarse la fuente o método que acredita la adecuación del importe al mercado.");
  const proposed = proposedMethodology(input.contractType, Boolean(input.successiveNeeds));
  const selectedMethodologies = [...new Set(input.valuationMethodologies ?? (input.valuationMethodology ? [input.valuationMethodology] : [proposed.methodology]))];
  if (selectedMethodologies.length === 0) throw new Error("Debe seleccionar al menos una metodología de valoración.");
  if (selectedMethodologies.some(methodology => !(methodology in SUPPORTS_BY_METHOD))) throw new Error("Una de las metodologías de valoración seleccionadas no está reconocida.");
  const selectedMethodology = selectedMethodologies[0];
  const allowedSupports = [...new Set(selectedMethodologies.flatMap(methodology => SUPPORTS_BY_METHOD[methodology]))];
  const selectedSupports = [...new Set(input.valuationSupports ?? [])];
  const strictEvidenceFlow = input.valuationMethodologies !== undefined || input.valuationMethodology !== undefined || input.valuationSupports !== undefined || input.supportingDocuments !== undefined;
  if (strictEvidenceFlow && selectedSupports.length === 0) throw new Error("Debe seleccionar al menos un apoyo documental o técnico para la metodología de valoración.");
  if (selectedSupports.some(item => !allowedSupports.includes(item))) throw new Error("Uno de los apoyos seleccionados no corresponde a las metodologías de valoración elegidas.");
  if (strictEvidenceFlow) selectedMethodologies.forEach(methodology => validateMethodSupport(methodology, selectedSupports));
  const supportingDocuments = normalizedDocuments(input.supportingDocuments);
  if (strictEvidenceFlow && supportingDocuments.length === 0) throw new Error("Debe incorporar al menos un documento que acredite la valoración antes de calcular y continuar.");

  const base = Math.round(contractBudgetGross * 100 / (100 + vatRate));
  const vat = contractBudgetGross - base;
  const percentages = input.costPercentages;
  if (percentages && Math.abs(percentages.direct + percentages.indirect + percentages.other - 100) > 0.0001) throw new Error("Los porcentajes de costes directos, indirectos y otros gastos deben sumar exactamente el 100 %.");
  const directPercent = percentages?.direct ?? 100;
  const indirectPercent = percentages?.indirect ?? 0;
  const otherPercent = percentages?.other ?? 0;
  percentage(directPercent, "El porcentaje de costes directos");
  percentage(indirectPercent, "El porcentaje de costes indirectos");
  percentage(otherPercent, "El porcentaje de otros gastos");
  const noBreakdownProvided = input.directCostsExVatCents == null && input.indirectCostsExVatCents == null && input.otherCostsExVatCents == null;
  const directCosts = percentages ? Math.round(base * directPercent / 100) : integer(input.directCostsExVatCents ?? (noBreakdownProvided ? base : 0), "Los costes directos");
  const indirectCosts = percentages ? Math.round(base * indirectPercent / 100) : integer(input.indirectCostsExVatCents ?? 0, "Los costes indirectos");
  const otherCosts = percentages ? base - directCosts - indirectCosts : integer(input.otherCostsExVatCents ?? 0, "Los demás gastos del PBL");
  if (directCosts + indirectCosts + otherCosts !== base) throw new Error("La suma de costes directos, costes indirectos y otros gastos debe coincidir con el PBL sin IVA.");
  const lotPercentages = [...(input.lotPblPercentages ?? [])];
  if (lotPercentages.length && Math.abs(lotPercentages.reduce((sum, item) => sum + item.percentage, 0) - 100) > 0.0001) throw new Error("Los porcentajes de distribución del PBL entre lotes deben sumar exactamente el 100 %.");
  let allocated = 0;
  const lotPblAllocations = lotPercentages.length ? lotPercentages.map((item, index) => {
    const itemPercentage = percentage(item.percentage, `El porcentaje de ${item.lot || "cada lote"}`);
    const amount = index === lotPercentages.length - 1 ? contractBudgetGross - allocated : Math.round(contractBudgetGross * itemPercentage / 100);
    allocated += amount;
    return { lotId: String(item.lotId || "").trim(), lot: String(item.lot || "").trim(), percentage: itemPercentage, pblVatIncludedCents: amount };
  }) : [...(input.lotPblAllocations ?? [])].map(item => ({ lotId: String(item.lotId || "").trim(), lot: String(item.lot || "").trim(), percentage: 0, pblVatIncludedCents: integer(item.pblVatIncludedCents, `El PBL de ${item.lot || "cada lote"}`) }));
  if (lotPblAllocations.some(item => !item.lotId || !item.lot || item.pblVatIncludedCents === 0)) throw new Error("Cada lote debe conservar su identificación y tener asignada una parte positiva del PBL.");
  if (lotPblAllocations.length && lotPblAllocations.reduce((sum, item) => sum + item.pblVatIncludedCents, 0) !== contractBudgetGross) throw new Error("La suma del PBL asignado a los lotes debe coincidir con el PBL total del contrato, IVA incluido.");
  const modification = Math.round(base * modificationPercent / 100);
  const estimated = base + extension + modification + options + other;
  const scopeText = input.creditScope === "ENTIRE_CONTRACT_LIFE"
    ? "El presupuesto máximo declarado cubre toda la vigencia; las prórrogas no se suman de nuevo."
    : `El presupuesto cubre el periodo inicial y se añaden ${extension} céntimos para las prórrogas declaradas.`;
  const documentTrace = supportingDocuments.map(document => `${document.fileName} [SHA-256 ${document.sha256}]`).join("; ");
  const calculationMethod = `${scopeText} Base sin IVA: ${base} céntimos; prórrogas: ${extension}; modificaciones previstas: ${modification}; opciones: ${options}; otros conceptos: ${other}. Fuente o método de valoración declarado: ${input.valuationEvidence.trim()}. Metodologías estructuradas: ${selectedMethodologies.join(", ")}. Apoyos: ${selectedSupports.join(", ") || "declaración narrativa previa"}.${documentTrace ? ` Documentos acreditativos: ${documentTrace}.` : ""}`;
  const warnings = [
    "El crédito con IVA determina el límite de gasto, pero el procedimiento se analiza sobre el valor estimado sin IVA.",
    "El crédito disponible y el PBL solo coinciden cuando la persona confirma que todo ese límite corresponde al máximo contractual adecuadamente valorado.",
    "La propuesta de procedimiento es provisional hasta validar criterios de adjudicación, órgano contratante y demás circunstancias legales.",
    ...(input.creditScope === "ENTIRE_CONTRACT_LIFE" && extensionMonths > 0 ? ["Las prórrogas constan temporalmente, pero no se vuelven a sumar porque la persona declara que el presupuesto máximo ya cubre toda la vigencia."] : []),
  ];
  if (input.successiveNeeds) warnings.push("En un contrato por necesidades y precios unitarios, las cantidades son estimadas y el presupuesto máximo no garantiza consumo; la DA 33.ª exige prever la modificación antes de agotarlo si aumentan las necesidades.");

  return {
    version: LB108_ECONOMIC_STARTING_POINT_VERSION,
    startingPoint: input.startingPoint,
    status: "CALCULATED_FOR_HUMAN_REVIEW",
    valuationPlan: { proposedMethodology: proposed.methodology, selectedMethodologies, selectedMethodology, rationale: proposed.rationale, allowedSupports, selectedSupports, supportingDocuments, evidenceSufficient: strictEvidenceFlow ? selectedSupports.length > 0 && supportingDocuments.length > 0 : Boolean(input.valuationEvidence.trim()) },
    budget: {
      availableCreditVatIncludedCents: gross,
      baseTenderBudgetExVatCents: base,
      vatAmountCents: vat,
      baseTenderBudgetVatIncludedCents: contractBudgetGross,
      ...(input.successiveNeeds ? { maximumApprovedBudgetCents: base } : {}),
      budgetCoversEntireContractLife: input.creditScope === "ENTIRE_CONTRACT_LIFE",
      costBreakdown: { directPercent, indirectPercent, otherPercent, directCostsExVatCents: directCosts, indirectCostsExVatCents: indirectCosts, otherCostsExVatCents: otherCosts },
      lotPblAllocations,
    },
    estimatedValue: {
      initialBaseCents: base,
      extensionsCents: extension,
      plannedModificationsCents: modification,
      optionsCents: options,
      otherComponentsCents: other,
      legalEstimatedValueCents: estimated,
      calculationMethod,
    },
    procedure: procedureCandidate(input.contractType, estimated),
    warnings,
    nextActions: ["Revisar y validar las magnitudes económicas.", "Definir criterios de adjudicación y condición del órgano contratante.", "Validar después el procedimiento propuesto."],
    legalBasis: [LEGAL.pbl, LEGAL.market, LEGAL.estimatedValue, LEGAL.components, LEGAL.method, LEGAL.file, LEGAL.procedure, LEGAL.abbreviated, LEGAL.minor, ...(input.successiveNeeds ? [LEGAL.successiveNeeds] : [])],
    humanValidationRequired: true,
    generationBlocked: true,
    productionReady: false,
  };
}
