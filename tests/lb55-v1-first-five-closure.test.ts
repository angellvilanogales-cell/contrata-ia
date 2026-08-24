import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { UniversalEvidenceWorkspace } from "../src/application/intake/lb52/UniversalEvidenceWorkspace";
import { VerifiedRuntimeTemplateStore, type VerifiedRuntimeAssetDescriptor } from "../src/application/intake/lb53/VerifiedRuntimeTemplateStore";
import { evaluateUniversalV1ProductionReadiness, legacyGenerationAllowed } from "../src/application/intake/lb54/UniversalV1ProductionCoordinator";
import { createLB6Server } from "../src/interfaces/lb6/LB6Server";

const servers: Array<ReturnType<typeof createLB6Server>> = [];
afterEach(async () => { await Promise.all(servers.splice(0).map(server => new Promise<void>(resolve => server.close(() => resolve())))); });

function temp(): string { return fs.mkdtempSync(path.join(os.tmpdir(), "contrata-v1-")); }
function sha(bytes: Uint8Array): string { return createHash("sha256").update(bytes).digest("hex"); }

function fillRequired(workspace: UniversalEvidenceWorkspace, caseId: string): void {
  const definitions = [
    ["object", "Suministro de ferretería"], ["contractType", "SUPPLY"], ["cpvMain", "44316400-2"],
    ["administrative.contractingAuthority", "Dirección Gerencia SAE"], ["technical.executionLocations", ["Sevilla"]],
    ["lots.divisionIntoLots", false], ["lots.noDivisionJustification", "Gestión unificada"], ["administrative.reservedContractDa4", false],
    ["baseTenderBudgetCents", 1055244], ["economic.initialVatAmountCents", 221601], ["economic.initialPblVatIncludedCents", 1276845],
    ["economic.needsBasedContractDa33", true], ["economic.budgetCoversEntireContractLife", true], ["economic.maximumApprovedBudgetCents", 1816096],
    ["economic.legalEstimatedValueCents", 2179315], ["economic.estimatedValueCalculationMethod", "Presupuesto máximo + 20 %"],
    ["economic.priceDeterminationRegime", "Precios unitarios"], ["economic.priceRevisionRegime", "No"],
    ["economic.annualityBudgetRows", [{ year: 2026, amountCents: 159606, budgetApplication: "G/32L/22000/00", vatIncluded: true }]],
    ["durationMonths", 24], ["extensionMonths", 24], ["execution.extensionStructure", "Dos prórrogas de 12 meses"], ["execution.extensionNoticeMonths", 2],
    ["execution.plannedModificationRegime", "-20 % estabilidad / +20 % DA33"], ["criteria.awardCriteria", [{ nombre: "Precio", ponderacion: 100, evaluableMedianteFormula: true }]],
    ["criteria.singleCriterionMotivation", "Naturaleza estandarizada"], ["execution.specialExecutionConditions", ["Gestión de residuos"]],
    ["economic.unitPrices", [{ concept: "ABRAZADERA", unit: "UD", unitPriceCents: 130 }]],
  ] as const;
  for (const [field, value] of definitions) { workspace.declare(caseId, field, value, "operator"); workspace.validate(caseId, field, "reviewer"); }
}

describe("LB55 — primeros cinco puntos V1", () => {
  it("persiste evidencia y exige validación humana sin resolver conflictos", () => {
    const workspace = new UniversalEvidenceWorkspace(temp());
    const declared = workspace.declare("CONTR/2026/240267", "object", "Suministro", "operator");
    expect(declared.fields.object?.status).toBe("SOURCE_DECLARED");
    const validated = workspace.validate("CONTR/2026/240267", "object", "reviewer");
    expect(validated.fields.object?.status).toBe("HUMAN_VALIDATED");
    expect(validated.fields.object?.humanValidated).toBe(true);
    workspace.setSourceEvidence("CONTR/2026/240267", "cpvMain", null, "SOURCE_CONFLICT", [{ kind: "PRIMARY_DOCUMENT", sourceId: "a" }, { kind: "PRIMARY_DOCUMENT", sourceId: "b" }], ["44316400-2", "otro CPV"]);
    expect(() => workspace.validate("CONTR/2026/240267", "cpvMain", "reviewer")).toThrow(/SOURCE_CONFLICT/);
  });

  it("verifica SHA-256 exacto de activos runtime y rechaza alteraciones", async () => {
    const root = temp(); const bytes = Buffer.from("odt-test"); fs.writeFileSync(path.join(root, "x.odt"), bytes);
    const manifest: readonly VerifiedRuntimeAssetDescriptor[] = [{ kind: "PCAP", templateId: "x", sourceId: "x", fileName: "x.odt", sha256: sha(bytes), required: true }];
    const store = new VerifiedRuntimeTemplateStore(root, manifest);
    expect((await store.get("x"))?.bytes).toEqual(bytes);
    fs.writeFileSync(path.join(root, "x.odt"), Buffer.from("alterado"));
    await expect(store.get("x")).rejects.toThrow(/SHA-256/);
  });

  it("mantiene la vía legacy desactivada en producción y por defecto en desarrollo", () => {
    expect(legacyGenerationAllowed({ NODE_ENV: "production", CONTRATA_IA_ENABLE_LEGACY_GENERATION: "false" })).toBe(false);
    expect(() => legacyGenerationAllowed({ NODE_ENV: "production", CONTRATA_IA_ENABLE_LEGACY_GENERATION: "true" })).toThrow(/no puede habilitarse/i);
    expect(legacyGenerationAllowed({ NODE_ENV: "test" })).toBe(false);
    expect(legacyGenerationAllowed({ NODE_ENV: "test", CONTRATA_IA_ENABLE_LEGACY_GENERATION: "true" })).toBe(true);
  });

  it("bloquea generación del paquete mientras falten activos exactos o renderers de Memoria/PPT", () => {
    const evidence = new UniversalEvidenceWorkspace(temp()); fillRequired(evidence, "CONTR/2026/240267");
    const assets = new VerifiedRuntimeTemplateStore(temp());
    const result = evaluateUniversalV1ProductionReadiness("CONTR/2026/240267", evidence, assets);
    expect(result.ready).toBe(false);
    expect(result.stage).toBe("NEEDS_ASSETS");
    expect(result.legacyProductionEnabled).toBe(false);
    expect(result.blockers.join(" ")).toMatch(/PPT|runtime|SHA-256/i);
  });

  it("ejecuta el recorrido HTTP tipo navegador: UI → evidencia → validación → readiness y legacy 410", async () => {
    const server = createLB6Server(); servers.push(server); await new Promise<void>(resolve => server.listen(0, "127.0.0.1", () => resolve()));
    const address = server.address(); if (!address || typeof address === "string") throw new Error("Puerto no disponible");
    const base = `http://127.0.0.1:${address.port}`;
    const ui = await fetch(`${base}/universal-evidence`); expect(ui.status).toBe(200); expect(await ui.text()).toContain("Expediente universal V1");
    const manifest = await fetch(`${base}/api/universal/manifest`); expect(manifest.status).toBe(200); expect((await manifest.json() as { fields: unknown[] }).fields.length).toBeGreaterThan(20);
    const field = encodeURIComponent("object");
    const saved = await fetch(`${base}/api/universal/cases/CONTR%2F2026%2F240267/evidence/${field}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ value: "Suministro de ferretería" }) });
    expect(saved.status).toBe(200);
    const validated = await fetch(`${base}/api/universal/cases/CONTR%2F2026%2F240267/evidence/${field}/validate`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    expect(validated.status).toBe(200);
    const readiness = await fetch(`${base}/api/universal/cases/CONTR%2F2026%2F240267/production-readiness`); expect(readiness.status).toBe(200); expect((await readiness.json() as { ready: boolean }).ready).toBe(false);
    const legacy = await fetch(`${base}/api/cases/ANY/generate`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }); expect(legacy.status).toBe(410);
  });
});
