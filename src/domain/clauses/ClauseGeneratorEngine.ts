/*****************************************************************************************
*
* BLOQUE 1 de 24
*
* CLAUSE GENERATOR ENGINE
*
* MOTOR GENERADOR DE CLÁUSULAS
*
******************************************************************************************/

import { ContractType } from "../contracts/ContractType";
import { CPVCode } from "../cpv/CPVCode";

/*==============================================================================
=
= CONTEXTO DEL GENERADOR
=
==============================================================================*/

export interface ClauseGenerationContext{

    contractType:ContractType;

    contractValue:number;

    estimatedValue:number;

    durationMonths:number;

    cpv?:CPVCode;

    lots:boolean;

    urgent:boolean;

    emergency:boolean;

    europeanFunds:boolean;

}



/*==============================================================================
=
= CLÁUSULA
=
==============================================================================*/

export interface GeneratedClause{

    id:string;

    title:string;

    content:string;

    mandatory:boolean;

}



/*==============================================================================
=
= DOCUMENTO GENERADO
=
==============================================================================*/

export interface GeneratedDocument{

    title:string;

    clauses:GeneratedClause[];

}



/*==============================================================================
=
= CLAUSE GENERATOR ENGINE
=
==============================================================================*/

export class ClauseGeneratorEngine{

    private clauses:GeneratedClause[]=[];

    constructor(){

        this.initialize();

    }

  /*==============================================================================
=
= INICIALIZACIÓN
=
==============================================================================*/

public initialize()

:void{

    this.clauses=[];

}

/*****************************************************************************************
*
* BLOQUE 2 de 24
*
* GENERACIÓN PRINCIPAL DEL DOCUMENTO
*
******************************************************************************************/

/*==============================================================================
=
= GENERAR DOCUMENTO
=
==============================================================================*/

public generate(

    context:ClauseGenerationContext

):GeneratedDocument{

    this.clear();

    this.generateMandatoryClauses(

        context

    );

    return{

        title:"Pliego de Cláusulas Administrativas",

        clauses:[

            ...this.clauses

        ]

    };

}



/*==============================================================================
=
= REGISTRO DE CLÁUSULAS
=
==============================================================================*/

private addClause(

    clause:GeneratedClause

):void{

    this.clauses.push(

        clause

    );

}



/*****************************************************************************************
*
* FIN BLOQUE 2 de 24
*
* SIGUIENTE:
*
* ClauseGeneratorEngine.ts
*
* BLOQUE 3 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 3 de 24
*
* GENERACIÓN DE CLÁUSULAS OBLIGATORIAS
*
******************************************************************************************/

/*==============================================================================
=
= GENERAR CLÁUSULAS OBLIGATORIAS
=
==============================================================================*/

private generateMandatoryClauses(

    context:ClauseGenerationContext

):void{

    this.generateLegalFrameworkClause(

        context

    );



    this.generateContractObjectClause(

        context

    );



    this.generateContractTypeClause(

        context

    );



    this.generateBudgetClause(

        context

    );

}



/*==============================================================================
=
= CONTADOR
=
==============================================================================*/

public clauseCount()

:number{

    return this.clauses.length;

}



/*****************************************************************************************
*
* FIN BLOQUE 3 de 24
*
* SIGUIENTE:
*
* ClauseGeneratorEngine.ts
*
* BLOQUE 4 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 4 de 24
*
* CLÁUSULA
*
* MARCO JURÍDICO
*
******************************************************************************************/

/*==============================================================================
=
= MARCO JURÍDICO
=
==============================================================================*/

private generateLegalFrameworkClause(

    context:ClauseGenerationContext

):void{

    this.addClause({

        id:"LEGAL_FRAMEWORK",

        title:"Régimen jurídico",

        mandatory:true,

        content:[
            "El presente contrato tiene naturaleza administrativa y se regirá por la Ley 9/2017, de 8 de noviembre, de Contratos del Sector Público, por el resto de normativa administrativa que resulte de aplicación y por las cláusulas contenidas en el presente Pliego."
        ].join("\n")

    });

}



/*==============================================================================
=
= EXISTE CLÁUSULA
=
==============================================================================*/

private hasClause(

    id:string

):boolean{

    return this.clauses.some(

        c=>c.id===id

    );

}



/*****************************************************************************************
*
* FIN BLOQUE 4 de 24
*
* SIGUIENTE:
*
* ClauseGeneratorEngine.ts
*
* BLOQUE 5 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 5 de 24
*
* CLÁUSULA
*
* OBJETO DEL CONTRATO
*
******************************************************************************************/

/*==============================================================================
=
= OBJETO
=
==============================================================================*/

private generateContractObjectClause(

    context:ClauseGenerationContext

):void{

    const text=

        this.buildContractObject(

            context

        );



    this.addClause({

        id:"CONTRACT_OBJECT",

        title:"Objeto del contrato",

        mandatory:true,

        content:text

    });

}



/*==============================================================================
=
= CONSTRUCCIÓN DEL OBJETO
=
==============================================================================*/

private buildContractObject(

    context:ClauseGenerationContext

):string{

    let description=

        "Constituye el objeto del presente contrato la ejecución de las prestaciones definidas en el Pliego de Prescripciones Técnicas.";

    if(

        context.cpv

    ){

        description+=

            "\n\nCódigo CPV principal: "

            +

            context.cpv.code

            +

            " - "

            +

            context.cpv.description

            +

            ".";

    }



    if(

        context.lots

    ){

        description+=

            "\n\nEl contrato se divide en lotes conforme a la justificación incorporada al expediente.";

    }else{

        description+=

            "\n\nNo se prevé división en lotes, constando en el expediente la correspondiente motivación.";

    }



    return description;

}



/*****************************************************************************************
*
* FIN BLOQUE 5 de 24
*
* SIGUIENTE:
*
* ClauseGeneratorEngine.ts
*
* BLOQUE 6 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 6 de 24
*
* CLÁUSULA
*
* TIPO DE CONTRATO
*
******************************************************************************************/

/*==============================================================================
=
= TIPO DE CONTRATO
=
==============================================================================*/

private generateContractTypeClause(

    context:ClauseGenerationContext

):void{

    this.addClause({

        id:"CONTRACT_TYPE",

        title:"Calificación del contrato",

        mandatory:true,

        content:this.buildContractTypeText(

            context

        )

    });

}



/*==============================================================================
=
= TEXTO
=
==============================================================================*/

private buildContractTypeText(

    context:ClauseGenerationContext

):string{

    switch(

        context.contractType

    ){

        case ContractType.WORKS:

            return [

                "El contrato tiene la consideración de CONTRATO DE OBRAS.",

                "",

                "Su objeto consiste en la ejecución de una obra en los términos previstos por la Ley 9/2017."

            ].join("\n");



        case ContractType.SERVICES:

            return [

                "El contrato tiene la consideración de CONTRATO DE SERVICIOS.",

                "",

                "Las prestaciones se ejecutarán conforme al Pliego de Prescripciones Técnicas."

            ].join("\n");



        case ContractType.SUPPLIES:

            return [

                "El contrato tiene la consideración de CONTRATO DE SUMINISTROS.",

                "",

                "Comprende la adquisición de bienes conforme al PPT."

            ].join("\n");



        default:

            return [

                "La naturaleza jurídica del contrato será la que resulte del objeto definido en el expediente."

            ].join("\n");

    }

}



/*****************************************************************************************
*
* FIN BLOQUE 6 de 24
*
* SIGUIENTE:
*
* ClauseGeneratorEngine.ts
*
* BLOQUE 7 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 7 de 24
*
* CLÁUSULA
*
* PRESUPUESTO BASE DE LICITACIÓN Y VALOR ESTIMADO
*
******************************************************************************************/

/*==============================================================================
=
= PRESUPUESTO
=
==============================================================================*/

private generateBudgetClause(

    context:ClauseGenerationContext

):void{

    this.addClause({

        id:"CONTRACT_BUDGET",

        title:"Presupuesto base de licitación y valor estimado",

        mandatory:true,

        content:this.buildBudgetText(

            context

        )

    });

}



/*==============================================================================
=
= TEXTO DEL PRESUPUESTO
=
==============================================================================*/

private buildBudgetText(

    context:ClauseGenerationContext

):string{

    const budget=

        context.contractValue.toLocaleString(

            "es-ES",

            {

                minimumFractionDigits:2,

                maximumFractionDigits:2

            }

        );



    const estimated=

        context.estimatedValue.toLocaleString(

            "es-ES",

            {

                minimumFractionDigits:2,

                maximumFractionDigits:2

            }

        );



    return [

        "El presupuesto base de licitación asciende a " +

        budget +

        " euros.",

        "",

        "El valor estimado del contrato asciende a " +

        estimated +

        " euros, calculado conforme al artículo 101 de la Ley 9/2017, de Contratos del Sector Público.",

        "",

        "En dicho importe se han considerado todas las posibles prórrogas, modificaciones y demás conceptos exigidos por la normativa vigente, cuando resulten de aplicación."

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 7 de 24
*
* SIGUIENTE:
*
* ClauseGeneratorEngine.ts
*
* BLOQUE 8 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 8 de 24
*
* CLÁUSULA
*
* DURACIÓN DEL CONTRATO
*
******************************************************************************************/

/*==============================================================================
=
= DURACIÓN
=
==============================================================================*/

private generateDurationClause(

    context:ClauseGenerationContext

):void{

    this.addClause({

        id:"CONTRACT_DURATION",

        title:"Duración del contrato",

        mandatory:true,

        content:this.buildDurationText(

            context

        )

    });

}



/*==============================================================================
=
= TEXTO
=
==============================================================================*/

private buildDurationText(

    context:ClauseGenerationContext

):string{

    const months=

        context.durationMonths;



    let text=

        "La duración inicial del contrato será de " +

        months +

        " meses.";



    if(

        months===1

    ){

        text=

        "La duración inicial del contrato será de 1 mes.";

    }



    text+=

        "\n\nEl cómputo del plazo comenzará desde la fecha de formalización del contrato o desde la fecha de inicio de la prestación cuando así se establezca en los pliegos.";



    text+=

        "\n\nLa duración se entiende sin perjuicio de las posibles prórrogas que, en su caso, puedan establecerse expresamente en este Pliego.";



    return text;

}



/*****************************************************************************************
*
* FIN BLOQUE 8 de 24
*
* SIGUIENTE:
*
* ClauseGeneratorEngine.ts
*
* BLOQUE 9 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 9 de 24
*
* CLÁUSULA
*
* REVISIÓN DE PRECIOS
*
******************************************************************************************/

/*==============================================================================
=
= REVISIÓN DE PRECIOS
=
==============================================================================*/

private generatePriceRevisionClause(

    context:ClauseGenerationContext

):void{

    this.addClause({

        id:"PRICE_REVIEW",

        title:"Revisión de precios",

        mandatory:true,

        content:this.buildPriceRevisionText(

            context

        )

    });

}



/*==============================================================================
=
= TEXTO
=
==============================================================================*/

private buildPriceRevisionText(

    context:ClauseGenerationContext

):string{

    if(

        context.durationMonths<24

    ){

        return [

            "No procede la revisión de precios.",

            "",

            "La duración del contrato no alcanza el plazo mínimo previsto por la normativa para la aplicación de la revisión de precios.",

            "",

            "En consecuencia, los precios permanecerán invariables durante toda la ejecución del contrato."

        ].join("\n");

    }



    return [

        "La revisión de precios únicamente podrá efectuarse en los supuestos legalmente previstos.",

        "",

        "Su aplicación requerirá el cumplimiento de los requisitos establecidos en la Ley de Contratos del Sector Público y en la normativa de desarrollo.",

        "",

        "La fórmula de revisión será la que, en su caso, figure expresamente en los pliegos."

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 9 de 24
*
* SIGUIENTE:
*
* ClauseGeneratorEngine.ts
*
* BLOQUE 10 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 10 de 24
*
* CLÁUSULA
*
* GARANTÍA DEFINITIVA
*
******************************************************************************************/

/*==============================================================================
=
= GARANTÍA DEFINITIVA
=
==============================================================================*/

private generateGuaranteeClause(

    context:ClauseGenerationContext

):void{

    this.addClause({

        id:"FINAL_GUARANTEE",

        title:"Garantía definitiva",

        mandatory:true,

        content:this.buildGuaranteeText(

            context

        )

    });

}



/*==============================================================================
=
= TEXTO
=
==============================================================================*/

private buildGuaranteeText(

    context:ClauseGenerationContext

):string{

    if(

        context.contractValue<50000

    ){

        return [

            "No se exige garantía definitiva.",

            "",

            "La exención deberá quedar debidamente motivada en el expediente cuando resulte conforme con la normativa aplicable."

        ].join("\n");

    }



    const guarantee=(

        context.contractValue*0.05

    ).toLocaleString(

        "es-ES",

        {

            minimumFractionDigits:2,

            maximumFractionDigits:2

        }

    );



    return [

        "El adjudicatario deberá constituir una garantía definitiva equivalente al cinco por ciento (5 %) del importe de adjudicación, excluido el IVA.",

        "",

        "Importe orientativo de la garantía: "+

        guarantee+

        " euros.",

        "",

        "La garantía responderá de las obligaciones previstas en la Ley de Contratos del Sector Público."

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 10 de 24
*
* SIGUIENTE:
*
* ClauseGeneratorEngine.ts
*
* BLOQUE 11 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 11 de 24
*
* CLÁUSULA
*
* SOLVENCIA ECONÓMICA Y TÉCNICA
*
******************************************************************************************/

/*==============================================================================
=
= SOLVENCIA
=
==============================================================================*/

private generateSolvencyClause(

    context:ClauseGenerationContext

):void{

    this.addClause({

        id:"SOLVENCY",

        title:"Solvencia económica y técnica",

        mandatory:true,

        content:this.buildSolvencyText(

            context

        )

    });

}



/*==============================================================================
=
= TEXTO
=
==============================================================================*/

private buildSolvencyText(

    context:ClauseGenerationContext

):string{

    if(

        context.contractValue<50000

    ){

        return [

            "No se exige acreditación de solvencia económica ni técnica.",

            "",

            "La exención se fundamenta en la naturaleza y cuantía del contrato."

        ].join("\n");

    }



    return [

        "Los licitadores deberán acreditar la solvencia económica y financiera y la solvencia técnica o profesional conforme a los medios establecidos en este Pliego.",

        "",

        "Los requisitos de solvencia deberán guardar vinculación y proporcionalidad con el objeto del contrato.",

        "",

        "No podrán establecerse requisitos que limiten injustificadamente la concurrencia."

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 11 de 24
*
* SIGUIENTE:
*
* ClauseGeneratorEngine.ts
*
* BLOQUE 12 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 12 de 24
*
* CLÁUSULA
*
* CRITERIOS DE ADJUDICACIÓN
*
******************************************************************************************/

/*==============================================================================
=
= CRITERIOS DE ADJUDICACIÓN
=
==============================================================================*/

private generateAwardCriteriaClause(

    context:ClauseGenerationContext

):void{

    this.addClause({

        id:"AWARD_CRITERIA",

        title:"Criterios de adjudicación",

        mandatory:true,

        content:this.buildAwardCriteriaText(

            context

        )

    });

}



/*==============================================================================
=
= TEXTO
=
==============================================================================*/

private buildAwardCriteriaText(

    context:ClauseGenerationContext

):string{

    if(

        context.contractType===

        ContractType.SUPPLIES

    ){

        return [

            "La adjudicación se realizará utilizando criterios objetivos evaluables automáticamente.",

            "",

            "Los criterios estarán directamente vinculados al objeto del contrato y permitirán identificar la oferta con mejor relación calidad-precio."

        ].join("\n");

    }



    return [

        "La adjudicación se efectuará mediante una pluralidad de criterios.",

        "",

        "Se combinarán criterios evaluables automáticamente con criterios sometidos a juicio de valor, respetando las limitaciones establecidas en la LCSP.",

        "",

        "Todos los criterios estarán vinculados al objeto del contrato y garantizarán los principios de igualdad, transparencia y libre concurrencia."

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 12 de 24
*
* SIGUIENTE:
*
* ClauseGeneratorEngine.ts
*
* BLOQUE 13 de 24
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 13 de 24
*
* CLÁUSULA
*
* CONDICIONES ESPECIALES DE EJECUCIÓN
*
******************************************************************************************/

/*==============================================================================
=
= CONDICIONES ESPECIALES
=
==============================================================================*/

private generateSpecialExecutionClause(

    context:ClauseGenerationContext

):void{

    this.addClause({

        id:"SPECIAL_EXECUTION",

        title:"Condiciones especiales de ejecución",

        mandatory:true,

        content:this.buildSpecialExecutionText(

            context

        )

    });

}



/*==============================================================================
=
= TEXTO
=
==============================================================================*/

private buildSpecialExecutionText(

    context:ClauseGenerationContext

):string{

    const clauses:string[]=[

        "Durante la ejecución del contrato deberán respetarse todas las obligaciones laborales, sociales, medioambientales y de igualdad establecidas por la legislación vigente."

    ];



    if(

        context.europeanFunds

    ){

        clauses.push(

            "",

            "Al estar financiado con fondos europeos, serán de obligado cumplimiento las medidas de publicidad, seguimiento, control y prevención del fraude previstas en la normativa aplicable."

        );

    }



    clauses.push(

        "",

        "El incumplimiento de estas condiciones especiales podrá dar lugar a la imposición de penalidades o, cuando proceda, a la resolución del contrato."

    );



    return clauses.join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 13 de 24
*
* SIGUIENTE:
*
* ClauseGeneratorEngine.ts
*
* BLOQUE 14 de 24
*
******************************************************************************************/

  ===========================================================
ARCHIVO

ClauseGeneratorEngine.ts

BLOQUE

14 de 24

ESTADO

██████████████░░░░░░░░ 58 %

SIGUIENTE

Bloque 15 de 24

RUTA

src/domain/clauses/ClauseGeneratorEngine.ts

===========================================================

  ===========================================================
ARCHIVO

ClauseGeneratorEngine.ts

BLOQUE

15 de 24

ESTADO

███████████████░░░░░░░ 63 %

SIGUIENTE

Bloque 16 de 24

RUTA

src/domain/clauses/ClauseGeneratorEngine.ts

===========================================================

  ===========================================================
ARCHIVO

ClauseGeneratorEngine.ts

BLOQUE

16 de 24

ESTADO

████████████████░░░░░░ 67 %

SIGUIENTE

Bloque 17 de 24

RUTA

src/domain/clauses/ClauseGeneratorEngine.ts

===========================================================

  /*****************************************************************************************
*
* BLOQUE 17 de 24
*
* CLÁUSULA
*
* PRÓRROGAS DEL CONTRATO
*
******************************************************************************************/

/*==============================================================================
=
= PRÓRROGAS
=
==============================================================================*/

private generateExtensionClause(

    context:ClauseGenerationContext

):void{

    this.addClause({

        id:"CONTRACT_EXTENSION",

        title:"Prórrogas",

        mandatory:true,

        content:this.buildExtensionText(

            context

        )

    });

}



/*==============================================================================
=
= TEXTO
=
==============================================================================*/

private buildExtensionText(

    context:ClauseGenerationContext

):string{

    return [

        "El contrato podrá ser objeto de una o varias prórrogas únicamente cuando dicha posibilidad se encuentre expresamente prevista en este Pliego y resulte conforme con la legislación vigente.",

        "",

        "Las prórrogas tendrán carácter obligatorio para el contratista cuando hayan sido previstas en los pliegos y se acuerden por el órgano de contratación antes de la finalización del contrato.",

        "",

        "La duración total del contrato, incluidas las prórrogas, no podrá superar los límites establecidos por la Ley 9/2017, de Contratos del Sector Público.",

        "",

        "La adopción del acuerdo de prórroga requerirá la tramitación administrativa correspondiente."

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 17 de 24
*
* SIGUIENTE:
*
* ClauseGeneratorEngine.ts
*
* BLOQUE 18 de 24
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 18 de 24
*
* CLÁUSULA
*
* RESPONSABLE DEL CONTRATO
*
******************************************************************************************/

/*==============================================================================
=
= RESPONSABLE DEL CONTRATO
=
==============================================================================*/

private generateContractManagerClause(

    context:ClauseGenerationContext

):void{

    this.addClause({

        id:"CONTRACT_MANAGER",

        title:"Responsable del contrato",

        mandatory:true,

        content:this.buildContractManagerText(

            context

        )

    });

}



/*==============================================================================
=
= TEXTO
=
==============================================================================*/

private buildContractManagerText(

    context:ClauseGenerationContext

):string{

    return [

        "El órgano de contratación designará un responsable del contrato conforme a lo previsto en el artículo 62 de la Ley 9/2017, de Contratos del Sector Público.",

        "",

        "Corresponderá al responsable del contrato supervisar la ejecución, adoptar las decisiones necesarias para asegurar la correcta realización de la prestación y dictar las instrucciones precisas dentro del ámbito de sus competencias.",

        "",

        "Asimismo verificará el cumplimiento de los plazos, de las condiciones especiales de ejecución y de las obligaciones asumidas por el contratista.",

        "",

        "El responsable emitirá los informes necesarios durante la ejecución del contrato y propondrá, en su caso, la imposición de penalidades, la recepción de la prestación y la liquidación del contrato."

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 18 de 24
*
* SIGUIENTE:
*
* ClauseGeneratorEngine.ts
*
* BLOQUE 19 de 24
*
******************************************************************************************/

===========================================================
ARCHIVO

ClauseGeneratorEngine.ts

BLOQUE

19 de 24

ESTADO

███████████████████░░░ 79 %

SIGUIENTE

Bloque 20 de 24

RUTA

src/domain/clauses/ClauseGeneratorEngine.ts

===========================================================

  /*****************************************************************************************
*
* BLOQUE 20 de 24
*
* CLÁUSULA
*
* FACTURACIÓN Y PAGO
*
******************************************************************************************/

/*==============================================================================
=
= FACTURACIÓN
=
==============================================================================*/

private generatePaymentClause(

    context:ClauseGenerationContext

):void{

    this.addClause({

        id:"PAYMENT",

        title:"Facturación y pago",

        mandatory:true,

        content:this.buildPaymentText(

            context

        )

    });

}



/*==============================================================================
=
= TEXTO
=
==============================================================================*/

private buildPaymentText(

    context:ClauseGenerationContext

):string{

    return [

        "El contratista tendrá derecho al abono del precio una vez ejecutada correctamente la prestación y emitida la correspondiente conformidad por el responsable del contrato.",

        "",

        "Las facturas deberán presentarse en formato electrónico a través del Punto General de Entrada de Facturas Electrónicas que resulte aplicable.",

        "",

        "El pago se efectuará dentro del plazo legalmente establecido desde la aprobación de la factura, siempre que se hayan cumplido todos los requisitos administrativos y contractuales.",

        "",

        "Cuando existan incidencias en la ejecución del contrato o en la documentación presentada, el órgano de contratación podrá suspender la tramitación del pago hasta su completa subsanación."

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 20 de 24
*
* SIGUIENTE:
*
* ClauseGeneratorEngine.ts
*
* BLOQUE 21 de 24
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 21 de 24
*
* CLÁUSULA
*
* CONFIDENCIALIDAD Y PROTECCIÓN DE DATOS
*
******************************************************************************************/

/*==============================================================================
=
= CONFIDENCIALIDAD
=
==============================================================================*/

private generateConfidentialityClause(

    context:ClauseGenerationContext

):void{

    this.addClause({

        id:"CONFIDENTIALITY",

        title:"Confidencialidad y protección de datos",

        mandatory:true,

        content:this.buildConfidentialityText(

            context

        )

    });

}



/*==============================================================================
=
= TEXTO
=
==============================================================================*/

private buildConfidentialityText(

    context:ClauseGenerationContext

):string{

    return [

        "El contratista deberá guardar absoluta confidencialidad respecto de toda la información a la que tenga acceso con ocasión de la ejecución del contrato.",

        "",

        "Cuando el contrato implique tratamiento de datos personales, el adjudicatario deberá cumplir íntegramente el Reglamento (UE) 2016/679 (RGPD), la Ley Orgánica 3/2018 y demás normativa aplicable.",

        "",

        "Los datos personales únicamente podrán utilizarse para la correcta ejecución del contrato, quedando prohibida cualquier utilización distinta o cesión a terceros sin autorización legal.",

        "",

        "Finalizada la ejecución del contrato, el contratista deberá devolver o destruir la información y los datos personales en los términos establecidos por la normativa vigente y por las instrucciones del órgano de contratación."

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 21 de 24
*
* SIGUIENTE:
*
* ClauseGeneratorEngine.ts
*
* BLOQUE 22 de 24
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 22 de 24
*
* CLÁUSULA
*
* PROPIEDAD INTELECTUAL Y USO DE LOS TRABAJOS
*
******************************************************************************************/

/*==============================================================================
=
= PROPIEDAD INTELECTUAL
=
==============================================================================*/

private generateIntellectualPropertyClause(

    context:ClauseGenerationContext

):void{

    this.addClause({

        id:"INTELLECTUAL_PROPERTY",

        title:"Propiedad intelectual y uso de los trabajos",

        mandatory:true,

        content:this.buildIntellectualPropertyText(

            context

        )

    });

}



/*==============================================================================
=
= TEXTO
=
==============================================================================*/

private buildIntellectualPropertyText(

    context:ClauseGenerationContext

):string{

    return [

        "Todos los estudios, informes, aplicaciones, desarrollos, documentación técnica, bases de datos y demás trabajos realizados como consecuencia de la ejecución del contrato quedarán a disposición del órgano de contratación en los términos previstos en los Pliegos y en la legislación vigente.",

        "",

        "El adjudicatario garantiza que los trabajos entregados son originales o que dispone de los derechos necesarios para su utilización, manteniendo indemne a la Administración frente a cualquier reclamación de terceros.",

        "",

        "Salvo que los Pliegos establezcan otra cosa, la Administración podrá utilizar, reproducir, modificar y conservar los trabajos realizados para el cumplimiento de sus fines públicos.",

        "",

        "La entrega de la documentación final comprenderá todos los archivos fuente, documentación técnica y elementos necesarios para asegurar la continuidad del servicio cuando ello resulte aplicable."

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 22 de 24
*
* SIGUIENTE:
*
* ClauseGeneratorEngine.ts
*
* BLOQUE 23 de 24
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 23 de 24
*
* CLÁUSULA
*
* RESOLUCIÓN DEL CONTRATO
*
******************************************************************************************/

/*==============================================================================
=
= RESOLUCIÓN
=
==============================================================================*/

private generateTerminationClause(

    context:ClauseGenerationContext

):void{

    this.addClause({

        id:"CONTRACT_TERMINATION",

        title:"Resolución del contrato",

        mandatory:true,

        content:this.buildTerminationText(

            context

        )

    });

}



/*==============================================================================
=
= TEXTO
=
==============================================================================*/

private buildTerminationText(

    context:ClauseGenerationContext

):string{

    return [

        "Serán causas de resolución del contrato las previstas en la Ley 9/2017, de Contratos del Sector Público y las que, en su caso, se establezcan expresamente en el presente Pliego.",

        "",

        "La resolución podrá producirse, entre otros supuestos, por incumplimiento culpable del contratista, imposibilidad sobrevenida de ejecución, mutuo acuerdo, demora en el cumplimiento de los plazos o cualquier otra causa legalmente prevista.",

        "",

        "La resolución del contrato se acordará mediante el correspondiente procedimiento administrativo, con audiencia del contratista cuando resulte preceptiva.",

        "",

        "Los efectos de la resolución serán los establecidos en la legislación vigente, incluyendo, cuando proceda, la incautación de la garantía definitiva y la indemnización por daños y perjuicios."

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 23 de 24
*
* SIGUIENTE:
*
* ClauseGeneratorEngine.ts
*
* BLOQUE 24 de 24 (FINAL)
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 24 de 24
*
* FINALIZACIÓN DEL CLAUSE GENERATOR ENGINE
*
******************************************************************************************/

/*==============================================================================
=
= GENERACIÓN COMPLETA DEL PCAP
=
==============================================================================*/

public generateCompletePCAP(

    context:ClauseGenerationContext

):GeneratedDocument{

    this.clear();

    this.generateMandatoryClauses(context);
    this.generateDurationClause(context);
    this.generatePriceRevisionClause(context);
    this.generateGuaranteeClause(context);
    this.generateSolvencyClause(context);
    this.generateAwardCriteriaClause(context);
    this.generateSpecialExecutionClause(context);
    this.generateSubcontractingClause(context);
    this.generatePenaltyClause(context);
    this.generateModificationClause(context);
    this.generateExtensionClause(context);
    this.generateContractManagerClause(context);
    this.generateReceptionClause(context);
    this.generatePaymentClause(context);
    this.generateConfidentialityClause(context);
    this.generateIntellectualPropertyClause(context);
    this.generateTerminationClause(context);

    return{

        title:"Pliego de Cláusulas Administrativas Particulares",

        clauses:[

            ...this.clauses

        ]

    };

}



/*==============================================================================
=
= RESUMEN
=
==============================================================================*/

public summary()

:string{

    return [

        "========================================",

        " CLAUSE GENERATOR ENGINE v1.0",

        "========================================",

        "",

        "Régimen jurídico.................... ✔",

        "Objeto del contrato................. ✔",

        "Tipo de contrato.................... ✔",

        "Presupuesto......................... ✔",

        "Duración............................ ✔",

        "Revisión de precios................. ✔",

        "Garantía definitiva................. ✔",

        "Solvencia........................... ✔",

        "Criterios adjudicación.............. ✔",

        "Condiciones especiales.............. ✔",

        "Subcontratación..................... ✔",

        "Penalidades......................... ✔",

        "Modificaciones...................... ✔",

        "Prórrogas........................... ✔",

        "Responsable del contrato............ ✔",

        "Recepción y liquidación............. ✔",

        "Facturación y pago.................. ✔",

        "Confidencialidad.................... ✔",

        "Protección de datos................ ✔",

        "Propiedad intelectual............... ✔",

        "Resolución del contrato............. ✔",

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

    return "ClauseGeneratorEngine v1.0.0";

}



/*****************************************************************************************
*
* FIN DEL ARCHIVO
*
* ClauseGeneratorEngine.ts
*
* MOTOR COMPLETADO
*
******************************************************************************************/

/*==============================================================================
=
= LIMPIAR
=
==============================================================================*/

public clear()

:void{

    this.clauses=[];

}



/*****************************************************************************************
*
* FIN BLOQUE 1 de 24
*
* SIGUIENTE:
*
* ClauseGeneratorEngine.ts
*
* BLOQUE 2 de 24
*
******************************************************************************************/

  
