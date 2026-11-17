import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export interface StoredValuationDocument { id: string; fileName: string; sha256: string; size: number; mediaType: string; storage: "DURABLE_REMOTE" | "LOCAL_DEVELOPMENT"; }

const CHUNK_BYTES = 384 * 1024;
function safe(value: string): string { return value.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 160); }
async function responseJson(response: Response): Promise<Record<string, unknown>> { try { return await response.json() as Record<string, unknown>; } catch { return {}; } }

async function persistRemote(caseId: string, document: Omit<StoredValuationDocument, "storage">, bytes: Uint8Array, endpoint: string, token: string): Promise<void> {
  const templateId = `valuation-evidence:${safe(caseId)}:${document.id}`;
  const expectedChunks = Math.ceil(bytes.byteLength / CHUNK_BYTES);
  const headers = { "x-contrata-ia-persistence-token": token };
  const start = await fetch(`${endpoint.replace(/\/+$/, "")}/template-ingest/start`, { method: "POST", headers: { ...headers, "content-type": "application/json" }, body: JSON.stringify({ templateId, kind: "MEMORIA", mediaType: document.mediaType, sha256: document.sha256, styleFingerprint: "sha256:lb108-valuation-evidence", provenance: { role: "VALIDATED_REAL_CASE_SOURCE", caseId, fileName: document.fileName, evidenceType: "ECONOMIC_VALUATION" }, byteLength: bytes.byteLength, expectedChunks }) });
  const started = await responseJson(start);
  if (!start.ok || typeof started.sessionId !== "string") throw new Error(`No se pudo iniciar la persistencia durable del documento (HTTP ${start.status}).`);
  const sessionId = started.sessionId;
  try {
    for (let index = 0; index < expectedChunks; index += 1) {
      const chunk = bytes.slice(index * CHUNK_BYTES, Math.min(bytes.byteLength, (index + 1) * CHUNK_BYTES));
      const result = await fetch(`${endpoint.replace(/\/+$/, "")}/template-ingest/${encodeURIComponent(sessionId)}/chunks/${index}`, { method: "PUT", headers: { ...headers, "content-type": "application/octet-stream", "content-length": String(chunk.byteLength) }, body: chunk });
      if (!result.ok) throw new Error(`Falló la persistencia del fragmento ${index + 1}/${expectedChunks} (HTTP ${result.status}).`);
    }
    const finalized = await fetch(`${endpoint.replace(/\/+$/, "")}/template-ingest/${encodeURIComponent(sessionId)}/finalize`, { method: "POST", headers });
    const payload = await responseJson(finalized);
    if (!finalized.ok || payload.sha256 !== document.sha256 || Number(payload.byteLength) !== bytes.byteLength) throw new Error(`La persistencia durable no confirmó la identidad completa del documento (HTTP ${finalized.status}).`);
  } catch (error) {
    try { await fetch(`${endpoint.replace(/\/+$/, "")}/template-ingest/${encodeURIComponent(sessionId)}`, { method: "DELETE", headers }); } catch {}
    throw error;
  }
}

export async function storeValuationDocument(caseId: string, fileName: string, mediaType: string, bytes: Uint8Array, environment: NodeJS.ProcessEnv = process.env): Promise<StoredValuationDocument> {
  if (!caseId.trim()) throw new Error("Falta el identificador del expediente.");
  if (!fileName.trim()) throw new Error("Falta el nombre del documento.");
  if (bytes.byteLength === 0 || bytes.byteLength > 10_000_000) throw new Error("El documento debe ocupar entre 1 byte y 10 MB.");
  const document = { id: randomUUID(), fileName, sha256: createHash("sha256").update(bytes).digest("hex"), size: bytes.byteLength, mediaType: mediaType || "application/octet-stream" };
  const endpoint = environment.CONTRATA_IA_PERSISTENCE_URL?.trim();
  const token = environment.CONTRATA_IA_PERSISTENCE_TOKEN?.trim();
  if (endpoint || token) {
    if (!endpoint || !token) throw new Error("La persistencia durable de evidencias está configurada de forma incompleta.");
    await persistRemote(caseId, document, bytes, endpoint, token);
    return { ...document, storage: "DURABLE_REMOTE" };
  }
  if (environment.NODE_ENV === "production") throw new Error("No se admite evidencia económica efímera en producción: falta configurar la persistencia durable.");
  const root = environment.CONTRATA_IA_EVIDENCE_DIR ?? path.resolve("var", "valuation-evidence");
  const directory = path.join(root, safe(caseId));
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, `${document.id}-${safe(fileName)}`), bytes, { flag: "wx" });
  return { ...document, storage: "LOCAL_DEVELOPMENT" };
}
