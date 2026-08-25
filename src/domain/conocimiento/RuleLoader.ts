import * as fs from "fs";
import * as path from "path";

export interface RuleDefinition {
  id: string;
  nombre: string;
  tipo: string;
  prioridad: number;
  condicion: string;
  mensaje: string;
  articulo: string;
  /** Resultado declarativo opcional de las reglas de decisión. */
  resultado?: unknown;
}

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateRule(value: unknown, index: number): RuleDefinition {
  if (!value || typeof value !== "object") throw new Error(`Regla ${index}: formato inválido.`);
  const rule = value as Partial<RuleDefinition>;
  if (!nonEmpty(rule.id)) throw new Error(`Regla ${index}: id obligatorio.`);
  if (!nonEmpty(rule.nombre)) throw new Error(`Regla ${rule.id}: nombre obligatorio.`);
  if (!nonEmpty(rule.tipo)) throw new Error(`Regla ${rule.id}: tipo obligatorio.`);
  if (!Number.isFinite(rule.prioridad)) throw new Error(`Regla ${rule.id}: prioridad inválida.`);
  if (!nonEmpty(rule.condicion)) throw new Error(`Regla ${rule.id}: condición obligatoria.`);
  if (rule.mensaje !== undefined && typeof rule.mensaje !== "string") throw new Error(`Regla ${rule.id}: mensaje inválido.`);
  if (rule.articulo !== undefined && typeof rule.articulo !== "string") throw new Error(`Regla ${rule.id}: artículo inválido.`);
  return {
    id: rule.id.trim(),
    nombre: rule.nombre.trim(),
    tipo: rule.tipo.trim(),
    prioridad: Number(rule.prioridad),
    condicion: rule.condicion.trim(),
    mensaje: rule.mensaje ?? "",
    articulo: rule.articulo ?? "",
    ...(Object.prototype.hasOwnProperty.call(rule, "resultado") ? { resultado: rule.resultado } : {}),
  };
}

/**
 * Cargador estricto de reglas locales. Rechaza ficheros ambiguos o reglas
 * duplicadas antes de que lleguen al motor de inferencia.
 */
export class RuleLoader {
  public cargar(fichero: string): RuleDefinition[] {
    const ruta = path.resolve(fichero);
    if (!fs.existsSync(ruta)) throw new Error(`No existe el fichero de reglas: ${ruta}`);

    let parsed: unknown;
    try {
      parsed = JSON.parse(fs.readFileSync(ruta, "utf8"));
    } catch (error) {
      throw new Error(`No puede interpretarse el fichero de reglas ${ruta}: ${error instanceof Error ? error.message : String(error)}`);
    }

    if (!parsed || typeof parsed !== "object" || !Array.isArray((parsed as { reglas?: unknown }).reglas)) {
      throw new Error(`El fichero de reglas ${ruta} debe contener un array 'reglas'.`);
    }

    const rules = (parsed as { reglas: unknown[] }).reglas.map(validateRule);
    const ids = new Set<string>();
    for (const rule of rules) {
      if (ids.has(rule.id)) throw new Error(`Regla duplicada: ${rule.id}`);
      ids.add(rule.id);
    }
    return rules;
  }
}
