/**
 * ============================================================
 * CONTRATA IA
 * ExpedienteBuilder
 * ============================================================
 *
 * Orquestador principal del expediente.
 *
 * Centraliza la construcción del expediente y coordina
 * los distintos motores especializados.
 *
 * ============================================================
 */

import { CPVEngine } from "../engines/CPVEngine";
import { ProcedimientoEngine } from "../engines/ProcedimientoEngine";

export interface SolicitudExpediente {

    objetoContrato: string;

    valorEstimado: number;

    tipoContrato: string;

}

export interface ResultadoExpediente {

    cpv: unknown;

    procedimiento: string;

}

export class ExpedienteBuilder {

    constructor(

        private readonly cpvEngine: CPVEngine,

        private readonly procedimientoEngine: ProcedimientoEngine

    ) {}

    /**
     * Punto de entrada principal.
     */
    public async construir(

        solicitud: SolicitudExpediente

    ): Promise<ResultadoExpediente> {

        return this.construirExpediente(
            solicitud
        );

    }

    /**
     * Orquesta la construcción completa
     * del expediente.
     */
    private async construirExpediente(

        solicitud: SolicitudExpediente

    ): Promise<ResultadoExpediente> {

        const cpv =
            await this.calcularCPV(
                solicitud
            );

        const procedimiento =
            await this.calcularProcedimiento(
                solicitud
            );

        /*
         * Próximos módulos
         *
         * await this.calcularPublicidad(...)
         * await this.calcularSolvencia(...)
         * await this.calcularDivisionLotes(...)
         * await this.generarMemoria(...)
         * await this.generarPCAP(...)
         * await this.generarPPT(...)
         */

        return {

            cpv,

            procedimiento

        };

    }

    /**
     * Determina el CPV.
     */
    private async calcularCPV(

        solicitud: SolicitudExpediente

    ) {

        return this.cpvEngine.analizarObjeto(

            solicitud.objetoContrato

        );

    }

    /**
     * Determina el procedimiento.
     */
    private async calcularProcedimiento(

        solicitud: SolicitudExpediente

    ): Promise<string> {

        return this.procedimientoEngine
            .determinarProcedimiento({

                tipoContrato:
                    solicitud.tipoContrato as any,

                valorEstimado:
                    solicitud.valorEstimado

            });

    }

}
