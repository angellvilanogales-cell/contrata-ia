/*****************************************************************************************
*
* CPVEngine.ts
*
* Motor Inteligente de Clasificación CPV
*
* Funciones principales
*
* • Gestión completa del catálogo CPV
* • Búsqueda semántica
* • IA de clasificación
* • Compatibilidad entre códigos
* • Recomendación automática
* • Relación con procedimientos LCSP
* • Relación con solvencia
* • Relación con criterios
* • Relación con cláusulas
*
******************************************************************************************/

import { randomUUID } from "crypto";

/*==============================================================================
=
= TIPOS BÁSICOS
=
==============================================================================*/

export type UUID = string;

export enum ContractType{

    WORKS="WORKS",

    SERVICES="SERVICES",

    SUPPLIES="SUPPLIES",

    MIXED="MIXED"

}

export enum CPVLevel{

    DIVISION=2,

    GROUP=3,

    CLASS=4,

    CATEGORY=5,

    CODE=8

}

export interface CPVCode{

    id:UUID;

    code:string;

    name:string;

    description:string;

    level:CPVLevel;

    contractType:ContractType;

    keywords:string[];

    parent?:string;

    children:string[];

}

/*==============================================================================
=
= RESULTADO DE BÚSQUEDA
=
==============================================================================*/

export interface CPVSearchResult{

    cpv:CPVCode;

    score:number;

    confidence:number;

}

/*==============================================================================
=
= MOTOR
=
==============================================================================*/

export interface CPVDetection{

    principal:CPVCode;

    alternatives:CPVCode[];

    confidence:number;

    analysedWords:string[];

}

export interface CPVValidation{

    valid:boolean;

    score:number;

    errors:string[];

    warnings:string[];

    suggestions:CPVCode[];

}

export interface CPVCompatibility{

    source:string;

    target:string;

    compatible:boolean;

    reason:string;

    priority:number;

}

export interface CPVProposal{

    principal:CPVCode;

    secondary:CPVCode[];

    confidence:number;

    justification:string;

    analysedTerms:string[];

}

export interface CPVContractConfiguration{

    cpv:string;

    contractType:ContractType;

    recommendedProcedure:string;

    divisionIntoLots:boolean;

    technicalSolvency:boolean;

    economicSolvency:boolean;

    environmentalClauses:boolean;

    socialClauses:boolean;

    qualityCriteria:boolean;

}

export interface CPVSolvencyConfiguration{

    cpv:string;

    requiresTechnicalSolvency:boolean;

    requiresEconomicSolvency:boolean;

    recommendedTechnicalMeans:string[];

    recommendedEconomicMeans:string[];

    recommendedAwardCriteria:string[];

    recommendedExecutionConditions:string[];

}

export interface CPVProcedureConfiguration{

    cpv:string;

    recommendedProcedure:string;

    allowsOpenProcedure:boolean;

    allowsSimplifiedProcedure:boolean;

    allowsRestrictedProcedure:boolean;

    allowsNegotiatedProcedure:boolean;

    allowsMinorContract:boolean;

    publicationRequired:boolean;

    europeanRegulation:boolean;

    observations:string[];

}

export interface CPVClauseConfiguration{

    cpv:string;

    socialClauses:string[];

    environmentalClauses:string[];

    innovationClauses:string[];

    accessibilityClauses:string[];

    equalityClauses:string[];

    mandatorySocial:boolean;

    mandatoryEnvironmental:boolean;

}

export interface CPVDocumentationConfiguration{

    cpv:string;

    requiredDocuments:string[];

    optionalDocuments:string[];

    technicalReports:string[];

    administrativeReports:string[];

    executionDocuments:string[];

}

export interface CPVResourcesConfiguration{

    cpv:string;

    humanResources:string[];

    materialResources:string[];

    machinery:string[];

    software:string[];

    certifications:string[];

    requiresProjectManager:boolean;

}

export interface CPVExecutionConfiguration{

    cpv:string;

    estimatedExecutionMonths:number;

    allowsExtensions:boolean;

    maximumExtensions:number;

    recommendedWarrantyMonths:number;

    requiresContractManager:boolean;

    periodicMonitoring:boolean;

    recommendedMilestones:string[];

    executionRisks:string[];

}

export interface CPVKPIConfiguration{

    cpv:string;

    indicators:string[];

    serviceLevelIndicators:string[];

    qualityIndicators:string[];

    environmentalIndicators:string[];

    economicIndicators:string[];

    periodicity:string;

}

export interface CPVRiskConfiguration{

    cpv:string;

    operationalRisks:string[];

    legalRisks:string[];

    economicRisks:string[];

    environmentalRisks:string[];

    contingencyMeasures:string[];

    monitoringActions:string[];

}

export interface CPVReuseConfiguration{

    cpv:string;

    reusableTemplates:string[];

    reusableReports:string[];

    reusablePPT:string[];

    reusablePCAP:string[];

    reusableCriteria:string[];

    reusableClauses:string[];

}

export interface CPVHistory{

    cpv:string;

    uses:number;

    successfulUses:number;

    rejectedUses:number;

    lastUse?:Date;

    averageConfidence:number;

}

export interface CPVBusinessRule{

    id:string;

    name:string;

    description:string;

    appliesTo:string[];

    severity:"INFO"|"WARNING"|"ERROR";

    validator:(cpv:CPVCode)=>boolean;

}

export interface RuleValidationResult{

    valid:boolean;

    messages:string[];

}

export interface CPVAuditResult{

    total:number;

    valid:number;

    invalid:number;

    duplicated:number;

    orphan:number;

    messages:string[];

}

export interface CPVEngineMetrics{

    totalSearches:number;

    successfulSearches:number;

    failedSearches:number;

    averageConfidence:number;

    averageSearchTime:number;

    lastExecution?:Date;

}

export class CPVEngine{

    private cpvDatabase:

        Map<string,CPVCode>

        =new Map();

    constructor(){

        this.initialize();

    }

    private initialize()

    :void{

        this.loadBaseCPV();

    }

    public register(

        cpv:CPVCode

    ):void{

        this.cpvDatabase.set(

            cpv.code,

            cpv

        );

    }

    public get(

        code:string

    ):CPVCode|undefined{

        return this.cpvDatabase.get(code);

    }

    public getAll()

    :CPVCode[]{

        return [

            ...this.cpvDatabase.values()

        ];

    }

    public size()

    :number{

        return this.cpvDatabase.size;

    }


/*==============================================================================
=
= CARGA INICIAL
=
==============================================================================*/

private loadBaseCPV()

:void{

    this.register({

        id:randomUUID(),

        code:"45000000",

        name:"Trabajos de construcción",

        description:

            "Contratos de obras.",

        level:

            CPVLevel.CODE,

        contractType:

            ContractType.WORKS,

        keywords:[

            "obra",

            "construcción",

            "edificio"

        ],

        children:[]

    });

    this.register({

        id:randomUUID(),

        code:"50000000",

        name:"Servicios de reparación y mantenimiento",

        description:

            "Servicios de mantenimiento.",

        level:

            CPVLevel.CODE,

        contractType:

            ContractType.SERVICES,

        keywords:[

            "mantenimiento",

            "reparación",

            "servicio"

        ],

        children:[]

    });

    this.register({

        id:randomUUID(),

        code:"39000000",

        name:"Mobiliario",

        description:

            "Suministro de mobiliario.",

        level:

            CPVLevel.CODE,

        contractType:

            ContractType.SUPPLIES,

        keywords:[

            "mesa",

            "silla",

            "mueble"

        ],

        children:[]

    });

}

/*****************************************************************************************
*
* FIN BLOQUE 1 de 24
*
* SIGUIENTE:
*
* CPVEngine.ts
*
* BLOQUE 2 de 24
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 2 de 24
*
* NORMALIZACIÓN Y BÚSQUEDA SEMÁNTICA
*
******************************************************************************************/

/*==============================================================================
=
= NORMALIZACIÓN
=
==============================================================================*/

private normalize(

    value:string

):string{

    return value

        .toLowerCase()

        .normalize("NFD")

        .replace(/[\u0300-\u036f]/g,"")

        .replace(/[.,;:()/_-]/g," ")

        .replace(/\s+/g," ")

        .trim();

}



/*==============================================================================
=
= TOKENIZACIÓN
=
==============================================================================*/

private tokenize(

    value:string

):string[]{

    return this

        .normalize(value)

        .split(" ")

        .filter(

            token=>token.length>2

        );

}



/*==============================================================================
=
= SIMILITUD
=
==============================================================================*/

private similarity(

    source:string[],

    target:string[]

):number{

    let score=0;

    for(

        const token

        of

        source

    ){

        if(

            target.includes(token)

        ){

            score++;

        }

    }

    return score;

}



/*==============================================================================
=
= TEXTO INDEXABLE
=
==============================================================================*/

private buildIndexText(

    cpv:CPVCode

):string{

    return [

        cpv.code,

        cpv.name,

        cpv.description,

        ...cpv.keywords

    ].join(" ");

}



/*==============================================================================
=
= BÚSQUEDA GENERAL
=
==============================================================================*/

public search(

    text:string

):CPVSearchResult[]{

    const query=

        this.tokenize(text);

    const results:CPVSearchResult[]=[];



    for(

        const cpv

        of

        this.cpvDatabase.values()

    ){

        const candidate=

            this.tokenize(

                this.buildIndexText(cpv)

            );



        const score=

            this.similarity(

                query,

                candidate

            );



        if(score>0){

            results.push({

                cpv,

                score,

                confidence:0

            });

        }

    }



    return this.calculateConfidence(

        results

    );

}



/*==============================================================================
=
= BÚSQUEDA POR CÓDIGO
=
==============================================================================*/

public searchByCode(

    code:string

):CPVCode|undefined{

    return this.cpvDatabase.get(

        code

    );

}



/*==============================================================================
=
= BÚSQUEDA POR PALABRA CLAVE
=
==============================================================================*/

public searchKeyword(

    keyword:string

):CPVCode[]{

    const value=

        this.normalize(keyword);



    return [

        ...this.cpvDatabase.values()

    ].filter(

        cpv=>

            cpv.keywords.some(

                word=>

                    this.normalize(word)

                    ===value

            )

    );

}

/*==============================================================================
=
= CÁLCULO DE CONFIANZA
=
==============================================================================*/

private calculateConfidence(

    results:CPVSearchResult[]

):CPVSearchResult[]{

    if(

        results.length===0

    ){

        return [];

    }



    const maxScore=

        Math.max(

            ...results.map(

                result=>result.score

            )

        );



    return results

        .map(

            result=>({

                ...result,

                confidence:

                    Math.round(

                        (result.score/maxScore)

                        *100

                    )

            })

        )

        .sort(

            (a,b)=>

                b.confidence-

                a.confidence

        );

}



/*****************************************************************************************
*
* FIN BLOQUE 2 de 24
*
* SIGUIENTE:
*
* CPVEngine.ts
*
* BLOQUE 3 de 24
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 3 de 24
*
* DETECCIÓN AUTOMÁTICA DEL CPV
*
******************************************************************************************/

/*==============================================================================
=
= RESULTADO IA
=
==============================================================================*/

/*==============================================================================
=
= DETECCIÓN PRINCIPAL
=
==============================================================================*/

public detectCPV(

    description:string

):CPVDetection|undefined{

    const results=

        this.search(description);



    if(

        results.length===0

    ){

        return undefined;

    }



    return{

        principal:

            results[0].cpv,



        alternatives:

            results

                .slice(1,5)

                .map(

                    r=>r.cpv

                ),



        confidence:

            results[0].confidence,



        analysedWords:

            this.tokenize(

                description

            )

    };

}



/*==============================================================================
=
= OBTENER CPV PRINCIPAL
=
==============================================================================*/

public detectMainCPV(

    description:string

):CPVCode|undefined{

    return this.detectCPV(

        description

    )?.principal;

}



/*==============================================================================
=
= OBTENER ALTERNATIVAS
=
==============================================================================*/

public detectAlternativeCPV(

    description:string

):CPVCode[]{

    return this.detectCPV(

        description

    )?.alternatives

    ??[];

}



/*==============================================================================
=
= EXISTE CPV
=
==============================================================================*/

public exists(

    code:string

):boolean{

    return this.cpvDatabase.has(

        code

    );

}



/*==============================================================================
=
= DESCRIPCIÓN
=
==============================================================================*/

public describe(

    code:string

):string{

    const cpv=

        this.get(code);



    if(

        !cpv

    ){

        return "CPV no encontrado.";

    }



    return [

        cpv.code,

        cpv.name,

        cpv.description

    ].join(" - ");

}



/*==============================================================================
=
= INFORME IA
=
==============================================================================*/

public detectionReport(

    description:string

):string{

    const detection=

        this.detectCPV(

            description

        );



    if(

        !detection

    ){

        return

        "No se ha encontrado un CPV adecuado.";

    }



    return [

        "CPV PRINCIPAL",

        detection.principal.code,

        detection.principal.name,

        "",

        "CONFIANZA",

        detection.confidence+" %",

        "",

        "ALTERNATIVAS",

        ...detection.alternatives.map(

            cpv=>

                cpv.code+

                " "+

                cpv.name

        )

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 3 de 24
*
* SIGUIENTE:
*
* CPVEngine.ts
*
* BLOQUE 4 de 24
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 4 de 24
*
* JERARQUÍA DEL CATÁLOGO CPV
*
******************************************************************************************/

/*==============================================================================
=
= OBTENER PADRE
=
==============================================================================*/

public getParent(

    code:string

):CPVCode|undefined{

    const cpv=

        this.get(code);



    if(

        !cpv ||

        !cpv.parent

    ){

        return undefined;

    }



    return this.get(

        cpv.parent

    );

}



/*==============================================================================
=
= OBTENER HIJOS
=
==============================================================================*/

public getChildren(

    code:string

):CPVCode[]{

    const cpv=

        this.get(code);



    if(

        !cpv

    ){

        return [];

    }



    return cpv.children

        .map(

            child=>

                this.get(child)

        )

        .filter(

            (item):item is CPVCode=>

                item!==undefined

        );

}



/*==============================================================================
=
= OBTENER ANCESTROS
=
==============================================================================*/

public getAncestors(

    code:string

):CPVCode[]{

    const ancestors:CPVCode[]=[];

    let current=

        this.getParent(code);



    while(current){

        ancestors.push(current);

        current=

            this.getParent(

                current.code

            );

    }



    return ancestors;

}



/*==============================================================================
=
= OBTENER DESCENDIENTES
=
==============================================================================*/

public getDescendants(

    code:string

):CPVCode[]{

    const descendants:CPVCode[]=[];



    const visit=(

        node:string

    ):void=>{

        const children=

            this.getChildren(node);



        for(

            const child

            of

            children

        ){

            descendants.push(child);

            visit(child.code);

        }

    };



    visit(code);



    return descendants;

}



/*==============================================================================
=
= MISMO NIVEL
=
==============================================================================*/

public getSameLevel(

    level:CPVLevel

):CPVCode[]{

    return

        [...this.cpvDatabase.values()]

        .filter(

            cpv=>

                cpv.level===level

        );

}



/*==============================================================================
=
= ÁRBOL COMPLETO
=
==============================================================================*/

public buildHierarchy(

    code:string

):CPVCode[]{

    const hierarchy:CPVCode[]=[];



    hierarchy.push(

        ...this.getAncestors(code)

    );



    const current=

        this.get(code);



    if(current){

        hierarchy.push(current);
    }



    hierarchy.push(

        ...this.getDescendants(code)

    );



    return hierarchy;

}



/*****************************************************************************************
*
* FIN BLOQUE 4 de 24
*
* SIGUIENTE:
*
* CPVEngine.ts
*
* BLOQUE 5 de 24
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 5 de 24
*
* VALIDACIÓN DEL CPV
*
******************************************************************************************/

/*==============================================================================
=
= RESULTADO DE VALIDACIÓN
=
==============================================================================*/

/*==============================================================================
=
= VALIDACIÓN GENERAL
=
==============================================================================*/

public validate(

    code:string

):CPVValidation{

    const errors:string[]=[];

    const warnings:string[]=[];

    const suggestions:CPVCode[]=[];

    const cpv=

        this.get(code);



    if(!cpv){

        errors.push(

            "El código CPV no existe."

        );

    }

    if(cpv){

        if(cpv.level!==CPVLevel.CODE){

            warnings.push(

                "No corresponde a un CPV final de ocho dígitos."

            );

        }

        suggestions.push(

            ...this.getChildren(code)

        );

    }

    return{

        valid:errors.length===0,

        score:

            this.calculateValidationScore(

                errors,

                warnings

            ),

        errors,

        warnings,

        suggestions

    };

}

/*==============================================================================
=
= PUNTUACIÓN
=
==============================================================================*/

private calculateValidationScore(

    errors:string[],

    warnings:string[]

):number{

    let score=100;

    score-=errors.length*40;

    score-=warnings.length*10;

    return Math.max(score,0);

}

/*==============================================================================
=
= VALIDAR DESCRIPCIÓN
=
==============================================================================*/

public validateDescription(

    description:string

):CPVValidation{

    const detected=

        this.detectCPV(description);



    if(!detected){

        return{

            valid:false,

            score:0,

            errors:[

                "No se ha podido identificar un CPV."

            ],

            warnings:[],

            suggestions:[]

        };

    }

    return this.validate(

        detected.principal.code

    );

}

/*==============================================================================
=
= ES CPV FINAL
=
==============================================================================*/

public isFinalCPV(

    code:string

):boolean{

    const cpv=

        this.get(code);

    return(

        cpv!==undefined &&

        cpv.level===CPVLevel.CODE

    );

}

/*==============================================================================
=
= ES COMPATIBLE
=
==============================================================================*/

public isCompatible(

    first:string,

    second:string

):boolean{

    if(first===second){

        return true;

    }

    const a=

        this.get(first);

    const b=

        this.get(second);

    if(!a||!b){

        return false;

    }

    return(

        a.contractType===

        b.contractType

    );

}

/*****************************************************************************************
*
* FIN BLOQUE 5 de 24
*
* SIGUIENTE:
*
* CPVEngine.ts
*
* BLOQUE 6 de 24
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 6 de 24
*
* COMPATIBILIDAD ENTRE CPV
*
******************************************************************************************/

/*==============================================================================
=
= MATRIZ DE COMPATIBILIDAD
=
==============================================================================*/

/*==============================================================================
=
= BASE DE COMPATIBILIDAD
=
==============================================================================*/

private compatibilityMatrix

:CPVCompatibility[]

=[];


/*==============================================================================
=
= REGISTRO
=
==============================================================================*/

public registerCompatibility(

    compatibility:CPVCompatibility

):void{

    this.compatibilityMatrix.push(

        compatibility

    );

}


/*==============================================================================
=
= CARGA INICIAL
=
==============================================================================*/

private loadCompatibilityMatrix()

:void{

    this.registerCompatibility({

        source:"50000000",

        target:"50730000",

        compatible:true,

        reason:

            "Pertenece a la misma familia funcional.",

        priority:100

    });



    this.registerCompatibility({

        source:"45000000",

        target:"50000000",

        compatible:false,

        reason:

            "Obras y servicios diferentes.",

        priority:100

    });

}


/*==============================================================================
=
= OBTENER COMPATIBILIDADES
=
==============================================================================*/

public getCompatibleCPV(

    code:string

):CPVCode[]{

    return this.compatibilityMatrix

        .filter(

            relation=>

                relation.source===code &&

                relation.compatible

        )

        .map(

            relation=>

                this.get(

                    relation.target

                )

        )

        .filter(

            (cpv):cpv is CPVCode=>

                cpv!==undefined

        );

}


/*==============================================================================
=
= OBTENER INCOMPATIBILIDADES
=
==============================================================================*/

public getIncompatibleCPV(

    code:string

):CPVCode[]{

    return this.compatibilityMatrix

        .filter(

            relation=>

                relation.source===code &&

                !relation.compatible

        )

        .map(

            relation=>

                this.get(

                    relation.target

                )

        )

        .filter(

            (cpv):cpv is CPVCode=>

                cpv!==undefined

        );

}


/*==============================================================================
=
= COMPROBAR MATRIZ
=
==============================================================================*/

public checkCompatibility(

    first:string,

    second:string

):CPVCompatibility|undefined{

    return this.compatibilityMatrix.find(

        relation=>

            relation.source===first &&

            relation.target===second

    );

}


/*==============================================================================
=
= INFORME
=
==============================================================================*/

public compatibilityReport(

    code:string

):string{

    const compatibles=

        this.getCompatibleCPV(code);

    const incompatibles=

        this.getIncompatibleCPV(code);



    return [

        "CPV",

        code,

        "",

        "Compatibles:",

        ...compatibles.map(

            cpv=>

                cpv.code+

                " "+

                cpv.name

        ),

        "",

        "Incompatibles:",

        ...incompatibles.map(

            cpv=>

                cpv.code+

                " "+

                cpv.name

        )

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 6 de 24
*
* SIGUIENTE:
*
* CPVEngine.ts
*
* BLOQUE 7 de 24
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 7 de 24
*
* PROPUESTA AUTOMÁTICA DE CPV PRINCIPAL Y SECUNDARIOS
*
******************************************************************************************/

/*==============================================================================
=
= PROPUESTA COMPLETA
=
==============================================================================*/

/*==============================================================================
=
= GENERAR PROPUESTA
=
==============================================================================*/

public proposeCPV(

    description:string

):CPVProposal|undefined{

    const detected=

        this.detectCPV(description);

    if(!detected){

        return undefined;

    }

    return{

        principal:

            detected.principal,

        secondary:

            detected.alternatives,

        confidence:

            detected.confidence,

        justification:

            this.buildProposalJustification(

                detected

            ),

        analysedTerms:

            detected.analysedWords

    };

}

/*==============================================================================
=
= JUSTIFICACIÓN
=
==============================================================================*/

private buildProposalJustification(

    proposal:CPVDetection

):string{

    return [

        "El código ",

        proposal.principal.code,

        " ha obtenido la mayor coincidencia semántica (",

        proposal.confidence,

        "%)."

    ].join("");

}

/*==============================================================================
=
= SOLO PRINCIPAL
=
==============================================================================*/

public proposePrincipal(

    description:string

):CPVCode|undefined{

    return this.proposeCPV(

        description

    )?.principal;

}

/*==============================================================================
=
= SOLO SECUNDARIOS
=
==============================================================================*/

public proposeSecondary(

    description:string

):CPVCode[]{

    return this.proposeCPV(

        description

    )?.secondary

    ??[];

}

/*==============================================================================
=
= EXISTEN ALTERNATIVAS
=
==============================================================================*/

public hasAlternatives(

    description:string

):boolean{

    return this.proposeSecondary(

        description

    ).length>0;

}

/*==============================================================================
=
= INFORME
=
==============================================================================*/

public proposalReport(

    description:string

):string{

    const proposal=

        this.proposeCPV(description);

    if(!proposal){

        return

        "No se ha podido generar una propuesta.";

    }

    return [

        "CPV PRINCIPAL",

        proposal.principal.code,

        proposal.principal.name,

        "",

        "CONFIANZA",

        proposal.confidence+" %",

        "",

        "JUSTIFICACIÓN",

        proposal.justification,

        "",

        "CPV SECUNDARIOS",

        ...proposal.secondary.map(

            cpv=>

                cpv.code+

                " "+

                cpv.name

        )

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 7 de 24
*
* SIGUIENTE:
*
* CPVEngine.ts
*
* BLOQUE 8 de 24
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 8 de 24
*
* RELACIÓN CPV → TIPO DE CONTRATO
*
******************************************************************************************/

/*==============================================================================
=
= CONFIGURACIÓN CONTRACTUAL
=
==============================================================================*/

/*==============================================================================
=
= BASE DE CONFIGURACIÓN
=
==============================================================================*/

private contractConfiguration

:Map<string,CPVContractConfiguration>

=new Map();



/*==============================================================================
=
= REGISTRO
=
==============================================================================*/

public registerConfiguration(

    configuration:CPVContractConfiguration

):void{

    this.contractConfiguration.set(

        configuration.cpv,

        configuration

    );

}



/*==============================================================================
=
= CARGA INICIAL
=
==============================================================================*/

private loadContractConfiguration()

:void{

    this.registerConfiguration({

        cpv:"50000000",

        contractType:

            ContractType.SERVICES,

        recommendedProcedure:

            "ABIERTO",

        divisionIntoLots:true,

        technicalSolvency:true,

        economicSolvency:true,

        environmentalClauses:true,

        socialClauses:true,

        qualityCriteria:true

    });



    this.registerConfiguration({

        cpv:"45000000",

        contractType:

            ContractType.WORKS,

        recommendedProcedure:

            "ABIERTO",

        divisionIntoLots:false,

        technicalSolvency:true,

        economicSolvency:true,

        environmentalClauses:true,

        socialClauses:true,

        qualityCriteria:true

    });



    this.registerConfiguration({

        cpv:"39000000",

        contractType:

            ContractType.SUPPLIES,

        recommendedProcedure:

            "ABIERTO",

        divisionIntoLots:false,

        technicalSolvency:false,

        economicSolvency:true,

        environmentalClauses:false,

        socialClauses:true,

        qualityCriteria:false

    });

}



/*==============================================================================
=
= OBTENER CONFIGURACIÓN
=
==============================================================================*/

public getConfiguration(

    cpv:string

):CPVContractConfiguration|undefined{

    return this.contractConfiguration.get(

        cpv

    );

}



/*==============================================================================
=
= TIPO DE CONTRATO
=
==============================================================================*/

public detectContractType(

    cpv:string

):ContractType|undefined{

    return this.getConfiguration(

        cpv

    )?.contractType;

}



/*==============================================================================
=
= PROCEDIMIENTO
=
==============================================================================*/

public recommendedProcedure(

    cpv:string

):string{

    return this.getConfiguration(

        cpv

    )?.recommendedProcedure

    ??"NO DEFINIDO";

}



/*==============================================================================
=
= INFORME CONTRACTUAL
=
==============================================================================*/

public contractConfigurationReport(

    cpv:string

):string{

    const config=

        this.getConfiguration(cpv);



    if(!config){

        return

        "No existe configuración para el CPV indicado.";

    }



    return [

        "CPV",

        cpv,

        "",

        "Tipo contrato: "+

        config.contractType,



        "Procedimiento: "+

        config.recommendedProcedure,



        "División en lotes: "+

        (config.divisionIntoLots?"Sí":"No"),



        "Solvencia técnica: "+

        (config.technicalSolvency?"Sí":"No"),



        "Solvencia económica: "+

        (config.economicSolvency?"Sí":"No"),



        "Cláusulas ambientales: "+

        (config.environmentalClauses?"Sí":"No"),



        "Cláusulas sociales: "+

        (config.socialClauses?"Sí":"No")

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 8 de 24
*
* SIGUIENTE:
*
* CPVEngine.ts
*
* BLOQUE 9 de 24
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 9 de 24
*
* RELACIÓN CPV → SOLVENCIA Y CRITERIOS DE ADJUDICACIÓN
*
******************************************************************************************/

/*==============================================================================
=
= SOLVENCIA Y CRITERIOS
=
==============================================================================*/

/*==============================================================================
=
= BASE DE DATOS
=
==============================================================================*/

private solvencyConfiguration

:Map<string,CPVSolvencyConfiguration>

=new Map();



/*==============================================================================
=
= REGISTRO
=
==============================================================================*/

public registerSolvencyConfiguration(

    configuration:CPVSolvencyConfiguration

):void{

    this.solvencyConfiguration.set(

        configuration.cpv,

        configuration

    );

}



/*==============================================================================
=
= CARGA INICIAL
=
==============================================================================*/

private loadSolvencyConfiguration()

:void{

    this.registerSolvencyConfiguration({

        cpv:"50000000",

        requiresTechnicalSolvency:true,

        requiresEconomicSolvency:true,

        recommendedTechnicalMeans:[

            "Relación de principales servicios realizados",

            "Personal técnico especializado",

            "Certificaciones de calidad"

        ],

        recommendedEconomicMeans:[

            "Volumen anual de negocios",

            "Seguro de responsabilidad civil"

        ],

        recommendedAwardCriteria:[

            "Calidad",

            "Organización del servicio",

            "Precio",

            "Mejoras"

        ],

        recommendedExecutionConditions:[

            "Cláusulas sociales",

            "Cláusulas ambientales"

        ]

    });



    this.registerSolvencyConfiguration({

        cpv:"39000000",

        requiresTechnicalSolvency:false,

        requiresEconomicSolvency:true,

        recommendedTechnicalMeans:[],

        recommendedEconomicMeans:[

            "Volumen anual de negocios"

        ],

        recommendedAwardCriteria:[

            "Precio",

            "Plazo de entrega"

        ],

        recommendedExecutionConditions:[

            "Entrega sostenible"

        ]

    });

}



/*==============================================================================
=
= CONSULTA
=
==============================================================================*/

public getSolvencyConfiguration(

    cpv:string

):CPVSolvencyConfiguration|undefined{

    return this.solvencyConfiguration.get(

        cpv

    );

}



/*==============================================================================
=
= CRITERIOS RECOMENDADOS
=
==============================================================================*/

public recommendedAwardCriteria(

    cpv:string

):string[]{

    return this.getSolvencyConfiguration(

        cpv

    )?.recommendedAwardCriteria

    ??[];

}



/*==============================================================================
=
= MEDIOS DE SOLVENCIA
=
==============================================================================*/

public recommendedTechnicalMeans(

    cpv:string

):string[]{

    return this.getSolvencyConfiguration(

        cpv

    )?.recommendedTechnicalMeans

    ??[];

}



public recommendedEconomicMeans(

    cpv:string

):string[]{

    return this.getSolvencyConfiguration(

        cpv

    )?.recommendedEconomicMeans

    ??[];

}



/*==============================================================================
=
= INFORME
=
==============================================================================*/

public solvencyReport(

    cpv:string

):string{

    const config=

        this.getSolvencyConfiguration(cpv);



    if(!config){

        return

        "No existe configuración de solvencia para este CPV.";

    }



    return [

        "CPV: "+cpv,

        "",

        "Solvencia técnica: "+

        (config.requiresTechnicalSolvency?"Sí":"No"),

        "",

        "Solvencia económica: "+

        (config.requiresEconomicSolvency?"Sí":"No"),

        "",

        "Criterios recomendados:",

        ...config.recommendedAwardCriteria,

        "",

        "Condiciones especiales:",

        ...config.recommendedExecutionConditions

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 9 de 24
*
* SIGUIENTE:
*
* CPVEngine.ts
*
* BLOQUE 10 de 24
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 10 de 24
*
* RELACIÓN CPV → PROCEDIMIENTO DE CONTRATACIÓN LCSP
*
******************************************************************************************/

/*==============================================================================
=
= CONFIGURACIÓN DEL PROCEDIMIENTO
=
==============================================================================*/

/*==============================================================================
=
= BASE DE PROCEDIMIENTOS
=
==============================================================================*/

private procedureConfiguration

:Map<string,CPVProcedureConfiguration>

=new Map();



/*==============================================================================
=
= REGISTRO
=
==============================================================================*/

public registerProcedureConfiguration(

    configuration:CPVProcedureConfiguration

):void{

    this.procedureConfiguration.set(

        configuration.cpv,

        configuration

    );

}



/*==============================================================================
=
= CARGA INICIAL
=
==============================================================================*/

private loadProcedureConfiguration()

:void{

    this.registerProcedureConfiguration({

        cpv:"50000000",

        recommendedProcedure:"ABIERTO",

        allowsOpenProcedure:true,

        allowsSimplifiedProcedure:true,

        allowsRestrictedProcedure:true,

        allowsNegotiatedProcedure:true,

        allowsMinorContract:true,

        publicationRequired:true,

        europeanRegulation:true,

        observations:[

            "Dependerá del valor estimado.",

            "Aplicar LCSP."

        ]

    });



    this.registerProcedureConfiguration({

        cpv:"45000000",

        recommendedProcedure:"ABIERTO",

        allowsOpenProcedure:true,

        allowsSimplifiedProcedure:true,

        allowsRestrictedProcedure:true,

        allowsNegotiatedProcedure:false,

        allowsMinorContract:true,

        publicationRequired:true,

        europeanRegulation:true,

        observations:[

            "Especial atención al valor estimado."

        ]

    });

}



/*==============================================================================
=
= CONSULTA
=
==============================================================================*/

public getProcedureConfiguration(

    cpv:string

):CPVProcedureConfiguration|undefined{

    return this.procedureConfiguration.get(

        cpv

    );

}



/*==============================================================================
=
= PROCEDIMIENTO RECOMENDADO
=
==============================================================================*/

public getRecommendedProcedure(

    cpv:string

):string{

    return this.getProcedureConfiguration(

        cpv

    )?.recommendedProcedure

    ??"NO DEFINIDO";

}



/*==============================================================================
=
= PUBLICIDAD
=
==============================================================================*/

public requiresPublication(

    cpv:string

):boolean{

    return this.getProcedureConfiguration(

        cpv

    )?.publicationRequired

    ??false;

}



/*==============================================================================
=
= REGULACIÓN ARMONIZADA
=
==============================================================================*/

public isEuropeanRegulated(

    cpv:string

):boolean{

    return this.getProcedureConfiguration(

        cpv

    )?.europeanRegulation

    ??false;

}



/*==============================================================================
=
= INFORME
=
==============================================================================*/

public procedureReport(

    cpv:string

):string{

    const config=

        this.getProcedureConfiguration(cpv);



    if(!config){

        return

        "No existe configuración del procedimiento.";

    }



    return [

        "CPV: "+cpv,

        "",

        "Procedimiento recomendado:",

        config.recommendedProcedure,

        "",

        "Publicidad:",

        config.publicationRequired?"Sí":"No",

        "",

        "Regulación armonizada:",

        config.europeanRegulation?"Sí":"No",

        "",

        "Observaciones:",

        ...config.observations

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 10 de 24
*
* SIGUIENTE:
*
* CPVEngine.ts
*
* BLOQUE 11 de 24
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 11 de 24
*
* RELACIÓN CPV → CLÁUSULAS SOCIALES Y MEDIOAMBIENTALES
*
******************************************************************************************/

/*==============================================================================
=
= CONFIGURACIÓN DE CLÁUSULAS
=
==============================================================================*/

/*==============================================================================
=
= BASE DE CLÁUSULAS
=
==============================================================================*/

private clauseConfiguration

:Map<string,CPVClauseConfiguration>

=new Map();



/*==============================================================================
=
= REGISTRO
=
==============================================================================*/

public registerClauseConfiguration(

    configuration:CPVClauseConfiguration

):void{

    this.clauseConfiguration.set(

        configuration.cpv,

        configuration

    );

}



/*==============================================================================
=
= CARGA INICIAL
=
==============================================================================*/

private loadClauseConfiguration()

:void{

    this.registerClauseConfiguration({

        cpv:"50000000",

        socialClauses:[

            "Inserción laboral",

            "Igualdad entre mujeres y hombres",

            "Estabilidad en el empleo"

        ],

        environmentalClauses:[

            "Reducción de emisiones",

            "Gestión de residuos",

            "Uso eficiente de recursos"

        ],

        innovationClauses:[

            "Mejora tecnológica"

        ],

        accessibilityClauses:[

            "Accesibilidad universal"

        ],

        equalityClauses:[

            "Plan de igualdad"

        ],

        mandatorySocial:true,

        mandatoryEnvironmental:true

    });



    this.registerClauseConfiguration({

        cpv:"39000000",

        socialClauses:[

            "Condiciones laborales"

        ],

        environmentalClauses:[

            "Material reciclable"

        ],

        innovationClauses:[],

        accessibilityClauses:[],

        equalityClauses:[],

        mandatorySocial:false,

        mandatoryEnvironmental:false

    });

}



/*==============================================================================
=
= CONSULTA
=
==============================================================================*/

public getClauseConfiguration(

    cpv:string

):CPVClauseConfiguration|undefined{

    return this.clauseConfiguration.get(

        cpv

    );

}



/*==============================================================================
=
= CLÁUSULAS SOCIALES
=
==============================================================================*/

public getSocialClauses(

    cpv:string

):string[]{

    return this.getClauseConfiguration(

        cpv

    )?.socialClauses

    ??[];

}



/*==============================================================================
=
= CLÁUSULAS MEDIOAMBIENTALES
=
==============================================================================*/

public getEnvironmentalClauses(

    cpv:string

):string[]{

    return this.getClauseConfiguration(

        cpv

    )?.environmentalClauses

    ??[];

}



/*==============================================================================
=
= INFORME
=
==============================================================================*/

public clauseReport(

    cpv:string

):string{

    const config=

        this.getClauseConfiguration(cpv);



    if(!config){

        return

        "No existe configuración de cláusulas.";

    }



    return [

        "CPV: "+cpv,

        "",

        "Cláusulas sociales:",

        ...config.socialClauses,

        "",

        "Cláusulas medioambientales:",

        ...config.environmentalClauses,

        "",

        "Obligatorias:",

        "Sociales: "+(config.mandatorySocial?"Sí":"No"),

        "Ambientales: "+(config.mandatoryEnvironmental?"Sí":"No")

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 11 de 24
*
* SIGUIENTE:
*
* CPVEngine.ts
*
* BLOQUE 12 de 24
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 12 de 24
*
* RELACIÓN CPV → DOCUMENTACIÓN DEL EXPEDIENTE
*
******************************************************************************************/

/*==============================================================================
=
= DOCUMENTACIÓN ASOCIADA
=
==============================================================================*/

/*==============================================================================
=
= BASE DOCUMENTAL
=
==============================================================================*/

private documentationConfiguration

:Map<string,CPVDocumentationConfiguration>

=new Map();



/*==============================================================================
=
= REGISTRO
=
==============================================================================*/

public registerDocumentationConfiguration(

    configuration:CPVDocumentationConfiguration

):void{

    this.documentationConfiguration.set(

        configuration.cpv,

        configuration

    );

}



/*==============================================================================
=
= CARGA INICIAL
=
==============================================================================*/

private loadDocumentationConfiguration()

:void{

    this.registerDocumentationConfiguration({

        cpv:"50000000",

        requiredDocuments:[

            "Memoria justificativa",

            "PPT",

            "PCAP",

            "Informe de insuficiencia de medios",

            "Informe de necesidad"

        ],

        optionalDocuments:[

            "Estudio económico",

            "Consulta preliminar de mercado"

        ],

        technicalReports:[

            "Informe técnico",

            "Informe de solvencia"

        ],

        administrativeReports:[

            "Fiscalización",

            "Retención de crédito"

        ],

        executionDocuments:[

            "Acta de inicio",

            "Acta de recepción"

        ]

    });



    this.registerDocumentationConfiguration({

        cpv:"39000000",

        requiredDocuments:[

            "Memoria",

            "PPT",

            "PCAP"

        ],

        optionalDocuments:[

            "Catálogo técnico"

        ],

        technicalReports:[

            "Informe técnico"

        ],

        administrativeReports:[

            "Fiscalización"

        ],

        executionDocuments:[

            "Acta de recepción"

        ]

    });

}



/*==============================================================================
=
= CONSULTA
=
==============================================================================*/

public getDocumentationConfiguration(

    cpv:string

):CPVDocumentationConfiguration|undefined{

    return this.documentationConfiguration.get(

        cpv

    );

}



/*==============================================================================
=
= DOCUMENTACIÓN OBLIGATORIA
=
==============================================================================*/

public getRequiredDocuments(

    cpv:string

):string[]{

    return this.getDocumentationConfiguration(

        cpv

    )?.requiredDocuments

    ??[];

}



/*==============================================================================
=
= INFORMES TÉCNICOS
=
==============================================================================*/

public getTechnicalReports(

    cpv:string

):string[]{

    return this.getDocumentationConfiguration(

        cpv

    )?.technicalReports

    ??[];

}



/*==============================================================================
=
= INFORME DOCUMENTAL
=
==============================================================================*/

public documentationReport(

    cpv:string

):string{

    const config=

        this.getDocumentationConfiguration(cpv);



    if(!config){

        return

        "No existe configuración documental.";

    }



    return [

        "CPV: "+cpv,

        "",

        "Documentación obligatoria:",

        ...config.requiredDocuments,

        "",

        "Documentación opcional:",

        ...config.optionalDocuments,

        "",

        "Informes técnicos:",

        ...config.technicalReports,

        "",

        "Informes administrativos:",

        ...config.administrativeReports,

        "",

        "Documentos de ejecución:",

        ...config.executionDocuments

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 12 de 24
*
* SIGUIENTE:
*
* CPVEngine.ts
*
* BLOQUE 13 de 24
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 13 de 24
*
* RELACIÓN CPV → MEDIOS PERSONALES Y MATERIALES
*
******************************************************************************************/

/*==============================================================================
=
= MEDIOS NECESARIOS
=
==============================================================================*/

/*==============================================================================
=
= BASE DE CONFIGURACIÓN
=
==============================================================================*/

private resourcesConfiguration

:Map<string,CPVResourcesConfiguration>

=new Map();



/*==============================================================================
=
= REGISTRO
=
==============================================================================*/

public registerResourcesConfiguration(

    configuration:CPVResourcesConfiguration

):void{

    this.resourcesConfiguration.set(

        configuration.cpv,

        configuration

    );

}



/*==============================================================================
=
= CARGA INICIAL
=
==============================================================================*/

private loadResourcesConfiguration()

:void{

    this.registerResourcesConfiguration({

        cpv:"50000000",

        humanResources:[

            "Responsable del contrato",

            "Técnicos especialistas",

            "Personal de mantenimiento"

        ],

        materialResources:[

            "Vehículos",

            "Herramientas",

            "Equipos de medida"

        ],

        machinery:[

            "Maquinaria auxiliar"

        ],

        software:[

            "Software de gestión",

            "Aplicaciones técnicas"

        ],

        certifications:[

            "ISO 9001",

            "ISO 14001"

        ],

        requiresProjectManager:true

    });



    this.registerResourcesConfiguration({

        cpv:"39000000",

        humanResources:[

            "Personal logístico"

        ],

        materialResources:[

            "Vehículos de transporte"

        ],

        machinery:[

            "Carretillas"

        ],

        software:[

            "Sistema de inventario"

        ],

        certifications:[],

        requiresProjectManager:false

    });

}



/*==============================================================================
=
= CONSULTA
=
==============================================================================*/

public getResourcesConfiguration(

    cpv:string

):CPVResourcesConfiguration|undefined{

    return this.resourcesConfiguration.get(

        cpv

    );

}



/*==============================================================================
=
= MEDIOS PERSONALES
=
==============================================================================*/

public getHumanResources(

    cpv:string

):string[]{

    return this.getResourcesConfiguration(

        cpv

    )?.humanResources

    ??[];

}



/*==============================================================================
=
= MEDIOS MATERIALES
=
==============================================================================*/

public getMaterialResources(

    cpv:string

):string[]{

    return this.getResourcesConfiguration(

        cpv

    )?.materialResources

    ??[];

}



/*==============================================================================
=
= CERTIFICACIONES
=
==============================================================================*/

public getRecommendedCertifications(

    cpv:string

):string[]{

    return this.getResourcesConfiguration(

        cpv

    )?.certifications

    ??[];

}



/*==============================================================================
=
= INFORME
=
==============================================================================*/

public resourcesReport(

    cpv:string

):string{

    const config=

        this.getResourcesConfiguration(cpv);



    if(!config){

        return

        "No existe configuración de recursos.";

    }



    return [

        "CPV: "+cpv,

        "",

        "Medios personales:",

        ...config.humanResources,

        "",

        "Medios materiales:",

        ...config.materialResources,

        "",

        "Maquinaria:",

        ...config.machinery,

        "",

        "Software:",

        ...config.software,

        "",

        "Certificaciones:",

        ...config.certifications,

        "",

        "Director del proyecto:",

        config.requiresProjectManager

            ?"Sí"

            :"No"

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 13 de 24
*
* SIGUIENTE:
*
* CPVEngine.ts
*
* BLOQUE 14 de 24
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 14 de 24
*
* RELACIÓN CPV → PLAZOS Y EJECUCIÓN DEL CONTRATO
*
******************************************************************************************/

/*==============================================================================
=
= CONFIGURACIÓN DE EJECUCIÓN
=
==============================================================================*/

/*==============================================================================
=
= BASE DE EJECUCIÓN
=
==============================================================================*/

private executionConfiguration

:Map<string,CPVExecutionConfiguration>

=new Map();



/*==============================================================================
=
= REGISTRO
=
==============================================================================*/

public registerExecutionConfiguration(

    configuration:CPVExecutionConfiguration

):void{

    this.executionConfiguration.set(

        configuration.cpv,

        configuration

    );

}



/*==============================================================================
=
= CARGA INICIAL
=
==============================================================================*/

private loadExecutionConfiguration()

:void{

    this.registerExecutionConfiguration({

        cpv:"50000000",

        estimatedExecutionMonths:24,

        allowsExtensions:true,

        maximumExtensions:2,

        recommendedWarrantyMonths:12,

        requiresContractManager:true,

        periodicMonitoring:true,

        recommendedMilestones:[

            "Inicio del servicio",

            "Seguimiento trimestral",

            "Recepción final"

        ],

        executionRisks:[

            "Falta de personal",

            "Incumplimiento de plazos",

            "Fallo en el mantenimiento"

        ]

    });



    this.registerExecutionConfiguration({

        cpv:"39000000",

        estimatedExecutionMonths:3,

        allowsExtensions:false,

        maximumExtensions:0,

        recommendedWarrantyMonths:24,

        requiresContractManager:false,

        periodicMonitoring:false,

        recommendedMilestones:[

            "Entrega",

            "Recepción"

        ],

        executionRisks:[

            "Retraso del suministro"

        ]

    });

}



/*==============================================================================
=
= CONSULTA
=
==============================================================================*/

public getExecutionConfiguration(

    cpv:string

):CPVExecutionConfiguration|undefined{

    return this.executionConfiguration.get(

        cpv

    );

}



/*==============================================================================
=
= PLAZO ESTIMADO
=
==============================================================================*/

public getEstimatedExecution(

    cpv:string

):number{

    return this.getExecutionConfiguration(

        cpv

    )?.estimatedExecutionMonths

    ??0;

}



/*==============================================================================
=
= GARANTÍA
=
==============================================================================*/

public getWarrantyMonths(

    cpv:string

):number{

    return this.getExecutionConfiguration(

        cpv

    )?.recommendedWarrantyMonths

    ??0;

}



/*==============================================================================
=
= INFORME
=
==============================================================================*/

public executionReport(

    cpv:string

):string{

    const config=

        this.getExecutionConfiguration(cpv);



    if(!config){

        return

        "No existe configuración de ejecución.";

    }



    return [

        "CPV: "+cpv,

        "",

        "Duración estimada:",

        config.estimatedExecutionMonths+" meses",

        "",

        "Prórrogas:",

        config.allowsExtensions

            ?"Sí"

            :"No",

        "",

        "Garantía:",

        config.recommendedWarrantyMonths+" meses",

        "",

        "Responsable del contrato:",

        config.requiresContractManager

            ?"Sí"

            :"No",

        "",

        "Hitos:",

        ...config.recommendedMilestones,

        "",

        "Riesgos:",

        ...config.executionRisks

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 14 de 24
*
* SIGUIENTE:
*
* CPVEngine.ts
*
* BLOQUE 15 de 24
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 15 de 24
*
* RELACIÓN CPV → INDICADORES, KPI Y CONTROL DEL CONTRATO
*
******************************************************************************************/

/*==============================================================================
=
= CONFIGURACIÓN DE INDICADORES
=
==============================================================================*/

/*==============================================================================
=
= BASE KPI
=
==============================================================================*/

private kpiConfiguration

:Map<string,CPVKPIConfiguration>

=new Map();



/*==============================================================================
=
= REGISTRO
=
==============================================================================*/

public registerKPIConfiguration(

    configuration:CPVKPIConfiguration

):void{

    this.kpiConfiguration.set(

        configuration.cpv,

        configuration

    );

}



/*==============================================================================
=
= CARGA INICIAL
=
==============================================================================*/

private loadKPIConfiguration()

:void{

    this.registerKPIConfiguration({

        cpv:"50000000",

        indicators:[

            "Cumplimiento del contrato",

            "Disponibilidad del servicio",

            "Tiempo de respuesta"

        ],

        serviceLevelIndicators:[

            "Incidencias resueltas",

            "Tiempo medio de reparación"

        ],

        qualityIndicators:[

            "Satisfacción del usuario",

            "Calidad técnica"

        ],

        environmentalIndicators:[

            "Consumo energético",

            "Emisiones"

        ],

        economicIndicators:[

            "Coste mensual",

            "Desviación presupuestaria"

        ],

        periodicity:"Mensual"

    });



    this.registerKPIConfiguration({

        cpv:"39000000",

        indicators:[

            "Entregas realizadas"

        ],

        serviceLevelIndicators:[

            "Plazo de entrega"

        ],

        qualityIndicators:[

            "Estado del suministro"

        ],

        environmentalIndicators:[

            "Material reciclado"

        ],

        economicIndicators:[

            "Coste unitario"

        ],

        periodicity:"Recepción"

    });

}



/*==============================================================================
=
= CONSULTA
=
==============================================================================*/

public getKPIConfiguration(

    cpv:string

):CPVKPIConfiguration|undefined{

    return this.kpiConfiguration.get(

        cpv

    );

}



/*==============================================================================
=
= OBTENER INDICADORES
=
==============================================================================*/

public getIndicators(

    cpv:string

):string[]{

    return this.getKPIConfiguration(

        cpv

    )?.indicators

    ??[];

}



/*==============================================================================
=
= INFORME KPI
=
==============================================================================*/

public KPIReport(

    cpv:string

):string{

    const config=

        this.getKPIConfiguration(cpv);



    if(!config){

        return

        "No existe configuración de indicadores.";

    }



    return [

        "CPV: "+cpv,

        "",

        "Periodicidad:",

        config.periodicity,

        "",

        "Indicadores:",

        ...config.indicators,

        "",

        "Nivel de servicio:",

        ...config.serviceLevelIndicators,

        "",

        "Calidad:",

        ...config.qualityIndicators,

        "",

        "Ambientales:",

        ...config.environmentalIndicators,

        "",

        "Económicos:",

        ...config.economicIndicators

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 15 de 24
*
* SIGUIENTE:
*
* CPVEngine.ts
*
* BLOQUE 16 de 24
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 16 de 24
*
* RELACIÓN CPV → RIESGOS Y PLAN DE CONTINGENCIA
*
******************************************************************************************/

/*==============================================================================
=
= CONFIGURACIÓN DE RIESGOS
=
==============================================================================*/

/*==============================================================================
=
= BASE DE RIESGOS
=
==============================================================================*/

private riskConfiguration

:Map<string,CPVRiskConfiguration>

=new Map();



/*==============================================================================
=
= REGISTRO
=
==============================================================================*/

public registerRiskConfiguration(

    configuration:CPVRiskConfiguration

):void{

    this.riskConfiguration.set(

        configuration.cpv,

        configuration

    );

}



/*==============================================================================
=
= CARGA INICIAL
=
==============================================================================*/

private loadRiskConfiguration()

:void{

    this.registerRiskConfiguration({

        cpv:"50000000",

        operationalRisks:[

            "Incumplimiento del nivel de servicio",

            "Falta de personal",

            "Averías críticas"

        ],

        legalRisks:[

            "Incumplimiento contractual",

            "Incumplimiento LCSP"

        ],

        economicRisks:[

            "Incremento de costes",

            "Desviación presupuestaria"

        ],

        environmentalRisks:[

            "Gestión inadecuada de residuos",

            "Consumo energético elevado"

        ],

        contingencyMeasures:[

            "Plan de sustitución",

            "Servicio de guardia",

            "Escalado de incidencias"

        ],

        monitoringActions:[

            "Reunión mensual",

            "Informe trimestral",

            "Auditoría anual"

        ]

    });



    this.registerRiskConfiguration({

        cpv:"39000000",

        operationalRisks:[

            "Retraso en suministro"

        ],

        legalRisks:[

            "Incumplimiento de entrega"

        ],

        economicRisks:[

            "Variación de precios"

        ],

        environmentalRisks:[

            "Embalajes no reciclables"

        ],

        contingencyMeasures:[

            "Proveedor alternativo"

        ],

        monitoringActions:[

            "Control de entregas"

        ]

    });

}



/*==============================================================================
=
= CONSULTA
=
==============================================================================*/

public getRiskConfiguration(

    cpv:string

):CPVRiskConfiguration|undefined{

    return this.riskConfiguration.get(

        cpv

    );

}



/*==============================================================================
=
= RIESGOS OPERACIONALES
=
==============================================================================*/

public getOperationalRisks(

    cpv:string

):string[]{

    return this.getRiskConfiguration(

        cpv

    )?.operationalRisks

    ??[];

}



/*==============================================================================
=
= MEDIDAS DE CONTINGENCIA
=
==============================================================================*/

public getContingencyMeasures(

    cpv:string

):string[]{

    return this.getRiskConfiguration(

        cpv

    )?.contingencyMeasures

    ??[];

}



/*==============================================================================
=
= INFORME DE RIESGOS
=
==============================================================================*/

public riskReport(

    cpv:string

):string{

    const config=

        this.getRiskConfiguration(cpv);



    if(!config){

        return

        "No existe configuración de riesgos.";

    }



    return [

        "CPV: "+cpv,

        "",

        "RIESGOS OPERACIONALES",

        ...config.operationalRisks,

        "",

        "RIESGOS JURÍDICOS",

        ...config.legalRisks,

        "",

        "RIESGOS ECONÓMICOS",

        ...config.economicRisks,

        "",

        "RIESGOS AMBIENTALES",

        ...config.environmentalRisks,

        "",

        "PLAN DE CONTINGENCIA",

        ...config.contingencyMeasures,

        "",

        "SEGUIMIENTO",

        ...config.monitoringActions

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 16 de 24
*
* SIGUIENTE:
*
* CPVEngine.ts
*
* BLOQUE 17 de 24
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 17 de 24
*
* RELACIÓN CPV → REUTILIZACIÓN DE EXPEDIENTES Y PLIEGOS
*
******************************************************************************************/

/*==============================================================================
=
= CONFIGURACIÓN DE REUTILIZACIÓN
=
==============================================================================*/

/*==============================================================================
=
= BASE DE REUTILIZACIÓN
=
==============================================================================*/

private reuseConfiguration

:Map<string,CPVReuseConfiguration>

=new Map();



/*==============================================================================
=
= REGISTRO
=
==============================================================================*/

public registerReuseConfiguration(

    configuration:CPVReuseConfiguration

):void{

    this.reuseConfiguration.set(

        configuration.cpv,

        configuration

    );

}



/*==============================================================================
=
= CARGA INICIAL
=
==============================================================================*/

private loadReuseConfiguration()

:void{

    this.registerReuseConfiguration({

        cpv:"50000000",

        reusableTemplates:[

            "Memoria justificativa",

            "Informe de necesidad"

        ],

        reusableReports:[

            "Informe técnico",

            "Informe económico"

        ],

        reusablePPT:[

            "PPT mantenimiento",

            "PPT instalaciones"

        ],

        reusablePCAP:[

            "PCAP servicios"

        ],

        reusableCriteria:[

            "Calidad",

            "Precio",

            "Organización"

        ],

        reusableClauses:[

            "Cláusulas sociales",

            "Cláusulas ambientales"

        ]

    });



    this.registerReuseConfiguration({

        cpv:"39000000",

        reusableTemplates:[

            "Memoria suministros"

        ],

        reusableReports:[

            "Informe técnico"

        ],

        reusablePPT:[

            "PPT suministros"

        ],

        reusablePCAP:[

            "PCAP suministros"

        ],

        reusableCriteria:[

            "Precio"

        ],

        reusableClauses:[

            "Garantía"

        ]

    });

}



/*==============================================================================
=
= CONSULTA
=
==============================================================================*/

public getReuseConfiguration(

    cpv:string

):CPVReuseConfiguration|undefined{

    return this.reuseConfiguration.get(

        cpv

    );

}



/*==============================================================================
=
= MODELOS REUTILIZABLES
=
==============================================================================*/

public getReusableTemplates(

    cpv:string

):string[]{

    return this.getReuseConfiguration(

        cpv

    )?.reusableTemplates

    ??[];

}



/*==============================================================================
=
= PLIEGOS REUTILIZABLES
=
==============================================================================*/

public getReusablePPT(

    cpv:string

):string[]{

    return this.getReuseConfiguration(

        cpv

    )?.reusablePPT

    ??[];

}



public getReusablePCAP(

    cpv:string

):string[]{

    return this.getReuseConfiguration(

        cpv

    )?.reusablePCAP

    ??[];

}



/*==============================================================================
=
= INFORME DE REUTILIZACIÓN
=
==============================================================================*/

public reuseReport(

    cpv:string

):string{

    const config=

        this.getReuseConfiguration(cpv);



    if(!config){

        return

        "No existe configuración de reutilización.";

    }



    return [

        "CPV: "+cpv,

        "",

        "MODELOS",

        ...config.reusableTemplates,

        "",

        "PPT",

        ...config.reusablePPT,

        "",

        "PCAP",

        ...config.reusablePCAP,

        "",

        "CRITERIOS",

        ...config.reusableCriteria,

        "",

        "CLÁUSULAS",

        ...config.reusableClauses

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 17 de 24
*
* SIGUIENTE:
*
* CPVEngine.ts
*
* BLOQUE 18 de 24
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 18 de 24
*
* RELACIÓN CPV → HISTÓRICO, ESTADÍSTICAS Y APRENDIZAJE
*
******************************************************************************************/

/*==============================================================================
=
= HISTÓRICO DE UTILIZACIÓN
=
==============================================================================*/

/*==============================================================================
=
= BASE HISTÓRICA
=
==============================================================================*/

private history

:Map<string,CPVHistory>

=new Map();



/*==============================================================================
=
= REGISTRO DE USO
=
==============================================================================*/

public registerUse(

    cpv:string,

    confidence:number,

    accepted:boolean

):void{

    let record=

        this.history.get(cpv);



    if(!record){

        record={

            cpv,

            uses:0,

            successfulUses:0,

            rejectedUses:0,

            averageConfidence:0

        };

    }



    record.uses++;

    record.lastUse=new Date();



    if(accepted){

        record.successfulUses++;

    }else{

        record.rejectedUses++;

    }



    record.averageConfidence=

        (

            (

                record.averageConfidence*

                (record.uses-1)

            )

            +

            confidence

        )

        /

        record.uses;



    this.history.set(

        cpv,

        record

    );

}



/*==============================================================================
=
= CONSULTA
=
==============================================================================*/

public getHistory(

    cpv:string

):CPVHistory|undefined{

    return this.history.get(cpv);

}



/*==============================================================================
=
= MÁS UTILIZADOS
=
==============================================================================*/

public mostUsed(

    limit:number=10

):CPVHistory[]{

    return

        [...this.history.values()]

        .sort(

            (a,b)=>

                b.uses-a.uses

        )

        .slice(0,limit);

}



/*==============================================================================
=
= MÁS FIABLES
=
==============================================================================*/

public bestRated(

    limit:number=10

):CPVHistory[]{

    return

        [...this.history.values()]

        .sort(

            (a,b)=>

                b.averageConfidence-

                a.averageConfidence

        )

        .slice(0,limit);

}



/*==============================================================================
=
= ESTADÍSTICAS
=
==============================================================================*/

public statistics(){

    return{

        totalCPV:

            this.cpvDatabase.size,



        totalHistory:

            this.history.size,



        totalUses:

            [...this.history.values()]

            .reduce(

                (sum,item)=>

                    sum+item.uses,

                0

            )

    };

}



/*==============================================================================
=
= INFORME
=
==============================================================================*/

public statisticsReport()

:string{

    const stats=

        this.statistics();



    return[

        "TOTAL CPV",

        stats.totalCPV,

        "",

        "CPV UTILIZADOS",

        stats.totalHistory,

        "",

        "USOS REGISTRADOS",

        stats.totalUses

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 18 de 24
*
* SIGUIENTE:
*
* CPVEngine.ts
*
* BLOQUE 19 de 24
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 19 de 24
*
* EXPORTACIÓN, IMPORTACIÓN Y MANTENIMIENTO DEL CATÁLOGO CPV
*
******************************************************************************************/

/*==============================================================================
=
= EXPORTAR CATÁLOGO
=
==============================================================================*/

public exportDatabase()

:CPVCode[]{

    return

        [...this.cpvDatabase.values()];

}



/*==============================================================================
=
= EXPORTAR JSON
=
==============================================================================*/

public exportJSON()

:string{

    return JSON.stringify(

        this.exportDatabase(),

        null,

        2

    );

}



/*==============================================================================
=
= IMPORTAR CATÁLOGO
=
==============================================================================*/

public importDatabase(

    cpvs:CPVCode[]

):void{

    for(

        const cpv

        of

        cpvs

    ){

        this.cpvDatabase.set(

            cpv.code,

            cpv

        );

    }

}



/*==============================================================================
=
= LIMPIAR BASE
=
==============================================================================*/

public clearDatabase()

:void{

    this.cpvDatabase.clear();

}



/*==============================================================================
=
= REINICIALIZAR
=
==============================================================================*/

public reload()

:void{

    this.clearDatabase();

    this.loadDatabase();

}



/*==============================================================================
=
= TOTAL DE CPV
=
==============================================================================*/

public totalCPV()

:number{

    return this.cpvDatabase.size;

}



/*==============================================================================
=
= COMPROBACIÓN DE INTEGRIDAD
=
==============================================================================*/

public integrityCheck()

:boolean{

    for(

        const cpv

        of

        this.cpvDatabase.values()

    ){

        if(

            !cpv.code ||

            !cpv.name

        ){

            return false;

        }

    }

    return true;

}



/*==============================================================================
=
= DIAGNÓSTICO
=
==============================================================================*/

public diagnosticReport()

:string{

    return [

        "CPV almacenados: "+

        this.totalCPV(),

        "",

        "Integridad:",

        this.integrityCheck()

            ?"Correcta"

            :"Errores detectados",

        "",

        "Histórico:",

        this.history.size+

        " registros",

        "",

        "Compatibilidades:",

        this.compatibilityMatrix.length+

        " relaciones"

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 19 de 24
*
* SIGUIENTE:
*
* CPVEngine.ts
*
* BLOQUE 20 de 24
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 20 de 24
*
* VALIDACIÓN NORMATIVA LCSP Y REGLAS DE NEGOCIO
*
******************************************************************************************/

/*==============================================================================
=
= REGLA NORMATIVA
=
==============================================================================*/

/*==============================================================================
=
= RESULTADO
=
==============================================================================*/

/*==============================================================================
=
= BASE DE REGLAS
=
==============================================================================*/

private businessRules

:CPVBusinessRule[]

=[];



/*==============================================================================
=
= REGISTRO
=
==============================================================================*/

public registerBusinessRule(

    rule:CPVBusinessRule

):void{

    this.businessRules.push(

        rule

    );

}



/*==============================================================================
=
= CARGA INICIAL
=
==============================================================================*/

private loadBusinessRules()

:void{

    this.registerBusinessRule({

        id:"RULE-001",

        name:"CPV válido",

        description:

            "Debe existir en el catálogo.",

        appliesTo:["*"],

        severity:"ERROR",

        validator:(cpv)=>!!cpv

    });



    this.registerBusinessRule({

        id:"RULE-002",

        name:"Nivel final",

        description:

            "Debe corresponder a un CPV final.",

        appliesTo:["*"],

        severity:"WARNING",

        validator:(cpv)=>

            cpv.level===CPVLevel.CODE

    });

}



/*==============================================================================
=
= VALIDACIÓN
=
==============================================================================*/

public validateBusinessRules(

    code:string

):RuleValidationResult{

    const cpv=

        this.get(code);



    const messages:string[]=[];

    let valid=true;



    if(!cpv){

        return{

            valid:false,

            messages:[

                "CPV inexistente."

            ]

        };

    }



    for(

        const rule

        of

        this.businessRules

    ){

        if(

            !rule.validator(cpv)

        ){

            valid=false;

            messages.push(

                "["+

                rule.severity+

                "] "+

                rule.name+

                ": "+

                rule.description

            );

        }

    }



    return{

        valid,

        messages

    };

}



/*==============================================================================
=
= INFORME
=
==============================================================================*/

public businessRulesReport(

    code:string

):string{

    const result=

        this.validateBusinessRules(

            code

        );



    return[

        "VALIDACIÓN LCSP",

        "",

        "Resultado:",

        result.valid

            ?"CORRECTO"

            :"REVISAR",

        "",

        ...result.messages

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 20 de 24
*
* SIGUIENTE:
*
* CPVEngine.ts
*
* BLOQUE 21 de 24
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 21 de 24
*
* UTILIDADES GENERALES Y DIAGNÓSTICO DEL MOTOR CPV
*
******************************************************************************************/

/*==============================================================================
=
= EXISTE CPV
=
==============================================================================*/

public exists(

    code:string

):boolean{

    return this.cpvDatabase.has(

        code

    );

}



/*==============================================================================
=
= TOTAL DE RELACIONES
=
==============================================================================*/

public totalRelationships()

:number{

    let total=0;

    for(

        const cpv

        of

        this.cpvDatabase.values()

    ){

        total+=cpv.children.length;

    }

    return total;

}



/*==============================================================================
=
= TOTAL DE CÓDIGOS FINALES
=
==============================================================================*/

public totalLeafCodes()

:number{

    return

        [...this.cpvDatabase.values()]

        .filter(

            cpv=>

                cpv.level===CPVLevel.CODE

        )

        .length;

}



/*==============================================================================
=
= BÚSQUEDA EXACTA POR NOMBRE
=
==============================================================================*/

public findByExactName(

    name:string

):CPVCode|undefined{

    const normalized=

        this.normalize(name);



    return

        [...this.cpvDatabase.values()]

        .find(

            cpv=>

                this.normalize(

                    cpv.name

                )===normalized

        );

}



/*==============================================================================
=
= LISTADO ORDENADO
=
==============================================================================*/

public orderedCatalogue()

:CPVCode[]{

    return

        [...this.cpvDatabase.values()]

        .sort(

            (a,b)=>

                a.code.localeCompare(

                    b.code

                )

        );

}



/*==============================================================================
=
= INFORMACIÓN DEL MOTOR
=
==============================================================================*/

public engineInformation(){

    return{

        totalCodes:

            this.totalCPV(),

        totalLeafCodes:

            this.totalLeafCodes(),

        totalRelationships:

            this.totalRelationships(),

        compatibilityRelations:

            this.compatibilityMatrix.length,

        businessRules:

            this.businessRules.length,

        historyRecords:

            this.history.size,

        integrity:

            this.integrityCheck()

    };

}



/*==============================================================================
=
= INFORME GENERAL
=
==============================================================================*/

public engineReport()

:string{

    const info=

        this.engineInformation();



    return[

        "========== MOTOR CPV ==========",

        "",

        "Total códigos: "+

        info.totalCodes,

        "CPV finales: "+

        info.totalLeafCodes,

        "Relaciones jerárquicas: "+

        info.totalRelationships,

        "Compatibilidades: "+

        info.compatibilityRelations,

        "Reglas de negocio: "+

        info.businessRules,

        "Histórico: "+

        info.historyRecords,

        "",

        "Integridad: "+

        (

            info.integrity

                ?"CORRECTA"

                :"ERROR"

        )

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 21 de 24
*
* SIGUIENTE:
*
* CPVEngine.ts
*
* BLOQUE 22 de 24
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 22 de 24
*
* VALIDACIÓN MASIVA Y AUDITORÍA DEL CATÁLOGO CPV
*
******************************************************************************************/

/*==============================================================================
=
= RESULTADO DE AUDITORÍA
=
==============================================================================*/

/*==============================================================================
=
= AUDITORÍA COMPLETA
=
==============================================================================*/

public auditCatalogue()

:CPVAuditResult{

    const result:CPVAuditResult={

        total:0,

        valid:0,

        invalid:0,

        duplicated:0,

        orphan:0,

        messages:[]

    };



    const visited=new Set<string>();



    for(

        const cpv

        of

        this.cpvDatabase.values()

    ){

        result.total++;



        if(

            visited.has(cpv.code)

        ){

            result.duplicated++;

            result.messages.push(

                "Código duplicado: "+

                cpv.code

            );

        }

        else{

            visited.add(cpv.code);

        }



        if(

            !cpv.name ||

            cpv.name.trim()===""

        ){

            result.invalid++;

            result.messages.push(

                "Nombre vacío: "+

                cpv.code

            );

        }

        else{

            result.valid++;

        }



        if(

            cpv.parent &&

            !this.exists(cpv.parent)

        ){

            result.orphan++;

            result.messages.push(

                "Padre inexistente: "+

                cpv.code+

                " -> "+

                cpv.parent

            );

        }

    }



    return result;

}



/*==============================================================================
=
= VALIDACIÓN GLOBAL
=
==============================================================================*/

public validateCatalogue()

:boolean{

    const audit=

        this.auditCatalogue();



    return(

        audit.invalid===0 &&

        audit.duplicated===0 &&

        audit.orphan===0

    );

}



/*==============================================================================
=
= INFORME DE AUDITORÍA
=
==============================================================================*/

public auditReport()

:string{

    const audit=

        this.auditCatalogue();



    return[

        "========= AUDITORÍA =========",

        "",

        "Total CPV: "+audit.total,

        "Correctos: "+audit.valid,

        "Inválidos: "+audit.invalid,

        "Duplicados: "+audit.duplicated,

        "Huérfanos: "+audit.orphan,

        "",

        "INCIDENCIAS",

        ...audit.messages

    ].join("\n");

}



/*==============================================================================
=
= EXPORTACIÓN DEL INFORME
=
==============================================================================*/

public exportAudit()

:CPVAuditResult{

    return this.auditCatalogue();

}



/*****************************************************************************************
*
* FIN BLOQUE 22 de 24
*
* SIGUIENTE:
*
* CPVEngine.ts
*
* BLOQUE 23 de 24
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 23 de 24
*
* MÉTRICAS, RENDIMIENTO Y MANTENIMIENTO DEL MOTOR
*
******************************************************************************************/

/*==============================================================================
=
= MÉTRICAS DEL MOTOR
=
==============================================================================*/

/*==============================================================================
=
= ALMACÉN DE MÉTRICAS
=
==============================================================================*/

private metrics:CPVEngineMetrics={

    totalSearches:0,

    successfulSearches:0,

    failedSearches:0,

    averageConfidence:0,

    averageSearchTime:0

};



/*==============================================================================
=
= REGISTRO DE MÉTRICAS
=
==============================================================================*/

public registerSearchMetrics(

    confidence:number,

    elapsedMilliseconds:number,

    success:boolean

):void{

    this.metrics.totalSearches++;

    this.metrics.lastExecution=new Date();



    if(success){

        this.metrics.successfulSearches++;

    }else{

        this.metrics.failedSearches++;

    }



    this.metrics.averageConfidence=

        (

            (

                this.metrics.averageConfidence*

                (this.metrics.totalSearches-1)

            )

            +

            confidence

        )

        /

        this.metrics.totalSearches;



    this.metrics.averageSearchTime=

        (

            (

                this.metrics.averageSearchTime*

                (this.metrics.totalSearches-1)

            )

            +

            elapsedMilliseconds

        )

        /

        this.metrics.totalSearches;

}



/*==============================================================================
=
= OBTENER MÉTRICAS
=
==============================================================================*/

public getMetrics()

:CPVEngineMetrics{

    return{

        ...this.metrics

    };

}



/*==============================================================================
=
= REINICIAR MÉTRICAS
=
==============================================================================*/

public resetMetrics()

:void{

    this.metrics={

        totalSearches:0,

        successfulSearches:0,

        failedSearches:0,

        averageConfidence:0,

        averageSearchTime:0

    };

}



/*==============================================================================
=
= INFORME DE RENDIMIENTO
=
==============================================================================*/

public performanceReport()

:string{

    return[

        "========== MÉTRICAS ==========",

        "",

        "Búsquedas:",

        this.metrics.totalSearches,

        "",

        "Correctas:",

        this.metrics.successfulSearches,

        "",

        "Fallidas:",

        this.metrics.failedSearches,

        "",

        "Confianza media:",

        this.metrics.averageConfidence.toFixed(2)+" %",

        "",

        "Tiempo medio:",

        this.metrics.averageSearchTime.toFixed(2)+" ms"

    ].join("\n");

}



/*==============================================================================
=
= COMPROBACIÓN DEL MOTOR
=
==============================================================================*/

public healthCheck()

:boolean{

    return(

        this.integrityCheck()

        &&

        this.validateCatalogue()

        &&

        this.businessRules.length>0

    );

}



/*****************************************************************************************
*
* FIN BLOQUE 23 de 24
*
* SIGUIENTE:
*
* CPVEngine.ts
*
* BLOQUE 24 de 24 (FINAL)
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 24 de 24
*
* FINALIZACIÓN DEL MOTOR CPV
*
******************************************************************************************/

/*==============================================================================
=
= CARGA COMPLETA DEL MOTOR
=
==============================================================================*/

private loadDatabase()

:void{

    this.loadBaseCPV();

    this.loadCompatibilityMatrix();

    this.loadContractConfiguration();

    this.loadSolvencyConfiguration();

    this.loadProcedureConfiguration();

    this.loadClauseConfiguration();

    this.loadDocumentationConfiguration();

    this.loadResourcesConfiguration();

    this.loadExecutionConfiguration();

    this.loadKPIConfiguration();

    this.loadRiskConfiguration();

    this.loadReuseConfiguration();

    this.loadBusinessRules();

}



/*==============================================================================
=
= INICIALIZACIÓN
=
==============================================================================*/

public initializeEngine()

:void{

    this.clearDatabase();

    this.compatibilityMatrix=[];

    this.businessRules=[];

    this.contractConfiguration.clear();

    this.solvencyConfiguration.clear();

    this.procedureConfiguration.clear();

    this.clauseConfiguration.clear();

    this.documentationConfiguration.clear();

    this.resourcesConfiguration.clear();

    this.executionConfiguration.clear();

    this.kpiConfiguration.clear();

    this.riskConfiguration.clear();

    this.reuseConfiguration.clear();

    this.history.clear();

    this.resetMetrics();

    this.loadDatabase();

}



/*==============================================================================
=
= RESUMEN DEL MOTOR
=
==============================================================================*/

public summary()

:string{

    return [

        "================================",

        "      CPV ENGINE v1.0",

        "================================",

        "",

        "Catálogo CPV",

        "✔",

        "",

        "Búsqueda semántica",

        "✔",

        "",

        "Detección automática",

        "✔",

        "",

        "Compatibilidades",

        "✔",

        "",

        "Procedimientos",

        "✔",

        "",

        "Solvencia",

        "✔",

        "",

        "Cláusulas",

        "✔",

        "",

        "Documentación",

        "✔",

        "",

        "Recursos",

        "✔",

        "",

        "KPIs",

        "✔",

        "",

        "Riesgos",

        "✔",

        "",

        "Reutilización",

        "✔",

        "",

        "Reglas LCSP",

        "✔",

        "",

        "Auditoría",

        "✔",

        "",

        "Métricas",

        "✔",

        "",

        "Estado:",

        "OPERATIVO"

    ].join("\n");

}



/*==============================================================================
=
= VERSIÓN
=
==============================================================================*/

public version()

:string{

    return "CPVEngine v1.0.0";

}



/*****************************************************************************************
*
* FIN DEL ARCHIVO
*
* CPVEngine.ts
*
* MOTOR COMPLETADO
*
******************************************************************************************/

}
