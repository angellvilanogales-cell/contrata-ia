import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function source(): string {
  return fs.readFileSync(path.resolve("src/interfaces/lb7/SupplyOfficialPcapAnnexICompletionScript.ts"), "utf8");
}

describe("LB-7 cierre integral del Anexo I oficial", () => {
  it("acota las sustituciones al Anexo I real y termina antes del Anexo II", () => {
    const value = source();
    expect(value).toContain("function getAnnexIRange()");
    expect(value).toContain('norm(all[i].textContent)!==\"ANEXO I\"');
    expect(value).toContain('et===\"ANEXO II\"');
    expect(value).toContain("nodes=all.slice(bounds.start,bounds.end)");
  });

  it("no usa una búsqueda global del porcentaje DA33 y ancla cada causa de modificación", () => {
    const value = source();
    expect(value).toContain("A14-causa1-pct");
    expect(value).toContain("A14-causa2");
    expect(value).toContain("A14-causa2-alcance");
    expect(value).toContain("no podrán incorporarse nuevos artículos ni establecerse nuevos precios unitarios");
  });

  it("recupera campos administrativos contrastados del expediente", () => {
    const value = source();
    expect(value).toContain("Dirección Gerencia del Servicio Andaluz de Empleo");
    expect(value).toContain("Pagos parciales");
    expect(value).toContain("100 euros, previa justificación de los gastos ocasionados");
    expect(value).toContain("una o varias prórrogas por un período máximo acumulado de 24 meses");
    expect(value).toContain("3 años para bienes de naturaleza duradera");
  });

  it("audita únicamente campos del órgano de contratación y registra bloqueantes", () => {
    const value = source();
    expect(value).toContain('tx.indexOf(\"SÍ/NO\")>=0');
    expect(value).toContain('tx.indexOf(\"_______\")>=0');
    expect(value).toContain("supplyAnnexIUnresolvedFields");
    expect(value).toContain('PENDING_HUMAN_COMPLETION');
    expect(value).toContain("No modifica los Anexos II y siguientes");
  });
});
