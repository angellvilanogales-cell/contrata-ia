export type UniversalCasePayload = Record<string, unknown>;

export interface UniversalCaseSnapshot<T extends UniversalCasePayload = UniversalCasePayload> {
  caseId: string;
  schemaVersion: number;
  payload: T;
  checksum: string;
}

export interface UniversalCaseMirror {
  save(snapshot: UniversalCaseSnapshot): Promise<void>;
  load(caseId: string): Promise<UniversalCaseSnapshot | null>;
}

export type UniversalPersistenceStatus =
  | "REMOTE_CONFIRMED"
  | "LOCAL_ONLY_REMOTE_FAILED"
  | "RESTORED_REMOTE"
  | "RESTORED_LOCAL"
  | "NOT_FOUND";

export interface UniversalPersistenceResult<T extends UniversalCasePayload = UniversalCasePayload> {
  status: UniversalPersistenceStatus;
  snapshot: UniversalCaseSnapshot<T> | null;
  warning?: string;
}

function isPlainObject(value: unknown): value is UniversalCasePayload {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function sha256Json(payload: UniversalCasePayload): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function validateUniversalSnapshot(
  snapshot: UniversalCaseSnapshot,
  expectedSchemaVersion: number,
): Promise<void> {
  if (!snapshot.caseId || !/^[A-Za-z0-9][A-Za-z0-9._/-]{2,119}$/.test(snapshot.caseId) || snapshot.caseId.includes("..")) {
    throw new Error("UNIVERSAL_CASE_ID_INVALID");
  }
  if (!Number.isInteger(snapshot.schemaVersion) || snapshot.schemaVersion !== expectedSchemaVersion) {
    throw new Error("UNIVERSAL_SCHEMA_VERSION_MISMATCH");
  }
  if (!isPlainObject(snapshot.payload)) throw new Error("UNIVERSAL_PAYLOAD_INVALID");
  const expected = await sha256Json(snapshot.payload);
  if (snapshot.checksum !== expected) throw new Error("UNIVERSAL_CHECKSUM_MISMATCH");
}

/**
 * LB92.1-2. Store durable de snapshots universales.
 *
 * - write-through: conserva copia local aunque falle el espejo remoto;
 * - restore: prefiere remoto válido y cae a local válido;
 * - nunca migra versiones de esquema silenciosamente;
 * - nunca devuelve un snapshot con checksum inválido.
 */
export class UniversalDurableCaseStore<T extends UniversalCasePayload = UniversalCasePayload> {
  private readonly local = new Map<string, UniversalCaseSnapshot<T>>();

  constructor(
    private readonly schemaVersion: number,
    private readonly mirror?: UniversalCaseMirror,
  ) {
    if (!Number.isInteger(schemaVersion) || schemaVersion < 1) throw new Error("UNIVERSAL_SCHEMA_VERSION_INVALID");
  }

  public async save(caseId: string, payload: T): Promise<UniversalPersistenceResult<T>> {
    const checksum = await sha256Json(payload);
    const snapshot: UniversalCaseSnapshot<T> = { caseId, schemaVersion: this.schemaVersion, payload, checksum };
    await validateUniversalSnapshot(snapshot, this.schemaVersion);
    this.local.set(caseId, structuredClone(snapshot));

    if (!this.mirror) return { status: "LOCAL_ONLY_REMOTE_FAILED", snapshot, warning: "UNIVERSAL_REMOTE_MIRROR_NOT_CONFIGURED" };

    try {
      await this.mirror.save(snapshot);
      return { status: "REMOTE_CONFIRMED", snapshot };
    } catch (error) {
      return {
        status: "LOCAL_ONLY_REMOTE_FAILED",
        snapshot,
        warning: error instanceof Error ? error.message : "UNIVERSAL_REMOTE_SAVE_FAILED",
      };
    }
  }

  public async restore(caseId: string): Promise<UniversalPersistenceResult<T>> {
    if (this.mirror) {
      try {
        const remote = await this.mirror.load(caseId);
        if (remote) {
          await validateUniversalSnapshot(remote, this.schemaVersion);
          if (remote.caseId !== caseId) throw new Error("UNIVERSAL_CASE_ISOLATION_VIOLATION");
          const typed = remote as UniversalCaseSnapshot<T>;
          this.local.set(caseId, structuredClone(typed));
          return { status: "RESTORED_REMOTE", snapshot: typed };
        }
      } catch (error) {
        const local = this.local.get(caseId);
        if (local) {
          await validateUniversalSnapshot(local, this.schemaVersion);
          return {
            status: "RESTORED_LOCAL",
            snapshot: structuredClone(local),
            warning: error instanceof Error ? error.message : "UNIVERSAL_REMOTE_RESTORE_FAILED",
          };
        }
        throw error;
      }
    }

    const local = this.local.get(caseId);
    if (!local) return { status: "NOT_FOUND", snapshot: null };
    await validateUniversalSnapshot(local, this.schemaVersion);
    return { status: "RESTORED_LOCAL", snapshot: structuredClone(local) };
  }
}
