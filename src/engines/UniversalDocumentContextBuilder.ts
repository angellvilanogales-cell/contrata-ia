import { UniversalExpedienteV13 } from "../domain/expediente/UniversalExpedienteV13";
import { isPromotableEvidenceField } from "../domain/expediente/EvidenceField";
import { buildCanonicalDocumentContext, CanonicalDocumentContextBuildResult } from "./CanonicalDocumentContextBuilder";
import { CanonicalLegalDocumentResults } from "./CanonicalLegalSupplement";

export function buildUniversalDocumentContext(
  expediente: UniversalExpedienteV13,
  generatedAt: Date = new Date(),
): CanonicalDocumentContextBuildResult {
  const legalResults: CanonicalLegalDocumentResults = {};

  if (isPromotableEvidenceField(expediente.regulation.threshold) && expediente.regulation.threshold.value !== null) {
    legalResults.threshold = expediente.regulation.threshold;
  }
  if (isPromotableEvidenceField(expediente.regulation.deadlines) && expediente.regulation.deadlines.value !== null) {
    legalResults.deadlines = expediente.regulation.deadlines;
  }

  const result = buildCanonicalDocumentContext(expediente.canonical, generatedAt, legalResults);
  if (!result.ready || !result.context) return result;

  return {
    ...result,
    context: {
      ...result.context,
      version: "UNIVERSAL-DOCUMENT-CONTEXT-13.1-v1",
      request: {
        ...result.context.request,
        metadata: {
          ...result.context.request.metadata,
          universalSchemaVersion: expediente.schemaVersion,
          universalAuthority: true,
        },
      },
    },
  };
}
