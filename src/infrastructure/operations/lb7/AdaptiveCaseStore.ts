import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { AdaptiveFlowAnswers } from "../../../application/intake/lb7/AdaptiveProcurementFlow";
import type { EvidenceField } from "../../../domain/expediente/EvidenceField";

export interface AdaptiveStoredCase {
  readonly caseId: string;
  readonly answers: AdaptiveFlowAnswers;
  readonly supplyCatalogue?: unknown;
  readonly universalEvidence?: Readonly<Record<string, EvidenceField<unknown>>>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

function safeId(value: string): string {
  const id = value.trim();
  if (!/^EXP-[A-Za-z0-9-]{8,80}$/.test(id)) throw new Error("Identificador de expediente no válido.");
  return id;
}

export class AdaptiveCaseStore {
  public constructor(private readonly root: string) {
    fs.mkdirSync(root, { recursive: true });
  }

  public create(): AdaptiveStoredCase {
    const now = new Date().toISOString();
    const value: AdaptiveStoredCase = {
      caseId: `EXP-${randomUUID()}`,
      answers: {},
      universalEvidence: {},
      createdAt: now,
      updatedAt: now
    };
    this.write(value);
    return value;
  }

  public get(caseId: string): AdaptiveStoredCase {
    const file = this.fileFor(caseId);
    if (!fs.existsSync(file)) throw new Error("Expediente adaptativo no encontrado.");
    const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as AdaptiveStoredCase;
    return { ...parsed, universalEvidence: parsed.universalEvidence ?? {} };
  }

  public save(caseId: string, answers: AdaptiveFlowAnswers, supplyCatalogue?: unknown, universalEvidence?: Readonly<Record<string, EvidenceField<unknown>>>): AdaptiveStoredCase {
    const current = this.get(caseId);
    const value: AdaptiveStoredCase = {
      caseId: current.caseId,
      answers,
      supplyCatalogue: supplyCatalogue === undefined ? current.supplyCatalogue : supplyCatalogue,
      universalEvidence: universalEvidence === undefined ? current.universalEvidence : universalEvidence,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString()
    };
    this.write(value);
    return value;
  }

  public saveUniversalEvidence(caseId: string, field: EvidenceField<unknown>): AdaptiveStoredCase {
    const current = this.get(caseId);
    const universalEvidence = { ...(current.universalEvidence ?? {}), [field.key]: field };
    return this.save(caseId, current.answers, undefined, universalEvidence);
  }

  private fileFor(caseId: string): string {
    return path.join(this.root, `${safeId(caseId)}.json`);
  }

  private write(value: AdaptiveStoredCase): void {
    const file = this.fileFor(value.caseId);
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(value, null, 2), { encoding: "utf8", mode: 0o600 });
    fs.renameSync(tmp, file);
  }
}
