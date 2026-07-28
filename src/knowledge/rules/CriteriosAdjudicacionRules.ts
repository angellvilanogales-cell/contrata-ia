/**
 * ============================================================
 * CONTRATA IA
 * CriteriosAdjudicacionRules
 * ============================================================
 *
 * Reglas derivadas principalmente de los artículos
 * 145 a 148 de la LCSP.
 *
 * Criterios de adjudicación.
 * Relación calidad-precio.
 * Juicios de valor.
 * Criterios automáticos.
 *
 * ============================================================
 */

import { ActionType } from "../KnowledgeAction";
import { ComparisonOperator } from "../KnowledgeCondition";
import { LegalRule, RulePriority } from "../LegalRule";

export const CriteriosAdjudicacionRules: LegalRule[] = [

    {

        id: "R-145-001",

        nombre: "Existencia de criterios",

        articulo: "145",

        descripcion:
            "Todo procedimiento debe disponer de criterios de adjudicación.",

        prioridad: RulePriority.VERY_HIGH,

        activa: true,

        condiciones: [

            {

                fact: "criteriosDefinidos",

                operator: ComparisonOperator.EQUAL,

                value: false

            }

        ],

        acciones: [

            {

                type: ActionType.SOLICITAR_INFORMACION,

                target: "Criterios",

                description:
                    "Definir los criterios de adjudicación."

            }

        ],

        motores: [

            "ProcedimientoEngine",

            "DocumentEngine"

        ],

        documentos: [

            "PCAP"

        ]

    },

    {

        id: "R-145-002",

        nombre: "Calidad-precio",

        articulo: "145",

        descripcion:
            "Los criterios deberán permitir seleccionar la mejor relación calidad-precio.",

        prioridad: RulePriority.HIGH,

        activa: true,

        condiciones: [

            {

                fact: "calidadPrecioJustificada",

                operator: ComparisonOperator.EQUAL,

                value: false

            }

        ],

        acciones: [

            {

                type: ActionType.GENERAR_MOTIVACION,

                target: "Criterios",

                description:
                    "Justificar la elección de los criterios."

            }

        ],

        motores: [

            "DocumentEngine"

        ],

        documentos: [

            "PCAP",

            "InformeProcedimiento"

        ]

    },

    {

        id: "R-146-001",

        nombre: "Juicios de valor",

        articulo: "146",

        descripcion:
            "Comprobar si existen criterios sometidos a juicio de valor.",

        prioridad: RulePriority.NORMAL,

        activa: true,

        condiciones: [

            {

                fact: "existenJuiciosValor",

                operator: ComparisonOperator.EQUAL,

                value: true

            }

        ],

        acciones: [

            {

                type: ActionType.MOSTRAR_ADVERTENCIA,

                target: "JuiciosValor",

                description:
                    "Revisar la ponderación y la necesidad de comité técnico."

            }

        ],

        motores: [

            "ProcedimientoEngine"

        ],

        documentos: [

            "PCAP"

        ]

    },

    {

        id: "R-147-001",

        nombre: "Fórmulas automáticas",

        articulo: "147",

        descripcion:
            "Los criterios automáticos deberán disponer de fórmula objetiva.",

        prioridad: RulePriority.HIGH,

        activa: true,

        condiciones: [

            {

                fact: "criteriosAutomaticos",

                operator: ComparisonOperator.EQUAL,

                value: true

            }

        ],

        acciones: [

            {

                type: ActionType.GENERAR_DOCUMENTO,

                target: "FormulaValoracion",

                description:
                    "Generar propuesta de fórmula objetiva de valoración."

            }

        ],

        motores: [

            "DocumentEngine"

        ],

        documentos: [

            "PCAP"

        ]

    }

];
