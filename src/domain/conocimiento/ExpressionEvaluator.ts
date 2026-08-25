export class ExpressionEvaluator {
  public evaluar(expresion: string, contexto: Record<string, unknown>): boolean {
    const e = expresion.trim();
    if (e === "true") return true;
    if (e === "false") return false;
    return (
      this.evaluarMayorIgual(e, contexto)
      ?? this.evaluarMayor(e, contexto)
      ?? this.evaluarMenorIgual(e, contexto)
      ?? this.evaluarMenor(e, contexto)
      ?? this.evaluarIgual(e, contexto)
      ?? this.evaluarDistinto(e, contexto)
      ?? false
    );
  }

  private partes(e: string, operador: string): [string, string] | null {
    const index = e.indexOf(operador);
    if (index < 0) return null;
    const izq = e.slice(0, index).trim();
    const der = e.slice(index + operador.length).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(izq) || !der) return null;
    return [izq, der];
  }

  private numero(c: Record<string, unknown>, key: string, raw: string): [number, number] | null {
    if (!Object.prototype.hasOwnProperty.call(c, key)) return null;
    const left = c[key];
    if (typeof left !== "number" || !Number.isFinite(left)) return null;
    const right = Number(raw);
    return Number.isFinite(right) ? [left, right] : null;
  }

  private evaluarMayor(e: string, c: Record<string, unknown>): boolean | null {
    if (!e.includes(">") || e.includes(">=")) return null;
    const partes = this.partes(e, ">");
    if (!partes) return null;
    const valores = this.numero(c, partes[0], partes[1]);
    return valores ? valores[0] > valores[1] : false;
  }

  private evaluarMayorIgual(e: string, c: Record<string, unknown>): boolean | null {
    const partes = this.partes(e, ">=");
    if (!partes) return null;
    const valores = this.numero(c, partes[0], partes[1]);
    return valores ? valores[0] >= valores[1] : false;
  }

  private evaluarMenor(e: string, c: Record<string, unknown>): boolean | null {
    if (!e.includes("<") || e.includes("<=")) return null;
    const partes = this.partes(e, "<");
    if (!partes) return null;
    const valores = this.numero(c, partes[0], partes[1]);
    return valores ? valores[0] < valores[1] : false;
  }

  private evaluarMenorIgual(e: string, c: Record<string, unknown>): boolean | null {
    const partes = this.partes(e, "<=");
    if (!partes) return null;
    const valores = this.numero(c, partes[0], partes[1]);
    return valores ? valores[0] <= valores[1] : false;
  }

  private literal(raw: string): string {
    const value = raw.trim();
    if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
      return value.slice(1, -1);
    }
    return value;
  }

  private evaluarIgual(e: string, c: Record<string, unknown>): boolean | null {
    const partes = this.partes(e, "==");
    if (!partes) return null;
    if (!Object.prototype.hasOwnProperty.call(c, partes[0])) return false;
    return String(c[partes[0]]) === this.literal(partes[1]);
  }

  private evaluarDistinto(e: string, c: Record<string, unknown>): boolean | null {
    const partes = this.partes(e, "!=");
    if (!partes) return null;
    if (!Object.prototype.hasOwnProperty.call(c, partes[0])) return false;
    return String(c[partes[0]]) !== this.literal(partes[1]);
  }
}
