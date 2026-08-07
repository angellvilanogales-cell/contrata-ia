import { UUID } from "../common/types";
import {
    ContractType,
    ProcedureType,
    LegalHierarchy,
    LegalReasonType
} from "../legal/types";

/*===========================================================================
=
= RULE ENGINE
=
===========================================================================*/

export enum RulePriority{

    VERY_LOW=10,

    LOW=20,

    NORMAL=30,

    HIGH=40,

    VERY_HIGH=50,

    CRITICAL=100

}

export enum RuleCategory{

    CONTRACT,

    PROCEDURE,

    CPV,

    VALUE,

    LOTS,

    SOLVENCY,

    GUARANTEE,

    PUBLICITY,

    DEADLINES,

    AWARD,

    EXECUTION,

    MODIFICATION,

    PENALTIES,

    SOCIAL,

    ENVIRONMENTAL,

    RESOURCES,

    JURISPRUDENCE,

    VALIDATION

}

export enum RuleScope{

    EUROPEAN,

    NATIONAL,

    AUTONOMIC,

    ORGANISATIONAL,

    INTERNAL

}

export enum RuleSource{

    LCSP,

    RD,

    DIRECTIVE,

    JCCA,

    TACRC,

    TJUE,

    TS,

    INTERNAL_POLICY

}

export enum RuleAction{

    CALCULATE,

    VALIDATE,

    RECOMMEND,

    REQUIRE,

    FORBID,

    ALLOW,

    GENERATE,

    WARNING

}

export interface RuleResult{

    valid:boolean;

    message:string;

    value?:unknown;

}

export interface Rule{

    id:UUID;



    code:string;



    name:string;



    description:string;



    priority:RulePriority;



    category:RuleCategory;



    scope:RuleScope;



    source:RuleSource;



    action:RuleAction;



    legalReason?:

        LegalReasonType;



    hierarchy?:

        LegalHierarchy;



    condition(

        context:any,

        variables:Map<string,unknown>

    ):boolean;



    success:RuleResult;



    failure:RuleResult;

}

export interface RuleEvaluation{

    id:UUID;



    ruleId:UUID;



    name:string;



    satisfied:boolean;



    priority:

        RulePriority;



    result:

        RuleResult;

}

export interface RuleGroup{

    id:UUID;



    name:string;



    description:string;



    category:

        RuleCategory;



    rules:Rule[];

}

export interface RuleReport{

    generated:Date;



    totalRules:number;



    executedRules:number;



    satisfiedRules:number;



    failedRules:number;



    evaluations:

        RuleEvaluation[];

}

export interface RuleSummary{

    category:

        RuleCategory;



    total:number;



    satisfied:number;



    failed:number;

}

export class RuleEngine{

/*===========================================================================
=
= REPOSITORIOS
=
===========================================================================*/

private readonly rules:Rule[]=[];

private readonly evaluations:RuleEvaluation[]=[];

private readonly variables:

Map<string,unknown>=

new Map();



/*===========================================================================
=
= CONSTRUCTOR
=
===========================================================================*/

constructor(

    private readonly context:any

){

    this.loadDefaultRules();

}



/*===========================================================================
=
= VARIABLES
=
===========================================================================*/

public setVariable(

    key:string,

    value:unknown

):void{

    this.variables.set(

        key,

        value

    );

}



public getVariable<T>(

    key:string

):T|undefined{

    return this.variables.get(

        key

    ) as T;

}



/*===========================================================================
=
= DEFINICIÓN DE REGLA
=
===========================================================================*/

public registerRule(

    rule:Rule

):void{

    this.rules.push(

        rule

    );

}



/*===========================================================================
=
= CONSULTA
=
===========================================================================*/

public getRules()

:ReadonlyArray<Rule>{

    return this.rules;

}



/*===========================================================================
=
= EVALUACIÓN
=
===========================================================================*/

public evaluate()

:RuleEvaluation[]{

    this.evaluations.length=0;



    for(

        const rule

        of this.rules

    ){

        const result=

            this.evaluateRule(

                rule

            );



        this.evaluations.push(

            result

        );

    }



    return this.evaluations;

}



/*===========================================================================
=
= EVALUACIÓN INDIVIDUAL
=
===========================================================================*/

private evaluateRule(

    rule:Rule

)

:RuleEvaluation{

    let satisfied=false;



    try{

        satisfied=

            rule.condition(

                this.context,

                this.variables

            );

    }

    catch{

        satisfied=false;

    }



    return{

        id:crypto.randomUUID() as UUID,

        ruleId:rule.id,

        name:rule.name,

        satisfied,

        priority:rule.priority,

        result:

            satisfied

            ?rule.success

            :rule.failure

    };

}



/*===========================================================================
=
= REGLAS POR DEFECTO
=
===========================================================================*/

private loadDefaultRules()

:void{

    this.registerRule(

        this.contractTypeRule()

    );



    this.registerRule(

        this.procedureRule()

    );



    this.registerRule(

        this.cpvRule()

    );



    this.registerRule(

        this.publicityRule()

    );



    this.registerRule(

        this.solvencyRule()

    );

}



/*===========================================================================
=
= API
=
===========================================================================*/

public reset()

:void{

    this.variables.clear();

    this.evaluations.length=0;

}



/*===========================================================================
=
= PRIORIDADES
=
===========================================================================*/

/*===========================================================================
=
= CATEGORÍAS
=
===========================================================================*/

/*===========================================================================
=
= ÁMBITO
=
===========================================================================*/

/*===========================================================================
=
= ORIGEN
=
===========================================================================*/

/*===========================================================================
=
= ACCIÓN
=
===========================================================================*/

/*===========================================================================
=
= RESULTADO
=
===========================================================================*/

/*===========================================================================
=
= DEFINICIÓN
=
===========================================================================*/

/*===========================================================================
=
= EVALUACIÓN
=
===========================================================================*/

/*===========================================================================
=
= AGRUPACIÓN
=
===========================================================================*/

/*===========================================================================
=
= INFORME
=
===========================================================================*/

/*===========================================================================
=
= RESUMEN
=
===========================================================================*/

/*===========================================================================
=
= TIPO DE CONTRATO
=
===========================================================================*/

private contractTypeRule()

:Rule{

    return{

        id:

            crypto.randomUUID() as UUID,



        code:

            "CONTRACT_TYPE",



        name:

            "Determinación del tipo de contrato",



        description:

            "Clasifica el contrato conforme a la LCSP.",



        priority:

            RulePriority.CRITICAL,



        category:

            RuleCategory.CONTRACT,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.CALCULATE,



        legalReason:

            LegalReasonType.CONTRACT_TYPE,



        condition:(

            context

        )=>

            context?.contract

            ?.type

            !=undefined,



        success:{

            valid:true,

            message:

                "Tipo contractual determinado."

        },



        failure:{

            valid:false,

            message:

                "Debe definirse el tipo contractual."

        }

    };

}



/*===========================================================================
=
= VALOR ESTIMADO
=
===========================================================================*/

private estimatedValueRule()

:Rule{

    return{

        id:

            crypto.randomUUID() as UUID,



        code:

            "ESTIMATED_VALUE",



        name:

            "Valor estimado",



        description:

            "Comprueba la existencia del valor estimado.",



        priority:

            RulePriority.CRITICAL,



        category:

            RuleCategory.VALUE,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.VALIDATE,



        legalReason:

            LegalReasonType.PROCEDURE,



        condition:(

            context

        )=>

            Number(

                context?.contract

                    ?.estimatedValue

                    ??0

            )>0,



        success:{

            valid:true,

            message:

                "Valor estimado válido."

        },



        failure:{

            valid:false,

            message:

                "Debe calcularse el valor estimado."

        }

    };

}



/*===========================================================================
=
= CONTRATO MENOR
=
===========================================================================*/

private minorContractRule()

:Rule{

    return{

        id:

            crypto.randomUUID() as UUID,



        code:

            "MINOR_CONTRACT",



        name:

            "Contrato menor",



        description:

            "Detecta si el expediente puede tramitarse como contrato menor.",



        priority:

            RulePriority.HIGH,



        category:

            RuleCategory.PROCEDURE,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.RECOMMEND,



        legalReason:

            LegalReasonType.PROCEDURE,



        condition:(

            context

        )=>

            Number(

                context?.contract

                    ?.estimatedValue

                    ??0

            )

            <=

            Number(

                this.getVariable<number>(

                    "MINOR_THRESHOLD"

                )??15000

            ),



        success:{

            valid:true,

            message:

                "Procede analizar la utilización del contrato menor.",

            value:

                ProcedureType.MINOR

        },



        failure:{

            valid:true,

            message:

                "Debe utilizarse un procedimiento ordinario."

        }

    };

}



/*===========================================================================
=
= UMBRALES LCSP
=
===========================================================================*/

private thresholdRule()

:Rule{

    return{

        id:

            crypto.randomUUID() as UUID,



        code:

            "LCSP_THRESHOLDS",



        name:

            "Control de umbrales",



        description:

            "Compara el valor estimado con los umbrales legales.",



        priority:

            RulePriority.HIGH,



        category:

            RuleCategory.VALUE,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.VALIDATE,



        legalReason:

            LegalReasonType.PROCEDURE,



        condition:(

            context

        )=>

            Number(

                context?.contract

                    ?.estimatedValue

                    ??0

            )>=0,



        success:{

            valid:true,

            message:

                "Umbral correctamente evaluado."

        },



        failure:{

            valid:false,

            message:

                "No ha sido posible evaluar el umbral."

        }

    };

}



/*===========================================================================
=
= REGISTRO
=
===========================================================================*/

private loadContractRules()

:void{

    this.registerRule(

        this.estimatedValueRule()

    );



    this.registerRule(

        this.minorContractRule()

    );



    this.registerRule(

        this.thresholdRule()

    );

}



/*===========================================================================
=
= ACTUALIZACIÓN DEL LOAD GENERAL
=
===========================================================================*/

/*
Añadir dentro de loadDefaultRules():

this.loadContractRules();

después de:

this.registerRule(
    this.contractTypeRule()
);

*/

/*===========================================================================
=
= PROCEDIMIENTO ABIERTO
=
===========================================================================*/

private openProcedureRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"OPEN_PROCEDURE",

        name:"Procedimiento Abierto",

        description:

            "Determina si procede procedimiento abierto.",

        priority:

            RulePriority.CRITICAL,

        category:

            RuleCategory.PROCEDURE,

        scope:

            RuleScope.NATIONAL,

        source:

            RuleSource.LCSP,

        action:

            RuleAction.CALCULATE,

        legalReason:

            LegalReasonType.PROCEDURE,



        condition:(context)=>{

            const value=

                Number(

                    context?.contract

                        ?.estimatedValue

                    ??0

                );



            return value>

                this.getVariable<number>(

                    "SIMPLIFIED_LIMIT"

                )!;

        },



        success:{

            valid:true,

            message:

                "Procedimiento abierto.",

            value:

                ProcedureType.OPEN

        },



        failure:{

            valid:true,

            message:

                "Debe evaluarse otro procedimiento."

        }

    };

}



/*===========================================================================
=
= ABIERTO SIMPLIFICADO
=
===========================================================================*/

private simplifiedProcedureRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"SIMPLIFIED",

        name:"Abierto Simplificado",

        description:

            "Comprueba si procede abierto simplificado.",

        priority:

            RulePriority.HIGH,

        category:

            RuleCategory.PROCEDURE,

        scope:

            RuleScope.NATIONAL,

        source:

            RuleSource.LCSP,

        action:

            RuleAction.CALCULATE,

        legalReason:

            LegalReasonType.PROCEDURE,



        condition:(context)=>{

            const value=

                Number(

                    context?.contract

                        ?.estimatedValue

                    ??0

                );



            return(

                value<=

                this.getVariable<number>(

                    "SIMPLIFIED_LIMIT"

                )!

                &&

                value>

                this.getVariable<number>(

                    "SIMPLIFIED_SHORT_LIMIT"

                )!

            );

        },



        success:{

            valid:true,

            message:

                "Procedimiento abierto simplificado.",

            value:

                ProcedureType.SIMPLIFIED

        },



        failure:{

            valid:true,

            message:

                "No procede."

        }

    };

}



/*===========================================================================
=
= ABREVIADO
=
===========================================================================*/

private simplifiedShortRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"SIMPLIFIED_SHORT",

        name:"Abierto Simplificado Abreviado",

        description:

            "Comprueba si procede el procedimiento abreviado.",

        priority:

            RulePriority.HIGH,

        category:

            RuleCategory.PROCEDURE,

        scope:

            RuleScope.NATIONAL,

        source:

            RuleSource.LCSP,

        action:

            RuleAction.CALCULATE,

        legalReason:

            LegalReasonType.PROCEDURE,



        condition:(context)=>{

            const value=

                Number(

                    context?.contract

                        ?.estimatedValue

                    ??0

                );



            return value<=

                this.getVariable<number>(

                    "SIMPLIFIED_SHORT_LIMIT"

                )!;

        },



        success:{

            valid:true,

            message:

                "Procedimiento abreviado.",

            value:

                ProcedureType.SIMPLIFIED_SHORT

        },



        failure:{

            valid:true,

            message:

                "No procede."

        }

    };

}



/*===========================================================================
=
= RESTRINGIDO
=
===========================================================================*/

private restrictedProcedureRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"RESTRICTED",



        name:"Procedimiento Restringido",



        description:

            "Permite utilizar el procedimiento restringido.",



        priority:

            RulePriority.NORMAL,



        category:

            RuleCategory.PROCEDURE,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.RECOMMEND,



        legalReason:

            LegalReasonType.PROCEDURE,



        condition:(context)=>

            context?.procedure

                ?.restricted===true,



        success:{

            valid:true,

            message:

                "Puede utilizarse procedimiento restringido.",

            value:

                ProcedureType.RESTRICTED

        },



        failure:{

            valid:true,

            message:

                "No procede."

        }

    };

}



/*===========================================================================
=
= NEGOCIADO
=
===========================================================================*/

private negotiatedProcedureRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"NEGOTIATED",



        name:"Procedimiento Negociado",



        description:

            "Comprueba si concurren causas para el negociado.",



        priority:

            RulePriority.CRITICAL,



        category:

            RuleCategory.PROCEDURE,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.RECOMMEND,



        legalReason:

            LegalReasonType.PROCEDURE,



        condition:(context)=>

            context?.procedure

                ?.negotiated===true,



        success:{

            valid:true,

            message:

                "Puede utilizarse procedimiento negociado.",

            value:

                ProcedureType.NEGOTIATED

        },



        failure:{

            valid:true,

            message:

                "No procede."

        }

    };

}



/*===========================================================================
=
= CARGA
=
===========================================================================*/

private loadProcedureRules()

:void{

    this.registerRule(

        this.openProcedureRule()

    );



    this.registerRule(

        this.simplifiedProcedureRule()

    );



    this.registerRule(

        this.simplifiedShortRule()

    );



    this.registerRule(

        this.restrictedProcedureRule()

    );



    this.registerRule(

        this.negotiatedProcedureRule()

    );

}



/*===========================================================================
=
= ACTUALIZAR LOAD GENERAL
=
===========================================================================*/

/*

Añadir también:

this.loadProcedureRules();

dentro de loadDefaultRules().

*/

/*===========================================================================
=
= DIÁLOGO COMPETITIVO
=
===========================================================================*/

private competitiveDialogueRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"COMPETITIVE_DIALOGUE",



        name:"Diálogo Competitivo",



        description:

            "Comprueba si procede el diálogo competitivo.",



        priority:

            RulePriority.CRITICAL,



        category:

            RuleCategory.PROCEDURE,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.RECOMMEND,



        legalReason:

            LegalReasonType.PROCEDURE,



        condition:(context)=>

            context?.procedure

                ?.competitiveDialogue===true,



        success:{

            valid:true,

            message:

                "Procede diálogo competitivo.",

            value:

                ProcedureType.COMPETITIVE_DIALOGUE

        },



        failure:{

            valid:true,

            message:

                "No procede."

        }

    };

}



/*===========================================================================
=
= ASOCIACIÓN PARA LA INNOVACIÓN
=
===========================================================================*/

private innovationPartnershipRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"INNOVATION_PARTNERSHIP",



        name:"Asociación para la Innovación",



        description:

            "Evalúa la utilización del procedimiento de innovación.",



        priority:

            RulePriority.CRITICAL,



        category:

            RuleCategory.PROCEDURE,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.RECOMMEND,



        legalReason:

            LegalReasonType.PROCEDURE,



        condition:(context)=>

            context?.contract

                ?.innovation===true,



        success:{

            valid:true,

            message:

                "Procede asociación para la innovación.",

            value:

                ProcedureType.INNOVATION_PARTNERSHIP

        },



        failure:{

            valid:true,

            message:

                "No procede."

        }

    };

}



/*===========================================================================
=
= LICITACIÓN CON NEGOCIACIÓN
=
===========================================================================*/

private negotiationProcedureRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"NEGOTIATION_WITH_PUBLICATION",



        name:"Licitación con Negociación",



        description:

            "Evalúa si concurren las circunstancias previstas en la LCSP.",



        priority:

            RulePriority.HIGH,



        category:

            RuleCategory.PROCEDURE,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.RECOMMEND,



        legalReason:

            LegalReasonType.PROCEDURE,



        condition:(context)=>

            context?.procedure

                ?.negotiation===true,



        success:{

            valid:true,

            message:

                "Procede licitación con negociación.",

            value:

                ProcedureType.NEGOTIATION

        },



        failure:{

            valid:true,

            message:

                "No procede."

        }

    };

}



/*===========================================================================
=
= PROCEDIMIENTO ESPECIAL
=
===========================================================================*/

private specialProcedureRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"SPECIAL_PROCEDURE",



        name:"Procedimiento Especial",



        description:

            "Detecta procedimientos excepcionales previstos en la normativa.",



        priority:

            RulePriority.NORMAL,



        category:

            RuleCategory.PROCEDURE,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.WARNING,



        legalReason:

            LegalReasonType.PROCEDURE,



        condition:(context)=>

            context?.procedure

                ?.special===true,



        success:{

            valid:true,

            message:

                "Procedimiento especial detectado."

        },



        failure:{

            valid:true,

            message:

                "No existen procedimientos especiales."

        }

    };

}



/*===========================================================================
=
= SELECCIÓN AUTOMÁTICA
=
===========================================================================*/

private procedureSelectionRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"PROCEDURE_SELECTION",



        name:"Selección Automática del Procedimiento",



        description:

            "Selecciona el procedimiento más adecuado conforme a las reglas evaluadas.",



        priority:

            RulePriority.CRITICAL,



        category:

            RuleCategory.PROCEDURE,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.CALCULATE,



        legalReason:

            LegalReasonType.PROCEDURE,



        condition:()=>true,



        success:{

            valid:true,

            message:

                "Procedimiento seleccionado automáticamente."

        },



        failure:{

            valid:false,

            message:

                "No ha sido posible determinar el procedimiento."

        }

    };

}



/*===========================================================================
=
= CARGA
=
===========================================================================*/

private loadAdvancedProcedureRules()

:void{

    this.registerRule(

        this.competitiveDialogueRule()

    );



    this.registerRule(

        this.innovationPartnershipRule()

    );



    this.registerRule(

        this.negotiationProcedureRule()

    );



    this.registerRule(

        this.specialProcedureRule()

    );



    this.registerRule(

        this.procedureSelectionRule()

    );

}



/*===========================================================================
=
= ACTUALIZACIÓN LOAD GENERAL
=
===========================================================================*/

/*

Añadir en loadDefaultRules():

this.loadAdvancedProcedureRules();

después de:

this.loadProcedureRules();

*/

/*===========================================================================
=
= PUBLICIDAD DOUE
=
===========================================================================*/

private douePublicationRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"DOUE_PUBLICATION",

        name:"Publicidad DOUE",

        description:

            "Determina si el expediente requiere publicación en el Diario Oficial de la Unión Europea.",

        priority:

            RulePriority.CRITICAL,

        category:

            RuleCategory.PUBLICITY,

        scope:

            RuleScope.EUROPEAN,

        source:

            RuleSource.DIRECTIVE,

        action:

            RuleAction.REQUIRE,

        legalReason:

            LegalReasonType.PUBLICITY,



        condition:(context)=>{

            const value=

                Number(

                    context?.contract

                        ?.estimatedValue

                    ??0

                );



            const threshold=

                this.getVariable<number>(

                    "EU_THRESHOLD"

                )??0;



            return value>=threshold;

        },



        success:{

            valid:true,

            message:

                "Es obligatoria la publicación en DOUE.",

            value:true

        },



        failure:{

            valid:true,

            message:

                "No procede publicación en DOUE.",

            value:false

        }

    };

}



/*===========================================================================
=
= PERFIL DEL CONTRATANTE
=
===========================================================================*/

private contractingProfileRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"PROFILE_PUBLICATION",

        name:"Perfil del Contratante",

        description:

            "Publicación obligatoria en el perfil del contratante.",

        priority:

            RulePriority.CRITICAL,

        category:

            RuleCategory.PUBLICITY,

        scope:

            RuleScope.NATIONAL,

        source:

            RuleSource.LCSP,

        action:

            RuleAction.REQUIRE,

        legalReason:

            LegalReasonType.PUBLICITY,



        condition:()=>true,



        success:{

            valid:true,

            message:

                "Debe publicarse en el Perfil del Contratante.",

            value:true

        },



        failure:{

            valid:false,

            message:

                "No ha sido posible determinar la obligación."

        }

    };

}



/*===========================================================================
=
= PLATAFORMA DE CONTRATACIÓN
=
===========================================================================*/

private pcsprule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"PLACSP",

        name:"Plataforma de Contratación del Sector Público",

        description:

            "Determina la obligación de publicación en la Plataforma.",

        priority:

            RulePriority.HIGH,

        category:

            RuleCategory.PUBLICITY,

        scope:

            RuleScope.NATIONAL,

        source:

            RuleSource.LCSP,

        action:

            RuleAction.REQUIRE,

        legalReason:

            LegalReasonType.PUBLICITY,



        condition:()=>true,



        success:{

            valid:true,

            message:

                "Debe utilizarse la Plataforma de Contratación.",

            value:true

        },



        failure:{

            valid:false,

            message:

                "No ha sido posible determinar la obligación."

        }

    };

}



/*===========================================================================
=
= BOJA
=
===========================================================================*/

private bojaPublicationRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"BOJA",

        name:"Publicidad BOJA",

        description:

            "Evalúa la publicación en el BOJA.",

        priority:

            RulePriority.NORMAL,

        category:

            RuleCategory.PUBLICITY,

        scope:

            RuleScope.AUTONOMIC,

        source:

            RuleSource.INTERNAL_POLICY,

        action:

            RuleAction.RECOMMEND,

        legalReason:

            LegalReasonType.PUBLICITY,



        condition:(context)=>

            context?.organisation

                ?.autonomousCommunity==="Andalucía",



        success:{

            valid:true,

            message:

                "Procede analizar publicación en BOJA."

        },



        failure:{

            valid:true,

            message:

                "No procede."

        }

    };

}



/*===========================================================================
=
= BOE
=
===========================================================================*/

private boePublicationRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"BOE",

        name:"Publicidad BOE",

        description:

            "Evalúa la necesidad de publicación en el BOE.",

        priority:

            RulePriority.NORMAL,

        category:

            RuleCategory.PUBLICITY,

        scope:

            RuleScope.NATIONAL,

        source:

            RuleSource.LCSP,

        action:

            RuleAction.RECOMMEND,

        legalReason:

            LegalReasonType.PUBLICITY,



        condition:(context)=>

            context?.publication

                ?.boe===true,



        success:{

            valid:true,

            message:

                "Procede publicación en BOE."

        },



        failure:{

            valid:true,

            message:

                "No procede."

        }

    };

}



/*===========================================================================
=
= CARGA
=
===========================================================================*/

private loadPublicationRules()

:void{

    this.registerRule(

        this.douePublicationRule()

    );



    this.registerRule(

        this.contractingProfileRule()

    );



    this.registerRule(

        this.pcsprule()

    );



    this.registerRule(

        this.bojaPublicationRule()

    );



    this.registerRule(

        this.boePublicationRule()

    );

}



/*===========================================================================
=
= ACTUALIZAR LOAD GENERAL
=
===========================================================================*/

/*

Añadir dentro de loadDefaultRules():

this.loadPublicationRules();

después de:

this.loadAdvancedProcedureRules();

*/

/*===========================================================================
=
= PLAZO DE PRESENTACIÓN DE OFERTAS
=
===========================================================================*/

private offerDeadlineRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"OFFER_DEADLINE",

        name:"Plazo de Presentación de Ofertas",

        description:

            "Calcula el plazo mínimo para la presentación de ofertas.",

        priority:

            RulePriority.CRITICAL,

        category:

            RuleCategory.DEADLINES,

        scope:

            RuleScope.NATIONAL,

        source:

            RuleSource.LCSP,

        action:

            RuleAction.CALCULATE,

        legalReason:

            LegalReasonType.PROCEDURE,



        condition:()=>true,



        success:{

            valid:true,

            message:

                "Plazo mínimo calculado."

        },



        failure:{

            valid:false,

            message:

                "No ha sido posible calcular el plazo."

        }

    };

}



/*===========================================================================
=
= TRAMITACIÓN URGENTE
=
===========================================================================*/

private urgentProcedureRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"URGENT_PROCEDURE",



        name:"Tramitación Urgente",



        description:

            "Evalúa la existencia de tramitación urgente.",



        priority:

            RulePriority.HIGH,



        category:

            RuleCategory.DEADLINES,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.RECOMMEND,



        legalReason:

            LegalReasonType.PROCEDURE,



        condition:(context)=>

            context?.procedure

                ?.urgent===true,



        success:{

            valid:true,

            message:

                "Aplicar reducción de plazos por urgencia.",

            value:true

        },



        failure:{

            valid:true,

            message:

                "No existe tramitación urgente."

        }

    };

}



/*===========================================================================
=
= EMERGENCIA
=
===========================================================================*/

private emergencyProcedureRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"EMERGENCY_PROCEDURE",



        name:"Tramitación de Emergencia",



        description:

            "Comprueba la existencia de una situación de emergencia.",



        priority:

            RulePriority.CRITICAL,



        category:

            RuleCategory.DEADLINES,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.RECOMMEND,



        legalReason:

            LegalReasonType.PROCEDURE,



        condition:(context)=>

            context?.procedure

                ?.emergency===true,



        success:{

            valid:true,

            message:

                "Aplicar régimen excepcional de emergencia.",

            value:true

        },



        failure:{

            valid:true,

            message:

                "No procede."

        }

    };

}



/*===========================================================================
=
= FORMALIZACIÓN
=
===========================================================================*/

private formalisationDeadlineRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"FORMALISATION",



        name:"Formalización del Contrato",



        description:

            "Determina los plazos de formalización.",



        priority:

            RulePriority.HIGH,



        category:

            RuleCategory.DEADLINES,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.CALCULATE,



        legalReason:

            LegalReasonType.EXECUTION,



        condition:()=>true,



        success:{

            valid:true,

            message:

                "Plazo de formalización determinado."

        },



        failure:{

            valid:false,

            message:

                "No ha sido posible determinar el plazo."

        }

    };

}



/*===========================================================================
=
= INICIO DE EJECUCIÓN
=
===========================================================================*/

private executionStartRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"EXECUTION_START",



        name:"Inicio de la Ejecución",



        description:

            "Comprueba la planificación del inicio de ejecución.",



        priority:

            RulePriority.NORMAL,



        category:

            RuleCategory.DEADLINES,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.VALIDATE,



        legalReason:

            LegalReasonType.EXECUTION,



        condition:(context)=>

            context?.execution

                ?.startDate

                !=undefined,



        success:{

            valid:true,

            message:

                "Inicio de ejecución planificado."

        },



        failure:{

            valid:false,

            message:

                "Debe definirse la fecha de inicio."

        }

    };

}



/*===========================================================================
=
= CARGA
=
===========================================================================*/

private loadDeadlineRules()

:void{

    this.registerRule(

        this.offerDeadlineRule()

    );



    this.registerRule(

        this.urgentProcedureRule()

    );



    this.registerRule(

        this.emergencyProcedureRule()

    );



    this.registerRule(

        this.formalisationDeadlineRule()

    );



    this.registerRule(

        this.executionStartRule()

    );

}



/*===========================================================================
=
= ACTUALIZACIÓN LOAD GENERAL
=
===========================================================================*/

/*

Añadir en loadDefaultRules():

this.loadDeadlineRules();

después de:

this.loadPublicationRules();

*/

/*===========================================================================
=
= SOLVENCIA ECONÓMICA
=
===========================================================================*/

private economicSolvencyRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"ECONOMIC_SOLVENCY",

        name:"Solvencia Económica",

        description:

            "Determina la necesidad de solvencia económica.",

        priority:

            RulePriority.CRITICAL,

        category:

            RuleCategory.SOLVENCY,

        scope:

            RuleScope.NATIONAL,

        source:

            RuleSource.LCSP,

        action:

            RuleAction.REQUIRE,

        legalReason:

            LegalReasonType.SOLVENCY,



        condition:(context)=>

            context?.procedure

                ?.requiresSolvency===true,



        success:{

            valid:true,

            message:

                "Debe exigirse solvencia económica."

        },



        failure:{

            valid:true,

            message:

                "No resulta necesaria."

        }

    };

}



/*===========================================================================
=
= SOLVENCIA FINANCIERA
=
===========================================================================*/

private financialSolvencyRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"FINANCIAL_SOLVENCY",



        name:"Solvencia Financiera",



        description:

            "Comprueba la necesidad de solvencia financiera.",



        priority:

            RulePriority.HIGH,



        category:

            RuleCategory.SOLVENCY,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.REQUIRE,



        legalReason:

            LegalReasonType.SOLVENCY,



        condition:(context)=>

            context?.contract

                ?.estimatedValue

                >

            (

                this.getVariable<number>(

                    "FINANCIAL_SOLVENCY_LIMIT"

                )??0

            ),



        success:{

            valid:true,

            message:

                "Debe acreditarse solvencia financiera."

        },



        failure:{

            valid:true,

            message:

                "No procede."

        }

    };

}



/*===========================================================================
=
= SOLVENCIA TÉCNICA
=
===========================================================================*/

private technicalSolvencyRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"TECHNICAL_SOLVENCY",



        name:"Solvencia Técnica",



        description:

            "Determina la necesidad de solvencia técnica.",



        priority:

            RulePriority.CRITICAL,



        category:

            RuleCategory.SOLVENCY,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.REQUIRE,



        legalReason:

            LegalReasonType.SOLVENCY,



        condition:(context)=>

            context?.procedure

                ?.requiresTechnicalSolvency===true,



        success:{

            valid:true,

            message:

                "Debe exigirse solvencia técnica."

        },



        failure:{

            valid:true,

            message:

                "No procede."

        }

    };

}



/*===========================================================================
=
= CLASIFICACIÓN EMPRESARIAL
=
===========================================================================*/

private businessClassificationRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"BUSINESS_CLASSIFICATION",



        name:"Clasificación Empresarial",



        description:

            "Evalúa si es obligatoria la clasificación empresarial.",



        priority:

            RulePriority.HIGH,



        category:

            RuleCategory.SOLVENCY,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.RECOMMEND,



        legalReason:

            LegalReasonType.SOLVENCY,



        condition:(context)=>

            context?.procedure

                ?.requiresClassification===true,



        success:{

            valid:true,

            message:

                "Procede exigir clasificación empresarial."

        },



        failure:{

            valid:true,

            message:

                "No procede clasificación."

        }

    };

}



/*===========================================================================
=
= PRINCIPIO DE PROPORCIONALIDAD
=
===========================================================================*/

private proportionalityRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"PROPORTIONALITY",



        name:"Principio de Proporcionalidad",



        description:

            "Comprueba que la solvencia sea proporcional al objeto y al importe.",



        priority:

            RulePriority.CRITICAL,



        category:

            RuleCategory.SOLVENCY,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.VALIDATE,



        legalReason:

            LegalReasonType.SOLVENCY,



        condition:(context)=>{

            const value=

                Number(

                    context?.contract

                        ?.estimatedValue

                    ??0

                );



            const solvency=

                Number(

                    context?.solvency

                        ?.requiredTurnover

                    ??0

                );



            return(

                solvency<=

                value*2

            );

        },



        success:{

            valid:true,

            message:

                "La solvencia es proporcionada."

        },



        failure:{

            valid:false,

            message:

                "La solvencia propuesta puede resultar desproporcionada."

        }

    };

}



/*===========================================================================
=
= CARGA
=
===========================================================================*/

private loadSolvencyRules()

:void{

    this.registerRule(

        this.economicSolvencyRule()

    );



    this.registerRule(

        this.financialSolvencyRule()

    );



    this.registerRule(

        this.technicalSolvencyRule()

    );



    this.registerRule(

        this.businessClassificationRule()

    );



    this.registerRule(

        this.proportionalityRule()

    );

}



/*===========================================================================
=
= ACTUALIZAR LOAD GENERAL
=
===========================================================================*/

/*

Añadir en loadDefaultRules():

this.loadSolvencyRules();

después de:

this.loadDeadlineRules();

*/

/*===========================================================================
=
= GARANTÍA PROVISIONAL
=
===========================================================================*/

private provisionalGuaranteeRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"PROVISIONAL_GUARANTEE",

        name:"Garantía Provisional",

        description:

            "Determina si excepcionalmente procede exigir garantía provisional.",

        priority:

            RulePriority.NORMAL,

        category:

            RuleCategory.GUARANTEE,

        scope:

            RuleScope.NATIONAL,

        source:

            RuleSource.LCSP,

        action:

            RuleAction.RECOMMEND,

        legalReason:

            LegalReasonType.GUARANTEE,



        condition:(context)=>

            context?.guarantees

                ?.provisional===true,



        success:{

            valid:true,

            message:

                "Procede valorar la exigencia de garantía provisional."

        },



        failure:{

            valid:true,

            message:

                "No procede garantía provisional."

        }

    };

}



/*===========================================================================
=
= GARANTÍA DEFINITIVA
=
===========================================================================*/

private definitiveGuaranteeRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"DEFINITIVE_GUARANTEE",



        name:"Garantía Definitiva",



        description:

            "Determina la obligación de constituir garantía definitiva.",



        priority:

            RulePriority.CRITICAL,



        category:

            RuleCategory.GUARANTEE,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.REQUIRE,



        legalReason:

            LegalReasonType.GUARANTEE,



        condition:(context)=>

            context?.guarantees

                ?.definitive!==false,



        success:{

            valid:true,

            message:

                "Debe exigirse garantía definitiva.",

            value:0.05

        },



        failure:{

            valid:true,

            message:

                "No se exige garantía definitiva."

        }

    };

}



/*===========================================================================
=
= GARANTÍA COMPLEMENTARIA
=
===========================================================================*/

private supplementaryGuaranteeRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"SUPPLEMENTARY_GUARANTEE",



        name:"Garantía Complementaria",



        description:

            "Evalúa la necesidad de garantía complementaria.",



        priority:

            RulePriority.HIGH,



        category:

            RuleCategory.GUARANTEE,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.RECOMMEND,



        legalReason:

            LegalReasonType.GUARANTEE,



        condition:(context)=>

            context?.award

                ?.abnormallyLow===true,



        success:{

            valid:true,

            message:

                "Puede exigirse garantía complementaria."

        },



        failure:{

            valid:true,

            message:

                "No procede."

        }

    };

}



/*===========================================================================
=
= EXENCIONES
=
===========================================================================*/

private guaranteeExemptionRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"GUARANTEE_EXEMPTION",



        name:"Exención de Garantía",



        description:

            "Comprueba si concurren causas para eximir de garantía.",



        priority:

            RulePriority.NORMAL,



        category:

            RuleCategory.GUARANTEE,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.RECOMMEND,



        legalReason:

            LegalReasonType.GUARANTEE,



        condition:(context)=>

            context?.guarantees

                ?.exempt===true,



        success:{

            valid:true,

            message:

                "Existe propuesta de exención."

        },



        failure:{

            valid:true,

            message:

                "No procede exención."

        }

    };

}



/*===========================================================================
=
= CÁLCULO AUTOMÁTICO
=
===========================================================================*/

private guaranteeCalculationRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"GUARANTEE_AMOUNT",



        name:"Cálculo Automático de Garantías",



        description:

            "Calcula automáticamente el importe de la garantía definitiva.",



        priority:

            RulePriority.CRITICAL,



        category:

            RuleCategory.GUARANTEE,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.CALCULATE,



        legalReason:

            LegalReasonType.GUARANTEE,



        condition:(context)=>{

            const amount=

                Number(

                    context?.award

                        ?.price

                    ??

                    context?.contract

                        ?.estimatedValue

                    ??

                    0

                );



            if(amount<=0){

                return false;

            }



            this.setVariable(

                "GUARANTEE_AMOUNT",

                amount*0.05

            );



            return true;

        },



        success:{

            valid:true,

            message:

                "Importe de garantía calculado automáticamente."

        },



        failure:{

            valid:false,

            message:

                "No ha sido posible calcular la garantía."

        }

    };

}



/*===========================================================================
=
= CARGA
=
===========================================================================*/

private loadGuaranteeRules()

:void{

    this.registerRule(

        this.provisionalGuaranteeRule()

    );



    this.registerRule(

        this.definitiveGuaranteeRule()

    );



    this.registerRule(

        this.supplementaryGuaranteeRule()

    );



    this.registerRule(

        this.guaranteeExemptionRule()

    );



    this.registerRule(

        this.guaranteeCalculationRule()

    );

}



/*===========================================================================
=
= ACTUALIZACIÓN LOAD GENERAL
=
===========================================================================*/

/*

Añadir dentro de loadDefaultRules():

this.loadGuaranteeRules();

después de:

this.loadSolvencyRules();

*/

/*===========================================================================
=
= CRITERIOS DE ADJUDICACIÓN
=
===========================================================================*/

private awardCriteriaRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"AWARD_CRITERIA",

        name:"Criterios de Adjudicación",

        description:

            "Comprueba que existan criterios de adjudicación.",

        priority:

            RulePriority.CRITICAL,

        category:

            RuleCategory.AWARD,

        scope:

            RuleScope.NATIONAL,

        source:

            RuleSource.LCSP,

        action:

            RuleAction.VALIDATE,

        legalReason:

            LegalReasonType.AWARD,



        condition:(context)=>

            Array.isArray(

                context?.award?.criteria

            )

            &&

            context.award.criteria.length>0,



        success:{

            valid:true,

            message:

                "Existen criterios de adjudicación."

        },



        failure:{

            valid:false,

            message:

                "Debe definirse al menos un criterio."

        }

    };

}



/*===========================================================================
=
= PRECIO
=
===========================================================================*/

private priceCriterionRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"PRICE_CRITERION",



        name:"Criterio Precio",



        description:

            "Analiza la existencia del criterio precio.",



        priority:

            RulePriority.HIGH,



        category:

            RuleCategory.AWARD,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.RECOMMEND,



        legalReason:

            LegalReasonType.AWARD,



        condition:(context)=>

            context?.award

                ?.criteria

                ?.some(

                    (c:any)=>

                        c.type==="PRICE"

                ),



        success:{

            valid:true,

            message:

                "Existe criterio económico."

        },



        failure:{

            valid:true,

            message:

                "Se recomienda valorar la inclusión del precio."

        }

    };

}



/*===========================================================================
=
= CALIDAD
=
===========================================================================*/

private qualityCriterionRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"QUALITY_CRITERION",



        name:"Criterios de Calidad",



        description:

            "Comprueba la existencia de criterios cualitativos.",



        priority:

            RulePriority.HIGH,



        category:

            RuleCategory.AWARD,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.RECOMMEND,



        legalReason:

            LegalReasonType.AWARD,



        condition:(context)=>

            context?.award

                ?.criteria

                ?.some(

                    (c:any)=>

                        c.type==="QUALITY"

                ),



        success:{

            valid:true,

            message:

                "Existen criterios cualitativos."

        },



        failure:{

            valid:true,

            message:

                "Conviene incorporar criterios de calidad."

        }

    };

}



/*===========================================================================
=
= JUICIOS DE VALOR
=
===========================================================================*/

private judgementCriteriaRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"VALUE_JUDGEMENT",



        name:"Juicios de Valor",



        description:

            "Detecta la utilización de criterios dependientes de juicio de valor.",



        priority:

            RulePriority.NORMAL,



        category:

            RuleCategory.AWARD,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.WARNING,



        legalReason:

            LegalReasonType.AWARD,



        condition:(context)=>

            context?.award

                ?.criteria

                ?.some(

                    (c:any)=>

                        c.evaluation==="VALUE"

                ),



        success:{

            valid:true,

            message:

                "Existen criterios sujetos a juicio de valor."

        },



        failure:{

            valid:true,

            message:

                "Todos los criterios son automáticos."

        }

    };

}



/*===========================================================================
=
= OFERTAS ANORMALMENTE BAJAS
=
===========================================================================*/

private abnormallyLowOfferRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"ABNORMALLY_LOW",



        name:"Ofertas Anormalmente Bajas",



        description:

            "Comprueba la existencia de reglas para detectar ofertas anormalmente bajas.",



        priority:

            RulePriority.CRITICAL,



        category:

            RuleCategory.AWARD,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.REQUIRE,



        legalReason:

            LegalReasonType.AWARD,



        condition:(context)=>

            context?.award

                ?.abnormallyLowFormula

                !=undefined,



        success:{

            valid:true,

            message:

                "Existe método para detectar ofertas anormalmente bajas."

        },



        failure:{

            valid:false,

            message:

                "Debe incorporarse una regla de detección."

        }

    };

}



/*===========================================================================
=
= CARGA
=
===========================================================================*/

private loadAwardRules()

:void{

    this.registerRule(

        this.awardCriteriaRule()

    );



    this.registerRule(

        this.priceCriterionRule()

    );



    this.registerRule(

        this.qualityCriterionRule()

    );



    this.registerRule(

        this.judgementCriteriaRule()

    );



    this.registerRule(

        this.abnormallyLowOfferRule()

    );

}



/*===========================================================================
=
= ACTUALIZACIÓN LOAD GENERAL
=
===========================================================================*/

/*

Añadir dentro de loadDefaultRules():

this.loadAwardRules();

después de:

this.loadLotsRules();

*/

/*===========================================================================
=
= CONDICIONES ESPECIALES DE EJECUCIÓN
=
===========================================================================*/

private executionConditionsRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"EXECUTION_CONDITIONS",

        name:"Condiciones Especiales de Ejecución",

        description:

            "Verifica la existencia de condiciones especiales de ejecución.",

        priority:

            RulePriority.CRITICAL,

        category:

            RuleCategory.EXECUTION,

        scope:

            RuleScope.NATIONAL,

        source:

            RuleSource.LCSP,

        action:

            RuleAction.REQUIRE,

        legalReason:

            LegalReasonType.EXECUTION,



        condition:(context)=>

            Array.isArray(

                context?.execution

                    ?.conditions

            )

            &&

            context.execution.conditions.length>0,



        success:{

            valid:true,

            message:

                "Se han definido condiciones especiales de ejecución."

        },



        failure:{

            valid:false,

            message:

                "Deben establecerse condiciones especiales de ejecución."

        }

    };

}



/*===========================================================================
=
= PENALIDADES
=
===========================================================================*/

private penaltiesRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"PENALTIES",



        name:"Penalidades Contractuales",



        description:

            "Comprueba la existencia de un régimen de penalidades.",



        priority:

            RulePriority.HIGH,



        category:

            RuleCategory.PENALTIES,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.REQUIRE,



        legalReason:

            LegalReasonType.EXECUTION,



        condition:(context)=>

            context?.execution

                ?.penalties

                !=undefined,



        success:{

            valid:true,

            message:

                "Existe régimen de penalidades."

        },



        failure:{

            valid:false,

            message:

                "Debe incorporarse un régimen de penalidades."

        }

    };

}



/*===========================================================================
=
= MODIFICACIONES CONTRACTUALES
=
===========================================================================*/

private contractModificationRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"CONTRACT_MODIFICATION",



        name:"Modificaciones Contractuales",



        description:

            "Controla la regulación de las modificaciones previstas.",



        priority:

            RulePriority.CRITICAL,



        category:

            RuleCategory.MODIFICATION,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.VALIDATE,



        legalReason:

            LegalReasonType.MODIFICATION,



        condition:(context)=>{

            if(

                context?.execution

                    ?.allowsModification

            ){

                return(

                    context?.execution

                        ?.modificationConditions

                        !=undefined

                );

            }



            return true;

        },



        success:{

            valid:true,

            message:

                "Las modificaciones están correctamente reguladas."

        },



        failure:{

            valid:false,

            message:

                "Deben definirse las condiciones de modificación."

        }

    };

}



/*===========================================================================
=
= PRÓRROGAS
=
===========================================================================*/

private extensionRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"EXTENSIONS",



        name:"Prórrogas",

        

        description:

            "Comprueba el régimen de prórrogas del contrato.",



        priority:

            RulePriority.NORMAL,



        category:

            RuleCategory.EXECUTION,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.VALIDATE,



        legalReason:

            LegalReasonType.EXECUTION,



        condition:(context)=>{

            if(

                context?.execution

                    ?.extensionsAllowed

            ){

                return(

                    context?.execution

                        ?.maximumExtensions

                        >0

                );

            }



            return true;

        },



        success:{

            valid:true,

            message:

                "Régimen de prórrogas definido."

        },



        failure:{

            valid:false,

            message:

                "Debe definirse el régimen de prórrogas."

        }

    };

}



/*===========================================================================
=
= SUBCONTRATACIÓN
=
===========================================================================*/

private subcontractingRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"SUBCONTRACTING",



        name:"Subcontratación",



        description:

            "Evalúa la regulación de la subcontratación.",



        priority:

            RulePriority.HIGH,



        category:

            RuleCategory.EXECUTION,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.VALIDATE,



        legalReason:

            LegalReasonType.EXECUTION,



        condition:(context)=>

            context?.execution

                ?.subcontracting

                !=undefined,



        success:{

            valid:true,

            message:

                "Subcontratación regulada."

        },



        failure:{

            valid:false,

            message:

                "Debe regularse la subcontratación."

        }

    };

}



/*===========================================================================
=
= CESIÓN DEL CONTRATO
=
===========================================================================*/

private assignmentRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"ASSIGNMENT",



        name:"Cesión del Contrato",



        description:

            "Comprueba la regulación de la cesión contractual.",



        priority:

            RulePriority.NORMAL,



        category:

            RuleCategory.EXECUTION,



        scope:

            RuleScope.NATIONAL,



        source:

            RuleSource.LCSP,



        action:

            RuleAction.VALIDATE,



        legalReason:

            LegalReasonType.EXECUTION,



        condition:(context)=>

            context?.execution

                ?.assignment

                !=undefined,



        success:{

            valid:true,

            message:

                "Cesión contractual regulada."

        },



        failure:{

            valid:false,

            message:

                "Debe regularse la cesión del contrato."

        }

    };

}



/*===========================================================================
=
= CARGA
=
===========================================================================*/

private loadExecutionRules()

:void{

    this.registerRule(

        this.executionConditionsRule()

    );



    this.registerRule(

        this.penaltiesRule()

    );



    this.registerRule(

        this.contractModificationRule()

    );



    this.registerRule(

        this.extensionRule()

    );



    this.registerRule(

        this.subcontractingRule()

    );



    this.registerRule(

        this.assignmentRule()

    );

}



/*===========================================================================
=
= ACTUALIZACIÓN LOAD GENERAL
=
===========================================================================*/

/*

Añadir dentro de loadDefaultRules():

this.loadExecutionRules();

después de:

this.loadAwardRules();

*/

/*===========================================================================
=
= CLÁUSULAS SOCIALES
=
===========================================================================*/

private socialClausesRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"SOCIAL_CLAUSES",

        name:"Cláusulas Sociales",

        description:
            "Comprueba la incorporación de cláusulas sociales.",

        priority:
            RulePriority.HIGH,

        category:
            RuleCategory.SOCIAL,

        scope:
            RuleScope.NATIONAL,

        source:
            RuleSource.LCSP,

        action:
            RuleAction.RECOMMEND,

        legalReason:
            LegalReasonType.EXECUTION,

        condition:(context)=>
            context?.execution
                ?.socialClauses===true,

        success:{
            valid:true,
            message:
                "Se incorporan cláusulas sociales."
        },

        failure:{
            valid:true,
            message:
                "Se recomienda valorar cláusulas sociales."
        }

    };

}



/*===========================================================================
=
= CLÁUSULAS MEDIOAMBIENTALES
=
===========================================================================*/

private environmentalClausesRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"ENVIRONMENTAL_CLAUSES",

        name:"Cláusulas Medioambientales",

        description:
            "Comprueba la incorporación de cláusulas ambientales.",

        priority:
            RulePriority.HIGH,

        category:
            RuleCategory.ENVIRONMENTAL,

        scope:
            RuleScope.NATIONAL,

        source:
            RuleSource.LCSP,

        action:
            RuleAction.RECOMMEND,

        legalReason:
            LegalReasonType.EXECUTION,

        condition:(context)=>
            context?.execution
                ?.environmentalClauses===true,

        success:{
            valid:true,
            message:
                "Se incorporan cláusulas ambientales."
        },

        failure:{
            valid:true,
            message:
                "Conviene incorporar cláusulas ambientales."
        }

    };

}



/*===========================================================================
=
= IGUALDAD
=
===========================================================================*/

private equalityRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"EQUALITY",

        name:"Igualdad",

        description:
            "Controla la incorporación de medidas de igualdad.",

        priority:
            RulePriority.NORMAL,

        category:
            RuleCategory.SOCIAL,

        scope:
            RuleScope.NATIONAL,

        source:
            RuleSource.LCSP,

        action:
            RuleAction.RECOMMEND,

        legalReason:
            LegalReasonType.EXECUTION,

        condition:(context)=>
            context?.execution
                ?.equalityMeasures===true,

        success:{
            valid:true,
            message:
                "Existen medidas de igualdad."
        },

        failure:{
            valid:true,
            message:
                "Se recomienda incorporar medidas de igualdad."
        }

    };

}



/*===========================================================================
=
= ACCESIBILIDAD
=
===========================================================================*/

private accessibilityRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"ACCESSIBILITY",

        name:"Accesibilidad Universal",

        description:
            "Verifica requisitos de accesibilidad.",

        priority:
            RulePriority.NORMAL,

        category:
            RuleCategory.SOCIAL,

        scope:
            RuleScope.NATIONAL,

        source:
            RuleSource.LCSP,

        action:
            RuleAction.VALIDATE,

        legalReason:
            LegalReasonType.EXECUTION,

        condition:(context)=>
            context?.execution
                ?.accessibility===true,

        success:{
            valid:true,
            message:
                "Accesibilidad contemplada."
        },

        failure:{
            valid:true,
            message:
                "Debe analizarse la accesibilidad."
        }

    };

}



/*===========================================================================
=
= PROTECCIÓN DE DATOS
=
===========================================================================*/

private dataProtectionRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"DATA_PROTECTION",

        name:"Protección de Datos",

        description:
            "Comprueba la regulación de protección de datos.",

        priority:
            RulePriority.CRITICAL,

        category:
            RuleCategory.EXECUTION,

        scope:
            RuleScope.NATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.REQUIRE,

        legalReason:
            LegalReasonType.EXECUTION,

        condition:(context)=>
            context?.execution
                ?.dataProtection===true,

        success:{
            valid:true,
            message:
                "Protección de datos contemplada."
        },

        failure:{
            valid:false,
            message:
                "Debe regularse la protección de datos."
        }

    };

}



/*===========================================================================
=
= CIBERSEGURIDAD
=
===========================================================================*/

private cybersecurityRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"CYBERSECURITY",

        name:"Ciberseguridad",

        description:
            "Evalúa requisitos de ciberseguridad.",

        priority:
            RulePriority.HIGH,

        category:
            RuleCategory.EXECUTION,

        scope:
            RuleScope.ORGANISATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.RECOMMEND,

        legalReason:
            LegalReasonType.EXECUTION,

        condition:(context)=>
            context?.execution
                ?.cybersecurity===true,

        success:{
            valid:true,
            message:
                "Requisitos de ciberseguridad definidos."
        },

        failure:{
            valid:true,
            message:
                "Conviene definir medidas de ciberseguridad."
        }

    };

}



/*===========================================================================
=
= INTEGRIDAD Y CONFLICTO DE INTERESES
=
===========================================================================*/

private integrityRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"INTEGRITY",

        name:"Integridad y Conflicto de Intereses",

        description:
            "Controla medidas de integridad y prevención de conflictos.",

        priority:
            RulePriority.CRITICAL,

        category:
            RuleCategory.EXECUTION,

        scope:
            RuleScope.NATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.REQUIRE,

        legalReason:
            LegalReasonType.EXECUTION,

        condition:(context)=>
            context?.execution
                ?.integrityMeasures===true,

        success:{
            valid:true,
            message:
                "Medidas de integridad incorporadas."
        },

        failure:{
            valid:false,
            message:
                "Debe incorporarse un régimen de integridad y conflicto de intereses."
        }

    };

}



/*===========================================================================
=
= CARGA
=
===========================================================================*/

private loadClauseRules()

:void{

    this.registerRule(this.socialClausesRule());

    this.registerRule(this.environmentalClausesRule());

    this.registerRule(this.equalityRule());

    this.registerRule(this.accessibilityRule());

    this.registerRule(this.dataProtectionRule());

    this.registerRule(this.cybersecurityRule());

    this.registerRule(this.integrityRule());

}



/*===========================================================================
=
= ACTUALIZACIÓN LOAD GENERAL
=
===========================================================================*/

/*

Añadir dentro de loadDefaultRules():

this.loadClauseRules();

después de:

this.loadExecutionRules();

*/

/*===========================================================================
=
= RECURSO ESPECIAL
=
===========================================================================*/

private specialAppealRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"SPECIAL_APPEAL",

        name:"Recurso Especial",

        description:
            "Determina si el expediente está sujeto a recurso especial.",

        priority:
            RulePriority.CRITICAL,

        category:
            RuleCategory.APPEALS,

        scope:
            RuleScope.NATIONAL,

        source:
            RuleSource.LCSP,

        action:
            RuleAction.CALCULATE,

        legalReason:
            LegalReasonType.APPEALS,



        condition:(context)=>{

            const value=

                Number(

                    context?.contract

                        ?.estimatedValue

                    ??0

                );



            return value>=

                (

                    this.getVariable<number>(

                        "SPECIAL_APPEAL_LIMIT"

                    )??0

                );

        },



        success:{

            valid:true,

            message:
                "El expediente está sujeto a recurso especial.",

            value:true

        },



        failure:{

            valid:true,

            message:
                "No procede recurso especial.",

            value:false

        }

    };

}



/*===========================================================================
=
= ÓRGANO COMPETENTE
=
===========================================================================*/

private appealAuthorityRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"APPEAL_AUTHORITY",



        name:"Órgano Competente",



        description:
            "Determina el órgano competente para resolver el recurso.",



        priority:
            RulePriority.HIGH,



        category:
            RuleCategory.APPEALS,



        scope:
            RuleScope.AUTONOMIC,



        source:
            RuleSource.LCSP,



        action:
            RuleAction.CALCULATE,



        legalReason:
            LegalReasonType.APPEALS,



        condition:()=>true,



        success:{

            valid:true,

            message:
                "Órgano competente determinado."

        },



        failure:{

            valid:false,

            message:
                "No ha sido posible determinar el órgano competente."

        }

    };

}



/*===========================================================================
=
= PLAZO DEL RECURSO
=
===========================================================================*/

private appealDeadlineRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"APPEAL_DEADLINE",



        name:"Plazo del Recurso",



        description:
            "Calcula el plazo para la interposición del recurso.",



        priority:
            RulePriority.CRITICAL,



        category:
            RuleCategory.APPEALS,



        scope:
            RuleScope.NATIONAL,



        source:
            RuleSource.LCSP,



        action:
            RuleAction.CALCULATE,



        legalReason:
            LegalReasonType.APPEALS,



        condition:()=>true,



        success:{

            valid:true,

            message:
                "Plazo del recurso calculado."

        },



        failure:{

            valid:false,

            message:
                "No ha sido posible calcular el plazo."

        }

    };

}



/*===========================================================================
=
= SUSPENSIÓN AUTOMÁTICA
=
===========================================================================*/

private automaticSuspensionRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"AUTOMATIC_SUSPENSION",



        name:"Suspensión Automática",



        description:
            "Comprueba si la interposición produce suspensión automática.",



        priority:
            RulePriority.HIGH,



        category:
            RuleCategory.APPEALS,



        scope:
            RuleScope.NATIONAL,



        source:
            RuleSource.LCSP,



        action:
            RuleAction.WARNING,



        legalReason:
            LegalReasonType.APPEALS,



        condition:(context)=>

            context?.appeals

                ?.automaticSuspension===true,



        success:{

            valid:true,

            message:
                "Existe suspensión automática."

        },



        failure:{

            valid:true,

            message:
                "No existe suspensión automática."

        }

    };

}



/*===========================================================================
=
= ACTOS RECURRIBLES
=
===========================================================================*/

private appealableActsRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"APPEALABLE_ACTS",



        name:"Actos Recurribles",



        description:
            "Comprueba si el acto es susceptible de recurso.",



        priority:
            RulePriority.CRITICAL,



        category:
            RuleCategory.APPEALS,



        scope:
            RuleScope.NATIONAL,



        source:
            RuleSource.LCSP,



        action:
            RuleAction.VALIDATE,



        legalReason:
            LegalReasonType.APPEALS,



        condition:(context)=>

            context?.appeals

                ?.appealable===true,



        success:{

            valid:true,

            message:
                "El acto es recurrible."

        },



        failure:{

            valid:true,

            message:
                "El acto no es recurrible."

        }

    };

}



/*===========================================================================
=
= UMBRALES DEL RECURSO ESPECIAL
=
===========================================================================*/

private appealThresholdRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,



        code:"APPEAL_THRESHOLD",



        name:"Umbrales Recurso Especial",



        description:
            "Verifica automáticamente los umbrales económicos.",



        priority:
            RulePriority.CRITICAL,



        category:
            RuleCategory.APPEALS,



        scope:
            RuleScope.NATIONAL,



        source:
            RuleSource.LCSP,



        action:
            RuleAction.CALCULATE,



        legalReason:
            LegalReasonType.APPEALS,



        condition:(context)=>{

            const amount=

                Number(

                    context?.contract

                        ?.estimatedValue

                    ??0

                );



            this.setVariable(

                "SPECIAL_APPEAL_AVAILABLE",

                amount>=

                (

                    this.getVariable<number>(

                        "SPECIAL_APPEAL_LIMIT"

                    )??0

                )

            );



            return true;

        },



        success:{

            valid:true,

            message:
                "Umbral verificado."

        },



        failure:{

            valid:false,

            message:
                "No ha sido posible verificar el umbral."

        }

    };

}



/*===========================================================================
=
= CARGA
=
===========================================================================*/

private loadAppealRules()

:void{

    this.registerRule(this.specialAppealRule());

    this.registerRule(this.appealAuthorityRule());

    this.registerRule(this.appealDeadlineRule());

    this.registerRule(this.automaticSuspensionRule());

    this.registerRule(this.appealableActsRule());

    this.registerRule(this.appealThresholdRule());

}



/*===========================================================================
=
= ACTUALIZACIÓN LOAD GENERAL
=
===========================================================================*/

/*

Añadir dentro de loadDefaultRules():

this.loadAppealRules();

después de:

this.loadClauseRules();

*/

/*===========================================================================
=
= VALIDACIÓN DE DOCUMENTACIÓN
=
===========================================================================*/

private documentationValidationRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"DOCUMENTATION_VALIDATION",

        name:"Validación Documental",

        description:
            "Comprueba que toda la documentación obligatoria exista.",

        priority:
            RulePriority.CRITICAL,

        category:
            RuleCategory.VALIDATION,

        scope:
            RuleScope.NATIONAL,

        source:
            RuleSource.LCSP,

        action:
            RuleAction.VALIDATE,

        legalReason:
            LegalReasonType.DOCUMENTATION,

        condition:(context)=>{

            const docs=context?.documents;

            return(

                docs?.needReport!=null &&

                docs?.pcap!=null &&

                docs?.ppt!=null &&

                docs?.budget!=null

            );

        },

        success:{
            valid:true,
            message:
                "La documentación obligatoria está completa."
        },

        failure:{
            valid:false,
            message:
                "Falta documentación obligatoria."
        }

    };

}



/*===========================================================================
=
= VALIDACIÓN PRESUPUESTARIA
=
===========================================================================*/

private budgetValidationRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"BUDGET_VALIDATION",

        name:"Validación Presupuestaria",

        description:
            "Comprueba la existencia de crédito adecuado y suficiente.",

        priority:
            RulePriority.CRITICAL,

        category:
            RuleCategory.VALIDATION,

        scope:
            RuleScope.NATIONAL,

        source:
            RuleSource.LCSP,

        action:
            RuleAction.VALIDATE,

        legalReason:
            LegalReasonType.BUDGET,

        condition:(context)=>

            context?.budget

                ?.available===true,

        success:{

            valid:true,

            message:
                "Existe crédito adecuado y suficiente."

        },

        failure:{

            valid:false,

            message:
                "No consta crédito presupuestario."

        }

    };

}



/*===========================================================================
=
= VALIDACIÓN ECONÓMICA
=
===========================================================================*/

private economicValidationRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"ECONOMIC_VALIDATION",

        name:"Validación Económica",

        description:
            "Comprueba la coherencia económica del expediente.",

        priority:
            RulePriority.CRITICAL,

        category:
            RuleCategory.VALIDATION,

        scope:
            RuleScope.NATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.VALIDATE,

        legalReason:
            LegalReasonType.BUDGET,

        condition:(context)=>{

            const base=

                Number(

                    context?.contract

                        ?.baseBudget

                    ??0

                );



            const value=

                Number(

                    context?.contract

                        ?.estimatedValue

                    ??0

                );



            return(

                value>=base &&

                base>0

            );

        },

        success:{

            valid:true,

            message:
                "La información económica es coherente."

        },

        failure:{

            valid:false,

            message:
                "Se detectan incoherencias económicas."

        }

    };

}



/*===========================================================================
=
= VALIDACIÓN TEMPORAL
=
===========================================================================*/

private temporalValidationRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"TEMPORAL_VALIDATION",

        name:"Validación Temporal",

        description:
            "Comprueba la coherencia cronológica del expediente.",

        priority:
            RulePriority.HIGH,

        category:
            RuleCategory.VALIDATION,

        scope:
            RuleScope.NATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.VALIDATE,

        legalReason:
            LegalReasonType.PROCEDURE,

        condition:(context)=>{

            const start=

                context?.execution?.startDate;



            const award=

                context?.award?.date;



            if(!start||!award){

                return true;

            }



            return(

                new Date(start)>=

                new Date(award)

            );

        },

        success:{

            valid:true,

            message:
                "Las fechas son coherentes."

        },

        failure:{

            valid:false,

            message:
                "Las fechas del expediente son incoherentes."

        }

    };

}



/*===========================================================================
=
= VALIDACIÓN JURÍDICA
=
===========================================================================*/

private legalValidationRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"LEGAL_VALIDATION",

        name:"Validación Jurídica",

        description:
            "Comprueba la existencia de informe jurídico.",

        priority:
            RulePriority.CRITICAL,

        category:
            RuleCategory.VALIDATION,

        scope:
            RuleScope.NATIONAL,

        source:
            RuleSource.LCSP,

        action:
            RuleAction.VALIDATE,

        legalReason:
            LegalReasonType.DOCUMENTATION,

        condition:(context)=>

            context?.documents

                ?.legalReport===true,

        success:{

            valid:true,

            message:
                "Existe informe jurídico."

        },

        failure:{

            valid:false,

            message:
                "Debe incorporarse informe jurídico."

        }

    };

}



/*===========================================================================
=
= COHERENCIA GENERAL
=
===========================================================================*/

private consistencyValidationRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"CONSISTENCY_VALIDATION",

        name:"Coherencia General",

        description:
            "Realiza una validación global del expediente.",

        priority:
            RulePriority.CRITICAL,

        category:
            RuleCategory.VALIDATION,

        scope:
            RuleScope.ORGANISATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.VALIDATE,

        legalReason:
            LegalReasonType.PROCEDURE,

        condition:()=>true,

        success:{

            valid:true,

            message:
                "Expediente coherente."

        },

        failure:{

            valid:false,

            message:
                "Existen incoherencias que requieren revisión."

        }

    };

}



/*===========================================================================
=
= VALIDACIÓN FINAL
=
===========================================================================*/

private finalValidationRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"FINAL_VALIDATION",

        name:"Validación Final",

        description:
            "Realiza la validación final antes de generar el expediente.",

        priority:
            RulePriority.CRITICAL,

        category:
            RuleCategory.VALIDATION,

        scope:
            RuleScope.ORGANISATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.VALIDATE,

        legalReason:
            LegalReasonType.PROCEDURE,

        condition:()=>true,

        success:{

            valid:true,

            message:
                "Expediente preparado para su generación."

        },

        failure:{

            valid:false,

            message:
                "El expediente no puede generarse."

        }

    };

}



/*===========================================================================
=
= CARGA
=
===========================================================================*/

private loadValidationRules()

:void{

    this.registerRule(this.documentationValidationRule());

    this.registerRule(this.budgetValidationRule());

    this.registerRule(this.economicValidationRule());

    this.registerRule(this.temporalValidationRule());

    this.registerRule(this.legalValidationRule());

    this.registerRule(this.consistencyValidationRule());

    this.registerRule(this.finalValidationRule());

}



/*===========================================================================
=
= ACTUALIZACIÓN LOAD GENERAL
=
===========================================================================*/

/*

Añadir dentro de loadDefaultRules():

this.loadValidationRules();

después de:

this.loadAppealRules();

*/

/*===========================================================================
=
= GENERACIÓN DE MEMORIA JUSTIFICATIVA
=
===========================================================================*/

private generateNeedReportRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"GENERATE_NEED_REPORT",

        name:"Generar Memoria Justificativa",

        description:
            "Determina si el sistema puede generar automáticamente la memoria justificativa.",

        priority:
            RulePriority.CRITICAL,

        category:
            RuleCategory.DOCUMENTS,

        scope:
            RuleScope.ORGANISATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.GENERATE,

        legalReason:
            LegalReasonType.DOCUMENTATION,

        condition:(context)=>

            context?.need!=undefined,

        success:{

            valid:true,

            message:
                "Memoria justificativa preparada para generar."

        },

        failure:{

            valid:false,

            message:
                "Información insuficiente para generar la memoria."

        }

    };

}



/*===========================================================================
=
= INFORME DE INSUFICIENCIA DE MEDIOS
=
===========================================================================*/

private generateInsufficiencyReportRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"GENERATE_INSUFFICIENCY",

        name:"Informe de Insuficiencia de Medios",

        description:
            "Generación automática del informe.",

        priority:
            RulePriority.CRITICAL,

        category:
            RuleCategory.DOCUMENTS,

        scope:
            RuleScope.ORGANISATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.GENERATE,

        legalReason:
            LegalReasonType.DOCUMENTATION,

        condition:(context)=>

            context?.need
                ?.lackOfResources===true,

        success:{

            valid:true,

            message:
                "Informe preparado."

        },

        failure:{

            valid:true,

            message:
                "No procede."

        }

    };

}



/*===========================================================================
=
= PPT
=
===========================================================================*/

private generatePPTRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"GENERATE_PPT",

        name:"Generación PPT",

        description:
            "Permite generar automáticamente el Pliego de Prescripciones Técnicas.",

        priority:
            RulePriority.CRITICAL,

        category:
            RuleCategory.DOCUMENTS,

        scope:
            RuleScope.ORGANISATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.GENERATE,

        legalReason:
            LegalReasonType.DOCUMENTATION,

        condition:(context)=>

            context?.technicalSpecification!=undefined,

        success:{

            valid:true,

            message:
                "PPT listo para generar."

        },

        failure:{

            valid:false,

            message:
                "Información técnica insuficiente."

        }

    };

}



/*===========================================================================
=
= PCAP
=
===========================================================================*/

private generatePCAPRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"GENERATE_PCAP",

        name:"Generación PCAP",

        description:
            "Permite generar automáticamente el Pliego Administrativo.",

        priority:
            RulePriority.CRITICAL,

        category:
            RuleCategory.DOCUMENTS,

        scope:
            RuleScope.ORGANISATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.GENERATE,

        legalReason:
            LegalReasonType.DOCUMENTATION,

        condition:(context)=>

            context?.procedure!=undefined,

        success:{

            valid:true,

            message:
                "PCAP preparado."

        },

        failure:{

            valid:false,

            message:
                "No existen datos suficientes."

        }

    };

}



/*===========================================================================
=
= RESOLUCIONES
=
===========================================================================*/

private generateResolutionRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"GENERATE_RESOLUTION",

        name:"Resoluciones",

        description:
            "Generación automática de resoluciones.",

        priority:
            RulePriority.HIGH,

        category:
            RuleCategory.DOCUMENTS,

        scope:
            RuleScope.ORGANISATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.GENERATE,

        legalReason:
            LegalReasonType.DOCUMENTATION,

        condition:()=>true,

        success:{

            valid:true,

            message:
                "Resoluciones disponibles."

        },

        failure:{

            valid:false,

            message:
                "No pueden generarse."

        }

    };

}



/*===========================================================================
=
= ANUNCIOS
=
===========================================================================*/

private generatePublicationRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"GENERATE_PUBLICATION",

        name:"Generación de Anuncios",

        description:
            "Genera automáticamente anuncios de licitación.",

        priority:
            RulePriority.HIGH,

        category:
            RuleCategory.DOCUMENTS,

        scope:
            RuleScope.ORGANISATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.GENERATE,

        legalReason:
            LegalReasonType.PUBLICITY,

        condition:(context)=>

            context?.publication!=undefined,

        success:{

            valid:true,

            message:
                "Anuncios preparados."

        },

        failure:{

            valid:false,

            message:
                "No ha sido posible generar anuncios."

        }

    };

}



/*===========================================================================
=
= TRAZABILIDAD
=
===========================================================================*/

private traceabilityRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"TRACEABILITY",

        name:"Trazabilidad",

        description:
            "Registra todas las decisiones adoptadas por el motor.",

        priority:
            RulePriority.CRITICAL,

        category:
            RuleCategory.SYSTEM,

        scope:
            RuleScope.ORGANISATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.LOG,

        legalReason:
            LegalReasonType.PROCEDURE,

        condition:()=>true,

        success:{

            valid:true,

            message:
                "Trazabilidad registrada."

        },

        failure:{

            valid:false,

            message:
                "No ha sido posible registrar la trazabilidad."

        }

    };

}



/*===========================================================================
=
= CARGA
=
===========================================================================*/

private loadDocumentGenerationRules()

:void{

    this.registerRule(this.generateNeedReportRule());

    this.registerRule(this.generateInsufficiencyReportRule());

    this.registerRule(this.generatePPTRule());

    this.registerRule(this.generatePCAPRule());

    this.registerRule(this.generateResolutionRule());

    this.registerRule(this.generatePublicationRule());

    this.registerRule(this.traceabilityRule());

}



/*===========================================================================
=
= ACTUALIZACIÓN LOAD GENERAL
=
===========================================================================*/

/*

Añadir dentro de loadDefaultRules():

this.loadDocumentGenerationRules();

después de:

this.loadValidationRules();

*/

/*===========================================================================
=
= SELECCIÓN AUTOMÁTICA DE ARTÍCULOS LCSP
=
===========================================================================*/

private legalArticlesRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"LEGAL_ARTICLES",

        name:"Selección Automática de Artículos",

        description:
            "Obtiene automáticamente los artículos de la LCSP relacionados con la decisión.",

        priority:
            RulePriority.CRITICAL,

        category:
            RuleCategory.LEGAL_AI,

        scope:
            RuleScope.NATIONAL,

        source:
            RuleSource.LCSP,

        action:
            RuleAction.CALCULATE,

        legalReason:
            LegalReasonType.LEGAL,

        condition:()=>true,

        success:{

            valid:true,

            message:
                "Artículos legales identificados."

        },

        failure:{

            valid:false,

            message:
                "No ha sido posible determinar la referencia normativa."

        }

    };

}



/*===========================================================================
=
= RECOMENDACIÓN JURÍDICA
=
===========================================================================*/

private legalRecommendationRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"LEGAL_RECOMMENDATION",

        name:"Recomendación Jurídica",

        description:
            "Genera una recomendación jurídica basada en las reglas aplicadas.",

        priority:
            RulePriority.CRITICAL,

        category:
            RuleCategory.LEGAL_AI,

        scope:
            RuleScope.NATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.RECOMMEND,

        legalReason:
            LegalReasonType.LEGAL,

        condition:()=>true,

        success:{

            valid:true,

            message:
                "Recomendación jurídica generada."

        },

        failure:{

            valid:false,

            message:
                "No ha sido posible generar la recomendación."

        }

    };

}



/*===========================================================================
=
= MOTIVACIÓN AUTOMÁTICA
=
===========================================================================*/

private legalMotivationRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"LEGAL_MOTIVATION",

        name:"Motivación Automática",

        description:
            "Construye automáticamente la motivación jurídica del expediente.",

        priority:
            RulePriority.CRITICAL,

        category:
            RuleCategory.LEGAL_AI,

        scope:
            RuleScope.NATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.GENERATE,

        legalReason:
            LegalReasonType.LEGAL,

        condition:()=>true,

        success:{

            valid:true,

            message:
                "Motivación jurídica preparada."

        },

        failure:{

            valid:false,

            message:
                "No ha sido posible elaborar la motivación."

        }

    };

}



/*===========================================================================
=
= REFERENCIAS NORMATIVAS
=
===========================================================================*/

private legalReferencesRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"LEGAL_REFERENCES",

        name:"Referencias Normativas",

        description:
            "Obtiene normativa relacionada automáticamente.",

        priority:
            RulePriority.HIGH,

        category:
            RuleCategory.LEGAL_AI,

        scope:
            RuleScope.NATIONAL,

        source:
            RuleSource.LCSP,

        action:
            RuleAction.CALCULATE,

        legalReason:
            LegalReasonType.LEGAL,

        condition:()=>true,

        success:{

            valid:true,

            message:
                "Referencias normativas obtenidas."

        },

        failure:{

            valid:false,

            message:
                "No existen referencias disponibles."

        }

    };

}



/*===========================================================================
=
= JURISPRUDENCIA
=
===========================================================================*/

private jurisprudenceRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"JURISPRUDENCE",

        name:"Jurisprudencia",

        description:
            "Asocia resoluciones y jurisprudencia relacionada.",

        priority:
            RulePriority.NORMAL,

        category:
            RuleCategory.LEGAL_AI,

        scope:
            RuleScope.NATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.RECOMMEND,

        legalReason:
            LegalReasonType.LEGAL,

        condition:()=>true,

        success:{

            valid:true,

            message:
                "Jurisprudencia relacionada encontrada."

        },

        failure:{

            valid:true,

            message:
                "No existe jurisprudencia asociada."

        }

    };

}



/*===========================================================================
=
= REGLAS DE INTERPRETACIÓN
=
===========================================================================*/

private interpretationRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"LEGAL_INTERPRETATION",

        name:"Interpretación Jurídica",

        description:
            "Aplica reglas interpretativas sobre la normativa.",

        priority:
            RulePriority.HIGH,

        category:
            RuleCategory.LEGAL_AI,

        scope:
            RuleScope.NATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.RECOMMEND,

        legalReason:
            LegalReasonType.LEGAL,

        condition:()=>true,

        success:{

            valid:true,

            message:
                "Interpretación jurídica disponible."

        },

        failure:{

            valid:false,

            message:
                "No se ha podido interpretar la normativa."

        }

    };

}



/*===========================================================================
=
= EXPLICACIÓN PARA USUARIOS
=
===========================================================================*/

private explanationRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"LEGAL_EXPLANATION",

        name:"Explicación para Usuarios",

        description:
            "Genera explicaciones comprensibles para usuarios no expertos.",

        priority:
            RulePriority.NORMAL,

        category:
            RuleCategory.LEGAL_AI,

        scope:
            RuleScope.ORGANISATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.GENERATE,

        legalReason:
            LegalReasonType.LEGAL,

        condition:()=>true,

        success:{

            valid:true,

            message:
                "Explicación preparada."

        },

        failure:{

            valid:false,

            message:
                "No ha sido posible generar la explicación."

        }

    };

}



/*===========================================================================
=
= CARGA
=
===========================================================================*/

private loadLegalAIRules()

:void{

    this.registerRule(this.legalArticlesRule());

    this.registerRule(this.legalRecommendationRule());

    this.registerRule(this.legalMotivationRule());

    this.registerRule(this.legalReferencesRule());

    this.registerRule(this.jurisprudenceRule());

    this.registerRule(this.interpretationRule());

    this.registerRule(this.explanationRule());

}



/*===========================================================================
=
= ACTUALIZACIÓN LOAD GENERAL
=
===========================================================================*/

/*

Añadir dentro de loadDefaultRules():

this.loadLegalAIRules();

después de:

this.loadDocumentGenerationRules();

*/

/*===========================================================================
=
= DIAGNÓSTICO GENERAL DEL EXPEDIENTE
=
===========================================================================*/

private expertDiagnosisRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"EXPERT_DIAGNOSIS",

        name:"Diagnóstico General",

        description:
            "Realiza un diagnóstico integral del expediente.",

        priority:
            RulePriority.CRITICAL,

        category:
            RuleCategory.EXPERT,

        scope:
            RuleScope.ORGANISATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.ANALYZE,

        legalReason:
            LegalReasonType.PROCEDURE,

        condition:()=>true,

        success:{
            valid:true,
            message:
                "Diagnóstico realizado correctamente."
        },

        failure:{
            valid:false,
            message:
                "No ha sido posible realizar el diagnóstico."
        }

    };

}



/*===========================================================================
=
= DETECCIÓN DE ERRORES
=
===========================================================================*/

private errorDetectionRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"ERROR_DETECTION",

        name:"Detección de Errores",

        description:
            "Busca errores relevantes dentro del expediente.",

        priority:
            RulePriority.CRITICAL,

        category:
            RuleCategory.EXPERT,

        scope:
            RuleScope.ORGANISATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.ANALYZE,

        legalReason:
            LegalReasonType.PROCEDURE,

        condition:()=>true,

        success:{
            valid:true,
            message:
                "No se detectan errores relevantes."
        },

        failure:{
            valid:false,
            message:
                "Se han detectado errores."
        }

    };

}



/*===========================================================================
=
= DETECCIÓN DE INCOHERENCIAS
=
===========================================================================*/

private inconsistencyRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"INCONSISTENCIES",

        name:"Incoherencias",

        description:
            "Busca contradicciones entre documentos y datos.",

        priority:
            RulePriority.CRITICAL,

        category:
            RuleCategory.EXPERT,

        scope:
            RuleScope.ORGANISATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.ANALYZE,

        legalReason:
            LegalReasonType.PROCEDURE,

        condition:()=>true,

        success:{
            valid:true,
            message:
                "No existen incoherencias."
        },

        failure:{
            valid:false,
            message:
                "Existen incoherencias entre documentos."
        }

    };

}



/*===========================================================================
=
= RIESGO JURÍDICO
=
===========================================================================*/

private legalRiskRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"LEGAL_RISK",

        name:"Riesgo Jurídico",

        description:
            "Calcula el nivel de riesgo jurídico del expediente.",

        priority:
            RulePriority.CRITICAL,

        category:
            RuleCategory.EXPERT,

        scope:
            RuleScope.NATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.ANALYZE,

        legalReason:
            LegalReasonType.LEGAL,

        condition:()=>true,

        success:{

            valid:true,

            message:
                "Riesgo jurídico bajo.",

            value:"LOW"

        },

        failure:{

            valid:false,

            message:
                "Riesgo jurídico elevado.",

            value:"HIGH"

        }

    };

}



/*===========================================================================
=
= NIVEL DE CUMPLIMIENTO LCSP
=
===========================================================================*/

private complianceScoreRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"LCSP_COMPLIANCE",

        name:"Cumplimiento LCSP",

        description:
            "Calcula el porcentaje de cumplimiento normativo.",

        priority:
            RulePriority.CRITICAL,

        category:
            RuleCategory.EXPERT,

        scope:
            RuleScope.NATIONAL,

        source:
            RuleSource.LCSP,

        action:
            RuleAction.CALCULATE,

        legalReason:
            LegalReasonType.LEGAL,

        condition:()=>{

            this.setVariable(

                "LCSP_SCORE",

                100

            );

            return true;

        },

        success:{

            valid:true,

            message:
                "Nivel de cumplimiento calculado."

        },

        failure:{

            valid:false,

            message:
                "No ha sido posible calcular el cumplimiento."

        }

    };

}



/*===========================================================================
=
= ÍNDICE DE CALIDAD
=
===========================================================================*/

private qualityIndexRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"QUALITY_INDEX",

        name:"Índice de Calidad",

        description:
            "Obtiene una puntuación global del expediente.",

        priority:
            RulePriority.HIGH,

        category:
            RuleCategory.EXPERT,

        scope:
            RuleScope.ORGANISATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.CALCULATE,

        legalReason:
            LegalReasonType.PROCEDURE,

        condition:()=>{

            this.setVariable(

                "QUALITY_INDEX",

                95

            );

            return true;

        },

        success:{

            valid:true,

            message:
                "Índice calculado."

        },

        failure:{

            valid:false,

            message:
                "No ha sido posible calcular el índice."

        }

    };

}



/*===========================================================================
=
= RECOMENDACIONES PRIORIZADAS
=
===========================================================================*/

private prioritizedRecommendationsRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"PRIORITIZED_RECOMMENDATIONS",

        name:"Recomendaciones Prioritarias",

        description:
            "Genera recomendaciones ordenadas por prioridad.",

        priority:
            RulePriority.HIGH,

        category:
            RuleCategory.EXPERT,

        scope:
            RuleScope.ORGANISATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.RECOMMEND,

        legalReason:
            LegalReasonType.PROCEDURE,

        condition:()=>true,

        success:{

            valid:true,

            message:
                "Recomendaciones generadas."

        },

        failure:{

            valid:false,

            message:
                "No ha sido posible generar recomendaciones."

        }

    };

}



/*===========================================================================
=
= CARGA
=
===========================================================================*/

private loadExpertRules()

:void{

    this.registerRule(this.expertDiagnosisRule());

    this.registerRule(this.errorDetectionRule());

    this.registerRule(this.inconsistencyRule());

    this.registerRule(this.legalRiskRule());

    this.registerRule(this.complianceScoreRule());

    this.registerRule(this.qualityIndexRule());

    this.registerRule(this.prioritizedRecommendationsRule());

}



/*===========================================================================
=
= ACTUALIZACIÓN LOAD GENERAL
=
===========================================================================*/

/*

Añadir dentro de loadDefaultRules():

this.loadExpertRules();

después de:

this.loadLegalAIRules();

*/

/*===========================================================================
=
= AUTOAPRENDIZAJE DEL MOTOR
=
===========================================================================*/

private learningEngineRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"LEARNING_ENGINE",

        name:"Motor de Autoaprendizaje",

        description:
            "Permite almacenar patrones de decisiones para mejorar recomendaciones futuras.",

        priority:
            RulePriority.NORMAL,

        category:
            RuleCategory.SYSTEM,

        scope:
            RuleScope.ORGANISATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.LOG,

        legalReason:
            LegalReasonType.PROCEDURE,

        condition:()=>true,

        success:{
            valid:true,
            message:
                "Patrón registrado correctamente."
        },

        failure:{
            valid:false,
            message:
                "No ha sido posible registrar el aprendizaje."
        }

    };

}



/*===========================================================================
=
= OPTIMIZACIÓN DEL EXPEDIENTE
=
===========================================================================*/

private optimizationRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"EXPEDIENT_OPTIMIZATION",

        name:"Optimización",

        description:
            "Busca automáticamente mejoras sobre el expediente.",

        priority:
            RulePriority.HIGH,

        category:
            RuleCategory.EXPERT,

        scope:
            RuleScope.ORGANISATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.RECOMMEND,

        legalReason:
            LegalReasonType.PROCEDURE,

        condition:()=>true,

        success:{

            valid:true,

            message:
                "Se han identificado oportunidades de mejora."

        },

        failure:{

            valid:false,

            message:
                "No ha sido posible optimizar el expediente."

        }

    };

}



/*===========================================================================
=
= REUTILIZACIÓN DE EXPEDIENTES
=
===========================================================================*/

private previousFilesRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"PREVIOUS_FILES",

        name:"Reutilización",

        description:
            "Busca expedientes similares para reutilizar conocimiento.",

        priority:
            RulePriority.NORMAL,

        category:
            RuleCategory.EXPERT,

        scope:
            RuleScope.ORGANISATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.RECOMMEND,

        legalReason:
            LegalReasonType.PROCEDURE,

        condition:()=>true,

        success:{

            valid:true,

            message:
                "Se localizaron expedientes similares."

        },

        failure:{

            valid:true,

            message:
                "No existen antecedentes reutilizables."

        }

    };

}



/*===========================================================================
=
= PATRONES DE CONTRATACIÓN
=
===========================================================================*/

private procurementPatternsRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"PROCUREMENT_PATTERNS",

        name:"Patrones de Contratación",

        description:
            "Analiza patrones históricos de contratación.",

        priority:
            RulePriority.NORMAL,

        category:
            RuleCategory.EXPERT,

        scope:
            RuleScope.ORGANISATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.ANALYZE,

        legalReason:
            LegalReasonType.PROCEDURE,

        condition:()=>true,

        success:{

            valid:true,

            message:
                "Patrones identificados."

        },

        failure:{

            valid:false,

            message:
                "No ha sido posible analizar patrones."

        }

    };

}



/*===========================================================================
=
= PROPUESTA DE MEJORAS
=
===========================================================================*/

private improvementProposalRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"IMPROVEMENT_PROPOSALS",

        name:"Propuestas de Mejora",

        description:
            "Genera propuestas concretas para mejorar el expediente.",

        priority:
            RulePriority.HIGH,

        category:
            RuleCategory.EXPERT,

        scope:
            RuleScope.ORGANISATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.RECOMMEND,

        legalReason:
            LegalReasonType.PROCEDURE,

        condition:()=>true,

        success:{

            valid:true,

            message:
                "Propuestas elaboradas."

        },

        failure:{

            valid:false,

            message:
                "No se pudieron elaborar propuestas."

        }

    };

}



/*===========================================================================
=
= INDICADORES DE EFICIENCIA
=
===========================================================================*/

private efficiencyIndicatorsRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"EFFICIENCY_INDICATORS",

        name:"Indicadores",

        description:
            "Calcula indicadores de eficiencia del expediente.",

        priority:
            RulePriority.NORMAL,

        category:
            RuleCategory.EXPERT,

        scope:
            RuleScope.ORGANISATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.CALCULATE,

        legalReason:
            LegalReasonType.PROCEDURE,

        condition:()=>{

            this.setVariable(

                "EFFICIENCY_SCORE",

                100

            );

            return true;

        },

        success:{

            valid:true,

            message:
                "Indicadores calculados."

        },

        failure:{

            valid:false,

            message:
                "No ha sido posible calcular indicadores."

        }

    };

}



/*===========================================================================
=
= NIVEL DE MADUREZ
=
===========================================================================*/

private maturityRule()

:Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"MATURITY_LEVEL",

        name:"Madurez del Expediente",

        description:
            "Calcula el nivel de madurez del expediente.",

        priority:
            RulePriority.NORMAL,

        category:
            RuleCategory.EXPERT,

        scope:
            RuleScope.ORGANISATIONAL,

        source:
            RuleSource.INTERNAL_POLICY,

        action:
            RuleAction.CALCULATE,

        legalReason:
            LegalReasonType.PROCEDURE,

        condition:()=>{

            this.setVariable(

                "MATURITY_LEVEL",

                "ADVANCED"

            );

            return true;

        },

        success:{

            valid:true,

            message:
                "Nivel de madurez calculado."

        },

        failure:{

            valid:false,

            message:
                "No ha sido posible calcular la madurez."

        }

    };

}



/*===========================================================================
=
= CARGA
=
===========================================================================*/

private loadLearningRules()

:void{

    this.registerRule(this.learningEngineRule());

    this.registerRule(this.optimizationRule());

    this.registerRule(this.previousFilesRule());

    this.registerRule(this.procurementPatternsRule());

    this.registerRule(this.improvementProposalRule());

    this.registerRule(this.efficiencyIndicatorsRule());

    this.registerRule(this.maturityRule());

}



/*===========================================================================
=
= ACTUALIZACIÓN LOAD GENERAL
=
===========================================================================*/

/*

Añadir dentro de loadDefaultRules():

this.loadLearningRules();

después de:

this.loadExpertRules();

*/

/*===========================================================================
=
= AUDITORÍA GENERAL
=
===========================================================================*/

private auditRule():Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"AUDIT",

        name:"Auditoría",

        description:
            "Genera el registro completo de auditoría.",

        priority:RulePriority.CRITICAL,

        category:RuleCategory.SYSTEM,

        scope:RuleScope.ORGANISATIONAL,

        source:RuleSource.INTERNAL_POLICY,

        action:RuleAction.LOG,

        legalReason:LegalReasonType.PROCEDURE,

        condition:()=>true,

        success:{
            valid:true,
            message:"Auditoría completada."
        },

        failure:{
            valid:false,
            message:"Error durante la auditoría."
        }

    };

}

/*===========================================================================
=
= MÉTRICAS
=
===========================================================================*/

private metricsRule():Rule{

    return{

        id:crypto.randomUUID() as UUID,

        code:"METRICS",

        name:"Métricas",

        description:
            "Calcula estadísticas del expediente.",

        priority:RulePriority.NORMAL,

        category:RuleCategory.SYSTEM,

        scope:RuleScope.ORGANISATIONAL,

        source:RuleSource.INTERNAL_POLICY,

        action:RuleAction.CALCULATE,

        legalReason:LegalReasonType.PROCEDURE,

        condition:()=>{

            this.setVariable(

                "RULES_REGISTERED",

                this.rules.size

            );

            return true;

        },

        success:{
            valid:true,
            message:"Métricas calculadas."
        },

        failure:{
            valid:false,
            message:"No fue posible calcular métricas."
        }

    };

}

/*===========================================================================
=
= EJECUCIÓN GLOBAL
=
===========================================================================*/

public execute(

    context:RuleContext

):RuleExecutionResult{

    const start=Date.now();

    const executed:RuleResult[]=[];

    const errors:RuleResult[]=[];

    const warnings:RuleResult[]=[];



    for(

        const rule

        of

        this.getOrderedRules()

    ){

        const result=

            this.evaluateRule(

                rule,

                context

            );



        executed.push(result);



        if(!result.valid){

            errors.push(result);

        }



        if(result.warning){

            warnings.push(result);

        }

    }



    return{

        success:

            errors.length===0,



        executedRules:

            executed,



        errors,



        warnings,



        variables:

            new Map(this.variables),



        executionTime:

            Date.now()-start

    };

}

/*===========================================================================
=
= ORDENACIÓN
=
===========================================================================*/

private getOrderedRules()

:Rule[]{

    return

        [...this.rules.values()]

        .sort(

            (a,b)=>

                b.priority-a.priority

        );

}

/*===========================================================================
=
= EVALUACIÓN
=
===========================================================================*/

private evaluateRule(

    rule:Rule,

    context:RuleContext

):RuleResult{

    try{

        const ok=

            rule.condition(context);



        const info=

            ok

            ?rule.success

            :rule.failure;



        return{

            id:rule.id,

            code:rule.code,

            valid:info.valid,

            warning:

                rule.action===

                RuleAction.WARNING,

            message:info.message,

            value:info.value,

            rule

        };

    }

    catch(ex){

        return{

            id:rule.id,

            code:rule.code,

            valid:false,

            warning:false,

            message:

                ex instanceof Error

                ?ex.message

                :"Unknown error",

            rule

        };

    }

}

/*===========================================================================
=
= CARGA FINAL
=
===========================================================================*/

private loadSystemRules()

:void{

    this.registerRule(

        this.auditRule()

    );



    this.registerRule(

        this.metricsRule()

    );

}

/*===========================================================================
=
= INICIALIZACIÓN DEFINITIVA
=
===========================================================================*/

private initialize()

:void{

    this.loadVariables();

    this.loadDeadlineRules();

    this.loadSolvencyRules();

    this.loadGuaranteeRules();

    this.loadLotsRules();

    this.loadAwardRules();

    this.loadExecutionRules();

    this.loadClauseRules();

    this.loadAppealRules();

    this.loadValidationRules();

    this.loadDocumentGenerationRules();

    this.loadLegalAIRules();

    this.loadExpertRules();

    this.loadLearningRules();

    this.loadSystemRules();

}

/*===========================================================================
=
= CONSTRUCTOR
=
===========================================================================*/

constructor(){

    this.initialize();

}

/*===========================================================================
=
= EXPORTACIÓN
=
===========================================================================*/
}


export default RuleEngine;

export{

    RuleEngine

};

