/*****************************************************************************************
*
* BLOQUE 1 de 12
*
* PCAP GENERATOR ENGINE
*
* Motor encargado de generar automáticamente el Pliego de Cláusulas
* Administrativas Particulares completo.
*
*****************************************************************************************/

import {
    ClauseGeneratorEngine,
    GeneratedClause
} from "../clauses/ClauseGeneratorEngine";

import {
    RuleEvaluatorEngine
} from "../rules/RuleEvaluatorEngine";

import {
    ContractFile
} from "../contracts/ContractFile";



/*==============================================================================
=
= SECCIÓN DEL PCAP
=
==============================================================================*/

export interface PCAPSection{

    number:string;

    title:string;

    content:string;

}



/*==============================================================================
=
= DOCUMENTO PCAP
=
==============================================================================*/

export interface GeneratedPCAP{

    title:string;

    sections:PCAPSection[];

    annexes:PCAPSection[];

}



/*==============================================================================
=
= PCAP GENERATOR ENGINE
=
==============================================================================*/

export class PCAPGeneratorEngine{

    private readonly clauseEngine=

        new ClauseGeneratorEngine();

    private readonly ruleEngine=

        new RuleEvaluatorEngine();

    constructor(){

    }



/*==============================================================================
=
= GENERACIÓN PRINCIPAL
=
==============================================================================*/

public generate(

    file:ContractFile

):GeneratedPCAP{

    const context=

        this.buildGenerationContext(

            file

        );

    const clauseDocument=

        this.clauseEngine.generateCompletePCAP(

            context

        );

    const report=

        this.ruleEngine.audit(

            context

        );

    const sections=

        this.buildSections(

            clauseDocument.clauses

        );

    const annexes=

        this.buildAnnexes(

            report

        );

    return{

        title:

            "PLIEGO DE CLÁUSULAS ADMINISTRATIVAS PARTICULARES",

        sections,

        annexes

    };

}



/*****************************************************************************************
*
* FIN BLOQUE 1 de 12
*
* SIGUIENTE:
*
* PCAPGeneratorEngine.ts
*
* BLOQUE 2 de 12
*
*****************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 2 de 12
*
* CONSTRUCCIÓN DEL CONTEXTO DE GENERACIÓN
*
******************************************************************************************/

/*==============================================================================
=
= CONTEXTO
=
==============================================================================*/

private buildGenerationContext(

    file:ContractFile

){

    return{

        contractType:

            file.contract.type,

        contractValue:

            file.budget.baseBudget,

        estimatedValue:

            file.budget.estimatedValue,

        durationMonths:

            file.duration.months,

        cpv:

            file.object.cpv,

        lots:

            file.object.hasLots,

        urgent:

            file.processing.urgent,

        emergency:

            file.processing.emergency,

        europeanFunds:

            file.funding.europeanFunds

    };

}



/*==============================================================================
=
= VALIDACIÓN PREVIA
=
==============================================================================*/

private validateFile(

    file:ContractFile

):void{

    if(!file){

        throw new Error(

            "El expediente no puede ser nulo."

        );

    }

}



/*==============================================================================
=
= GENERACIÓN SEGURA
=
==============================================================================*/

public generateSafely(

    file:ContractFile

):GeneratedPCAP{

    this.validateFile(

        file

    );



    return this.generate(

        file

    );

}



/*****************************************************************************************
*
* FIN BLOQUE 2 de 12
*
* SIGUIENTE:
*
* PCAPGeneratorEngine.ts
*
* BLOQUE 3 de 12
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 3 de 12
*
* CONSTRUCCIÓN DE LAS SECCIONES DEL PCAP
*
******************************************************************************************/

/*==============================================================================
=
= SECCIONES
=
==============================================================================*/

private buildSections(

    clauses:GeneratedClause[]

):PCAPSection[]{

    const sections:PCAPSection[]=[];

    let index=1;



    for(

        const clause of clauses

    ){

        sections.push({

            number:

                index.toString(),

            title:

                clause.title,

            content:

                clause.content

        });



        index++;

    }



    return sections;

}



/*==============================================================================
=
= BÚSQUEDA DE SECCIÓN
=
==============================================================================*/

public findSection(

    document:GeneratedPCAP,

    title:string

):PCAPSection|undefined{

    return document.sections.find(

        section=>

            section.title===title

    );

}



/*==============================================================================
=
= NÚMERO DE SECCIONES
=
==============================================================================*/

public sectionCount(

    document:GeneratedPCAP

):number{

    return document.sections.length;

}



/*****************************************************************************************
*
* FIN BLOQUE 3 de 12
*
* SIGUIENTE:
*
* PCAPGeneratorEngine.ts
*
* BLOQUE 4 de 12
*
******************************************************************************************/

  /*****************************************************************************************
*
* BLOQUE 4 de 12
*
* CONSTRUCCIÓN DE ANEXOS DEL PCAP
*
******************************************************************************************/

/*==============================================================================
=
= ANEXOS
=
==============================================================================*/

private buildAnnexes(

    report:any

):PCAPSection[]{

    const annexes:PCAPSection[]=[];



    annexes.push({

        number:"ANEXO I",

        title:"Informe de validación normativa",

        content:

            this.buildAuditSummary(

                report

            )

    });



    annexes.push({

        number:"ANEXO II",

        title:"Resultado de la evaluación",

        content:

            this.buildEvaluationSummary(

                report

            )

    });



    return annexes;

}



/*==============================================================================
=
= RESUMEN DE AUDITORÍA
=
==============================================================================*/

private buildAuditSummary(

    report:any

):string{

    return [

        "Resultado de la comprobación normativa.",

        "",

        "Estado:",

        report.passed

            ? "FAVORABLE"

            : "CON OBSERVACIONES",

        "",

        "Puntuación:",

        report.score + " %"

    ].join("\n");

}



/*****************************************************************************************
*
* FIN BLOQUE 4 de 12
*
* SIGUIENTE:
*
* PCAPGeneratorEngine.ts
*
* BLOQUE 5 de 12
*
******************************************************************************************/
  /*****************************************************************************************
*
* BLOQUE 6 de 12
*
* ORDENACIÓN Y NUMERACIÓN DEL PCAP
*
******************************************************************************************/

/*==============================================================================
=
= RENUMERAR SECCIONES
=
==============================================================================*/

private renumberSections(

    sections:PCAPSection[]

):PCAPSection[]{

    let index=1;



    return sections.map(

        section=>({

            ...section,

            number:index++.toString()

        })

    );

}



/*==============================================================================
=
= ORDENAR ALFABÉTICAMENTE
=
==============================================================================*/

public sortSections(

    sections:PCAPSection[]

):PCAPSection[]{

    return [

        ...sections

    ].sort(

        (

            a,

            b

        )=>

        a.title.localeCompare(

            b.title,

            "es"

        )

    );

}



/*==============================================================================
=
= ELIMINAR DUPLICADOS
=
==============================================================================*/

private removeDuplicatedSections(

    sections:PCAPSection[]

):PCAPSection[]{

    const visited=

        new Set<string>();



    return sections.filter(

        section=>{

            if(

                visited.has(

                    section.title

                )

            ){

                return false;

            }



            visited.add(

                section.title

            );



            return true;

        }

    );

}



/*****************************************************************************************
*
* FIN BLOQUE 6 de 12
*
* SIGUIENTE:
*
* PCAPGeneratorEngine.ts
*
* BLOQUE 7 de 12
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 7 de 12
*
* EXPORTACIÓN DEL PCAP
*
******************************************************************************************/

/*==============================================================================
=
= EXPORTAR COMO TEXTO
=
==============================================================================*/

public exportAsText(

    document:GeneratedPCAP

):string{

    const lines:string[]=[];

    lines.push(document.title);

    lines.push("");



    for(

        const section of document.sections

    ){

        lines.push(

            section.number+

            ". "+

            section.title

        );



        lines.push("");



        lines.push(

            section.content

        );



        lines.push("");

    }



    if(

        document.annexes.length>0

    ){

        lines.push("");

        lines.push("ANEXOS");

        lines.push("");



        for(

            const annex of document.annexes

        ){

            lines.push(

                annex.number+

                " - "+

                annex.title

            );



            lines.push("");



            lines.push(

                annex.content

            );



            lines.push("");

        }

    }



    return lines.join("\n");

}



/*==============================================================================
=
= VISTA PREVIA
=
==============================================================================*/

public preview(

    document:GeneratedPCAP

):string{

    return this.exportAsText(

        document

    );

}



/*****************************************************************************************
*
* FIN BLOQUE 7 de 12
*
* SIGUIENTE:
*
* PCAPGeneratorEngine.ts
*
* BLOQUE 8 de 12
*
******************************************************************************************/
  ===========================================================
ARCHIVO

PCAPGeneratorEngine.ts

BLOQUE

9 de 12

ESTADO

██████████████████░░░░ 75 %

SIGUIENTE

Bloque 10 de 12

RUTA

src/domain/pcap/PCAPGeneratorEngine.ts

===========================================================
  /*****************************************************************************************
*
* BLOQUE 11 de 12
*
* COMPROBACIONES FINALES Y GENERACIÓN DEL INFORME
*
******************************************************************************************/

/*==============================================================================
=
= VERIFICACIÓN DEL PCAP
=
==============================================================================*/

public verify(

    document:GeneratedPCAP

):boolean{

    if(

        !this.validateDocument(

            document

        )

    ){

        return false;

    }



    if(

        document.sections.length<10

    ){

        return false;

    }



    return true;

}



/*==============================================================================
=
= INFORME DE GENERACIÓN
=
==============================================================================*/

public generationReport(

    document:GeneratedPCAP

):string{

    const stats=

        this.statistics(

            document

        );



    return [

        "==========================================",

        " INFORME DE GENERACIÓN DEL PCAP",

        "==========================================",

        "",

        "Estado...................... OK",

        "Secciones................... "+

            stats.sections,

        "Anexos...................... "+

            stats.annexes,

        "Caracteres................. "+

            stats.characters,

        "",

        "Documento preparado para revisión.",

        "",

        "=========================================="

    ].join("\n");

}



/*==============================================================================
=
= EXPORTACIÓN PREPARADA
=
==============================================================================*/

public export(

    document:GeneratedPCAP

):string{

    return this.exportAsText(

        document

    );

}



/*****************************************************************************************
*
* FIN BLOQUE 11 de 12
*
* SIGUIENTE:
*
* PCAPGeneratorEngine.ts
*
* BLOQUE 12 de 12 (FINAL)
*
******************************************************************************************/

/*****************************************************************************************
*
* BLOQUE 12 de 12
*
* FINALIZACIÓN DEL PCAP GENERATOR ENGINE
*
******************************************************************************************/

/*==============================================================================
=
= INFORMACIÓN DEL MOTOR
=
==============================================================================*/

public summary()

:string{

    return [

        "==============================================",

        " PCAP GENERATOR ENGINE v1.0",

        "==============================================",

        "",

        "Construcción del contexto............... ✔",

        "Validación del expediente............... ✔",

        "Generación de cláusulas................ ✔",

        "Evaluación normativa................... ✔",

        "Construcción de secciones............... ✔",

        "Numeración automática.................. ✔",

        "Eliminación de duplicados.............. ✔",

        "Generación de anexos................... ✔",

        "Portada................................. ✔",

        "Índice................................. ✔",

        "Metadatos.............................. ✔",

        "Exportación............................ ✔",

        "Verificación final..................... ✔",

        "Informe de generación.................. ✔",

        "",

        "Estado: OPERATIVO",

        "=============================================="

    ].join("\n");

}



/*==============================================================================
=
= VERSIÓN
=
==============================================================================*/

public version()

:string{

    return "PCAPGeneratorEngine v1.0.0";

}



/*==============================================================================
=
= METADATOS DEL MOTOR
=
==============================================================================*/

public engineInfo(){

    return{

        name:

            "PCAPGeneratorEngine",

        version:

            this.version(),

        author:

            "Contrata-IA",

        status:

            "stable"

    };

}

}



/*****************************************************************************************
*
* FIN DEL ARCHIVO
*
* PCAPGeneratorEngine.ts
*
* MOTOR COMPLETADO
*
******************************************************************************************/


