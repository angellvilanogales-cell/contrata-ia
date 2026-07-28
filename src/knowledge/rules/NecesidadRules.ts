/**
 * ============================================================
 * CONTRATA IA
 * NecesidadRules
 * ============================================================
 *
 * Reglas derivadas del artículo 28 LCSP.
 *
 * Necesidad e idoneidad de los contratos.
 * ============================================================
 */

import { ActionType, KnowledgeAction } from "../KnowledgeAction";
import {
    ComparisonOperator,
    KnowledgeCondition
} from "../KnowledgeCondition";
import { LegalRule, RulePriority } from "../LegalRule";

export const NecesidadRules: LegalRule[] = [

    {

        id: "R-028-001",

        nombre: "Existencia de necesidad",

        articulo: "28",

        descripcion:
            "Todo expediente debe justificar una necesidad pública.",

        prioridad: RulePriority.VERY_HIGH,

        activa: true,

        condiciones: [

            {

                fact: "necesidadJustificada",

                operator: ComparisonOperator.EQUAL,

                value: false

            }

        ],

        acciones: [

            {

                type: ActionType.SOLICITAR_INFORMACION,

                target: "MemoriaJustificativa",

                description:
                    "Debe justificarse la necesidad pública."

            }

        ],

        motores: [

            "DocumentEngine"

        ],

        documentos: [

            "MemoriaJustificativa"

        ]

    },

    {

        id: "R-028-002",

        nombre: "Insuficiencia de medios",

        articulo: "28",

        descripcion:
            "Debe justificarse la insuficiencia de medios propios cuando resulte exigible.",

        prioridad: RulePriority.HIGH,

        activa: true,

        condiciones: [

            {

                fact: "requiereInsuficienciaMedios",

                operator: ComparisonOperator.EQUAL,

                value: true

            }

        ],

        acciones: [

            {

                type: ActionType.GENERAR_DOCUMENTO,

                target: "MemoriaInsuficienciaMedios",

                description:
                    "Generar memoria de insuficiencia de medios."

            }

        ],

        motores: [

            "DocumentEngine"

        ],

        documentos: [

            "MemoriaInsuficienciaMedios"

        ]

    }

];
