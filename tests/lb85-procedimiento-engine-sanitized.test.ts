import { describe, expect, it } from "vitest";
import { ExpedienteContext } from "../src/domain/expediente/ExpedienteContext";
import { TipoProcedimiento } from "../src/domain/procedimiento/TipoProcedimiento";
import { ProcedimientoEngine } from "../src/engines/ProcedimientoEngine";

function context(type: string, estimatedValue: number): ExpedienteContext {
  const value = new ExpedienteContext();
  value.tipoContrato = type;
  value.valorEstimado = estimatedValue;
  return value;
}

describe("LB85 - ProcedimientoEngine saneado", () => {
  it("no convierte automáticamente una cuantía de contrato menor en procedimiento menor", () => {
    const input = context("SERVICE", 12_000);
    input.umbralSara = 216_000;
    input.porcentajeJuicioValor = 0;
    const decision = new ProcedimientoEngine().ejecutar(input);

    expect(decision.resultado).toBe(TipoProcedimiento.ABIERTO_SIMPLIFICADO);
    expect(decision.resultado).not.toBe(TipoProcedimiento.CONTRATO_MENOR);
    expect(decision.observaciones.join(" ")).toMatch(/no consta la justificación del artículo 118/i);
  });

  it("distingue el umbral de contrato menor de obras y exige justificación positiva para promoverlo", () => {
    const input = context("WORKS", 39_999);
    input.contratoMenorJustificado = true;
    const decision = new ProcedimientoEngine().ejecutar(input);

    expect(decision.resultado).toBe(TipoProcedimiento.CONTRATO_MENOR);
    expect(decision.reglasAplicadas).toContain("PROC-2026-MINOR-WORKS");
    expect(decision.articulos).toContain("art. 118 LCSP");
  });

  it("propone 159.6 para suministro por debajo de 60.000 solo si consta que no es intelectual y todos los criterios son de fórmula", () => {
    const input = context("SUPPLY", 59_999);
    input.prestacionesIntelectuales = false;
    input.porcentajeJuicioValor = 0;
    const decision = new ProcedimientoEngine().ejecutar(input);

    expect(decision.resultado).toBe(TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO);
    expect(decision.reglasAplicadas).toContain("PROC-2026-ASA-SUPPLY-SERVICE");
    expect(decision.articulos).toContain("art. 159.6 LCSP");
  });

  it("no inventa la ponderación de juicio de valor cuando todavía no consta", () => {
    const input = context("SERVICE", 30_000);
    input.umbralSara = 216_000;
    const decision = new ProcedimientoEngine().ejecutar(input);

    expect(decision.confianza).toBe(0);
    expect(decision.resultado).toBeUndefined();
    expect(decision.explicacion).toMatch(/ponderación válida/i);
  });

  it("si no consta carácter intelectual no fuerza 159.6 y puede usar 159.1 con un juicio de valor compatible", () => {
    const input = context("SERVICE", 30_000);
    input.umbralSara = 216_000;
    input.porcentajeJuicioValor = 0;
    const decision = new ProcedimientoEngine().ejecutar(input);

    expect(decision.resultado).toBe(TipoProcedimiento.ABIERTO_SIMPLIFICADO);
    expect(decision.resultado).not.toBe(TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO);
  });

  it("no inventa el umbral SARA para suministro o servicio", () => {
    const input = context("SERVICE", 100_000);
    input.prestacionesIntelectuales = false;
    input.porcentajeJuicioValor = 10;
    const decision = new ProcedimientoEngine().ejecutar(input);

    expect(decision.confianza).toBe(0);
    expect(decision.resultado).toBeUndefined();
    expect(decision.explicacion).toMatch(/falta el umbral SARA/i);
  });

  it("propone abierto simplificado si se aporta el umbral SARA aplicable y se cumple el límite de juicio de valor", () => {
    const input = context("SERVICE", 100_000);
    input.umbralSara = 216_000;
    input.prestacionesIntelectuales = false;
    input.porcentajeJuicioValor = 20;
    const decision = new ProcedimientoEngine().ejecutar(input);

    expect(decision.resultado).toBe(TipoProcedimiento.ABIERTO_SIMPLIFICADO);
    expect(decision.reglasAplicadas).toContain("PROC-2026-OSA-SUPPLY-SERVICE");
    expect(decision.articulos).toContain("art. 159.1 LCSP");
  });

  it("admite hasta 45% de juicio de valor para prestaciones intelectuales en el simplificado ordinario", () => {
    const input = context("SERVICE", 100_000);
    input.umbralSara = 216_000;
    input.prestacionesIntelectuales = true;
    input.porcentajeJuicioValor = 45;
    const decision = new ProcedimientoEngine().ejecutar(input);

    expect(decision.resultado).toBe(TipoProcedimiento.ABIERTO_SIMPLIFICADO);
  });

  it("cae en abierto ordinario si la ponderación de juicio de valor supera el límite acreditado del art. 159.1.b", () => {
    const input = context("SERVICE", 100_000);
    input.umbralSara = 216_000;
    input.prestacionesIntelectuales = false;
    input.porcentajeJuicioValor = 30;
    const decision = new ProcedimientoEngine().ejecutar(input);

    expect(decision.resultado).toBe(TipoProcedimiento.ABIERTO);
    expect(decision.reglasAplicadas).toContain("PROC-2026-OPEN-FALLBACK");
  });
});
