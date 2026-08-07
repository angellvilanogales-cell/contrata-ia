/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * KP-0001
 * Procedimiento de Adjudicación
 * ------------------------------------------------------------
 * Primer Knowledge Pack oficial del sistema.
 *
 * Este paquete contiene conocimiento estructurado sobre el
 * procedimiento de adjudicación.
 *
 * NO interpreta la normativa.
 * NO ejecuta reglas.
 * NO toma decisiones.
 *
 * Todo el conocimiento deberá estar respaldado por las fuentes
 * documentales del proyecto.
 * ============================================================
 */

import {
    KnowledgePack
} from "../models/KnowledgePack";

import {
    KnowledgeRelationType
} from "../catalogs/CoreKnowledgeConcepts";

export const KP0001: KnowledgePack = {

    metadata: {

        id: "KP-0001",

        name: "Procedimiento de adjudicación",

        version: "1.1.0",

        conceptId: "CONCEPT-0009",

        domain: "Procedure",

        status: "draft"

    },

    definition:
        "Mecanismo jurídico mediante el cual el órgano de contratación selecciona al adjudicatario del contrato.",

    purpose:
        "Centralizar el conocimiento relativo al procedimiento de adjudicación para ser utilizado por el motor de decisiones.",

    inputs: [

        {
            id: "INPUT-001",
            name: "Tipo de contrato",
            description: "Clasificación jurídica del contrato.",
            required: true
        },

        {
            id: "INPUT-002",
            name: "Valor estimado",
            description: "Importe utilizado para determinar el procedimiento.",
            required: true
        },

        {
            id: "INPUT-003",
            name: "Código CPV",
            description: "Clasificación CPV del objeto contractual.",
            required: true
        },

        {
            id: "INPUT-004",
            name: "Objeto del contrato",
            description: "Prestación objeto del expediente.",
            required: true
        },

        {
            id: "INPUT-005",
            name: "Lotes",
            description: "Existencia de división en lotes.",
            required: true
        }

    ],

    outputs: [

        {
            id: "OUTPUT-001",
            name: "Procedimiento aplicable",
            description: "Procedimiento de adjudicación resultante."
        },

        {
            id: "OUTPUT-002",
            name: "Publicidad",
            description: "Publicidad obligatoria del expediente."
        },

        {
            id: "OUTPUT-003",
            name: "Plazos",
            description: "Plazos administrativos asociados."
        }

    ],

    relations: [

        {
            source: "CONCEPT-0009",
            relation: KnowledgeRelationType.DEPENDS_ON,
            target: "CONCEPT-0003"
        },

        {
            source: "CONCEPT-0009",
            relation: KnowledgeRelationType.DEPENDS_ON,
            target: "CONCEPT-0004"
        },

        {
            source: "CONCEPT-0009",
            relation: KnowledgeRelationType.DEPENDS_ON,
            target: "CONCEPT-0005"
        },

        {
            source: "CONCEPT-0009",
            relation: KnowledgeRelationType.DETERMINES,
            target: "CONCEPT-0010"
        },

        {
            source: "CONCEPT-0009",
            relation: KnowledgeRelationType.DETERMINES,
            target: "CONCEPT-0011"
        },

        {
            source: "CONCEPT-0009",
            relation: KnowledgeRelationType.DETERMINES,
            target: "CONCEPT-0012"
        }

    ],

    affectedDocuments: [

        {

            name: "Memoria Justificativa",

            reason:
                "Debe justificar el procedimiento elegido."

        },

        {

            name: "PCAP",

            reason:
                "Recoge íntegramente el procedimiento."

        },

        {

            name: "Anuncio de Licitación",

            reason:
                "Depende del procedimiento seleccionado."

        },

        {

            name: "Cronograma",

            reason:
                "Los plazos cambian según el procedimiento."

        },

        {

            name: "Resolución de Adjudicación",

            reason:
                "Resultado directo del procedimiento."

        }

    ],

    rules: [

        {

            id: "RULE-0001",

            description:
                "Las reglas jurídicas se incorporarán tras la extracción sistemática desde las fuentes documentales.",

            enabled: false

        }

    ],

    legalReferences: [

        {

            regulation:
                "Ley 9/2017, de Contratos del Sector Público",

            notes:
                "Pendiente de completar mediante extracción normativa."

        },

        {

            regulation:
                "Modelos PCAP del proyecto",

            notes:
                "Conocimiento obtenido de los expedientes utilizados como referencia."

        }

    ],

    examples: [

        {

            source:
                "Banco documental",

            description:
                "Procedimiento abierto."

        },

        {

            source:
                "Banco documental",

            description:
                "Procedimiento abierto simplificado."

        }

    ],

    observations: [

        {

            source:
                "PCAP",

            description:
                "El procedimiento condiciona la publicidad."

        },

        {

            source:
                "PCAP",

            description:
                "El procedimiento determina los plazos."

        },

        {

            source:
                "PCAP",

            description:
                "La licitación se realiza electrónicamente mediante SiREC."

        }

    ],

    requiredQuestions: [

        {

            id: "QUESTION-001",

            question:
                "¿Cuál es el valor estimado del contrato?",

            targetField:
                "estimatedValue",

            required: true

        },

        {

            id: "QUESTION-002",

            question:
                "¿Cuál es el tipo de contrato?",

            targetField:
                "contractType",

            required: true

        },

        {

            id: "QUESTION-003",

            question:
                "¿Existe división en lotes?",

            targetField:
                "lots",

            required: true

        }

    ],

    decisionImpacts: [

        {

            conceptId: "CONCEPT-0010",

            description:
                "Publicidad"

        },

        {

            conceptId: "CONCEPT-0011",

            description:
                "Plazos"

        },

        {

            conceptId: "CONCEPT-0012",

            description:
                "Solvencia"

        },

        {

            conceptId: "CONCEPT-0013",

            description:
                "Garantías"

        },

        {

            conceptId: "CONCEPT-0014",

            description:
                "Adjudicación"

        }

    ]

};
