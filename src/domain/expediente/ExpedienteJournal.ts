/**
 * ============================================================
 * CONTRATA IA
 * ExpedienteJournal
 * ============================================================
 *
 * Diario oficial del expediente.
 *
 * Registra todas las actuaciones realizadas
 * durante la construcción del expediente.
 *
 * Este componente constituye la base de la
 * trazabilidad completa del sistema.
 *
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

    /**
     * Añade un evento.
     */
    public registrar(

        tipo: TipoEvento,

        origen: string,

        titulo: string,

        descripcion: string,

        normativa: string[] = []

    ): void {

        this.eventos.push({

            fecha: new Date(),

            tipo,

            origen,

            titulo,

            descripcion,

            normativa

        });

    }

    /**
     * Devuelve todos los eventos.
     */
    public obtenerEventos(): EventoExpediente[] {

        return [...this.eventos];

    }

    /**
     * Filtra por tipo.
     */
    public obtenerPorTipo(

        tipo: TipoEvento

    ): EventoExpediente[] {

        return this.eventos.filter(

            e => e.tipo === tipo

        );

    }

    /**
     * Número total.
     */
    public totalEventos(): number {

        return this.eventos.length;

    }

    /**
     * Vacía el diario.
     */
    public limpiar(): void {

        this.eventos = [];

    }

    /**
     * Exportación sencilla para auditoría.
     */
    public exportarTexto(): string {

        return this.eventos.map(

            e =>

                `[${e.fecha.toISOString()}] ` +

                `[${e.tipo}] ` +

                `[${e.origen}] ` +

                `${e.titulo}\n` +

                `${e.descripcion}` +

                (e.normativa.length > 0

                    ? `\nNormativa: ${e.normativa.join(", ")}`

                    : "")

        ).join("\n\n");

    }

}
