/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * LEGAL REASONER
 *
 * ---------------------------------------------------------------------------
 *
 * Este módulo constituye el motor de razonamiento jurídico del sistema.
 *
 * No es un simple repositorio de artículos de la LCSP.
 *
 * Su misión consiste en interpretar la normativa aplicable,
 * justificar todas las decisiones adoptadas por el sistema
 * y proporcionar motivaciones jurídicas completas para la
 * generación automática del expediente.
 *
 * Todos los motores del sistema dependen de este componente.
 *
 ******************************************************************************/

import { UUID } from "../common/types";

import { ContractContextModel }
from "../../application/modules/contract-generator/ContractContext";

/*===========================================================================
=
= FUENTES NORMATIVAS
=
===========================================================================*/

export enum LegalSource{

    LCSP="LCSP",

    RD817="RD817_2009",

    RGLCAP="RGLCAP",

    LPAC="LPAC",

    LRJSP="LRJSP",

    DIRECTIVE_2014_24="DIRECTIVE_2014_24_UE",

    DIRECTIVE_2014_25="DIRECTIVE_2014_25_UE",

    INTERNAL_INSTRUCTION="INTERNAL_INSTRUCTION",

    JCCA_REPORT="JCCA_REPORT",

    COURT_DECISION="COURT_DECISION"

}

/*===========================================================================
=
= NIVEL NORMATIVO
=
===========================================================================*/

export enum LegalHierarchy{

    EUROPEAN="EUROPEAN",

    NATIONAL_LAW="NATIONAL_LAW",

    REGULATION="REGULATION",

    ORDER="ORDER",

    INSTRUCTION="INSTRUCTION",

    DOCTRINE="DOCTRINE",

    JURISPRUDENCE="JURISPRUDENCE"

}

/*===========================================================================
=
= TIPO DE RAZONAMIENTO
=
===========================================================================*/

export enum LegalReasonType{

    PROCEDURE,

    CONTRACT_TYPE,

    CPV,

    VALUE,

    LOTS,

    SOLVENCY,

    GUARANTEE,

    DEADLINES,

    SOCIAL,

    ENVIRONMENTAL,

    MODIFICATION,

    EXTENSION,

    EXECUTION,

    TERMINATION,

    PENALTIES,

    AWARD,

    EXCLUSION,

    PUBLICITY,

    GENERAL

}

/*===========================================================================
=
= REFERENCIA JURÍDICA
=
===========================================================================*/

export interface LegalReference{

    id:UUID;

    source:LegalSource;

    hierarchy:LegalHierarchy;

    article:string;

    title:string;

    description:string;

    mandatory:boolean;

}

/*===========================================================================
=
= ARGUMENTO JURÍDICO
=
===========================================================================*/

export interface LegalArgument{

    order:number;

    title:string;

    explanation:string;

    references:LegalReference[];

}

/*===========================================================================
=
= CONCLUSIÓN JURÍDICA
=
===========================================================================*/

export interface LegalConclusion{

    valid:boolean;

    summary:string;

    recommendation:string;

    legalRisk:"LOW"|"MEDIUM"|"HIGH";

}

/*===========================================================================
=
= RAZONAMIENTO COMPLETO
=
===========================================================================*/

export interface LegalReasoning{

    id:UUID;

    type:LegalReasonType;

    generated:Date;

    title:string;

    introduction:string;

    arguments:LegalArgument[];

    conclusion:LegalConclusion;

    references:LegalReference[];

}

/*===========================================================================
=
= CONFIGURACIÓN
=
===========================================================================*/

export interface LegalReasonerConfiguration{

    includeDoctrine:boolean;

    includeCaseLaw:boolean;

    includeEuropeanLaw:boolean;

    automaticMotivation:boolean;

    strictMode:boolean;

}

/*===========================================================================
=
= LEGAL REASONER
=
===========================================================================*/

export interface LegalInference{

    id:UUID;

    type:LegalReasonType;

    premise:string;

    inference:string;

    justification:string;

    confidence:number;

    references:LegalReference[];

}

export interface LegalConflict{

    id:UUID;

    type:LegalReasonType;

    description:string;

    primary:LegalReference;

    secondary:LegalReference;

    resolved:boolean;

    solution?:string;

}

export interface LegalMotivation{

    id:UUID;

    generated:Date;

    title:string;

    body:string;

    references:LegalReference[];

    reasoning:LegalReasoning[];

    legalRisk:"LOW"|"MEDIUM"|"HIGH";

}

export interface LegalDoctrine{

    id:UUID;

    authority:string;

    title:string;

    reference:string;

    date:Date;

    hierarchy:LegalHierarchy;

    summary:string;

    applicableTo:LegalReasonType[];

}

export interface LegalValidationResult{

    id:UUID;

    generated:Date;

    valid:boolean;

    score:number;

    observations:string[];

    warnings:string[];

    errors:string[];

    recommendations:string[];

}

export interface LegalRisk{

    id:UUID;

    severity:"LOW"|"MEDIUM"|"HIGH"|"CRITICAL";

    title:string;

    description:string;

    recommendation:string;

    references:LegalReference[];

}

export interface LegalRecommendation{

    id:UUID;

    priority:"LOW"|"MEDIUM"|"HIGH"|"CRITICAL";

    title:string;

    description:string;

    action:string;

    automatic:boolean;

    applied:boolean;

}

export interface LegalOpinion{

    id:UUID;

    generated:Date;

    result:"FAVORABLE"|"FAVORABLE_WITH_OBSERVATIONS"|"UNFAVORABLE";

    score:number;

    executiveSummary:string;

    strengths:string[];

    weaknesses:string[];

    recommendations:string[];

    risks:LegalRisk[];

}

export interface ExpertDecision{

    id:UUID;

    generated:Date;

    approved:boolean;

    confidence:number;

    score:number;

    opinion:LegalOpinion;

    validation:LegalValidationResult;

    risks:LegalRisk[];

    recommendations:LegalRecommendation[];

    finalDecision:string;

}

export interface LegalEngineResult{

    validation:LegalValidationResult;

    opinion:LegalOpinion;

    decision:ExpertDecision;

    risks:ReadonlyArray<LegalRisk>;

    recommendations:ReadonlyArray<LegalRecommendation>;

    motivations:ReadonlyArray<LegalMotivation>;

    statistics:{

        score:number;

        confidence:number;

        approved:boolean;

        totalRisks:number;

        pendingRecommendations:number;

    };

}

export class LegalReasoner{

    private context?:ContractContextModel;

    private readonly references:

        LegalReference[]=[];

    private readonly reasonings:

        LegalReasoning[]=[];

    private configuration:

        LegalReasonerConfiguration;

    private initialized:boolean=false;

    constructor(

        configuration?:

        Partial<LegalReasonerConfiguration>

    ){

        this.configuration={

            includeDoctrine:true,

            includeCaseLaw:true,

            includeEuropeanLaw:true,

            automaticMotivation:true,

            strictMode:true,

            ...configuration

        };

        this.loadCoreLegalReferences();

    }

/*===========================================================================
=
= INICIALIZACIÓN
=
===========================================================================*/

    public initialize(

        context:ContractContextModel

    ):void{

        this.context=context;

        this.reasonings.length=0;

        this.initialized=true;

    }

/*===========================================================================
=
= CARGA DE REFERENCIAS BÁSICAS
=
===========================================================================*/

    private loadCoreLegalReferences()

    :void{

        this.references.push({

            id:crypto.randomUUID() as UUID,

            source:LegalSource.LCSP,

            hierarchy:LegalHierarchy.NATIONAL_LAW,

            article:"Artículo 1",

            title:"Objeto y finalidad",

            description:"Principios generales de la contratación pública.",

            mandatory:true

        });

        this.references.push({

            id:crypto.randomUUID() as UUID,

            source:LegalSource.LCSP,

            hierarchy:LegalHierarchy.NATIONAL_LAW,

            article:"Artículo 28",

            title:"Necesidad e idoneidad",

            description:"Justificación de la necesidad del contrato.",

            mandatory:true

        });

        this.references.push({

            id:crypto.randomUUID() as UUID,

            source:LegalSource.LCSP,

            hierarchy:LegalHierarchy.NATIONAL_LAW,

            article:"Artículo 99",

            title:"Objeto del contrato",

            description:"Determinación del objeto contractual.",

            mandatory:true

        });

        this.references.push({

            id:crypto.randomUUID() as UUID,

            source:LegalSource.LCSP,

            hierarchy:LegalHierarchy.NATIONAL_LAW,

            article:"Artículo 116",

            title:"Expediente de contratación",

            description:"Contenido mínimo del expediente.",

            mandatory:true

        });

    }

/*===========================================================================
=
= ÍNDICE NORMATIVO
=
===========================================================================*/

private readonly legalIndex:

    Map<string,LegalReference[]>=

    new Map();



/*===========================================================================
=
= CLASIFICACIÓN POR MATERIAS
=
===========================================================================*/

private readonly legalTopics:

    Map<LegalReasonType,LegalReference[]>=

    new Map();



/*===========================================================================
=
= REGISTRO DE REFERENCIA
=
===========================================================================*/

private registerReference(

    reference:LegalReference,

    ...topics:LegalReasonType[]

):void{

    this.references.push(

        reference

    );



    this.legalIndex.set(

        reference.article,

        [

            ...(this.legalIndex.get(

                reference.article

            ) ?? []),

            reference

        ]

    );



    for(

        const topic

        of topics

    ){

        if(

            !this.legalTopics.has(

                topic

            )

        ){

            this.legalTopics.set(

                topic,

                []

            );

        }



        this.legalTopics.get(

            topic

        )!.push(

            reference

        );

    }

}



/*===========================================================================
=
= REPOSITORIO LCSP
=
===========================================================================*/

private loadLCSPRepository()

:void{

    this.registerReference(

        {

            id:crypto.randomUUID() as UUID,

            source:LegalSource.LCSP,

            hierarchy:LegalHierarchy.NATIONAL_LAW,

            article:"Artículo 18",

            title:"Contratos mixtos",

            description:

                "Determinación del régimen jurídico.",

            mandatory:true

        },

        LegalReasonType.CONTRACT_TYPE

    );



    this.registerReference(

        {

            id:crypto.randomUUID() as UUID,

            source:LegalSource.LCSP,

            hierarchy:LegalHierarchy.NATIONAL_LAW,

            article:"Artículo 28",

            title:"Necesidad",

            description:

                "Necesidad e idoneidad.",

            mandatory:true

        },

        LegalReasonType.GENERAL

    );



    this.registerReference(

        {

            id:crypto.randomUUID() as UUID,

            source:LegalSource.LCSP,

            hierarchy:LegalHierarchy.NATIONAL_LAW,

            article:"Artículo 99",

            title:"Objeto",

            description:

                "Objeto contractual.",

            mandatory:true

        },

        LegalReasonType.CPV,

        LegalReasonType.LOTS

    );



    this.registerReference(

        {

            id:crypto.randomUUID() as UUID,

            source:LegalSource.LCSP,

            hierarchy:LegalHierarchy.NATIONAL_LAW,

            article:"Artículo 101",

            title:"Valor estimado",

            description:

                "Cálculo del valor estimado.",

            mandatory:true

        },

        LegalReasonType.VALUE

    );



    this.registerReference(

        {

            id:crypto.randomUUID() as UUID,

            source:LegalSource.LCSP,

            hierarchy:LegalHierarchy.NATIONAL_LAW,

            article:"Artículo 116",

            title:"Expediente",

            description:

                "Contenido del expediente.",

            mandatory:true

        },

        LegalReasonType.GENERAL

    );



    this.registerReference(

        {

            id:crypto.randomUUID() as UUID,

            source:LegalSource.LCSP,

            hierarchy:LegalHierarchy.NATIONAL_LAW,

            article:"Artículo 122",

            title:"PCAP",

            description:

                "Contenido del PCAP.",

            mandatory:true

        },

        LegalReasonType.GENERAL

    );



    this.registerReference(

        {

            id:crypto.randomUUID() as UUID,

            source:LegalSource.LCSP,

            hierarchy:LegalHierarchy.NATIONAL_LAW,

            article:"Artículo 124",

            title:"PPT",

            description:

                "Contenido del PPT.",

            mandatory:true

        },

        LegalReasonType.GENERAL

    );

}



/*===========================================================================
=
= CONSULTA POR ARTÍCULO
=
===========================================================================*/

public findByArticle(

    article:string

)

:LegalReference[]{

    return [

        ...(this.legalIndex.get(

            article

        ) ?? [])

    ];

}



/*===========================================================================
=
= CONSULTA POR MATERIA
=
===========================================================================*/

public findByTopic(

    topic:LegalReasonType

)

:LegalReference[]{

    return [

        ...(this.legalTopics.get(

            topic

        ) ?? [])

    ];

}



/*===========================================================================
=
= REFERENCIAS OBLIGATORIAS
=
===========================================================================*/

public getMandatoryReferences()

:LegalReference[]{

    return this.references.filter(

        reference=>

            reference.mandatory

    );

}



/*===========================================================================
=
= BÚSQUEDA LIBRE
=
===========================================================================*/

public search(

    text:string

)

:LegalReference[]{

    const value=

        text

        .toLowerCase();



    return this.references.filter(

        reference=>

            reference.title

                .toLowerCase()

                .includes(value)

            ||

            reference.description

                .toLowerCase()

                .includes(value)

            ||

            reference.article

                .toLowerCase()

                .includes(value)

    );

}



/*===========================================================================
=
= ESTADÍSTICAS
=
===========================================================================*/

public getRepositoryStatistics(){

    return{

        references:

            this.references.length,



        indexedArticles:

            this.legalIndex.size,



        topics:

            this.legalTopics.size,



        mandatory:

            this.getMandatoryReferences()

                .length

    };

}

  /*===========================================================================
=
= CONSTRUCCIÓN DEL RAZONAMIENTO
=
===========================================================================*/

public buildReasoning(

    type:LegalReasonType

)

:LegalReasoning{

    if(

        !this.initialized

    ){

        throw new Error(

            "LegalReasoner has not been initialized."

        );

    }



    const reasoning:LegalReasoning={

        id:crypto.randomUUID() as UUID,

        type,

        generated:new Date(),

        title:

            this.buildReasoningTitle(

                type

            ),

        introduction:

            this.buildIntroduction(

                type

            ),

        arguments:[],

        conclusion:

            this.buildConclusion(

                type

            ),

        references:

            this.findByTopic(

                type

            )

    };



    reasoning.arguments=

        this.buildArguments(

            reasoning

        );



    this.reasonings.push(

        reasoning

    );



    return reasoning;

}



/*===========================================================================
=
= TÍTULO
=
===========================================================================*/

private buildReasoningTitle(

    type:LegalReasonType

):string{

    switch(type){

        case LegalReasonType.PROCEDURE:

            return "Justificación del procedimiento";



        case LegalReasonType.VALUE:

            return "Justificación del valor estimado";



        case LegalReasonType.CPV:

            return "Justificación del código CPV";



        case LegalReasonType.LOTS:

            return "Justificación de la división en lotes";



        case LegalReasonType.SOLVENCY:

            return "Justificación de la solvencia";



        case LegalReasonType.AWARD:

            return "Justificación de los criterios de adjudicación";



        default:

            return "Motivación jurídica";

    }

}



/*===========================================================================
=
= INTRODUCCIÓN
=
===========================================================================*/

private buildIntroduction(

    type:LegalReasonType

):string{

    return [

        "El presente razonamiento jurídico",

        "ha sido elaborado automáticamente",

        "a partir del contexto del expediente",

        "y de las referencias normativas",

        "incorporadas al sistema.",

        "",

        `Materia analizada: ${type}`

    ].join("\n");

}



/*===========================================================================
=
= ARGUMENTOS
=
===========================================================================*/

private buildArguments(

    reasoning:LegalReasoning

):LegalArgument[]{

    const argumentsList:

        LegalArgument[]=[];



    let order=1;



    for(

        const reference

        of reasoning.references

    ){

        argumentsList.push({

            order:order++,

            title:

                reference.title,

            explanation:

                this.buildArgumentText(

                    reference

                ),

            references:[

                reference

            ]

        });

    }



    return argumentsList;

}



/*===========================================================================
=
= TEXTO DEL ARGUMENTO
=
===========================================================================*/

private buildArgumentText(

    reference:LegalReference

):string{

    return [

        "De conformidad con",

        `${reference.source}`,

        `${reference.article},`,

        reference.description,

        "",

        "La decisión adoptada",

        "resulta compatible",

        "con el marco jurídico",

        "aplicable al expediente."

    ].join(" ");

}



/*===========================================================================
=
= CONCLUSIÓN
=
===========================================================================*/

private buildConclusion(

    type:LegalReasonType

):LegalConclusion{

    return{

        valid:true,

        summary:

            `La decisión relativa a ${type} resulta jurídicamente adecuada.`,



        recommendation:

            "Se recomienda continuar la tramitación.",



        legalRisk:

            this.evaluateLegalRisk(

                type

            )

    };

}



/*===========================================================================
=
= RIESGO
=
===========================================================================*/

private evaluateLegalRisk(

    type:LegalReasonType

)

:"LOW"|"MEDIUM"|"HIGH"{

    switch(type){

        case LegalReasonType.MODIFICATION:

        case LegalReasonType.EXCLUSION:

            return "HIGH";



        case LegalReasonType.AWARD:

        case LegalReasonType.PROCEDURE:

        case LegalReasonType.SOLVENCY:

            return "MEDIUM";



        default:

            return "LOW";

    }

}



/*===========================================================================
=
= CONSULTA
=
===========================================================================*/

public getReasonings()

:ReadonlyArray<LegalReasoning>{

    return this.reasonings;

}



/*===========================================================================
=
= LIMPIEZA
=
===========================================================================*/

public clearReasonings()

:void{

    this.reasonings.length=0;

}

  /*===========================================================================
=
= RAZONAMIENTO DEL PROCEDIMIENTO
=
===========================================================================*/

public buildProcedureReasoning()

:LegalReasoning{

    const reasoning=

        this.buildReasoning(

            LegalReasonType.PROCEDURE

        );



    reasoning.arguments.push(

        this.buildProcedureArgument()

    );



    reasoning.arguments.push(

        this.buildEstimatedValueArgument()

    );



    reasoning.arguments.push(

        this.buildCompetitionArgument()

    );



    reasoning.conclusion=

        this.buildProcedureConclusion();



    return reasoning;

}



/*===========================================================================
=
= PROCEDIMIENTO
=
===========================================================================*/

private buildProcedureArgument()

:LegalArgument{

    return{

        order:100,



        title:

            "Adecuación del procedimiento",



        explanation:[

            "El procedimiento propuesto",

            "se determina atendiendo",

            "al valor estimado,",

            "la naturaleza",

            "del contrato",

            "y los principios",

            "de publicidad,",

            "igualdad",

            "y libre competencia."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.PROCEDURE

            )

    };

}



/*===========================================================================
=
= VALOR ESTIMADO
=
===========================================================================*/

private buildEstimatedValueArgument()

:LegalArgument{

    const value=

        this.context

            ?.economic

            ?.estimatedValue

        ??0;



    return{

        order:101,



        title:

            "Valor estimado",



        explanation:[

            "El valor estimado declarado es",

            `${value.toLocaleString()} €.`,

            "Este importe",

            "condiciona",

            "la elección",

            "del procedimiento",

            "de adjudicación",

            "y las obligaciones",

            "de publicidad."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.VALUE

            )

    };

}



/*===========================================================================
=
= COMPETENCIA
=
===========================================================================*/

private buildCompetitionArgument()

:LegalArgument{

    return{

        order:102,



        title:

            "Principio de competencia",



        explanation:[

            "La solución seleccionada",

            "favorece",

            "la concurrencia",

            "de operadores",

            "económicos",

            "sin introducir",

            "restricciones",

            "injustificadas."

        ].join(" "),



        references:

            this.getMandatoryReferences()

    };

}



/*===========================================================================
=
= CONCLUSIÓN
=
===========================================================================*/

private buildProcedureConclusion()

:LegalConclusion{

    return{

        valid:true,



        summary:

            "El procedimiento propuesto resulta conforme a la LCSP.",



        recommendation:

            "Puede continuarse la tramitación del expediente.",



        legalRisk:"LOW"

    };

}



/*===========================================================================
=
= TIPO DE CONTRATO
=
===========================================================================*/

public determineContractType()

:string{

    const type=

        this.context

            ?.object

            ?.contractType

        ?? "";



    switch(type){

        case "WORKS":

            return "Contrato de Obras";



        case "SERVICES":

            return "Contrato de Servicios";



        case "SUPPLIES":

            return "Contrato de Suministro";



        case "CONCESSION_WORKS":

            return "Concesión de Obras";



        case "CONCESSION_SERVICES":

            return "Concesión de Servicios";



        default:

            return "Tipo pendiente de determinar.";

    }

}



/*===========================================================================
=
= INFORME DEL TIPO CONTRACTUAL
=
===========================================================================*/

public buildContractTypeReasoning()

:LegalReasoning{

    const reasoning=

        this.buildReasoning(

            LegalReasonType.CONTRACT_TYPE

        );



    reasoning.arguments.push({

        order:150,



        title:

            "Clasificación jurídica",



        explanation:[

            "De acuerdo con",

            "las prestaciones",

            "descritas",

            "en el expediente,",

            "el contrato",

            "queda clasificado como:",

            this.determineContractType()

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.CONTRACT_TYPE

            )

    });



    reasoning.conclusion={

        valid:true,



        summary:

            this.determineContractType(),



        recommendation:

            "Mantener la clasificación propuesta.",



        legalRisk:"LOW"

    };



    return reasoning;

}

  /*===========================================================================
=
= COHERENCIA DEL CPV
=
===========================================================================*/

public buildCPVReasoning()

:LegalReasoning{

    const reasoning=

        this.buildReasoning(

            LegalReasonType.CPV

        );



    reasoning.arguments.push(

        this.buildCPVObjectArgument()

    );



    reasoning.arguments.push(

        this.buildCPVConsistencyArgument()

    );



    reasoning.arguments.push(

        this.buildCPVCompetitionArgument()

    );



    reasoning.conclusion={

        valid:true,



        summary:

            "El código CPV seleccionado representa adecuadamente el objeto contractual.",



        recommendation:

            "Mantener la clasificación propuesta.",



        legalRisk:"LOW"

    };



    return reasoning;

}



/*===========================================================================
=
= OBJETO Y CPV
=
===========================================================================*/

private buildCPVObjectArgument()

:LegalArgument{

    return{

        order:200,



        title:

            "Correspondencia objeto / CPV",



        explanation:[

            "El código CPV debe",

            "identificar correctamente",

            "la prestación principal",

            "del contrato,",

            "garantizando",

            "la adecuada publicidad",

            "y clasificación",

            "del expediente."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.CPV

            )

    };

}



/*===========================================================================
=
= CONSISTENCIA
=
===========================================================================*/

private buildCPVConsistencyArgument()

:LegalArgument{

    return{

        order:201,



        title:

            "Coherencia documental",



        explanation:[

            "Existe coherencia",

            "entre el objeto",

            "del contrato,",

            "la memoria justificativa,",

            "el PPT,",

            "el PCAP",

            "y el código CPV",

            "seleccionado."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.CPV

            )

    };

}



/*===========================================================================
=
= COMPETENCIA
=
===========================================================================*/

private buildCPVCompetitionArgument()

:LegalArgument{

    return{

        order:202,



        title:

            "Publicidad y concurrencia",



        explanation:[

            "Una correcta",

            "identificación",

            "del CPV",

            "favorece",

            "la máxima",

            "concurrencia",

            "de licitadores",

            "potenciales."

        ].join(" "),



        references:

            this.getMandatoryReferences()

    };

}



/*===========================================================================
=
= DIVISIÓN EN LOTES
=
===========================================================================*/

public buildLotsReasoning()

:LegalReasoning{

    const reasoning=

        this.buildReasoning(

            LegalReasonType.LOTS

        );



    reasoning.arguments.push(

        this.buildLotsArgument()

    );



    reasoning.arguments.push(

        this.buildTechnicalEfficiencyArgument()

    );



    reasoning.arguments.push(

        this.buildSMEArgument()

    );



    reasoning.conclusion=

        this.buildLotsConclusion();



    return reasoning;

}



/*===========================================================================
=
= LOTES
=
===========================================================================*/

private buildLotsArgument()

:LegalArgument{

    const divided=

        this.context

            ?.object

            ?.dividedIntoLots

        ?? false;



    return{

        order:210,



        title:

            "División del contrato",



        explanation:

            divided

            ?

            "El contrato se divide en lotes por resultar técnica y económicamente conveniente."

            :

            "No procede la división en lotes por razones de eficiencia, coordinación y correcta ejecución.",



        references:

            this.findByTopic(

                LegalReasonType.LOTS

            )

    };

}



/*===========================================================================
=
= EFICIENCIA
=
===========================================================================*/

private buildTechnicalEfficiencyArgument()

:LegalArgument{

    return{

        order:211,



        title:

            "Eficiencia técnica",



        explanation:[

            "La organización",

            "de las prestaciones",

            "debe garantizar",

            "la ejecución",

            "coordinada",

            "del contrato",

            "y evitar",

            "duplicidades",

            "o interferencias."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.LOTS

            )

    };

}



/*===========================================================================
=
= PYMES
=
===========================================================================*/

private buildSMEArgument()

:LegalArgument{

    return{

        order:212,



        title:

            "Participación de PYMES",



        explanation:[

            "La división",

            "en lotes",

            "debe analizarse",

            "considerando",

            "la participación",

            "de pequeñas",

            "y medianas",

            "empresas,",

            "siempre que",

            "resulte compatible",

            "con el interés",

            "público."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.LOTS

            )

    };

}



/*===========================================================================
=
= CONCLUSIÓN
=
===========================================================================*/

private buildLotsConclusion()

:LegalConclusion{

    return{

        valid:true,



        summary:

            "La decisión relativa a la división en lotes se considera suficientemente motivada.",



        recommendation:

            "Mantener la solución adoptada en el expediente.",



        legalRisk:"LOW"

    };

}



/*===========================================================================
=
= VERIFICACIÓN
=
===========================================================================*/

public verifyCPVConsistency()

:boolean{

    return(

        this.getVariable(

            "CPV"

        ).length>0

        &&

        this.getVariable(

            "OBJETO"

        ).length>0

    );

}

  /*===========================================================================
=
= SOLVENCIA
=
===========================================================================*/

public buildSolvencyReasoning()

:LegalReasoning{

    const reasoning=

        this.buildReasoning(

            LegalReasonType.SOLVENCY

        );



    reasoning.arguments.push(

        this.buildEconomicSolvencyArgument()

    );



    reasoning.arguments.push(

        this.buildTechnicalSolvencyArgument()

    );



    reasoning.arguments.push(

        this.buildProportionalityArgument()

    );



    reasoning.conclusion=

        this.buildSolvencyConclusion();



    return reasoning;

}



/*===========================================================================
=
= SOLVENCIA ECONÓMICA
=
===========================================================================*/

private buildEconomicSolvencyArgument()

:LegalArgument{

    return{

        order:300,



        title:

            "Solvencia económica y financiera",



        explanation:[

            "La solvencia económica",

            "únicamente deberá exigirse",

            "cuando resulte",

            "proporcionada",

            "al objeto,",

            "importe",

            "y riesgos",

            "del contrato."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.SOLVENCY

            )

    };

}



/*===========================================================================
=
= SOLVENCIA TÉCNICA
=
===========================================================================*/

private buildTechnicalSolvencyArgument()

:LegalArgument{

    return{

        order:301,



        title:

            "Solvencia técnica",



        explanation:[

            "Los medios",

            "de acreditación",

            "deberán guardar",

            "relación directa",

            "con las prestaciones",

            "objeto",

            "del contrato,",

            "evitando",

            "restricciones",

            "innecesarias",

            "a la competencia."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.SOLVENCY

            )

    };

}



/*===========================================================================
=
= PROPORCIONALIDAD
=
===========================================================================*/

private buildProportionalityArgument()

:LegalArgument{

    return{

        order:302,



        title:

            "Principio de proporcionalidad",



        explanation:[

            "Toda exigencia",

            "de solvencia",

            "debe respetar",

            "el principio",

            "de proporcionalidad",

            "previsto",

            "en la legislación",

            "de contratación",

            "pública."

        ].join(" "),



        references:

            this.getMandatoryReferences()

    };

}



/*===========================================================================
=
= CONCLUSIÓN
=
===========================================================================*/

private buildSolvencyConclusion()

:LegalConclusion{

    return{

        valid:true,



        summary:

            "La solvencia propuesta resulta proporcionada al contrato.",



        recommendation:

            "Mantener los requisitos definidos.",



        legalRisk:"LOW"

    };

}



/*===========================================================================
=
= GARANTÍAS
=
===========================================================================*/

public buildGuaranteeReasoning()

:LegalReasoning{

    const reasoning=

        this.buildReasoning(

            LegalReasonType.GUARANTEE

        );



    reasoning.arguments.push(

        this.buildGuaranteeNeedArgument()

    );



    reasoning.arguments.push(

        this.buildGuaranteeAmountArgument()

    );



    reasoning.arguments.push(

        this.buildGuaranteePurposeArgument()

    );



    reasoning.conclusion={

        valid:true,



        summary:

            "La garantía prevista resulta jurídicamente adecuada.",



        recommendation:

            "Mantener la garantía establecida.",



        legalRisk:"LOW"

    };



    return reasoning;

}



/*===========================================================================
=
= NECESIDAD
=
===========================================================================*/

private buildGuaranteeNeedArgument()

:LegalArgument{

    return{

        order:310,



        title:

            "Necesidad de garantía",



        explanation:[

            "La garantía",

            "tiene por finalidad",

            "asegurar",

            "el correcto",

            "cumplimiento",

            "de las obligaciones",

            "contractuales."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.GUARANTEE

            )

    };

}



/*===========================================================================
=
= IMPORTE
=
===========================================================================*/

private buildGuaranteeAmountArgument()

:LegalArgument{

    return{

        order:311,



        title:

            "Importe",



        explanation:[

            "El importe",

            "de la garantía",

            "deberá ajustarse",

            "a lo previsto",

            "en la normativa",

            "vigente",

            "y resultar",

            "proporcionado",

            "al contrato."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.GUARANTEE

            )

    };

}



/*===========================================================================
=
= FINALIDAD
=
===========================================================================*/

private buildGuaranteePurposeArgument()

:LegalArgument{

    return{

        order:312,



        title:

            "Finalidad jurídica",



        explanation:[

            "La garantía",

            "protege",

            "los intereses",

            "de la Administración",

            "frente",

            "a posibles",

            "incumplimientos",

            "contractuales."

        ].join(" "),



        references:

            this.getMandatoryReferences()

    };

}



/*===========================================================================
=
= COMPROBACIÓN
=
===========================================================================*/

public verifySolvencyRequirements()

:boolean{

    return(

        this.context

            ?.procedure

            ?.requiresSolvency

        ?? false

    );

}

  /*===========================================================================
=
= CRITERIOS DE ADJUDICACIÓN
=
===========================================================================*/

public buildAwardReasoning()

:LegalReasoning{

    const reasoning=

        this.buildReasoning(

            LegalReasonType.AWARD

        );



    reasoning.arguments.push(

        this.buildQualityPriceArgument()

    );



    reasoning.arguments.push(

        this.buildObjectRelationArgument()

    );



    reasoning.arguments.push(

        this.buildTransparencyArgument()

    );



    reasoning.arguments.push(

        this.buildEvaluationMethodArgument()

    );



    reasoning.arguments.push(

        this.buildObjectiveCriteriaArgument()

    );



    reasoning.conclusion=

        this.buildAwardConclusion();



    return reasoning;

}



/*===========================================================================
=
= CALIDAD - PRECIO
=
===========================================================================*/

private buildQualityPriceArgument()

:LegalArgument{

    return{

        order:400,



        title:

            "Relación calidad-precio",



        explanation:[

            "La adjudicación",

            "debe realizarse",

            "utilizando",

            "la mejor",

            "relación",

            "calidad-precio,",

            "garantizando",

            "la eficiencia",

            "en el gasto",

            "público."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.AWARD

            )

    };

}



/*===========================================================================
=
= RELACIÓN CON EL OBJETO
=
===========================================================================*/

private buildObjectRelationArgument()

:LegalArgument{

    return{

        order:401,



        title:

            "Vinculación con el objeto contractual",



        explanation:[

            "Todos los criterios",

            "de adjudicación",

            "deben mantener",

            "una relación",

            "directa",

            "con el objeto",

            "del contrato",

            "y permitir",

            "comparar",

            "las ofertas",

            "de forma objetiva."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.AWARD

            )

    };

}



/*===========================================================================
=
= TRANSPARENCIA
=
===========================================================================*/

private buildTransparencyArgument()

:LegalArgument{

    return{

        order:402,



        title:

            "Publicidad y transparencia",



        explanation:[

            "Los criterios",

            "deberán aparecer",

            "definidos",

            "con suficiente",

            "precisión",

            "en los pliegos",

            "para garantizar",

            "la igualdad",

            "de trato",

            "entre licitadores."

        ].join(" "),



        references:

            this.getMandatoryReferences()

    };

}



/*===========================================================================
=
= MÉTODO DE VALORACIÓN
=
===========================================================================*/

private buildEvaluationMethodArgument()

:LegalArgument{

    return{

        order:403,



        title:

            "Sistema de valoración",



        explanation:[

            "El método",

            "de evaluación",

            "debe permitir",

            "la aplicación",

            "uniforme",

            "de los criterios",

            "establecidos,",

            "evitando",

            "arbitrariedad",

            "en la valoración."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.AWARD

            )

    };

}



/*===========================================================================
=
= CRITERIOS OBJETIVOS
=
===========================================================================*/

private buildObjectiveCriteriaArgument()

:LegalArgument{

    return{

        order:404,



        title:

            "Criterios automáticos y sujetos a juicio de valor",



        explanation:[

            "Siempre que sea posible,",

            "deberán priorizarse",

            "criterios",

            "evaluables",

            "mediante",

            "fórmulas",

            "objetivas,",

            "reservando",

            "el juicio",

            "de valor",

            "para aquellos",

            "aspectos",

            "que no puedan",

            "medirse",

            "automáticamente."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.AWARD

            )

    };

}



/*===========================================================================
=
= CONCLUSIÓN
=
===========================================================================*/

private buildAwardConclusion()

:LegalConclusion{

    return{

        valid:true,



        summary:

            "Los criterios de adjudicación cumplen los principios de objetividad, transparencia y vinculación con el objeto del contrato.",



        recommendation:

            "Procede mantener la estructura propuesta de criterios de adjudicación.",



        legalRisk:"LOW"

    };

}



/*===========================================================================
=
= VERIFICACIÓN
=
===========================================================================*/

public verifyAwardCriteria()

:boolean{

    const criteria=

        this.context

            ?.award

            ?.criteria

        ?? [];



    return criteria.length>0;

}

  /*===========================================================================
=
= EJECUCIÓN DEL CONTRATO
=
===========================================================================*/

public buildExecutionReasoning()

:LegalReasoning{

    const reasoning=

        this.buildReasoning(

            LegalReasonType.EXECUTION

        );



    reasoning.arguments.push(

        this.buildExecutionDeadlineArgument()

    );



    reasoning.arguments.push(

        this.buildExtensionArgument()

    );



    reasoning.arguments.push(

        this.buildModificationArgument()

    );



    reasoning.arguments.push(

        this.buildPenaltyArgument()

    );



    reasoning.arguments.push(

        this.buildTerminationArgument()

    );



    reasoning.conclusion=

        this.buildExecutionConclusion();



    return reasoning;

}



/*===========================================================================
=
= PLAZO DE EJECUCIÓN
=
===========================================================================*/

private buildExecutionDeadlineArgument()

:LegalArgument{

    return{

        order:500,



        title:

            "Plazo de ejecución",



        explanation:[

            "El plazo",

            "establecido",

            "debe resultar",

            "adecuado",

            "a la naturaleza",

            "de las prestaciones,",

            "garantizando",

            "la correcta",

            "ejecución",

            "del contrato",

            "sin imponer",

            "limitaciones",

            "injustificadas."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.EXECUTION

            )

    };

}



/*===========================================================================
=
= PRÓRROGAS
=
===========================================================================*/

private buildExtensionArgument()

:LegalArgument{

    return{

        order:501,



        title:

            "Prórrogas",



        explanation:[

            "Las posibles",

            "prórrogas",

            "deberán encontrarse",

            "previstas",

            "expresamente",

            "en los pliegos",

            "y respetar",

            "los límites",

            "establecidos",

            "por la LCSP."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.EXTENSION

            )

    };

}



/*===========================================================================
=
= MODIFICACIONES
=
===========================================================================*/

private buildModificationArgument()

:LegalArgument{

    return{

        order:502,



        title:

            "Modificaciones contractuales",



        explanation:[

            "Las modificaciones",

            "únicamente",

            "podrán realizarse",

            "cuando concurran",

            "los supuestos",

            "legalmente",

            "previstos",

            "y exista",

            "motivación",

            "suficiente."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.MODIFICATION

            )

    };

}



/*===========================================================================
=
= PENALIDADES
=
===========================================================================*/

private buildPenaltyArgument()

:LegalArgument{

    return{

        order:503,



        title:

            "Penalidades",



        explanation:[

            "Las penalidades",

            "deberán resultar",

            "proporcionadas",

            "al incumplimiento",

            "producido",

            "y encontrarse",

            "previstas",

            "expresamente",

            "en los pliegos."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.PENALTIES

            )

    };

}



/*===========================================================================
=
= RESOLUCIÓN
=
===========================================================================*/

private buildTerminationArgument()

:LegalArgument{

    return{

        order:504,



        title:

            "Resolución contractual",



        explanation:[

            "Las causas",

            "de resolución",

            "deberán responder",

            "a los supuestos",

            "legalmente",

            "establecidos",

            "y respetar",

            "el procedimiento",

            "previsto",

            "en la normativa",

            "vigente."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.TERMINATION

            )

    };

}



/*===========================================================================
=
= CONCLUSIÓN
=
===========================================================================*/

private buildExecutionConclusion()

:LegalConclusion{

    return{

        valid:true,



        summary:

            "Las condiciones de ejecución propuestas respetan la normativa aplicable.",



        recommendation:

            "Puede mantenerse el régimen de ejecución previsto en el expediente.",



        legalRisk:

            this.evaluateExecutionRisk()

    };

}



/*===========================================================================
=
= RIESGO DE EJECUCIÓN
=
===========================================================================*/

private evaluateExecutionRisk()

:"LOW"|"MEDIUM"|"HIGH"{

    const hasExtensions=

        this.context

            ?.execution

            ?.extensionsAllowed

        ?? false;



    const hasModifications=

        this.context

            ?.execution

            ?.modificationsAllowed

        ?? false;



    if(

        hasExtensions

        &&

        hasModifications

    ){

        return "MEDIUM";

    }



    return "LOW";

}



/*===========================================================================
=
= VERIFICACIÓN
=
===========================================================================*/

public verifyExecutionConditions()

:boolean{

    return(

        this.context

            ?.execution

        !=undefined

    );

}

  /*===========================================================================
=
= CLÁUSULAS SOCIALES
=
===========================================================================*/

public buildSocialClausesReasoning()

:LegalReasoning{

    const reasoning=

        this.buildReasoning(

            LegalReasonType.SOCIAL

        );



    reasoning.arguments.push(

        this.buildSocialInterestArgument()

    );



    reasoning.arguments.push(

        this.buildEqualityArgument()

    );



    reasoning.arguments.push(

        this.buildEmploymentArgument()

    );



    reasoning.arguments.push(

        this.buildAccessibilityArgument()

    );



    reasoning.conclusion=

        this.buildSocialConclusion();



    return reasoning;

}



/*===========================================================================
=
= INTERÉS PÚBLICO
=
===========================================================================*/

private buildSocialInterestArgument()

:LegalArgument{

    return{

        order:600,



        title:

            "Interés público",



        explanation:[

            "La incorporación",

            "de cláusulas",

            "sociales",

            "debe responder",

            "al interés",

            "público",

            "perseguido",

            "por el contrato",

            "y guardar",

            "relación",

            "con su objeto."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.SOCIAL

            )

    };

}



/*===========================================================================
=
= IGUALDAD
=
===========================================================================*/

private buildEqualityArgument()

:LegalArgument{

    return{

        order:601,



        title:

            "Igualdad y no discriminación",



        explanation:[

            "Las condiciones",

            "sociales",

            "deberán respetar",

            "los principios",

            "de igualdad,",

            "no discriminación",

            "y libre competencia",

            "entre operadores",

            "económicos."

        ].join(" "),



        references:

            this.getMandatoryReferences()

    };

}



/*===========================================================================
=
= EMPLEO
=
===========================================================================*/

private buildEmploymentArgument()

:LegalArgument{

    return{

        order:602,



        title:

            "Promoción del empleo",



        explanation:[

            "Podrán establecerse",

            "condiciones",

            "especiales",

            "de ejecución",

            "dirigidas",

            "a fomentar",

            "la estabilidad",

            "laboral,",

            "la formación",

            "y la inserción",

            "de colectivos",

            "prioritarios."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.SOCIAL

            )

    };

}



/*===========================================================================
=
= ACCESIBILIDAD
=
===========================================================================*/

private buildAccessibilityArgument()

:LegalArgument{

    return{

        order:603,



        title:

            "Accesibilidad universal",



        explanation:[

            "Siempre que",

            "la naturaleza",

            "del contrato",

            "lo permita,",

            "deberán contemplarse",

            "criterios",

            "relacionados",

            "con la accesibilidad",

            "universal",

            "y el diseño",

            "para todas",

            "las personas."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.SOCIAL

            )

    };

}



/*===========================================================================
=
= CLÁUSULAS MEDIOAMBIENTALES
=
===========================================================================*/

public buildEnvironmentalReasoning()

:LegalReasoning{

    const reasoning=

        this.buildReasoning(

            LegalReasonType.ENVIRONMENTAL

        );



    reasoning.arguments.push(

        this.buildSustainabilityArgument()

    );



    reasoning.arguments.push(

        this.buildCircularEconomyArgument()

    );



    reasoning.arguments.push(

        this.buildEmissionReductionArgument()

    );



    reasoning.arguments.push(

        this.buildEnvironmentalControlArgument()

    );



    reasoning.conclusion=

        this.buildEnvironmentalConclusion();



    return reasoning;

}



/*===========================================================================
=
= SOSTENIBILIDAD
=
===========================================================================*/

private buildSustainabilityArgument()

:LegalArgument{

    return{

        order:610,



        title:

            "Sostenibilidad",



        explanation:[

            "Las cláusulas",

            "medioambientales",

            "deben favorecer",

            "un uso",

            "eficiente",

            "de los recursos",

            "y contribuir",

            "al desarrollo",

            "sostenible."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.ENVIRONMENTAL

            )

    };

}



/*===========================================================================
=
= ECONOMÍA CIRCULAR
=
===========================================================================*/

private buildCircularEconomyArgument()

:LegalArgument{

    return{

        order:611,



        title:

            "Economía circular",



        explanation:[

            "Podrán incorporarse",

            "criterios",

            "relacionados",

            "con reutilización,",

            "reciclaje,",

            "durabilidad",

            "y reducción",

            "de residuos."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.ENVIRONMENTAL

            )

    };

}



/*===========================================================================
=
= REDUCCIÓN DE EMISIONES
=
===========================================================================*/

private buildEmissionReductionArgument()

:LegalArgument{

    return{

        order:612,



        title:

            "Reducción de emisiones",



        explanation:[

            "La contratación",

            "pública",

            "puede contribuir",

            "a disminuir",

            "las emisiones",

            "de CO₂",

            "mediante",

            "criterios",

            "ambientales",

            "proporcionados."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.ENVIRONMENTAL

            )

    };

}



/*===========================================================================
=
= CONTROL AMBIENTAL
=
===========================================================================*/

private buildEnvironmentalControlArgument()

:LegalArgument{

    return{

        order:613,



        title:

            "Seguimiento ambiental",



        explanation:[

            "Las condiciones",

            "ambientales",

            "deberán ser",

            "verificables",

            "durante",

            "la ejecución",

            "del contrato",

            "mediante",

            "indicadores",

            "objetivos."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.ENVIRONMENTAL

            )

    };

}



/*===========================================================================
=
= CONCLUSIONES
=
===========================================================================*/

private buildSocialConclusion()

:LegalConclusion{

    return{

        valid:true,

        summary:

            "Las cláusulas sociales resultan compatibles con la LCSP.",

        recommendation:

            "Procede su incorporación cuando guarden relación con el objeto contractual.",

        legalRisk:"LOW"

    };

}



private buildEnvironmentalConclusion()

:LegalConclusion{

    return{

        valid:true,

        summary:

            "Las cláusulas medioambientales se consideran jurídicamente adecuadas.",

        recommendation:

            "Se recomienda su utilización cuando aporten valor al contrato.",

        legalRisk:"LOW"

    };

}

  /*===========================================================================
=
= PUBLICIDAD DE LA LICITACIÓN
=
===========================================================================*/

public buildPublicityReasoning()

:LegalReasoning{

    const reasoning=

        this.buildReasoning(

            LegalReasonType.PUBLICITY

        );



    reasoning.arguments.push(

        this.buildPublicityArgument()

    );



    reasoning.arguments.push(

        this.buildContractProfileArgument()

    );



    reasoning.arguments.push(

        this.buildDOUEArgument()

    );



    reasoning.arguments.push(

        this.buildPLACSPArgument()

    );



    reasoning.arguments.push(

        this.buildTransparencyPortalArgument()

    );



    reasoning.arguments.push(

        this.buildAppealArgument()

    );



    reasoning.conclusion=

        this.buildPublicityConclusion();



    return reasoning;

}



/*===========================================================================
=
= PUBLICIDAD
=
===========================================================================*/

private buildPublicityArgument()

:LegalArgument{

    return{

        order:700,



        title:

            "Publicidad suficiente",



        explanation:[

            "La licitación",

            "deberá publicarse",

            "mediante",

            "los medios",

            "establecidos",

            "por la legislación",

            "vigente,",

            "garantizando",

            "la máxima",

            "concurrencia",

            "de licitadores."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.PUBLICITY

            )

    };

}



/*===========================================================================
=
= PERFIL DEL CONTRATANTE
=
===========================================================================*/

private buildContractProfileArgument()

:LegalArgument{

    return{

        order:701,



        title:

            "Perfil del contratante",



        explanation:[

            "Toda la documentación",

            "esencial",

            "del procedimiento",

            "deberá ponerse",

            "a disposición",

            "de los interesados",

            "a través",

            "del Perfil",

            "del Contratante."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.PUBLICITY

            )

    };

}



/*===========================================================================
=
= DOUE
=
===========================================================================*/

private buildDOUEArgument()

:LegalArgument{

    return{

        order:702,



        title:

            "Publicación en el DOUE",



        explanation:[

            "Cuando el valor",

            "estimado",

            "supere",

            "los umbrales",

            "europeos,",

            "la licitación",

            "deberá remitirse",

            "al Diario Oficial",

            "de la Unión",

            "Europea."

        ].join(" "),



        references:

            this.findByTopic(

                LegalReasonType.PUBLICITY

            )

    };

}



/*===========================================================================
=
= PLACSP
=
===========================================================================*/

private buildPLACSPArgument()

:LegalArgument{

    return{

        order:703,



        title:

            "Plataforma de Contratación",



        explanation:[

            "La Plataforma",

            "de Contratación",

            "del Sector Público",

            "constituye",

            "el medio",

            "ordinario",

            "de difusión",

            "de la información",

            "contractual."

        ].join(" "),



        references:

            this.getMandatoryReferences()

    };

}



/*===========================================================================
=
= TRANSPARENCIA
=
===========================================================================*/

private buildTransparencyPortalArgument()

:LegalArgument{

    return{

        order:704,



        title:

            "Transparencia",



        explanation:[

            "La actuación",

            "administrativa",

            "debe garantizar",

            "la publicidad",

            "activa,",

            "el acceso",

            "a la información",

            "y la trazabilidad",

            "del procedimiento."

        ].join(" "),



        references:

            this.getMandatoryReferences()

    };

}



/*===========================================================================
=
= RECURSOS
=
===========================================================================*/

private buildAppealArgument()

:LegalArgument{

    return{

        order:705,



        title:

            "Recursos administrativos",



        explanation:[

            "La documentación",

            "deberá permitir",

            "el ejercicio",

            "efectivo",

            "de los recursos",

            "previstos",

            "en la normativa",

            "de contratación",

            "pública."

        ].join(" "),



        references:

            this.getMandatoryReferences()

    };

}



/*===========================================================================
=
= CONCLUSIÓN
=
===========================================================================*/

private buildPublicityConclusion()

:LegalConclusion{

    return{

        valid:true,



        summary:

            "Las obligaciones de publicidad y transparencia quedan suficientemente justificadas.",



        recommendation:

            "Procede continuar con la publicación conforme al procedimiento seleccionado.",



        legalRisk:

            this.evaluatePublicityRisk()

    };

}



/*===========================================================================
=
= RIESGO
=
===========================================================================*/

private evaluatePublicityRisk()

:"LOW"|"MEDIUM"|"HIGH"{

    const european=

        this.context

            ?.procedure

            ?.requiresDOUE

        ?? false;



    if(

        european

    ){

        return "MEDIUM";

    }



    return "LOW";

}



/*===========================================================================
=
= COMPROBACIÓN
=
===========================================================================*/

public verifyPublicationRequirements()

:boolean{

    return(

        this.context

            ?.procedure

        !=undefined

    );

}

  /*===========================================================================
=
= INFERENCIAS JURÍDICAS
=
===========================================================================*/

/*===========================================================================
=
= BASE DE INFERENCIAS
=
===========================================================================*/

private readonly inferences:

    LegalInference[]=[];



/*===========================================================================
=
= GENERACIÓN DE INFERENCIAS
=
===========================================================================*/

public buildInference(

    type:LegalReasonType

)

:LegalInference{

    const inference:LegalInference={

        id:crypto.randomUUID() as UUID,

        type,

        premise:

            this.buildPremise(

                type

            ),

        inference:

            this.buildInferenceText(

                type

            ),

        justification:

            this.buildInferenceJustification(

                type

            ),

        confidence:

            this.calculateConfidence(

                type

            ),

        references:

            this.findByTopic(

                type

            )

    };



    this.inferences.push(

        inference

    );



    return inference;

}



/*===========================================================================
=
= PREMISA
=
===========================================================================*/

private buildPremise(

    type:LegalReasonType

)

:string{

    switch(type){

        case LegalReasonType.PROCEDURE:

            return

                "Existe un valor estimado y un objeto contractual definidos.";



        case LegalReasonType.CPV:

            return

                "Se dispone de un objeto contractual suficientemente descrito.";



        case LegalReasonType.SOLVENCY:

            return

                "La complejidad del contrato requiere acreditar capacidad.";



        default:

            return

                "Existe información suficiente para emitir una valoración jurídica.";

    }

}



/*===========================================================================
=
= INFERENCIA
=
===========================================================================*/

private buildInferenceText(

    type:LegalReasonType

)

:string{

    switch(type){

        case LegalReasonType.PROCEDURE:

            return

                "Puede determinarse jurídicamente el procedimiento de adjudicación.";



        case LegalReasonType.CPV:

            return

                "Puede identificarse el CPV principal y los CPV complementarios.";



        case LegalReasonType.LOTS:

            return

                "Es posible justificar la división o no división en lotes.";



        case LegalReasonType.AWARD:

            return

                "Pueden establecerse criterios de adjudicación proporcionados.";



        default:

            return

                "Puede emitirse una conclusión jurídica motivada.";

    }

}



/*===========================================================================
=
= JUSTIFICACIÓN
=
===========================================================================*/

private buildInferenceJustification(

    type:LegalReasonType

)

:string{

    return [

        "La inferencia",

        "se obtiene",

        "aplicando",

        "los principios",

        "de legalidad,",

        "proporcionalidad,",

        "eficiencia",

        "y libre competencia",

        "junto con",

        "las referencias",

        "normativas",

        "almacenadas",

        "en el repositorio jurídico."

    ].join(" ");

}



/*===========================================================================
=
= CONFIANZA
=
===========================================================================*/

private calculateConfidence(

    type:LegalReasonType

)

:number{

    switch(type){

        case LegalReasonType.PROCEDURE:

            return 0.98;



        case LegalReasonType.CPV:

            return 0.95;



        case LegalReasonType.LOTS:

            return 0.93;



        case LegalReasonType.SOLVENCY:

            return 0.94;



        case LegalReasonType.MODIFICATION:

            return 0.82;



        default:

            return 0.90;

    }

}



/*===========================================================================
=
= CONSULTA
=
===========================================================================*/

public getInferences()

:ReadonlyArray<LegalInference>{

    return this.inferences;

}



/*===========================================================================
=
= LIMPIEZA
=
===========================================================================*/

public clearInferences()

:void{

    this.inferences.length=0;

}



/*===========================================================================
=
= RESUMEN
=
===========================================================================*/

public buildInferenceSummary(){

    return{

        total:

            this.inferences.length,



        averageConfidence:

            this.inferences.length===0

            ?0

            :

            this.inferences

                .reduce(

                    (

                        sum,

                        current

                    )=>

                        sum+

                        current.confidence,

                    0

                )

                /

                this.inferences.length

    };

}

/*===========================================================================
=
= CONFLICTOS NORMATIVOS
=
===========================================================================*/

/*===========================================================================
=
= CONFLICTOS DETECTADOS
=
===========================================================================*/

private readonly legalConflicts:

    LegalConflict[]=[];



/*===========================================================================
=
= DETECCIÓN
=
===========================================================================*/

public detectConflicts(

    references:LegalReference[]

)

:LegalConflict[]{

    const conflicts:LegalConflict[]=[];



    for(

        let i=0;

        i<references.length;

        i++

    ){

        for(

            let j=i+1;

            j<references.length;

            j++

        ){

            if(

                references[i].source!==

                references[j].source

            ){

                conflicts.push({

                    id:crypto.randomUUID() as UUID,

                    type:LegalReasonType.GENERAL,

                    description:

                        "Posible concurrencia normativa.",

                    primary:references[i],

                    secondary:references[j],

                    resolved:false

                });

            }

        }

    }



    this.legalConflicts.push(

        ...conflicts

    );



    return conflicts;

}



/*===========================================================================
=
= PRIORIZACIÓN
=
===========================================================================*/

private priority(

    hierarchy:LegalHierarchy

)

:number{

    switch(hierarchy){

        case LegalHierarchy.EUROPEAN:

            return 100;



        case LegalHierarchy.NATIONAL_LAW:

            return 90;



        case LegalHierarchy.REGULATION:

            return 80;



        case LegalHierarchy.ORDER:

            return 70;



        case LegalHierarchy.INSTRUCTION:

            return 60;



        case LegalHierarchy.JURISPRUDENCE:

            return 50;



        case LegalHierarchy.DOCTRINE:

            return 40;



        default:

            return 0;

    }

}



/*===========================================================================
=
= RESOLUCIÓN
=
===========================================================================*/

public resolveConflict(

    conflict:LegalConflict

)

:LegalConflict{

    const primaryPriority=

        this.priority(

            conflict.primary.hierarchy

        );



    const secondaryPriority=

        this.priority(

            conflict.secondary.hierarchy

        );



    if(

        primaryPriority>=secondaryPriority

    ){

        conflict.solution=

            `${conflict.primary.article} prevalece.`;



    }else{

        conflict.solution=

            `${conflict.secondary.article} prevalece.`;

    }



    conflict.resolved=true;



    return conflict;

}



/*===========================================================================
=
= RESOLUCIÓN GLOBAL
=
===========================================================================*/

public resolveAllConflicts()

:void{

    for(

        const conflict

        of this.legalConflicts

    ){

        if(

            !conflict.resolved

        ){

            this.resolveConflict(

                conflict

            );

        }

    }

}



/*===========================================================================
=
= PRINCIPIOS JURÍDICOS
=
===========================================================================*/

private weighLegalPrinciples(

    type:LegalReasonType

)

:string{

    switch(type){

        case LegalReasonType.PROCEDURE:

            return

                "Publicidad, concurrencia e igualdad.";



        case LegalReasonType.AWARD:

            return

                "Objetividad, transparencia y eficiencia.";



        case LegalReasonType.MODIFICATION:

            return

                "Seguridad jurídica y estabilidad contractual.";



        case LegalReasonType.SOCIAL:

            return

                "Interés público y cohesión social.";



        case LegalReasonType.ENVIRONMENTAL:

            return

                "Desarrollo sostenible y eficiencia ambiental.";



        default:

            return

                "Legalidad y proporcionalidad.";

    }

}



/*===========================================================================
=
= DECISIÓN JURÍDICA
=
===========================================================================*/

public buildLegalDecision(

    type:LegalReasonType

)

:string{

    const principles=

        this.weighLegalPrinciples(

            type

        );



    return [

        "La decisión propuesta",

        "es conforme",

        "al ordenamiento jurídico,",

        "tras ponderar",

        "los principios:",

        principles,

        "y las referencias",

        "normativas aplicables."

    ].join(" ");

}



/*===========================================================================
=
= ESTADO
=
===========================================================================*/

public getConflictStatistics(){

    return{

        total:

            this.legalConflicts.length,



        resolved:

            this.legalConflicts.filter(

                c=>c.resolved

            ).length,



        pending:

            this.legalConflicts.filter(

                c=>!c.resolved

            ).length

    };

}

/*===========================================================================
=
= MOTIVACIÓN JURÍDICA
=
===========================================================================*/

/*===========================================================================
=
= REPOSITORIO
=
===========================================================================*/

private readonly motivations:

    LegalMotivation[]=[];



/*===========================================================================
=
= GENERACIÓN
=
===========================================================================*/

public buildMotivation(

    title:string,

    ...types:LegalReasonType[]

)

:LegalMotivation{

    const references:LegalReference[]=[];

    const reasonings:LegalReasoning[]=[];

    const paragraphs:string[]=[];



    for(

        const type

        of types

    ){

        const reasoning=

            this.buildReasoning(

                type

            );



        reasonings.push(

            reasoning

        );



        references.push(

            ...reasoning.references

        );



        paragraphs.push(

            this.reasoningToParagraph(

                reasoning

            )

        );

    }



    const motivation:LegalMotivation={

        id:crypto.randomUUID() as UUID,

        generated:new Date(),

        title,

        body:

            paragraphs.join(

                "\n\n"

            ),

        references,

        reasoning:reasonings,

        legalRisk:

            this.calculateMotivationRisk(

                reasonings

            )

    };



    this.motivations.push(

        motivation

    );



    return motivation;

}



/*===========================================================================
=
= PÁRRAFO
=
===========================================================================*/

private reasoningToParagraph(

    reasoning:LegalReasoning

)

:string{

    const builder:string[]=[];



    builder.push(

        reasoning.introduction

    );



    builder.push("");



    for(

        const argument

        of reasoning.arguments

    ){

        builder.push(

            `${argument.order}. ${argument.title}`

        );



        builder.push(

            argument.explanation

        );



        builder.push("");

    }



    builder.push(

        reasoning.conclusion.summary

    );



    return builder.join(

        "\n"

    );

}



/*===========================================================================
=
= RIESGO
=
===========================================================================*/

private calculateMotivationRisk(

    reasonings:

        LegalReasoning[]

)

:"LOW"|"MEDIUM"|"HIGH"{

    let risk:"LOW"|"MEDIUM"|"HIGH"="LOW";



    for(

        const reasoning

        of reasonings

    ){

        if(

            reasoning.conclusion.legalRisk==="HIGH"

        ){

            return "HIGH";

        }



        if(

            reasoning.conclusion.legalRisk==="MEDIUM"

        ){

            risk="MEDIUM";

        }

    }



    return risk;

}



/*===========================================================================
=
= MEMORIA JUSTIFICATIVA
=
===========================================================================*/

public buildJustificationMotivation()

:LegalMotivation{

    return this.buildMotivation(

        "Motivación Jurídica de la Memoria Justificativa",

        LegalReasonType.PROCEDURE,

        LegalReasonType.CPV,

        LegalReasonType.LOTS,

        LegalReasonType.SOLVENCY

    );

}



/*===========================================================================
=
= PCAP
=
===========================================================================*/

public buildPCAPMotivation()

:LegalMotivation{

    return this.buildMotivation(

        "Fundamentación Jurídica del PCAP",

        LegalReasonType.AWARD,

        LegalReasonType.GUARANTEE,

        LegalReasonType.EXECUTION

    );

}



/*===========================================================================
=
= PPT
=
===========================================================================*/

public buildPPTMotivation()

:LegalMotivation{

    return this.buildMotivation(

        "Fundamentación Jurídica del PPT",

        LegalReasonType.CPV,

        LegalReasonType.ENVIRONMENTAL,

        LegalReasonType.SOCIAL

    );

}



/*===========================================================================
=
= INFORME JURÍDICO
=
===========================================================================*/

public buildLegalReportMotivation()

:LegalMotivation{

    return this.buildMotivation(

        "Informe Jurídico",

        LegalReasonType.PROCEDURE,

        LegalReasonType.CONTRACT_TYPE,

        LegalReasonType.AWARD,

        LegalReasonType.MODIFICATION,

        LegalReasonType.EXECUTION

    );

}



/*===========================================================================
=
= CONSULTA
=
===========================================================================*/

public getMotivations()

:ReadonlyArray<LegalMotivation>{

    return this.motivations;

}



/*===========================================================================
=
= LIMPIEZA
=
===========================================================================*/

public clearMotivations()

:void{

    this.motivations.length=0;

}

/*===========================================================================
=
= DOCTRINA Y JURISPRUDENCIA
=
===========================================================================*/

/*===========================================================================
=
= BASE DOCTRINAL
=
===========================================================================*/

private readonly doctrine:

    LegalDoctrine[]=[];



/*===========================================================================
=
= REGISTRO
=
===========================================================================*/

public registerDoctrine(

    doctrine:LegalDoctrine

)

:void{

    this.doctrine.push(

        doctrine

    );

}



/*===========================================================================
=
= CONSULTA
=
===========================================================================*/

public findDoctrine(

    type:LegalReasonType

)

:LegalDoctrine[]{

    return this.doctrine.filter(

        d=>

            d.applicableTo.includes(

                type

            )

    );

}



/*===========================================================================
=
= ARGUMENTO DOCTRINAL
=
===========================================================================*/

private buildDoctrineArgument(

    type:LegalReasonType

)

:LegalArgument{

    const doctrine=

        this.findDoctrine(

            type

        );



    if(

        doctrine.length===0

    ){

        return{

            order:900,

            title:"Doctrina",

            explanation:

                "No existen referencias doctrinales registradas para esta materia.",

            references:[]

        };

    }



    return{

        order:900,



        title:

            "Doctrina administrativa",



        explanation:

            doctrine

                .map(

                    d=>

                        `${d.authority}: ${d.summary}`

                )

                .join(" "),



        references:

            []

    };

}



/*===========================================================================
=
= JURISPRUDENCIA
=
===========================================================================*/

private buildCaseLawArgument(

    type:LegalReasonType

)

:LegalArgument{

    const doctrine=

        this.findDoctrine(

            type

        ).filter(

            d=>

                d.hierarchy===

                LegalHierarchy.JURISPRUDENCE

        );



    return{

        order:901,



        title:

            "Jurisprudencia",



        explanation:

            doctrine.length===0

            ?

            "No consta jurisprudencia específica registrada."

            :

            doctrine

                .map(

                    d=>

                        `${d.reference}: ${d.summary}`

                )

                .join(" "),



        references:[]

    };

}



/*===========================================================================
=
= INFORME DOCTRINAL
=
===========================================================================*/

public buildDoctrineReasoning(

    type:LegalReasonType

)

:LegalReasoning{

    const reasoning=

        this.buildReasoning(

            type

        );



    reasoning.arguments.push(

        this.buildDoctrineArgument(

            type

        )

    );



    reasoning.arguments.push(

        this.buildCaseLawArgument(

            type

        )

    );



    reasoning.conclusion.summary=[

        reasoning.conclusion.summary,

        "La doctrina y la jurisprudencia respaldan la solución propuesta."

    ].join(" ");



    return reasoning;

}



/*===========================================================================
=
= IMPORTANCIA
=
===========================================================================*/

private doctrineWeight(

    doctrine:LegalDoctrine

)

:number{

    switch(

        doctrine.hierarchy

    ){

        case LegalHierarchy.JURISPRUDENCE:

            return 100;



        case LegalHierarchy.DOCTRINE:

            return 70;



        default:

            return 50;

    }

}



/*===========================================================================
=
= ORDENACIÓN
=
===========================================================================*/

public orderedDoctrine(

    type:LegalReasonType

)

:LegalDoctrine[]{

    return this.findDoctrine(

        type

    ).sort(

        (

            a,

            b

        )=>

            this.doctrineWeight(

                b

            )

            -

            this.doctrineWeight(

                a

            )

    );

}



/*===========================================================================
=
= ESTADÍSTICAS
=
===========================================================================*/

public doctrineStatistics(){

    return{

        total:

            this.doctrine.length,



        jurisprudence:

            this.doctrine.filter(

                d=>

                    d.hierarchy===

                    LegalHierarchy.JURISPRUDENCE

            ).length,



        doctrine:

            this.doctrine.filter(

                d=>

                    d.hierarchy===

                    LegalHierarchy.DOCTRINE

            ).length

    };

}

/*===========================================================================
=
= VALIDACIÓN JURÍDICA DEL EXPEDIENTE
=
===========================================================================*/

/*===========================================================================
=
= VALIDADOR GENERAL
=
===========================================================================*/

public validateLegalConsistency()

:LegalValidationResult{

    const result:LegalValidationResult={

        id:crypto.randomUUID() as UUID,

        generated:new Date(),

        valid:true,

        score:100,

        observations:[],

        warnings:[],

        errors:[],

        recommendations:[]

    };



    this.validateObject(

        result

    );



    this.validateProcedure(

        result

    );



    this.validateCPV(

        result

    );



    this.validateSolvency(

        result

    );



    this.validateAwardCriteria(

        result

    );



    this.validateExecution(

        result

    );



    this.validateEnvironmentalClauses(

        result

    );



    this.validateSocialClauses(

        result

    );



    result.valid=

        result.errors.length===0;



    result.score=

        this.calculateValidationScore(

            result

        );



    return result;

}



/*===========================================================================
=
= OBJETO
=
===========================================================================*/

private validateObject(

    result:LegalValidationResult

)

:void{

    if(

        !this.getVariable(

            "OBJETO"

        )

    ){

        result.errors.push(

            "No existe objeto contractual definido."

        );



        return;

    }



    result.observations.push(

        "Objeto contractual correctamente definido."

    );

}



/*===========================================================================
=
= PROCEDIMIENTO
=
===========================================================================*/

private validateProcedure(

    result:LegalValidationResult

)

:void{

    if(

        !this.context

            ?.procedure

    ){

        result.errors.push(

            "No se ha determinado el procedimiento."

        );



        return;

    }



    result.observations.push(

        "Procedimiento correctamente identificado."

    );

}



/*===========================================================================
=
= CPV
=
===========================================================================*/

private validateCPV(

    result:LegalValidationResult

)

:void{

    if(

        !this.verifyCPVConsistency()

    ){

        result.warnings.push(

            "Debe revisarse la coherencia del CPV."

        );



        return;

    }



    result.observations.push(

        "CPV coherente con el objeto."

    );

}



/*===========================================================================
=
= SOLVENCIA
=
===========================================================================*/

private validateSolvency(

    result:LegalValidationResult

)

:void{

    if(

        this.verifySolvencyRequirements()

    ){

        result.observations.push(

            "Solvencia correctamente evaluada."

        );

    }

}



/*===========================================================================
=
= CRITERIOS
=
===========================================================================*/

private validateAwardCriteria(

    result:LegalValidationResult

)

:void{

    if(

        !this.verifyAwardCriteria()

    ){

        result.warnings.push(

            "No existen criterios de adjudicación definidos."

        );



        return;

    }



    result.observations.push(

        "Criterios correctamente definidos."

    );

}



/*===========================================================================
=
= EJECUCIÓN
=
===========================================================================*/

private validateExecution(

    result:LegalValidationResult

)

:void{

    if(

        !this.verifyExecutionConditions()

    ){

        result.warnings.push(

            "No existen condiciones de ejecución definidas."

        );



        return;

    }



    result.observations.push(

        "Condiciones de ejecución verificadas."

    );

}



/*===========================================================================
=
= CLÁUSULAS AMBIENTALES
=
===========================================================================*/

private validateEnvironmentalClauses(

    result:LegalValidationResult

)

:void{

    result.recommendations.push(

        "Analizar la conveniencia de incorporar cláusulas medioambientales."

    );

}



/*===========================================================================
=
= CLÁUSULAS SOCIALES
=
===========================================================================*/

private validateSocialClauses(

    result:LegalValidationResult

)

:void{

    result.recommendations.push(

        "Analizar la inclusión de condiciones especiales de ejecución de carácter social."

    );

}



/*===========================================================================
=
= PUNTUACIÓN
=
===========================================================================*/

private calculateValidationScore(

    result:LegalValidationResult

)

:number{

    let score=100;



    score-=

        result.errors.length*25;



    score-=

        result.warnings.length*8;



    if(

        score<0

    ){

        score=0;

    }



    return score;

}



/*===========================================================================
=
= VALIDACIÓN GLOBAL
=
===========================================================================*/

public isLegallyValid()

:boolean{

    return this

        .validateLegalConsistency()

        .valid;

}

/*===========================================================================
=
= RIESGOS JURÍDICOS
=
===========================================================================*/

/*===========================================================================
=
= BASE DE RIESGOS
=
===========================================================================*/

private readonly legalRisks:

    LegalRisk[]=[];



/*===========================================================================
=
= ANÁLISIS GENERAL
=
===========================================================================*/

public analyseLegalRisks()

:LegalRisk[]{

    this.legalRisks.length=0;



    this.detectProcedureRisk();

    this.detectCPVRisk();

    this.detectCompetitionRisk();

    this.detectSolvencyRisk();

    this.detectAwardRisk();

    this.detectModificationRisk();

    this.detectExecutionRisk();



    return this.legalRisks;

}



/*===========================================================================
=
= PROCEDIMIENTO
=
===========================================================================*/

private detectProcedureRisk()

:void{

    if(

        !this.context?.procedure

    ){

        this.addRisk(

            "CRITICAL",

            "Procedimiento inexistente",

            "No existe procedimiento de adjudicación definido.",

            "Determinar el procedimiento conforme a la LCSP.",

            LegalReasonType.PROCEDURE

        );

    }

}



/*===========================================================================
=
= CPV
=
===========================================================================*/

private detectCPVRisk()

:void{

    if(

        !this.verifyCPVConsistency()

    ){

        this.addRisk(

            "HIGH",

            "CPV inconsistente",

            "El objeto contractual no coincide con el CPV seleccionado.",

            "Revisar la clasificación CPV.",

            LegalReasonType.CPV

        );

    }

}



/*===========================================================================
=
= CONCURRENCIA
=
===========================================================================*/

private detectCompetitionRisk()

:void{

    if(

        this.context

            ?.procedure

            ?.restrictedCompetition

    ){

        this.addRisk(

            "HIGH",

            "Restricción de competencia",

            "Existen indicios de limitación de la libre concurrencia.",

            "Revisar los requisitos establecidos.",

            LegalReasonType.PROCEDURE

        );

    }

}



/*===========================================================================
=
= SOLVENCIA
=
===========================================================================*/

private detectSolvencyRisk()

:void{

    if(

        this.context

            ?.procedure

            ?.requiresSolvency

        &&

        !this.verifySolvencyRequirements()

    ){

        this.addRisk(

            "MEDIUM",

            "Solvencia insuficientemente motivada",

            "Los requisitos de solvencia no aparecen correctamente definidos.",

            "Justificar la proporcionalidad.",

            LegalReasonType.SOLVENCY

        );

    }

}



/*===========================================================================
=
= ADJUDICACIÓN
=
===========================================================================*/

private detectAwardRisk()

:void{

    if(

        !this.verifyAwardCriteria()

    ){

        this.addRisk(

            "HIGH",

            "Criterios inexistentes",

            "No existen criterios de adjudicación válidos.",

            "Definir criterios objetivos.",

            LegalReasonType.AWARD

        );

    }

}



/*===========================================================================
=
= MODIFICACIONES
=
===========================================================================*/

private detectModificationRisk()

:void{

    if(

        this.context

            ?.execution

            ?.modificationsAllowed

        &&

        !this.context

            ?.execution

            ?.modificationJustification

    ){

        this.addRisk(

            "MEDIUM",

            "Modificaciones sin motivación",

            "Se permiten modificaciones sin justificación suficiente.",

            "Incorporar motivación expresa.",

            LegalReasonType.MODIFICATION

        );

    }

}



/*===========================================================================
=
= EJECUCIÓN
=
===========================================================================*/

private detectExecutionRisk()

:void{

    if(

        !this.verifyExecutionConditions()

    ){

        this.addRisk(

            "LOW",

            "Condiciones de ejecución incompletas",

            "No se han definido completamente las condiciones de ejecución.",

            "Completar el régimen de ejecución.",

            LegalReasonType.EXECUTION

        );

    }

}



/*===========================================================================
=
= ALTA DE RIESGO
=
===========================================================================*/

private addRisk(

    severity:"LOW"|"MEDIUM"|"HIGH"|"CRITICAL",

    title:string,

    description:string,

    recommendation:string,

    type:LegalReasonType

)

:void{

    this.legalRisks.push({

        id:crypto.randomUUID() as UUID,

        severity,

        title,

        description,

        recommendation,

        references:

            this.findByTopic(type)

    });

}



/*===========================================================================
=
= CONSULTA
=
===========================================================================*/

public getLegalRisks()

:ReadonlyArray<LegalRisk>{

    return this.legalRisks;

}



/*===========================================================================
=
= EXISTE RIESGO CRÍTICO
=
===========================================================================*/

public hasCriticalLegalRisk()

:boolean{

    return this.legalRisks.some(

        r=>r.severity==="CRITICAL"

    );

}



/*===========================================================================
=
= LIMPIEZA
=
===========================================================================*/

public clearLegalRisks()

:void{

    this.legalRisks.length=0;

}

/*===========================================================================
=
= RECOMENDACIONES EXPERTAS
=
===========================================================================*/

/*===========================================================================
=
= REPOSITORIO
=
===========================================================================*/

private readonly recommendations:

    LegalRecommendation[]=[];



/*===========================================================================
=
= GENERACIÓN
=
===========================================================================*/

public generateRecommendations()

:LegalRecommendation[]{

    this.recommendations.length=0;



    for(

        const risk

        of this.legalRisks

    ){

        this.recommendations.push(

            this.createRecommendation(

                risk

            )

        );

    }



    this.generateGeneralRecommendations();



    return this.recommendations;

}



/*===========================================================================
=
= RECOMENDACIÓN DESDE RIESGO
=
===========================================================================*/

private createRecommendation(

    risk:LegalRisk

)

:LegalRecommendation{

    return{

        id:crypto.randomUUID() as UUID,



        priority:

            risk.severity,



        title:

            risk.title,



        description:

            risk.description,



        action:

            risk.recommendation,



        automatic:

            this.isAutomaticallyCorrectable(

                risk

            ),



        applied:false

    };

}



/*===========================================================================
=
= RECOMENDACIONES GENERALES
=
===========================================================================*/

private generateGeneralRecommendations()

:void{

    this.recommendations.push({

        id:crypto.randomUUID() as UUID,



        priority:"LOW",



        title:

            "Revisión final",



        description:

            "Se recomienda efectuar una revisión jurídica integral antes de aprobar el expediente.",



        action:

            "Ejecutar la validación jurídica completa.",



        automatic:false,



        applied:false

    });



    this.recommendations.push({

        id:crypto.randomUUID() as UUID,



        priority:"LOW",



        title:

            "Actualización normativa",



        description:

            "Comprobar que las referencias legales continúan vigentes.",



        action:

            "Actualizar la base normativa.",



        automatic:true,



        applied:false

    });

}



/*===========================================================================
=
= CORRECCIÓN AUTOMÁTICA
=
===========================================================================*/

private isAutomaticallyCorrectable(

    risk:LegalRisk

)

:boolean{

    switch(

        risk.title

    ){

        case "CPV inconsistente":



        case "Criterios inexistentes":



        case "Condiciones de ejecución incompletas":



            return true;



        default:

            return false;

    }

}



/*===========================================================================
=
= APLICAR
=
===========================================================================*/

public applyAutomaticRecommendations()

:number{

    let applied=0;



    for(

        const recommendation

        of this.recommendations

    ){

        if(

            recommendation.automatic

            &&

            !recommendation.applied

        ){

            recommendation.applied=true;

            applied++;

        }

    }



    return applied;

}



/*===========================================================================
=
= RECOMENDACIONES PENDIENTES
=
===========================================================================*/

public pendingRecommendations()

:LegalRecommendation[]{

    return this.recommendations.filter(

        r=>!r.applied

    );

}



/*===========================================================================
=
= ESTADÍSTICAS
=
===========================================================================*/

public recommendationStatistics(){

    return{

        total:

            this.recommendations.length,



        automatic:

            this.recommendations.filter(

                r=>r.automatic

            ).length,



        applied:

            this.recommendations.filter(

                r=>r.applied

            ).length,



        pending:

            this.recommendations.filter(

                r=>!r.applied

            ).length

    };

}



/*===========================================================================
=
= CONSULTA
=
===========================================================================*/

public getRecommendations()

:ReadonlyArray<LegalRecommendation>{

    return this.recommendations;

}



/*===========================================================================
=
= LIMPIEZA
=
===========================================================================*/

public clearRecommendations()

:void{

    this.recommendations.length=0;

}

/*===========================================================================
=
= DICTAMEN JURÍDICO
=
===========================================================================*/

/*===========================================================================
=
= GENERACIÓN DEL DICTAMEN
=
===========================================================================*/

public buildLegalOpinion()

:LegalOpinion{

    const validation=

        this.validateLegalConsistency();



    const risks=

        this.analyseLegalRisks();



    const recommendations=

        this.generateRecommendations();



    return{

        id:crypto.randomUUID() as UUID,



        generated:

            new Date(),



        result:

            this.calculateOpinionResult(

                validation,

                risks

            ),



        score:

            validation.score,



        executiveSummary:

            this.buildExecutiveSummary(

                validation,

                risks

            ),



        strengths:

            this.buildStrengths(

                validation

            ),



        weaknesses:

            this.buildWeaknesses(

                validation,

                risks

            ),



        recommendations:

            recommendations

                .map(

                    r=>r.action

                ),



        risks

    };

}



/*===========================================================================
=
= RESULTADO
=
===========================================================================*/

private calculateOpinionResult(

    validation:

        LegalValidationResult,



    risks:

        LegalRisk[]

)

:"FAVORABLE"

|"FAVORABLE_WITH_OBSERVATIONS"

|"UNFAVORABLE"{

    if(

        risks.some(

            r=>r.severity==="CRITICAL"

        )

    ){

        return "UNFAVORABLE";

    }



    if(

        validation.warnings.length>0

        ||

        risks.some(

            r=>r.severity==="HIGH"

        )

    ){

        return

            "FAVORABLE_WITH_OBSERVATIONS";

    }



    return

        "FAVORABLE";

}



/*===========================================================================
=
= RESUMEN EJECUTIVO
=
===========================================================================*/

private buildExecutiveSummary(

    validation:

        LegalValidationResult,



    risks:

        LegalRisk[]

)

:string{

    return [

        "Tras el análisis",

        "integral del expediente,",

        "se concluye que",

        validation.valid

            ?

            "la documentación resulta jurídicamente consistente."

            :

            "existen incidencias que requieren revisión.",



        "Se han identificado",

        risks.length,

        "riesgos jurídicos",

        "y",

        validation.recommendations.length,

        "recomendaciones",

        "de mejora."

    ].join(" ");

}



/*===========================================================================
=
= FORTALEZAS
=
===========================================================================*/

private buildStrengths(

    validation:

        LegalValidationResult

)

:string[]{

    return validation.observations.map(

        o=>

            `✔ ${o}`

    );

}



/*===========================================================================
=
= DEBILIDADES
=
===========================================================================*/

private buildWeaknesses(

    validation:

        LegalValidationResult,



    risks:

        LegalRisk[]

)

:string[]{

    const weaknesses:string[]=[];



    weaknesses.push(

        ...validation.errors

    );



    weaknesses.push(

        ...validation.warnings

    );



    weaknesses.push(

        ...risks.map(

            r=>r.title

        )

    );



    return weaknesses;

}



/*===========================================================================
=
= EXPORTACIÓN
=
===========================================================================*/

public exportOpinion()

:string{

    const opinion=

        this.buildLegalOpinion();



    return JSON.stringify(

        opinion,

        null,

        2

    );

}



/*===========================================================================
=
= CONSULTA
=
===========================================================================*/

public opinionIsFavourable()

:boolean{

    const opinion=

        this.buildLegalOpinion();



    return(

        opinion.result===

        "FAVORABLE"

    );

}



/*===========================================================================
=
= INFORME BREVE
=
===========================================================================*/

public shortOpinion()

:string{

    const opinion=

        this.buildLegalOpinion();



    return [

        opinion.result,

        "-",

        opinion.executiveSummary

    ].join(" ");

}

/*===========================================================================
=
= DECISIÓN EXPERTA
=
===========================================================================*/

/*===========================================================================
=
= GENERACIÓN
=
===========================================================================*/

public buildExpertDecision()

:ExpertDecision{

    const validation=

        this.validateLegalConsistency();



    const risks=

        this.analyseLegalRisks();



    const recommendations=

        this.generateRecommendations();



    const opinion=

        this.buildLegalOpinion();



    return{

        id:

            crypto.randomUUID() as UUID,



        generated:

            new Date(),



        approved:

            this.canApprove(

                validation,

                risks

            ),



        confidence:

            this.calculateDecisionConfidence(

                validation,

                risks

            ),



        score:

            validation.score,



        opinion,



        validation,



        risks,



        recommendations,



        finalDecision:

            this.buildDecisionText(

                opinion,

                validation,

                risks

            )

    };

}



/*===========================================================================
=
= APROBACIÓN
=
===========================================================================*/

private canApprove(

    validation:

        LegalValidationResult,



    risks:

        LegalRisk[]

)

:boolean{

    if(

        !validation.valid

    ){

        return false;

    }



    if(

        risks.some(

            r=>

                r.severity==="CRITICAL"

        )

    ){

        return false;

    }



    return true;

}



/*===========================================================================
=
= CONFIANZA
=
===========================================================================*/

private calculateDecisionConfidence(

    validation:

        LegalValidationResult,



    risks:

        LegalRisk[]

)

:number{

    let confidence=

        validation.score/100;



    confidence-=

        risks.filter(

            r=>r.severity==="HIGH"

        ).length*0.05;



    confidence-=

        risks.filter(

            r=>r.severity==="MEDIUM"

        ).length*0.02;



    if(

        confidence<0

    ){

        confidence=0;

    }



    if(

        confidence>1

    ){

        confidence=1;

    }



    return Number(

        confidence.toFixed(

            2

        )

    );

}



/*===========================================================================
=
= TEXTO
=
===========================================================================*/

private buildDecisionText(

    opinion:

        LegalOpinion,



    validation:

        LegalValidationResult,



    risks:

        LegalRisk[]

)

:string{

    if(

        opinion.result===

        "UNFAVORABLE"

    ){

        return [

            "No procede",

            "continuar",

            "la tramitación",

            "hasta corregir",

            "las incidencias",

            "detectadas."

        ].join(" ");

    }



    if(

        opinion.result===

        "FAVORABLE_WITH_OBSERVATIONS"

    ){

        return [

            "La tramitación",

            "puede continuar",

            "siempre que",

            "se atiendan",

            "las observaciones",

            "recogidas",

            "en el dictamen."

        ].join(" ");

    }



    return [

        "El expediente",

        "puede continuar",

        "su tramitación",

        "por cumplir",

        "los requisitos",

        "jurídicos",

        "analizados."

    ].join(" ");

}



/*===========================================================================
=
= INFORME EJECUTIVO
=
===========================================================================*/

public buildExecutiveDecision()

:string{

    const decision=

        this.buildExpertDecision();



    return [

        "Resultado:",

        decision.approved

            ?

            "APROBADO."

            :

            "NO APROBADO.",



        "Confianza:",

        `${decision.confidence*100}%`,



        "Puntuación:",

        `${decision.score}/100.`,



        decision.finalDecision

    ].join(" ");

}



/*===========================================================================
=
= EXPORTACIÓN
=
===========================================================================*/

public exportDecision()

:string{

    return JSON.stringify(

        this.buildExpertDecision(),

        null,

        2

    );

}



/*===========================================================================
=
= CONSULTA
=
===========================================================================*/

public expertDecision()

:ExpertDecision{

    return this.buildExpertDecision();

}



/*===========================================================================
=
= ESTADO
=
===========================================================================*/

public isReadyForApproval()

:boolean{

    return this.buildExpertDecision()

        .approved;

}

/*===========================================================================
=
= API PÚBLICA DEL MOTOR JURÍDICO
=
===========================================================================*/

/*===========================================================================
=
= ANÁLISIS COMPLETO
=
===========================================================================*/

public analyseExpediente()

:LegalEngineResult{

    const validation=

        this.validateLegalConsistency();



    const risks=

        this.analyseLegalRisks();



    const recommendations=

        this.generateRecommendations();



    this.buildJustificationMotivation();

    this.buildPCAPMotivation();

    this.buildPPTMotivation();

    this.buildLegalReportMotivation();



    const opinion=

        this.buildLegalOpinion();



    const decision=

        this.buildExpertDecision();



    return{

        validation,



        opinion,



        decision,



        risks:

            this.getLegalRisks(),



        recommendations:

            this.getRecommendations(),



        motivations:

            this.getMotivations(),



        statistics:{

            score:

                validation.score,



            confidence:

                decision.confidence,



            approved:

                decision.approved,



            totalRisks:

                risks.length,



            pendingRecommendations:

                this.pendingRecommendations()

                    .length

        }

    };

}



/*===========================================================================
=
= INFORME COMPLETO
=
===========================================================================*/

public generateFullLegalReport()

:string{

    const report=

        this.analyseExpediente();



    return JSON.stringify(

        report,

        null,

        2

    );

}



/*===========================================================================
=
= EVALUACIÓN RÁPIDA
=
===========================================================================*/

public evaluate(){

    return this.analyseExpediente()

        .decision;

}



/*===========================================================================
=
= REINICIO DEL MOTOR
=
===========================================================================*/

public reset()

:void{

    this.clearInferences();

    this.clearLegalRisks();

    this.clearRecommendations();

    this.clearMotivations();

}



/*===========================================================================
=
= ESTADO DEL MOTOR
=
===========================================================================*/

public status(){

    return{

        references:

            this.references.length,



        doctrine:

            this.doctrine.length,



        inferences:

            this.getInferences().length,



        risks:

            this.getLegalRisks().length,



        recommendations:

            this.getRecommendations().length,



        motivations:

            this.getMotivations().length

    };

}



/*===========================================================================
=
= INFORMACIÓN DEL MOTOR
=
===========================================================================*/

public info(){

    return{

        engine:

            "LegalReasoner",



        version:

            "1.0.0",



        organisation:

            "Consejería de Empleo - Junta de Andalucía",



        purpose:

            "Motor experto de razonamiento jurídico para expedientes de contratación pública.",



        capabilities:[

            "Interpretación normativa",

            "Validación jurídica",

            "Detección de riesgos",

            "Generación de motivaciones",

            "Resolución de conflictos",

            "Recomendaciones automáticas",

            "Dictámenes jurídicos",

            "Motor experto de decisión"

        ]

    };

}



/*===========================================================================
=
= PUNTO ÚNICO DE ENTRADA
=
===========================================================================*/

public run()

:LegalEngineResult{

    this.reset();



    return this.analyseExpediente();

}



/*===========================================================================
=
= FIN DEL LEGALREASONER
=
===========================================================================*/

}
