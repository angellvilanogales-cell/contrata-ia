/**
 * ============================================================
 * CONTRATA IA
 * ExpedienteJournal
 * ============================================================
 */

export enum TipoEvento {
    INFORMACION = "INFORMACION",
    VALIDACION = "VALIDACION",
    MOTOR = "MOTOR",
    DOCUMENTO = "DOCUMENTO",
    ERROR = "ERROR",
    ADVERTENCIA = "ADVERTENCIA",
    DECISION = "DECISION"
}

export interface EventoExpediente {
    fecha: Date;
    tipo: TipoEvento;
    origen: string;
    titulo: string;
    descripcion: string;
    normativa?: string[];
}

export class ExpedienteJournal {
    private eventos: EventoExpediente[] = [];

    public registrar(
        tipo: TipoEvento,
        origen: string,
        titulo: string,
        descripcion: string,
        normativa: string[] = []
    ): void {
        this.eventos.push({ fecha: new Date(), tipo, origen, titulo, descripcion, normativa });
    }

    public obtenerEventos(): EventoExpediente[] { return [...this.eventos]; }
    public obtenerPorTipo(tipo: TipoEvento): EventoExpediente[] { return this.eventos.filter(e => e.tipo === tipo); }
    public totalEventos(): number { return this.eventos.length; }
    public limpiar(): void { this.eventos = []; }

    public exportarTexto(): string {
        return this.eventos.map(e => {
            const normativa = e.normativa ?? [];
            return `[${e.fecha.toISOString()}] [${e.tipo}] [${e.origen}] ${e.titulo}\n${e.descripcion}` +
                (normativa.length > 0 ? `\nNormativa: ${normativa.join(", ")}` : "");
        }).join("\n\n");
    }
}
