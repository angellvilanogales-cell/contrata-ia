/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * CoreKnowledgeConcepts
 * ------------------------------------------------------------
 * Catálogo central de conceptos fundamentales de contratación.
 *
 * Este archivo constituye la base semántica del sistema.
 *
 * NO contiene:
 *
 * • lógica jurídica
 * • reglas
 * • decisiones
 * • interpretación normativa
 *
 * Contiene únicamente la definición de los conceptos raíz que
 * posteriormente serán enriquecidos mediante la Base de
 * Conocimiento Jurídico.
 * ============================================================
 */

import {
    KnowledgeConcept,
    KnowledgeRelation,
    LegalReference
} from "../models/KnowledgeConcept";

/**
 * Tipos de relación admitidos entre conceptos.
 */
export enum KnowledgeRelationType {

    DEPENDS_ON = "depends_on",

    DETERMINES = "determines",

    PRODUCES = "produces",

    REQUIRES = "requires",

    AFFECTS = "affects"

}

/**
 * Catálogo principal de conceptos.
 */
export const CORE_KNOWLEDGE_CONCEPTS: KnowledgeConcept[] = [

    /**
     * --------------------------------------------------------
     * CONCEPT-0001
     * --------------------------------------------------------
     */
    {

        id: "CONCEPT-0001",

        name: "Necesidad Pública",

        domain: "Planning",

        description:
            "Situación que la Administración debe satisfacer mediante un contrato público.",

        dependsOn: [],

        produces: [

            "CONCEPT-0002",

            "DOCUMENT-MEMORIA",

            "DOCUMENT-INFORME-MEDIOS"

        ],

        affectedDocuments: [

            "Memoria Justificativa",

            "Informe de Insuficiencia de Medios",

            "Resolución de Inicio"

        ],

        relations: [

            {
                source: "CONCEPT-0001",
                relation: KnowledgeRelationType.PRODUCES,
                target: "CONCEPT-0002"
            },

            {
                source: "CONCEPT-0001",
                relation: KnowledgeRelationType.REQUIRES,
                target: "DOCUMENT-MEMORIA"
            }

        ],

        legalReferences: [],

        enabled: true

    },

    /**
     * --------------------------------------------------------
     * CONCEPT-0002
     * --------------------------------------------------------
     */
    {

        id: "CONCEPT-0002",

        name: "Objeto del Contrato",

        domain: "Planning",

        description:
            "Prestación concreta que constituye el contenido del contrato.",

        dependsOn: [

            "CONCEPT-0001"

        ],

        produces: [

            "CONCEPT-0003",

            "CONCEPT-0004"

        ],

        affectedDocuments: [

            "Memoria",

            "PCAP",

            "PPT"

        ],

        relations: [

            {
                source: "CONCEPT-0002",
                relation: KnowledgeRelationType.DETERMINES,
                target: "CONCEPT-0003"
            },

            {
                source: "CONCEPT-0002",
                relation: KnowledgeRelationType.DETERMINES,
                target: "CONCEPT-0004"
            }

        ],

        legalReferences: [],

        enabled: true

    },

    /**
     * --------------------------------------------------------
     * CONCEPT-0003
     * --------------------------------------------------------
     */
    {

        id: "CONCEPT-0003",

        name: "Tipo de Contrato",

        domain: "Contract",

        description:
            "Clasificación jurídica principal del contrato.",

        dependsOn: [

            "CONCEPT-0002"

        ],

        produces: [

            "CONCEPT-0009"

        ],

        affectedDocuments: [

            "PCAP",

            "PPT",

            "Memoria"

        ],

        relations: [

            {
                source: "CONCEPT-0003",
                relation: KnowledgeRelationType.DETERMINES,
                target: "CONCEPT-0009"
            }

        ],

        legalReferences: [],

        enabled: true

    },

    /**
     * --------------------------------------------------------
     * CONCEPT-0004
     * --------------------------------------------------------
     */
    {

        id: "CONCEPT-0004",

        name: "Código CPV",

        domain: "Classification",

        description:
            "Clasificación europea que identifica el objeto contractual.",

        dependsOn: [

            "CONCEPT-0002"

        ],

        produces: [

            "CONCEPT-0009"

        ],

        affectedDocuments: [

            "PCAP",

            "Anuncio",

            "Expediente"

        ],

        relations: [

            {
                source: "CONCEPT-0004",
                relation: KnowledgeRelationType.AFFECTS,
                target: "CONCEPT-0009"
            }

        ],

        legalReferences: [],

        enabled: true

    },

    /**
     * --------------------------------------------------------
     * CONCEPT-0005
     * --------------------------------------------------------
     */
    {

        id: "CONCEPT-0005",

        name: "Valor Estimado",

        domain: "Economic",

        description:
            "Importe utilizado para determinar el régimen jurídico del contrato.",

        dependsOn: [

            "CONCEPT-0002"

        ],

        produces: [

            "CONCEPT-0009"

        ],

        affectedDocuments: [

            "Memoria",

            "PCAP",

            "Informe Económico"

        ],

        relations: [

            {
                source: "CONCEPT-0005",
                relation: KnowledgeRelationType.DETERMINES,
                target: "CONCEPT-0009"
            }

        ],

        legalReferences: [],

        enabled: true

    }

];

    /**
     * --------------------------------------------------------
     * CONCEPT-0006
     * --------------------------------------------------------
     */
    {

        id: "CONCEPT-0006",

        name: "Presupuesto Base de Licitación",

        domain: "Economic",

        description:
            "Importe máximo de licitación sobre el que formularán oferta los licitadores.",

        dependsOn: [

            "CONCEPT-0005"

        ],

        produces: [

            "CONCEPT-0014"

        ],

        affectedDocuments: [

            "PCAP",

            "Memoria Económica",

            "Anuncio"

        ],

        relations: [

            {
                source: "CONCEPT-0006",
                relation: KnowledgeRelationType.DEPENDS_ON,
                target: "CONCEPT-0005"
            }

        ],

        legalReferences: [],

        enabled: true

    },

    /**
     * --------------------------------------------------------
     * CONCEPT-0007
     * --------------------------------------------------------
     */
    {

        id: "CONCEPT-0007",

        name: "Duración del Contrato",

        domain: "Contract",

        description:
            "Periodo de ejecución previsto para el contrato.",

        dependsOn: [

            "CONCEPT-0003"

        ],

        produces: [

            "CONCEPT-0011"

        ],

        affectedDocuments: [

            "PCAP",

            "PPT",

            "Contrato"

        ],

        relations: [

            {
                source: "CONCEPT-0007",
                relation: KnowledgeRelationType.AFFECTS,
                target: "CONCEPT-0011"
            }

        ],

        legalReferences: [],

        enabled: true

    },

    /**
     * --------------------------------------------------------
     * CONCEPT-0008
     * --------------------------------------------------------
     */
    {

        id: "CONCEPT-0008",

        name: "Lotes",

        domain: "Contract",

        description:
            "División del objeto contractual en partes susceptibles de licitación independiente.",

        dependsOn: [

            "CONCEPT-0002"

        ],

        produces: [

            "CONCEPT-0014"

        ],

        affectedDocuments: [

            "PCAP",

            "Memoria",

            "Anuncio"

        ],

        relations: [

            {
                source: "CONCEPT-0008",
                relation: KnowledgeRelationType.AFFECTS,
                target: "CONCEPT-0014"
            }

        ],

        legalReferences: [],

        enabled: true

    },

    /**
     * --------------------------------------------------------
     * CONCEPT-0009
     * --------------------------------------------------------
     */
    {

        id: "CONCEPT-0009",

        name: "Procedimiento de Adjudicación",

        domain: "Procedure",

        description:
            "Forma jurídica utilizada para seleccionar al adjudicatario.",

        dependsOn: [

            "CONCEPT-0003",

            "CONCEPT-0004",

            "CONCEPT-0005"

        ],

        produces: [

            "CONCEPT-0010",

            "CONCEPT-0011",

            "CONCEPT-0012",

            "CONCEPT-0013",

            "CONCEPT-0014"

        ],

        affectedDocuments: [

            "PCAP",

            "Anuncio",

            "Cronograma",

            "Expediente"

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
            }

        ],

        legalReferences: [],

        enabled: true

    },

    /**
     * --------------------------------------------------------
     * CONCEPT-0010
     * --------------------------------------------------------
     */
    {

        id: "CONCEPT-0010",

        name: "Publicidad",

        domain: "Procedure",

        description:
            "Obligaciones de publicación derivadas del procedimiento de contratación.",

        dependsOn: [

            "CONCEPT-0009"

        ],

        produces: [

            "DOCUMENT-ANUNCIO"

        ],

        affectedDocuments: [

            "Anuncio",

            "Perfil del Contratante",

            "DOUE"

        ],

        relations: [

            {
                source: "CONCEPT-0010",
                relation: KnowledgeRelationType.DEPENDS_ON,
                target: "CONCEPT-0009"
            }

        ],

        legalReferences: [],

        enabled: true

    },

    /**
     * --------------------------------------------------------
     * CONCEPT-0011
     * --------------------------------------------------------
     */
    {

        id: "CONCEPT-0011",

        name: "Plazos",

        domain: "Procedure",

        description:
            "Conjunto de plazos administrativos derivados del procedimiento de contratación.",

        dependsOn: [

            "CONCEPT-0007",

            "CONCEPT-0009"

        ],

        produces: [

            "DOCUMENT-CRONOGRAMA"

        ],

        affectedDocuments: [

            "PCAP",

            "Cronograma",

            "Anuncio"

        ],

        relations: [

            {
                source: "CONCEPT-0011",
                relation: KnowledgeRelationType.DEPENDS_ON,
                target: "CONCEPT-0007"
            },

            {
                source: "CONCEPT-0011",
                relation: KnowledgeRelationType.DEPENDS_ON,
                target: "CONCEPT-0009"
            }

        ],

        legalReferences: [],

        enabled: true

    },

    /**
     * --------------------------------------------------------
     * CONCEPT-0012
     * --------------------------------------------------------
     */
    {

        id: "CONCEPT-0012",

        name: "Solvencia",

        domain: "Selection",

        description:
            "Requisitos de capacidad económica, financiera y técnica exigibles al licitador.",

        dependsOn: [

            "CONCEPT-0009"

        ],

        produces: [

            "DOCUMENT-SOLVENCIA"

        ],

        affectedDocuments: [

            "PCAP",

            "Anuncio",

            "Informe"

        ],

        relations: [

            {
                source: "CONCEPT-0012",
                relation: KnowledgeRelationType.DEPENDS_ON,
                target: "CONCEPT-0009"
            }

        ],

        legalReferences: [],

        enabled: true

    },

    /**
     * --------------------------------------------------------
     * CONCEPT-0013
     * --------------------------------------------------------
     */
    {

        id: "CONCEPT-0013",

        name: "Garantías",

        domain: "Selection",

        description:
            "Garantías exigibles durante el procedimiento y la ejecución del contrato.",

        dependsOn: [

            "CONCEPT-0009"

        ],

        produces: [

            "DOCUMENT-GARANTIAS"

        ],

        affectedDocuments: [

            "PCAP",

            "Contrato"

        ],

        relations: [

            {
                source: "CONCEPT-0013",
                relation: KnowledgeRelationType.DEPENDS_ON,
                target: "CONCEPT-0009"
            }

        ],

        legalReferences: [],

        enabled: true

    },

    /**
     * --------------------------------------------------------
     * CONCEPT-0014
     * --------------------------------------------------------
     */
    {

        id: "CONCEPT-0014",

        name: "Criterios de Adjudicación",

        domain: "Evaluation",

        description:
            "Conjunto de criterios utilizados para seleccionar la oferta económicamente más ventajosa.",

        dependsOn: [

            "CONCEPT-0006",

            "CONCEPT-0008",

            "CONCEPT-0009"

        ],

        produces: [

            "DOCUMENT-CRITERIOS"

        ],

        affectedDocuments: [

            "PCAP",

            "Informe de Valoración"

        ],

        relations: [

            {
                source: "CONCEPT-0014",
                relation: KnowledgeRelationType.DEPENDS_ON,
                target: "CONCEPT-0009"
            }

        ],

        legalReferences: [],

        enabled: true

    },

    /**
     * --------------------------------------------------------
     * CONCEPT-0015
     * --------------------------------------------------------
     */
    {

        id: "CONCEPT-0015",

        name: "Condiciones Especiales de Ejecución",

        domain: "Execution",

        description:
            "Obligaciones específicas que deben cumplirse durante la ejecución del contrato.",

        dependsOn: [

            "CONCEPT-0003",

            "CONCEPT-0009"

        ],

        produces: [

            "DOCUMENT-CLAUSULAS"

        ],

        affectedDocuments: [

            "PCAP",

            "Contrato",

            "PPT"

        ],

        relations: [

            {
                source: "CONCEPT-0015",
                relation: KnowledgeRelationType.DEPENDS_ON,
                target: "CONCEPT-0009"
            }

        ],

        legalReferences: [],

        enabled: true

    },

    /**
     * --------------------------------------------------------
     * CONCEPT-0016
     * --------------------------------------------------------
     */
    {

        id: "CONCEPT-0016",

        name: "Adjudicación",

        domain: "Award",

        description:
            "Acto administrativo mediante el cual se selecciona la oferta adjudicataria.",

        dependsOn: [

            "CONCEPT-0014"

        ],

        produces: [

            "CONCEPT-0017"

        ],

        affectedDocuments: [

            "Resolución de Adjudicación",

            "Informe de Valoración"

        ],

        relations: [

            {
                source: "CONCEPT-0016",
                relation: KnowledgeRelationType.PRODUCES,
                target: "CONCEPT-0017"
            }

        ],

        legalReferences: [],

        enabled: true

    },

    /**
     * --------------------------------------------------------
     * CONCEPT-0017
     * --------------------------------------------------------
     */
    {

        id: "CONCEPT-0017",

        name: "Formalización",

        domain: "Award",

        description:
            "Perfeccionamiento del contrato mediante su formalización conforme a la normativa aplicable.",

        dependsOn: [

            "CONCEPT-0016"

        ],

        produces: [

            "CONCEPT-0018"

        ],

        affectedDocuments: [

            "Contrato",

            "Resolución"

        ],

        relations: [

            {
                source: "CONCEPT-0017",
                relation: KnowledgeRelationType.PRODUCES,
                target: "CONCEPT-0018"
            }

        ],

        legalReferences: [],

        enabled: true

    },

    /**
     * --------------------------------------------------------
     * CONCEPT-0018
     * --------------------------------------------------------
     */
    {

        id: "CONCEPT-0018",

        name: "Ejecución del Contrato",

        domain: "Execution",

        description:
            "Fase durante la cual el contratista ejecuta las prestaciones contratadas.",

        dependsOn: [

            "CONCEPT-0017"

        ],

        produces: [

            "CONCEPT-0019",

            "CONCEPT-0020"

        ],

        affectedDocuments: [

            "Actas",

            "Informes",

            "Seguimiento"

        ],

        relations: [

            {
                source: "CONCEPT-0018",
                relation: KnowledgeRelationType.PRODUCES,
                target: "CONCEPT-0019"
            },

            {
                source: "CONCEPT-0018",
                relation: KnowledgeRelationType.PRODUCES,
                target: "CONCEPT-0020"
            }

        ],

        legalReferences: [],

        enabled: true

    },

    /**
     * --------------------------------------------------------
     * CONCEPT-0019
     * --------------------------------------------------------
     */
    {

        id: "CONCEPT-0019",

        name: "Modificaciones",

        domain: "Execution",

        description:
            "Alteraciones del contrato durante su ejecución dentro de los límites legales.",

        dependsOn: [

            "CONCEPT-0018"

        ],

        produces: [

            "DOCUMENT-MODIFICACION"

        ],

        affectedDocuments: [

            "Resolución",

            "Contrato",

            "Expediente"

        ],

        relations: [

            {
                source: "CONCEPT-0019",
                relation: KnowledgeRelationType.DEPENDS_ON,
                target: "CONCEPT-0018"
            }

        ],

        legalReferences: [],

        enabled: true

    },

    /**
     * --------------------------------------------------------
     * CONCEPT-0020
     * --------------------------------------------------------
     */
    {

        id: "CONCEPT-0020",

        name: "Liquidación",

        domain: "Closing",

        description:
            "Fase final del contrato en la que se verifica su correcta ejecución y se procede a su cierre.",

        dependsOn: [

            "CONCEPT-0018"

        ],

        produces: [],

        affectedDocuments: [

            "Acta de Recepción",

            "Liquidación",

            "Archivo del Expediente"

        ],

        relations: [

            {
                source: "CONCEPT-0020",
                relation: KnowledgeRelationType.DEPENDS_ON,
                target: "CONCEPT-0018"
            }

        ],

        legalReferences: [],

        enabled: true

    }

];
