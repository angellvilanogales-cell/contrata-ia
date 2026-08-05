/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ProcedureContext
 * ------------------------------------------------------------
 * Contexto específico utilizado exclusivamente por el
 * Motor de Procedimientos.
 *
 * Se construye a partir del DecisionContext del
 * Motor Jurídico.
 *
 * ============================================================
 */

export interface ProcedureContext {

    /**
     * Tipo de contrato.
     */
    tipoContrato: string;

    /**
     * Valor estimado.
     */
    valorEstimado: number;

    /**
     * Presupuesto base.
     */
    presupuestoBaseLicitacion: number;

    /**
     * Duración prevista.
     */
    duracionMeses: number;

    /**
     * ¿Existe división en lotes?
     */
    divisionLotes: boolean;

    /**
     * ¿Contrato sujeto a regulación armonizada?
     */
    regulacionArmonizada: boolean;

    /**
     * ¿Existe financiación europea?
     */
    financiacionEuropea: boolean;

    /**
     * ¿Tramitación urgente?
     */
    tramitacionUrgente: boolean;

    /**
     * ¿Emergencia?
     */
    emergencia: boolean;

    /**
     * ¿Contrato reservado?
     */
    contratoReservado: boolean;

    /**
     * Código CPV principal.
     */
    cpvPrincipal?: string;

    /**
     * Órgano de contratación.
     */
    organoContratacion: string;

    /**
     * Comunidad Autónoma.
     */
    comunidadAutonoma?: string;

}
