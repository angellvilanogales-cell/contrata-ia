import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export interface StoredValuationDocument { id: string; fileName: string; sha256: string; size: number; mediaType: string; }

function safe(value: string): string { return value.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 160); }

export function storeValuationDocument(caseId: string, fileName: string, mediaType: string, bytes: Uint8Array): StoredValuationDocument {
  if (!caseId.trim()) throw new Error("Falta el identificador del expediente.");
  if (!fileName.trim()) throw new Error("Falta el nombre del documento.");
  if (bytes.byteLength === 0 || bytes.byteLength > 10_000_000) throw new Error("El documento debe ocupar entre 1 byte y 10 MB.");
  const id = randomUUID();
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const root = process.env.CONTRATA_IA_EVIDENCE_DIR ?? path.resolve("var", "valuation-evidence");
  const directory = path.join(root, safe(caseId));
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, `${id}-${safe(fileName)}`), bytes, { flag: "wx" });
  return { id, fileName, sha256, size: bytes.byteLength, mediaType: mediaType || "application/octet-stream" };
}
