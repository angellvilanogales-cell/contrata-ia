import { describe, expect, it } from "vitest";
import { CPVEntry } from "../src/domain/cpv/CPVEntry";
import { CPVMatcher } from "../src/domain/cpv/CPVMatcher";
import { KnowledgeManager } from "../src/domain/conocimiento/KnowledgeManager";
import { KnowledgeRepository } from "../src/domain/conocimiento/KnowledgeRepository";
import { ExpedienteContext } from "../src/domain/expediente/ExpedienteContext";
import { CPVEngine } from "../src/engines/CPVEngine";

function entry(code: string, description: string, keywords: string[] = [], active = true): CPVEntry {
  const value = new CPVEntry();
  value.codigo = code;
  value.descripcion = description;
  value.palabrasClave = keywords;
  value.activo = active;
  return value;
}

describe("LB88 - CPVEngine saneado", () => {
  it("no produce falsos positivos por subcadenas dentro de palabras", () => {
    const matcher = new CPVMatcher();
    const cpv = entry("00000000-0", "Bar", ["bar"]);
    expect(matcher.buscar("servicio para embarcaciones", [cpv])).toEqual([]);
  });

  it("ignora entradas CPV inactivas", () => {
    const matcher = new CPVMatcher();
    const cpv = entry("11111111-1", "Servicios de limpieza", ["limpieza"], false);
    expect(matcher.buscar("servicio de limpieza", [cpv])).toEqual([]);
  });

  it("limita la puntuación a 100 y ordena empates de forma determinista", () => {
    const matcher = new CPVMatcher();
    const b = entry("99999999-9", "Limpieza", ["limpieza", "oficinas", "servicio"]);
    const a = entry("10000000-0", "Limpieza", ["limpieza", "oficinas", "servicio"]);
    const matches = matcher.buscar("servicio limpieza oficinas", [b, a]);
    expect(matches[0].puntuacion).toBeLessThanOrEqual(100);
    expect(matches.map(match => match.cpv.codigo)).toEqual(["10000000-0", "99999999-9"]);
  });

  it("no inventa CPV si el objeto está vacío", () => {
    const repository = new KnowledgeRepository();
    repository.registrarCPV(entry("90910000-9", "Servicios de limpieza", ["limpieza"]));
    const decision = new CPVEngine(new KnowledgeManager(repository)).ejecutar(new ExpedienteContext());
    expect(decision.resultado).toEqual([]);
    expect(decision.confianza).toBe(0);
  });

  it("describe la salida como propuesta léxica y exige validación humana posterior", () => {
    const repository = new KnowledgeRepository();
    repository.registrarCPV(entry("90910000-9", "Servicios de limpieza", ["limpieza", "oficinas"]));
    const context = new ExpedienteContext();
    context.objeto = "Servicio de limpieza de oficinas";
    const decision = new CPVEngine(new KnowledgeManager(repository)).ejecutar(context);
    expect(decision.resultado[0]?.codigo).toBe("90910000-9");
    expect(decision.explicacion).toMatch(/léxica determinista/i);
    expect(decision.observaciones.join(" ")).toMatch(/validarse humanamente/i);
    expect(decision.reglasAplicadas).toContain("CPV-LEXICAL-LOCAL-001");
  });
});
