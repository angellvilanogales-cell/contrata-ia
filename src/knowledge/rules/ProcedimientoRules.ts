/**
 * ============================================================
 * CONTRATA IA
 * ProcedimientoRules
 * ============================================================
 *
 * Reglas derivadas de los artículos 131 y siguientes de la LCSP.
 *
 * Estas reglas determinan el procedimiento de adjudicación.
 *
 * ============================================================
 */

import { ActionType } from "../KnowledgeAction";
import { ComparisonOperator } from "../KnowledgeCondition";
import { LegalRule, RulePriority } from "../LegalRule";

export const ProcedimientoRules: LegalRule[] = [

    {

        id: "R-131-001",

        nombre: "Determinar procedimiento",

        articulo: "131",

        descripcion:
            "Todo expediente debe tener determinado un procedimiento de adjudicación.",

        prioridad: RulePriority.VERY_HIGH,

        activa: true,

        condiciones: [

            {

                fact: "procedimiento",

                operator: ComparisonOperator.EQUAL,

                value: ""

            }

        ],

        acciones: [

            {

                type: ActionType.ESTABLECER_PROCEDIMIENTO,

                target: "Procedimiento",

                description:
                    "Calcular automáticamente el procedimiento aplicable."

            }

        ],

        motores: [

            "ProcedimientoEngine"

        ],

        documentos: [

            "InformeProcedimiento",

            "PCAP"

        ]

    },

    {

        id: "R-131-002",

        nombre: "Procedimiento motivado",

        articulo: "131",

        descripcion:
            "La elección del procedimiento deberá estar motivada.",

        prioridad: RulePriority.HIGH,

        activa: true,

        condiciones: [

            {

                fact: "procedimientoMotivado",

                operator: ComparisonOperator.EQUAL,

                value: false

            }

        ],

        acciones: [

            {

                type: ActionType.GENERAR_MOTIVACION,

                target: "Procedimiento",

                description:
                    "Generar motivación jurídica del procedimiento elegido."

            }

        ],

        motores: [

            "DocumentEngine"

        ],

        documentos: [

            "InformeProcedimiento"

        ]

    },

    {

        id: "R-132-001",

        nombre: "Igualdad y transparencia",

        articulo: "132",

        descripcion:
            "Todo procedimiento debe respetar los principios de igualdad, transparencia y libre competencia.",

        prioridad: RulePriority.VERY_HIGH,

        activa: true,

        condiciones: [

            {

                fact: "principiosContratacion",

                operator: ComparisonOperator.EQUAL,

                value: false

            }

        ],

        acciones: [

            {

                type: ActionType.MOSTRAR_ADVERTENCIA,

                target: "Principios",

                description:
                    "Revisar el cumplimiento de los principios generales de contratación."

            }

        ],

        motores: [

            "ProcedimientoEngine",

            "DocumentEngine"

        ],

        documentos: [

            "Expediente"

        ]

    }

];
