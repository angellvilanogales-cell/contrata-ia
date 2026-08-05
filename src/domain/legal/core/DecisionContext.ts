/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DecisionContext
 * ------------------------------------------------------------
 * Contexto único utilizado por el Motor Jurídico.
 *
 * Toda decisión jurídica se calculará utilizando este objeto.
 *
 * Ningún componente del Motor Jurídico recibirá parámetros
 * independientes.
 *
 * ============================================================
 */

export interface DecisionContext {

    /**
     * =====================================================
     * Identificación del expediente.
     * =====================================================
     */

    expediente: ExpedienteContext;

    /**
     * =====================================================
     * Datos del contrato.
     * =====================================================
     */

    contrato: ContratoContext;

    /**
     * =====================================================
     * Información económica.
     * =====================================================
     */

    importe: ImporteContext;

    /**
     * =====================================================
     * Datos administrativos.
     * =====================================================
     */

    administracion: AdministracionContext;

    /**
     * =====================================================
     * Parámetros opcionales.
     * =====================================================
     */

    opciones?: DecisionOptions;

}

/* ========================================================= */

export interface ExpedienteContext {

    id: string;

    objeto: string;

    descripcion: string;

}

/* ========================================================= */

export interface ContratoContext {

    tipoContrato?: string;

    naturaleza?: string;

    divisionLotes?: boolean;

    duracionMeses?: number;

}

/* ========================================================= */

export interface ImporteContext {

    presupuestoBaseLicitacion: number;

    valorEstimado: number;

    ivaIncluido: boolean;

}

/* ========================================================= */

export interface AdministracionContext {

    organoContratacion: string;

    unidadPromotora: string;

    comunidadAutonoma?: string;

}

/* ========================================================= */

export interface DecisionOptions {

    tramitacionUrgente?: boolean;

    financiacionEuropea?: boolean;

    regulacionArmonizada?: boolean;

    contratoReservado?: boolean;

    compraInnovacion?: boolean;

}
