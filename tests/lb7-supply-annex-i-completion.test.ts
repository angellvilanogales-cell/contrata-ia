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

  it("ancla la modificación DA33 a su propia causa y no aplica el 20 por ciento a la causa 1", () => {
    const value = source();
    expect(value).toContain("A14-causa1-no");
    expect(value).toContain("A14-da33");
    expect(value).toContain("A14-alcance");
    expect(value).toContain("A14-pct");
    expect(value).toContain("Otras causas de modificación previstas: No procede");
    expect(value).toContain("no podrán incorporarse nuevos artículos ni nuevos precios unitarios");
    expect(value).not.toContain("A14-causa1-pct");
  });

  it("recupera condiciones, penalidades y DIR3 contrastados del expediente", () => {
    const value = source();
    expect(value).toContain("Dirección Gerencia del Servicio Andaluz de Empleo");
    expect(value).toContain("A01004615");
    expect(value).toContain("A01004456");
    expect(value).toContain("Abandono de embalajes: 300,00 € por pedido afectado");
    expect(value).toContain("5 % del importe neto del pedido afectado");
    expect(value).toContain("10,00 € sin IVA por cada día hábil de retraso");
    expect(value).toContain("Pagos parciales");
  });

  it("cierra opciones condicionales conocidas y no las convierte en falsos bloqueantes", () => {
    const value = source();
    expect(value).toContain("1.D. RÉGIMEN JURÍDICO ESPECÍFICO POR RAZÓN DEL OBJETO DEL CONTRATO: No procede");
    expect(value).toContain("Oferta integradora: No");
    expect(value).toContain("Variación de precios en función del cumplimiento o incumplimiento de objetivos: No");
    expect(value).toContain("Se prevén pagos directos a subcontratistas: No");
    expect(value).toContain("La ejecución del contrato requiere el tratamiento por la persona contratista de datos personales por cuenta de la persona responsable del tratamiento: No");
  });

  it("audita una lista cerrada de destinos reales y mantiene el catálogo como bloqueante explícito", () => {
    const value = source();
    expect(value).toContain("var audit=[");
    expect(value).toContain("especificaciones del objeto: volcado estructural de las 98 referencias, cantidades e importes desde el catálogo validado");
    expect(value).toContain("supplyAnnexIUnresolvedFields");
    expect(value).toContain("PENDING_HUMAN_COMPLETION");
    expect(value).toContain("Bloqueantes reales pendientes");
    expect(value).not.toContain('tx.indexOf(\"SÍ/NO\")>=0');
  });

  it("mantiene separadas PBL, presupuesto máximo DA33 y valor estimado", () => {
    const value = source();
    expect(value).toContain("supplyCurrentTenderBudgetExVat");
    expect(value).toContain("supplyMaximumApprovedBudgetExVat");
    expect(value).toContain("supplyEstimatedValueExVat");
    expect(value).toContain("10552.44");
    expect(value).toContain("18160.96");
    expect(value).toContain("21793.15");
  });
});
