/**
 * ============================================================
 * CONTRATA IA
 * KnowledgeFact
 * ============================================================
 *
 * Hecho conocido del expediente.
 *
 * Los motores nunca razonan directamente sobre el expediente.
 *
 * Transforman el expediente en hechos.
 *
 * ============================================================
 */

export interface KnowledgeFact {

    nombre: string;

    valor: unknown;

}
