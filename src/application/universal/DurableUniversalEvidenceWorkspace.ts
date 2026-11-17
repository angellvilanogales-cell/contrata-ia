import fs from "node:fs";
import path from "node:path";
import {
  UniversalEvidenceRecord,
  UniversalEvidenceWorkspace,
} from "../intake/lb52/UniversalEvidenceWorkspace";
import { UNIVERSAL_V1_UI_FIELD_MANIFEST } from "../intake/lb51/UniversalV1UiFieldManifest";
import { SUPPLY_VERTICAL_FIELD_MANIFEST } from "../intake/lb93/SupplyVerticalFieldManifest";
import {
  UniversalCasePayload,
  UniversalDurableCaseStore,
  UniversalPersistenceResult,
} from "./UniversalDurableCaseStore";

interface UniversalEvidencePayload extends UniversalCasePayload {
  kind: "UNIVERSAL_EVIDENCE_RECORD";
  record: UniversalEvidenceRecord;
}

const ALLOWED_FIELDS = new Set([
  ...UNIVERSAL_V1_UI_FIELD_MANIFEST.map(item => item.fieldPath),
  ...SUPPLY_VERTICAL_FIELD_MANIFEST.map(item => item.fieldPath),
]);
const ALLOWED_STATUS = new Set(["PENDING", "SOURCE_DECLARED", "SOURCE_CONFIRMED", "SYSTEM_PROPOSAL", "HUMAN_VALIDATED", "SOURCE_CONFLICT", "NOT_APPLICABLE"]);

function fileSafeCaseId(value: string): string {
  const id = value.trim();
  if (!/^[A-Za-z0-9/_-]{4,120}$/.test(id)) throw new Error("UNIVERSAL_EVIDENCE_CASE_ID_INVALID");
  return id.replaceAll("/", "__");
}

function validateRecord(record: UniversalEvidenceRecord, expectedCaseId: string): void {
  if (record.caseId !== expectedCaseId) throw new Error("UNIVERSAL_EVIDENCE_CASE_ISOLATION_VIOLATION");
  if (!record.fields || typeof record.fields !== "object" || Array.isArray(record.fields)) throw new Error("UNIVERSAL_EVIDENCE_FIELDS_INVALID");
  for (const [fieldPath, field] of Object.entries(record.fields)) {
    if (!ALLOWED_FIELDS.has(fieldPath)) throw new Error(`UNIVERSAL_EVIDENCE_FIELD_NOT_ALLOWED:${fieldPath}`);
    if (!field || typeof field !== "object" || !ALLOWED_STATUS.has(String(field.status))) throw new Error(`UNIVERSAL_EVIDENCE_STATUS_INVALID:${fieldPath}`);
  }
}

/**
 * LB92.6-8 / LB93.12. Envoltorio durable de UniversalEvidenceWorkspace.
 * El workspace conserva las reglas de edición/validación; esta capa aporta
 * snapshot remoto, checksum, versión de esquema y recuperación tras reinicio.
 * LB93 amplía el mismo manifiesto permitido con los campos específicos Supply:
 * no existe un segundo almacén ni una persistencia paralela.
 */
export class DurableUniversalEvidenceWorkspace {
  public constructor(
    private readonly root: string,
    private readonly workspace: UniversalEvidenceWorkspace,
    private readonly store: UniversalDurableCaseStore<UniversalEvidencePayload>,
  ) {
    fs.mkdirSync(root, { recursive: true });
  }

  public async get(caseId: string): Promise<{ record: UniversalEvidenceRecord; persistence: UniversalPersistenceResult<UniversalEvidencePayload> }> {
    const persistence = await this.store.restore(caseId);
    if (persistence.snapshot) {
      const payload = persistence.snapshot.payload;
      if (payload.kind !== "UNIVERSAL_EVIDENCE_RECORD" || !payload.record) throw new Error("UNIVERSAL_EVIDENCE_SNAPSHOT_KIND_INVALID");
      validateRecord(payload.record, caseId);
      this.restoreLocal(payload.record);
    }
    return { record: this.workspace.get(caseId), persistence };
  }

  public async declare(caseId: string, fieldPath: string, value: unknown, actor: string) {
    const record = this.workspace.declare(caseId, fieldPath, value, actor);
    const persistence = await this.persist(record);
    return { record, persistence };
  }

  public async validate(caseId: string, fieldPath: string, reviewer: string) {
    const record = this.workspace.validate(caseId, fieldPath, reviewer);
    const persistence = await this.persist(record);
    return { record, persistence };
  }

  public async persist(record: UniversalEvidenceRecord): Promise<UniversalPersistenceResult<UniversalEvidencePayload>> {
    validateRecord(record, record.caseId);
    return this.store.save(record.caseId, { kind: "UNIVERSAL_EVIDENCE_RECORD", record });
  }

  private restoreLocal(record: UniversalEvidenceRecord): void {
    const file = path.join(this.root, `${fileSafeCaseId(record.caseId)}.json`);
    const tmp = `${file}.lb92.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(record, null, 2), { encoding: "utf8", mode: 0o600 });
    fs.renameSync(tmp, file);
  }
}
