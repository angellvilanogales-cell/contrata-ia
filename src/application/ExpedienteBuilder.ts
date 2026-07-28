/**
 * ============================================================
 * CONTRATA IA
 * ExpedienteBuilder
 * ============================================================
 *
 * Orquestador principal del expediente.
 *
 * No contiene lógica jurídica.
 *
 * Coordina todos los motores especializados.
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
     * Construye el expediente inicial.
     */
    public async construir(

        solicitud: SolicitudExpediente

    ): Promise<ResultadoExpediente> {

        const candidatosCPV =
            await this.cpvEngine.analizarObjeto(
                solicitud.objetoContrato
            );

        const procedimiento =
            await this.procedimientoEngine.determinarProcedimiento({

                tipoContrato: solicitud.tipoContrato as any,

                valorEstimado: solicitud.valorEstimado

            });

        return {

            cpv: candidatosCPV,

            procedimiento

        };

    }

}
