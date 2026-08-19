import { describe, expect, it } from "vitest";
import { SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT } from "../src/interfaces/lb7/SupplyCrossDocumentFinalAuditScript";
import { SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_CALIBRATION_SCRIPT } from "../src/interfaces/lb7/SupplyCrossDocumentFinalAuditCalibrationScript";

describe("Paso 11.4.3 recalibrado contra modelos reales", () => {
  it("compila el auditor y la calibración", () => {
    expect(() => new Function(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT)).not.toThrow();
    expect(() => new Function(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_CALIBRATION_SCRIPT)).not.toThrow();
  });

  it("no exige CPV literal dentro del PPT", () => {
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT).not.toContain('check("PPT-CPV"');
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT).toContain('PPT-IDENTITY');
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT).toContain('CONTR/2026/240267');
  });

  it("acepta el plazo del modelo real cinco (5) días hábiles", () => {
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT).toContain('CINCO (5) DÍAS HÁBILES');
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT).toContain('5 DÍAS HÁBILES');
  });

  it("comprueba CPV entre PCAP y Memoria y vincula PPT por expediente", () => {
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT).toContain('44316400-2 en PCAP y Memoria; el PPT se vincula por expediente');
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT).toContain('X-PPT-IDENTITY');
  });

  it("mantiene el desglose 76/18/6 como requisito real de la Memoria", () => {
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT).toContain('8.019,85');
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT).toContain('1.899,44');
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT).toContain('633,15');
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT).toContain('76,00 %');
  });

  it("invalida el resultado anterior cuando 11.4.3A ya se completó", () => {
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_CALIBRATION_SCRIPT).toContain('invalidateStaleAuditIfNeeded');
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_CALIBRATION_SCRIPT).toContain('delete a.supplyCrossDocumentFinalAuditRan');
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_CALIBRATION_SCRIPT).toContain('delete a.supplyCrossDocumentFinalBlockers');
  });
});
