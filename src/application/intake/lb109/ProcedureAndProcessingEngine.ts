export const LB109_PROCEDURE_PROCESSING_VERSION = "LB109-PROCEDURE-PROCESSING-V1" as const;

const LCSP_URL = "https://www.boe.es/buscar/act.php?id=BOE-A-2017-12902";

export type LB109ContractType = "SUPPLY" | "SERVICE";
export type AuthorityProfile = "AGE_CENTRAL" | "OTHER_PUBLIC_ADMINISTRATION";
export type ProcessingPreference = "ORDINARY" | "URGENT" | "EMERGENCY_CLAIMED";
export type ProposedProcedure = "CONTRATO_MENOR" | "ABIERTO_SIMPLIFICADO_ABREVIADO" | "ABIERTO_SIMPLIFICADO" | "ABIERTO";

export interface ProcedureAndProcessingInput {
  contractType: LB109ContractType;
  pblVatIncludedCents: number;
  legalEstimatedValueExVatCents: number;
  authorityProfile: AuthorityProfile;
  annexIvService?: boolean;
  intellectualService?: boolean;
  recurrentOrForeseeableNeed: boolean;
  artificialSplittingRisk: boolean;
  allAwardCriteriaFormulaBased: boolean;
  judgmentCriteriaPercent: number;
  processingPreference: ProcessingPreference;
  urgencyReasons?: string;
  emergencyFacts?: string;
}

export interface ProcedureLegalBasis {
  id: string;
  article: string;
  paragraph: string;
  relevantOfficialExcerpt: string;
  officialUrl: string;
}

export interface ProcedureAndProcessingResult {
  version: typeof LB109_PROCEDURE_PROCESSING_VERSION;
  thresholdBasis: {
    magnitude: "LEGAL_ESTIMATED_VALUE_EX_VAT";
    amountCents: number;
    pblVatIncludedCents: number;
    explanation: string;
  };
  proposedProcedure: ProposedProcedure;
  processingType: "ORDINARIA" | "URGENTE" | "EMERGENCIA_REQUIERE_EXPEDIENTE_SEPARADO";
  harmonizedRegulation: boolean;
  recommendation: string;
  reasons: readonly string[];
  warnings: readonly string[];
  alternativesDiscarded: readonly { procedure: ProposedProcedure | "URGENTE" | "EMERGENCIA"; reason: string }[];
  legalBasis: readonly ProcedureLegalBasis[];
  humanValidationRequired: true;
  generationBlocked: true;
  productionReady: false;
}

const basis = (id: string, article: string, paragraph: string, excerpt: string): ProcedureLegalBasis => ({
  id, article, paragraph, relevantOfficialExcerpt: excerpt,
  officialUrl: `${LCSP_URL}#a${article.replace(/[^0-9]/g, "")}`,
});

const LEGAL = {
  ve: basis("LCSP-101.1.a", "101", "1.a", "Para obras, suministros y servicios, el valor estimado toma el importe total sin incluir el IVA."),
  general: basis("LCSP-131.2", "131", "2", "La adjudicación se realizará ordinariamente utilizando una pluralidad de criterios y el procedimiento abierto o restringido."),
  minor: basis("LCSP-118.1-2", "118", "1 y 2", "En suministros y servicios, el contrato menor exige valor estimado inferior a 15.000 euros y justificación de la necesidad y del no fraccionamiento."),
  simplified: basis("LCSP-159.1", "159", "1", "El abierto simplificado depende del valor estimado y limita el peso de los criterios evaluables mediante juicio de valor."),
  abbreviated: basis("LCSP-159.6", "159", "6", "En suministros y servicios con valor estimado inferior a 60.000 euros puede emplearse la tramitación abreviada, salvo prestaciones intelectuales, con criterios automáticos."),
  urgent: basis("LCSP-119.1-2", "119", "1 y 2", "La urgencia requiere declaración motivada por necesidad inaplazable o aceleración por interés público y aplica especialidades de tramitación."),
  emergency: basis("LCSP-120.1", "120", "1", "La emergencia queda reservada a acontecimientos catastróficos, grave peligro o necesidades de defensa nacional."),
  saraSupply: basis("LCSP-21.1", "21", "1", "Los umbrales de regulación armonizada de suministros se aplican sobre el valor estimado."),
  saraService: basis("LCSP-22.1", "22", "1", "Los umbrales de regulación armonizada de servicios se aplican sobre el valor estimado."),
} as const;

function natural(value: number, label: string): number {
  if (!Number.isInteger(value) || value < 0) throw new Error(`${label} debe ser un entero no negativo expresado en céntimos.`);
  return value;
}

export function evaluateProcedureAndProcessing(input: ProcedureAndProcessingInput): ProcedureAndProcessingResult {
  if (input.contractType !== "SUPPLY" && input.contractType !== "SERVICE") throw new Error("Debe existir un tipo de contrato validado.");
  const ve = natural(input.legalEstimatedValueExVatCents, "El valor estimado sin IVA");
  const pbl = natural(input.pblVatIncludedCents, "El PBL con IVA");
  if (!ve || !pbl) throw new Error("PBL con IVA y valor estimado sin IVA deben ser superiores a cero.");
  const judgment = natural(input.judgmentCriteriaPercent, "El porcentaje de criterios sujetos a juicio de valor");
  if (judgment > 100) throw new Error("El porcentaje de juicio de valor no puede superar el 100 %.");

  const euros = ve / 100;
  const saraThreshold = input.contractType === "SERVICE" && input.annexIvService
    ? 750_000
    : input.authorityProfile === "AGE_CENTRAL" ? 140_000 : 216_000;
  const harmonized = euros >= saraThreshold;
  const reasons: string[] = [`El umbral se contrasta con ${euros.toLocaleString("es-ES")} € de valor estimado sin IVA; el PBL con IVA de ${(pbl / 100).toLocaleString("es-ES")} € se conserva como límite de gasto, no como umbral procedimental.`];
  const warnings: string[] = [];
  const discarded: ProcedureAndProcessingResult["alternativesDiscarded"][number][] = [];
  let proposed: ProposedProcedure;

  const minorQuantitativelyPossible = euros < 15_000;
  if (minorQuantitativelyPossible && !input.recurrentOrForeseeableNeed && !input.artificialSplittingRisk) {
    proposed = "CONTRATO_MENOR";
    reasons.push("El valor estimado es inferior a 15.000 € y no se ha declarado recurrencia ni riesgo de fraccionamiento.");
  } else if (euros < 60_000 && !input.intellectualService && input.allAwardCriteriaFormulaBased && judgment === 0) {
    proposed = "ABIERTO_SIMPLIFICADO_ABREVIADO";
    reasons.push("El valor estimado es inferior a 60.000 €, no se declara prestación intelectual y todos los criterios son automáticos.");
    if (minorQuantitativelyPossible) discarded.push({ procedure: "CONTRATO_MENOR", reason: input.recurrentOrForeseeableNeed ? "La necesidad recurrente o previsible aconseja licitación." : "Existe riesgo declarado de fraccionamiento." });
  } else if (euros < 140_000 && judgment <= (input.intellectualService ? 45 : 25)) {
    proposed = "ABIERTO_SIMPLIFICADO";
    reasons.push(`El valor estimado es inferior a 140.000 € y el juicio de valor no supera el límite aplicable (${input.intellectualService ? 45 : 25} %).`);
    if (euros < 60_000) discarded.push({ procedure: "ABIERTO_SIMPLIFICADO_ABREVIADO", reason: input.intellectualService ? "No es aplicable a prestaciones intelectuales." : "No todos los criterios son automáticos." });
  } else {
    proposed = "ABIERTO";
    reasons.push("No se acreditan acumulativamente las condiciones de las modalidades simplificadas; se propone el procedimiento abierto ordinario.");
    if (euros < 140_000) discarded.push({ procedure: "ABIERTO_SIMPLIFICADO", reason: `El juicio de valor supera el límite aplicable del ${input.intellectualService ? 45 : 25} %.` });
  }

  let processing: ProcedureAndProcessingResult["processingType"] = "ORDINARIA";
  if (input.processingPreference === "URGENT") {
    if (!input.urgencyReasons?.trim()) throw new Error("La tramitación urgente exige una motivación concreta.");
    processing = "URGENTE";
    warnings.push("La urgencia no deriva de la cuantía ni del procedimiento: debe declararse y motivarse expresamente en el expediente.");
  } else if (input.processingPreference === "EMERGENCY_CLAIMED") {
    if (!input.emergencyFacts?.trim()) throw new Error("Debe describirse el acontecimiento que se considera emergencia.");
    processing = "EMERGENCIA_REQUIERE_EXPEDIENTE_SEPARADO";
    warnings.push("La emergencia no se valida en este recorrido ordinario. Requiere comprobar estrictamente el artículo 120 y un tratamiento específico.");
    discarded.push({ procedure: "EMERGENCIA", reason: "No puede confirmarse automáticamente dentro del generador ordinario de pliegos." });
  } else {
    discarded.push({ procedure: "URGENTE", reason: "No se ha declarado una necesidad inaplazable ni una aceleración motivada por interés público." });
  }

  if (harmonized) warnings.push(`El contrato alcanza el umbral SARA considerado (${saraThreshold.toLocaleString("es-ES")} € sin IVA); deben aplicarse publicidad y plazos armonizados.`);
  if (input.artificialSplittingRisk) warnings.push("Existe riesgo declarado de fraccionamiento: debe revisarse el objeto y agregar las necesidades previsibles antes de validar el procedimiento.");

  return {
    version: LB109_PROCEDURE_PROCESSING_VERSION,
    thresholdBasis: { magnitude: "LEGAL_ESTIMATED_VALUE_EX_VAT", amountCents: ve, pblVatIncludedCents: pbl, explanation: "La LCSP incluye el IVA en el PBL como límite de gasto (art. 100), pero excluye el IVA del valor estimado que determina los umbrales de procedimiento (art. 101)." },
    proposedProcedure: proposed,
    processingType: processing,
    harmonizedRegulation: harmonized,
    recommendation: `${proposed} · tramitación ${processing}`,
    reasons,
    warnings,
    alternativesDiscarded: discarded,
    legalBasis: [LEGAL.ve, LEGAL.general, LEGAL.minor, LEGAL.simplified, LEGAL.abbreviated, LEGAL.urgent, LEGAL.emergency, input.contractType === "SUPPLY" ? LEGAL.saraSupply : LEGAL.saraService],
    humanValidationRequired: true,
    generationBlocked: true,
    productionReady: false,
  };
}
