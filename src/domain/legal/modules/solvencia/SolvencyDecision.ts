/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * SolvencyDecision
 * ------------------------------------------------------------
 * Resultado jurídico del Motor de Solvencia.
 *
 * Determina automáticamente si procede exigir solvencia,
 * qué tipo de solvencia debe solicitarse y la justificación
 * jurídica correspondiente.
 *
 * ============================================================
 */

export interface SolvencyDecision {

    /**
     * ¿Debe exigirse solvencia?
     */
    requiereSolvencia: boolean;

    /**
     * Solvencia económica.
     */
    solvenciaEconomica: boolean;

    /**
     * Solvencia técnica.
     */
    solvenciaTecnica: boolean;

    /**
     * Clasificación empresarial obligatoria.
     */
    requiereClasificacion: boolean;

    /**
     * Medios de acreditación.
     */
    mediosAcreditacion: string[];

    /**
     * Justificación jurídica.
     */
    justificacion: string;

    /**
     * Normativa aplicada.
     */
    normativa: string;

    /**
     * Artículo LCSP aplicado.
     */
    articulo: string;

    /**
     * Nivel de confianza de la decisión.
     */
    confidence: number;

}
