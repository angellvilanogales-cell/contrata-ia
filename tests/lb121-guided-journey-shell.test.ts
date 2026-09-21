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

  it("no crea un ciclo de renderizado al observar sus propios cambios", () => {
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain("if(grid.innerHTML!==markup)");
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain("if(scheduled)return");
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).not.toContain("attributes:true");
  });

  it("convierte las etapas en botones navegables y señala el paso actual", () => {
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain('button type="button" data-step=');
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain('aria-current=');
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain('scrollIntoView');
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain("Complete primero el paso");
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain("visible(STEPS[i])&&!complete(STEPS[i],a)");
  });

  it("permite volver y fija los supuestos económicos del ejemplo", () => {
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain("Volver al paso anterior");
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain("budgetLimitVatIncludedCents:5500000");
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain("economicEvidenceAssumed:true");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("applyDemoEconomicDefaults");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("Supuesto del ejemplo");
  });
});
