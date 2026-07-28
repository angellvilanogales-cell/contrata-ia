/**
 * ============================================================
 * CONTRATA IA
 * ProcedimientoEngine
 * ============================================================
 *
 * Motor responsable de determinar el procedimiento
 * de adjudicación conforme a la LCSP.
 *
 * Este motor irá creciendo hasta convertirse en uno
 * de los componentes principales del sistema.
 *
 * ============================================================
 */

export interface ResultadoProcedimiento {

    procedimiento: string;

    justificacion: string;

    publicidad: string;

    requiereDOUE: boolean;

}

export class ProcedimientoEngine {

    /**
     * Determina el procedimiento aplicable.
     */
    public determinarProcedimiento(

        valorEstimado: number,

        tipoContrato: string

    ): ResultadoProcedimiento {

        return {

            procedimiento: "Pendiente",

            justificacion:
                "La lógica jurídica será incorporada progresivamente.",

            publicidad: "Pendiente",

            requiereDOUE: false

        };

    }

    /**
     * Comprueba si existe obligación
     * de publicidad europea.
     */
    public requiereDOUE(

        valorEstimado: number

    ): boolean {

        return false;

    }

    /**
     * Obtiene una explicación jurídica.
     */
    public justificar(

        procedimiento: string

    ): string {

        return `El procedimiento seleccionado es ${procedimiento}.`;

    }

}
