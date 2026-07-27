/**
 * CONTRATA IA
 * ---------------------------------------------------------
 * Memoria justificativa del expediente.
 *
 * Documento principal generado automáticamente por el
 * sistema experto a partir de los hechos administrativos
 * y de las decisiones motivadas.
 * ---------------------------------------------------------
 */

export class MemoriaJustificativa {

    constructor(

        public readonly titulo: string,

        public readonly contenido: string,

        public readonly fechaGeneracion: Date = new Date()

    ) {

        if (!titulo.trim()) {
            throw new Error("Debe existir un título.");
        }

        if (!contenido.trim()) {
            throw new Error("El contenido de la memoria es obligatorio.");
        }

    }

}
