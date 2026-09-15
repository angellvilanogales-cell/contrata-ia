import { CanonicalExpedienteState } from "../../domain/expediente/CanonicalExpedienteState";
import { DocumentType } from "../../domain/documentModel/DocumentType";
import { FinancingProfile, TechnicalDocumentFamily } from "../../domain/documentModel/DocumentarySourceEvidenceCatalogue";
import { selectDocumentFromCanonicalExpediente } from "./CanonicalUniversalDocumentSelector";

export interface UniversalPhysicalRendererAdapter {
  render(input: {
    expedienteId: string;
    documentType: DocumentType;
    sourceId: string;
    state: CanonicalExpedienteState;
  }): Promise<{ outputId: string }>;
}

export type UniversalPhysicalRenderResult =
  | { status: "RENDERED"; sourceId: string; outputId: string; humanAcceptanceStillRequired: true }
  | { status: "BLOCKED"; blockers: readonly string[]; humanAcceptanceStillRequired: true };

/**
 * LB91.53-54 — puente productivo entre la selección documental y un renderer físico.
 * El adaptador nunca se invoca si la fuente no es GENERAL_EDITABLE_SELECTED.
 */
export async function renderUniversalPhysicalDocument(
  state: CanonicalExpedienteState,
  documentType: DocumentType,
  context: { financing: FinancingProfile; technicalFamily?: TechnicalDocumentFamily },
  renderer: UniversalPhysicalRendererAdapter,
): Promise<UniversalPhysicalRenderResult> {
  const selected = selectDocumentFromCanonicalExpediente(state, documentType, context);
  if (!selected.readyForSelection || selected.selection?.status !== "GENERAL_EDITABLE_SELECTED" || !selected.selection.selected) {
    return {
      status: "BLOCKED",
      blockers: selected.blockers.length ? selected.blockers : ["No existe plantilla general editable acreditada para render físico."],
      humanAcceptanceStillRequired: true,
    };
  }

  const sourceId = selected.selection.selected.id;
  const rendered = await renderer.render({ expedienteId: state.id, documentType, sourceId, state });
  return { status: "RENDERED", sourceId, outputId: rendered.outputId, humanAcceptanceStillRequired: true };
}
