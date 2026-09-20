import { describe, expect, it } from "vitest";
import { LB108_ECONOMIC_STARTING_POINT_SCRIPT } from "../src/interfaces/lb103/LB108EconomicStartingPointScript";

describe("LB108 · interfaz del bloque económico", () => {
  it("propone metodología, despliega apoyos y carga documentos con huella", () => {
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("Metodología de valoración propuesta");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("lb108Supports");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("lb108Documents");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("valuation-documents");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("SHA-256");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("payload.valuationMethodologies");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("payload.supportingDocuments=valuationDocuments");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("Puede seleccionar una o varias");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain('class="lb108Method" type="checkbox"');
    for (const text of ["Qué acredita", "Costes laborales o convenio", "Consumos o volúmenes históricos", "Documentos posibles:"])
      expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain(text);
  });
  it("propone el reparto 76/18/6 como referencia corregible y calcula los importes", () => {
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("direct:76,indirect:18,other:6");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("Propuesta inicial 76/18/6");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("no una proporción impuesta por la LCSP");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("updateAutomaticAmounts");
  });
  it("integra la fuente en la lista y reserva texto libre solo para otra fuente", () => {
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain('"MARKET_CONSULTATION","OTHER_JUSTIFIED"');
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("Otra fuente justificada");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("consolidateValuationSelector");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain('hidden.id="lb108Evidence"');
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("Identifique la otra fuente y justifique su idoneidad");
  });
  it("ofrece los dos puntos de partida antes de pedir importes", () => {
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("Existe un límite máximo de crédito");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("La necesidad aún debe definirse y valorarse");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("el procedimiento se analiza mediante el valor estimado sin IVA");
  });

  it("pregunta de forma expresa por el régimen de necesidades de la DA 33ª", () => {
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("¿Las cantidades dependerán de las necesidades reales durante el contrato?");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain('name="lb108Successive" type="radio" value="NO"');
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain('name="lb108Successive" type="radio" value="YES"');
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("La Administración no queda obligada a consumir la totalidad del presupuesto");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("successiveNeeds:successiveNeedsValue()");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).not.toContain('id="lb108Successive" type="checkbox"');
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
    for (const path of ["economic.valuationMethodology", "economic.valuationSupports", "economic.valuationDocuments", "economic.valuationEvidenceSufficient"])
      expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain(`validateEvidenceRaw(id,"${path}"`);
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).not.toContain('validateEvidence(id,"procedure"');
  });
});
