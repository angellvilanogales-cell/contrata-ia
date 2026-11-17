import { describe, expect, it } from "vitest";
import { evaluateWorksPhysicalBaseline, LB97_WORKS_OFFICIAL_MODEL_CANDIDATES } from "../src/application/intake/lb97/WorksPhysicalBaseline";

describe("LB97 baseline físico Works", () => {
  it("registra la matriz oficial Works por procedimiento y financiación sin promover bytes no verificados", () => {
    expect(LB97_WORKS_OFFICIAL_MODEL_CANDIDATES).toHaveLength(10);
    expect(new Set(LB97_WORKS_OFFICIAL_MODEL_CANDIDATES.map(item => item.procedure)).size).toBe(5);
    expect(new Set(LB97_WORKS_OFFICIAL_MODEL_CANDIDATES.map(item => item.financing))).toEqual(new Set(["AUTOFINANCED", "EUROPEAN_FUNDS"]));
    expect(LB97_WORKS_OFFICIAL_MODEL_CANDIDATES.every(item => item.sourceAuthority === "JUNTA_ANDALUCIA_COMISION_CONSULTIVA_RECOMMENDED_MODEL")).toBe(true);
    expect(LB97_WORKS_OFFICIAL_MODEL_CANDIDATES.every(item => item.officialOdtUrl.includes(".odt"))).toBe(true);
    expect(LB97_WORKS_OFFICIAL_MODEL_CANDIDATES.every(item => !item.editableBinaryVerified && !item.physicalPromotionReady)).toBe(true);
  });

  it("mantiene proyecto, supervisión cuando proceda y replanteo como gates de Obras", () => {
    const status = evaluateWorksPhysicalBaseline();
    expect(status.block).toBe("LB97");
    expect(status.legalPreparationCoverage).toBe(true);
    expect(status.officialModelCatalogueVerified).toBe(true);
    expect(status.projectPreparationGateRequired).toBe(true);
    expect(status.supervisionGateRequiredWhenApplicable).toBe(true);
    expect(status.replanteoGateRequired).toBe(true);
    expect(status.physicalPackageOperational).toBe(false);
    expect(status.engineeringClosed).toBe(false);
    expect(status.productionReady).toBe(false);
  });
});
