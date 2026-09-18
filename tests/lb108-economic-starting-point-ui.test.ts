import { describe, expect, it } from "vitest";
import { LB108_ECONOMIC_STARTING_POINT_SCRIPT } from "../src/interfaces/lb103/LB108EconomicStartingPointScript";

describe("LB108 · interfaz del bloque económico", () => {
  it("propone metodología, despliega apoyos y carga documentos con huella", () => {
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("Metodología de valoración propuesta");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("lb108Supports");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("lb108Documents");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("valuation-documents");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("SHA-256");
  });
  it("propone el reparto 76/18/6 como referencia corregible y calcula los importes", () => {
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("direct:76,indirect:18,other:6");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("Propuesta inicial 76/18/6");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("no una proporción impuesta por la LCSP");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("updateAutomaticAmounts");
  });
  it("ofrece los dos puntos de partida antes de pedir importes", () => {
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("Existe un límite máximo de crédito");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("La necesidad aún debe definirse y valorarse");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("el procedimiento se analiza mediante el valor estimado sin IVA");
  });

  it("bloquea procedimiento y pliegos mientras falta la valoración", () => {
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("El aplicativo no inventará un importe ni un procedimiento");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("La generación de pliegos permanece bloqueada");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("MARKET_CONSULTATION");
  });

  it("registra cada magnitud económica únicamente tras confirmación humana", () => {
    for (const path of [
      "baseTenderBudgetCents",
      "economic.initialVatAmountCents",
      "economic.initialPblVatIncludedCents",
      "economic.legalEstimatedValueCents",
      "economic.estimatedValueCalculationMethod",
      "durationMonths",
      "extensionMonths",
    ]) expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain(`validateEvidence(id,"${path}"`);
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).not.toContain('validateEvidence(id,"procedure"');
  });
});
