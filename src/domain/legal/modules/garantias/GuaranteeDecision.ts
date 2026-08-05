/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * GuaranteeDecision
 * ------------------------------------------------------------
 * Resultado del Motor Jurídico de Garantías.
 * ============================================================
 */

export interface GuaranteeDecision {

    /**
     * ¿Existe garantía provisional?
     */
    requiereGarantiaProvisional: boolean;

    /**
     * ¿Existe garantía definitiva?
     */
    requiereGarantiaDefinitiva: boolean;

    /**
     * ¿Existe garantía complementaria?
     */
    requiereGarantiaComplementaria: boolean;

    /**
     * Porcentaje garantía provisional.
     */
    porcentajeProvisional: number;

    /**
     * Porcentaje garantía definitiva.
     */
    porcentajeDefinitiva: number;

    /**
     * Porcentaje garantía complementaria.
     */
    porcentajeComplementaria: number;

    /**
     * ¿Existe exención?
     */
    exencion: boolean;

    /**
     * Justificación jurídica.
     */
    justificacion: string;

    /**
     * Norma aplicada.
     */
    normativa: string;

    /**
     * Artículo aplicado.
     */
    articulo: string;

    /**
     * Confianza.
     */
    confidence: number;

}
