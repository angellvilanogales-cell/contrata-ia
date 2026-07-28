/**
 * ============================================================
 * CONTRATA IA
 * SolvenciaRules
 * ============================================================
 *
 * Reglas derivadas principalmente de los artículos
 * 74 a 82 de la LCSP.
 *
 * Solvencia económica.
 * Solvencia técnica.
 * Clasificación empresarial.
 *
 * ============================================================
 */

import { ActionType } from "../KnowledgeAction";
import { ComparisonOperator } from "../KnowledgeCondition";
import { LegalRule, RulePriority } from "../LegalRule";

export const SolvenciaRules: LegalRule[] = [

    {

        id: "R-074-001",

        nombre: "Analizar necesidad de solvencia",

        articulo: "74",

        descripcion:
            "Debe determinarse si procede exigir solvencia al licitador.",

        prioridad: RulePriority.VERY_HIGH,

        activa: true,

        condiciones: [

            {

                fact: "exigeSolvencia",

                operator: ComparisonOperator.EQUAL,

                value: false

            }

        ],

        acciones: [

            {

                type: ActionType.SOLICITAR_INFORMACION,

                target: "Solvencia",

                description:
                    "Comprobar si la LCSP exige solvencia para este contrato."

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

        id: "R-075-001",

        nombre: "Solvencia económica",

        articulo: "75",

        descripcion:
            "Debe determinarse el medio de acreditación de la solvencia económica.",

        prioridad: RulePriority.HIGH,

        activa: true,

        condiciones: [

            {

                fact: "requiereSolvenciaEconomica",

                operator: ComparisonOperator.EQUAL,

                value: true

            }

        ],

        acciones: [

            {

                type: ActionType.GENERAR_DOCUMENTO,

                target: "PCAP",

                description:
                    "Incorporar cláusula de solvencia económica."

            }

        ],

        motores: [

            "DocumentEngine"

        ],

        documentos: [

            "PCAP"

        ]

    },

    {

        id: "R-076-001",

        nombre: "Solvencia técnica",

        articulo: "76",

        descripcion:
            "Debe fijarse el criterio de solvencia técnica o profesional.",

        prioridad: RulePriority.HIGH,

        activa: true,

        condiciones: [

            {

                fact: "requiereSolvenciaTecnica",

                operator: ComparisonOperator.EQUAL,

                value: true

            }

        ],

        acciones: [

            {

                type: ActionType.GENERAR_DOCUMENTO,

                target: "PCAP",

                description:
                    "Añadir cláusula de solvencia técnica."

            }

        ],

        motores: [

            "DocumentEngine"

        ],

        documentos: [

            "PCAP"

        ]

    },

    {

        id: "R-077-001",

        nombre: "Clasificación empresarial",

        articulo: "77",

        descripcion:
            "Comprobar si resulta exigible clasificación empresarial.",

        prioridad: RulePriority.NORMAL,

        activa: true,

        condiciones: [

            {

                fact: "requiereClasificacion",

                operator: ComparisonOperator.EQUAL,

                value: true

            }

        ],

        acciones: [

            {

                type: ActionType.MOSTRAR_ADVERTENCIA,

                target: "Clasificacion",

                description:
                    "Verificar clasificación empresarial obligatoria."

            }

        ],

        motores: [

            "ProcedimientoEngine"

        ],

        documentos: [

            "PCAP"

        ]

    }

];
