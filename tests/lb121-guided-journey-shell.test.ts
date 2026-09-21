import { describe, expect, it } from "vitest";
import { LB108_ECONOMIC_STARTING_POINT_SCRIPT } from "../src/interfaces/lb103/LB108EconomicStartingPointScript";
import { LB121_GUIDED_JOURNEY_SHELL_SCRIPT } from "../src/interfaces/lb103/LB121GuidedJourneyShellScript";

describe("LB121 · diálogo inicial simplificado", () => {
  it("agrupa el expediente en ocho etapas comprensibles", () => {
    for (const label of [
      "Necesidad y objeto",
      "Presupuesto",
      "Adjudicación",
      "Condiciones",
      "Ejecución",
      "Requisitos técnicos",
      "Datos y seguridad",
      "Documentos",
    ]) expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain(label);
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain("artículos y el texto legal aplicable");
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain("Las decisiones nunca se aprueban automáticamente");
  });

  it("separa el cálculo económico del diálogo de pliegos", () => {
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("Ya tengo el presupuesto y su justificación");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("Quiero calcularlo con la herramienta de presupuesto");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("Todavía no está calculado");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("EXTERNAL_BUDGET_TOOL");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("no pueden cerrarse la Memoria ni el PCAP");
  });
});
