import {
  auditLb106DecisionMatrix,
  LB106_DECISION_MATRIX_VERSION,
  LCSP_CONSOLIDATED_AT,
} from "../../domain/decision/lb106/VirginPilotDecisionMatrix";

/**
 * Estado inicial del primer expediente piloto genuinamente virgen.
 * No contiene hechos, importes ni decisiones procedentes de expedientes fuente.
 */
export function evaluateLB106VirginPilotReadiness() {
  const matrixAudit = auditLb106DecisionMatrix();
  return {
    readyForHumanStart: matrixAudit.ready,
    readyForGeneration: false,
    virgin: true,
    answersPreloaded: false,
    sourceCaseIdsUsed: [] as string[],
    factualValues: {},
    supportedScope: {
      contractType: "SUPPLY",
      procedure: "ABIERTO_SIMPLIFICADO_ABREVIADO",
      funding: "AUTOFINANCED",
    },
    documents: {
      pcap: {
        templateId: "JDA-PCAP-SUPPLY-ASA-AUTOFINANCED-2025-12-17",
        policy: "MODELO_OFICIAL_INMUTABLE_SOLO_DESTINOS_AUTORIZADOS",
      },
      memory: {
        templateId: "contrata-ia:supply:memory:general:LB105-SUPPLY-CANONICAL-ODT-V1",
        canonicalSections: 19,
      },
      ppt: {
        templateId: "contrata-ia:supply:ppt:general:LB105-SUPPLY-CANONICAL-ODT-V1",
        canonicalSections: 12,
      },
    },
    decisionMatrixVersion: LB106_DECISION_MATRIX_VERSION,
    legalConsolidatedAt: LCSP_CONSOLIDATED_AT,
    matrixAudit,
    startRule: "La persona aporta los hechos desde cero y valida, modifica o rechaza cada propuesta motivada antes de generar.",
    syntheticTestsCountAsHumanAcceptance: false,
    humanConsentRequired: true,
    productionReady: false,
  } as const;
}
