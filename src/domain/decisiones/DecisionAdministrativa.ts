/**
 * CONTRATA IA
 * Entidad de dominio que representa una decisión
 * administrativa motivada.
 */

import { EstadoDecision } from "./EstadoDecision";

export class DecisionAdministrativa {

    constructor(

        public readonly id: string,

        public readonly titulo: string,

        public readonly motivacion: string,

        public estado: EstadoDecision = EstadoDecision.PROPUESTA,

        public readonly fechaCreacion: Date = new Date()

    ) {

        if (!id.trim()) {
            throw new Error("El identificador de la decisión es obligatorio.");
        }

        if (!titulo.trim()) {
            throw new Error("El título de la decisión es obligatorio.");
        }

        if (!motivacion.trim()) {
            throw new Error("La motivación jurídica es obligatoria.");
        }

    }

    validar(): void {

        this.estado = EstadoDecision.VALIDADA;

    }

    rechazar(): void {

        this.estado = EstadoDecision.RECHAZADA;

    }

    anular(): void {

        this.estado = EstadoDecision.ANULADA;

    }

}
