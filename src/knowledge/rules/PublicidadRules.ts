/**
 * ============================================================
 * CONTRATA IA
 * PublicidadRules
 * ============================================================
 *
 * Reglas relativas a la publicidad de la licitación.
 *
 * Basadas principalmente en los artículos 135 y siguientes
 * de la LCSP.
 *
 * ============================================================
 */

import { ActionType } from "../KnowledgeAction";
import { ComparisonOperator } from "../KnowledgeCondition";
import { LegalRule, RulePriority } from "../LegalRule";

export const PublicidadRules: LegalRule[] = [

    {

        id: "R-135-001",

        nombre: "Publicidad obligatoria",

        articulo: "135",

        descripcion:
            "Todo expediente debe determinar el nivel de publicidad aplicable.",

        prioridad: RulePriority.VERY_HIGH,

        activa: true,

        condiciones: [

            {

                fact: "publicidadDeterminada",

                operator: ComparisonOperator.EQUAL,

                value: false

            }

        ],

        acciones: [

            {

                type: ActionType.ESTABLECER_VALOR,

                target: "Publicidad",

                value: "Pendiente",

                description:
                    "Determinar automáticamente el régimen de publicidad."

            }

        ],

        motores: [

            "PublicidadEngine"

        ],

        documentos: [

            "PCAP",

            "InformeProcedimiento"

        ]

    },

    {

        id: "R-135-002",

        nombre: "Perfil del Contratante",

        articulo: "135",

        descripcion:
            "La licitación debe publicarse en el Perfil del Contratante cuando proceda.",

        prioridad: RulePriority.HIGH,

        activa: true,

        condiciones: [

            {

                fact: "perfilContratantePublicado",

                operator: ComparisonOperator.EQUAL,

                value: false

            }

        ],

        acciones: [

            {

                type: ActionType.MOSTRAR_ADVERTENCIA,

                target: "PerfilContratante",

                description:
                    "Pendiente publicación en el Perfil del Contratante."

            }

        ],

        motores: [

            "PublicidadEngine"

        ],

        documentos: [

            "Expediente"

        ]

    },

    {

        id: "R-135-003",

        nombre: "Diario Oficial de la Unión Europea",

        articulo: "135",

        descripcion:
            "Comprobar si la licitación supera los umbrales sujetos a publicación en el DOUE.",

        prioridad: RulePriority.HIGH,

        activa: true,

        condiciones: [

            {

                fact: "requiereDOUE",

                operator: ComparisonOperator.EQUAL,

                value: true

            }

        ],

        acciones: [

            {

                type: ActionType.GENERAR_DOCUMENTO,

                target: "AnuncioDOUE",

                description:
                    "Generar automáticamente el anuncio para el DOUE."

            }

        ],

        motores: [

            "PublicidadEngine"

        ],

        documentos: [

            "AnuncioDOUE"

        ]

    },

    {

        id: "R-135-004",

        nombre: "Plataforma de Contratación",

        articulo: "135",

        descripcion:
            "La licitación deberá publicarse en la Plataforma de Contratación correspondiente.",

        prioridad: RulePriority.HIGH,

        activa: true,

        condiciones: [

            {

                fact: "publicadoPLCSP",

                operator: ComparisonOperator.EQUAL,

                value: false

            }

        ],

        acciones: [

            {

                type: ActionType.MOSTRAR_ADVERTENCIA,

                target: "PLCSP",

                description:
                    "Pendiente publicación en la Plataforma de Contratación."

            }

        ],

        motores: [

            "PublicidadEngine"

        ],

        documentos: [

            "Expediente"

        ]

    },

    {

        id: "R-135-005",

        nombre: "Plazos de publicidad",

        articulo: "136",

        descripcion:
            "Comprobar que los plazos mínimos de presentación de ofertas se ajustan a la LCSP.",

        prioridad: RulePriority.HIGH,

        activa: true,

        condiciones: [

            {

                fact: "plazosCorrectos",

                operator: ComparisonOperator.EQUAL,

                value: false

            }

        ],

        acciones: [

            {

                type: ActionType.MOSTRAR_ADVERTENCIA,

                target: "Plazos",

                description:
                    "Revisar los plazos mínimos de presentación de ofertas."

            }

        ],

        motores: [

            "PublicidadEngine",

            "ProcedimientoEngine"

        ],

        documentos: [

            "PCAP",

            "Cronograma"

        ]

    }

];
