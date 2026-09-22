export const LB110_CAPACITY_SOLVENCY_VERSION = "LB110-CAPACITY-SOLVENCY-V1" as const;
const LCSP = "https://www.boe.es/buscar/act.php?id=BOE-A-2017-12902";

export type LB110Procedure = "CONTRATO_MENOR" | "ABIERTO_SIMPLIFICADO_ABREVIADO" | "ABIERTO_SIMPLIFICADO" | "ABIERTO";
export type LB110ContractType = "SUPPLY" | "SERVICE";

export interface CapacityAndSolvencyInput {
  contractType: LB110ContractType;
  procedure: LB110Procedure;
  object: string;
  specificProfessionalAuthorizationRequired: boolean;
  professionalAuthorizationDetail?: string;
  professionalAuthorizationByLot?: readonly { lot: string; required: boolean; detail?: string }[];
  economicRequirement?: string;
  economicEvidence?: string;
  technicalRequirement?: string;
  technicalEvidence?: string;
  proportionalityReason?: string;
}

export interface SolvencyLegalBasis { id: string; article: string; paragraph: string; relevantOfficialExcerpt: string; officialUrl: string }
export interface DocumentaryStatement { element: "CAPACITY" | "PROHIBITIONS" | "PROFESSIONAL_AUTHORIZATION" | "CLASSIFICATION" | "ECONOMIC_SOLVENCY" | "TECHNICAL_SOLVENCY"; status: "APPLIES" | "NOT_REQUIRED"; text: string; destinations: readonly ("MEMORY" | "PCAP")[] }

export interface CapacityAndSolvencyResult {
  version: typeof LB110_CAPACITY_SOLVENCY_VERSION;
  regime: "SOLVENCY_ACCREDITATION_EXEMPT" | "SOLVENCY_REQUIREMENTS_REQUIRED" | "MINOR_CONTRACT_APTITUDE";
  documentaryStatements: readonly DocumentaryStatement[];
  warnings: readonly string[];
  legalBasis: readonly SolvencyLegalBasis[];
  humanValidationRequired: true;
  generationBlocked: true;
  productionReady: false;
}

const basis = (id: string, article: string, paragraph: string, excerpt: string): SolvencyLegalBasis => ({ id, article, paragraph, relevantOfficialExcerpt: excerpt, officialUrl: `${LCSP}#a${article.replace(/[^0-9]/g, "")}` });
const LEGAL = {
  capacity: basis("LCSP-65.1-2", "65", "1 y 2", "Solo pueden contratar quienes tengan capacidad de obrar, no estén incursos en prohibición y cuenten con la habilitación empresarial o profesional exigible."),
  solvency: basis("LCSP-74.1-2", "74", "1 y 2", "Cuando se exija solvencia, sus requisitos y documentos deben figurar en el anuncio y el pliego, vinculados al objeto y proporcionados."),
  classification: basis("LCSP-77.1.c", "77", "1.c", "La clasificación no es exigible en contratos distintos de obras; deben detallarse, cuando proceda, los requisitos específicos de solvencia."),
  means: basis("LCSP-86.1", "86", "1", "La solvencia se acredita mediante los documentos determinados por el órgano de contratación entre los previstos legalmente."),
  economic: basis("LCSP-87.1-4", "87", "1 a 4", "Los pliegos deben concretar medios e importes mínimos de solvencia económica, de forma proporcional y sin obstaculizar a las pymes."),
  supply: basis("LCSP-89.1", "89", "1", "La solvencia técnica en suministros se acredita mediante uno o varios de los medios legalmente enumerados."),
  service: basis("LCSP-90.1", "90", "1", "La solvencia técnica o profesional en servicios se aprecia mediante uno o varios de los medios legalmente enumerados."),
  detail: basis("LCSP-92", "92", "único", "El órgano de contratación debe concretar en los pliegos magnitudes, parámetros y umbrales de admisión o exclusión."),
  asa: basis("LCSP-159.6.b", "159", "6.b", "En el abierto simplificado abreviado se exime a los licitadores de acreditar la solvencia económica y financiera y técnica o profesional."),
  minor: basis("LCSP-118", "118", "1 a 3", "El expediente del contrato menor sigue su régimen específico de necesidad, no fraccionamiento y aprobación del gasto."),
} as const;

function required(value: string | undefined, message: string): string {
  const clean = value?.trim();
  if (!clean) throw new Error(message);
  return clean;
}

export function evaluateCapacityAndSolvency(input: CapacityAndSolvencyInput): CapacityAndSolvencyResult {
  if (!input.object?.trim()) throw new Error("Debe existir un objeto contractual validado.");
  const authorization = input.professionalAuthorizationByLot?.length
    ? input.professionalAuthorizationByLot.map((lot) => lot.required
      ? `${lot.lot}: se exige ${required(lot.detail, `Debe concretarse la habilitación de ${lot.lot}.`)}`
      : `${lot.lot}: no se ha identificado habilitación específica tras comprobar la actividad.`).join(" ")
    : input.specificProfessionalAuthorizationRequired
    ? required(input.professionalAuthorizationDetail, "Debe concretarse la habilitación empresarial o profesional exigible.")
    : "No se exige habilitación empresarial o profesional específica para esta prestación, sin perjuicio de las autorizaciones generales legalmente necesarias para ejercer la actividad.";
  const common: DocumentaryStatement[] = [
    { element: "CAPACITY", status: "APPLIES", text: "Las personas licitadoras deberán tener plena capacidad de obrar y su objeto o ámbito de actividad deberá comprender las prestaciones del contrato.", destinations: ["MEMORY", "PCAP"] },
    { element: "PROHIBITIONS", status: "APPLIES", text: "Las personas licitadoras no podrán estar incursas en prohibición de contratar con el sector público.", destinations: ["MEMORY", "PCAP"] },
    { element: "PROFESSIONAL_AUTHORIZATION", status: input.specificProfessionalAuthorizationRequired ? "APPLIES" : "NOT_REQUIRED", text: input.professionalAuthorizationByLot?.length ? authorization : input.specificProfessionalAuthorizationRequired ? `Se exige la siguiente habilitación empresarial o profesional: ${authorization}` : authorization, destinations: ["MEMORY", "PCAP"] },
    { element: "CLASSIFICATION", status: "NOT_REQUIRED", text: "No se exige clasificación empresarial, por tratarse de un contrato de suministro o servicios; en su caso, la solvencia se rige por los requisitos específicos del pliego.", destinations: ["MEMORY", "PCAP"] },
  ];
  const warnings: string[] = [];
  let regime: CapacityAndSolvencyResult["regime"];

  if (input.procedure === "ABIERTO_SIMPLIFICADO_ABREVIADO") {
    regime = "SOLVENCY_ACCREDITATION_EXEMPT";
    common.push(
      { element: "ECONOMIC_SOLVENCY", status: "NOT_REQUIRED", text: "No se exige la acreditación de solvencia económica y financiera, conforme al artículo 159.6.b) LCSP, por tramitarse mediante procedimiento abierto simplificado abreviado.", destinations: ["MEMORY", "PCAP"] },
      { element: "TECHNICAL_SOLVENCY", status: "NOT_REQUIRED", text: "No se exige la acreditación de solvencia técnica o profesional, conforme al artículo 159.6.b) LCSP, por tramitarse mediante procedimiento abierto simplificado abreviado.", destinations: ["MEMORY", "PCAP"] },
    );
    warnings.push("La exención afecta a la acreditación de solvencia; no elimina capacidad, ausencia de prohibiciones ni habilitación específica cuando sea legalmente exigible.");
  } else if (input.procedure === "CONTRATO_MENOR") {
    regime = "MINOR_CONTRACT_APTITUDE";
    common.push(
      { element: "ECONOMIC_SOLVENCY", status: "NOT_REQUIRED", text: "No se establecen requisitos específicos de acreditación de solvencia económica en este expediente de contrato menor; se mantiene la comprobación de aptitud y el régimen del artículo 118 LCSP.", destinations: ["MEMORY", "PCAP"] },
      { element: "TECHNICAL_SOLVENCY", status: "NOT_REQUIRED", text: "No se establecen requisitos específicos de acreditación de solvencia técnica en este expediente de contrato menor; la empresa deberá disponer de aptitud profesional para ejecutar la prestación.", destinations: ["MEMORY", "PCAP"] },
    );
    warnings.push("El contrato menor no debe utilizarse para necesidades recurrentes ni para fraccionar el objeto; normalmente no requiere pliegos, aunque la decisión queda documentada expresamente.");
  } else {
    regime = "SOLVENCY_REQUIREMENTS_REQUIRED";
    const economic = required(input.economicRequirement, "Debe concretarse el requisito de solvencia económica.");
    const economicEvidence = required(input.economicEvidence, "Debe concretarse el medio de acreditación de la solvencia económica.");
    const technical = required(input.technicalRequirement, "Debe concretarse el requisito de solvencia técnica o profesional.");
    const technicalEvidence = required(input.technicalEvidence, "Debe concretarse el medio de acreditación de la solvencia técnica o profesional.");
    const proportionality = required(input.proportionalityReason, "Debe motivarse la vinculación y proporcionalidad de la solvencia con el objeto.");
    common.push(
      { element: "ECONOMIC_SOLVENCY", status: "APPLIES", text: `Solvencia económica exigida: ${economic}. Medio de acreditación: ${economicEvidence}. Motivación de proporcionalidad: ${proportionality}`, destinations: ["MEMORY", "PCAP"] },
      { element: "TECHNICAL_SOLVENCY", status: "APPLIES", text: `Solvencia ${input.contractType === "SUPPLY" ? "técnica" : "técnica o profesional"} exigida: ${technical}. Medio de acreditación: ${technicalEvidence}. Motivación de proporcionalidad: ${proportionality}`, destinations: ["MEMORY", "PCAP"] },
    );
  }

  return { version: LB110_CAPACITY_SOLVENCY_VERSION, regime, documentaryStatements: common, warnings, legalBasis: [LEGAL.capacity, LEGAL.solvency, LEGAL.classification, LEGAL.means, LEGAL.economic, input.contractType === "SUPPLY" ? LEGAL.supply : LEGAL.service, LEGAL.detail, ...(input.procedure === "ABIERTO_SIMPLIFICADO_ABREVIADO" ? [LEGAL.asa] : []), ...(input.procedure === "CONTRATO_MENOR" ? [LEGAL.minor] : [])], humanValidationRequired: true, generationBlocked: true, productionReady: false };
}
