import { describe, expect, it } from "vitest";
import { UniversalExecutionEngine } from "../src/engines/UniversalExecutionEngine";

const engine = new UniversalExecutionEngine();
const condition = (family: "ENVIRONMENTAL" | "DATA_PROTECTION" = "ENVIRONMENTAL") => ({
  id: `condition-${family}`,
  linkedToObject: true,
  nonDiscriminatory: true,
  euLawCompatible: true,
  statedInNoticeAndPliegos: true,
  family,
  appliesToSubcontractors: true,
});

describe("LB91.11 - ejecución contractual sin cláusulas inventadas", () => {
  it("exige al menos una condición especial de ejecución", () => {
    const result = engine.evaluate({ contractType: "SUPPLY", specialConditions: [], publicBodyTransfersPersonalDataToContractor: false, penalties: [] });
    expect(result.valid).toBe(false);
    expect(result.blockers.some(item => item.includes("al menos una"))).toBe(true);
  });

  it("exige condición específica de protección de datos cuando existe cesión", () => {
    const result = engine.evaluate({
      contractType: "SERVICE",
      specialConditions: [condition("ENVIRONMENTAL")],
      publicBodyTransfersPersonalDataToContractor: true,
      penalties: [],
    });
    expect(result.valid).toBe(false);
    expect(result.blockers.some(item => item.includes("protección de datos"))).toBe(true);
  });

  it("valida una condición ligada al objeto y aplicable a subcontratistas", () => {
    const result = engine.evaluate({
      contractType: "SERVICE",
      specialConditions: [condition("DATA_PROTECTION")],
      publicBodyTransfersPersonalDataToContractor: true,
      penalties: [{ id: "defective", individualMaximumPercentOfContractPriceExVat: 5, aggregateMaximumPercentOfContractPriceExVat: 20, proportionalToBreach: true }],
    });
    expect(result.valid).toBe(true);
  });

  it("bloquea penalidades que superan límites del artículo 192", () => {
    const result = engine.evaluate({
      contractType: "WORKS",
      specialConditions: [condition()],
      publicBodyTransfersPersonalDataToContractor: false,
      penalties: [{ id: "too-high", individualMaximumPercentOfContractPriceExVat: 11, aggregateMaximumPercentOfContractPriceExVat: 51, proportionalToBreach: true }],
    });
    expect(result.valid).toBe(false);
  });

  it("exige justificar las tareas críticas reservadas al contratista principal", () => {
    const result = engine.evaluate({
      contractType: "SERVICE",
      specialConditions: [condition()],
      publicBodyTransfersPersonalDataToContractor: false,
      penalties: [],
      criticalTasksReservedToMainContractor: true,
      criticalTasksJustifiedInFile: false,
    });
    expect(result.valid).toBe(false);
    expect(result.blockers.some(item => item.includes("tareas críticas"))).toBe(true);
  });

  it("mantiene advertencia específica para concesiones", () => {
    const result = engine.evaluate({ contractType: "CONCESSION", specialConditions: [condition()], publicBodyTransfersPersonalDataToContractor: false, penalties: [] });
    expect(result.warnings.some(item => item.includes("concesiones"))).toBe(true);
  });
});
