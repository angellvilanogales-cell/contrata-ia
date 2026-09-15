import { CanonicalExpedienteState } from "../../domain/expediente/CanonicalExpedienteState";
import { DocumentType } from "../../domain/documentModel/DocumentType";
import { FinancingProfile, TechnicalDocumentFamily } from "../../domain/documentModel/DocumentarySourceEvidenceCatalogue";
import { selectDocumentFromCanonicalExpediente } from "./CanonicalUniversalDocumentSelector";

export type UniversalDocumentRenderDecision = "RENDER_ALLOWED" | "BLOCKED";

export interface UniversalDocumentPreflightRow {
  documentType: DocumentType;
  decision: UniversalDocumentRenderDecision;
  selectedSourceId?: string;
  blockers: readonly string[];
}

export interface UniversalAdministrativePackagePreflight {
  packageReady: boolean;
  documents: readonly UniversalDocumentPreflightRow[];
  blockers: readonly string[];
  humanAcceptanceStillRequired: true;
}

export interface UniversalDocumentContextByType {
  financing: FinancingProfile;
  technicalFamilyByDocument: Partial<Record<DocumentType, TechnicalDocumentFamily>>;
}

const REQUIRED_PACKAGE: readonly DocumentType[] = [DocumentType.MEMORY, DocumentType.PCAP, DocumentType.PPT];

/**
 * LB91.48-50 — primer preflight E2E universal basado en disponibilidad física real.
 * RENDER_ALLOWED solo se emite cuando el selector llega a GENERAL_EDITABLE_SELECTED.
 * Un activo de caso, una referencia estructural o una fuente pendiente de aislamiento
 * jamás habilitan render universal. El paquete requiere Memoria + PCAP + PPT.
 */
export function evaluateUniversalAdministrativePackagePreflight(
  state: CanonicalExpedienteState,
  context: UniversalDocumentContextByType,
): UniversalAdministrativePackagePreflight {
  const documents = REQUIRED_PACKAGE.map(documentType => {
    const result = selectDocumentFromCanonicalExpediente(state, documentType, {
      financing: context.financing,
      technicalFamily: context.technicalFamilyByDocument[documentType],
    });
    const renderAllowed = result.readyForSelection && result.selection?.status === "GENERAL_EDITABLE_SELECTED";
    return {
      documentType,
      decision: renderAllowed ? "RENDER_ALLOWED" as const : "BLOCKED" as const,
      selectedSourceId: result.selection?.selected?.id,
      blockers: renderAllowed ? [] : result.blockers,
    };
  });

  const blockers = documents
    .filter(item => item.decision === "BLOCKED")
    .flatMap(item => item.blockers.map(blocker => `${item.documentType}: ${blocker}`));

  return {
    packageReady: documents.every(item => item.decision === "RENDER_ALLOWED"),
    documents,
    blockers,
    humanAcceptanceStillRequired: true,
  };
}
