import { CPVEntry } from "./CPVEntry";

export interface CPVMatch {
  cpv: CPVEntry;
  puntuacion: number;
}

/**
 * Búsqueda CPV determinista y local. No usa embeddings ni servicios externos.
 * La puntuación expresa coincidencia léxica, no certeza jurídica.
 */
export class CPVMatcher {
  public buscar(descripcion: string, cpvDisponibles: CPVEntry[], limite = 10): CPVMatch[] {
    const texto = this.normalizar(descripcion);
    if (!texto || limite <= 0) return [];

    return cpvDisponibles
      .filter(cpv => cpv.activo !== false && cpv.codigo.trim().length > 0)
      .map(cpv => ({ cpv, puntuacion: this.calcularPuntuacion(texto, cpv) }))
      .filter(match => match.puntuacion > 0)
      .sort((a, b) => b.puntuacion - a.puntuacion || a.cpv.codigo.localeCompare(b.cpv.codigo))
      .slice(0, limite);
  }

  private calcularPuntuacion(texto: string, cpv: CPVEntry): number {
    const tokens = new Set(this.tokenizar(texto));
    let puntos = 0;
    const descripcion = this.normalizar(cpv.descripcion);

    if (descripcion && this.contieneExpresion(texto, descripcion)) puntos += 60;

    for (const palabra of cpv.palabrasClave) {
      const normalizada = this.normalizar(palabra);
      if (normalizada && this.coincide(texto, tokens, normalizada)) puntos += 15;
    }

    for (const sinonimo of cpv.sinonimos) {
      const normalizado = this.normalizar(sinonimo);
      if (normalizado && this.coincide(texto, tokens, normalizado)) puntos += 10;
    }

    return Math.min(100, puntos);
  }

  private coincide(texto: string, tokens: Set<string>, termino: string): boolean {
    return termino.includes(" ") ? this.contieneExpresion(texto, termino) : tokens.has(termino);
  }

  private contieneExpresion(texto: string, expresion: string): boolean {
    return (` ${texto} `).includes(` ${expresion} `);
  }

  private tokenizar(texto: string): string[] {
    return texto.split(/[^a-z0-9]+/).filter(Boolean);
  }

  private normalizar(texto: string): string {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
}
