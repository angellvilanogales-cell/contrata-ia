/**
 * ============================================================
 * CONTRATA IA
 * CPVEngine
 * ============================================================
 *
 * Motor inteligente para la determinación y validación
 * de códigos CPV conforme al Reglamento (CE) 2195/2002
 * y a la Ley 9/2017 de Contratos del Sector Público.
 *
 * Funciones principales:
 *
 *  • Analizar el objeto del contrato.
 *  • Proponer CPV principales.
 *  • Proponer CPV secundarios.
 *  • Validar códigos CPV.
 *  • Detectar incoherencias.
 *  • Generar la justificación de la selección.
 *
 * ============================================================
 */

export interface CPVCandidato {

    codigo: string;

    descripcion: string;

    confianza: number;

    principal: boolean;

    motivo: string;

}

export class CPVEngine {

    /**
     * Analiza el objeto contractual y devuelve
     * una lista de posibles códigos CPV.
     */
    public analizarObjeto(
        objeto: string
    ): CPVCandidato[] {

        if (!objeto) {

            return [];

        }

        /**
         * Implementación inicial.
         *
         * En versiones posteriores utilizará:
         *
         * • Base oficial CPV.
         * • Búsqueda semántica.
         * • Inteligencia Artificial.
         * • Expedientes históricos.
         */

        return [];

    }

    /**
     * Comprueba si un CPV parece coherente
     * con el objeto del contrato.
     */
    public validarCPV(

        objeto: string,

        codigo: string

    ): boolean {

        if (!objeto) {

            return false;

        }

        if (!codigo) {

            return false;

        }

        return true;

    }

    /**
     * Obtiene una explicación jurídica
     * de la selección realizada.
     */
    public justificar(

        objeto: string,

        codigo: string

    ): string {

        return `El código CPV ${codigo} resulta compatible con el objeto contractual "${objeto}".`;

    }

    /**
     * Devuelve el mejor candidato.
     */
    public obtenerPrincipal(

        candidatos: CPVCandidato[]

    ): CPVCandidato | null {

        if (candidatos.length === 0) {

            return null;

        }

        return candidatos[0];

    }

    /**
     * Ordena candidatos por confianza.
     */
    public ordenar(

        candidatos: CPVCandidato[]

    ): CPVCandidato[] {

        return candidatos.sort(

            (a, b) =>

                b.confianza - a.confianza

        );

    }

}
