import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_CALIBRATION_SCRIPT } from "../src/interfaces/lb7/SupplyCrossDocumentFinalAuditCalibrationScript";

describe("Paso 11.4.3A - calibración final", () => {
  it("compila de forma aislada", () => {
    expect(() => new Function(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_CALIBRATION_SCRIPT)).not.toThrow();
  });

  it("acepta el plazo real del PPT cinco (5) días hábiles", () => {
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_CALIBRATION_SCRIPT).toContain("CINCO (5) DÍAS HÁBILES");
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_CALIBRATION_SCRIPT).toContain("5 DÍAS HÁBILES");
  });

  it("no exige CPV literal dentro del PPT y verifica la identidad del expediente", () => {
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_CALIBRATION_SCRIPT).toContain("CONTR/2026/240267");
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_CALIBRATION_SCRIPT).not.toContain("PPT-CPV");
  });

  it("repara el desglose económico 76/18/6 de la Memoria", () => {
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_CALIBRATION_SCRIPT).toContain("8.019,85");
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_CALIBRATION_SCRIPT).toContain("1.899,44");
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_CALIBRATION_SCRIPT).toContain("633,15");
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_CALIBRATION_SCRIPT).toContain("76,00 %");
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_CALIBRATION_SCRIPT).toContain("21.793,15");
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_CALIBRATION_SCRIPT).toContain("18.160,96");
  });

  it("queda integrado después del 11.4.3", () => {
    const uiSource = fs.readFileSync(path.resolve("src/interfaces/lb7/AdaptiveFlowUi.ts"), "utf8");
    expect(uiSource).toContain("SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_CALIBRATION_SCRIPT");
    const audit = uiSource.indexOf("${SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT}");
    const calibration = uiSource.indexOf("${SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_CALIBRATION_SCRIPT}");
    expect(audit).toBeGreaterThanOrEqual(0);
    expect(calibration).toBeGreaterThan(audit);
  });
});
