/**
 * CONTRATA IA
 * ---------------------------------------------------------
 * Agregado raíz del expediente administrativo.
 * ---------------------------------------------------------
 */

import { ExpedienteId } from "../value-objects/ExpedienteId";
import { NumeroExpediente } from "../value-objects/NumeroExpediente";
import { EstadoExpediente } from "../value-objects/EstadoExpediente";

export class Expediente {

    constructor(

        public readonly id: ExpedienteId,

        public readonly numero: NumeroExpediente,

        public estado: EstadoExpediente = EstadoExpediente.BORRADOR

    ) {}

    public iniciarEstudio(): void {

        this.estado = EstadoExpediente.EN_ESTUDIO;

    }

    public validar(): void {

        this.estado = EstadoExpediente.VALIDADO;

    }

    public finalizar(): void {

        this.estado = EstadoExpediente.FINALIZADO;

    }

}
