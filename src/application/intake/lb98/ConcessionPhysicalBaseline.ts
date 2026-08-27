export type ConcessionSubtype = "SERVICE_CONCESSION" | "WORKS_CONCESSION";

export interface ConcessionRealCaseEvidence {
  id: string;
  subtype: ConcessionSubtype;
  contractingAuthority: string;
  title: string;
  sourceUrl: string;
  hasPcap: boolean;
  hasPpt: boolean;
  hasMemory: boolean;
  hasViabilityStudy: boolean;
  editableBinaryVerified: false;
  generalizable: false;
}

/**
 * LB98 no dispone de modelo recomendado general de concesiones en el portal de
 * la Comisión Consultiva. El vertical se apoya en LCSP + expedientes reales.
 * El caso Puerto Real aporta PCAP, PPT, Memoria y estudio de viabilidad y se
 * registra únicamente como caso real de regresión, nunca como modelo general.
 */
export const LB98_CONCESSION_REAL_CASES: readonly ConcessionRealCaseEvidence[] = [
  {
    id: "JDA-SAS-PUERTO-REAL-CAFETERIA-CONCESSION-2021",
    subtype: "SERVICE_CONCESSION",
    contractingAuthority: "Servicio Andaluz de Salud",
    title: "Concesión de servicio de cafetería del Hospital Universitario de Puerto Real y máquinas expendedoras",
    sourceUrl: "https://www.juntadeandalucia.es/contratacion/document/ContractNoticeDetail.action?code=2022-0000001278&lite=N&request_locale=es",
    hasPcap: true,
    hasPpt: true,
    hasMemory: true,
    hasViabilityStudy: true,
    editableBinaryVerified: false,
    generalizable: false,
  },
] as const;

export function evaluateConcessionPhysicalBaseline() {
  const completeRealCase = LB98_CONCESSION_REAL_CASES.some(item => item.hasPcap && item.hasPpt && item.hasMemory && item.hasViabilityStudy);
  return {
    block: "LB98" as const,
    objective: "VERTICAL_CONCESSION_PHYSICAL_OPERATIONAL" as const,
    legalSourceCoverage: true,
    completeRealCaseLocated: completeRealCase,
    generalOfficialTemplateAvailable: false,
    editableConcessionBinaryPromoted: false,
    riskOperationalGateRequired: true,
    viabilityGateRequired: true,
    physicalPackageOperational: false,
    engineeringClosed: false,
    productionReady: false as const,
    humanValidationRequired: true as const,
    cases: LB98_CONCESSION_REAL_CASES,
    blockers: [
      "No existe en el catálogo vigente de modelos recomendados de la Junta una familia general de PCAP de concesiones comparable a Supply/Service/Works.",
      "Los documentos del caso real no pueden promocionarse como plantilla general sin aislamiento, identidad binaria y análisis de contaminación del expediente.",
      "Falta acreditar un paquete físico concesional y un E2E con riesgo operacional y viabilidad validados.",
    ],
  };
}
