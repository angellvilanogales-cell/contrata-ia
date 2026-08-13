import { describe, expect, it } from "vitest";
import { SUPPLY_CATALOGUE_SCRIPT } from "../src/interfaces/lb7/SupplyCatalogueScript";

describe("LB-7 supply catalogue branch", () => {
  it("offers an Excel-compatible template and supply catalogue import", () => {
    expect(SUPPLY_CATALOGUE_SCRIPT).toContain("Descargar plantilla para Excel");
    expect(SUPPLY_CATALOGUE_SCRIPT).toContain("Importar relación cumplimentada");
    expect(SUPPLY_CATALOGUE_SCRIPT).toContain("Referencia;Denominación;Descripción técnica mínima;Unidad;Cantidad estimada;Precio unitario estimado sin IVA;Lote;CPV");
  });

  it("checks basic catalogue coherence and keeps automatic categories advisory", () => {
    expect(SUPPLY_CATALOGUE_SCRIPT).toContain("cantidad estimada no válida");
    expect(SUPPLY_CATALOGUE_SCRIPT).toContain("precio unitario no válido");
    expect(SUPPLY_CATALOGUE_SCRIPT).toContain("referencia duplicada");
    expect(SUPPLY_CATALOGUE_SCRIPT).toContain("La propuesta automática solo sirve como ayuda inicial");
    expect(SUPPLY_CATALOGUE_SCRIPT).toContain("Tornillería y elementos de fijación");
  });

  it("accepts ODS without reading its binary ZIP bytes as CSV text", () => {
    expect(SUPPLY_CATALOGUE_SCRIPT).toContain(".csv,.ods");
    expect(SUPPLY_CATALOGUE_SCRIPT).toContain("odsContentXml");
    expect(SUPPLY_CATALOGUE_SCRIPT).toContain("DecompressionStream");
    expect(SUPPLY_CATALOGUE_SCRIPT).toContain("Precio unitario");
    expect(SUPPLY_CATALOGUE_SCRIPT).toContain("Formato leído");
  });

  it("groups articles and subtotals by lot", () => {
    expect(SUPPLY_CATALOGUE_SCRIPT).toContain("Cada lote se muestra y calcula de forma independiente");
    expect(SUPPLY_CATALOGUE_SCRIPT).toContain("Lote 1 — lote único");
    expect(SUPPLY_CATALOGUE_SCRIPT).toContain("Importe estimado total");
    expect(SUPPLY_CATALOGUE_SCRIPT).toContain("lotGroups");
    expect(SUPPLY_CATALOGUE_SCRIPT).toContain("lotTotal");
  });

  it("blocks continuation until catalogue and declared budget are reconciled", () => {
    expect(SUPPLY_CATALOGUE_SCRIPT).toContain("Debe conciliarse el presupuesto antes de continuar");
    expect(SUPPLY_CATALOGUE_SCRIPT).toContain("Usar importe de la tabla");
    expect(SUPPLY_CATALOGUE_SCRIPT).toContain("Mantener presupuesto declarado");
    expect(SUPPLY_CATALOGUE_SCRIPT).toContain("supplyBudgetDifferenceJustified");
  });

  it("opens the award-criteria branch after economic reconciliation", () => {
    expect(SUPPLY_CATALOGUE_SCRIPT).toContain("Continuar expediente · criterios de adjudicación");
    expect(SUPPLY_CATALOGUE_SCRIPT).toContain("Solo precio");
    expect(SUPPLY_CATALOGUE_SCRIPT).toContain("Varios criterios objetivos cuantificables mediante fórmula");
    expect(SUPPLY_CATALOGUE_SCRIPT).toContain("Rama específica de suministro abierta");
  });
});
