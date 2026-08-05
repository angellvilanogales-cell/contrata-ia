/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * SolvencyContext
 * ------------------------------------------------------------
 * Contexto utilizado por el Motor de Solvencia.
 *
 * ============================================================
 */

export interface SolvencyContext {

    /**
     * Tipo de contrato.
     */
    tipoContrato: string;

    /**
     * Procedimiento de adjudicación.
     */
    procedimiento: string;

    /**
     * Valor estimado.
     */
    valorEstimado: number;

    /**
     * Presupuesto base de licitación.
     */
    presupuestoBaseLicitacion: number;

    /**
     * ¿Contrato sujeto a regulación armonizada?
     */
    regulacionArmonizada: boolean;

    /**
     * ¿Contrato menor?
     */
    contratoMenor: boolean;

    /**
     * Duración prevista.
     */
    duracionMeses: number;

    /**
     * Código CPV principal.
     */
    cpvPrincipal?: string;

    /**
     * ¿Existe división en lotes?
     */
    divisionLotes: boolean;

    /**
     * Número de lotes.
     */
    numeroLotes?: number;

    /**
     * Administración contratante.
     */
    administracion: string;

    /**
     * Comunidad Autónoma.
     */
    comunidadAutonoma?: string;

}
