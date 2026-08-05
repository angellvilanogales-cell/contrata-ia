/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * LegalReasonerDecision
 * ============================================================
 */

export interface LegalReasonerDecision {

    /**
     * Resumen ejecutivo.
     */
    summary: string;

    /**
     * Conclusión jurídica.
     */
    conclusion: string;

    /**
     * Reglas aplicadas.
     */
    appliedRules: string[];

    /**
     * Artículos utilizados.
     */
    legalReferences: string[];

    /**
     * Advertencias.
     */
    warnings: string[];

    /**
     * Riesgos detectados.
     */
    risks: string[];

    /**
     * Nivel de confianza.
     */
    confidence: number;

}
