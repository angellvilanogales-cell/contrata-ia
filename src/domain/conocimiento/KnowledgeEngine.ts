/*****************************************************************************************
*
* KnowledgeEngine.ts
*
* Motor central de conocimiento jurídico.
*
* Funciones:
*
*  - Base normativa LCSP
*  - Reglamentos
*  - Directivas
*  - Jurisprudencia
*  - Doctrina
*  - Relaciones jurídicas
*  - Explicaciones
*  - Motor semántico
*  - Recuperación de conocimiento
*
******************************************************************************************/

import { randomUUID } from "crypto";



/*==============================================================================
=
= TIPOS BÁSICOS
=
==============================================================================*/

export type UUID = string;



export enum KnowledgeSource{

    LCSP="LCSP",

    RD817="RD817",

    RGLCAP="RGLCAP",

    DIRECTIVE="DIRECTIVE",

    JCCA="JCCA",

    TACRC="TACRC",

    TARCJA="TARCJA",

    TS="TS",

    TJUE="TJUE",

    INTERNAL="INTERNAL"

}



export enum KnowledgeCategory{

    ARTICLE="ARTICLE",

    PROCEDURE="PROCEDURE",

    SOLVENCY="SOLVENCY",

    AWARD="AWARD",

    EXECUTION="EXECUTION",

    MODIFICATION="MODIFICATION",

    TERMINATION="TERMINATION",

    JURISPRUDENCE="JURISPRUDENCE",

    DOCTRINE="DOCTRINE",

    FAQ="FAQ"

}



export interface KnowledgeReference{

    id:UUID;

    source:KnowledgeSource;

    category:KnowledgeCategory;

    code:string;

    title:string;

    description:string;

    keywords:string[];

    related:string[];

}



export interface SearchRequest{

    text:string;

    categories?:KnowledgeCategory[];

    sources?:KnowledgeSource[];

}



export interface SearchResult{

    reference:KnowledgeReference;

    score:number;

}



/*==============================================================================
=
= KNOWLEDGE ENGINE
=
==============================================================================*/

export class KnowledgeEngine{

    private references:

        Map<UUID,KnowledgeReference>

        =new Map();



    constructor(){

        this.initialize();

    }



    private initialize():void{

        this.loadCoreArticles();

    }



    public register(

        reference:KnowledgeReference

    ):void{

        this.references.set(

            reference.id,

            reference

        );

    }



    public getAll()

    :KnowledgeReference[]{

        return

            [...this.references.values()];

    }



    public getById(

        id:UUID

    ){

        return this.references.get(id);

    }



    public size()

    :number{

        return this.references.size;

    }


/*==============================================================================
=
= CARGA INICIAL
=
==============================================================================*/

private loadCoreArticles()

:void{

    this.register({

        id:randomUUID(),

        source:KnowledgeSource.LCSP,

        category:KnowledgeCategory.ARTICLE,

        code:"LCSP-1",

        title:"Objeto y finalidad",

        description:

            "Principios generales de la contratación pública.",

        keywords:[

            "objeto",

            "principios",

            "contratación"

        ],

        related:[]

    });

}



/*****************************************************************************************
*
* FIN BLOQUE 1 de 18
*
* SIGUIENTE:
*
* KnowledgeEngine.ts
*
* BLOQUE 2 de 18
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 2 de 18
*
* ESTRUCTURAS DE CONOCIMIENTO
*
******************************************************************************************/

/*==============================================================================
=
= ARTÍCULOS
=
==============================================================================*/

export interface LegalArticle{

    id:UUID;

    article:string;

    title:string;

    summary:string;

    fullText?:string;

    references:string[];

}



/*==============================================================================
=
= JURISPRUDENCIA
=
==============================================================================*/

export interface Jurisprudence{

    id:UUID;

    court:string;

    reference:string;

    date:string;

    summary:string;

    keywords:string[];

    relatedArticles:string[];

}



/*==============================================================================
=
= INFORMES
=
==============================================================================*/

export interface LegalReport{

    id:UUID;

    organization:string;

    code:string;

    title:string;

    summary:string;

    relatedArticles:string[];

}



/*==============================================================================
=
= PREGUNTAS FRECUENTES
=
==============================================================================*/

export interface FAQItem{

    id:UUID;

    question:string;

    answer:string;

    keywords:string[];

}



/*==============================================================================
=
= BASES DE DATOS
=
==============================================================================*/

private articles

:Map<string,LegalArticle>

=new Map();



private jurisprudence

:Map<string,Jurisprudence>

=new Map();



private reports

:Map<string,LegalReport>

=new Map();



private faq

:Map<string,FAQItem>

=new Map();



/*==============================================================================
=
= REGISTRO DE ARTÍCULOS
=
==============================================================================*/

public registerArticle(

    article:LegalArticle

):void{

    this.articles.set(

        article.article,

        article

    );

}



/*==============================================================================
=
= REGISTRO DE JURISPRUDENCIA
=
==============================================================================*/

public registerJurisprudence(

    item:Jurisprudence

):void{

    this.jurisprudence.set(

        item.reference,

        item

    );

}



/*==============================================================================
=
= REGISTRO DE INFORMES
=
==============================================================================*/

public registerReport(

    report:LegalReport

):void{

    this.reports.set(

        report.code,

        report

    );

}



/*==============================================================================
=
= REGISTRO FAQ
=
==============================================================================*/

public registerFAQ(

    item:FAQItem

):void{

    this.faq.set(

        item.id,

        item

    );

}



/*==============================================================================
=
= CONSULTAS
=
==============================================================================*/

public getArticle(

    article:string

){

    return this.articles.get(article);

}



public getReport(

    code:string

){

    return this.reports.get(code);

}



public getJurisprudence(

    reference:string

){

    return this.jurisprudence.get(reference);

}



public getFAQ(

    id:string

){

    return this.faq.get(id);

}



/*****************************************************************************************
*
* FIN BLOQUE 2 de 18
*
* SIGUIENTE:
*
* KnowledgeEngine.ts
*
* BLOQUE 3 de 18
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 3 de 18
*
* CARGA DE LA BASE NORMATIVA PRINCIPAL
*
******************************************************************************************/

/*==============================================================================
=
= LCSP
=
==============================================================================*/

private loadLCSP()

:void{

    this.registerArticle({

        id:randomUUID(),

        article:"1",

        title:"Objeto y finalidad",

        summary:
            "Principios generales de la contratación pública.",

        references:[]

    });



    this.registerArticle({

        id:randomUUID(),

        article:"28",

        title:"Necesidad e idoneidad",

        summary:
            "Justificación de la necesidad del contrato.",

        references:["1"]

    });



    this.registerArticle({

        id:randomUUID(),

        article:"99",

        title:"Objeto del contrato",

        summary:
            "Definición del objeto y división en lotes.",

        references:["28"]

    });



    this.registerArticle({

        id:randomUUID(),

        article:"100",

        title:"Presupuesto base de licitación",

        summary:
            "Determinación del presupuesto.",

        references:["101","102"]

    });



    this.registerArticle({

        id:randomUUID(),

        article:"101",

        title:"Valor estimado",

        summary:
            "Método de cálculo del valor estimado.",

        references:["100"]

    });



    this.registerArticle({

        id:randomUUID(),

        article:"116",

        title:"Expediente de contratación",

        summary:
            "Contenido obligatorio del expediente.",

        references:["28","100"]

    });



    this.registerArticle({

        id:randomUUID(),

        article:"117",

        title:"Aprobación del expediente",

        summary:
            "Requisitos para aprobar el expediente.",

        references:["116"]

    });

}



/*==============================================================================
=
= REGLAMENTO GENERAL
=
==============================================================================*/

private loadRGLCAP()

:void{

    this.register({

        id:randomUUID(),

        source:KnowledgeSource.RGLCAP,

        category:KnowledgeCategory.DOCTRINE,

        code:"RGLCAP",

        title:"Reglamento General",

        description:
            "Normativa reglamentaria complementaria.",

        keywords:[

            "reglamento",

            "rglcap"

        ],

        related:[

            "LCSP"

        ]

    });

}



/*==============================================================================
=
= RD 817/2009
=
==============================================================================*/

private loadRD817()

:void{

    this.register({

        id:randomUUID(),

        source:KnowledgeSource.RD817,

        category:KnowledgeCategory.DOCTRINE,

        code:"RD817",

        title:"RD 817/2009",

        description:
            "Desarrollo parcial de la LCSP.",

        keywords:[

            "rd817"

        ],

        related:[

            "LCSP"

        ]

    });

}



/*==============================================================================
=
= DIRECTIVAS EUROPEAS
=
==============================================================================*/

private loadDirectives()

:void{

    this.register({

        id:randomUUID(),

        source:KnowledgeSource.DIRECTIVE,

        category:KnowledgeCategory.DOCTRINE,

        code:"DIR2014/24",

        title:"Directiva 2014/24/UE",

        description:
            "Contratación pública europea.",

        keywords:[

            "ue",

            "directiva"

        ],

        related:[

            "LCSP"

        ]

    });

}



/*==============================================================================
=
= CARGA GENERAL
=
==============================================================================*/

private loadCoreKnowledge()

:void{

    this.loadLCSP();

    this.loadRGLCAP();

    this.loadRD817();

    this.loadDirectives();

}

      /*****************************************************************************************
*
* BLOQUE 4 de 18
*
* RELACIONES ENTRE NORMAS
*
******************************************************************************************/

/*==============================================================================
=
= RELACIÓN NORMATIVA
=
==============================================================================*/

export interface LegalRelationship{

    id:UUID;

    sourceCode:string;

    targetCode:string;

    relationship:string;

    description:string;

}



/*==============================================================================
=
= BASE DE RELACIONES
=
==============================================================================*/

private relationships

:LegalRelationship[]

=[];



/*==============================================================================
=
= REGISTRO
=
==============================================================================*/

public registerRelationship(

    relationship:LegalRelationship

):void{

    this.relationships.push(

        relationship

    );

}



/*==============================================================================
=
= CONSULTA POR ORIGEN
=
==============================================================================*/

public getRelationships(

    sourceCode:string

)

:LegalRelationship[]{

    return this.relationships.filter(

        r=>r.sourceCode===sourceCode

    );

}



/*==============================================================================
=
= CONSULTA BIDIRECCIONAL
=
==============================================================================*/

public getRelatedCodes(

    code:string

)

:string[]{

    return this.relationships

        .filter(

            r=>

                r.sourceCode===code ||

                r.targetCode===code

        )

        .map(

            r=>

                r.sourceCode===code

                ?r.targetCode

                :r.sourceCode

        );

}



/*==============================================================================
=
= CARGA DE RELACIONES LCSP
=
==============================================================================*/

private loadArticleRelationships()

:void{

    this.registerRelationship({

        id:randomUUID(),

        sourceCode:"28",

        targetCode:"116",

        relationship:"REQUIRES",

        description:

            "La necesidad justificada forma parte del expediente."

    });



    this.registerRelationship({

        id:randomUUID(),

        sourceCode:"99",

        targetCode:"100",

        relationship:"DEPENDS_ON",

        description:

            "El objeto condiciona el presupuesto."

    });



    this.registerRelationship({

        id:randomUUID(),

        sourceCode:"100",

        targetCode:"101",

        relationship:"DEPENDS_ON",

        description:

            "El presupuesto depende del valor estimado."

    });



    this.registerRelationship({

        id:randomUUID(),

        sourceCode:"116",

        targetCode:"117",

        relationship:"PRECEDES",

        description:

            "El expediente debe estar completo antes de aprobarse."

    });

}



/*==============================================================================
=
= MATRIZ DE DEPENDENCIAS
=
==============================================================================*/

public buildDependencyGraph()

:Map<string,string[]>{

    const graph=

        new Map<string,string[]>();



    for(

        const relation

        of

        this.relationships

    ){

        if(

            !graph.has(

                relation.sourceCode

            )

        ){

            graph.set(

                relation.sourceCode,

                []

            );

        }



        graph.get(

            relation.sourceCode

        )!.push(

            relation.targetCode

        );

    }



    return graph;

}



/*==============================================================================
=
= CARGA GENERAL
=
==============================================================================*/

private loadRelationships()

:void{

    this.loadArticleRelationships();

}

/*****************************************************************************************
*
* BLOQUE 5 de 18
*
* BUSCADOR SEMÁNTICO
*
******************************************************************************************/

/*==============================================================================
=
= NORMALIZACIÓN
=
==============================================================================*/

private normalizeText(

    text:string

):string{

    return text

        .toLowerCase()

        .normalize("NFD")

        .replace(/[\u0300-\u036f]/g,"")

        .trim();

}



/*==============================================================================
=
= TOKENIZACIÓN
=
==============================================================================*/

private tokenize(

    text:string

):string[]{

    return this

        .normalizeText(text)

        .split(/[\s,.;:()\-_/]+/)

        .filter(

            token=>token.length>2

        );

}



/*==============================================================================
=
= CÁLCULO DE SIMILITUD
=
==============================================================================*/

private similarity(

    request:string[],

    candidate:string[]

):number{

    let matches=0;

    for(

        const token

        of

        request

    ){

        if(

            candidate.includes(token)

        ){

            matches++;

        }

    }

    return matches;

}



/*==============================================================================
=
= BÚSQUEDA GENERAL
=
==============================================================================*/

public search(

    request:SearchRequest

):SearchResult[]{

    const tokens=

        this.tokenize(

            request.text

        );



    const results:SearchResult[]=[];



    for(

        const reference

        of

        this.references.values()

    ){

        if(

            request.sources &&

            !request.sources.includes(reference.source)

        ){

            continue;

        }



        if(

            request.categories &&

            !request.categories.includes(reference.category)

        ){

            continue;

        }



        const candidate=[

            ...reference.keywords,

            reference.title,

            reference.description

        ]

        .join(" ");



        const score=

            this.similarity(

                tokens,

                this.tokenize(candidate)

            );



        if(score>0){

            results.push({

                reference,

                score

            });

        }

    }



    return results.sort(

        (a,b)=>b.score-a.score

    );

}



/*==============================================================================
=
= BÚSQUEDA POR PALABRA CLAVE
=
==============================================================================*/

public searchKeyword(

    keyword:string

):KnowledgeReference[]{

    const value=

        this.normalizeText(keyword);



    return

        [...this.references.values()]

        .filter(

            reference=>

                reference.keywords.some(

                    keyword=>

                        this.normalizeText(keyword)

                        ===value

                )

        );

}



/*==============================================================================
=
= BÚSQUEDA POR CÓDIGO
=
==============================================================================*/

public searchCode(

    code:string

):KnowledgeReference|undefined{

    return

        [...this.references.values()]

        .find(

            reference=>

                reference.code===code

        );

}



/*****************************************************************************************
*
* FIN BLOQUE 5 de 18
*
* SIGUIENTE:
*
* KnowledgeEngine.ts
*
* BLOQUE 6 de 18
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 6 de 18
*
* RECUPERACIÓN INTELIGENTE DE CONOCIMIENTO (RAG INTERNO)
*
******************************************************************************************/

/*==============================================================================
=
= CONTEXTO RECUPERADO
=
==============================================================================*/

export interface KnowledgeContext{

    references:KnowledgeReference[];

    articles:LegalArticle[];

    reports:LegalReport[];

    jurisprudence:Jurisprudence[];

    faq:FAQItem[];

}



/*==============================================================================
=
= RECUPERACIÓN GLOBAL
=
==============================================================================*/

public retrieveKnowledge(

    query:string

):KnowledgeContext{

    return{

        references:

            this.search({

                text:query

            }).map(

                result=>result.reference

            ),

        articles:

            this.retrieveArticles(query),

        reports:

            this.retrieveReports(query),

        jurisprudence:

            this.retrieveJurisprudence(query),

        faq:

            this.retrieveFAQ(query)

    };

}



/*==============================================================================
=
= ARTÍCULOS
=
==============================================================================*/

private retrieveArticles(

    query:string

):LegalArticle[]{

    const tokens=

        this.tokenize(query);



    return

        [...this.articles.values()]

        .filter(

            article=>

                tokens.some(

                    token=>

                        this.tokenize(

                            article.title+

                            " "+

                            article.summary

                        ).includes(token)

                )

        );

}



/*==============================================================================
=
= INFORMES
=
==============================================================================*/

private retrieveReports(

    query:string

):LegalReport[]{

    const tokens=

        this.tokenize(query);



    return

        [...this.reports.values()]

        .filter(

            report=>

                tokens.some(

                    token=>

                        this.tokenize(

                            report.title+

                            " "+

                            report.summary

                        ).includes(token)

                )

        );

}



/*==============================================================================
=
= JURISPRUDENCIA
=
==============================================================================*/

private retrieveJurisprudence(

    query:string

):Jurisprudence[]{

    const tokens=

        this.tokenize(query);



    return

        [...this.jurisprudence.values()]

        .filter(

            item=>

                tokens.some(

                    token=>

                        this.tokenize(

                            item.summary+

                            " "+

                            item.reference

                        ).includes(token)

                )

        );

}



/*==============================================================================
=
= FAQ
=
==============================================================================*/

private retrieveFAQ(

    query:string

):FAQItem[]{

    const tokens=

        this.tokenize(query);



    return

        [...this.faq.values()]

        .filter(

            item=>

                tokens.some(

                    token=>

                        this.tokenize(

                            item.question+

                            " "+

                            item.answer

                        ).includes(token)

                )

        );

}



/*==============================================================================
=
= EXISTE CONOCIMIENTO
=
==============================================================================*/

public hasKnowledge(

    query:string

):boolean{

    const context=

        this.retrieveKnowledge(query);



    return(

        context.references.length>0 ||

        context.articles.length>0 ||

        context.reports.length>0 ||

        context.jurisprudence.length>0 ||

        context.faq.length>0

    );

}



/*****************************************************************************************
*
* FIN BLOQUE 6 de 18
*
* SIGUIENTE:
*
* KnowledgeEngine.ts
*
* BLOQUE 7 de 18
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 7 de 18
*
* MOTOR DE FUNDAMENTACIÓN JURÍDICA
*
******************************************************************************************/

/*==============================================================================
=
= FUNDAMENTO JURÍDICO
=
==============================================================================*/

export interface LegalFoundation{

    title:string;

    motivation:string;

    references:KnowledgeReference[];

    articles:LegalArticle[];

    jurisprudence:Jurisprudence[];

    reports:LegalReport[];

}



/*==============================================================================
=
= GENERACIÓN DE FUNDAMENTO
=
==============================================================================*/

public buildLegalFoundation(

    query:string

):LegalFoundation{

    const context=

        this.retrieveKnowledge(query);



    return{

        title:

            this.generateTitle(query),

        motivation:

            this.generateMotivation(

                context

            ),

        references:

            context.references,

        articles:

            context.articles,

        jurisprudence:

            context.jurisprudence,

        reports:

            context.reports

    };

}



/*==============================================================================
=
= TÍTULO
=
==============================================================================*/

private generateTitle(

    query:string

):string{

    return

        "Fundamentación jurídica para: "+

        query;

}



/*==============================================================================
=
= MOTIVACIÓN
=
==============================================================================*/

private generateMotivation(

    context:KnowledgeContext

):string{

    const text:string[]=[];



    if(

        context.articles.length>0

    ){

        text.push(

            "Se han localizado "+

            context.articles.length+

            " artículos relacionados."

        );

    }



    if(

        context.reports.length>0

    ){

        text.push(

            "Existen informes doctrinales aplicables."

        );

    }



    if(

        context.jurisprudence.length>0

    ){

        text.push(

            "La jurisprudencia refuerza la interpretación."

        );

    }



    if(

        text.length===0

    ){

        text.push(

            "No existe conocimiento suficiente para fundamentar automáticamente."

        );

    }



    return text.join(" ");

}



/*==============================================================================
=
= ARTÍCULOS RELEVANTES
=
==============================================================================*/

public getRelevantArticles(

    query:string

):LegalArticle[]{

    return

        this.retrieveKnowledge(query)

            .articles;

}



/*==============================================================================
=
= INFORMES RELEVANTES
=
==============================================================================*/

public getRelevantReports(

    query:string

):LegalReport[]{

    return

        this.retrieveKnowledge(query)

            .reports;

}



/*==============================================================================
=
= JURISPRUDENCIA RELEVANTE
=
==============================================================================*/

public getRelevantJurisprudence(

    query:string

):Jurisprudence[]{

    return

        this.retrieveKnowledge(query)

            .jurisprudence;

}



/*==============================================================================
=
= RESUMEN JURÍDICO
=
==============================================================================*/

public buildSummary(

    query:string

):string{

    const foundation=

        this.buildLegalFoundation(query);



    return [

        foundation.title,

        foundation.motivation

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 7 de 18
*
* SIGUIENTE:
*
* KnowledgeEngine.ts
*
* BLOQUE 8 de 18
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 8 de 18
*
* MOTOR DE EXPLICACIÓN JURÍDICA
*
******************************************************************************************/

/*==============================================================================
=
= EXPLICACIÓN
=
==============================================================================*/

export interface LegalExplanation{

    title:string;

    technicalExplanation:string;

    simplifiedExplanation:string;

    recommendations:string[];

}



/*==============================================================================
=
= GENERACIÓN DE EXPLICACIONES
=
==============================================================================*/

public explain(

    query:string

):LegalExplanation{

    const context=

        this.retrieveKnowledge(query);



    return{

        title:

            "Explicación jurídica",

        technicalExplanation:

            this.buildTechnicalExplanation(

                context

            ),

        simplifiedExplanation:

            this.buildSimpleExplanation(

                context

            ),

        recommendations:

            this.buildRecommendations(

                context

            )

    };

}



/*==============================================================================
=
= EXPLICACIÓN TÉCNICA
=
==============================================================================*/

private buildTechnicalExplanation(

    context:KnowledgeContext

):string{

    const lines:string[]=[];



    if(context.articles.length){

        lines.push(

            "Se aplican "

            +context.articles.length+

            " artículos de referencia."

        );

    }



    if(context.jurisprudence.length){

        lines.push(

            "Existe jurisprudencia relacionada."

        );

    }



    if(context.reports.length){

        lines.push(

            "Se han localizado informes doctrinales."

        );

    }



    if(lines.length===0){

        lines.push(

            "No existe información jurídica suficiente."

        );

    }



    return lines.join(" ");

}



/*==============================================================================
=
= EXPLICACIÓN SIMPLE
=
==============================================================================*/

private buildSimpleExplanation(

    context:KnowledgeContext

):string{

    if(

        context.articles.length===0

    ){

        return

        "No se ha encontrado normativa específica.";

    }



    return

    "El sistema ha localizado la normativa más adecuada para justificar la decisión y facilitar la elaboración del expediente.";

}



/*==============================================================================
=
= RECOMENDACIONES
=
==============================================================================*/

private buildRecommendations(

    context:KnowledgeContext

):string[]{

    const recommendations:string[]=[];



    if(context.articles.length){

        recommendations.push(

            "Revisar los artículos propuestos."

        );

    }



    if(context.reports.length){

        recommendations.push(

            "Consultar los informes relacionados."

        );

    }



    if(context.jurisprudence.length){

        recommendations.push(

            "Valorar la jurisprudencia aplicable."

        );

    }



    if(recommendations.length===0){

        recommendations.push(

            "Completar información del expediente."

        );

    }



    return recommendations;

}



/*==============================================================================
=
= EXPLICACIÓN PARA USUARIO
=
==============================================================================*/

public explainForCitizen(

    query:string

):string{

    return this

        .explain(query)

        .simplifiedExplanation;

}



/*==============================================================================
=
= EXPLICACIÓN PARA TÉCNICO
=
==============================================================================*/

public explainForTechnician(

    query:string

):string{

    return this

        .explain(query)

        .technicalExplanation;

}



/*****************************************************************************************
*
* FIN BLOQUE 8 de 18
*
* SIGUIENTE:
*
* KnowledgeEngine.ts
*
* BLOQUE 9 de 18
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 9 de 18
*
* MOTOR DE REFERENCIAS CRUZADAS
*
******************************************************************************************/

/*==============================================================================
=
= REFERENCIA CRUZADA
=
==============================================================================*/

export interface CrossReference{

    source:string;

    target:string;

    reason:string;

    weight:number;

}



/*==============================================================================
=
= BASE DE REFERENCIAS
=
==============================================================================*/

private crossReferences

:CrossReference[]

=[];



/*==============================================================================
=
= REGISTRO
=
==============================================================================*/

public registerCrossReference(

    reference:CrossReference

):void{

    this.crossReferences.push(

        reference

    );

}



/*==============================================================================
=
= CONSULTA
=
==============================================================================*/

public getCrossReferences(

    code:string

):CrossReference[]{

    return this.crossReferences.filter(

        r=>

            r.source===code ||

            r.target===code

    );

}



/*==============================================================================
=
= CARGA LCSP
=
==============================================================================*/

private loadCrossReferences()

:void{

    this.registerCrossReference({

        source:"28",

        target:"116",

        reason:

            "La necesidad forma parte del expediente.",

        weight:100

    });



    this.registerCrossReference({

        source:"99",

        target:"100",

        reason:

            "El objeto condiciona el presupuesto.",

        weight:95

    });



    this.registerCrossReference({

        source:"100",

        target:"101",

        reason:

            "El presupuesto depende del valor estimado.",

        weight:100

    });



    this.registerCrossReference({

        source:"101",

        target:"116",

        reason:

            "El valor estimado integra el expediente.",

        weight:90

    });



    this.registerCrossReference({

        source:"116",

        target:"117",

        reason:

            "La aprobación requiere expediente completo.",

        weight:100

    });

}



/*==============================================================================
=
= RELACIONES DIRECTAS
=
==============================================================================*/

public getDirectRelations(

    code:string

):string[]{

    return this

        .getCrossReferences(code)

        .map(

            reference=>

                reference.source===code

                ?reference.target

                :reference.source

        );

}



/*==============================================================================
=
= BÚSQUEDA EN CADENA
=
==============================================================================*/

public traceKnowledgePath(

    start:string,

    depth:number=3

):string[]{

    const visited=

        new Set<string>();



    const result:string[]=[];



    const visit=(

        node:string,

        level:number

    )=>{

        if(

            level>depth ||

            visited.has(node)

        ){

            return;

        }



        visited.add(node);

        result.push(node);



        for(

            const next

            of

            this.getDirectRelations(node)

        ){

            visit(

                next,

                level+1

            );

        }

    };



    visit(

        start,

        0

    );



    return result;

}



/*==============================================================================
=
= MATRIZ DE CONOCIMIENTO
=
==============================================================================*/

public buildKnowledgeMatrix()

:Map<string,string[]>{

    const matrix=

        new Map<string,string[]>();



    for(

        const relation

        of

        this.crossReferences

    ){

        if(

            !matrix.has(

                relation.source

            )

        ){

            matrix.set(

                relation.source,

                []

            );

        }



        matrix.get(

            relation.source

        )!.push(

            relation.target

        );

    }



    return matrix;

}



/*****************************************************************************************
*
* FIN BLOQUE 9 de 18
*
* SIGUIENTE:
*
* KnowledgeEngine.ts
*
* BLOQUE 10 de 18
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 10 de 18
*
* MOTOR DE CLASIFICACIÓN DEL CONOCIMIENTO
*
******************************************************************************************/

/*==============================================================================
=
= NIVELES DE IMPORTANCIA
=
==============================================================================*/

export enum KnowledgeImportance{

    LOW=1,

    NORMAL=2,

    HIGH=3,

    CRITICAL=4

}



/*==============================================================================
=
= NIVELES DE CONFIANZA
=
==============================================================================*/

export enum KnowledgeConfidence{

    LOW=25,

    MEDIUM=50,

    HIGH=75,

    VERIFIED=100

}



/*==============================================================================
=
= CLASIFICACIÓN
=
==============================================================================*/

export interface KnowledgeClassification{

    code:string;

    importance:KnowledgeImportance;

    confidence:KnowledgeConfidence;

    automatic:boolean;

}



/*==============================================================================
=
= BASE DE CLASIFICACIONES
=
==============================================================================*/

private classifications

:Map<string,KnowledgeClassification>

=new Map();



/*==============================================================================
=
= REGISTRO
=
==============================================================================*/

public registerClassification(

    classification:KnowledgeClassification

):void{

    this.classifications.set(

        classification.code,

        classification

    );

}



/*==============================================================================
=
= CONSULTA
=
==============================================================================*/

public getClassification(

    code:string

):KnowledgeClassification|undefined{

    return this.classifications.get(code);

}



/*==============================================================================
=
= CARGA AUTOMÁTICA
=
==============================================================================*/

private loadKnowledgeClassification()

:void{

    this.registerClassification({

        code:"28",

        importance:

            KnowledgeImportance.CRITICAL,

        confidence:

            KnowledgeConfidence.VERIFIED,

        automatic:true

    });



    this.registerClassification({

        code:"99",

        importance:

            KnowledgeImportance.CRITICAL,

        confidence:

            KnowledgeConfidence.VERIFIED,

        automatic:true

    });



    this.registerClassification({

        code:"100",

        importance:

            KnowledgeImportance.CRITICAL,

        confidence:

            KnowledgeConfidence.VERIFIED,

        automatic:true

    });



    this.registerClassification({

        code:"101",

        importance:

            KnowledgeImportance.CRITICAL,

        confidence:

            KnowledgeConfidence.VERIFIED,

        automatic:true

    });



    this.registerClassification({

        code:"116",

        importance:

            KnowledgeImportance.CRITICAL,

        confidence:

            KnowledgeConfidence.VERIFIED,

        automatic:true

    });



    this.registerClassification({

        code:"117",

        importance:

            KnowledgeImportance.HIGH,

        confidence:

            KnowledgeConfidence.VERIFIED,

        automatic:true

    });

}



/*==============================================================================
=
= ORDENACIÓN
=
==============================================================================*/

public sortByImportance(

    references:KnowledgeReference[]

):KnowledgeReference[]{

    return references.sort(

        (a,b)=>{

            const ca=

                this.classifications.get(a.code);

            const cb=

                this.classifications.get(b.code);



            const ia=

                ca?.importance??0;

            const ib=

                cb?.importance??0;



            return ib-ia;

        }

    );

}



/*==============================================================================
=
= FILTRO DE CONFIANZA
=
==============================================================================*/

public filterByConfidence(

    minimum:KnowledgeConfidence

):KnowledgeClassification[]{

    return

        [...this.classifications.values()]

        .filter(

            classification=>

                classification.confidence>=minimum

        );

}



/*****************************************************************************************
*
* FIN BLOQUE 10 de 18
*
* SIGUIENTE:
*
* KnowledgeEngine.ts
*
* BLOQUE 11 de 18
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 11 de 18
*
* MOTOR DE JURISPRUDENCIA Y DOCTRINA
*
******************************************************************************************/

/*==============================================================================
=
= TIPOS DE DOCTRINA
=
==============================================================================*/

export enum DoctrineType{

    JCCA="JCCA",

    TACRC="TACRC",

    TARCJA="TARCJA",

    TRIBUNAL_SUPREMO="TS",

    TJUE="TJUE"

}



/*==============================================================================
=
= DOCUMENTO DOCTRINAL
=
==============================================================================*/

export interface DoctrineDocument{

    id:UUID;

    type:DoctrineType;

    code:string;

    title:string;

    date:string;

    summary:string;

    keywords:string[];

    relatedArticles:string[];

}



/*==============================================================================
=
= BASE DE DOCTRINA
=
==============================================================================*/

private doctrine

:Map<string,DoctrineDocument>

=new Map();



/*==============================================================================
=
= REGISTRO
=
==============================================================================*/

public registerDoctrine(

    document:DoctrineDocument

):void{

    this.doctrine.set(

        document.code,

        document

    );

}



/*==============================================================================
=
= CONSULTA
=
==============================================================================*/

public getDoctrine(

    code:string

):DoctrineDocument|undefined{

    return this.doctrine.get(code);

}



/*==============================================================================
=
= BÚSQUEDA
=
==============================================================================*/

public searchDoctrine(

    query:string

):DoctrineDocument[]{

    const tokens=

        this.tokenize(query);



    return

        [...this.doctrine.values()]

        .filter(

            document=>

                tokens.some(

                    token=>

                        this.tokenize(

                            document.title+

                            " "+

                            document.summary+

                            " "+

                            document.keywords.join(" ")

                        ).includes(token)

                )

        );

}



/*==============================================================================
=
= CARGA INICIAL
=
==============================================================================*/

private loadDoctrine()

:void{

    this.registerDoctrine({

        id:randomUUID(),

        type:DoctrineType.JCCA,

        code:"JCCA-001",

        title:

            "Informe Junta Consultiva",

        date:"",

        summary:

            "Interpretación de la contratación pública.",

        keywords:[

            "interpretación",

            "contratación"

        ],

        relatedArticles:[

            "28",

            "99"

        ]

    });



    this.registerDoctrine({

        id:randomUUID(),

        type:DoctrineType.TACRC,

        code:"TACRC-001",

        title:

            "Resolución TACRC",

        date:"",

        summary:

            "Resolución relevante.",

        keywords:[

            "tacrc"

        ],

        relatedArticles:[

            "116"

        ]

    });

}



/*==============================================================================
=
= CONOCIMIENTO RELACIONADO
=
==============================================================================*/

public getRelatedDoctrine(

    article:string

):DoctrineDocument[]{

    return

        [...this.doctrine.values()]

        .filter(

            document=>

                document.relatedArticles.includes(

                    article

                )

        );

}



/*****************************************************************************************
*
* FIN BLOQUE 11 de 18
*
* SIGUIENTE:
*
* KnowledgeEngine.ts
*
* BLOQUE 12 de 18
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 12 de 18
*
* MOTOR DE VERSIONADO NORMATIVO
*
******************************************************************************************/

/*==============================================================================
=
= VERSIONES NORMATIVAS
=
==============================================================================*/

export interface LegalVersion{

    id:UUID;

    code:string;

    version:string;

    publicationDate:string;

    effectiveDate:string;

    repealDate?:string;

    active:boolean;

    notes:string;

}



/*==============================================================================
=
= HISTÓRICO
=
==============================================================================*/

private legalVersions

:Map<string,LegalVersion[]>

=new Map();



/*==============================================================================
=
= REGISTRO
=
==============================================================================*/

public registerVersion(

    version:LegalVersion

):void{

    const versions=

        this.legalVersions.get(

            version.code

        ) ?? [];



    versions.push(

        version

    );



    this.legalVersions.set(

        version.code,

        versions

    );

}



/*==============================================================================
=
= OBTENER VERSIONES
=
==============================================================================*/

public getVersions(

    code:string

):LegalVersion[]{

    return this.legalVersions.get(

        code

    ) ?? [];

}



/*==============================================================================
=
= VERSIÓN VIGENTE
=
==============================================================================*/

public getCurrentVersion(

    code:string

):LegalVersion|undefined{

    return this.getVersions(

        code

    ).find(

        version=>version.active

    );

}



/*==============================================================================
=
= COMPROBAR VIGENCIA
=
==============================================================================*/

public isCurrent(

    code:string,

    version:string

):boolean{

    return this.getVersions(

        code

    ).some(

        item=>

            item.version===version &&

            item.active

    );

}



/*==============================================================================
=
= CARGA INICIAL
=
==============================================================================*/

private loadLegalVersions()

:void{

    this.registerVersion({

        id:randomUUID(),

        code:"LCSP",

        version:"Ley 9/2017",

        publicationDate:"2017-11-09",

        effectiveDate:"2018-03-09",

        active:true,

        notes:

            "Versión vigente."

    });



    this.registerVersion({

        id:randomUUID(),

        code:"DIRECTIVE2014/24",

        version:"2014",

        publicationDate:"2014-02-26",

        effectiveDate:"2014-04-17",

        active:true,

        notes:

            "Directiva europea."

    });

}



/*==============================================================================
=
= CAMBIOS NORMATIVOS
=
==============================================================================*/

public detectVersionChanges(

    code:string,

    version:string

):string[]{

    const current=

        this.getCurrentVersion(

            code

        );



    if(

        !current

    ){

        return [

            "No existe versión registrada."

        ];

    }



    if(

        current.version===version

    ){

        return [

            "La versión indicada es la vigente."

        ];

    }



    return [

        "Existe una versión más reciente.",

        "Versión vigente: "+

        current.version

    ];

}



/*****************************************************************************************
*
* FIN BLOQUE 12 de 18
*
* SIGUIENTE:
*
* KnowledgeEngine.ts
*
* BLOQUE 13 de 18
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 13 de 18
*
* MOTOR DE INTERPRETACIÓN JURÍDICA
*
******************************************************************************************/

/*==============================================================================
=
= INTERPRETACIONES
=
==============================================================================*/

export enum InterpretationType{

    LITERAL="LITERAL",

    SYSTEMATIC="SYSTEMATIC",

    TELEOLOGICAL="TELEOLOGICAL",

    JURISPRUDENTIAL="JURISPRUDENTIAL",

    DOCTRINAL="DOCTRINAL"

}



/*==============================================================================
=
= MODELO
=
==============================================================================*/

export interface LegalInterpretation{

    id:UUID;

    article:string;

    type:InterpretationType;

    title:string;

    interpretation:string;

    legalBasis:string[];

    confidence:number;

}



/*==============================================================================
=
= BASE
=
==============================================================================*/

private interpretations

:Map<string,LegalInterpretation[]>

=new Map();



/*==============================================================================
=
= REGISTRO
=
==============================================================================*/

public registerInterpretation(

    interpretation:LegalInterpretation

):void{

    const list=

        this.interpretations.get(

            interpretation.article

        ) ?? [];



    list.push(

        interpretation

    );



    this.interpretations.set(

        interpretation.article,

        list

    );

}



/*==============================================================================
=
= CONSULTA
=
==============================================================================*/

public getInterpretations(

    article:string

):LegalInterpretation[]{

    return this.interpretations.get(

        article

    ) ?? [];

}



/*==============================================================================
=
= MEJOR INTERPRETACIÓN
=
==============================================================================*/

public getBestInterpretation(

    article:string

):LegalInterpretation|undefined{

    return this

        .getInterpretations(article)

        .sort(

            (a,b)=>

                b.confidence-a.confidence

        )[0];

}



/*==============================================================================
=
= CARGA INICIAL
=
==============================================================================*/

private loadInterpretations()

:void{

    this.registerInterpretation({

        id:randomUUID(),

        article:"28",

        type:

            InterpretationType.SYSTEMATIC,

        title:

            "Necesidad del contrato",

        interpretation:

            "La necesidad debe justificarse documentalmente antes del inicio del procedimiento.",

        legalBasis:[

            "28",

            "116"

        ],

        confidence:100

    });



    this.registerInterpretation({

        id:randomUUID(),

        article:"99",

        type:

            InterpretationType.LITERAL,

        title:

            "Objeto contractual",

        interpretation:

            "El objeto debe definirse con precisión y permitir la competencia.",

        legalBasis:[

            "99"

        ],

        confidence:98

    });

}



/*==============================================================================
=
= EXPLICACIÓN
=
==============================================================================*/

public explainInterpretation(

    article:string

):string{

    const interpretation=

        this.getBestInterpretation(

            article

        );



    if(

        !interpretation

    ){

        return

        "No existe interpretación registrada.";

    }



    return [

        interpretation.title,

        interpretation.interpretation

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 13 de 18
*
* SIGUIENTE:
*
* KnowledgeEngine.ts
*
* BLOQUE 14 de 18
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 14 de 18
*
* MOTOR DE MOTIVACIÓN AUTOMÁTICA
*
******************************************************************************************/

/*==============================================================================
=
= MOTIVACIÓN
=
==============================================================================*/

export interface MotivationResult{

    title:string;

    summary:string;

    legalArguments:string[];

    legalReferences:string[];

    recommendations:string[];

}



/*==============================================================================
=
= GENERACIÓN
=
==============================================================================*/

public buildMotivation(

    query:string

):MotivationResult{

    const context=

        this.retrieveKnowledge(query);



    return{

        title:

            "Motivación Jurídica",

        summary:

            this.generateMotivationSummary(

                context

            ),

        legalArguments:

            this.generateArguments(

                context

            ),

        legalReferences:

            this.generateReferences(

                context

            ),

        recommendations:

            this.generateRecommendationList(

                context

            )

    };

}



/*==============================================================================
=
= RESUMEN
=
==============================================================================*/

private generateMotivationSummary(

    context:KnowledgeContext

):string{

    if(

        context.articles.length===0

    ){

        return

        "No existe conocimiento suficiente para elaborar la motivación.";

    }



    return(

        "La decisión propuesta encuentra apoyo en "

        +context.articles.length+

        " artículos y "

        +context.jurisprudence.length+

        " referencias jurisprudenciales."

    );

}



/*==============================================================================
=
= ARGUMENTOS
=
==============================================================================*/

private generateArguments(

    context:KnowledgeContext

):string[]{

    const argumentsList:string[]=[];



    for(

        const article

        of

        context.articles

    ){

        argumentsList.push(

            "Aplicación del artículo "

            +article.article+

            ": "

            +article.title

        );

    }



    return argumentsList;

}



/*==============================================================================
=
= REFERENCIAS
=
==============================================================================*/

private generateReferences(

    context:KnowledgeContext

):string[]{

    return context.references.map(

        reference=>

            reference.code+

            " - "+

            reference.title

    );

}



/*==============================================================================
=
= RECOMENDACIONES
=
==============================================================================*/

private generateRecommendationList(

    context:KnowledgeContext

):string[]{

    const list:string[]=[];



    if(

        context.jurisprudence.length>0

    ){

        list.push(

            "Revisar la jurisprudencia asociada."

        );

    }



    if(

        context.reports.length>0

    ){

        list.push(

            "Consultar los informes doctrinales."

        );

    }



    if(

        context.articles.length>0

    ){

        list.push(

            "Verificar la adecuación de los artículos seleccionados."

        );

    }



    if(

        list.length===0

    ){

        list.push(

            "Completar información antes de motivar jurídicamente."

        );

    }



    return list;

}



/*==============================================================================
=
= TEXTO COMPLETO
=
==============================================================================*/

public buildMotivationText(

    query:string

):string{

    const motivation=

        this.buildMotivation(query);



    return [

        motivation.title,

        "",

        motivation.summary,

        "",

        ...motivation.legalArguments,

        "",

        ...motivation.recommendations

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 14 de 18
*
* SIGUIENTE:
*
* KnowledgeEngine.ts
*
* BLOQUE 15 de 18
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 15 de 18
*
* MOTOR DE EXPLICABILIDAD (EXPLAINABLE AI)
*
******************************************************************************************/

/*==============================================================================
=
= EXPLICABILIDAD
=
==============================================================================*/

export interface ExplainabilityResult{

    decision:string;

    confidence:number;

    reasons:string[];

    articles:string[];

    reports:string[];

    jurisprudence:string[];

    trace:string[];

}



/*==============================================================================
=
= GENERACIÓN
=
==============================================================================*/

public explainDecision(

    query:string

):ExplainabilityResult{

    const context=

        this.retrieveKnowledge(query);



    return{

        decision:

            query,



        confidence:

            this.calculateConfidence(context),



        reasons:

            this.buildReasons(context),



        articles:

            context.articles.map(

                a=>a.article

            ),



        reports:

            context.reports.map(

                r=>r.code

            ),



        jurisprudence:

            context.jurisprudence.map(

                j=>j.reference

            ),



        trace:

            this.buildDecisionTrace(

                context

            )

    };

}



/*==============================================================================
=
= CONFIANZA
=
==============================================================================*/

private calculateConfidence(

    context:KnowledgeContext

):number{

    let score=0;



    score+=

        context.articles.length*20;



    score+=

        context.reports.length*15;



    score+=

        context.jurisprudence.length*20;



    score+=

        context.references.length*5;



    return Math.min(

        score,

        100

    );

}



/*==============================================================================
=
= RAZONES
=
==============================================================================*/

private buildReasons(

    context:KnowledgeContext

):string[]{

    const reasons:string[]=[];



    if(context.articles.length){

        reasons.push(

            "Existe soporte normativo suficiente."

        );

    }



    if(context.jurisprudence.length){

        reasons.push(

            "La interpretación está respaldada por jurisprudencia."

        );

    }



    if(context.reports.length){

        reasons.push(

            "Hay informes doctrinales aplicables."

        );

    }



    if(reasons.length===0){

        reasons.push(

            "No existe suficiente conocimiento jurídico."

        );

    }



    return reasons;

}



/*==============================================================================
=
= TRAZA
=
==============================================================================*/

private buildDecisionTrace(

    context:KnowledgeContext

):string[]{

    const trace:string[]=[];



    trace.push(

        "Consulta recibida"

    );



    trace.push(

        "Búsqueda semántica"

    );



    trace.push(

        "Recuperación normativa"

    );



    if(context.articles.length){

        trace.push(

            "Selección de artículos"

        );

    }



    if(context.reports.length){

        trace.push(

            "Selección doctrinal"

        );

    }



    if(context.jurisprudence.length){

        trace.push(

            "Selección jurisprudencial"

        );

    }



    trace.push(

        "Construcción del fundamento"

    );



    trace.push(

        "Respuesta final"

    );



    return trace;

}



/*==============================================================================
=
= INFORME
=
==============================================================================*/

public generateExplainabilityReport(

    query:string

):string{

    const report=

        this.explainDecision(query);



    return [

        "DECISIÓN",

        report.decision,

        "",

        "CONFIANZA",

        report.confidence+" %",

        "",

        "RAZONES",

        ...report.reasons,

        "",

        "TRAZABILIDAD",

        ...report.trace

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 15 de 18
*
* SIGUIENTE:
*
* KnowledgeEngine.ts
*
* BLOQUE 16 de 18
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 16 de 18
*
* MOTOR DE VALIDACIÓN DEL CONOCIMIENTO
*
******************************************************************************************/

/*==============================================================================
=
= VALIDACIÓN
=
==============================================================================*/

export interface KnowledgeValidationResult{

    valid:boolean;

    score:number;

    errors:string[];

    warnings:string[];

    recommendations:string[];

}



/*==============================================================================
=
= VALIDACIÓN GLOBAL
=
==============================================================================*/

public validateKnowledge(

    query:string

):KnowledgeValidationResult{

    const context=

        this.retrieveKnowledge(query);



    const errors:string[]=[];

    const warnings:string[]=[];

    const recommendations:string[]=[];



    if(

        context.articles.length===0

    ){

        errors.push(

            "No existen artículos asociados."

        );

    }



    if(

        context.references.length===0

    ){

        warnings.push(

            "No existen referencias normativas."

        );

    }



    if(

        context.jurisprudence.length===0

    ){

        recommendations.push(

            "Se recomienda revisar jurisprudencia."

        );

    }



    if(

        context.reports.length===0

    ){

        recommendations.push(

            "No existen informes doctrinales asociados."

        );

    }



    const score=

        this.calculateValidationScore(

            context

        );



    return{

        valid:

            errors.length===0,

        score,

        errors,

        warnings,

        recommendations

    };

}



/*==============================================================================
=
= PUNTUACIÓN
=
==============================================================================*/

private calculateValidationScore(

    context:KnowledgeContext

):number{

    let score=0;



    score+=

        context.articles.length*25;



    score+=

        context.references.length*10;



    score+=

        context.jurisprudence.length*20;



    score+=

        context.reports.length*20;



    score+=

        context.faq.length*5;



    return Math.min(

        score,

        100

    );

}



/*==============================================================================
=
= CONOCIMIENTO SUFICIENTE
=
==============================================================================*/

public hasEnoughKnowledge(

    query:string

):boolean{

    return

        this.validateKnowledge(query)

            .score>=70;

}



/*==============================================================================
=
= CALIDAD
=
==============================================================================*/

public knowledgeQuality(

    query:string

):string{

    const score=

        this.validateKnowledge(query)

            .score;



    if(score>=90){

        return "EXCELENTE";

    }



    if(score>=75){

        return "ALTA";

    }



    if(score>=50){

        return "MEDIA";

    }



    return "BAJA";

}



/*==============================================================================
=
= INFORME
=
==============================================================================*/

public generateValidationReport(

    query:string

):string{

    const validation=

        this.validateKnowledge(query);



    return [

        "VALIDACIÓN",

        "",

        "Resultado: "+

        (validation.valid

            ?"CORRECTO"

            :"INCIDENCIAS"),



        "Puntuación: "+

        validation.score,



        "",

        "Errores:",

        ...validation.errors,



        "",

        "Advertencias:",

        ...validation.warnings,



        "",

        "Recomendaciones:",

        ...validation.recommendations

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 16 de 18
*
* SIGUIENTE:
*
* KnowledgeEngine.ts
*
* BLOQUE 17 de 18
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 17 de 18
*
* MOTOR DE RECOMENDACIONES INTELIGENTES
*
******************************************************************************************/

/*==============================================================================
=
= RECOMENDACIÓN
=
==============================================================================*/

export interface KnowledgeRecommendation{

    priority:number;

    title:string;

    description:string;

    justification:string;

    references:string[];

}



/*==============================================================================
=
= GENERACIÓN DE RECOMENDACIONES
=
==============================================================================*/

public generateRecommendations(

    query:string

):KnowledgeRecommendation[]{

    const context=

        this.retrieveKnowledge(query);



    const recommendations:

        KnowledgeRecommendation[]=[];



    if(context.articles.length>0){

        recommendations.push({

            priority:100,

            title:

                "Revisar artículos seleccionados",

            description:

                "Verificar que la propuesta coincide con la finalidad del contrato.",

            justification:

                "Existe cobertura normativa.",

            references:

                context.articles.map(

                    a=>a.article

                )

        });

    }



    if(context.jurisprudence.length>0){

        recommendations.push({

            priority:90,

            title:

                "Consultar jurisprudencia",

            description:

                "Analizar resoluciones relacionadas.",

            justification:

                "Puede reforzar la motivación.",

            references:

                context.jurisprudence.map(

                    j=>j.reference

                )

        });

    }



    if(context.reports.length>0){

        recommendations.push({

            priority:80,

            title:

                "Consultar doctrina",

            description:

                "Revisar informes de órganos consultivos.",

            justification:

                "Incrementa la seguridad jurídica.",

            references:

                context.reports.map(

                    r=>r.code

                )

        });

    }



    if(recommendations.length===0){

        recommendations.push({

            priority:50,

            title:

                "Completar expediente",

            description:

                "No existe suficiente conocimiento recuperado.",

            justification:

                "Información insuficiente.",

            references:[]

        });

    }



    return recommendations.sort(

        (a,b)=>

            b.priority-a.priority

    );

}



/*==============================================================================
=
= MEJOR RECOMENDACIÓN
=
==============================================================================*/

public getBestRecommendation(

    query:string

):KnowledgeRecommendation|undefined{

    return this.generateRecommendations(

        query

    )[0];

}



/*==============================================================================
=
= RECOMENDACIONES EN TEXTO
=
==============================================================================*/

public recommendationsToText(

    query:string

):string{

    const list=

        this.generateRecommendations(query);



    return list.map(

        recommendation=>

            "["+

            recommendation.priority+

            "] "+

            recommendation.title+

            "\n"+

            recommendation.description+

            "\n"+

            recommendation.justification

    ).join(

        "\n\n"

    );

}



/*==============================================================================
=
= RESUMEN EJECUTIVO
=
==============================================================================*/

public executiveSummary(

    query:string

):string{

    const validation=

        this.validateKnowledge(query);

    const explain=

        this.explainDecision(query);

    const recommendation=

        this.getBestRecommendation(query);



    return [

        "RESUMEN EJECUTIVO",

        "",

        "Confianza: "+

        explain.confidence+" %",

        "",

        "Calidad: "+

        validation.score,

        "",

        "Recomendación:",

        recommendation?.title ?? "Sin recomendaciones"

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 17 de 18
*
* SIGUIENTE:
*
* KnowledgeEngine.ts
*
* BLOQUE 18 de 18
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 18 de 18
*
* CIERRE DEL KNOWLEDGE ENGINE
*
******************************************************************************************/

/*==============================================================================
=
= ESTADÍSTICAS
=
==============================================================================*/

public getStatistics(){

    return{

        references:this.references.size,

        articles:this.articles.size,

        jurisprudence:this.jurisprudence.size,

        reports:this.reports.size,

        doctrine:this.doctrine.size,

        faq:this.faq.size,

        relationships:this.relationships.length,

        interpretations:this.interpretations.size,

        versions:this.legalVersions.size,

        classifications:this.classifications.size

    };

}

/*==============================================================================
=
= CACHE DE CONSULTAS
=
==============================================================================*/

private queryCache

:Map<string,KnowledgeContext>

=new Map();



public clearCache()

:void{

    this.queryCache.clear();

}



public cacheSize()

:number{

    return this.queryCache.size;

}



public retrieveCachedKnowledge(

    query:string

):KnowledgeContext{

    const key=

        this.normalizeText(query);



    const cached=

        this.queryCache.get(key);



    if(cached){

        return cached;

    }



    const context=

        this.retrieveKnowledge(query);



    this.queryCache.set(

        key,

        context

    );



    return context;

}



/*==============================================================================
=
= AUDITORÍA
=
==============================================================================*/

public audit()

:string[]{

    const log:string[]=[];



    log.push(

        "KnowledgeEngine OK"

    );



    log.push(

        "Referencias: "+

        this.references.size

    );



    log.push(

        "Artículos: "+

        this.articles.size

    );



    log.push(

        "Doctrina: "+

        this.doctrine.size

    );



    log.push(

        "Jurisprudencia: "+

        this.jurisprudence.size

    );



    log.push(

        "Informes: "+

        this.reports.size

    );



    return log;

}



/*==============================================================================
=
= CARGA COMPLETA
=
==============================================================================*/

private initialize()

:void{

    this.loadCoreArticles();

    this.loadCoreKnowledge();

    this.loadRelationships();

    this.loadCrossReferences();

    this.loadKnowledgeClassification();

    this.loadDoctrine();

    this.loadLegalVersions();

    this.loadInterpretations();

}



/*==============================================================================
=
= REINICIALIZACIÓN
=
==============================================================================*/

public reload()

:void{

    this.references.clear();

    this.articles.clear();

    this.relationships=[];

    this.crossReferences=[];

    this.jurisprudence.clear();

    this.reports.clear();

    this.doctrine.clear();

    this.interpretations.clear();

    this.classifications.clear();

    this.legalVersions.clear();

    this.faq.clear();

    this.clearCache();



    this.initialize();

}



/*==============================================================================
=
= CONSTRUCTOR DEFINITIVO
=
==============================================================================*/

constructor(){

    this.initialize();

}



/*==============================================================================
=
= EXPORTACIONES
=
==============================================================================*/

export default KnowledgeEngine;

export{

    KnowledgeEngine

};
