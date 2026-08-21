import { UniversalExpedienteV13 } from "../domain/expediente/UniversalExpedienteV13";
import { isPromotableEvidenceField } from "../domain/expediente/EvidenceField";
import {
  canonicalCompatibilityView,
  synchronizeCanonicalIntoUniversal,
} from "../domain/expediente/UniversalCanonicalSynchronization";
import { buildCanonicalDocumentContext, CanonicalDocumentContextBuildResult } from "./CanonicalDocumentContextBuilder";
import { CanonicalLegalDocumentResults } from "./CanonicalLegalSupplement";

export function buildUniversalDocumentContext(
  expediente: UniversalExpedienteV13,
  generatedAt: Date = new Date(),
): CanonicalDocumentContextBuildResult {
  const synchronization = synchronizeCanonicalIntoUniversal(expediente);
  if (synchronization.blockers.length > 0) {
    return {
      ready: false,
      blockers: synchronization.blockers,
      warnings: ["Generación bloqueada por divergencia entre la autoridad universal y la vista canónica de compatibilidad."],
    };
  }

  const synchronized = synchronization.expediente;
  const legalResults: CanonicalLegalDocumentResults = {};

  if (isPromotableEvidenceField(synchronized.regulation.threshold) && synchronized.regulation.threshold.value !== null) {
    legalResults.threshold = synchronized.regulation.threshold;
  }
  if (isPromotableEvidenceField(synchronized.regulation.deadlines) && synchronized.regulation.deadlines.value !== null) {
    legalResults.deadlines = synchronized.regulation.deadlines;
  }

  const result = buildCanonicalDocumentContext(canonicalCompatibilityView(synchronized), generatedAt, legalResults);
  if (!result.ready || !result.context) return result;

  return {
    ...result,
    context: {
      ...result.context,
      version: "UNIVERSAL-DOCUMENT-CONTEXT-13.2-v1",
      request: {
        ...result.context.request,
        metadata: {
          ...result.context.request.metadata,
          universalSchemaVersion: synchronized.schemaVersion,
          universalAuthority: true,
          compatibilitySynchronization: "EXACT_ONLY",
        },
      },
    },
  };
}
