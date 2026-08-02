/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * CPVCatalog
 * ------------------------------------------------------------
 * Catálogo responsable de determinar los códigos CPV
 * recomendados para un expediente de contratación.
 *
 * IMPORTANTE:
 *
 * Esta primera versión NO implementa todavía el algoritmo
 * de búsqueda ni las reglas de clasificación.
 *
 * Toda la inteligencia se incorporará posteriormente a partir
 * del banco de conocimiento del proyecto.
 * ============================================================
 */

import { DecisionContext } from "../DecisionContext";

/**
 * Código CPV recomendado.
 */
export interface CPVRecommendation {

    /**
     * Código CPV.
     */
    code: string;

    /**
     * Descripción oficial.
     */
    description: string;

    /**
     * Nivel de confianza (0-100).
     */
    confidence: number;

}

/**
 * Resultado de la consulta del catálogo.
 */
export interface CPVResult {

    /**
     * Indica si la resolución fue satisfactoria.
     */
    success: boolean;

    /**
     * Código principal recomendado.
     */
    primary?: CPVRecommendation;

    /**
     * Códigos complementarios.
     */
    secondary: CPVRecommendation[];

    /**
     * Justificación de la recomendación.
     */
    justification?: string;

    /**
     * Observaciones.
     */
    observations: string[];

}

/**
 * Catálogo de conocimiento de códigos CPV.
 */
export class CPVCatalog {

    /**
     * Identificador interno.
     */
    public readonly id = "cpv-catalog";

    /**
     * Versión.
     */
    public readonly version = "0.1.0";

    /**
     * Descripción.
     */
    public readonly description =
        "Knowledge catalog responsible for CPV recommendations.";

    /**
     * Resuelve el CPV recomendado.
     *
     * En futuras versiones este método utilizará:
     *
     * - Banco CPV
     * - IA semántica
     * - Históricos
     * - Sinónimos
     * - Clasificación automática
     * - Reglas LCSP
     */
    public resolve(
        context: DecisionContext
    ): CPVResult {

        // -------------------------------------------------------
        // TODO
        //
        // Implementar:
        //
        // - búsqueda semántica
        // - coincidencia por objeto
        // - múltiples CPV
        // - puntuación
        // - justificación
        // - referencias normativas
        //
        // -------------------------------------------------------

        return {

            success: false,

            secondary: [],

            observations: [

                "CPV recommendation engine not implemented yet."

            ]

        };

    }

}
