import type {
  AdministrativeDocument,
  DocumentParagraph,
  DocumentSection,
  LB5DocumentPackage
} from "../lb5/DocumentModel";
import type { EventTechnicalOutline } from "../../intake/lb7/EventServicesProfile";

function paragraph(text: string): DocumentParagraph {
  return { text, sourceIds: [], validation: "PENDING_HUMAN_VALIDATION" };
}

function section(id: string, heading: string, items: readonly string[]): DocumentSection {
  return {
    id: `CUSTOM:${id}`,
    heading,
    paragraphs: items.map(paragraph)
  };
}

function append(document: AdministrativeDocument, sections: readonly DocumentSection[], warnings: readonly string[]): AdministrativeDocument {
  return {
    ...document,
    sections: [...document.sections, ...sections],
    warnings: [...document.warnings, ...warnings],
    validation: {
      ...document.validation,
      warnings: [...document.validation.warnings, ...warnings]
    }
  };
}

/**
 * Proyecta los hechos validados del perfil EVENT_SERVICES sobre los documentos
 * administrativos ya compuestos. No introduce reglas jurídicas nuevas ni
 * transforma los patrones observados en normativa.
 */
export function augmentEventServicesPackage(
  packageValue: LB5DocumentPackage,
  outline: EventTechnicalOutline
): LB5DocumentPackage {
  if (!outline.readyForDocumentDraft) {
    throw new Error(`EVENT_SERVICES no puede generar borrador documental con datos técnicos pendientes: ${outline.warnings.join(" ")}`);
  }

  const memorySections = outline.sections
    .filter(item => ["Objeto, eventos y finalidad", "Calendario, localidades, lotes y CPV"].includes(item.heading))
    .map((item, index) => section(`EVENT_MEMORY_${index + 1}`, `Configuración específica del servicio de eventos — ${item.heading}`, item.items));

  const pptSections = outline.sections.map((item, index) =>
    section(`EVENT_PPT_${index + 1}`, item.heading, item.items)
  );

  const documents = packageValue.documents.map(document => {
    if (document.kind === "MEMORIA_JUSTIFICATIVA") return append(document, memorySections, []);
    if (document.kind === "PPT") return append(document, pptSections, []);
    return document;
  });

  return {
    ...packageValue,
    documents,
    coherenceFingerprint: {
      ...packageValue.coherenceFingerprint,
      specializedFamily: "EVENT_SERVICES",
      eventSections: outline.sections.length
    }
  };
}
