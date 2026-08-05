/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * CPVContext
 * ============================================================
 */

export interface CPVContext {

    /**
     * Objeto del contrato.
     */
    objetoContrato: string;

    /**
     * Descripción funcional.
     */
    descripcion: string;

    /**
     * Tipo de contrato.
     */
    tipoContrato: string;

    /**
     * Valor estimado.
     */
    valorEstimado: number;

    /**
     * Administración contratante.
     */
    administracion: string;

    /**
     * Comunidad Autónoma.
     */
    comunidadAutonoma?: string;

    /**
     * ¿Existe división en lotes?
     */
    divisionLotes: boolean;

    /**
     * Número previsto de lotes.
     */
    numeroLotes?: number;

}
