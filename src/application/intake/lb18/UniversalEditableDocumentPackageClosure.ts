import { UniversalAdministrativeDocumentKind } from "../lb17/UniversalOfficialTemplateCatalog";
import { UniversalDocumentMappingPackageResult } from "../lb17/UniversalDocumentMappingPackage";
import {
  UniversalEditableRenderingResult,
  auditUniversalEditableRendering,
} from "./UniversalEditableTemplateRendering";

export interface UniversalEditableDocumentManifestEntry {
  documentKind: UniversalAdministrativeDocumentKind;
  templateId: string;
  sourceId: string;
  format: "DOCX" | "ODT";
  originalContentHash: string;
  renderedContentHash: string;
  styleFingerprint: string;
  appliedSlots: readonly string[];
}

export interface UniversalEditableDocumentPackageClosureResult {
  ready: boolean;
  manifest: readonly UniversalEditableDocumentManifestEntry[];
  blockers: readonly string[];
}

/**
 * Bloque 18.5 - cierre de la capa de renderizado editable.
 *
 * El cierre certifica únicamente que el conjunto esperado de documentos se ha
 * renderizado sobre sus modelos oficiales editables, conserva su estilo y deja
 * una manifestación trazable de modelo, fuente y slots aplicados. No equivale a
 * aprobación jurídica del contenido ni sustituye la revisión humana final.
 */
export function evaluateUniversalEditableDocumentPackageClosure(
  mapping: UniversalDocumentMappingPackageResult,
  rendering: UniversalEditableRenderingResult,
  requiredKinds: readonly UniversalAdministrativeDocumentKind[],
): UniversalEditableDocumentPackageClosureResult {
  const audit = auditUniversalEditableRendering(mapping, rendering);
  const blockers = [...audit.blockers];

  const byKind = new Map(rendering.documents.map(document => [document.documentKind, document] as const));
  for (const kind of requiredKinds) {
    if (!byKind.has(kind)) blockers.push(`Falta el documento editable requerido ${kind}.`);
  }

  const duplicates = rendering.documents
    .map(document => document.documentKind)
    .filter((kind, index, values) => values.indexOf(kind) !== index);
  for (const kind of new Set(duplicates)) blockers.push(`Existe más de una salida editable para ${kind}.`);

  const manifest = rendering.documents.map(document => ({
    documentKind: document.documentKind,
    templateId: document.templateId,
    sourceId: document.sourceId,
    format: document.format,
    originalContentHash: document.originalContentHash,
    renderedContentHash: document.renderedContentHash,
    styleFingerprint: document.renderedStyleFingerprint,
    appliedSlots: [...document.appliedSlots],
  }));

  return { ready: blockers.length === 0, manifest, blockers };
}
