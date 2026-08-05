/**
 * ============================================================
 * CONTRATA-IA
 * InferenceEngine
 * ============================================================
 *
 * Motor de inferencia jurídica.
 *
 * Será el encargado de:
 *
 * - detectar incoherencias
 * - propagar decisiones
 * - inferir consecuencias jurídicas
 * - activar motores secundarios
 *
 */

import { LegalReasonerContext } from "./LegalReasonerContext";

export class InferenceEngine {

    infer(

        context: LegalReasonerContext

    ): LegalReasonerContext {

        return {

            ...context

        };

    }

}
