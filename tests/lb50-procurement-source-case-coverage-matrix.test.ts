import { describe, expect, it } from "vitest";
import { PROCUREMENT_SOURCE_CASE_COVERAGE_MATRIX, evaluateProcurementSourceCaseCoverage } from "../src/application/intake/lb50/ProcurementSourceCaseCoverageMatrix";

describe("LB50 - matriz de casuística de fuentes", () => {
  it("incluye una casuística transversal de suministros, servicios, obras, mixtos, arrendamiento y concesiones", () => {
    const result = evaluateProcurementSourceCaseCoverage();
    expect(result.contractTypes).toEqual(expect.arrayContaining(["SUPPLY", "SERVICE", "WORKS", "MIXED", "LEASE", "CONCESSION"]));
    expect(result.corpusCaseCount).toBeGreaterThanOrEqual(12);
  });

  it("mantiene ferretería como caso productivo validado sin convertir el resto de ejemplos en soporte productivo", () => {
    const ferreteria = PROCUREMENT_SOURCE_CASE_COVERAGE_MATRIX.find(item => item.id === "REG-SUPPLY-FERRETERIA-240267")!;
    expect(ferreteria.status).toBe("PRODUCTION_VALIDATED");
    const result = evaluateProcurementSourceCaseCoverage();
    expect(result.universalProductionClaimAllowed).toBe(false);
    expect(result.referenceCaseIds.length).toBeGreaterThan(0);
  });

  it("registra casos con lotes, prestaciones intelectuales, mantenimiento, obras y contratos mixtos para futuras regresiones", () => {
    const features = PROCUREMENT_SOURCE_CASE_COVERAGE_MATRIX.flatMap(item => item.distinguishingFeatures).join(" ");
    expect(features).toMatch(/8 lotes/);
    expect(features).toMatch(/prestaciones intelectuales/);
    expect(features).toMatch(/mantenimiento/);
    expect(features).toMatch(/obra/);
    expect(features).toMatch(/contrato mixto/);
  });

  it("explica que fuente disponible no equivale a soporte productivo", () => {
    const result = evaluateProcurementSourceCaseCoverage();
    expect(result.universalProductionClaimBlocker).toMatch(/no equivale a soporte productivo/i);
    expect(result.universalProductionClaimBlocker).toMatch(/validación humana/i);
  });
});
