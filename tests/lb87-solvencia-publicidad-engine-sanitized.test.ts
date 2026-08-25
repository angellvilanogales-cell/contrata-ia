import { describe, expect, it } from "vitest";
import { ExpedienteContext } from "../src/domain/expediente/ExpedienteContext";
import { TipoProcedimiento } from "../src/domain/procedimiento/TipoProcedimiento";
import { TipoPublicidad } from "../src/domain/publicidad/TipoPublicidad";
import { PublicidadEngine } from "../src/engines/PublicidadEngine";
import { SolvenciaEngine } from "../src/engines/SolvenciaEngine";

function context(procedure: TipoProcedimiento): ExpedienteContext {
  const value = new ExpedienteContext();
  value.procedimiento = procedure;
  value.tipoContrato = "SERVICE";
  value.valorEstimado = 100_000;
  return value;
}

describe("LB87 - SolvenciaEngine saneado", () => {
  it("solo cierra automáticamente la exención de acreditación del art. 159.6.b", () => {
    const decision = new SolvenciaEngine().ejecutar(context(TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO));

    expect(decision.resultado).toBe("EXENCION_ACREDITACION_SOLVENCIA_ART_159_6_B");
    expect(decision.articulos).toContain("art. 159.6.b LCSP");
    expect(decision.confianza).toBe(100);
  });

  it("no inventa requisitos genéricos de solvencia para un abierto ordinario", () => {
    const decision = new SolvenciaEngine().ejecutar(context(TipoProcedimiento.ABIERTO));

    expect(decision.resultado).toBeUndefined();
    expect(decision.confianza).toBe(0);
    expect(decision.explicacion).toMatch(/órgano de contratación/i);
    expect(decision.observaciones.join(" ")).toMatch(/pendiente/i);
  });
});

describe("LB87 - PublicidadEngine saneado", () => {
  it("no declara ausencia de publicidad para un contrato menor", () => {
    const decision = new PublicidadEngine().ejecutar(context(TipoProcedimiento.CONTRATO_MENOR));

    expect(decision.resultado).toBe(TipoPublicidad.PERFIL_CONTRATANTE);
    expect(decision.resultado).not.toBe(TipoPublicidad.NINGUNA);
    expect(decision.articulos).toContain("art. 63.4 LCSP");
    expect(decision.observaciones.join(" ")).toMatch(/anticipo de caja fija/i);
  });

  it("no necesita inventar una plataforma concreta para abierto simplificado", () => {
    const decision = new PublicidadEngine().ejecutar(context(TipoProcedimiento.ABIERTO_SIMPLIFICADO));

    expect(decision.resultado).toBe(TipoPublicidad.PERFIL_CONTRATANTE);
    expect(decision.resultado).not.toBe(TipoPublicidad.PLACE);
  });

  it("mantiene pendiente DOUE si falta determinar el régimen armonizado en abierto", () => {
    const decision = new PublicidadEngine().ejecutar(context(TipoProcedimiento.ABIERTO));

    expect(decision.resultado).toBeUndefined();
    expect(decision.confianza).toBe(0);
    expect(decision.explicacion).toMatch(/regulación armonizada/i);
  });

  it("prioriza perfil más DOUE cuando consta régimen armonizado", () => {
    const input = context(TipoProcedimiento.ABIERTO);
    input.regulacionArmonizada = true;
    const decision = new PublicidadEngine().ejecutar(input);

    expect(decision.resultado).toBe(TipoPublicidad.PERFIL_CONTRATANTE_DOUE);
    expect(decision.reglasAplicadas).toContain("PUB-2026-HARMONIZED");
  });

  it("usa perfil cuando consta expresamente que no existe regulación armonizada", () => {
    const input = context(TipoProcedimiento.ABIERTO);
    input.regulacionArmonizada = false;
    const decision = new PublicidadEngine().ejecutar(input);

    expect(decision.resultado).toBe(TipoPublicidad.PERFIL_CONTRATANTE);
    expect(decision.reglasAplicadas).toContain("PUB-2026-NON-HARMONIZED");
  });
});
