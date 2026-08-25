import { describe, expect, it } from "vitest";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { RuleLoader } from "../src/domain/conocimiento/RuleLoader";
import { RuleEngine } from "../src/domain/conocimiento/RuleEngine";
import { InferenceEngine } from "../src/domain/conocimiento/InferenceEngine";
import { ExpressionEvaluator } from "../src/domain/conocimiento/ExpressionEvaluator";
import { DocumentEngine } from "../src/engines/DocumentEngine";

function tempRules(value: unknown): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "contrata-ia-rules-"));
  const file = path.join(dir, "rules.json");
  fs.writeFileSync(file, JSON.stringify(value), "utf8");
  return file;
}

describe("LB89 - consolidación de RuleEngine", () => {
  it("rechaza ids de reglas duplicados", () => {
    const file = tempRules({ reglas: [
      { id: "R-1", nombre: "Uno", tipo: "DECISION", prioridad: 1, condicion: "true", mensaje: "", articulo: "1" },
      { id: "R-1", nombre: "Dos", tipo: "DECISION", prioridad: 2, condicion: "true", mensaje: "", articulo: "2" },
    ] });
    expect(() => new RuleLoader().cargar(file)).toThrow(/duplicada/i);
  });

  it("rechaza un fichero que no declare array de reglas", () => {
    const file = tempRules({ modulo: "VACIO" });
    expect(() => new RuleLoader().cargar(file)).toThrow(/array 'reglas'/i);
  });

  it("no permite que una colección devuelta modifique el banco interno", () => {
    const file = tempRules({ reglas: [
      { id: "R-1", nombre: "Uno", tipo: "DECISION", prioridad: 1, condicion: "true", mensaje: "", articulo: "1", resultado: "A" },
    ] });
    const engine = new RuleEngine();
    engine.cargarReglas(file);
    const external = engine.obtenerReglas() as Array<{ id: string }>;
    external[0].id = "ALTERADA";
    expect(engine.obtenerRegla("R-1")?.id).toBe("R-1");
  });

  it("selecciona explícitamente la primera regla DECISION cumplida por prioridad", () => {
    const file = tempRules({ reglas: [
      { id: "R-2", nombre: "Dos", tipo: "DECISION", prioridad: 20, condicion: "importe >= 10", mensaje: "", articulo: "2", resultado: "B" },
      { id: "R-1", nombre: "Uno", tipo: "DECISION", prioridad: 10, condicion: "importe >= 5", mensaje: "", articulo: "1", resultado: "A" },
    ] });
    const rules = new RuleEngine();
    rules.cargarReglas(file);
    const match = new InferenceEngine(rules).primeraReglaCumplida({ importe: 12 }, "DECISION");
    expect(match?.regla.id).toBe("R-1");
  });

  it("no convierte un campo ausente en una comparación verdadera", () => {
    const evaluator = new ExpressionEvaluator();
    expect(evaluator.evaluar("missing != 'x'", {})).toBe(false);
    expect(evaluator.evaluar("missing == 'undefined'", {})).toBe(false);
  });
});

describe("LB90 - capa documental heredada saneada", () => {
  it("solo exige informe de insuficiencia de medios cuando consta contrato de servicios", () => {
    const engine = new DocumentEngine();
    const supply = engine.obtenerDocumentos({ contractType: "SUPPLY" });
    const service = engine.obtenerDocumentos({ contractType: "SERVICE" });
    expect(supply.find(item => item.nombre.includes("Insuficiencia"))?.obligatorio).toBe(false);
    expect(service.find(item => item.nombre.includes("Insuficiencia"))?.obligatorio).toBe(true);
  });

  it("marcar generado no muta el objeto documental original", () => {
    const engine = new DocumentEngine();
    const original = engine.obtenerDocumentos({ contractType: "SUPPLY" })[0];
    const updated = engine.marcarGenerado(original);
    expect(original.generado).toBe(false);
    expect(updated.generado).toBe(true);
  });

  it("no confunde cobertura documental con validación jurídica adicional", () => {
    const engine = new DocumentEngine();
    const documents = engine.obtenerDocumentos({ contractType: "SUPPLY" }).map(item => item.obligatorio ? engine.marcarGenerado(item) : item);
    expect(engine.expedienteCompleto(documents)).toBe(true);
    expect(documents.every(item => item.fundamento)).toBe(true);
  });
});
