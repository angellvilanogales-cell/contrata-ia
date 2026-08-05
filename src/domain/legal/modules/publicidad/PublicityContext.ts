/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * PublicityContext
 * ------------------------------------------------------------
 * Contexto utilizado exclusivamente por el
 * Motor de Publicidad.
 *
 * ============================================================
 */

export interface PublicityContext {

    /**
     * Tipo de contrato.
     */
    tipoContrato: string;

    /**
     * Valor estimado.
     */
    valorEstimado: number;

    /**
     * ¿Sujeto a regulación armonizada?
     */
    regulacionArmonizada: boolean;

    /**
     * Procedimiento seleccionado.
     */
    procedimiento: string;

    /**
     * Tramitación.
     */
    tramitacion: string;

    /**
     * Administración contratante.
     */
    administracion: string;

    /**
     * Comunidad Autónoma.
     */
    comunidadAutonoma?: string;

    /**
     * ¿Existe financiación europea?
     */
    financiacionEuropea: boolean;

    /**
     * ¿Contrato reservado?
     */
    contratoReservado: boolean;

    /**
     * ¿Contrato menor?
     */
    contratoMenor: boolean;

    /**
     * CPV principal.
     */
    cpvPrincipal?: string;

}
