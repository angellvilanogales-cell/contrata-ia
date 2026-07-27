/**
 * CONTRATA IA
 * ---------------------------------------------------------
 * Informe de insuficiencia de medios.
 *
 * Documento generado automáticamente cuando resulte
 * necesario justificar la insuficiencia de medios propios.
 * ---------------------------------------------------------
 */

export class InformeInsuficienciaMedios {

    constructor(

        public readonly contenido: string,

        public readonly fechaGeneracion: Date = new Date()

    ) {

        if (!contenido.trim()) {
            throw new Error("Debe existir un contenido para el informe.");
        }

    }

}
