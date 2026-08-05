/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * GuaranteeContext
 * ============================================================
 */

export interface GuaranteeContext {

    tipoContrato: string;

    procedimiento: string;

    valorEstimado: number;

    presupuestoBaseLicitacion: number;

    regulacionArmonizada: boolean;

    contratoMenor: boolean;

    administracion: string;

    financiacionEuropea: boolean;

    acuerdoMarco: boolean;

    sistemaDinamico: boolean;

}
