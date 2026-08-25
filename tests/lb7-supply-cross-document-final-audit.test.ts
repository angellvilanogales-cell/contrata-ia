import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT } from "../src/interfaces/lb7/SupplyCrossDocumentFinalAuditScript";

describe("Paso 11.4.3 - auditoría final cruzada", () => {
  it("mantiene sintaxis válida de navegador", () => {
    expect(() => new Function(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT)).not.toThrow();
  });

  it("requiere las tres versiones corregidas de 11.4.2", () => {
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT).toContain("supplyCrossCorrectionPcapGenerated");
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT).toContain("supplyCrossCorrectionPptGenerated");
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT).toContain("supplyCrossCorrectionMemoryGenerated");
  });

  it("comprueba físicamente las magnitudes económicas canónicas", () => {
    for (const token of ["10.552,44", "8.019,85", "1.899,44", "633,15", "18.160,96", "21.793,15", "3.632,19"]) {
      expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT).toContain(token);
    }
  });

  it("bloquea la permanencia de redacciones obsoletas", () => {
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT).toContain("25.325,86");
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT).toContain("NO EXHAUSTIVO NI LIMITATIVO");
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT).toContain("NO HABILITARÁN LA INCORPORACIÓN DE NUEVOS ARTÍCULOS");
  });

  it("verifica DA33, 20 %, criterio precio y plazo de entrega", () => {
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT).toContain("DISPOSICIÓN ADICIONAL 33");
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT).toContain("100 PUNTOS");
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT).toContain("5 DÍAS HÁBILES");
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT).toContain("20 %");
  });

  it("solo registra golden case con cero bloqueantes y validación humana", () => {
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT).toContain("supplyCrossDocumentFinalBlockers");
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT).toContain("b.length!==0");
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT).toContain("CONTR-2026-240267-SUPPLY-DA33-GOLDEN-001");
    expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT).toContain("VALIDATED_DOCUMENTARY_GOLDEN_CASE");
  });

  it("está integrado después del generador 11.4.2", () => {
    const ui = fs.readFileSync(path.resolve("src/interfaces/lb7/AdaptiveFlowUi.ts"), "utf8");
    expect(ui).toContain("SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT");
    expect(ui.indexOf("${SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT}")).toBeGreaterThan(ui.indexOf("${SUPPLY_CROSS_DOCUMENT_CORRECTION_GENERATOR_SCRIPT}"));
    expect(ui).toContain("Paso 11.4.3 auditoría final cruzada");
  });
});
