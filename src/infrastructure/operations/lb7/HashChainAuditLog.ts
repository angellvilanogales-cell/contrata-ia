import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { SecurityAuditEvent, SecurityAuditPort } from "../../../application/operations/lb7/OperationalPorts";

interface AuditLine extends SecurityAuditEvent {
  readonly sequence: number;
  readonly previousHash: string;
  readonly hash: string;
}

function hashPayload(value: Omit<AuditLine, "hash">): string {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export class HashChainAuditLog implements SecurityAuditPort {
  private sequence = 0;
  private previousHash = "GENESIS";

  public constructor(private readonly filePath: string) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true, mode: 0o700 });
    if (fs.existsSync(filePath)) {
      const verified = HashChainAuditLog.verify(filePath);
      this.sequence = verified.lastSequence;
      this.previousHash = verified.lastHash;
    }
  }

  public record(event: SecurityAuditEvent): void {
    const base: Omit<AuditLine, "hash"> = { ...event, sequence: this.sequence + 1, previousHash: this.previousHash };
    const line: AuditLine = { ...base, hash: hashPayload(base) };
    fs.appendFileSync(this.filePath, `${JSON.stringify(line)}\n`, { encoding: "utf8", mode: 0o600 });
    this.sequence = line.sequence;
    this.previousHash = line.hash;
  }

  public static verify(filePath: string): { valid: true; entries: number; lastSequence: number; lastHash: string } {
    if (!fs.existsSync(filePath)) return { valid: true, entries: 0, lastSequence: 0, lastHash: "GENESIS" };
    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/).filter(Boolean);
    let previousHash = "GENESIS";
    let sequence = 0;
    for (const raw of lines) {
      const parsed = JSON.parse(raw) as AuditLine;
      const { hash, ...base } = parsed;
      if (parsed.sequence !== sequence + 1) throw new Error(`Cadena de auditoría no secuencial en entrada ${parsed.sequence}.`);
      if (parsed.previousHash !== previousHash) throw new Error(`Cadena de auditoría rota en entrada ${parsed.sequence}.`);
      if (hashPayload(base) !== hash) throw new Error(`Integridad de auditoría inválida en entrada ${parsed.sequence}.`);
      sequence = parsed.sequence;
      previousHash = hash;
    }
    return { valid: true, entries: lines.length, lastSequence: sequence, lastHash: previousHash };
  }
}
