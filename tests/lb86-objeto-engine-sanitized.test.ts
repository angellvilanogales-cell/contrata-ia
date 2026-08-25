import { describe, expect, it } from "vitest";
import { ObjetoContrato } from "../src/domain/objeto/ObjetoContrato";
import { ObjetoEngine } from "../src/engines/ObjetoEngine";

function validObject(): ObjetoContrato {
  const value = new ObjetoContrato();
  value.titulo = "Servicio de mantenimiento preventivo";
  value.descripcion = "Servicio de mantenimiento preventivo y correctivo de instalaciones administrativas.";
  value.necesidad = "Garantizar la continuidad y seguridad de las instalaciones.";
  value.tipoContrato = "SERVICES";
  return value;
}

describe("LB86 - ObjetoEngine saneado", () => {
  it("no exige valor estimado ni duración para validar el objeto en su propio dominio", async () => {
    const input = validObject();
    input.valorEstimado = 0;
    input.presupuestoBase = 0;
    input.duracionMeses = 0;

    const result = await new ObjetoEngine().analizar(input);

    expect(result.valido).toBe(true);
    expect(result.decision?.resultado).toContain("mantenimiento preventivo");
    expect(result.decision?.articulos).toEqual(["art. 28 LCSP", "art. 99 LCSP"]);
  });

  it("mantiene siempre abierto el análisis de lotes sin presumir que el contrato deba dividirse", async () => {
    const input = validObject();
    input.valorEstimado = 0;

    const result = await new ObjetoEngine().analizar(input);

    expect(result.requiereAnalisisLotes).toBe(true);
    expect(result.decision?.observaciones.join(" ")).toMatch(/no decide por sí solo la división en lotes/i);
  });

  it("normaliza espacios sin reescribir el contenido sustantivo del objeto", async () => {
    const input = validObject();
    input.descripcion = "  Servicio   de mantenimiento preventivo   y correctivo de instalaciones administrativas.  ";

    const result = await new ObjetoEngine().analizar(input);

    expect(result.descripcionNormalizada).toBe("Servicio de mantenimiento preventivo y correctivo de instalaciones administrativas.");
  });

  it("no promueve un resultado jurídico cuando falta la necesidad administrativa", async () => {
    const input = validObject();
    input.necesidad = "";

    const result = await new ObjetoEngine().analizar(input);

    expect(result.valido).toBe(false);
    expect(result.decision?.resultado).toBeUndefined();
    expect(result.decision?.confianza).toBe(0);
    expect(result.errores.join(" ")).toMatch(/artículo 28 LCSP/i);
  });

  it("avisa de que los importes aportados deben validarse en el dominio económico", async () => {
    const input = validObject();
    input.valorEstimado = 100_000;

    const result = await new ObjetoEngine().analizar(input);

    expect(result.valido).toBe(true);
    expect(result.advertencias.join(" ")).toMatch(/dominio económico/i);
  });
});
