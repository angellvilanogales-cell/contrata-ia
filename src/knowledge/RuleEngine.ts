/**
 * ============================================================
 * CONTRATA IA
 * RuleEngine
 * ============================================================
 *
 * Motor de reglas jurídicas.
 *
 * Este componente aplica las reglas derivadas de la LCSP
 * sobre los hechos conocidos del expediente.
 *
 * No contiene la normativa.
 *
 * Ejecuta la normativa.
 * ============================================================
 */

import { KnowledgeFact } from "./KnowledgeFact";
import { KnowledgeRule } from "./KnowledgeRule";

export interface RuleResult {

    regla: string;

    aplicada: boolean;

    motivo: string;

}

export class RuleEngine {

    /**
     * Ejecuta todas las reglas disponibles.
     */
    public ejecutar(

        hechos: KnowledgeFact[],

        reglas: KnowledgeRule[]

    ): RuleResult[] {

        const resultados: RuleResult[] = [];

        reglas.forEach(regla => {

            resultados.push(

                this.evaluarRegla(
                    hechos,
                    regla
                )

            );

        });

        return resultados;

    }

    /**
     * Evalúa una regla concreta.
     */
    private evaluarRegla(

        hechos: KnowledgeFact[],

        regla: KnowledgeRule

    ): RuleResult {

        /**
         * Implementación futura.
         *
         * Aquí se comprobarán:
         *
         * • condiciones
         * • excepciones
         * • restricciones
         * • consecuencias
         */

        return {

            regla: regla.nombre,

            aplicada: false,

            motivo: "Pendiente de implementación."

        };

    }

}
