import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { IntakeCaseRepository } from "../../../application/operations/lb7/OperationalPorts";
import type { IntakeCase } from "../../../application/intake/lb6/IntakeModel";

interface StoredEnvelope {
  readonly schemaVersion: 1;
  readonly savedAt: string;
  readonly checksum: string;
  readonly caseValue: IntakeCase;
}

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function checksum(caseValue: IntakeCase): string {
  return crypto.createHash("sha256").update(stable(caseValue)).digest("hex");
}

function safeName(caseId: string): string {
  const cleaned = caseId.replace(/[^A-Za-z0-9._-]/g, "_");
  if (!cleaned || cleaned.includes("..")) throw new Error("Identificador de expediente no válido para persistencia.");
  return cleaned;
}

export class FileCaseRepository implements IntakeCaseRepository {
  public constructor(private readonly directory: string) {
    fs.mkdirSync(this.directory, { recursive: true, mode: 0o700 });
  }

  public loadAll(): readonly IntakeCase[] {
    const result: IntakeCase[] = [];
    for (const file of fs.readdirSync(this.directory).filter(name => name.endsWith(".json"))) {
      const full = path.join(this.directory, file);
      const parsed = JSON.parse(fs.readFileSync(full, "utf8")) as StoredEnvelope;
      if (parsed.schemaVersion !== 1 || !parsed.caseValue || parsed.checksum !== checksum(parsed.caseValue)) {
        throw new Error(`Persistencia corrupta o incompatible: ${file}`);
      }
      result.push(parsed.caseValue);
    }
    return result;
  }

  public save(caseValue: IntakeCase): void {
    const file = path.join(this.directory, `${safeName(caseValue.id)}.json`);
    const temp = `${file}.${process.pid}.tmp`;
    const envelope: StoredEnvelope = {
      schemaVersion: 1,
      savedAt: new Date().toISOString(),
      checksum: checksum(caseValue),
      caseValue
    };
    fs.writeFileSync(temp, `${JSON.stringify(envelope, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
    fs.renameSync(temp, file);
  }

  public backup(): string {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDirectory = path.join(this.directory, "backups", stamp);
    fs.mkdirSync(backupDirectory, { recursive: true, mode: 0o700 });
    for (const file of fs.readdirSync(this.directory).filter(name => name.endsWith(".json"))) {
      fs.copyFileSync(path.join(this.directory, file), path.join(backupDirectory, file));
    }
    const manifest = {
      createdAt: new Date().toISOString(),
      files: fs.readdirSync(backupDirectory).filter(name => name.endsWith(".json")).sort()
    };
    fs.writeFileSync(path.join(backupDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600 });
    return backupDirectory;
  }
}
