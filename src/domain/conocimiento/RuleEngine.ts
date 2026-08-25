import { RuleLoader, RuleDefinition } from "./RuleLoader";

/**
 * Registro local de reglas validadas. No interpreta ni decide; esa función
 * corresponde a InferenceEngine. Las colecciones devueltas son copias para
 * evitar mutaciones externas del banco cargado.
 */
export class RuleEngine {
  private readonly loader = new RuleLoader();
  private reglas: RuleDefinition[] = [];

  public cargarReglas(fichero: string): void {
    this.reglas = this.loader.cargar(fichero).map(rule => ({ ...rule }));
  }

  public obtenerReglas(): readonly RuleDefinition[] {
    return this.reglas.map(rule => ({ ...rule }));
  }

  public obtenerRegla(id: string): RuleDefinition | undefined {
    const rule = this.reglas.find(item => item.id === id);
    return rule ? { ...rule } : undefined;
  }

  public existeRegla(id: string): boolean {
    return this.reglas.some(rule => rule.id === id);
  }

  public obtenerReglasOrdenadas(): RuleDefinition[] {
    return this.reglas
      .map(rule => ({ ...rule }))
      .sort((a, b) => a.prioridad - b.prioridad || a.id.localeCompare(b.id));
  }

  public obtenerPorTipo(tipo: string): RuleDefinition[] {
    return this.reglas.filter(rule => rule.tipo === tipo).map(rule => ({ ...rule }));
  }

  public total(): number {
    return this.reglas.length;
  }

  public limpiar(): void {
    this.reglas = [];
  }
}
