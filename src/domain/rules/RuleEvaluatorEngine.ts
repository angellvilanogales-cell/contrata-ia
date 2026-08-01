/*****************************************************************************************
*
* BLOQUE 1 de 24
*
* RULE EVALUATOR ENGINE
*
* MOTOR CENTRAL DE DECISIONES LCSP
*
******************************************************************************************/

import {

    ContractType

} from "../contracts/ContractType";

import {

    CPVCode

} from "../cpv/CPVCode";



/*==============================================================================
=
= NIVEL DE REGLA
=
==============================================================================*/

export enum RuleSeverity{

    INFO="INFO",

    WARNING="WARNING",

    ERROR="ERROR",

    BLOCKING="BLOCKING"

}



/*==============================================================================
=
= RESULTADO DE UNA REGLA
=
==============================================================================*/

export interface RuleResult{

    id:string;

    title:string;

    description:string;

    severity:RuleSeverity;

    passed:boolean;

    recommendation:string;

}



/*==============================================================================
=
= CONTEXTO DEL EXPEDIENTE
=
==============================================================================*/

export interface RuleEvaluationContext{

    contractValue:number;

    contractType:ContractType;

    cpv?:CPVCode;

    estimatedValue:number;

    durationMonths:number;

    lots:boolean;

    europeanFunds:boolean;

    urgent:boolean;

    emergency:boolean;

}



/*==============================================================================
=
= REGLA
=
==============================================================================*/

export interface RuleDefinition{

    id:string;

    name:string;

    description:string;

    execute(

        context:RuleEvaluationContext

    ):RuleResult;

}



/*==============================================================================
=
= RESULTADO GLOBAL
=
==============================================================================*/

export interface RuleEvaluationReport{

    passed:boolean;

    score:number;

    results:RuleResult[];

}



/*==============================================================================
=
= RULE EVALUATOR ENGINE
=
==============================================================================*/

export class RuleEvaluatorEngine{

    private rules:RuleDefinition[]=[];



    constructor(){

        this.loadRules();

    }



/*****************************************************************************************
*
* FIN BLOQUE 1 de 24
*
* SIGUIENTE:
*
* RuleEvaluatorEngine.ts
*
* BLOQUE 2 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 2 de 24
*
* GESTIÓN DEL CATÁLOGO DE REGLAS
*
******************************************************************************************/

/*==============================================================================
=
= REGISTRO DE REGLAS
=
==============================================================================*/

public registerRule(

    rule:RuleDefinition

):void{

    this.rules.push(

        rule

    );

}



/*==============================================================================
=
= ELIMINAR REGLA
=
==============================================================================*/

public removeRule(

    id:string

):boolean{

    const index=

        this.rules.findIndex(

            rule=>

                rule.id===id

        );



    if(index<0){

        return false;

    }



    this.rules.splice(

        index,

        1

    );



    return true;

}



/*==============================================================================
=
= OBTENER REGLA
=
==============================================================================*/

public getRule(

    id:string

):RuleDefinition|undefined{

    return this.rules.find(

        rule=>

            rule.id===id

    );

}



/*==============================================================================
=
= LISTAR REGLAS
=
==============================================================================*/

public getRules()

:RuleDefinition[]{

    return[

        ...this.rules

    ];

}



/*==============================================================================
=
= TOTAL
=
==============================================================================*/

public totalRules()

:number{

    return this.rules.length;

}



/*==============================================================================
=
= EXISTE
=
==============================================================================*/

public exists(

    id:string

):boolean{

    return(

        this.getRule(id)

        !==undefined

    );

}



/*==============================================================================
=
= LIMPIAR
=
==============================================================================*/

public clearRules()

:void{

    this.rules=[];

}



/*==============================================================================
=
= RECARGAR
=
==============================================================================*/

public reloadRules()

:void{

    this.clearRules();

    this.loadRules();

}



/*****************************************************************************************
*
* FIN BLOQUE 2 de 24
*
* SIGUIENTE:
*
* RuleEvaluatorEngine.ts
*
* BLOQUE 3 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 3 de 24
*
* EVALUACIÓN COMPLETA DEL EXPEDIENTE
*
******************************************************************************************/

/*==============================================================================
=
= EVALUAR TODAS LAS REGLAS
=
==============================================================================*/

public evaluate(

    context:RuleEvaluationContext

):RuleEvaluationReport{

    const results:RuleResult[]=[];



    for(

        const rule

        of

        this.rules

    ){

        results.push(

            rule.execute(

                context

            )

        );

    }



    return{

        passed:

            this.allRulesPassed(

                results

            ),

        score:

            this.calculateScore(

                results

            ),

        results

    };

}



/*==============================================================================
=
= TODAS SUPERADAS
=
==============================================================================*/

private allRulesPassed(

    results:RuleResult[]

):boolean{

    return!

    results.some(

        result=>

            !result.passed

            &&

            result.severity===

            RuleSeverity.BLOCKING

    );

}



/*==============================================================================
=
= CÁLCULO DE PUNTUACIÓN
=
==============================================================================*/

private calculateScore(

    results:RuleResult[]

):number{

    if(

        results.length===0

    ){

        return 100;

    }



    const passed=

        results.filter(

            result=>

                result.passed

        ).length;



    return Math.round(

        (

            passed/

            results.length

        )*100

    );

}



/*==============================================================================
=
= REGLAS INCUMPLIDAS
=
==============================================================================*/

public failedRules(

    report:RuleEvaluationReport

):RuleResult[]{

    return report.results.filter(

        result=>

            !result.passed

    );

}



/*==============================================================================
=
= REGLAS SUPERADAS
=
==============================================================================*/

public passedRules(

    report:RuleEvaluationReport

):RuleResult[]{

    return report.results.filter(

        result=>

            result.passed

    );

}



/*****************************************************************************************
*
* FIN BLOQUE 3 de 24
*
* SIGUIENTE:
*
* RuleEvaluatorEngine.ts
*
* BLOQUE 4 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 4 de 24
*
* MOTOR DE INFORMES Y CLASIFICACIÓN DE RESULTADOS
*
******************************************************************************************/

/*==============================================================================
=
= REGLAS BLOQUEANTES
=
==============================================================================*/

public blockingRules(

    report:RuleEvaluationReport

):RuleResult[]{

    return report.results.filter(

        result=>

            result.severity===

            RuleSeverity.BLOCKING

    );

}



/*==============================================================================
=
= ERRORES
=
==============================================================================*/

public errors(

    report:RuleEvaluationReport

):RuleResult[]{

    return report.results.filter(

        result=>

            result.severity===

            RuleSeverity.ERROR

    );

}



/*==============================================================================
=
= ADVERTENCIAS
=
==============================================================================*/

public warnings(

    report:RuleEvaluationReport

):RuleResult[]{

    return report.results.filter(

        result=>

            result.severity===

            RuleSeverity.WARNING

    );

}



/*==============================================================================
=
= INFORMACIÓN
=
==============================================================================*/

public information(

    report:RuleEvaluationReport

):RuleResult[]{

    return report.results.filter(

        result=>

            result.severity===

            RuleSeverity.INFO

    );

}



/*==============================================================================
=
= EXISTEN BLOQUEOS
=
==============================================================================*/

public hasBlockingErrors(

    report:RuleEvaluationReport

):boolean{

    return this.blockingRules(

        report

    ).some(

        result=>

            !result.passed

    );

}



/*==============================================================================
=
= INFORME RESUMIDO
=
==============================================================================*/

public summaryReport(

    report:RuleEvaluationReport

):string{

    return [

        "========== EVALUACIÓN ==========",

        "",

        "Resultado:",

        report.passed

            ?"APROBADO"

            :"REVISAR",

        "",

        "Puntuación:",

        report.score+" %",

        "",

        "Bloqueantes:",

        this.blockingRules(

            report

        ).length,

        "",

        "Errores:",

        this.errors(

            report

        ).length,

        "",

        "Advertencias:",

        this.warnings(

            report

        ).length,

        "",

        "Información:",

        this.information(

            report

        ).length

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 4 de 24
*
* SIGUIENTE:
*
* RuleEvaluatorEngine.ts
*
* BLOQUE 5 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 5 de 24
*
* REGLAS LCSP
*
* CONTRATO MENOR
*
******************************************************************************************/

/*==============================================================================
=
= CARGA DE REGLAS
=
==============================================================================*/

private loadRules()

:void{

    this.loadMinorContractRules();

}



/*==============================================================================
=
= CONTRATO MENOR
=
==============================================================================*/

private loadMinorContractRules()

:void{

    this.registerRule({

        id:"LCSP-MINOR-001",

        name:"Contrato menor",

        description:

            "Comprobación automática de los límites del contrato menor.",

        execute:(

            context

        ):RuleResult=>{

            const limit=

                context.contractType===

                ContractType.WORKS

                ?40000

                :15000;



            const passed=

                context.estimatedValue

                <=

                limit;



            return{

                id:"LCSP-MINOR-001",

                title:"Contrato menor",

                description:

                    "Valor estimado frente al límite legal.",

                severity:

                    RuleSeverity.INFO,

                passed,

                recommendation:

                    passed

                    ?`Puede tramitarse como contrato menor (≤ ${limit.toLocaleString()} €).`

                    :`Debe utilizarse otro procedimiento al superar ${limit.toLocaleString()} €.`

            };

        }

    });

}



/*==============================================================================
=
= CONSULTA
=
==============================================================================*/

public isMinorContract(

    context:RuleEvaluationContext

):boolean{

    const limit=

        context.contractType===

        ContractType.WORKS

        ?40000

        :15000;



    return(

        context.estimatedValue

        <=

        limit

    );

}



/*==============================================================================
=
= INFORME
=
==============================================================================*/

public minorContractReport(

    context:RuleEvaluationContext

):string{

    return[

        "========== CONTRATO MENOR ==========",

        "",

        "Valor estimado:",

        context.estimatedValue.toLocaleString()+" €",

        "",

        "Resultado:",

        this.isMinorContract(

            context

        )

        ?"ADMISIBLE"

        :"NO ADMISIBLE"

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 5 de 24
*
* SIGUIENTE:
*
* RuleEvaluatorEngine.ts
*
* BLOQUE 6 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 6 de 24
*
* REGLAS LCSP
*
* PROCEDIMIENTO DE ADJUDICACIÓN
*
******************************************************************************************/

/*==============================================================================
=
= CARGA
=
==============================================================================*/

private loadProcedureRules()

:void{

    this.registerRule({

        id:"LCSP-PROC-001",

        name:"Procedimiento recomendado",

        description:

            "Determina el procedimiento según el valor estimado.",

        execute:(

            context

        ):RuleResult=>{

            const procedure=

                this.recommendedProcedure(

                    context

                );



            return{

                id:"LCSP-PROC-001",

                title:"Procedimiento",

                description:

                    "Procedimiento recomendado.",

                severity:

                    RuleSeverity.INFO,

                passed:true,

                recommendation:

                    procedure

            };

        }

    });

}



/*==============================================================================
=
= PROCEDIMIENTO
=
==============================================================================*/

public recommendedProcedure(

    context:RuleEvaluationContext

):string{

    if(

        this.isMinorContract(

            context

        )

    ){

        return

        "CONTRATO MENOR";

    }



    if(

        context.estimatedValue

        <100000

    ){

        return

        "ABIERTO SIMPLIFICADO";

    }



    if(

        context.estimatedValue

        <1000000

    ){

        return

        "ABIERTO";

    }



    return

    "ABIERTO SUJETO A REGULACIÓN ARMONIZADA";

}



/*==============================================================================
=
= ES SARA
=
==============================================================================*/

public isSARA(

    context:RuleEvaluationContext

):boolean{

    return(

        context.estimatedValue

        >=1000000

    );

}



/*==============================================================================
=
= INFORME
=
==============================================================================*/

public procedureReport(

    context:RuleEvaluationContext

):string{

    return[

        "======= PROCEDIMIENTO =======",

        "",

        "Valor estimado:",

        context.estimatedValue.toLocaleString()+" €",

        "",

        "Procedimiento:",

        this.recommendedProcedure(

            context

        ),

        "",

        "SARA:",

        this.isSARA(

            context

        )

        ?"SI"

        :"NO"

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 6 de 24
*
* SIGUIENTE:
*
* RuleEvaluatorEngine.ts
*
* BLOQUE 7 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 7 de 24
*
* REGLAS LCSP
*
* SOLVENCIA ECONÓMICA Y TÉCNICA
*
******************************************************************************************/

/*==============================================================================
=
= CARGA
=
==============================================================================*/

private loadSolvencyRules()

:void{

    this.registerRule({

        id:"LCSP-SOL-001",

        name:"Solvencia",

        description:

            "Determina la necesidad de exigir solvencia.",

        execute:(

            context

        ):RuleResult=>{

            const required=

                this.requiresSolvency(

                    context

                );



            return{

                id:"LCSP-SOL-001",

                title:"Solvencia",

                description:

                    "Evaluación automática.",

                severity:

                    RuleSeverity.INFO,

                passed:true,

                recommendation:

                    required

                    ?"Debe exigirse solvencia."

                    :"No resulta necesaria."

            };

        }

    });

}



/*==============================================================================
=
= SOLVENCIA
=
==============================================================================*/

public requiresSolvency(

    context:RuleEvaluationContext

):boolean{

    return(

        !this.isMinorContract(

            context

        )

    );

}



/*==============================================================================
=
= SOLVENCIA ECONÓMICA
=
==============================================================================*/

public requiresEconomicSolvency(

    context:RuleEvaluationContext

):boolean{

    return this.requiresSolvency(

        context

    );

}



/*==============================================================================
=
= SOLVENCIA TÉCNICA
=
==============================================================================*/

public requiresTechnicalSolvency(

    context:RuleEvaluationContext

):boolean{

    return this.requiresSolvency(

        context

    );

}



/*==============================================================================
=
= INFORME
=
==============================================================================*/

public solvencyReport(

    context:RuleEvaluationContext

):string{

    return[

        "========= SOLVENCIA =========",

        "",

        "Económica:",

        this.requiresEconomicSolvency(

            context

        )

        ?"SI"

        :"NO",

        "",

        "Técnica:",

        this.requiresTechnicalSolvency(

            context

        )

        ?"SI"

        :"NO"

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 7 de 24
*
* SIGUIENTE:
*
* RuleEvaluatorEngine.ts
*
* BLOQUE 8 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 8 de 24
*
* REGLAS LCSP
*
* GARANTÍA DEFINITIVA
*
******************************************************************************************/

/*==============================================================================
=
= CARGA
=
==============================================================================*/

private loadGuaranteeRules()

:void{

    this.registerRule({

        id:"LCSP-GAR-001",

        name:"Garantía definitiva",

        description:

            "Determinación automática de la garantía definitiva.",

        execute:(

            context

        ):RuleResult=>{

            const required=

                this.requiresGuarantee(

                    context

                );



            return{

                id:"LCSP-GAR-001",

                title:"Garantía definitiva",

                description:

                    "Aplicación automática.",

                severity:

                    RuleSeverity.INFO,

                passed:true,

                recommendation:

                    required

                    ?`Debe exigirse garantía definitiva (${this.guaranteePercentage()} %).`

                    :"No procede garantía definitiva."

            };

        }

    });

}



/*==============================================================================
=
= GARANTÍA
=
==============================================================================*/

public requiresGuarantee(

    context:RuleEvaluationContext

):boolean{

    return(

        !this.isMinorContract(

            context

        )

    );

}



/*==============================================================================
=
= PORCENTAJE
=
==============================================================================*/

public guaranteePercentage()

:number{

    return 5;

}



/*==============================================================================
=
= IMPORTE
=
==============================================================================*/

public calculateGuarantee(

    context:RuleEvaluationContext

):number{

    if(

        !this.requiresGuarantee(

            context

        )

    ){

        return 0;

    }



    return(

        context.contractValue*

        this.guaranteePercentage()

    )/100;

}



/*==============================================================================
=
= INFORME
=
==============================================================================*/

public guaranteeReport(

    context:RuleEvaluationContext

):string{

    return[

        "======= GARANTÍA DEFINITIVA =======",

        "",

        "Procede:",

        this.requiresGuarantee(

            context

        )

        ?"SI"

        :"NO",

        "",

        "Porcentaje:",

        this.guaranteePercentage()+" %",

        "",

        "Importe:",

        this.calculateGuarantee(

            context

        ).toLocaleString()+" €"

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 8 de 24
*
* SIGUIENTE:
*
* RuleEvaluatorEngine.ts
*
* BLOQUE 9 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 9 de 24
*
* REGLAS LCSP
*
* DIVISIÓN EN LOTES
*
******************************************************************************************/

/*==============================================================================
=
= CARGA
=
==============================================================================*/

private loadLotsRules()

:void{

    this.registerRule({

        id:"LCSP-LOT-001",

        name:"División en lotes",

        description:

            "Evaluación automática de la división en lotes.",

        execute:(

            context

        ):RuleResult=>{

            const recommendation=

                this.lotsRecommendation(

                    context

                );



            return{

                id:"LCSP-LOT-001",

                title:"División en lotes",

                description:

                    "Análisis de la conveniencia de dividir el contrato.",

                severity:

                    RuleSeverity.INFO,

                passed:true,

                recommendation

            };

        }

    });

}



/*==============================================================================
=
= RECOMENDACIÓN
=
==============================================================================*/

public lotsRecommendation(

    context:RuleEvaluationContext

):string{

    if(

        context.lots

    ){

        return

        "El expediente contempla división en lotes.";

    }



    if(

        context.contractValue

        >=200000

    ){

        return

        "Debe justificarse expresamente la no división en lotes.";

    }



    return

    "La división en lotes no resulta imprescindible, aunque debe motivarse la decisión.";

}



/*==============================================================================
=
= JUSTIFICACIÓN
=
==============================================================================*/

public requiresLotsJustification(

    context:RuleEvaluationContext

):boolean{

    return(

        !context.lots

    );

}



/*==============================================================================
=
= INFORME
=
==============================================================================*/

public lotsReport(

    context:RuleEvaluationContext

):string{

    return[

        "======= DIVISIÓN EN LOTES =======",

        "",

        "¿Existe división?:",

        context.lots

            ?"SI"

            :"NO",

        "",

        "¿Debe justificarse?:",

        this.requiresLotsJustification(

            context

        )

        ?"SI"

        :"NO",

        "",

        "Conclusión:",

        this.lotsRecommendation(

            context

        )

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 9 de 24
*
* SIGUIENTE:
*
* RuleEvaluatorEngine.ts
*
* BLOQUE 10 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 10 de 24
*
* REGLAS LCSP
*
* PUBLICIDAD Y PERFIL DEL CONTRATANTE
*
******************************************************************************************/

/*==============================================================================
=
= CARGA
=
==============================================================================*/

private loadPublicationRules()

:void{

    this.registerRule({

        id:"LCSP-PUB-001",

        name:"Publicidad",

        description:

            "Determinación automática de las obligaciones de publicidad.",

        execute:(

            context

        ):RuleResult=>{

            return{

                id:"LCSP-PUB-001",

                title:"Publicidad",

                description:

                    "Publicidad obligatoria del procedimiento.",

                severity:

                    RuleSeverity.INFO,

                passed:true,

                recommendation:

                    this.publicationRecommendation(

                        context

                    )

            };

        }

    });

}



/*==============================================================================
=
= RECOMENDACIÓN
=
==============================================================================*/

public publicationRecommendation(

    context:RuleEvaluationContext

):string{

    if(

        this.isMinorContract(

            context

        )

    ){

        return

        "No procede licitación pública; únicamente publicación de la información exigida por la LCSP.";

    }



    if(

        this.isSARA(

            context

        )

    ){

        return

        "Publicación en Plataforma de Contratación y Diario Oficial de la Unión Europea.";

    }



    return

    "Publicación en la Plataforma de Contratación del Sector Público o perfil del contratante correspondiente.";

}



/*==============================================================================
=
= PUBLICACIÓN EN DOUE
=
==============================================================================*/

public requiresDOUEPublication(

    context:RuleEvaluationContext

):boolean{

    return this.isSARA(

        context

    );

}



/*==============================================================================
=
= PERFIL DEL CONTRATANTE
=
==============================================================================*/

public requiresContractProfile(

    context:RuleEvaluationContext

):boolean{

    return(

        !this.isMinorContract(

            context

        )

    );

}



/*==============================================================================
=
= INFORME
=
==============================================================================*/

public publicationReport(

    context:RuleEvaluationContext

):string{

    return[

        "======= PUBLICIDAD =======",

        "",

        "Perfil del contratante:",

        this.requiresContractProfile(

            context

        )

        ?"SI"

        :"NO",

        "",

        "DOUE:",

        this.requiresDOUEPublication(

            context

        )

        ?"SI"

        :"NO",

        "",

        "Recomendación:",

        this.publicationRecommendation(

            context

        )

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 10 de 24
*
* SIGUIENTE:
*
* RuleEvaluatorEngine.ts
*
* BLOQUE 11 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 11 de 24
*
* REGLAS LCSP
*
* CRITERIOS DE ADJUDICACIÓN
*
******************************************************************************************/

/*==============================================================================
=
= CARGA
=
==============================================================================*/

private loadAwardCriteriaRules()

:void{

    this.registerRule({

        id:"LCSP-CRIT-001",

        name:"Criterios de adjudicación",

        description:

            "Evaluación automática de los criterios de adjudicación.",

        execute:(

            context

        ):RuleResult=>{

            return{

                id:"LCSP-CRIT-001",

                title:"Criterios de adjudicación",

                description:

                    "Recomendación automática.",

                severity:

                    RuleSeverity.INFO,

                passed:true,

                recommendation:

                    this.awardCriteriaRecommendation(

                        context

                    )

            };

        }

    });

}



/*==============================================================================
=
= RECOMENDACIÓN
=
==============================================================================*/

public awardCriteriaRecommendation(

    context:RuleEvaluationContext

):string{

    if(

        context.contractType===

        ContractType.SUPPLIES

    ){

        return

        "Priorizar criterios automáticos y objetivos.";

    }



    if(

        context.contractType===

        ContractType.SERVICES

    ){

        return

        "Combinar criterios automáticos con criterios evaluables mediante juicio de valor.";

    }



    if(

        context.contractType===

        ContractType.WORKS

    ){

        return

        "Equilibrar criterios económicos, técnicos y de planificación.";

    }



    return

    "Seleccionar criterios vinculados al objeto del contrato.";

}



/*==============================================================================
=
= JUICIO DE VALOR
=
==============================================================================*/

public allowsSubjectiveCriteria(

    context:RuleEvaluationContext

):boolean{

    return(

        context.contractType===

        ContractType.SERVICES

        ||

        context.contractType===

        ContractType.WORKS

    );

}



/*==============================================================================
=
= INFORME
=
==============================================================================*/

public awardCriteriaReport(

    context:RuleEvaluationContext

):string{

    return[

        "====== CRITERIOS DE ADJUDICACIÓN ======",

        "",

        "Juicios de valor:",

        this.allowsSubjectiveCriteria(

            context

        )

        ?"PERMITIDOS"

        :"NO RECOMENDADOS",

        "",

        "Recomendación:",

        this.awardCriteriaRecommendation(

            context

        )

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 11 de 24
*
* SIGUIENTE:
*
* RuleEvaluatorEngine.ts
*
* BLOQUE 12 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 12 de 24
*
* REGLAS LCSP
*
* CRITERIOS SOCIALES Y MEDIOAMBIENTALES
*
******************************************************************************************/

/*==============================================================================
=
= CARGA
=
==============================================================================*/

private loadSocialEnvironmentalRules()

:void{

    this.registerRule({

        id:"LCSP-SOC-001",

        name:"Cláusulas sociales y ambientales",

        description:

            "Evaluación automática de condiciones especiales de ejecución.",

        execute:(

            context

        ):RuleResult=>{

            return{

                id:"LCSP-SOC-001",

                title:"Condiciones especiales",

                description:

                    "Recomendación sobre cláusulas sociales y ambientales.",

                severity:

                    RuleSeverity.INFO,

                passed:true,

                recommendation:

                    this.socialEnvironmentalRecommendation(

                        context

                    )

            };

        }

    });

}



/*==============================================================================
=
= RECOMENDACIÓN
=
==============================================================================*/

public socialEnvironmentalRecommendation(

    context:RuleEvaluationContext

):string{

    if(

        context.contractType===

        ContractType.SERVICES

    ){

        return

        "Incluir cláusulas sociales, igualdad, formación y estabilidad laboral, además de medidas ambientales cuando proceda.";

    }



    if(

        context.contractType===

        ContractType.WORKS

    ){

        return

        "Incluir cláusulas ambientales, gestión de residuos, eficiencia energética y seguridad laboral.";

    }



    if(

        context.contractType===

        ContractType.SUPPLIES

    ){

        return

        "Valorar criterios de economía circular, reciclabilidad, eficiencia energética y reducción de emisiones.";

    }



    return

    "Analizar la incorporación de condiciones especiales de ejecución conforme a la LCSP.";

}



/*==============================================================================
=
= CONDICIONES ESPECIALES
=
==============================================================================*/

public requiresSpecialExecutionConditions(

    context:RuleEvaluationContext

):boolean{

    return !this.isMinorContract(

        context

    );

}



/*==============================================================================
=
= INFORME
=
==============================================================================*/

public socialEnvironmentalReport(

    context:RuleEvaluationContext

):string{

    return[

        "=== CLÁUSULAS SOCIALES Y AMBIENTALES ===",

        "",

        "Condiciones especiales:",

        this.requiresSpecialExecutionConditions(

            context

        )

        ?"RECOMENDADAS"

        :"OPCIONALES",

        "",

        "Recomendación:",

        this.socialEnvironmentalRecommendation(

            context

        )

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 12 de 24
*
* SIGUIENTE:
*
* RuleEvaluatorEngine.ts
*
* BLOQUE 13 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 13 de 24
*
* REGLAS LCSP
*
* PLAZOS DE PRESENTACIÓN DE OFERTAS
*
******************************************************************************************/

/*==============================================================================
=
= CARGA
=
==============================================================================*/

private loadDeadlineRules()

:void{

    this.registerRule({

        id:"LCSP-PLAZO-001",

        name:"Plazos de licitación",

        description:

            "Determinación automática de los plazos mínimos.",

        execute:(

            context

        ):RuleResult=>{

            return{

                id:"LCSP-PLAZO-001",

                title:"Plazos",

                description:

                    "Plazo mínimo recomendado.",

                severity:

                    RuleSeverity.INFO,

                passed:true,

                recommendation:

                    this.deadlineRecommendation(

                        context

                    )

            };

        }

    });

}



/*==============================================================================
=
= PLAZO RECOMENDADO
=
==============================================================================*/

public deadlineRecommendation(

    context:RuleEvaluationContext

):string{

    if(

        this.isMinorContract(

            context

        )

    ){

        return

        "No existe plazo de presentación de ofertas al tratarse de un contrato menor.";

    }



    if(

        this.isSARA(

            context

        )

    ){

        return

        "Aplicar los plazos establecidos para contratos sujetos a regulación armonizada.";

    }



    return

    "Aplicar los plazos mínimos previstos para el procedimiento correspondiente conforme a la LCSP.";

}



/*==============================================================================
=
= URGENCIA
=
==============================================================================*/

public deadlineMayBeReduced(

    context:RuleEvaluationContext

):boolean{

    return context.urgent;

}



/*==============================================================================
=
= EMERGENCIA
=
==============================================================================*/

public emergencyProcessing(

    context:RuleEvaluationContext

):boolean{

    return context.emergency;

}



/*==============================================================================
=
= INFORME
=
==============================================================================*/

public deadlineReport(

    context:RuleEvaluationContext

):string{

    return[

        "========== PLAZOS ==========",

        "",

        "Tramitación urgente:",

        context.urgent

            ?"SI"

            :"NO",

        "",

        "Tramitación de emergencia:",

        context.emergency

            ?"SI"

            :"NO",

        "",

        "Recomendación:",

        this.deadlineRecommendation(

            context

        )

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 13 de 24
*
* SIGUIENTE:
*
* RuleEvaluatorEngine.ts
*
* BLOQUE 14 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 14 de 24
*
* REGLAS LCSP
*
* RECURSO ESPECIAL EN MATERIA DE CONTRATACIÓN
*
******************************************************************************************/

/*==============================================================================
=
= CARGA
=
==============================================================================*/

private loadAppealRules()

:void{

    this.registerRule({

        id:"LCSP-REC-001",

        name:"Recurso especial",

        description:

            "Determinación de la procedencia del recurso especial.",

        execute:(

            context

        ):RuleResult=>{

            return{

                id:"LCSP-REC-001",

                title:"Recurso especial",

                description:

                    "Evaluación automática.",

                severity:

                    RuleSeverity.INFO,

                passed:true,

                recommendation:

                    this.appealRecommendation(

                        context

                    )

            };

        }

    });

}



/*==============================================================================
=
= PROCEDE RECURSO ESPECIAL
=
==============================================================================*/

public requiresSpecialAppeal(

    context:RuleEvaluationContext

):boolean{

    return this.isSARA(

        context

    );

}



/*==============================================================================
=
= ÓRGANO COMPETENTE
=
==============================================================================*/

public appealAuthority(

    context:RuleEvaluationContext

):string{

    if(

        this.requiresSpecialAppeal(

            context

        )

    ){

        return

        "Tribunal Administrativo competente en materia de contratación.";

    }



    return

    "No procede recurso especial en materia de contratación.";

}



/*==============================================================================
=
= RECOMENDACIÓN
=
==============================================================================*/

public appealRecommendation(

    context:RuleEvaluationContext

):string{

    if(

        this.requiresSpecialAppeal(

            context

        )

    ){

        return

        "Debe contemplarse la posibilidad de interposición del recurso especial conforme a la LCSP.";

    }



    return

    "No resulta de aplicación el recurso especial en materia de contratación.";

}



/*==============================================================================
=
= INFORME
=
==============================================================================*/

public appealReport(

    context:RuleEvaluationContext

):string{

    return[

        "====== RECURSO ESPECIAL ======",

        "",

        "Procede:",

        this.requiresSpecialAppeal(

            context

        )

        ?"SI"

        :"NO",

        "",

        "Órgano:",

        this.appealAuthority(

            context

        ),

        "",

        "Observación:",

        this.appealRecommendation(

            context

        )

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 14 de 24
*
* SIGUIENTE:
*
* RuleEvaluatorEngine.ts
*
* BLOQUE 15 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 15 de 24
*
* REGLAS LCSP
*
* DOCUMENTACIÓN DEL EXPEDIENTE
*
******************************************************************************************/

/*==============================================================================
=
= CARGA
=
==============================================================================*/

private loadDocumentationRules()

:void{

    this.registerRule({

        id:"LCSP-DOC-001",

        name:"Documentación obligatoria",

        description:

            "Comprobación de la documentación mínima del expediente.",

        execute:(

            context

        ):RuleResult=>{

            return{

                id:"LCSP-DOC-001",

                title:"Documentación",

                description:

                    "Relación de documentos mínimos.",

                severity:

                    RuleSeverity.INFO,

                passed:true,

                recommendation:

                    "Debe verificarse toda la documentación obligatoria antes de aprobar el expediente."

            };

        }

    });

}



/*==============================================================================
=
= DOCUMENTOS OBLIGATORIOS
=
==============================================================================*/

public mandatoryDocumentation(

    context:RuleEvaluationContext

):string[]{

    const documents:string[]=[

        "Memoria justificativa",

        "Informe de insuficiencia de medios",

        "Pliego de Prescripciones Técnicas",

        "Pliego de Cláusulas Administrativas",

        "Informe de necesidad",

        "Retención de crédito"

    ];



    if(

        this.requiresSolvency(

            context

        )

    ){

        documents.push(

            "Justificación de la solvencia"

        );

    }



    if(

        this.requiresGuarantee(

            context

        )

    ){

        documents.push(

            "Garantía definitiva"

        );

    }



    if(

        this.isSARA(

            context

        )

    ){

        documents.push(

            "Anuncio DOUE"

        );

    }



    return documents;

}



/*==============================================================================
=
= INFORME
=
==============================================================================*/

public documentationReport(

    context:RuleEvaluationContext

):string{

    return[

        "======= DOCUMENTACIÓN =======",

        "",

        ...this.mandatoryDocumentation(

            context

        )

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 15 de 24
*
* SIGUIENTE:
*
* RuleEvaluatorEngine.ts
*
* BLOQUE 16 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 16 de 24
*
* REGLAS LCSP
*
* MODIFICACIONES DEL CONTRATO
*
******************************************************************************************/

/*==============================================================================
=
= CARGA
=
==============================================================================*/

private loadModificationRules()

:void{

    this.registerRule({

        id:"LCSP-MOD-001",

        name:"Modificaciones del contrato",

        description:

            "Evaluación de la posibilidad de modificar el contrato.",

        execute:(

            context

        ):RuleResult=>{

            return{

                id:"LCSP-MOD-001",

                title:"Modificaciones",

                description:

                    "Comprobación de modificaciones previstas.",

                severity:

                    RuleSeverity.WARNING,

                passed:true,

                recommendation:

                    this.modificationRecommendation(

                        context

                    )

            };

        }

    });

}



/*==============================================================================
=
= MODIFICACIONES
=
==============================================================================*/

public modificationRecommendation(

    context:RuleEvaluationContext

):string{

    if(

        this.isMinorContract(

            context

        )

    ){

        return

        "Las modificaciones en contratos menores deben analizarse de forma especialmente restrictiva.";

    }



    return

    "Las modificaciones deberán ajustarse a los supuestos previstos en la LCSP y quedar correctamente justificadas en el expediente.";

}



/*==============================================================================
=
= ¿DEBE PREVERSE?
=
==============================================================================*/

public shouldIncludeModificationClause(

    context:RuleEvaluationContext

):boolean{

    return(

        !this.isMinorContract(

            context

        )

    );

}



/*==============================================================================
=
= PORCENTAJE ORIENTATIVO
=
==============================================================================*/

public maximumRecommendedModification()

:number{

    return 20;

}



/*==============================================================================
=
= INFORME
=
==============================================================================*/

public modificationReport(

    context:RuleEvaluationContext

):string{

    return[

        "====== MODIFICACIONES ======",

        "",

        "¿Incluir cláusula?:",

        this.shouldIncludeModificationClause(

            context

        )

        ?"SI"

        :"NO",

        "",

        "Porcentaje orientativo:",

        this.maximumRecommendedModification()+" %",

        "",

        "Observaciones:",

        this.modificationRecommendation(

            context

        )

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 16 de 24
*
* SIGUIENTE:
*
* RuleEvaluatorEngine.ts
*
* BLOQUE 17 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 17 de 24
*
* REGLAS LCSP
*
* PRÓRROGAS DEL CONTRATO
*
******************************************************************************************/

/*==============================================================================
=
= CARGA
=
==============================================================================*/

private loadExtensionRules()

:void{

    this.registerRule({

        id:"LCSP-EXT-001",

        name:"Prórrogas",

        description:

            "Evaluación automática de las prórrogas contractuales.",

        execute:(

            context

        ):RuleResult=>{

            return{

                id:"LCSP-EXT-001",

                title:"Prórrogas",

                description:

                    "Determinación de la posibilidad de prorrogar el contrato.",

                severity:

                    RuleSeverity.INFO,

                passed:true,

                recommendation:

                    this.extensionRecommendation(

                        context

                    )

            };

        }

    });

}



/*==============================================================================
=
= RECOMENDACIÓN
=
==============================================================================*/

public extensionRecommendation(

    context:RuleEvaluationContext

):string{

    if(

        this.isMinorContract(

            context

        )

    ){

        return

        "No se recomienda prever prórrogas en contratos menores.";

    }



    return

    "Las prórrogas deberán estar previstas expresamente en los pliegos y respetar los límites establecidos en la LCSP.";

}



/*==============================================================================
=
= ¿PROCEDE PRÓRROGA?
=
==============================================================================*/

public allowsExtensions(

    context:RuleEvaluationContext

):boolean{

    return(

        !this.isMinorContract(

            context

        )

    );

}



/*==============================================================================
=
= NÚMERO ORIENTATIVO
=
==============================================================================*/

public recommendedMaximumExtensions()

:number{

    return 2;

}



/*==============================================================================
=
= INFORME
=
==============================================================================*/

public extensionReport(

    context:RuleEvaluationContext

):string{

    return[

        "========== PRÓRROGAS ==========",

        "",

        "¿Proceden?:",

        this.allowsExtensions(

            context

        )

        ?"SI"

        :"NO",

        "",

        "Número máximo recomendado:",

        this.recommendedMaximumExtensions().toString(),

        "",

        "Observaciones:",

        this.extensionRecommendation(

            context

        )

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 17 de 24
*
* SIGUIENTE:
*
* RuleEvaluatorEngine.ts
*
* BLOQUE 18 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 18 de 24
*
* REGLAS LCSP
*
* RESPONSABLE DEL CONTRATO Y SEGUIMIENTO
*
******************************************************************************************/

/*==============================================================================
=
= CARGA
=
==============================================================================*/

private loadContractManagerRules()

:void{

    this.registerRule({

        id:"LCSP-RESP-001",

        name:"Responsable del contrato",

        description:

            "Comprobación de la designación del responsable del contrato.",

        execute:(

            context

        ):RuleResult=>{

            return{

                id:"LCSP-RESP-001",

                title:"Responsable del contrato",

                description:

                    "Seguimiento y control de la ejecución.",

                severity:

                    RuleSeverity.INFO,

                passed:true,

                recommendation:

                    this.contractManagerRecommendation(

                        context

                    )

            };

        }

    });

}



/*==============================================================================
=
= RECOMENDACIÓN
=
==============================================================================*/

public contractManagerRecommendation(

    context:RuleEvaluationContext

):string{

    if(

        this.isMinorContract(

            context

        )

    ){

        return

        "Es recomendable designar un responsable para el seguimiento, aunque la complejidad sea reducida.";

    }



    return

    "Debe designarse formalmente un responsable del contrato que supervise la ejecución, el cumplimiento de las obligaciones y la correcta recepción de la prestación.";

}



/*==============================================================================
=
= ¿DEBE DESIGNARSE?
=
==============================================================================*/

public requiresContractManager(

    context:RuleEvaluationContext

):boolean{

    return true;

}



/*==============================================================================
=
= ACTUACIONES DEL RESPONSABLE
=
==============================================================================*/

public contractManagerFunctions()

:string[]{

    return[

        "Supervisión de la ejecución",

        "Control de plazos",

        "Verificación del cumplimiento del PPT",

        "Control de incidencias",

        "Propuesta de penalidades",

        "Conformidad de facturas",

        "Recepción del contrato"

    ];

}



/*==============================================================================
=
= INFORME
=
==============================================================================*/

public contractManagerReport(

    context:RuleEvaluationContext

):string{

    return[

        "===== RESPONSABLE DEL CONTRATO =====",

        "",

        "¿Debe designarse?:",

        this.requiresContractManager(

            context

        )

        ?"SI"

        :"NO",

        "",

        "Funciones:",

        ...this.contractManagerFunctions(),

        "",

        "Observaciones:",

        this.contractManagerRecommendation(

            context

        )

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 18 de 24
*
* SIGUIENTE:
*
* RuleEvaluatorEngine.ts
*
* BLOQUE 19 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 19 de 24
*
* REGLAS LCSP
*
* PENALIDADES E INCUMPLIMIENTOS
*
******************************************************************************************/

/*==============================================================================
=
= CARGA
=
==============================================================================*/

private loadPenaltyRules()

:void{

    this.registerRule({

        id:"LCSP-PEN-001",

        name:"Penalidades",

        description:

            "Determinación de penalidades por incumplimiento.",

        execute:(

            context

        ):RuleResult=>{

            return{

                id:"LCSP-PEN-001",

                title:"Penalidades",

                description:

                    "Control del cumplimiento contractual.",

                severity:

                    RuleSeverity.INFO,

                passed:true,

                recommendation:

                    this.penaltyRecommendation(

                        context

                    )

            };

        }

    });

}



/*==============================================================================
=
= RECOMENDACIÓN
=
==============================================================================*/

public penaltyRecommendation(

    context:RuleEvaluationContext

):string{

    if(

        this.isMinorContract(

            context

        )

    ){

        return

        "Las penalidades deberán analizarse de forma proporcionada al objeto del contrato.";

    }



    return

    "Los pliegos deberán prever penalidades por demora, incumplimientos parciales, incumplimientos de calidad y demás supuestos previstos en la LCSP.";

}



/*==============================================================================
=
= TIPOS DE PENALIDADES
=
==============================================================================*/

public penaltyTypes()

:string[]{

    return[

        "Demora en la ejecución",

        "Incumplimiento parcial",

        "Incumplimiento de calidad",

        "Incumplimiento de condiciones especiales",

        "Incumplimiento de obligaciones esenciales",

        "Incumplimientos medioambientales",

        "Incumplimientos sociales"

    ];

}



/*==============================================================================
=
= ¿DEBEN PREVERSE?
=
==============================================================================*/

public requiresPenaltyClause(

    context:RuleEvaluationContext

):boolean{

    return(

        !this.isMinorContract(

            context

        )

    );

}



/*==============================================================================
=
= INFORME
=
==============================================================================*/

public penaltyReport(

    context:RuleEvaluationContext

):string{

    return[

        "========= PENALIDADES =========",

        "",

        "¿Debe incluirse cláusula?:",

        this.requiresPenaltyClause(

            context

        )

        ?"SI"

        :"RECOMENDABLE",

        "",

        "Tipos:",

        ...this.penaltyTypes(),

        "",

        "Observaciones:",

        this.penaltyRecommendation(

            context

        )

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 19 de 24
*
* SIGUIENTE:
*
* RuleEvaluatorEngine.ts
*
* BLOQUE 20 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 20 de 24
*
* REGLAS LCSP
*
* SUBCONTRATACIÓN
*
******************************************************************************************/

/*==============================================================================
=
= CARGA
=
==============================================================================*/

private loadSubcontractingRules()

:void{

    this.registerRule({

        id:"LCSP-SUB-001",

        name:"Subcontratación",

        description:

            "Evaluación automática de la subcontratación.",

        execute:(

            context

        ):RuleResult=>{

            return{

                id:"LCSP-SUB-001",

                title:"Subcontratación",

                description:

                    "Análisis de la posibilidad de subcontratar.",

                severity:

                    RuleSeverity.INFO,

                passed:true,

                recommendation:

                    this.subcontractingRecommendation(

                        context

                    )

            };

        }

    });

}



/*==============================================================================
=
= RECOMENDACIÓN
=
==============================================================================*/

public subcontractingRecommendation(

    context:RuleEvaluationContext

):string{

    if(

        this.isMinorContract(

            context

        )

    ){

        return

        "La subcontratación deberá analizarse atendiendo a la naturaleza del contrato y a lo previsto en los pliegos.";

    }



    return

    "Debe regularse expresamente la subcontratación, estableciendo límites, obligaciones de comunicación y cumplimiento de la LCSP.";

}



/*==============================================================================
=
= ¿ADMISIBLE?
=
==============================================================================*/

public allowsSubcontracting(

    context:RuleEvaluationContext

):boolean{

    return true;

}



/*==============================================================================
=
= OBLIGACIONES
=
==============================================================================*/

public subcontractingObligations()

:string[]{

    return[

        "Comunicación previa",

        "Cumplimiento de los límites legales",

        "Identificación del subcontratista",

        "Cumplimiento de obligaciones laborales",

        "Cumplimiento de obligaciones medioambientales",

        "Cumplimiento de obligaciones fiscales",

        "Pago a subcontratistas en plazo"

    ];

}



/*==============================================================================
=
= INFORME
=
==============================================================================*/

public subcontractingReport(

    context:RuleEvaluationContext

):string{

    return[

        "======= SUBCONTRATACIÓN =======",

        "",

        "¿Permitida?:",

        this.allowsSubcontracting(

            context

        )

        ?"SI"

        :"NO",

        "",

        "Obligaciones:",

        ...this.subcontractingObligations(),

        "",

        "Observaciones:",

        this.subcontractingRecommendation(

            context

        )

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 20 de 24
*
* SIGUIENTE:
*
* RuleEvaluatorEngine.ts
*
* BLOQUE 21 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 21 de 24
*
* REGLAS LCSP
*
* RECEPCIÓN, LIQUIDACIÓN Y CIERRE DEL CONTRATO
*
******************************************************************************************/

/*==============================================================================
=
= CARGA
=
==============================================================================*/

private loadClosingRules()

:void{

    this.registerRule({

        id:"LCSP-CLOSE-001",

        name:"Recepción y cierre",

        description:

            "Control de la finalización del contrato.",

        execute:(

            context

        ):RuleResult=>{

            return{

                id:"LCSP-CLOSE-001",

                title:"Recepción del contrato",

                description:

                    "Comprobación de las actuaciones finales.",

                severity:

                    RuleSeverity.INFO,

                passed:true,

                recommendation:

                    this.contractClosingRecommendation(

                        context

                    )

            };

        }

    });

}



/*==============================================================================
=
= RECOMENDACIÓN
=
==============================================================================*/

public contractClosingRecommendation(

    context:RuleEvaluationContext

):string{

    if(

        context.contractType===

        ContractType.WORKS

    ){

        return

        "Debe formalizarse el acta de recepción, verificarse el cumplimiento del contrato y tramitar la liquidación conforme a la LCSP.";

    }



    return

    "Debe verificarse la correcta ejecución de la prestación, emitirse la conformidad y tramitar la liquidación del contrato.";

}



/*==============================================================================
=
= DOCUMENTOS DE CIERRE
=
==============================================================================*/

public closingDocuments()

:string[]{

    return[

        "Acta de recepción (cuando proceda)",

        "Informe de conformidad",

        "Liquidación del contrato",

        "Certificación final",

        "Archivo del expediente"

    ];

}



/*==============================================================================
=
= ¿REQUIERE ACTA?
=
==============================================================================*/

public requiresReceptionRecord(

    context:RuleEvaluationContext

):boolean{

    return(

        context.contractType===

        ContractType.WORKS

    );

}



/*==============================================================================
=
= INFORME
=
==============================================================================*/

public closingReport(

    context:RuleEvaluationContext

):string{

    return[

        "======== CIERRE DEL CONTRATO ========",

        "",

        "¿Acta de recepción?:",

        this.requiresReceptionRecord(

            context

        )

        ?"SI"

        :"SEGÚN EL TIPO DE PRESTACIÓN",

        "",

        "Documentos:",

        ...this.closingDocuments(),

        "",

        "Observaciones:",

        this.contractClosingRecommendation(

            context

        )

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 21 de 24
*
* SIGUIENTE:
*
* RuleEvaluatorEngine.ts
*
* BLOQUE 22 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 22 de 24
*
* REGLAS LCSP
*
* AUDITORÍA Y VALIDACIÓN INTEGRAL DEL EXPEDIENTE
*
******************************************************************************************/

/*==============================================================================
=
= AUDITORÍA GENERAL
=
==============================================================================*/

public audit(

    context:RuleEvaluationContext

):RuleEvaluationReport{

    return this.evaluate(

        context

    );

}



/*==============================================================================
=
= EXPEDIENTE APTO
=
==============================================================================*/

public isReadyForApproval(

    context:RuleEvaluationContext

):boolean{

    const report=

        this.evaluate(

            context

        );



    return(

        report.passed

        &&

        report.score>=80

    );

}



/*==============================================================================
=
= RECOMENDACIONES PENDIENTES
=
==============================================================================*/

public pendingRecommendations(

    report:RuleEvaluationReport

):string[]{

    return report.results

        .filter(

            result=>

                !result.passed

        )

        .map(

            result=>

                result.recommendation

        );

}



/*==============================================================================
=
= RESUMEN EJECUTIVO
=
==============================================================================*/

public executiveSummary(

    context:RuleEvaluationContext

):string{

    const report=

        this.evaluate(

            context

        );



    return[

        "========== AUDITORÍA DEL EXPEDIENTE ==========",

        "",

        "Resultado:",

        report.passed

            ?"FAVORABLE"

            :"REQUIERE REVISIÓN",

        "",

        "Puntuación:",

        report.score+" %",

        "",

        "Reglas evaluadas:",

        report.results.length,

        "",

        "Incidencias:",

        this.failedRules(

            report

        ).length,

        "",

        "Bloqueantes:",

        this.blockingRules(

            report

        ).filter(

            r=>!r.passed

        ).length

    ].join("\n");

}



/*==============================================================================
=
= VALIDACIÓN FINAL
=
==============================================================================*/

public finalValidation(

    context:RuleEvaluationContext

):boolean{

    return this.isReadyForApproval(

        context

    );

}



/*****************************************************************************************
*
* FIN BLOQUE 22 de 24
*
* SIGUIENTE:
*
* RuleEvaluatorEngine.ts
*
* BLOQUE 23 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 23 de 24
*
* MÉTRICAS, DIAGNÓSTICO Y MANTENIMIENTO DEL MOTOR
*
******************************************************************************************/

/*==============================================================================
=
= MÉTRICAS
=
==============================================================================*/

export interface RuleEngineMetrics{

    evaluations:number;

    passedEvaluations:number;

    failedEvaluations:number;

    averageScore:number;

    lastExecution?:Date;

}



/*==============================================================================
=
= ALMACÉN
=
==============================================================================*/

private metrics:RuleEngineMetrics={

    evaluations:0,

    passedEvaluations:0,

    failedEvaluations:0,

    averageScore:0

};



/*==============================================================================
=
= REGISTRO
=
==============================================================================*/

private registerEvaluation(

    report:RuleEvaluationReport

):void{

    this.metrics.evaluations++;

    this.metrics.lastExecution=new Date();



    if(report.passed){

        this.metrics.passedEvaluations++;

    }else{

        this.metrics.failedEvaluations++;

    }



    this.metrics.averageScore=

        (

            (

                this.metrics.averageScore*

                (this.metrics.evaluations-1)

            )

            +

            report.score

        )

        /

        this.metrics.evaluations;

}



/*==============================================================================
=
= OBTENER MÉTRICAS
=
==============================================================================*/

public getMetrics()

:RuleEngineMetrics{

    return{

        ...this.metrics

    };

}



/*==============================================================================
=
= REINICIAR
=
==============================================================================*/

public resetMetrics()

:void{

    this.metrics={

        evaluations:0,

        passedEvaluations:0,

        failedEvaluations:0,

        averageScore:0

    };

}



/*==============================================================================
=
= HEALTH CHECK
=
==============================================================================*/

public healthCheck()

:boolean{

    return(

        this.rules.length>0

    );

}



/*==============================================================================
=
= INFORME
=
==============================================================================*/

public metricsReport()

:string{

    return[

        "========= MÉTRICAS =========",

        "",

        "Evaluaciones:",

        this.metrics.evaluations,

        "",

        "Correctas:",

        this.metrics.passedEvaluations,

        "",

        "Fallidas:",

        this.metrics.failedEvaluations,

        "",

        "Puntuación media:",

        this.metrics.averageScore.toFixed(2)+" %"

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 23 de 24
*
* SIGUIENTE:
*
* RuleEvaluatorEngine.ts
*
* BLOQUE 24 de 24 (FINAL)
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 24 de 24
*
* FINALIZACIÓN DEL RULE EVALUATOR ENGINE
*
******************************************************************************************/

/*==============================================================================
=
= CARGA COMPLETA DE REGLAS
=
==============================================================================*/

private loadRules()

:void{

    this.loadMinorContractRules();

    this.loadProcedureRules();

    this.loadSolvencyRules();

    this.loadGuaranteeRules();

    this.loadLotsRules();

    this.loadPublicationRules();

    this.loadAwardCriteriaRules();

    this.loadSocialEnvironmentalRules();

    this.loadDeadlineRules();

    this.loadAppealRules();

    this.loadDocumentationRules();

    this.loadModificationRules();

    this.loadExtensionRules();

    this.loadContractManagerRules();

    this.loadPenaltyRules();

    this.loadSubcontractingRules();

    this.loadClosingRules();

}



/*==============================================================================
=
= INICIALIZACIÓN
=
==============================================================================*/

public initialize()

:void{

    this.clearRules();

    this.resetMetrics();

    this.loadRules();

}



/*==============================================================================
=
= RESUMEN DEL MOTOR
=
==============================================================================*/

public summary()

:string{

    return [

        "========================================",

        " RULE EVALUATOR ENGINE v1.0",

        "========================================",

        "",

        "Contrato menor............... ✔",

        "Procedimiento................. ✔",

        "Solvencia..................... ✔",

        "Garantía definitiva........... ✔",

        "División en lotes............. ✔",

        "Publicidad.................... ✔",

        "Criterios adjudicación........ ✔",

        "Cláusulas sociales............ ✔",

        "Cláusulas ambientales......... ✔",

        "Plazos........................ ✔",

        "Recurso especial.............. ✔",

        "Documentación................. ✔",

        "Modificaciones................ ✔",

        "Prórrogas..................... ✔",

        "Responsable del contrato...... ✔",

        "Penalidades................... ✔",

        "Subcontratación............... ✔",

        "Recepción y cierre............ ✔",

        "Auditoría..................... ✔",

        "Métricas...................... ✔",

        "",

        "Estado: OPERATIVO"

    ].join("\n");

}



/*==============================================================================
=
= VERSIÓN
=
==============================================================================*/

public version()

:string{

    return "RuleEvaluatorEngine v1.0.0";

}



/*****************************************************************************************
*
* FIN DEL ARCHIVO
*
* RuleEvaluatorEngine.ts
*
* MOTOR COMPLETADO
*
******************************************************************************************/

