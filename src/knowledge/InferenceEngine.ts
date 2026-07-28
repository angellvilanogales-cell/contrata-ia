/**
 * ============================================================
 * CONTRATA IA
 * InferenceEngine
 * ============================================================
 *
 * Motor de inferencia.
 *
 * Su misión consiste en aplicar reglas jurídicas sobre los
 * hechos conocidos del expediente.
 *
 * Este componente será el núcleo del razonamiento jurídico.
 *
 * ============================================================
 */

import { KnowledgeFact } from "./KnowledgeFact";
import { KnowledgeRule } from "./KnowledgeRule";

export class InferenceEngine {

    public ejecutar(

        hechos: KnowledgeFact[],

        reglas: KnowledgeRule[]

    ): KnowledgeRule[] {

        /**
         * Implementación futura.
         *
         * Aquí se ejecutará el razonamiento.
         */

        return [];

    }

}
