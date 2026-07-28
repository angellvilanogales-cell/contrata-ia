/**
 * ============================================================
 * CONTRATA IA
 * ProcedimientoEngine
 * ============================================================
 *
 * Determina el procedimiento de adjudicación conforme
 * a la información disponible del expediente.
 *
 * En esta primera versión únicamente clasifica
 * el procedimiento. En las siguientes incorporaremos:
 *
 * - publicidad
 * - plazos
 * - tramitación
 * - regulación armonizada
 * - urgencia
 * - emergencia
 *
 * ============================================================
 */

export enum TipoContrato {

    OBRAS = "OBRAS",

    SERVICIOS = "SERVICIOS",

    SUMINISTROS = "SUMINISTROS"

}

export enum ProcedimientoContratacion {

    MENOR = "MENOR",

    ABIERTO = "ABIERTO",

    ABIERTO_SIMPLIFICADO = "ABIERTO_SIMPLIFICADO",

    ABIERTO_SUPERSIMPLIFICADO = "ABIERTO_SUPERSIMPLIFICADO"

}

export interface DatosProcedimiento {

    tipoContrato: TipoContrato;

    valorEstimado: number;

}

export class ProcedimientoEngine {

    /**
     * Determina el procedimiento.
     */
    public determinarProcedimiento(

        datos: DatosProcedimiento

    ): ProcedimientoContratacion {

        switch (datos.tipoContrato) {

            case TipoContrato.OBRAS:

                if (datos.valorEstimado < 40000) {

                    return ProcedimientoContratacion.MENOR;

                }

                if (datos.valorEstimado <= 80000) {

                    return ProcedimientoContratacion.ABIERTO_SUPERSIMPLIFICADO;

                }

                if (datos.valorEstimado <= 2000000) {

                    return ProcedimientoContratacion.ABIERTO_SIMPLIFICADO;

                }

                return ProcedimientoContratacion.ABIERTO;

            case TipoContrato.SERVICIOS:

            case TipoContrato.SUMINISTROS:

                if (datos.valorEstimado < 15000) {

                    return ProcedimientoContratacion.MENOR;

                }

                if (datos.valorEstimado <= 60000) {

                    return ProcedimientoContratacion.ABIERTO_SUPERSIMPLIFICADO;

                }

                if (datos.valorEstimado <= 100000) {

                    return ProcedimientoContratacion.ABIERTO_SIMPLIFICADO;

                }

                return ProcedimientoContratacion.ABIERTO;

        }

    }

}
