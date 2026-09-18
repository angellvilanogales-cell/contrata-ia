import { describe, expect, it } from "vitest";
import { LB110_CAPACITY_SOLVENCY_SCRIPT } from "../src/interfaces/lb103/LB110CapacityAndSolvencyScript";

describe("LB110 · interfaz", () => {
  it("explica y muestra los elementos no exigibles", () => {
    expect(LB110_CAPACITY_SOLVENCY_SCRIPT).toContain("si no procede, incorporará la causa concreta");
    expect(LB110_CAPACITY_SOLVENCY_SCRIPT).toContain("no se exige acreditar solvencia económica ni técnica");
    expect(LB110_CAPACITY_SOLVENCY_SCRIPT).toContain("Destino:");
  });
  it("persiste ambas redacciones solo al confirmar", () => {
    expect(LB110_CAPACITY_SOLVENCY_SCRIPT).toContain('validate(cid,"criteria.economicSolvency",economic.text)');
    expect(LB110_CAPACITY_SOLVENCY_SCRIPT).toContain('validate(cid,"criteria.technicalSolvency",technical.text)');
    expect(LB110_CAPACITY_SOLVENCY_SCRIPT).toContain("lb110-human-validation");
  });
});
