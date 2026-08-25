import { EvidenceField, isPromotableEvidenceField } from "../../../domain/expediente/EvidenceField";
import {
  UniversalDomainName,
  UniversalExpedienteV13,
  evaluateUniversalExpediente,
} from "../../../domain/expediente/UniversalExpedienteV13";
import { evaluateUniversalLegalRegimeClosure } from "../lb16/UniversalLegalRegimeOrchestrator";

export type UniversalDocumentReadinessStage =
  | "BLOCKED_LB16"
  | "NEEDS_UNIVERSAL_EVIDENCE"
  | "READY_FOR_DOCUMENT_MAPPING";

export interface UniversalDocumentReadinessResult {
  ready: boolean;
  stage: UniversalDocumentReadinessStage;
  blockers: readonly string[];
  pendingFields: readonly string[];
  conflictFields: readonly string[];
  domainCompleteness: Readonly<Record<UniversalDomainName, boolean>>;
}

function allUniversalFields(expediente: UniversalExpedienteV13): EvidenceField<unknown>[] {
  return [
    ...Object.values(expediente.processing),
    ...Object.values(expediente.regulation),
    ...Object.values(expediente.economic),
    ...Object.values(expediente.administrative),
    ...Object.values(expediente.technical),
    ...Object.values(expediente.lots),
    ...Object.values(expediente.guarantees),
    ...Object.values(expediente.execution),
    ...Object.values(expediente.criteria),
  ] as EvidenceField<unknown>[];
}

/**
 * Bloque 17.1 - puerta de disponibilidad documental universal.
 *
 * Esta puerta no genera documentos ni decide qué campos corresponden a cada
 * modelo PCAP/PPT/memoria. Su única responsabilidad es impedir que la capa
 * documental se construya sobre un expediente cuyo régimen jurídico (LB16) o
 * cuya evidencia universal todavía no estén cerrados.
 *
 * La correspondencia exacta campo -> apartado documental se resolverá en un
 * bloque posterior utilizando los modelos oficiales por tipo de contrato.
 */
export function evaluateUniversalDocumentReadiness(
  expediente: UniversalExpedienteV13,
): UniversalDocumentReadinessResult {
  const lb16 = evaluateUniversalLegalRegimeClosure(expediente);
  const universal = evaluateUniversalExpediente(expediente);
  const fields = allUniversalFields(expediente);

  const pendingFields = fields
    .filter(field => !isPromotableEvidenceField(field) && field.status !== "SOURCE_CONFLICT")
    .map(field => field.key);

  const conflictFields = fields
    .filter(field => field.status === "SOURCE_CONFLICT")
    .map(field => field.key);

  if (!lb16.ready) {
    return {
      ready: false,
      stage: "BLOCKED_LB16",
      blockers: lb16.blockers,
      pendingFields,
      conflictFields,
      domainCompleteness: universal.domainCompleteness,
    };
  }

  if (!universal.universallyComplete) {
    return {
      ready: false,
      stage: "NEEDS_UNIVERSAL_EVIDENCE",
      blockers: universal.blockers,
      pendingFields,
      conflictFields,
      domainCompleteness: universal.domainCompleteness,
    };
  }

  return {
    ready: true,
    stage: "READY_FOR_DOCUMENT_MAPPING",
    blockers: [],
    pendingFields: [],
    conflictFields: [],
    domainCompleteness: universal.domainCompleteness,
  };
}
