import { describe, expect, it } from "vitest";
import { SUPPLY_QUALIFICATION_SCRIPT } from "../src/interfaces/lb7/SupplyQualificationScript";
import { ADAPTIVE_FLOW_UI } from "../src/interfaces/lb7/AdaptiveFlowUi";

describe("LB-7 supply qualification branch", () => {
  it("derives solvency and guarantee consequences instead of asking the user", () => {
    expect(SUPPLY_QUALIFICATION_SCRIPT).toContain("Propuesta jurídica automática según el procedimiento seleccionado");
    expect(SUPPLY_QUALIFICATION_SCRIPT).toContain("quedan exentos de acreditar solvencia económica y financiera y técnica o profesional");
    expect(SUPPLY_QUALIFICATION_SCRIPT).toContain("no se requiere en la tramitación abreviada");
    expect(SUPPLY_QUALIFICATION_SCRIPT).not.toContain("¿Para ejecutar correctamente este suministro necesita exigir a la empresa alguna capacidad o experiencia específica");
  });

  it("preserves the legal reasons as drafting for the PCAP after human validation", () => {
    expect(SUPPLY_QUALIFICATION_SCRIPT).toContain("Redacción para incorporar al PCAP / documentación preparatoria");
    expect(SUPPLY_QUALIFICATION_SCRIPT).toContain("artículo 159.6.b LCSP");
    expect(SUPPLY_QUALIFICATION_SCRIPT).toContain("artículo 159.4.b LCSP");
    expect(SUPPLY_QUALIFICATION_SCRIPT).toContain("artículo 159.6.f LCSP");
    expect(SUPPLY_QUALIFICATION_SCRIPT).toContain("artículo 202.1 LCSP");
    expect(SUPPLY_QUALIFICATION_SCRIPT).toContain("supplyPcapLegalDraft");
    expect(SUPPLY_QUALIFICATION_SCRIPT).toContain("supplyPcapLegalGrounds");
  });

  it("proposes a special execution condition and asks only for human validation or correction", () => {
    expect(SUPPLY_QUALIFICATION_SCRIPT).toContain("Condición especial de ejecución propuesta");
    expect(SUPPLY_QUALIFICATION_SCRIPT).toContain("correcta gestión y retirada de embalajes y residuos");
    expect(SUPPLY_QUALIFICATION_SCRIPT).toContain("Validar propuesta y conservar redacción jurídica");
    expect(SUPPLY_QUALIFICATION_SCRIPT).toContain("Necesito corregirla");
  });

  it("keeps current-law verification before documents", () => {
    expect(SUPPLY_QUALIFICATION_SCRIPT).toContain("validación humana y verificación normativa vigente");
    expect(ADAPTIVE_FLOW_UI).toContain('/supply-qualification.js');
  });
});
