import type { CustomDocumentRequest, DocumentBlockId } from "./DocumentModel";

export type ProceduralDraftId =
  | "PROPUESTA_INICIO"
  | "SOLICITUD_EXISTENCIA_CREDITO"
  | "ACUERDO_INICIO"
  | "SOLICITUD_INFORME_JURIDICO";

interface ProceduralDraftDefinition {
  readonly title: string;
  readonly blocks: readonly DocumentBlockId[];
  readonly introduction: string;
}

const DEFINITIONS: Readonly<Record<ProceduralDraftId, ProceduralDraftDefinition>> = {
  PROPUESTA_INICIO: {
    title: "Propuesta de inicio del expediente de contratación",
    blocks: ["IDENTIFICATION", "NEED_IDONEITY", "OBJECT_CPV", "LOTS", "BUDGET_VALUE", "PROCEDURE", "LEGAL_TRACEABILITY"],
    introduction: "Borrador de propuesta de inicio. El impulso procedimental y la firma corresponden a la unidad u órgano competente."
  },
  SOLICITUD_EXISTENCIA_CREDITO: {
    title: "Solicitud de existencia de crédito",
    blocks: ["IDENTIFICATION", "BUDGET_VALUE", "LEGAL_TRACEABILITY"],
    introduction: "Borrador documental previo a su tramitación en el sistema presupuestario competente. No sustituye al certificado ni a la retención de crédito generados por dicho sistema."
  },
  ACUERDO_INICIO: {
    title: "Borrador de acuerdo de inicio del expediente",
    blocks: ["IDENTIFICATION", "NEED_IDONEITY", "OBJECT_CPV", "LOTS", "BUDGET_VALUE", "PROCEDURE", "LEGAL_TRACEABILITY"],
    introduction: "Borrador de apoyo. La decisión administrativa y su firma pertenecen al órgano competente y no son automatizadas por Contrata-IA."
  },
  SOLICITUD_INFORME_JURIDICO: {
    title: "Solicitud de informe a la Asesoría Jurídica",
    blocks: ["IDENTIFICATION", "ADMINISTRATIVE_REGIME", "OBJECT_CPV", "PROCEDURE", "LEGAL_TRACEABILITY"],
    introduction: "Borrador de solicitud para remitir el expediente y sus proyectos documentales al órgano de asesoramiento jurídico. Contrata-IA no sustituye ni simula el informe jurídico resultante."
  }
};

export class ProceduralDraftFactory {
  public create(id: ProceduralDraftId): CustomDocumentRequest {
    const definition = DEFINITIONS[id];
    return {
      title: definition.title,
      fileBaseName: id.toLocaleLowerCase("es-ES").replaceAll("_", "-"),
      blockIds: definition.blocks,
      introductoryText: definition.introduction
    };
  }

  public supported(): readonly ProceduralDraftId[] {
    return Object.keys(DEFINITIONS) as ProceduralDraftId[];
  }
}
