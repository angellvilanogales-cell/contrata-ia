import { CanonicalContractType } from "../../../domain/expediente/CanonicalExpedienteState";
import { UniversalAdministrativeDocumentKind, UniversalOfficialTemplateDescriptor } from "../lb17/UniversalOfficialTemplateCatalog";
import { UniversalEditableTemplateAsset, UniversalEditableTemplateFormat } from "../lb18/UniversalEditableTemplateRendering";

export type UniversalTemplateRegistryStatus = "SOURCE_DECLARED" | "HUMAN_VALIDATED" | "RETIRED";

export interface UniversalOfficialTemplateRegistryRecord {
  registryId: string;
  templateId: string;
  sourceId: string;
  sourceLocator: string;
  contractType: CanonicalContractType;
  documentKind: UniversalAdministrativeDocumentKind;
  format: UniversalEditableTemplateFormat;
  mediaType: string;
  contentHash: string;
  styleFingerprint: string;
  slotIds: readonly string[];
  effectiveFrom: string;
  effectiveTo?: string;
  status: UniversalTemplateRegistryStatus;
  validatedBy?: string;
  validationNote?: string;
}

export interface UniversalTemplateSelectionResult {
  ready: boolean;
  record: UniversalOfficialTemplateRegistryRecord | null;
  blockers: readonly string[];
}

function parseDate(value: string, label: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`${label} debe usar formato YYYY-MM-DD.`);
  const time = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(time)) throw new Error(`${label} no contiene una fecha válida.`);
  return time;
}

function validateRecord(record: UniversalOfficialTemplateRegistryRecord): void {
  if (!record.registryId.trim()) throw new Error("registryId vacío.");
  if (!record.templateId.trim()) throw new Error(`templateId vacío en ${record.registryId}.`);
  if (!record.sourceId.trim()) throw new Error(`sourceId vacío en ${record.registryId}.`);
  if (!record.sourceLocator.trim()) throw new Error(`sourceLocator vacío en ${record.registryId}.`);
  if (!record.contentHash.trim()) throw new Error(`contentHash vacío en ${record.registryId}.`);
  if (!record.styleFingerprint.trim()) throw new Error(`styleFingerprint vacío en ${record.registryId}.`);
  const from = parseDate(record.effectiveFrom, `effectiveFrom de ${record.registryId}`);
  if (record.effectiveTo) {
    const to = parseDate(record.effectiveTo, `effectiveTo de ${record.registryId}`);
    if (to < from) throw new Error(`effectiveTo anterior a effectiveFrom en ${record.registryId}.`);
  }
  if (record.status === "HUMAN_VALIDATED" && !record.validatedBy?.trim()) {
    throw new Error(`El registro ${record.registryId} está HUMAN_VALIDATED sin identidad de validador.`);
  }
}

function activeOn(record: UniversalOfficialTemplateRegistryRecord, date: number): boolean {
  const from = parseDate(record.effectiveFrom, `effectiveFrom de ${record.registryId}`);
  const to = record.effectiveTo ? parseDate(record.effectiveTo, `effectiveTo de ${record.registryId}`) : Number.POSITIVE_INFINITY;
  return date >= from && date <= to;
}

/**
 * Bloques 19.1-19.3 - registro de modelos oficiales con procedencia, versión y
 * vigencia. No selecciona por parecido ni resuelve automáticamente solapes.
 */
export class UniversalOfficialTemplateRegistry {
  private readonly records: UniversalOfficialTemplateRegistryRecord[];

  constructor(records: readonly UniversalOfficialTemplateRegistryRecord[] = []) {
    const ids = new Set<string>();
    this.records = records.map(record => {
      validateRecord(record);
      if (ids.has(record.registryId)) throw new Error(`registryId duplicado: ${record.registryId}.`);
      ids.add(record.registryId);
      return { ...record, slotIds: [...record.slotIds] };
    });
  }

  public list(): readonly UniversalOfficialTemplateRegistryRecord[] {
    return this.records.map(record => ({ ...record, slotIds: [...record.slotIds] }));
  }

  public ingest(record: UniversalOfficialTemplateRegistryRecord): UniversalOfficialTemplateRegistry {
    validateRecord(record);
    if (this.records.some(item => item.registryId === record.registryId)) throw new Error(`registryId duplicado: ${record.registryId}.`);
    if (this.records.some(item => item.templateId === record.templateId && item.contentHash === record.contentHash)) {
      throw new Error(`El mismo contenido ya está registrado para templateId ${record.templateId}.`);
    }
    return new UniversalOfficialTemplateRegistry([...this.records, record]);
  }

  public validateSource(registryId: string, validatedBy: string, validationNote?: string): UniversalOfficialTemplateRegistry {
    if (!validatedBy.trim()) throw new Error("validatedBy no puede estar vacío.");
    let found = false;
    const records = this.records.map(record => {
      if (record.registryId !== registryId) return record;
      found = true;
      if (record.status === "RETIRED") throw new Error(`El registro ${registryId} está retirado y no puede validarse.`);
      return { ...record, status: "HUMAN_VALIDATED" as const, validatedBy, validationNote };
    });
    if (!found) throw new Error(`No existe el registro ${registryId}.`);
    return new UniversalOfficialTemplateRegistry(records);
  }

  public retire(registryId: string): UniversalOfficialTemplateRegistry {
    let found = false;
    const records = this.records.map(record => {
      if (record.registryId !== registryId) return record;
      found = true;
      return { ...record, status: "RETIRED" as const };
    });
    if (!found) throw new Error(`No existe el registro ${registryId}.`);
    return new UniversalOfficialTemplateRegistry(records);
  }

  public select(
    contractType: CanonicalContractType,
    documentKind: UniversalAdministrativeDocumentKind,
    procurementDate: string,
  ): UniversalTemplateSelectionResult {
    const date = parseDate(procurementDate, "procurementDate");
    const candidates = this.records.filter(record =>
      record.contractType === contractType &&
      record.documentKind === documentKind &&
      record.status === "HUMAN_VALIDATED" &&
      activeOn(record, date),
    );

    if (candidates.length === 0) {
      return { ready: false, record: null, blockers: [`No existe modelo oficial validado y vigente ${documentKind} para ${contractType} en ${procurementDate}.`] };
    }
    if (candidates.length > 1) {
      return {
        ready: false,
        record: null,
        blockers: [`Existen ${candidates.length} modelos oficiales validados y simultáneamente vigentes para ${contractType}/${documentKind} en ${procurementDate}; el solape requiere resolución humana.`],
      };
    }
    return { ready: true, record: candidates[0], blockers: [] };
  }
}

export function registryRecordToOfficialDescriptor(record: UniversalOfficialTemplateRegistryRecord): UniversalOfficialTemplateDescriptor {
  if (record.status !== "HUMAN_VALIDATED") throw new Error(`El registro ${record.registryId} no está validado humanamente.`);
  return {
    templateId: record.templateId,
    sourceId: record.sourceId,
    contractType: record.contractType,
    documentKind: record.documentKind,
    official: true,
    version: record.registryId,
    locator: record.sourceLocator,
  };
}

export function registryRecordToEditableAsset(record: UniversalOfficialTemplateRegistryRecord): UniversalEditableTemplateAsset {
  if (record.status !== "HUMAN_VALIDATED") throw new Error(`El registro ${record.registryId} no está validado humanamente.`);
  return {
    templateId: record.templateId,
    sourceId: record.sourceId,
    documentKind: record.documentKind,
    format: record.format,
    mediaType: record.mediaType,
    contentHash: record.contentHash,
    styleFingerprint: record.styleFingerprint,
    slotIds: [...record.slotIds],
    editable: true,
  };
}
