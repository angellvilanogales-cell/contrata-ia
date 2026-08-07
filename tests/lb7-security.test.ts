import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { IncomingMessage } from "node:http";
import { describe, expect, it } from "vitest";
import { LB6Orchestrator } from "../src/application/intake/lb6/LB6Orchestrator";
import { FileCaseRepository } from "../src/infrastructure/operations/lb7/FileCaseRepository";
import { HashChainAuditLog } from "../src/infrastructure/operations/lb7/HashChainAuditLog";
import { SecurityPolicy } from "../src/interfaces/lb7/SecurityPolicy";
import { runLB5Demo } from "../src/application/documents/lb5/LB5Demo";

function tempRoot(): string { return fs.mkdtempSync(path.join(os.tmpdir(), "contrata-ia-lb7-")); }
function requestWith(token?: string): IncomingMessage { return { headers: token ? { authorization: `Bearer ${token}` } : {} } as IncomingMessage; }

describe("LB-7 persistence, security and release safeguards", () => {
  it("persists an intake case atomically and restores it after a new orchestrator starts", () => {
    const root = tempRoot();
    const repository = new FileCaseRepository(path.join(root, "cases"));
    const first = new LB6Orchestrator({ repository });
    const created = first.createCase("GUIDED", "PERSIST-1");
    first.answer(created.id, "contractingAuthority", "Servicio Andaluz de Empleo");
    const second = new LB6Orchestrator({ repository });
    expect(second.getCase(created.id).answers.contractingAuthority?.value).toBe("Servicio Andaluz de Empleo");
  });

  it("detects corruption in persisted case data through its checksum", () => {
    const root = tempRoot();
    const directory = path.join(root, "cases");
    const repository = new FileCaseRepository(directory);
    const orchestrator = new LB6Orchestrator({ repository });
    orchestrator.createCase("GUIDED", "CORRUPT-1");
    const file = path.join(directory, "CORRUPT-1.json");
    const raw = fs.readFileSync(file, "utf8").replace("GUIDED", "HYBRID");
    fs.writeFileSync(file, raw);
    expect(() => new FileCaseRepository(directory).loadAll()).toThrow(/corrupta|incompatible/i);
  });

  it("creates a recoverable persistence backup with a manifest", () => {
    const root = tempRoot();
    const repository = new FileCaseRepository(path.join(root, "cases"));
    const orchestrator = new LB6Orchestrator({ repository });
    orchestrator.createCase("GUIDED", "BACKUP-1");
    const location = orchestrator.backup("admin");
    expect(location).toBeTruthy();
    expect(fs.existsSync(path.join(location!, "manifest.json"))).toBe(true);
    expect(fs.existsSync(path.join(location!, "BACKUP-1.json"))).toBe(true);
  });

  it("writes a verifiable hash-chained audit trail and detects tampering", () => {
    const root = tempRoot();
    const file = path.join(root, "audit", "security.jsonl");
    const audit = new HashChainAuditLog(file);
    audit.record({ timestamp: new Date().toISOString(), actor: "operator", action: "CASE_CREATED", outcome: "SUCCESS" });
    audit.record({ timestamp: new Date().toISOString(), actor: "reviewer", action: "CASE_VALIDATED", outcome: "SUCCESS" });
    expect(HashChainAuditLog.verify(file).entries).toBe(2);
    fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("CASE_CREATED", "CASE_DELETED"));
    expect(() => HashChainAuditLog.verify(file)).toThrow(/integridad|rota/i);
  });

  it("refuses production startup policy without credentials", () => {
    expect(() => new SecurityPolicy({ NODE_ENV: "production" })).toThrow(/credencial/i);
  });

  it("enforces role ordering and accepts configured bearer tokens", () => {
    const policy = new SecurityPolicy({ NODE_ENV: "production", CONTRATA_IA_OPERATOR_TOKEN: "operator-secret", CONTRATA_IA_REVIEWER_TOKEN: "reviewer-secret" });
    const operator = policy.authenticate(requestWith("operator-secret"));
    expect(operator.role).toBe("OPERATOR");
    expect(() => policy.require(operator, "REVIEWER")).toThrow(/REVIEWER/);
    const reviewer = policy.authenticate(requestWith("reviewer-secret"));
    expect(() => policy.require(reviewer, "REVIEWER")).not.toThrow();
  });

  it("does not expose internal source IDs or validation metadata in final DOCX output", () => {
    const rendered = runLB5Demo();
    const docxText = Buffer.from(rendered.editable[0]!.data).toString("utf8");
    expect(docxText).not.toContain("Fuentes:");
    expect(docxText).not.toContain("Estado: PENDING_HUMAN_VALIDATION");
    expect(docxText).not.toContain("JA-PCAP-LIMPIEZA-EJEMPLOS-USUARIO");
  });
});
