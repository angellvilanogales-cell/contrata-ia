/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DecisionResult
 * ------------------------------------------------------------
 * Resultado único producido por el Motor Jurídico.
 *
 * Ningún generador documental deberá volver a calcular
 * información jurídica.
 *
 * Toda la información será suministrada mediante
 * esta estructura.
 *
 * ============================================================
 */

export interface DecisionResult {

    expediente: ExpedienteDecision;

    contrato: ContratoDecision;

    cpv: CPVDecision;

    procedimiento: ProcedimientoDecision;

    publicidad: PublicidadDecision;

    plazos: PlazosDecision;

    solvencia: SolvenciaDecision;

    garantias: GarantiasDecision;

    criterios: CriteriosDecision;

    documentos: DocumentoDecision[];

    justificaciones: LegalJustification[];

    advertencias: LegalWarning[];

    trazabilidad: TraceRecord[];

}

/* ========================================================= */

export interface ExpedienteDecision {

    id: string;

    organoContratacion: string;

    unidadPromotora: string;

    fecha: Date;

}

/* ========================================================= */

export interface ContratoDecision {

    tipoContrato: string;

    objeto: string;

    valorEstimado: number;

    duracionMeses: number;

    divididoLotes: boolean;

}

/* ========================================================= */

export interface CPVDecision {

    principal: string;

    secundarios: string[];

    descripcion: string;

}

/* ========================================================= */

export interface ProcedimientoDecision {

    procedimiento: string;

    tramitacion: string;

    regulacionArmonizada: boolean;

}

/* ========================================================= */

export interface PublicidadDecision {

    perfilContratante: boolean;

    plataformaContratacion: boolean;

    doue: boolean;

    boe: boolean;

    boja: boolean;

}

/* ========================================================= */

export interface PlazosDecision {

    ofertasDias: number;

    adjudicacionDias: number;

    formalizacionDias: number;

    subsanacionDias: number;

}

/* ========================================================= */

export interface SolvenciaDecision {

    economica: boolean;

    tecnica: boolean;

    clasificacion: boolean;

}

/* ========================================================= */

export interface GarantiasDecision {

    provisional: boolean;

    definitiva: boolean;

    importeDefinitiva?: number;

}

/* ========================================================= */

export interface CriteriosDecision {

    precioPermitido: boolean;

    criteriosAutomaticos: boolean;

    juicioValor: boolean;

    calidadObligatoria: boolean;

}

/* ========================================================= */

export interface DocumentoDecision {

    id: string;

    nombre: string;

    obligatorio: boolean;

    generar: boolean;

}

/* ========================================================= */

export interface LegalJustification {

    regla: string;

    normativa: string;

    articulo: string;

    explicacion: string;

}

/* ========================================================= */

export interface LegalWarning {

    codigo: string;

    mensaje: string;

    gravedad: "INFO" | "WARNING" | "ERROR";

}

/* ========================================================= */

export interface TraceRecord {

    fecha: Date;

    regla: string;

    resultado: string;

    versionConocimiento: string;

}
