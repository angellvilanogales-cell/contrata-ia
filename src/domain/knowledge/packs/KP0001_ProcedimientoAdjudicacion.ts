/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * KP-0001
 * Procedimiento de Adjudicación
 * ------------------------------------------------------------
 *
 * Primer Knowledge Pack oficial del sistema.
 *
 * Este paquete representa el conocimiento asociado al
 * procedimiento de adjudicación.
 *
 * IMPORTANTE
 *
 * Este archivo NO ejecuta reglas.
 *
 * NO interpreta la LCSP.
 *
 * NO toma decisiones.
 *
 * Únicamente describe conocimiento normalizado que podrá ser
 * utilizado por:
 *
 * • KnowledgeRepository
 * • RuleEngine
 * • ContractDecisionEngine
 * • DocumentComposer
 *
 * Todo el contenido deberá estar respaldado por las fuentes
 * documentales del proyecto.
 *
 * ============================================================
 */

import {
    KnowledgeRelationType
} from "../catalogs/CoreKnowledgeConcepts";

/**
 * Información básica del Knowledge Pack.
 */
export interface KnowledgePackMetadata {

    /**
     * Identificador.
     */
    id: string;

    /**
     * Nombre.
     */
    name: string;

    /**
     * Versión.
     */
    version: string;

    /**
     * Concepto asociado.
     */
    conceptId: string;

    /**
     * Dominio.
     */
    domain: string;

    /**
     * Estado.
     */
    status: "draft" | "validated";

}

/**
 * Variable utilizada para tomar decisiones.
 */
export interface DecisionVariable {

    /**
     * Identificador.
     */
    id: string;

    /**
     * Nombre.
     */
    name: string;

    /**
     * Descripción.
     */
    description: string;

    /**
     * Obligatoria.
     */
    required: boolean;

}

/**
 * Documento afectado.
 */
export interface AffectedDocument {

    /**
     * Nombre.
     */
    name: string;

    /**
     * Motivo.
     */
    reason: string;

}

/**
 * Relación semántica.
 */
export interface KnowledgeRelation {

    /**
     * Concepto origen.
     */
    source: string;

    /**
     * Tipo.
     */
    relation: KnowledgeRelationType;

    /**
     * Concepto destino.
     */
    target: string;

}

/**
 * Referencia normativa.
 */
export interface LegalReference {

    /**
     * Norma.
     */
    regulation: string;

    /**
     * Artículo.
     */
    article?: string;

    /**
     * Observaciones.
     */
    notes?: string;

}

/**
 * Knowledge Pack.
 */
export interface KnowledgePack {

    /**
     * Metadatos.
     */
    metadata: KnowledgePackMetadata;

    /**
     * Definición.
     */
    definition: string;

    /**
     * Finalidad.
     */
    purpose: string;

    /**
     * Variables necesarias para decidir.
     */
    decisionVariables: DecisionVariable[];

    /**
     * Relaciones.
     */
    relations: KnowledgeRelation[];

    /**
     * Documentos afectados.
     */
    affectedDocuments: AffectedDocument[];

    /**
     * Referencias jurídicas.
     */
    legalReferences: LegalReference[];

    /**
     * Observaciones obtenidas de las fuentes.
     */
    observations: string[];

}

/**
 * ============================================================
 * KP-0001
 * Procedimiento de adjudicación
 * ============================================================
 */

export const KP0001: KnowledgePack = {

    metadata: {

        id: "KP-0001",

        name: "Procedimiento de adjudicación",

        version: "1.0.0",

        conceptId: "CONCEPT-0009",

        domain: "Procedure",

        status: "draft"

    },

    definition:
        "Pendiente de completar mediante extracción del conocimiento de las fuentes documentales.",

    purpose:
        "Centralizar el conocimiento relativo al procedimiento de adjudicación para que pueda ser utilizado por el motor de decisiones.",

    decisionVariables: [

    ],

    relations: [

    ],

    affectedDocuments: [

    ],

    legalReferences: [

    ],

    observations: [

    ]

      decisionVariables: [

        {
            id: "DV-001",
            name: "Tipo de contrato",
            description:
                "Clasificación jurídica del contrato que condiciona el procedimiento aplicable.",
            required: true
        },

        {
            id: "DV-002",
            name: "Valor estimado",
            description:
                "Importe utilizado para determinar el procedimiento y las obligaciones de publicidad.",
            required: true
        },

        {
            id: "DV-003",
            name: "Código CPV",
            description:
                "Clasificación europea del objeto contractual.",
            required: true
        },

        {
            id: "DV-004",
            name: "Objeto del contrato",
            description:
                "Prestación que constituye el contenido del contrato.",
            required: true
        },

        {
            id: "DV-005",
            name: "División en lotes",
            description:
                "Existencia o no de lotes susceptibles de licitación independiente.",
            required: true
        },

        {
            id: "DV-006",
            name: "Regulación armonizada",
            description:
                "Determina si el contrato está sujeto a regulación armonizada.",
            required: true
        },

        {
            id: "DV-007",
            name: "Tramitación",
            description:
                "Tipo de tramitación administrativa del expediente.",
            required: true
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
        },

        {
            source: "CONCEPT-0009",
            relation: KnowledgeRelationType.DETERMINES,
            target: "CONCEPT-0013"
        },

        {
            source: "CONCEPT-0009",
            relation: KnowledgeRelationType.DETERMINES,
            target: "CONCEPT-0014"
        },

        {
            source: "CONCEPT-0009",
            relation: KnowledgeRelationType.DETERMINES,
            target: "CONCEPT-0015"
        },

        {
            source: "CONCEPT-0009",
            relation: KnowledgeRelationType.PRODUCES,
            target: "CONCEPT-0016"
        }

    ],

    affectedDocuments: [

        {
            name: "Memoria Justificativa",
            reason:
                "Debe justificar el procedimiento seleccionado."
        },

        {
            name: "PCAP",
            reason:
                "Recoge íntegramente el procedimiento de adjudicación."
        },

        {
            name: "PPT",
            reason:
                "Puede verse afectado por las condiciones derivadas del procedimiento."
        },

        {
            name: "Anuncio de Licitación",
            reason:
                "La publicidad depende del procedimiento seleccionado."
        },

        {
            name: "Cronograma",
            reason:
                "Los plazos administrativos dependen del procedimiento."
        },

        {
            name: "Informe de Valoración",
            reason:
                "El procedimiento determina la forma de evaluación de ofertas."
        },

        {
            name: "Resolución de Adjudicación",
            reason:
                "Es consecuencia directa del procedimiento seguido."
        },

        {
            name: "Contrato",
            reason:
                "La formalización depende del procedimiento utilizado."
        }

    ],

      legalReferences: [

        {
            regulation: "Ley 9/2017, de Contratos del Sector Público",
            notes:
                "Las referencias concretas se completarán tras la extracción sistemática del conocimiento de las fuentes del proyecto."
        },

        {
            regulation: "Pliegos tipo de la Junta de Andalucía",
            notes:
                "Conocimiento obtenido de los PCAP incorporados al repositorio documental."
        }

    ],

    observations: [

        "El procedimiento de adjudicación condiciona la publicidad del contrato.",

        "El procedimiento determina los plazos administrativos del expediente.",

        "Los modelos PCAP analizados describen expresamente el procedimiento en el Anexo I.",

        "La licitación se desarrolla por medios electrónicos mediante SiREC-Portal en los modelos analizados.",

        "La resolución de adjudicación y la formalización constituyen consecuencias directas del procedimiento.",

        "Este Knowledge Pack constituye un modelo inicial y deberá enriquecerse progresivamente mediante la extracción del conocimiento de las fuentes del proyecto."

    ]

};

};
