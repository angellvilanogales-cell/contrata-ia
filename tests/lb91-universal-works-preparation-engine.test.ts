import { describe, expect, it } from "vitest";
import { UniversalWorksPreparationEngine } from "../src/engines/UniversalWorksPreparationEngine";

const engine = new UniversalWorksPreparationEngine();

describe("LB91.12 - preparación universal de obras", () => {
  it("bloquea expediente sin proyecto, aprobación y replanteo", () => {
    const result = engine.evaluate({
      projectPrepared: false,
      projectApproved: false,
      projectReplanted: false,
      baseTenderBudgetExVatCents: 10_000_000,
      landAvailabilityConfirmed: false,
    });
    expect(result.preparationReady).toBe(false);
    expect(result.blockers.length).toBeGreaterThanOrEqual(4);
  });

  it("exige supervisión desde 500.000 euros sin IVA", () => {
    const result = engine.evaluate({
      projectPrepared: true,
      projectApproved: true,
      projectReplanted: true,
      baseTenderBudgetExVatCents: 50_000_000,
      landAvailabilityConfirmed: true,
    });
    expect(result.supervisionRequired).toBe(true);
    expect(result.preparationReady).toBe(false);
  });

  it("exige supervisión por estabilidad aunque el PBL sea inferior", () => {
    const result = engine.evaluate({
      projectPrepared: true,
      projectApproved: true,
      projectReplanted: true,
      baseTenderBudgetExVatCents: 10_000_000,
      affectsStabilitySafetyOrWatertightness: true,
      supervisionReportAvailable: false,
      landAvailabilityConfirmed: true,
    });
    expect(result.supervisionRequired).toBe(true);
  });

  it("permite cerrar preparación cuando constan todos los hechos necesarios", () => {
    const result = engine.evaluate({
      projectPrepared: true,
      projectApproved: true,
      projectReplanted: true,
      baseTenderBudgetExVatCents: 60_000_000,
      supervisionReportAvailable: true,
      landAvailabilityConfirmed: true,
    });
    expect(result.preparationReady).toBe(true);
  });
});
