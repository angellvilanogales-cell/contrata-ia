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
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain("if(!complete(STEPS[i],a))return i");
  });

  it("impide saltar a documentos, oculta el resumen antiguo y numera todos los módulos", () => {
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain('{n:8,title:"Documentos",keys:["__lb120"],blocks:["lb120Block"]}');
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain('if(legacy&&a.__lb107)legacy.style.display="none"');
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain("numberBlockHeadings()");
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain('step.blocks.length>1?step.n+"."+(index+1)');
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain('replace(/^Paso\\s+\\d+(?:\\.\\d+)?');
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain("Recuperando el paso");
  });

  it("separa adjudicación de condiciones contractuales y hace visible la subnumeración", () => {
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain(
      '{n:3,title:"Adjudicación",keys:["__lb109","__lb110","__lb111"]',
    );
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain(
      '{n:4,title:"Condiciones contractuales",keys:["__lb112","__lb113","__lb114","__lb115","__lb116"]',
    );
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain("Apartados ");
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain("step.n+'.1 a '");
  });

  it("distingue el paso documental de los siete pasos de decisiones", () => {
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain("Decisiones completas · modelos pendientes");
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain("Preparación documental");
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain("MODEL_PENDING");
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain("Modelo compatible verificado");
  });

  it("permite volver y fija los supuestos económicos del ejemplo", () => {
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain("Volver al paso anterior");
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain("budgetLimitVatIncludedCents:5500000");
    expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain("economicEvidenceAssumed:true");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("applyDemoEconomicDefaults");
    expect(LB108_ECONOMIC_STARTING_POINT_SCRIPT).toContain("Supuesto del ejemplo");
  });

  it("aplica organización y traducción transversal a los bloques venideros", () => {
    for (const text of [
      "#lb114Block label",
      "#lb119Block label",
      "translateVisibleCodes",
      "Memoria justificativa",
      "Pliego de cláusulas administrativas particulares",
      "Sin acceso a datos personales",
      "Obligación contractual esencial",
    ]) expect(LB121_GUIDED_JOURNEY_SHELL_SCRIPT).toContain(text);
  });
});
