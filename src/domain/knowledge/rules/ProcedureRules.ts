/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ProcedureRules
 * ------------------------------------------------------------
 * Registro central de las reglas de determinación del
 * procedimiento de contratación.
 *
 * IMPORTANTE
 *
 * Este archivo NO implementa todavía la lógica jurídica.
 *
 * Su finalidad es registrar todas las reglas que el
 * RuleEngine ejecutará en futuras versiones.
 *
 * Las condiciones y acciones se implementarán utilizando
 * exclusivamente la normativa y la documentación del proyecto.
 * ============================================================
 */

import {
    RuleDefinition,
    RulePriority
} from "../RuleEngine";

/**
 * Registro de reglas del procedimiento.
 */
export const ProcedureRules: RuleDefinition[] = [

    /**
     * --------------------------------------------------------
     * PROC-0001
     * Contrato menor
     * --------------------------------------------------------
     */
    {

        id: "PROC-0001",

        name: "Contrato menor",

        priority: RulePriority.CRITICAL,

        when: () => {

            /**
             * TODO
             * Implementar condición.
             */
            return false;

        },

        then: (_context, decision) => {

            /**
             * TODO
             * Implementar acción.
             */

            decision.observations.push(
                "PROC-0001 not implemented."
            );

        },

        stopProcessing: true

    },

    /**
     * --------------------------------------------------------
     * PROC-0002
     * Procedimiento abierto
     * --------------------------------------------------------
     */
    {

        id: "PROC-0002",

        name: "Procedimiento abierto",

        priority: RulePriority.HIGH,

        when: () => {

            return false;

        },

        then: (_context, decision) => {

            decision.observations.push(
                "PROC-0002 not implemented."
            );

        }

    },

    /**
     * --------------------------------------------------------
     * PROC-0003
     * Procedimiento abierto simplificado
     * --------------------------------------------------------
     */
    {

        id: "PROC-0003",

        name: "Procedimiento abierto simplificado",

        priority: RulePriority.HIGH,

        when: () => {

            return false;

        },

        then: (_context, decision) => {

            decision.observations.push(
                "PROC-0003 not implemented."
            );

        }

    }

];
