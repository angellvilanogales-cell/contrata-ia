/**
 * ============================================================
 * CONTRATA IA
 * DocumentEngine
 * ============================================================
 *
 * Motor responsable de determinar los documentos
 * que deben incorporarse al expediente.
 *
 * ============================================================
 */

export interface DocumentoGenerado {

    nombre: string;

    obligatorio: boolean;

    generado: boolean;

}

export class DocumentEngine {

    /**
     * Obtiene la documentación mínima.
     */
    public obtenerDocumentos(): DocumentoGenerado[] {

        return [

            {

                nombre: "Memoria Justificativa",

                obligatorio: true,

                generado: false

            },

            {

                nombre: "Informe de Insuficiencia de Medios",

                obligatorio: true,

                generado: false

            },

            {

                nombre: "PCAP",

                obligatorio: true,

                generado: false

            },

            {

                nombre: "PPT",

                obligatorio: true,

                generado: false

            }

        ];

    }

    /**
     * Marca un documento como generado.
     */
    public marcarGenerado(

        documento: DocumentoGenerado

    ): DocumentoGenerado {

        documento.generado = true;

        return documento;

    }

    /**
     * Comprueba si todos los documentos
     * obligatorios han sido generados.
     */
    public expedienteCompleto(

        documentos: DocumentoGenerado[]

    ): boolean {

        return documentos

            .filter(

                documento => documento.obligatorio

            )

            .every(

                documento => documento.generado

            );

    }

}
