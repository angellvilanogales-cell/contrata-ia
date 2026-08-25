import {
  UniversalDocumentMappingPackageResult,
  UniversalMappedDocument,
  UniversalMappedDocumentFact,
} from "../lb17/UniversalDocumentMappingPackage";
import { UniversalAdministrativeDocumentKind } from "../lb17/UniversalOfficialTemplateCatalog";

export type UniversalEditableTemplateFormat = "DOCX" | "ODT";

export interface UniversalEditableTemplateAsset {
  templateId: string;
  sourceId: string;
  documentKind: UniversalAdministrativeDocumentKind;
  format: UniversalEditableTemplateFormat;
  mediaType: string;
  contentHash: string;
  styleFingerprint: string;
  slotIds: readonly string[];
  editable: true;
}

export interface UniversalEditableTemplateStore {
  get(templateId: string): Promise<UniversalEditableTemplateAsset | null>;
}

export interface UniversalTemplateRenderValue {
  slotId: string;
  value: unknown;
  sourceFieldKey: string;
}

export interface UniversalEditableTemplateRenderRequest {
  asset: UniversalEditableTemplateAsset;
  values: readonly UniversalTemplateRenderValue[];
}

export interface UniversalRenderedEditableDocument {
  templateId: string;
  sourceId: string;
  documentKind: UniversalAdministrativeDocumentKind;
  format: UniversalEditableTemplateFormat;
  mediaType: string;
  originalContentHash: string;
  originalStyleFingerprint: string;
  renderedContentHash: string;
  renderedStyleFingerprint: string;
  appliedSlots: readonly string[];
  bytes: Uint8Array;
}

/**
 * Puerto de renderizado. La implementación concreta debe editar el paquete
 * DOCX/ODT partiendo del propio modelo oficial, no reconstruir el documento
 * desde cero. La separación evita introducir una librería que cambie estilos,
 * numeración, cabeceras o símbolos administrativos.
 */
export interface UniversalEditableTemplateRendererPort {
  render(request: UniversalEditableTemplateRenderRequest): Promise<UniversalRenderedEditableDocument>;
}

export type UniversalEditableRenderingStage =
  | "BLOCKED_LB17"
  | "NEEDS_EDITABLE_TEMPLATE"
  | "INVALID_TEMPLATE_ASSET"
  | "RENDER_FAILED"
  | "READY_FOR_DOCUMENT_AUDIT";

export interface UniversalEditableRenderingResult {
  ready: boolean;
  stage: UniversalEditableRenderingStage;
  documents: readonly UniversalRenderedEditableDocument[];
  blockers: readonly string[];
}

function validateAsset(document: UniversalMappedDocument, asset: UniversalEditableTemplateAsset): string[] {
  const blockers: string[] = [];
  if (!asset.editable) blockers.push(`El modelo ${asset.templateId} no está marcado como editable.`);
  if (asset.templateId !== document.template.templateId) blockers.push(`El activo editable no coincide con el templateId oficial de ${document.documentKind}.`);
  if (asset.sourceId !== document.template.sourceId) blockers.push(`El activo editable ${asset.templateId} no conserva el sourceId oficial acreditado.`);
  if (asset.documentKind !== document.documentKind) blockers.push(`El activo ${asset.templateId} pertenece a ${asset.documentKind}, no a ${document.documentKind}.`);
  if (!asset.contentHash.trim()) blockers.push(`El activo ${asset.templateId} carece de huella de contenido.`);
  if (!asset.styleFingerprint.trim()) blockers.push(`El activo ${asset.templateId} carece de huella de estilo.`);

  const slots = new Set(asset.slotIds);
  for (const fact of document.facts) {
    if (!slots.has(fact.slotId)) blockers.push(`El modelo editable ${asset.templateId} no contiene el slot ${fact.slotId}.`);
  }
  return blockers;
}

function factToValue(fact: UniversalMappedDocumentFact): UniversalTemplateRenderValue {
  return { slotId: fact.slotId, value: fact.value, sourceFieldKey: fact.fieldKey };
}

/**
 * Bloques 18.1-18.3: resuelve el activo editable exacto y aplica únicamente
 * los valores ya protegidos por LB17. No redacta texto nuevo ni permite usar
 * otro modelo como fallback.
 */
export async function renderUniversalEditableDocuments(
  mapping: UniversalDocumentMappingPackageResult,
  store: UniversalEditableTemplateStore,
  renderer: UniversalEditableTemplateRendererPort,
): Promise<UniversalEditableRenderingResult> {
  if (!mapping.ready || mapping.stage !== "READY_FOR_RENDERING") {
    return { ready: false, stage: "BLOCKED_LB17", documents: [], blockers: mapping.blockers.length ? mapping.blockers : ["LB17 no ha autorizado el renderizado documental."] };
  }

  const documents: UniversalRenderedEditableDocument[] = [];
  const blockers: string[] = [];

  for (const document of mapping.documents) {
    const asset = await store.get(document.template.templateId);
    if (!asset) {
      blockers.push(`No existe activo editable para el modelo oficial ${document.template.templateId}.`);
      continue;
    }

    const assetBlockers = validateAsset(document, asset);
    if (assetBlockers.length) {
      blockers.push(...assetBlockers);
      continue;
    }

    try {
      const rendered = await renderer.render({ asset, values: document.facts.map(factToValue) });
      documents.push(rendered);
    } catch (error) {
      blockers.push(error instanceof Error ? error.message : `Fallo de renderizado de ${document.documentKind}.`);
    }
  }

  if (blockers.length) {
    const missing = blockers.some(item => item.startsWith("No existe activo editable"));
    return { ready: false, stage: missing ? "NEEDS_EDITABLE_TEMPLATE" : "INVALID_TEMPLATE_ASSET", documents, blockers };
  }

  return { ready: true, stage: "READY_FOR_DOCUMENT_AUDIT", documents, blockers: [] };
}

export interface UniversalEditableDocumentAuditResult {
  ready: boolean;
  blockers: readonly string[];
}

/**
 * Bloque 18.4 - auditoría posterior. Un render válido debe conservar exactamente
 * la huella de estilo del modelo fuente y aplicar todos y solo los slots
 * previstos por LB17.
 */
export function auditUniversalEditableRendering(
  mapping: UniversalDocumentMappingPackageResult,
  rendering: UniversalEditableRenderingResult,
): UniversalEditableDocumentAuditResult {
  const blockers = [...rendering.blockers];
  if (!mapping.ready || !rendering.ready) {
    if (!blockers.length) blockers.push("El paquete no está listo para auditoría documental.");
    return { ready: false, blockers };
  }

  const mappedByKind = new Map(mapping.documents.map(document => [document.documentKind, document] as const));
  const renderedByKind = new Map(rendering.documents.map(document => [document.documentKind, document] as const));

  for (const [kind, mapped] of mappedByKind) {
    const rendered = renderedByKind.get(kind);
    if (!rendered) {
      blockers.push(`Falta el documento renderizado ${kind}.`);
      continue;
    }
    if (rendered.templateId !== mapped.template.templateId || rendered.sourceId !== mapped.template.sourceId) {
      blockers.push(`El documento ${kind} no conserva la identidad del modelo oficial.`);
    }
    if (rendered.renderedStyleFingerprint !== rendered.originalStyleFingerprint) {
      blockers.push(`El documento ${kind} ha alterado la huella de estilo del modelo oficial.`);
    }
    const expectedSlots = [...mapped.facts.map(fact => fact.slotId)].sort();
    const actualSlots = [...rendered.appliedSlots].sort();
    if (JSON.stringify(expectedSlots) !== JSON.stringify(actualSlots)) {
      blockers.push(`El documento ${kind} no ha aplicado exactamente los slots previstos por LB17.`);
    }
    if (rendered.bytes.byteLength === 0) blockers.push(`El documento ${kind} no contiene salida editable.`);
  }

  return { ready: blockers.length === 0, blockers };
}
