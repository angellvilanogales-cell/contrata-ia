/**
 * ============================================================
 * CONTRATA IA
 * ExpressionEvaluator
 * ============================================================
 */

export class ExpressionEvaluator {
    public evaluar(expresion: string, contexto: Record<string, any>): boolean {
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
        if (!izq || !der) return null;
        return [izq, der];
    }

    private evaluarMayor(e: string, c: Record<string, any>): boolean | null {
        if (!e.includes(">") || e.includes(">=")) return null;
        const partes = this.partes(e, ">");
        return partes ? Number(c[partes[0]]) > Number(partes[1]) : null;
    }

    private evaluarMayorIgual(e: string, c: Record<string, any>): boolean | null {
        const partes = this.partes(e, ">=");
        return partes ? Number(c[partes[0]]) >= Number(partes[1]) : null;
    }

    private evaluarMenor(e: string, c: Record<string, any>): boolean | null {
        if (!e.includes("<") || e.includes("<=")) return null;
        const partes = this.partes(e, "<");
        return partes ? Number(c[partes[0]]) < Number(partes[1]) : null;
    }

    private evaluarMenorIgual(e: string, c: Record<string, any>): boolean | null {
        const partes = this.partes(e, "<=");
        return partes ? Number(c[partes[0]]) <= Number(partes[1]) : null;
    }

    private evaluarIgual(e: string, c: Record<string, any>): boolean | null {
        const partes = this.partes(e, "==");
        if (!partes) return null;
        const valor = partes[1].replace(/'/g, "").replace(/"/g, "");
        return String(c[partes[0]]) === valor;
    }

    private evaluarDistinto(e: string, c: Record<string, any>): boolean | null {
        const partes = this.partes(e, "!=");
        if (!partes) return null;
        const valor = partes[1].replace(/'/g, "").replace(/"/g, "");
        return String(c[partes[0]]) !== valor;
    }
}
