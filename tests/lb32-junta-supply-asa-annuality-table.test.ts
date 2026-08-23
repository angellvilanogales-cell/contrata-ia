import { describe, expect, it } from "vitest";
import {
  FERRETERIA_ANNUALITY_BUDGET_ROWS,
  JDA_SUPPLY_ASA_ANNUALITY_TABLE_BINDING,
  JDA_SUPPLY_ASA_LB32_EDITABLE_ASSET,
  JDA_SUPPLY_ASA_LB32_PHYSICAL_BINDINGS,
  JDA_SUPPLY_ASA_LB32_RENDERER_CONFIGURATION,
  evaluateJdaSupplyAsaLb32PhysicalClosure,
} from "../src/application/intake/lb32/JuntaSupplyAsaAnnualityTableBinding";

describe("LB32 - tabla ODF de anualidades", () => {
  it("mantiene inventario físico exacto y usa RAW_XML solo con formatter explícito", () => {
    expect(JDA_SUPPLY_ASA_LB32_EDITABLE_ASSET.slotIds.length).toBe(JDA_SUPPLY_ASA_LB32_PHYSICAL_BINDINGS.length);
    expect(JDA_SUPPLY_ASA_ANNUALITY_TABLE_BINDING.escapeMode).toBe("RAW_XML");
    expect(JDA_SUPPLY_ASA_LB32_RENDERER_CONFIGURATION.formattersBySlotId?.[JDA_SUPPLY_ASA_ANNUALITY_TABLE_BINDING.slotId]).toBeTypeOf("function");
  });

  it("materializa las tres anualidades reales con sus partidas sin perder estilos de tabla", () => {
    const formatter = JDA_SUPPLY_ASA_LB32_RENDERER_CONFIGURATION.formattersBySlotId?.["pcap.anexoI.2A.anualidadesTabla"];
    const xml = formatter?.(FERRETERIA_ANNUALITY_BUDGET_ROWS, "economic.annualityBudgetRows") ?? "";
    expect(xml).toContain('table:name="Tabla1"');
    expect(xml).toContain('table:style-name="Tabla1.2"');
    expect(xml).toContain(">2026<");
    expect(xml).toContain("1596,06 €");
    expect(xml).toContain("6384,23 €");
    expect(xml).toContain("4788,16 €");
    expect(xml.match(/1439010000 G\/32L\/22000\/00 01/g)?.length).toBe(3);
  });

  it("rechaza anualidades sin IVA incluido, duplicadas o sin partida", () => {
    const formatter = JDA_SUPPLY_ASA_LB32_RENDERER_CONFIGURATION.formattersBySlotId?.["pcap.anexoI.2A.anualidadesTabla"]!;
    expect(() => formatter([{ year: 2026, amountCents: 100, budgetApplication: "A", vatIncluded: false }], "economic.annualityBudgetRows")).toThrow(/IVA incluido/i);
    expect(() => formatter([
      { year: 2026, amountCents: 100, budgetApplication: "A", vatIncluded: true },
      { year: 2026, amountCents: 200, budgetApplication: "B", vatIncluded: true },
    ], "economic.annualityBudgetRows")).toThrow(/duplicada/i);
    expect(() => formatter([{ year: 2026, amountCents: 100, budgetApplication: "", vatIncluded: true }], "economic.annualityBudgetRows")).toThrow(/partida presupuestaria/i);
  });

  it("reduce a dos los bloqueos físicos verdaderos", () => {
    const closure = evaluateJdaSupplyAsaLb32PhysicalClosure();
    expect(closure.fullPhysicalCoverageReady).toBe(false);
    expect(closure.remainingBlockingCount).toBe(2);
    expect(closure.blockers.map(item => item.id)).toEqual([
      "processing-ordinary-urgent-controls",
      "planned-modification-section",
    ]);
  });
});
