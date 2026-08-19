import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  REGRESSION_COVERAGE_MATRIX,
  REGRESSION_COVERAGE_DIMENSIONS,
  REGRESSION_SOURCE_CASES,
} from "../src/regression/RegressionCoverageMatrix";
import { SUPPLY_GOLDEN_CASE_001 } from "../src/regression/SupplyGoldenCase001";
import { SUPPLY_GOLDEN_CASE_REGISTRY_SCRIPT } from "../src/interfaces/lb7/SupplyGoldenCaseRegistryScript";
import { SUPPLY_REGRESSION_SOURCES_REGISTRY_SCRIPT } from "../src/interfaces/lb7/SupplyRegressionSourcesRegistryScript";

describe("Pasos 11.7 y 11.7.1 - matriz multicaso y fuentes reales", () => {
  it("mantiene el golden case como único escenario jurídicamente validado", () => {
    expect(REGRESSION_COVERAGE_MATRIX).toHaveLength(8);
    const validated = REGRESSION_COVERAGE_MATRIX.filter((c) => c.status === "VALIDATED_GOLDEN");
    expect(validated).toHaveLength(1);
    expect(validated[0].id).toBe(SUPPLY_GOLDEN_CASE_001.id);
  });

  it("registra cinco suministros con documentación real sin elevarlos a golden", () => {
    expect(REGRESSION_SOURCE_CASES).toHaveLength(5);
    expect(REGRESSION_SOURCE_CASES.every((c) => c.status === "SOURCE_DOCUMENTS_AVAILABLE")).toBe(true);
    expect(REGRESSION_SOURCE_CASES.every((c) => c.sourceBasis === "REAL_SOURCE_DOCUMENTS")).toBe(true);
    expect(REGRESSION_SOURCE_CASES.every((c) => c.source?.legalValidation === "PENDING")).toBe(true);
    expect(REGRESSION_SOURCE_CASES.every((c) => c.source?.documents.includes("MEMORIA") && c.source?.documents.includes("PCAP") && c.source?.documents.includes("PPT"))).toBe(true);
  });

  it("mantiene los casos de servicios como cobertura pendiente de fuente real", () => {
    const pending = REGRESSION_COVERAGE_MATRIX.filter((c) => c.status === "SOURCE_VALIDATION_REQUIRED");
    expect(pending).toHaveLength(2);
    expect(pending.every((c) => c.contractType === "SERVICIO")).toBe(true);
    expect(pending.every((c) => c.sourceBasis === "PENDING_REAL_CASE")).toBe(true);
  });

  it("identifica los cinco expedientes reales incorporados", () => {
    const exp = new Set(REGRESSION_SOURCE_CASES.map((c) => c.source?.expediente));
    expect(exp).toEqual(new Set([
      "CONTR 2025 0000466864",
      "CONTR 2025 0000489703",
      "470/2025",
      "CONTR 2024 0001239412",
      "CF050-21-058",
    ]));
  });

  it("cubre los principales ejes funcionales previstos", () => {
    expect(new Set(REGRESSION_COVERAGE_MATRIX.map((c) => c.contractType))).toEqual(new Set(REGRESSION_COVERAGE_DIMENSIONS.contractTypes));
    expect(new Set(REGRESSION_COVERAGE_MATRIX.map((c) => c.procedure))).toEqual(new Set(REGRESSION_COVERAGE_DIMENSIONS.procedures));
    expect(new Set(REGRESSION_COVERAGE_MATRIX.map((c) => c.needsBased))).toEqual(new Set(REGRESSION_COVERAGE_DIMENSIONS.needsBased));
    expect(new Set(REGRESSION_COVERAGE_MATRIX.map((c) => c.lots))).toEqual(new Set(REGRESSION_COVERAGE_DIMENSIONS.lots));
    expect(new Set(REGRESSION_COVERAGE_MATRIX.map((c) => c.extensions))).toEqual(new Set(REGRESSION_COVERAGE_DIMENSIONS.extensions));
    expect(new Set(REGRESSION_COVERAGE_MATRIX.map((c) => c.plannedModification))).toEqual(new Set(REGRESSION_COVERAGE_DIMENSIONS.plannedModification));
    expect(new Set(REGRESSION_COVERAGE_MATRIX.map((c) => c.awardMode))).toEqual(new Set(REGRESSION_COVERAGE_DIMENSIONS.awardModes));
    expect(new Set(REGRESSION_COVERAGE_MATRIX.map((c) => c.economicMode))).toEqual(new Set(REGRESSION_COVERAGE_DIMENSIONS.economicModes));
  });

  it("prioriza REG-SUPPLY-002 como primer contraste sin DA 33", () => {
    const next = REGRESSION_COVERAGE_MATRIX.find((c) => c.id === "REG-SUPPLY-002");
    expect(next?.status).toBe("SOURCE_DOCUMENTS_AVAILABLE");
    expect(next?.needsBased).toBe(false);
    expect(next?.lots).toBe(false);
    expect(next?.source?.shortName).toContain("Panda Antivirus");
    expect(SUPPLY_REGRESSION_SOURCES_REGISTRY_SCRIPT).toContain("REG-SUPPLY-002");
  });

  it("expone 11.7 y 11.7.1 sin confundir disponibilidad documental con validación jurídica", () => {
    expect(() => new Function(SUPPLY_GOLDEN_CASE_REGISTRY_SCRIPT)).not.toThrow();
    expect(() => new Function(SUPPLY_REGRESSION_SOURCES_REGISTRY_SCRIPT)).not.toThrow();
    expect(SUPPLY_GOLDEN_CASE_REGISTRY_SCRIPT).toContain("11.7 Matriz de regresión multicaso y cobertura funcional");
    expect(SUPPLY_REGRESSION_SOURCES_REGISTRY_SCRIPT).toContain("11.7.1 Incorporación de expedientes reales de contraste");
    expect(SUPPLY_REGRESSION_SOURCES_REGISTRY_SCRIPT).toContain("validación jurídica pendiente");
    expect(SUPPLY_REGRESSION_SOURCES_REGISTRY_SCRIPT).toContain("Registrar fuentes reales 11.7.1");
  });

  it("integra 11.7.1 después del registro de matriz/golden en adaptive", () => {
    const ui = fs.readFileSync(path.resolve("src/interfaces/lb7/AdaptiveFlowUi.ts"), "utf8");
    expect(ui).toContain("SUPPLY_REGRESSION_SOURCES_REGISTRY_SCRIPT");
    expect(ui.indexOf("${SUPPLY_REGRESSION_SOURCES_REGISTRY_SCRIPT}")).toBeGreaterThan(ui.indexOf("${SUPPLY_GOLDEN_CASE_REGISTRY_SCRIPT}"));
  });
});
