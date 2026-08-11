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
});
