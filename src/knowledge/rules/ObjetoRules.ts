/**
 * ============================================================
 * CONTRATA IA
 * ObjetoRules
 * ============================================================
 *
 * Reglas derivadas del artículo 99 de la LCSP.
 *
 * Objeto del contrato.
 * División en lotes.
 * Determinación del CPV.
 *
 * ============================================================
 */

import { ActionType } from "../KnowledgeAction";
import { ComparisonOperator } from "../KnowledgeCondition";
import { LegalRule, RulePriority } from "../LegalRule";

export const ObjetoRules: LegalRule[] = [

    {

        id: "R-099-001",

        nombre: "Objeto obligatorio",

        articulo: "99",

        descripcion:
            "Todo contrato debe definir correctamente su objeto.",

        prioridad: RulePriority.VERY_HIGH,

        activa: true,

        condiciones: [

            {

                fact: "objetoContrato",

                operator: ComparisonOperator.EQUAL,

                value: ""

            }

        ],

        acciones: [

            {

                type: ActionType.SOLICITAR_INFORMACION,

                target: "ObjetoContrato",

                description:
                    "Debe describirse el objeto del contrato."

            }

        ],

        motores: [

            "CPVEngine",

            "DocumentEngine"

        ],

        documentos: [

            "MemoriaJustificativa",

            "PCAP"

        ]

    },

    {

        id: "R-099-002",

        nombre: "Clasificación CPV",

        articulo: "99",

        descripcion:
            "Todo objeto contractual deberá clasificarse mediante el CPV correspondiente.",

        prioridad: RulePriority.HIGH,

        activa: true,

        condiciones: [

            {

                fact: "cpvPrincipal",

                operator: ComparisonOperator.EQUAL,

                value: ""

            }

        ],

        acciones: [

            {

                type: ActionType.PROPONER_CPV,

                target: "CPV",

                description:
                    "Calcular automáticamente el CPV."

            }

        ],

        motores: [

            "CPVEngine"

        ],

        documentos: [

            "PCAP",

            "PPT"

        ]

    },

    {

        id: "R-099-003",

        nombre: "División en lotes",

        articulo: "99",

        descripcion:
            "Debe analizarse la conveniencia de dividir el contrato en lotes.",

        prioridad: RulePriority.NORMAL,

        activa: true,

        condiciones: [

            {

                fact: "divisionLotesAnalizada",

                operator: ComparisonOperator.EQUAL,

                value: false

            }

        ],

        acciones: [

            {

                type: ActionType.SOLICITAR_INFORMACION,

                target: "DivisionLotes",

                description:
                    "Analizar la procedencia de dividir el contrato en lotes."

            }

        ],

        motores: [

            "ProcedimientoEngine",

            "DocumentEngine"

        ],

        documentos: [

            "MemoriaJustificativa",

            "PCAP"

        ]

    },

    {

        id: "R-099-004",

        nombre: "Justificación de no dividir",

        articulo: "99",

        descripcion:
            "Cuando no existan lotes deberá incorporarse motivación suficiente.",

        prioridad: RulePriority.HIGH,

        activa: true,

        condiciones: [

            {

                fact: "divisionLotes",

                operator: ComparisonOperator.EQUAL,

                value: false

            }

        ],

        acciones: [

            {

                type: ActionType.GENERAR_MOTIVACION,

                target: "DivisionLotes",

                description:
                    "Generar motivación jurídica de la no división."

            }

        ],

        motores: [

            "DocumentEngine"

        ],

        documentos: [

            "MemoriaJustificativa"

        ]

    }

];
