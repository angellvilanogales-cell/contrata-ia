import fs from "node:fs";
import path from "node:path";
import { EvidenceField, EvidenceFieldStatus, EvidenceReference } from "../../../domain/expediente/EvidenceField";
import { UNIVERSAL_V1_UI_FIELD_MANIFEST } from "../lb51/UniversalV1UiFieldManifest";
import { SUPPLY_VERTICAL_FIELD_MANIFEST } from "../lb93/SupplyVerticalFieldManifest";
import { SUPPLY_ASA_PCAP_FIELD_MANIFEST } from "../lb95/SupplyAsaPcapFieldManifest";
import { SERVICE_VERTICAL_FIELD_MANIFEST } from "../lb96/ServiceVerticalFieldManifest";
import { WORKS_VERTICAL_FIELD_MANIFEST } from "../lb97/WorksVerticalFieldManifest";
import { CONCESSION_VERTICAL_FIELD_MANIFEST } from "../lb98/ConcessionVerticalFieldManifest";

export interface UniversalEvidenceRecord {
  caseId: string;
  fields: Readonly<Record<string, EvidenceField<unknown>>>;
  updatedAt: string;
}

const ALLOWED_PATHS = new Set([
  ...UNIVERSAL_V1_UI_FIELD_MANIFEST.map(item => item.fieldPath),
  ...SUPPLY_VERTICAL_FIELD_MANIFEST.map(item => item.fieldPath),
  ...SUPPLY_ASA_PCAP_FIELD_MANIFEST.map(item => item.fieldPath),
  ...SERVICE_VERTICAL_FIELD_MANIFEST.map(item => item.fieldPath),
  ...WORKS_VERTICAL_FIELD_MANIFEST.map(item => item.fieldPath),
  ...CONCESSION_VERTICAL_FIELD_MANIFEST.map(item => item.fieldPath),
]);

function safeCaseId(value: string): string {
  const id = value.trim();
  if (!/^[A-Za-z0-9/_-]{4,120}$/.test(id)) throw new Error("Identificador de expediente universal no válido.");
  return id.replaceAll("/", "__");
}
function source(kind: EvidenceReference["kind"], sourceId: string): EvidenceReference { return { kind, sourceId }; }
function assertAllowed(fieldPath: string): void { if (!ALLOWED_PATHS.has(fieldPath)) throw new Error(`Campo universal no editable desde V1: ${fieldPath}.`); }
function normalizeStatus(status: EvidenceFieldStatus): EvidenceFieldStatus {
  if (["PENDING", "SOURCE_DECLARED", "SOURCE_CONFIRMED", "SYSTEM_PROPOSAL", "HUMAN_VALIDATED", "SOURCE_CONFLICT", "NOT_APPLICABLE"].includes(status)) return status;
  throw new Error(`Estado de evidencia no válido: ${String(status)}.`);
}

export class UniversalEvidenceWorkspace {
  public constructor(private readonly root: string) { fs.mkdirSync(root, { recursive: true }); }
  public get(caseId: string): UniversalEvidenceRecord {
    const file = this.fileFor(caseId);
    if (!fs.existsSync(file)) return { caseId, fields: {}, updatedAt: new Date(0).toISOString() };
    const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as UniversalEvidenceRecord;
    return { ...parsed, fields: parsed.fields ?? {} };
  }
  public declare(caseId: string, fieldPath: string, value: unknown, actor: string): UniversalEvidenceRecord {
    assertAllowed(fieldPath);
    const current = this.get(caseId);
    const field: EvidenceField<unknown> = { key: fieldPath, value, status: "SOURCE_DECLARED", sources: [source("USER_INPUT", `ui:${actor}`)], humanValidationRequired: true, humanValidated: false, diagnostics: ["Valor declarado desde la interfaz universal; requiere revisión humana antes de producción."] };
    return this.write(caseId, { ...current.fields, [fieldPath]: field });
  }
  public setSourceEvidence(caseId: string, fieldPath: string, value: unknown, status: Extract<EvidenceFieldStatus, "SOURCE_CONFIRMED" | "SOURCE_CONFLICT" | "NOT_APPLICABLE">, references: readonly EvidenceReference[], diagnostics: readonly string[] = []): UniversalEvidenceRecord {
    assertAllowed(fieldPath); normalizeStatus(status);
    if (status === "SOURCE_CONFLICT" && value !== null) throw new Error("Una contradicción de fuente no puede contener un valor promocionado.");
    const current = this.get(caseId);
    const field: EvidenceField<unknown> = { key: fieldPath, value, status, sources: references, humanValidationRequired: status !== "NOT_APPLICABLE", humanValidated: false, diagnostics, ...(status === "SOURCE_CONFLICT" ? { conflict: { statements: diagnostics.length ? diagnostics : ["Fuentes incompatibles."], treatment: "DO_NOT_AUTO_RESOLVE" as const } } : {}) };
    return this.write(caseId, { ...current.fields, [fieldPath]: field });
  }
  public validate(caseId: string, fieldPath: string, reviewer: string): UniversalEvidenceRecord {
    assertAllowed(fieldPath);
    const current = this.get(caseId); const existing = current.fields[fieldPath];
    if (!existing) throw new Error(`No existe evidencia para ${fieldPath}.`);
    if (existing.status === "SOURCE_CONFLICT" || existing.status === "PENDING") throw new Error(`El campo ${fieldPath} no puede validarse mientras esté ${existing.status}.`);
    const validated: EvidenceField<unknown> = { ...existing, status: existing.status === "NOT_APPLICABLE" ? "NOT_APPLICABLE" : "HUMAN_VALIDATED", humanValidated: true, sources: [...existing.sources, source("USER_INPUT", `review:${reviewer}`)], diagnostics: [...(existing.diagnostics ?? []), `Validación humana expresa realizada por ${reviewer}.`] };
    return this.write(caseId, { ...current.fields, [fieldPath]: validated });
  }
  public readiness(caseId: string) {
    const record = this.get(caseId); const required = UNIVERSAL_V1_UI_FIELD_MANIFEST.filter(item => item.requiredForValidatedSupplyAsa); const blockers: string[] = [];
    for (const item of required) {
      const field = record.fields[item.fieldPath];
      if (!field) { blockers.push(`Falta ${item.fieldPath}.`); continue; }
      if (field.status === "SOURCE_CONFLICT" || field.status === "PENDING") { blockers.push(`${item.fieldPath} está ${field.status}.`); continue; }
      if (item.humanValidationRequired && !field.humanValidated && field.status !== "NOT_APPLICABLE") blockers.push(`${item.fieldPath} requiere validación humana.`);
    }
    return { ready: blockers.length === 0, blockers, fieldCount: Object.keys(record.fields).length, requiredCount: required.length };
  }
  private fileFor(caseId: string): string { return path.join(this.root, `${safeCaseId(caseId)}.json`); }
  private write(caseId: string, fields: Readonly<Record<string, EvidenceField<unknown>>>): UniversalEvidenceRecord {
    const value: UniversalEvidenceRecord = { caseId, fields, updatedAt: new Date().toISOString() }; const file = this.fileFor(caseId); const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(value, null, 2), { encoding: "utf8", mode: 0o600 }); fs.renameSync(tmp, file); return value;
  }
}
