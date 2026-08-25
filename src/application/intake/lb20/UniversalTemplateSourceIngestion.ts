import { CanonicalContractType } from "../../../domain/expediente/CanonicalExpedienteState";
import { UniversalAdministrativeDocumentKind } from "../lb17/UniversalOfficialTemplateCatalog";
import { UniversalEditableTemplateFormat } from "../lb18/UniversalEditableTemplateRendering";
import { UniversalOfficialTemplateRegistryRecord } from "../lb19/UniversalOfficialTemplateRegistry";

export type UniversalTemplateSourceRole = "OFFICIAL_MODEL" | "EXAMPLE_REFERENCE" | "UNKNOWN";

export interface UniversalTemplateSourceFile {
  sourceId: string;
  sourceLocator: string;
  fileName: string;
  mediaType: string;
  byteLength: number;
  contentHash: string;
  styleFingerprint?: string;
  discoveredSlotIds?: readonly string[];
}

export interface UniversalTemplateHumanClassification {
  sourceRole: UniversalTemplateSourceRole;
  officialSourceConfirmed: boolean;
  templateId?: string;
  contractType?: CanonicalContractType;
  documentKind?: UniversalAdministrativeDocumentKind;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export type UniversalTemplateSourceIngestionStage =
  | "INVALID_SOURCE_FILE"
  | "REFERENCE_ONLY"
  | "NEEDS_EDITABLE_ORIGINAL"
  | "NEEDS_HUMAN_CLASSIFICATION"
  | "READY_FOR_SOURCE_DECLARATION";

export interface UniversalTemplateSourceIngestionResult {
  ready: boolean;
  stage: UniversalTemplateSourceIngestionStage;
  format: UniversalEditableTemplateFormat | null;
  record: UniversalOfficialTemplateRegistryRecord | null;
  blockers: readonly string[];
  warnings: readonly string[];
}

function editableFormat(file: UniversalTemplateSourceFile): UniversalEditableTemplateFormat | null {
  const name = file.fileName.toLowerCase();
  if (file.mediaType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || name.endsWith(".docx")) return "DOCX";
  if (file.mediaType === "application/vnd.oasis.opendocument.text" || name.endsWith(".odt")) return "ODT";
  return null;
}

function validDate(value: string | undefined): boolean {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return Number.isFinite(Date.parse(`${value}T00:00:00Z`));
}

/**
 * Bloques 20.1-20.3 - ingesta física controlada de una fuente documental.
 * La detección técnica de DOCX/ODT nunca convierte por sí sola un archivo en
 * modelo oficial. La clasificación contractual/documental y la oficialidad
 * requieren confirmación humana, y el resultado entra en LB19 únicamente como
 * SOURCE_DECLARED.
 */
export function ingestUniversalTemplateSource(
  file: UniversalTemplateSourceFile,
  classification?: UniversalTemplateHumanClassification,
): UniversalTemplateSourceIngestionResult {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!file.sourceId.trim()) blockers.push("sourceId vacío.");
  if (!file.sourceLocator.trim()) blockers.push("sourceLocator vacío.");
  if (!file.fileName.trim()) blockers.push("fileName vacío.");
  if (file.byteLength <= 0) blockers.push(`El archivo ${file.fileName} está vacío.`);
  if (!file.contentHash.trim()) blockers.push(`El archivo ${file.fileName} carece de huella de contenido.`);
  if (blockers.length) return { ready: false, stage: "INVALID_SOURCE_FILE", format: null, record: null, blockers, warnings };

  if (classification?.sourceRole === "EXAMPLE_REFERENCE") {
    return {
      ready: false,
      stage: "REFERENCE_ONLY",
      format: editableFormat(file),
      record: null,
      blockers: [],
      warnings: [`${file.fileName} se conserva como ejemplo de referencia y no puede alimentar el registro oficial.`],
    };
  }

  const format = editableFormat(file);
  if (!format) {
    return {
      ready: false,
      stage: "NEEDS_EDITABLE_ORIGINAL",
      format: null,
      record: null,
      blockers: [`${file.fileName} no es un original editable DOCX/ODT; puede servir como evidencia o ejemplo, pero no como activo de renderizado LB18.`],
      warnings,
    };
  }

  if (!classification || classification.sourceRole !== "OFFICIAL_MODEL" || !classification.officialSourceConfirmed) {
    return {
      ready: false,
      stage: "NEEDS_HUMAN_CLASSIFICATION",
      format,
      record: null,
      blockers: ["La oficialidad del modelo debe confirmarse humanamente antes de declararlo en el registro."],
      warnings,
    };
  }

  if (!classification.templateId?.trim()) blockers.push("Falta templateId confirmado.");
  if (!classification.contractType) blockers.push("Falta tipo contractual confirmado.");
  if (!classification.documentKind) blockers.push("Falta clase documental confirmada.");
  if (!validDate(classification.effectiveFrom)) blockers.push("Falta effectiveFrom válida en formato YYYY-MM-DD.");
  if (!file.styleFingerprint?.trim()) blockers.push(`Falta huella de estilo del original editable ${file.fileName}.`);
  if (!file.discoveredSlotIds || file.discoveredSlotIds.length === 0) blockers.push(`No se han identificado slots editables en ${file.fileName}.`);
  if (classification.effectiveTo && !validDate(classification.effectiveTo)) blockers.push("effectiveTo no es una fecha YYYY-MM-DD válida.");
  if (blockers.length) return { ready: false, stage: "NEEDS_HUMAN_CLASSIFICATION", format, record: null, blockers, warnings };

  const record: UniversalOfficialTemplateRegistryRecord = {
    registryId: `${classification.templateId}@${classification.effectiveFrom}`,
    templateId: classification.templateId!,
    sourceId: file.sourceId,
    sourceLocator: file.sourceLocator,
    contractType: classification.contractType!,
    documentKind: classification.documentKind!,
    format,
    mediaType: file.mediaType,
    contentHash: file.contentHash,
    styleFingerprint: file.styleFingerprint!,
    slotIds: [...file.discoveredSlotIds!],
    effectiveFrom: classification.effectiveFrom!,
    effectiveTo: classification.effectiveTo,
    status: "SOURCE_DECLARED",
  };

  return { ready: true, stage: "READY_FOR_SOURCE_DECLARATION", format, record, blockers: [], warnings };
}
