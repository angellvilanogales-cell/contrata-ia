import { describe, expect, it } from "vitest";
import { evaluateWorksPreparationGate } from "../src/application/intake/lb97/WorksPreparationGate";
import { evaluateWorksVerticalClosure } from "../src/application/intake/lb97/WorksVerticalClosureGate";
import { LB97_WORKS_RUNTIME_ASSETS } from "../src/application/intake/lb97/WorksPersistedTemplateAssetStore";

describe("LB97 preparación y cierre Works", () => {
  it("exige supervisión desde 500.000 euros sin IVA", () => {
    const preparation = evaluateWorksPreparationGate({ projectExists: true, projectApproved: true, baseTenderBudgetExVatCents: 50_000_000, affectsStabilitySafetyOrWatertightness: false, supervisionReportAvailable: false, replanteoCompleted: true, terrainAvailabilityAccredited: true });
    expect(preparation.supervisionRequired).toBe(true);
    expect(preparation.readyForTenderPreparation).toBe(false);
    expect(preparation.blockers.join(" ")).toContain("artículo 235");
  });

  it("exige supervisión por estabilidad, seguridad o estanqueidad aunque el PBL sea inferior", () => {
    const preparation = evaluateWorksPreparationGate({ projectExists: true, projectApproved: true, baseTenderBudgetExVatCents: 10_000_000, affectsStabilitySafetyOrWatertightness: true, supervisionReportAvailable: false, replanteoCompleted: true, terrainAvailabilityAccredited: true });
    expect(preparation.supervisionRequired).toBe(true);
    expect(preparation.readyForTenderPreparation).toBe(false);
  });

  it("no confunde tener tres ODT con tener un expediente Works preparado", () => {
    const preparation = evaluateWorksPreparationGate({ projectExists: false, projectApproved: false, baseTenderBudgetExVatCents: 20_000_000, affectsStabilitySafetyOrWatertightness: false, supervisionReportAvailable: false, replanteoCompleted: false, terrainAvailabilityAccredited: null });
    const closure = evaluateWorksVerticalClosure({ pcapAvailable: true, memoryAvailable: true, pptAvailable: true, preparation, packageGeneratorReady: true });
    expect(closure.documentaryLayerReady).toBe(true);
    expect(closure.preparationLayerReady).toBe(false);
    expect(closure.engineeringClosed).toBe(false);
  });

  it("mantiene el cierre bloqueado mientras falte renderer, ZIP y auditoría cruzada", () => {
    const preparation = evaluateWorksPreparationGate({ projectExists: true, projectApproved: true, baseTenderBudgetExVatCents: 20_000_000, affectsStabilitySafetyOrWatertightness: false, supervisionReportAvailable: false, replanteoCompleted: true, terrainAvailabilityAccredited: true });
    const closure = evaluateWorksVerticalClosure({ pcapAvailable: true, memoryAvailable: true, pptAvailable: true, preparation });
    expect(preparation.readyForTenderPreparation).toBe(true);
    expect(closure.packageGeneratorReady).toBe(false);
    expect(closure.engineeringClosed).toBe(false);
  });

  it("solo habilita cierre cuando documentos, preparación y generador están acreditados", () => {
    const preparation = evaluateWorksPreparationGate({ projectExists: true, projectApproved: true, baseTenderBudgetExVatCents: 20_000_000, affectsStabilitySafetyOrWatertightness: false, supervisionReportAvailable: false, replanteoCompleted: true, terrainAvailabilityAccredited: true });
    const closure = evaluateWorksVerticalClosure({ pcapAvailable: true, memoryAvailable: true, pptAvailable: true, preparation, packageGeneratorReady: true });
    expect(preparation.supervisionRequired).toBe(false);
    expect(closure.engineeringClosed).toBe(true);
    expect(closure.productionReady).toBe(false);
    expect(closure.humanValidationRequired).toBe(true);
  });

  it("mantiene un inventario Works independiente de tres piezas", () => {
    expect(LB97_WORKS_RUNTIME_ASSETS).toHaveLength(3);
    expect(LB97_WORKS_RUNTIME_ASSETS.map(item => item.kind).sort()).toEqual(["MEMORIA", "PCAP", "PPT"]);
    expect(LB97_WORKS_RUNTIME_ASSETS.every(item => item.templateId.includes(":works:"))).toBe(true);
  });
});
