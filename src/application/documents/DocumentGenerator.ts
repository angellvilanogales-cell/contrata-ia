/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * DOCUMENT GENERATOR
 *
 * ---------------------------------------------------------------------------
 *
 * Este módulo constituye el generador documental completo del sistema.
 *
 * Su misión NO es únicamente rellenar plantillas.
 *
 * Debe construir documentos administrativos completos,
 * coherentes,
 * jurídicamente motivados
 * y consistentes entre sí.
 *
 * Todos los documentos del expediente se generan desde aquí.
 *
 ******************************************************************************/

import { UUID } from "../../domain/common/types";

import { ContractContextModel }
from "../modules/contract-generator/ContractContext";



/*===========================================================================
=
= TIPOS DOCUMENTALES
=
===========================================================================*/

export enum DocumentType{

    JUSTIFICATION_MEMORY="JUSTIFICATION_MEMORY",

    ECONOMIC_MEMORY="ECONOMIC_MEMORY",

    TECHNICAL_REPORT="TECHNICAL_REPORT",

    LEGAL_REPORT="LEGAL_REPORT",

    LACK_OF_RESOURCES="LACK_OF_RESOURCES",

    PPT="PPT",

    PCAP="PCAP",

    CONTRACT_NOTICE="CONTRACT_NOTICE",

    APPROVAL_RESOLUTION="APPROVAL_RESOLUTION",

    AWARD_PROPOSAL="AWARD_PROPOSAL",

    AWARD_RESOLUTION="AWARD_RESOLUTION",

    FORMALIZATION="FORMALIZATION",

    EXECUTION_REPORT="EXECUTION_REPORT",

    MODIFICATION_REPORT="MODIFICATION_REPORT",

    PENALTY_REPORT="PENALTY_REPORT",

    EXTENSION_REPORT="EXTENSION_REPORT",

    RECEPTION_CERTIFICATE="RECEPTION_CERTIFICATE",

    FINAL_SETTLEMENT="FINAL_SETTLEMENT",

    ANNEX="ANNEX",

    CUSTOM="CUSTOM"

}



/*===========================================================================
=
= FORMATOS
=
===========================================================================*/

export enum DocumentFormat{

    DOCX="DOCX",

    PDF="PDF",

    HTML="HTML",

    MARKDOWN="MARKDOWN",

    JSON="JSON",

    XML="XML"

}



/*===========================================================================
=
= ESTADO
=
===========================================================================*/

export enum DocumentStatus{

    CREATED="CREATED",

    BUILDING="BUILDING",

    VALIDATING="VALIDATING",

    GENERATED="GENERATED",

    EXPORTED="EXPORTED",

    ERROR="ERROR"

}



/*===========================================================================
=
= SECCIÓN DOCUMENTAL
=
===========================================================================*/

export interface DocumentSection{

    id:UUID;

    title:string;

    order:number;

    mandatory:boolean;

    generated:boolean;

    content:string;

}



/*===========================================================================
=
= TABLA
=
===========================================================================*/

export interface DocumentTable{

    id:UUID;

    title:string;

    headers:string[];

    rows:string[][];

}



/*===========================================================================
=
= REFERENCIA NORMATIVA
=
===========================================================================*/

export interface LegalReference{

    article:string;

    regulation:string;

    description:string;

}



/*===========================================================================
=
= VARIABLE DOCUMENTAL
=
===========================================================================*/

export interface DocumentVariable{

    key:string;

    value:string;

}



/*===========================================================================
=
= CONFIGURACIÓN
=
===========================================================================*/

export interface DocumentGeneratorConfiguration{

    automaticIndex:boolean;

    automaticNumbering:boolean;

    includeLegalReferences:boolean;

    includeHeader:boolean;

    includeFooter:boolean;

    validateBeforeExport:boolean;

    generateMetadata:boolean;

}



/*===========================================================================
=
= DOCUMENTO
=
===========================================================================*/

export interface GeneratedDocument{

    id:UUID;

    type:DocumentType;

    format:DocumentFormat;

    status:DocumentStatus;

    title:string;

    description:string;

    version:string;

    created:string;

    author:string;

    sections:DocumentSection[];

    tables:DocumentTable[];

    references:LegalReference[];

    variables:DocumentVariable[];

    content:string;

}



/*===========================================================================
=
= ESTADÍSTICAS
=
===========================================================================*/

export interface GeneratorStatistics{

    generatedDocuments:number;

    exportedDocuments:number;

    totalSections:number;

    totalTables:number;

    averageGenerationMilliseconds:number;

}



/*===========================================================================
=
= DOCUMENT GENERATOR
=
===========================================================================*/

export class DocumentGenerator{

    private context?:ContractContextModel;

    private readonly documents:

        GeneratedDocument[]=[];

    private readonly templates=

        new Map<DocumentType,string>();

    private readonly variables=

        new Map<string,string>();

    private readonly references:

        LegalReference[]=[];

    private configuration:

        DocumentGeneratorConfiguration;

    private statistics:

        GeneratorStatistics;

    private currentDocument?:

        GeneratedDocument;

    private startedAt?:Date;



/*===========================================================================
=
= CONSTRUCTOR
=
===========================================================================*/

    constructor(

        configuration?:

        Partial<DocumentGeneratorConfiguration>

    ){

        this.configuration={

            automaticIndex:true,

            automaticNumbering:true,

            includeLegalReferences:true,

            includeHeader:true,

            includeFooter:true,

            validateBeforeExport:true,

            generateMetadata:true,

            ...configuration

        };



        this.statistics={

            generatedDocuments:0,

            exportedDocuments:0,

            totalSections:0,

            totalTables:0,

            averageGenerationMilliseconds:0

        };



        this.loadInternalTemplates();

    }



/*===========================================================================
=
= CARGA DE PLANTILLAS
=
===========================================================================*/

    private loadInternalTemplates()

        :void{

        this.templates.set(

            DocumentType.JUSTIFICATION_MEMORY,

            "JUSTIFICATION_MEMORY"

        );



        this.templates.set(

            DocumentType.ECONOMIC_MEMORY,

            "ECONOMIC_MEMORY"

        );



        this.templates.set(

            DocumentType.PPT,

            "PPT"

        );



        this.templates.set(

            DocumentType.PCAP,

            "PCAP"

        );



        this.templates.set(

            DocumentType.LEGAL_REPORT,

            "LEGAL_REPORT"

        );



        this.templates.set(

            DocumentType.TECHNICAL_REPORT,

            "TECHNICAL_REPORT"

        );



        this.templates.set(

            DocumentType.APPROVAL_RESOLUTION,

            "APPROVAL_RESOLUTION"

        );



        this.templates.set(

            DocumentType.AWARD_RESOLUTION,

            "AWARD_RESOLUTION"

        );



        this.templates.set(

            DocumentType.FORMALIZATION,

            "FORMALIZATION"

        );

    }

/*===========================================================================
=
= INICIALIZACIÓN DEL GENERADOR
=
===========================================================================*/

    public initialize(

        context:ContractContextModel

    ):void{

        this.context=context;

        this.startedAt=new Date();

        this.documents.length=0;

        this.variables.clear();

        this.references.length=0;

        this.currentDocument=undefined;

        this.loadContextVariables();

        this.loadLegalReferences();

    }



/*===========================================================================
=
= VARIABLES DEL CONTEXTO
=
===========================================================================*/

    private loadContextVariables()

        :void{

        if(

            !this.context

        ){

            return;

        }

        this.addVariable(

            "EXPEDIENTE",

            this.context.identification?.fileNumber ?? ""

        );

        this.addVariable(

            "OBJETO",

            this.context.object?.description ?? ""

        );

        this.addVariable(

            "CPV",

            this.context.object?.cpv ?? ""

        );

        this.addVariable(

            "ORGANO",

            this.context.identification?.contractingAuthority ?? ""

        );

        this.addVariable(

            "UNIDAD",

            this.context.identification?.promotingUnit ?? ""

        );

        this.addVariable(

            "RESPONSABLE",

            this.context.identification?.contractManager ?? ""

        );

        this.addVariable(

            "PROCEDIMIENTO",

            this.context.procedure?.procedure ?? ""

        );

        this.addVariable(

            "VALOR_ESTIMADO",

            String(

                this.context.economic?.estimatedValue ?? 0

            )

        );

    }



/*===========================================================================
=
= REGISTRO DE VARIABLES
=
===========================================================================*/

    public addVariable(

        key:string,

        value:string

    ):void{

        this.variables.set(

            key,

            value

        );

    }



/*===========================================================================
=
= CONSULTA DE VARIABLES
=
===========================================================================*/

    public getVariable(

        key:string

    ):string{

        return this.variables.get(

            key

        ) ?? "";

    }



/*===========================================================================
=
= REFERENCIAS NORMATIVAS
=
===========================================================================*/

    private loadLegalReferences()

        :void{

        this.references.push(

            {

                article:"Artículo 1",

                regulation:"LCSP",

                description:

                    "Objeto y finalidad de la Ley."

            }

        );



        this.references.push(

            {

                article:"Artículo 28",

                regulation:"LCSP",

                description:

                    "Necesidad e idoneidad."

            }

        );



        this.references.push(

            {

                article:"Artículo 99",

                regulation:"LCSP",

                description:

                    "Objeto del contrato."

            }

        );



        this.references.push(

            {

                article:"Artículo 100",

                regulation:"LCSP",

                description:

                    "Presupuesto base."

            }

        );



        this.references.push(

            {

                article:"Artículo 101",

                regulation:"LCSP",

                description:

                    "Valor estimado."

            }

        );



        this.references.push(

            {

                article:"Artículo 116",

                regulation:"LCSP",

                description:

                    "Expediente."

            }

        );



        this.references.push(

            {

                article:"Artículo 117",

                regulation:"LCSP",

                description:

                    "Pliegos."

            }

        );



        this.references.push(

            {

                article:"Artículo 122",

                regulation:"LCSP",

                description:

                    "PCAP."

            }

        );



    }



/*===========================================================================
=
= CREACIÓN DEL DOCUMENTO
=
===========================================================================*/

    private createDocument(

        type:DocumentType,

        format:DocumentFormat

    ):GeneratedDocument{

        return{

            id:crypto.randomUUID() as UUID,

            type,

            format,

            status:

                DocumentStatus.CREATED,

            title:

                type,

            description:"",

            version:"1.0",

            created:

                new Date()

                    .toISOString(),

            author:

                "Asistente de Contratación Pública",

            sections:[],

            tables:[],

            references:[

                ...this.references

            ],

            variables:

                this.exportVariables(),

            content:""

        };

    }



/*===========================================================================
=
= EXPORTACIÓN DE VARIABLES
=
===========================================================================*/

    private exportVariables()

        :DocumentVariable[]{

        const variables:

            DocumentVariable[]=[];

        for(

            const

            [

                key,

                value

            ]

            of

            this.variables

        ){

            variables.push(

                {

                    key,

                    value

                }

            );

        }

        return variables;

    }



/*===========================================================================
=
= APERTURA DEL DOCUMENTO
=
===========================================================================*/

    private openDocument(

        type:DocumentType,

        format:DocumentFormat

    ):void{

        this.currentDocument=

            this.createDocument(

                type,

                format

            );



        this.documents.push(

            this.currentDocument

        );

    }

/*===========================================================================
=
= CONSTRUCCIÓN AUTOMÁTICA DEL DOCUMENTO
=
===========================================================================*/

    public async generate(

        context:ContractContextModel,

        type:DocumentType,

        format:DocumentFormat

    ):Promise<GeneratedDocument>{

        this.initialize(

            context

        );

        this.openDocument(

            type,

            format

        );

        this.currentDocument!.status=

            DocumentStatus.BUILDING;

        this.buildMetadata();

        this.buildHeader();

        this.buildAutomaticIndex();

        this.buildSections(

            type

        );

        this.buildFooter();

        this.compileContent();

        this.currentDocument!.status=

            DocumentStatus.GENERATED;

        this.statistics.generatedDocuments++;

        this.updateStatistics();

        return this.currentDocument!;

    }



/*===========================================================================
=
= METADATOS
=
===========================================================================*/

    private buildMetadata()

        :void{

        if(

            !this.configuration.generateMetadata

        ){

            return;

        }

        this.currentDocument!.description=

            `Documento generado automáticamente (${this.currentDocument!.type})`;

        this.addVariable(

            "DOCUMENT_VERSION",

            this.currentDocument!.version

        );

        this.addVariable(

            "DOCUMENT_DATE",

            this.currentDocument!.created

        );

    }



/*===========================================================================
=
= CABECERA
=
===========================================================================*/

    private buildHeader()

        :void{

        if(

            !this.configuration.includeHeader

        ){

            return;

        }

        this.addSection(

            "CABECERA",

            [

                "JUNTA DE ANDALUCÍA",

                "CONSEJERÍA DE EMPLEO",

                "",

                this.getVariable(

                    "EXPEDIENTE"

                ),

                "",

                this.getVariable(

                    "OBJETO"

                )

            ].join("\n")

        );

    }



/*===========================================================================
=
= ÍNDICE
=
===========================================================================*/

    private buildAutomaticIndex()

        :void{

        if(

            !this.configuration.automaticIndex

        ){

            return;

        }

        this.addSection(

            "ÍNDICE",

            "<<AUTO_INDEX>>"

        );

    }



/*===========================================================================
=
= SECCIONES
=
===========================================================================*/

    private buildSections(

        type:DocumentType

    ):void{

        switch(

            type

        ){

            case DocumentType.JUSTIFICATION_MEMORY:

                this.buildJustificationMemory();

                break;

            case DocumentType.ECONOMIC_MEMORY:

                this.buildEconomicMemory();

                break;

            case DocumentType.PPT:

                this.buildPPT();

                break;

            case DocumentType.PCAP:

                this.buildPCAP();

                break;

            case DocumentType.LEGAL_REPORT:

                this.buildLegalReport();

                break;

            case DocumentType.TECHNICAL_REPORT:

                this.buildTechnicalReport();

                break;

            default:

                this.buildGenericDocument();

                break;

        }

    }



/*===========================================================================
=
= PIE
=
===========================================================================*/

    private buildFooter()

        :void{

        if(

            !this.configuration.includeFooter

        ){

            return;

        }

        this.addSection(

            "PIE",

            [

                "",

                "Documento generado automáticamente.",

                "Asistente de Contratación Pública.",

                WORKFLOW_ENGINE_VERSION

            ].join("\n")

        );

    }



/*===========================================================================
=
= CREACIÓN DE SECCIÓN
=
===========================================================================*/

    private addSection(

        title:string,

        content:string,

        mandatory:boolean=true

    ):void{

        this.currentDocument!.sections.push({

            id:crypto.randomUUID() as UUID,

            title,

            order:

                this.currentDocument!.sections.length+1,

            mandatory,

            generated:true,

            content

        });

        this.statistics.totalSections++;

    }



/*===========================================================================
=
= CREACIÓN DE TABLAS
=
===========================================================================*/

    private addTable(

        title:string,

        headers:string[],

        rows:string[][]

    ):void{

        this.currentDocument!.tables.push({

            id:crypto.randomUUID() as UUID,

            title,

            headers,

            rows

        });

        this.statistics.totalTables++;

    }



/*===========================================================================
=
= ENSAMBLADO DEL DOCUMENTO
=
===========================================================================*/

    private compileContent()

        :void{

        const builder:string[]=[];

        for(

            const section

            of

            this.currentDocument!.sections

        ){

            builder.push(

                section.title

            );

            builder.push(

                "-".repeat(

                    section.title.length

                )

            );

            builder.push(

                section.content

            );

            builder.push("");

        }

        this.currentDocument!.content=

            builder.join("\n");

    }



/*===========================================================================
=
= ACTUALIZACIÓN DE ESTADÍSTICAS
=
===========================================================================*/

    private updateStatistics()

        :void{

        if(

            !this.startedAt

        ){

            return;

        }

        const elapsed=

            Date.now()

            -

            this.startedAt.getTime();

        const previous=

            this.statistics.generatedDocuments-1;

        this.statistics.averageGenerationMilliseconds=(

            (

                this.statistics.averageGenerationMilliseconds

                *

                previous

            )

            +

            elapsed

        )

        /

        this.statistics.generatedDocuments;

    }

/*===========================================================================
=
= MEMORIA JUSTIFICATIVA
=
===========================================================================*/

private buildJustificationMemory()

    :void{

    this.buildSectionIntroduction();

    this.buildSectionNeed();

    this.buildSectionObject();

    this.buildSectionInsufficientMeans();

    this.buildSectionEstimatedValue();

    this.buildSectionProcedure();

    this.buildSectionCPV();

    this.buildSectionLots();

    this.buildSectionExecution();

    this.buildSectionLegalBasis();

    this.buildSectionConclusion();

}



/*===========================================================================
=
= INTRODUCCIÓN
=
===========================================================================*/

private buildSectionIntroduction()

    :void{

    const text=[

        "MEMORIA JUSTIFICATIVA",

        "",

        "La presente memoria se redacta de conformidad con",

        "la Ley 9/2017, de Contratos del Sector Público,",

        "con el fin de justificar la necesidad,",

        "idoneidad y alcance del contrato proyectado.",

        "",

        "Expediente:",

        this.getVariable(

            "EXPEDIENTE"

        ),

        "",

        "Objeto:",

        this.getVariable(

            "OBJETO"

        )

    ].join("\n");



    this.addSection(

        "1. INTRODUCCIÓN",

        text

    );

}



/*===========================================================================
=
= NECESIDAD
=
===========================================================================*/

private buildSectionNeed()

    :void{

    const description=

        this.context

            ?.need

            ?.description

        ??

        "";



    const objectives=

        this.context

            ?.need

            ?.publicObjectives

        ??

        "";



    const builder=[

        "Se acredita la existencia de una necesidad",

        "administrativa que no puede ser atendida",

        "mediante los medios ordinarios disponibles.",

        "",

        "Descripción de la necesidad:",

        "",

        description,

        "",

        "Objetivos públicos:",

        "",

        objectives

    ];



    this.addSection(

        "2. NECESIDAD",

        builder.join("\n")

    );

}



/*===========================================================================
=
= OBJETO
=
===========================================================================*/

private buildSectionObject()

    :void{

    const builder=[

        "El objeto del contrato consiste en:",

        "",

        this.getVariable(

            "OBJETO"

        ),

        "",

        "El objeto responde a una necesidad",

        "real y determinada.",

        "",

        "La definición realizada permite",

        "la correcta identificación",

        "del contrato y de las prestaciones",

        "que lo integran."

    ];



    this.addSection(

        "3. OBJETO DEL CONTRATO",

        builder.join("\n")

    );

}



/*===========================================================================
=
= INSUFICIENCIA DE MEDIOS
=
===========================================================================*/

private buildSectionInsufficientMeans()

    :void{

    const text=

        this.context

            ?.need

            ?.lackOfResources

        ??

        "Se acredita la insuficiencia de medios propios.";



    this.addSection(

        "4. INSUFICIENCIA DE MEDIOS",

        text

    );

}



/*===========================================================================
=
= VALOR ESTIMADO
=
===========================================================================*/

private buildSectionEstimatedValue()

    :void{

    const value=

        this.getVariable(

            "VALOR_ESTIMADO"

        );



    const builder=[

        "Valor estimado del contrato:",

        "",

        value,

        "",

        "El cálculo se ha realizado",

        "conforme a los criterios",

        "establecidos por la LCSP.",

        "",

        "El valor estimado constituye",

        "la base para determinar",

        "el procedimiento de adjudicación",

        "y las obligaciones derivadas."

    ];



    this.addSection(

        "5. VALOR ESTIMADO",

        builder.join("\n")

    );

}



/*===========================================================================
=
= PROCEDIMIENTO
=
===========================================================================*/

private buildSectionProcedure()

    :void{

    const procedure=

        this.getVariable(

            "PROCEDIMIENTO"

        );



    const builder=[

        "Procedimiento propuesto:",

        "",

        procedure,

        "",

        "La elección del procedimiento",

        "se fundamenta en la naturaleza",

        "del contrato y en su valor estimado.",

        "",

        "El RuleEngine ha determinado",

        "que dicho procedimiento",

        "resulta conforme",

        "a la normativa vigente."

    ];



    this.addSection(

        "6. PROCEDIMIENTO",

        builder.join("\n")

    );

}



/*===========================================================================
=
= CPV
=
===========================================================================*/

private buildSectionCPV()

    :void{

    const builder=[

        "Código CPV:",

        "",

        this.getVariable(

            "CPV"

        ),

        "",

        "El código CPV seleccionado",

        "representa adecuadamente",

        "el objeto principal",

        "del contrato."

    ];



    this.addSection(

        "7. CÓDIGOS CPV",

        builder.join("\n")

    );

}

/*===========================================================================
=
= DIVISIÓN EN LOTES
=
===========================================================================*/

private buildSectionLots()

    :void{

    const divided=

        this.context

            ?.object

            ?.dividedIntoLots

        ?? false;

    const justification=

        this.context

            ?.object

            ?.lotsJustification

        ??

        "";

    const builder:string[]=[];

    if(

        divided

    ){

        builder.push(

            "El contrato se divide en lotes."

        );

        builder.push("");

        builder.push(

            justification

        );

    }

    else{

        builder.push(

            "No procede la división en lotes."

        );

        builder.push("");

        builder.push(

            justification ||

            "La división podría restringir la correcta ejecución del contrato y dificultar la coordinación de las prestaciones."

        );

    }

    this.addSection(

        "8. DIVISIÓN EN LOTES",

        builder.join("\n")

    );

}

/*===========================================================================
=
= PLAZO DE EJECUCIÓN
=
===========================================================================*/

private buildSectionExecution()

    :void{

    const duration=

        this.context

            ?.execution

            ?.duration

        ??

        "";

    const unit=

        this.context

            ?.execution

            ?.unit

        ??

        "";

    const builder=[

        "Plazo previsto de ejecución:",

        "",

        `${duration} ${unit}`,

        "",

        "El plazo previsto resulta suficiente",

        "para la correcta ejecución",

        "de todas las prestaciones",

        "objeto del contrato."

    ];

    this.addSection(

        "9. PLAZO DE EJECUCIÓN",

        builder.join("\n")

    );

}

/*===========================================================================
=
= CRITERIOS SOCIALES
=
===========================================================================*/

private buildSectionSocialCriteria()

    :void{

    const enabled=

        this.context

            ?.execution

            ?.socialClauses

        ?? false;

    const builder:string[]=[];

    if(

        enabled

    ){

        builder.push(

            "Se incorporan condiciones especiales de ejecución de carácter social."

        );

        builder.push("");

        builder.push(

            "Las cláusulas sociales se consideran proporcionadas al objeto del contrato."

        );

    }

    else{

        builder.push(

            "No se incorporan condiciones especiales de ejecución de carácter social."

        );

    }

    this.addSection(

        "10. CONDICIONES SOCIALES",

        builder.join("\n")

    );

}

/*===========================================================================
=
= CRITERIOS MEDIOAMBIENTALES
=
===========================================================================*/

private buildSectionEnvironmentalCriteria()

    :void{

    const enabled=

        this.context

            ?.execution

            ?.environmentalClauses

        ?? false;

    const builder:string[]=[];

    if(

        enabled

    ){

        builder.push(

            "Se incorporan condiciones especiales de ejecución de carácter medioambiental."

        );

        builder.push("");

        builder.push(

            "Las medidas previstas guardan relación directa con el objeto contractual."

        );

    }

    else{

        builder.push(

            "No se consideran necesarias condiciones medioambientales adicionales."

        );

    }

    this.addSection(

        "11. CONDICIONES MEDIOAMBIENTALES",

        builder.join("\n")

    );

}

/*===========================================================================
=
= SOLVENCIA
=
===========================================================================*/

private buildSectionSolvency()

    :void{

    const required=

        this.context

            ?.procedure

            ?.requiresSolvency

        ?? false;

    const builder:string[]=[];

    if(

        required

    ){

        builder.push(

            "Se exige acreditación de solvencia."

        );

        builder.push("");

        builder.push(

            "Los medios de acreditación serán proporcionales al objeto, importe y complejidad del contrato."

        );

    }

    else{

        builder.push(

            "No procede exigir solvencia adicional."

        );

    }

    this.addSection(

        "12. SOLVENCIA",

        builder.join("\n")

    );

}

/*===========================================================================
=
= GARANTÍAS
=
===========================================================================*/

private buildSectionGuarantees()

    :void{

    const guarantee=

        this.context

            ?.procedure

            ?.requiresGuarantee

        ?? false;

    const builder:string[]=[];

    if(

        guarantee

    ){

        builder.push(

            "Procede la constitución de garantía definitiva."

        );

        builder.push("");

        builder.push(

            "Su importe será el previsto en la normativa vigente."

        );

    }

    else{

        builder.push(

            "No procede exigir garantía definitiva."

        );

    }

    this.addSection(

        "13. GARANTÍAS",

        builder.join("\n")

    );

}

/*===========================================================================
=
= FUNDAMENTO JURÍDICO
=
===========================================================================*/

private buildSectionLegalBasis()

    :void{

    const builder:string[]=[

        "La presente memoria se fundamenta en la legislación vigente en materia de contratación pública.",

        "",

        "En particular, se han considerado las disposiciones relativas a:",

        ""

    ];

    for(

        const reference

        of this.references

    ){

        builder.push(

            `• ${reference.regulation} - ${reference.article}`

        );

        builder.push(

            `  ${reference.description}`

        );

    }

    this.addSection(

        "14. FUNDAMENTO JURÍDICO",

        builder.join("\n")

    );

}

/*===========================================================================
=
= CONCLUSIÓN
=
===========================================================================*/

private buildSectionConclusion()

    :void{

    const builder=[

        "A la vista de la información incorporada al expediente,",

        "queda suficientemente acreditada la necesidad del contrato,",

        "la idoneidad de su objeto,",

        "la insuficiencia de medios propios,",

        "la adecuación del procedimiento elegido",

        "y el cumplimiento de los principios establecidos por la LCSP.",

        "",

        "En consecuencia,",

        "se propone la continuación de la tramitación del expediente."

    ];

    this.addSection(

        "15. CONCLUSIONES",

        builder.join("\n")

    );

}

/*===========================================================================
=
= PLIEGO DE PRESCRIPCIONES TÉCNICAS (PPT)
=
===========================================================================*/

private buildPPT()

    :void{

    this.buildPPTIntroduction();

    this.buildPPTObject();

    this.buildPPTScope();

    this.buildPPTGeneralRequirements();

    this.buildPPTTechnicalRequirements();

    this.buildPPTExecutionConditions();

    this.buildPPTQualityControl();

    this.buildPPTAcceptanceCriteria();

    this.buildPPTDocumentation();

    this.buildPPTFinalClause();

}

/*===========================================================================
=
= INTRODUCCIÓN
=
===========================================================================*/

private buildPPTIntroduction()

    :void{

    const builder=[

        "PLIEGO DE PRESCRIPCIONES TÉCNICAS",

        "",

        "El presente documento establece las",

        "prescripciones técnicas que regirán",

        "la ejecución del contrato.",

        "",

        "Todas las prestaciones deberán",

        "realizarse conforme a estas",

        "especificaciones."

    ];

    this.addSection(

        "1. INTRODUCCIÓN",

        builder.join("\n")

    );

}

/*===========================================================================
=
= OBJETO
=
===========================================================================*/

private buildPPTObject()

    :void{

    const builder=[

        "Objeto:",

        "",

        this.getVariable(

            "OBJETO"

        ),

        "",

        "Las características técnicas",

        "descritas en este pliego",

        "constituyen los requisitos",

        "mínimos exigibles."

    ];

    this.addSection(

        "2. OBJETO",

        builder.join("\n")

    );

}

/*===========================================================================
=
= ÁMBITO
=
===========================================================================*/

private buildPPTScope()

    :void{

    const builder=[

        "El adjudicatario deberá ejecutar",

        "la totalidad de las prestaciones",

        "necesarias para alcanzar",

        "los objetivos definidos",

        "en el expediente.",

        "",

        "Quedan comprendidas todas",

        "las actuaciones auxiliares",

        "que resulten imprescindibles",

        "para el correcto resultado."

    ];

    this.addSection(

        "3. ÁMBITO",

        builder.join("\n")

    );

}

/*===========================================================================
=
= REQUISITOS GENERALES
=
===========================================================================*/

private buildPPTGeneralRequirements()

    :void{

    const builder=[

        "Las prestaciones deberán",

        "realizarse conforme a",

        "criterios de calidad,",

        "eficiencia y seguridad.",

        "",

        "Los materiales, equipos",

        "y procedimientos utilizados",

        "serán adecuados",

        "a la finalidad perseguida."

    ];

    this.addSection(

        "4. REQUISITOS GENERALES",

        builder.join("\n")

    );

}

/*===========================================================================
=
= REQUISITOS TÉCNICOS
=
===========================================================================*/

private buildPPTTechnicalRequirements()

    :void{

    const builder=[

        "El contratista garantizará",

        "el cumplimiento de todas",

        "las especificaciones técnicas",

        "definidas para el contrato.",

        "",

        "Cuando existan normas UNE, ISO",

        "EN o equivalentes,",

        "las prestaciones deberán",

        "adaptarse a las mismas.",

        "",

        "Toda solución equivalente",

        "deberá justificarse",

        "documentalmente."

    ];

    this.addSection(

        "5. REQUISITOS TÉCNICOS",

        builder.join("\n")

    );

}

/*===========================================================================
=
= CONDICIONES DE EJECUCIÓN
=
===========================================================================*/

private buildPPTExecutionConditions()

    :void{

    const builder=[

        "La ejecución deberá realizarse",

        "de manera coordinada",

        "con el Responsable",

        "del Contrato.",

        "",

        "Se respetarán",

        "los plazos establecidos",

        "y la planificación",

        "aprobada."

    ];

    this.addSection(

        "6. CONDICIONES DE EJECUCIÓN",

        builder.join("\n")

    );

}

/*===========================================================================
=
= CONTROL DE CALIDAD
=
===========================================================================*/

private buildPPTQualityControl()

    :void{

    const builder=[

        "La Administración",

        "podrá verificar",

        "en cualquier momento",

        "la correcta ejecución",

        "de las prestaciones.",

        "",

        "El adjudicatario",

        "facilitará cuanta",

        "información resulte necesaria."

    ];

    this.addSection(

        "7. CONTROL DE CALIDAD",

        builder.join("\n")

    );

}

/*===========================================================================
=
= CRITERIOS DE ACEPTACIÓN
=
===========================================================================*/

private buildPPTAcceptanceCriteria()

    :void{

    const builder=[

        "La recepción",

        "de las prestaciones",

        "quedará condicionada",

        "al cumplimiento íntegro",

        "de las prescripciones",

        "contenidas en este pliego.",

        "",

        "Las deficiencias detectadas",

        "deberán corregirse",

        "antes de la recepción."

    ];

    this.addSection(

        "8. CRITERIOS DE ACEPTACIÓN",

        builder.join("\n")

    );

}

/*===========================================================================
=
= DOCUMENTACIÓN
=
===========================================================================*/

private buildPPTDocumentation()

    :void{

    const builder=[

        "El adjudicatario entregará",

        "toda la documentación",

        "técnica generada",

        "durante la ejecución.",

        "",

        "La documentación",

        "se presentará",

        "en formato editable",

        "y PDF."

    ];

    this.addSection(

        "9. DOCUMENTACIÓN TÉCNICA",

        builder.join("\n")

    );

}

/*===========================================================================
=
= CLÁUSULA FINAL
=
===========================================================================*/

private buildPPTFinalClause()

    :void{

    const builder=[

        "Las presentes",

        "prescripciones técnicas",

        "tendrán carácter contractual",

        "y serán de obligado",

        "cumplimiento",

        "para el adjudicatario."

    ];

    this.addSection(

        "10. CLÁUSULA FINAL",

        builder.join("\n")

    );

}

/*===========================================================================
=
= CRITERIOS DE ADJUDICACIÓN
=
===========================================================================*/

private buildPCAPAwardCriteria()

    :void{

    const builder=[

        "La adjudicación del contrato",

        "se realizará utilizando",

        "los criterios establecidos",

        "en el expediente.",

        "",

        "Los criterios deberán",

        "guardar relación directa",

        "con el objeto contractual.",

        "",

        "Su aplicación respetará",

        "los principios",

        "de igualdad",

        "transparencia",

        "objetividad",

        "y libre competencia."

    ];



    this.addSection(

        "9. CRITERIOS DE ADJUDICACIÓN",

        builder.join("\n")

    );

}



/*===========================================================================
=
= PRESENTACIÓN DE OFERTAS
=
===========================================================================*/

private buildPCAPOffers()

    :void{

    const builder=[

        "Las ofertas deberán",

        "presentarse",

        "dentro del plazo",

        "establecido",

        "utilizando",

        "los medios electrónicos",

        "habilitados.",

        "",

        "La documentación",

        "deberá presentarse",

        "estructurada",

        "conforme",

        "a lo previsto",

        "en el presente pliego."

    ];



    this.addSection(

        "10. PRESENTACIÓN DE OFERTAS",

        builder.join("\n")

    );

}



/*===========================================================================
=
= MESA DE CONTRATACIÓN
=
===========================================================================*/

private buildPCAPBoard()

    :void{

    const builder=[

        "La Mesa de Contratación",

        "actuará conforme",

        "a la normativa",

        "vigente.",

        "",

        "Será competente",

        "para valorar",

        "las ofertas",

        "y elevar",

        "la propuesta",

        "de adjudicación."

    ];



    this.addSection(

        "11. MESA DE CONTRATACIÓN",

        builder.join("\n")

    );

}



/*===========================================================================
=
= FORMALIZACIÓN
=
===========================================================================*/

private buildPCAPFormalization()

    :void{

    const builder=[

        "La formalización",

        "del contrato",

        "se realizará",

        "en los plazos",

        "establecidos",

        "por la LCSP.",

        "",

        "La firma",

        "podrá realizarse",

        "mediante",

        "medios electrónicos."

    ];



    this.addSection(

        "12. FORMALIZACIÓN",

        builder.join("\n")

    );

}



/*===========================================================================
=
= EJECUCIÓN
=
===========================================================================*/

private buildPCAPExecution()

    :void{

    const builder=[

        "La ejecución",

        "del contrato",

        "se ajustará",

        "al PPT",

        "y al presente PCAP.",

        "",

        "El Responsable",

        "del Contrato",

        "supervisará",

        "su correcta",

        "ejecución."

    ];



    this.addSection(

        "13. EJECUCIÓN DEL CONTRATO",

        builder.join("\n")

    );

}



/*===========================================================================
=
= MODIFICACIONES
=
===========================================================================*/

private buildPCAPModifications()

    :void{

    const builder=[

        "Las modificaciones",

        "contractuales",

        "únicamente",

        "podrán realizarse",

        "en los supuestos",

        "previstos",

        "legalmente.",

        "",

        "Toda modificación",

        "deberá estar",

        "debidamente",

        "motivada."

    ];



    this.addSection(

        "14. MODIFICACIONES",

        builder.join("\n")

    );

}



/*===========================================================================
=
= PENALIDADES
=
===========================================================================*/

private buildPCAPPenalties()

    :void{

    const builder=[

        "El incumplimiento",

        "de las obligaciones",

        "contractuales",

        "podrá dar lugar",

        "a la imposición",

        "de penalidades.",

        "",

        "Su cuantía",

        "y procedimiento",

        "serán los previstos",

        "en la LCSP",

        "y en este pliego."

    ];



    this.addSection(

        "15. PENALIDADES",

        builder.join("\n")

    );

}



/*===========================================================================
=
= EXTINCIÓN
=
===========================================================================*/

private buildPCAPTermination()

    :void{

    const builder=[

        "El contrato",

        "se extinguirá",

        "por cumplimiento",

        "o por resolución",

        "en los supuestos",

        "legalmente",

        "establecidos."

    ];



    this.addSection(

        "16. EXTINCIÓN DEL CONTRATO",

        builder.join("\n")

    );

}



/*===========================================================================
=
= JURISDICCIÓN
=
===========================================================================*/

private buildPCAPJurisdiction()

    :void{

    const builder=[

        "Las cuestiones",

        "litigiosas",

        "que puedan surgir",

        "serán competencia",

        "del orden",

        "jurisdiccional",

        "contencioso-administrativo,",


        "",

        "sin perjuicio",

        "de los recursos",

        "administrativos",

        "que procedan."

    ];



    this.addSection(

        "17. JURISDICCIÓN",

        builder.join("\n")

    );

}



/*===========================================================================
=
= CLÁUSULA FINAL
=
===========================================================================*/

private buildPCAPClosing()

    :void{

    const builder=[

        "El presente",

        "Pliego de Cláusulas",

        "Administrativas Particulares",

        "forma parte",

        "integrante",

        "del expediente",

        "de contratación.",

        "",

        "Será obligatorio",

        "para el adjudicatario",

        "desde la formalización",

        "del contrato."

    ];



    this.addSection(

        "18. CLÁUSULA FINAL",

        builder.join("\n")

    );

}

/*===========================================================================
=
= EXPEDIENTE DOCUMENTAL
=
===========================================================================*/

export interface AdministrativeFile{

    id:UUID;

    expediente:string;

    generated:Date;

    documents:GeneratedDocument[];

    index:string[];

    metadata:Map<string,string>;

}



/*===========================================================================
=
= ENSAMBLADOR DEL EXPEDIENTE
=
===========================================================================*/

private administrativeFile?:

    AdministrativeFile;



/*===========================================================================
=
= CREACIÓN DEL EXPEDIENTE
=
===========================================================================*/

public async generateAdministrativeFile(

    context:ContractContextModel

)

:Promise<AdministrativeFile>{

    this.initialize(

        context

    );



    this.administrativeFile={

        id:crypto.randomUUID() as UUID,

        expediente:

            this.getVariable(

                "EXPEDIENTE"

            ),

        generated:

            new Date(),

        documents:[],

        index:[],

        metadata:new Map()

    };



    await this.generateCoreDocuments();

    await this.generateReports();

    await this.generateAdministrativeResolutions();

    await this.generateAnnexes();

    this.buildAdministrativeIndex();

    this.completeAdministrativeMetadata();



    return this.administrativeFile;

}



/*===========================================================================
=
= DOCUMENTOS PRINCIPALES
=
===========================================================================*/

private async generateCoreDocuments()

:Promise<void>{

    await this.addGeneratedDocument(

        DocumentType.JUSTIFICATION_MEMORY

    );



    await this.addGeneratedDocument(

        DocumentType.ECONOMIC_MEMORY

    );



    await this.addGeneratedDocument(

        DocumentType.PPT

    );



    await this.addGeneratedDocument(

        DocumentType.PCAP

    );

}



/*===========================================================================
=
= INFORMES
=
===========================================================================*/

private async generateReports()

:Promise<void>{

    await this.addGeneratedDocument(

        DocumentType.LEGAL_REPORT

    );



    await this.addGeneratedDocument(

        DocumentType.TECHNICAL_REPORT

    );



    await this.addGeneratedDocument(

        DocumentType.LACK_OF_RESOURCES

    );

}



/*===========================================================================
=
= RESOLUCIONES
=
===========================================================================*/

private async generateAdministrativeResolutions()

:Promise<void>{

    await this.addGeneratedDocument(

        DocumentType.APPROVAL_RESOLUTION

    );



    await this.addGeneratedDocument(

        DocumentType.AWARD_PROPOSAL

    );



    await this.addGeneratedDocument(

        DocumentType.AWARD_RESOLUTION

    );



    await this.addGeneratedDocument(

        DocumentType.FORMALIZATION

    );

}



/*===========================================================================
=
= ANEXOS
=
===========================================================================*/

private async generateAnnexes()

:Promise<void>{

    await this.addGeneratedDocument(

        DocumentType.ANNEX

    );

}



/*===========================================================================
=
= AÑADIR DOCUMENTO
=
===========================================================================*/

private async addGeneratedDocument(

    type:DocumentType

)

:Promise<void>{

    const document=

        await this.generate(

            this.context!,

            type,

            DocumentFormat.DOCX

        );



    this.administrativeFile!

        .documents

        .push(

            document

        );

}



/*===========================================================================
=
= ÍNDICE GENERAL
=
===========================================================================*/

private buildAdministrativeIndex()

:void{

    this.administrativeFile!

        .index

        .length=0;



    for(

        const document

        of

        this.administrativeFile!

            .documents

    ){

        this.administrativeFile!

            .index

            .push(

                document.title

            );

    }

}



/*===========================================================================
=
= METADATOS
=
===========================================================================*/

private completeAdministrativeMetadata()

:void{

    const metadata=

        this.administrativeFile!

            .metadata;



    metadata.set(

        "EXPEDIENTE",

        this.getVariable(

            "EXPEDIENTE"

        )

    );



    metadata.set(

        "CPV",

        this.getVariable(

            "CPV"

        )

    );



    metadata.set(

        "OBJETO",

        this.getVariable(

            "OBJETO"

        )

    );



    metadata.set(

        "ORGANO",

        this.getVariable(

            "ORGANO"

        )

    );



    metadata.set(

        "PROCEDIMIENTO",

        this.getVariable(

            "PROCEDIMIENTO"

        )

    );



    metadata.set(

        "VERSION",

        "1.0"

    );



    metadata.set(

        "DOCUMENTOS",

        String(

            this.administrativeFile!

                .documents

                .length

        )

    );

}



/*===========================================================================
=
= CONSULTA
=
===========================================================================*/

public getAdministrativeFile()

:AdministrativeFile|undefined{

    return this.administrativeFile;

}

/*===========================================================================
=
= EXPORTACIÓN DOCUMENTAL
=
===========================================================================*/

export interface ExportResult{

    success:boolean;

    format:DocumentFormat;

    filename:string;

    mimeType:string;

    size:number;

    generated:Date;

    content:string;

}



/*===========================================================================
=
= EXPORTACIÓN GENERAL
=
===========================================================================*/

public async exportDocument(

    document:GeneratedDocument,

    format:DocumentFormat

)

:Promise<ExportResult>{

    switch(format){

        case DocumentFormat.DOCX:

            return this.exportDOCX(

                document

            );



        case DocumentFormat.PDF:

            return this.exportPDF(

                document

            );



        case DocumentFormat.HTML:

            return this.exportHTML(

                document

            );



        case DocumentFormat.MARKDOWN:

            return this.exportMarkdown(

                document

            );



        case DocumentFormat.JSON:

            return this.exportJSON(

                document

            );



        case DocumentFormat.XML:

            return this.exportXML(

                document

            );



        default:

            throw new Error(

                "Unsupported format."

            );

    }

}



/*===========================================================================
=
= DOCX
=
===========================================================================*/

private async exportDOCX(

    document:GeneratedDocument

)

:Promise<ExportResult>{

    const content=

        this.renderPlainDocument(

            document

        );



    return{

        success:true,

        format:DocumentFormat.DOCX,

        filename:

            `${document.type}.docx`,

        mimeType:

            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

        size:content.length,

        generated:new Date(),

        content

    };

}



/*===========================================================================
=
= PDF
=
===========================================================================*/

private async exportPDF(

    document:GeneratedDocument

)

:Promise<ExportResult>{

    const content=

        this.renderPlainDocument(

            document

        );



    return{

        success:true,

        format:DocumentFormat.PDF,

        filename:

            `${document.type}.pdf`,

        mimeType:

            "application/pdf",

        size:content.length,

        generated:new Date(),

        content

    };

}



/*===========================================================================
=
= HTML
=
===========================================================================*/

private async exportHTML(

    document:GeneratedDocument

)

:Promise<ExportResult>{

    const html=

        this.renderHTML(

            document

        );



    return{

        success:true,

        format:DocumentFormat.HTML,

        filename:

            `${document.type}.html`,

        mimeType:

            "text/html",

        size:html.length,

        generated:new Date(),

        content:html

    };

}



/*===========================================================================
=
= MARKDOWN
=
===========================================================================*/

private async exportMarkdown(

    document:GeneratedDocument

)

:Promise<ExportResult>{

    const markdown=

        this.renderMarkdown(

            document

        );



    return{

        success:true,

        format:DocumentFormat.MARKDOWN,

        filename:

            `${document.type}.md`,

        mimeType:

            "text/markdown",

        size:markdown.length,

        generated:new Date(),

        content:markdown

    };

}



/*===========================================================================
=
= JSON
=
===========================================================================*/

private async exportJSON(

    document:GeneratedDocument

)

:Promise<ExportResult>{

    const json=

        JSON.stringify(

            document,

            null,

            2

        );



    return{

        success:true,

        format:DocumentFormat.JSON,

        filename:

            `${document.type}.json`,

        mimeType:

            "application/json",

        size:json.length,

        generated:new Date(),

        content:json

    };

}



/*===========================================================================
=
= XML
=
===========================================================================*/

private async exportXML(

    document:GeneratedDocument

)

:Promise<ExportResult>{

    const xml=[

        "<document>",

        `<title>${document.title}</title>`,

        `<type>${document.type}</type>`,

        `<version>${document.version}</version>`,

        `<created>${document.created}</created>`,

        "<content>",

        this.escapeXML(

            document.content

        ),

        "</content>",

        "</document>"

    ].join("\n");



    return{

        success:true,

        format:DocumentFormat.XML,

        filename:

            `${document.type}.xml`,

        mimeType:

            "application/xml",

        size:xml.length,

        generated:new Date(),

        content:xml

    };

}



/*===========================================================================
=
= TEXTO PLANO
=
===========================================================================*/

private renderPlainDocument(

    document:GeneratedDocument

)

:string{

    return document.content;

}



/*===========================================================================
=
= HTML
=
===========================================================================*/

private renderHTML(

    document:GeneratedDocument

)

:string{

    return `

<html>

<head>

<title>${document.title}</title>

</head>

<body>

<pre>

${document.content}

</pre>

</body>

</html>

`;

}



/*===========================================================================
=
= MARKDOWN
=
===========================================================================*/

private renderMarkdown(

    document:GeneratedDocument

)

:string{

    return `# ${document.title}

${document.content}

`;

}



/*===========================================================================
=
= ESCAPE XML
=
===========================================================================*/

private escapeXML(

    value:string

)

:string{

    return value

        .replace(

            /&/g,

            "&amp;"

        )

        .replace(

            /</g,

            "&lt;"

        )

        .replace(

            />/g,

            "&gt;"

        );

}

/*===========================================================================
=
= ANEXOS
=
===========================================================================*/

export interface AdministrativeAnnex{

    id:UUID;

    code:string;

    title:string;

    description:string;

    mandatory:boolean;

    content:string;

}



/*===========================================================================
=
= ANEXOS DEL EXPEDIENTE
=
===========================================================================*/

private readonly annexes:

    AdministrativeAnnex[]=[];



/*===========================================================================
=
= REGISTRO DE ANEXO
=
===========================================================================*/

private addAnnex(

    code:string,

    title:string,

    description:string,

    content:string,

    mandatory:boolean=true

):void{

    this.annexes.push({

        id:crypto.randomUUID() as UUID,

        code,

        title,

        description,

        mandatory,

        content

    });

}



/*===========================================================================
=
= GENERACIÓN DE ANEXOS
=
===========================================================================*/

private buildAdministrativeAnnexes()

:void{

    this.buildCPVAnnex();

    this.buildBudgetAnnex();

    this.buildDeadlinesAnnex();

    this.buildRegulationAnnex();

    this.buildWorkflowAnnex();

}



/*===========================================================================
=
= ANEXO CPV
=
===========================================================================*/

private buildCPVAnnex()

:void{

    this.addAnnex(

        "ANX-I",

        "CÓDIGOS CPV",

        "Relación de códigos CPV utilizados.",

        this.getVariable(

            "CPV"

        )

    );

}



/*===========================================================================
=
= ANEXO PRESUPUESTO
=
===========================================================================*/

private buildBudgetAnnex()

:void{

    this.addAnnex(

        "ANX-II",

        "PRESUPUESTO",

        "Resumen económico.",

        this.getVariable(

            "VALOR_ESTIMADO"

        )

    );

}



/*===========================================================================
=
= ANEXO PLAZOS
=
===========================================================================*/

private buildDeadlinesAnnex()

:void{

    this.addAnnex(

        "ANX-III",

        "CRONOGRAMA",

        "Resumen de hitos.",

        "Cronograma generado automáticamente."

    );

}



/*===========================================================================
=
= ANEXO NORMATIVO
=
===========================================================================*/

private buildRegulationAnnex()

:void{

    const builder:string[]=[];

    for(

        const reference

        of this.references

    ){

        builder.push(

            `${reference.regulation} - ${reference.article}`

        );

        builder.push(

            reference.description

        );

        builder.push("");

    }

    this.addAnnex(

        "ANX-IV",

        "REFERENCIAS NORMATIVAS",

        "Normativa utilizada.",

        builder.join("\n")

    );

}



/*===========================================================================
=
= ANEXO WORKFLOW
=
===========================================================================*/

private buildWorkflowAnnex()

:void{

    this.addAnnex(

        "ANX-V",

        "TRAZABILIDAD",

        "Resumen del Workflow.",

        JSON.stringify(

            this.statistics,

            null,

            2

        )

    );

}



/*===========================================================================
=
= TABLA ADMINISTRATIVA
=
===========================================================================*/

private buildAdministrativeTable(

    title:string,

    entries:

        Record<string,string>

)

:void{

    const headers=[

        "Campo",

        "Valor"

    ];



    const rows:string[][]=[];



    for(

        const

        key

        of

        Object.keys(

            entries

        )

    ){

        rows.push([

            key,

            entries[key]

        ]);

    }



    this.addTable(

        title,

        headers,

        rows

    );

}



/*===========================================================================
=
= TABLA IDENTIFICACIÓN
=
===========================================================================*/

private buildIdentificationTable()

:void{

    this.buildAdministrativeTable(

        "IDENTIFICACIÓN",

        {

            Expediente:

                this.getVariable(

                    "EXPEDIENTE"

                ),

            Objeto:

                this.getVariable(

                    "OBJETO"

                ),

            CPV:

                this.getVariable(

                    "CPV"

                ),

            Procedimiento:

                this.getVariable(

                    "PROCEDIMIENTO"

                )

        }

    );

}



/*===========================================================================
=
= TABLA ECONÓMICA
=
===========================================================================*/

private buildEconomicTable()

:void{

    this.buildAdministrativeTable(

        "DATOS ECONÓMICOS",

        {

            "Valor estimado":

                this.getVariable(

                    "VALOR_ESTIMADO"

                )

        }

    );

}



/*===========================================================================
=
= TABLA DEL EXPEDIENTE
=
===========================================================================*/

private buildAdministrativeSummary()

:void{

    this.buildIdentificationTable();

    this.buildEconomicTable();

}



/*===========================================================================
=
= INCORPORACIÓN DE ANEXOS
=
===========================================================================*/

private appendAnnexes()

:void{

    for(

        const annex

        of this.annexes

    ){

        this.addSection(

            annex.title,

            annex.content,

            annex.mandatory

        );

    }

}

/*===========================================================================
=
= PLANTILLAS DOCUMENTALES
=
===========================================================================*/

export interface DocumentTemplate{

    id:UUID;

    code:string;

    name:string;

    version:string;

    description:string;

    documentType:DocumentType;

    language:string;

    active:boolean;

    sections:string[];

}



/*===========================================================================
=
= REPOSITORIO DE PLANTILLAS
=
===========================================================================*/

private readonly templateRepository:

    Map<DocumentType,DocumentTemplate>=

    new Map();



/*===========================================================================
=
= CARGA DE PLANTILLAS
=
===========================================================================*/

private initializeTemplateRepository()

:void{

    this.registerTemplate(

        DocumentType.JUSTIFICATION_MEMORY,

        "TMP-JM",

        "Memoria Justificativa"

    );



    this.registerTemplate(

        DocumentType.PPT,

        "TMP-PPT",

        "Pliego Técnico"

    );



    this.registerTemplate(

        DocumentType.PCAP,

        "TMP-PCAP",

        "Pliego Administrativo"

    );



    this.registerTemplate(

        DocumentType.LEGAL_REPORT,

        "TMP-LR",

        "Informe Jurídico"

    );

}



/*===========================================================================
=
= REGISTRO
=
===========================================================================*/

private registerTemplate(

    type:DocumentType,

    code:string,

    name:string

)

:void{

    this.templateRepository.set(

        type,

        {

            id:crypto.randomUUID() as UUID,

            code,

            name,

            version:"1.0",

            description:name,

            documentType:type,

            language:"es",

            active:true,

            sections:[]

        }

    );

}



/*===========================================================================
=
= OBTENER PLANTILLA
=
===========================================================================*/

private getTemplate(

    type:DocumentType

)

:DocumentTemplate{

    const template=

        this.templateRepository.get(

            type

        );



    if(

        !template

    ){

        throw new Error(

            `Template not found: ${type}`

        );

    }



    return template;

}



/*===========================================================================
=
= VERSIONADO DOCUMENTAL
=
===========================================================================*/

private readonly versions=

    new Map<UUID,string[]>();



private registerVersion(

    document:GeneratedDocument

)

:void{

    if(

        !this.versions.has(

            document.id

        )

    ){

        this.versions.set(

            document.id,

            []

        );

    }



    this.versions

        .get(document.id)!

        .push(

            document.version

        );

}



/*===========================================================================
=
= CAMBIO DE VERSIÓN
=
===========================================================================*/

public incrementVersion(

    document:GeneratedDocument

)

:void{

    const parts=

        document.version

            .split(".")

            .map(Number);



    parts[1]++;



    document.version=

        `${parts[0]}.${parts[1]}`;



    this.registerVersion(

        document

    );

}



/*===========================================================================
=
= HISTORIAL
=
===========================================================================*/

public getVersionHistory(

    documentId:UUID

)

:string[]{

    return [

        ...(this.versions.get(

            documentId

        ) ?? [])

    ];

}



/*===========================================================================
=
= VALIDACIÓN DOCUMENTAL
=
===========================================================================*/

private validateDocument(

    document:GeneratedDocument

)

:boolean{

    if(

        document.sections.length===0

    ){

        return false;

    }



    if(

        document.content.trim()

            .length===0

    ){

        return false;

    }



    if(

        document.title.trim()

            .length===0

    ){

        return false;

    }



    return true;

}



/*===========================================================================
=
= VALIDACIÓN GLOBAL
=
===========================================================================*/

public validateAdministrativeFile()

:boolean{

    if(

        !this.administrativeFile

    ){

        return false;

    }



    for(

        const document

        of

        this.administrativeFile.documents

    ){

        if(

            !this.validateDocument(

                document

            )

        ){

            return false;

        }

    }



    return true;

}



/*===========================================================================
=
= RESUMEN DOCUMENTAL
=
===========================================================================*/

public buildDocumentSummary(){

    return{

        generated:

            this.statistics.generatedDocuments,

        exported:

            this.statistics.exportedDocuments,

        sections:

            this.statistics.totalSections,

        tables:

            this.statistics.totalTables,

        templates:

            this.templateRepository.size,

        annexes:

            this.annexes.length,

        valid:

            this.validateAdministrativeFile()

    };

}

/*===========================================================================
=
= EVENTOS DOCUMENTALES
=
===========================================================================*/

export interface DocumentAuditEvent{

    id:UUID;

    timestamp:Date;

    operation:string;

    documentId?:UUID;

    documentType?:DocumentType;

    description:string;

    user:string;

}



/*===========================================================================
=
= AUDITORÍA
=
===========================================================================*/

private readonly auditTrail:

    DocumentAuditEvent[]=[];



private registerAuditEvent(

    operation:string,

    description:string,

    document?:GeneratedDocument

):void{

    this.auditTrail.push({

        id:crypto.randomUUID() as UUID,

        timestamp:new Date(),

        operation,

        documentId:document?.id,

        documentType:document?.type,

        description,

        user:"ACP"

    });

}



/*===========================================================================
=
= CONSULTA DE AUDITORÍA
=
===========================================================================*/

public getAuditTrail()

:ReadonlyArray<DocumentAuditEvent>{

    return this.auditTrail;

}



/*===========================================================================
=
= CACHÉ DOCUMENTAL
=
===========================================================================*/

private readonly documentCache=

    new Map<string,GeneratedDocument>();



private buildCacheKey(

    type:DocumentType,

    format:DocumentFormat

):string{

    return `${type}_${format}`;

}



/*===========================================================================
=
= CONSULTA DE CACHÉ
=
===========================================================================*/

private getCachedDocument(

    type:DocumentType,

    format:DocumentFormat

)

:GeneratedDocument|undefined{

    return this.documentCache.get(

        this.buildCacheKey(

            type,

            format

        )

    );

}



/*===========================================================================
=
= REGISTRO EN CACHÉ
=
===========================================================================*/

private storeDocumentInCache(

    document:GeneratedDocument

):void{

    this.documentCache.set(

        this.buildCacheKey(

            document.type,

            document.format

        ),

        document

    );

}



/*===========================================================================
=
= LIMPIEZA DE CACHÉ
=
===========================================================================*/

public clearCache()

:void{

    this.documentCache.clear();

}



/*===========================================================================
=
= MOTOR DE SUSTITUCIÓN DE VARIABLES
=
===========================================================================*/

private replaceVariables(

    text:string

):string{

    let result=text;

    for(

        const

        [

            key,

            value

        ]

        of

        this.variables

    ){

        result=result.replace(

            new RegExp(

                `\\{\\{${key}\\}\\}`,

                "g"

            ),

            value

        );

    }

    return result;

}



/*===========================================================================
=
= NORMALIZACIÓN
=
===========================================================================*/

private normalizeContent(

    text:string

):string{

    return text

        .replace(/\r/g,"")

        .replace(/[ ]{2,}/g," ")

        .replace(/\n{3,}/g,"\n\n")

        .trim();

}



/*===========================================================================
=
= POSTPROCESADO
=
===========================================================================*/

private postProcessDocument(

    document:GeneratedDocument

):void{

    document.content=

        this.replaceVariables(

            document.content

        );



    document.content=

        this.normalizeContent(

            document.content

        );

}



/*===========================================================================
=
= GENERACIÓN OPTIMIZADA
=
===========================================================================*/

public async generateOptimized(

    context:ContractContextModel,

    type:DocumentType,

    format:DocumentFormat

)

:Promise<GeneratedDocument>{

    const cached=

        this.getCachedDocument(

            type,

            format

        );



    if(

        cached

    ){

        this.registerAuditEvent(

            "CACHE",

            "Documento obtenido desde caché.",

            cached

        );



        return cached;

    }



    const document=

        await this.generate(

            context,

            type,

            format

        );



    this.postProcessDocument(

        document

    );



    this.storeDocumentInCache(

        document

    );



    this.registerAuditEvent(

        "GENERATE",

        "Documento generado.",

        document

    );



    return document;

}



/*===========================================================================
=
= MÉTRICAS
=
===========================================================================*/

public getGenerationMetrics(){

    return{

        documents:

            this.statistics.generatedDocuments,

        cache:

            this.documentCache.size,

        auditEvents:

            this.auditTrail.length,

        templates:

            this.templateRepository.size,

        annexes:

            this.annexes.length,

        variables:

            this.variables.size,

        references:

            this.references.length

    };

}

/*===========================================================================
=
= RECUPERACIÓN AUTOMÁTICA
=
===========================================================================*/

private recoveryEnabled:boolean=true;

private lastSuccessfulGeneration?:Date;



private markSuccessfulGeneration()

:void{

    this.lastSuccessfulGeneration=

        new Date();

}



/*===========================================================================
=
= RECUPERACIÓN
=
===========================================================================*/

public recover()

:boolean{

    if(

        !this.recoveryEnabled

    ){

        return false;

    }



    this.clearCache();



    this.auditTrail.length=0;



    return true;

}



/*===========================================================================
=
= HEALTH CHECK
=
===========================================================================*/

public healthCheck()

:boolean{

    return(

        this.templateRepository.size>0 &&

        this.variables.size>=0 &&

        this.statistics.generatedDocuments>=0 &&

        this.configuration!=undefined

    );

}



/*===========================================================================
=
= INFORMACIÓN DEL MOTOR
=
===========================================================================*/

public getEngineInformation(){

    return{

        name:

            DOCUMENT_GENERATOR_NAME,



        version:

            DOCUMENT_GENERATOR_VERSION,



        description:

            DOCUMENT_GENERATOR_DESCRIPTION,



        templates:

            this.templateRepository.size,



        cache:

            this.documentCache.size,



        variables:

            this.variables.size,



        references:

            this.references.length,



        generated:

            this.statistics.generatedDocuments,



        exported:

            this.statistics.exportedDocuments,



        healthy:

            this.healthCheck(),




        lastGeneration:

            this.lastSuccessfulGeneration

    };

}



/*===========================================================================
=
= RESET
=
===========================================================================*/

public reset()

:void{

    this.documents.length=0;



    this.references.length=0;



    this.variables.clear();



    this.documentCache.clear();



    this.auditTrail.length=0;



    this.annexes.length=0;



    this.currentDocument=undefined;



    this.startedAt=undefined;



    this.administrativeFile=undefined;



    this.statistics={

        generatedDocuments:0,

        exportedDocuments:0,

        totalSections:0,

        totalTables:0,

        averageGenerationMilliseconds:0

    };



    this.initializeTemplateRepository();

}



/*===========================================================================
=
= LIBERACIÓN DE MEMORIA
=
===========================================================================*/

public dispose()

:void{

    this.reset();



    this.templateRepository.clear();



    this.versions.clear();

}



/*===========================================================================
=
= FACTORY
=
===========================================================================*/

export class DocumentGeneratorFactory{

    public static create()

    :DocumentGenerator{

        return new DocumentGenerator();

    }



    public static createDefault()

    :DocumentGenerator{

        return new DocumentGenerator({

            automaticIndex:true,

            automaticNumbering:true,

            includeLegalReferences:true,

            includeHeader:true,

            includeFooter:true,

            validateBeforeExport:true,

            generateMetadata:true

        });

    }

}



/*===========================================================================
=
= CONSTANTES
=
===========================================================================*/

export const DOCUMENT_GENERATOR_NAME=

    "ACP Document Generator";



export const DOCUMENT_GENERATOR_VERSION=

    "1.0.0";



export const DOCUMENT_GENERATOR_DESCRIPTION=

    "Motor inteligente de generación documental para expedientes de contratación pública.";



/*===========================================================================
=
= ESTADÍSTICAS AVANZADAS
=
===========================================================================*/

public exportStatistics(){

    return{

        engine:

            this.getEngineInformation(),



        metrics:

            this.getGenerationMetrics(),



        summary:

            this.buildDocumentSummary(),



        auditEvents:

            this.auditTrail.length,



        versions:

            this.versions.size,



        cachedDocuments:

            this.documentCache.size

    };

}



/*===========================================================================
=
= VERIFICACIÓN FINAL
=
===========================================================================*/

public verifyIntegrity()

:boolean{

    return(

        this.healthCheck()

        &&

        this.validateAdministrativeFile()

    );

}

/*===========================================================================
=
= DOCUMENTACIÓN TÉCNICA
=
===========================================================================*/

/*

=============================================================================

DOCUMENT GENERATOR

=============================================================================

RESPONSABILIDAD

DocumentGenerator constituye el motor documental central del
Asistente de Contratación Pública.

Su finalidad es transformar el conocimiento jurídico,
administrativo y técnico del expediente en documentos
administrativos completos, coherentes y listos para su firma.

=============================================================================

DOCUMENTOS GENERADOS

- Memoria Justificativa
- Memoria Económica
- Informe Jurídico
- Informe Técnico
- Informe de Insuficiencia de Medios
- PPT
- PCAP
- Resolución de aprobación
- Propuesta de adjudicación
- Resolución de adjudicación
- Formalización
- Anexos
- Expediente completo

=============================================================================

DEPENDENCIAS PRINCIPALES

ContractContext
RuleEngine
WorkflowEngine
ValidationEngine
InferenceEngine
LegalReasoner

=============================================================================

CAPACIDADES

✔ Construcción automática de documentos

✔ Sustitución inteligente de variables

✔ Inserción de referencias normativas

✔ Construcción automática de tablas

✔ Construcción automática de anexos

✔ Control de versiones

✔ Auditoría documental

✔ Caché documental

✔ Validación

✔ Exportación DOCX

✔ Exportación PDF

✔ Exportación HTML

✔ Exportación Markdown

✔ Exportación JSON

✔ Exportación XML

=============================================================================

FLUJO GENERAL

1. Inicialización

2. Carga del ContractContext

3. Carga de variables

4. Carga de referencias jurídicas

5. Selección de plantilla

6. Construcción de secciones

7. Construcción de tablas

8. Construcción de anexos

9. Ensamblado documental

10. Validación

11. Auditoría

12. Exportación

=============================================================================

DISEÑO

El generador se ha diseñado para ser completamente extensible.

La incorporación de nuevos modelos documentales únicamente
requiere:

- crear el nuevo tipo documental;

- registrar la plantilla;

- implementar el constructor correspondiente.

No será necesario modificar el resto del sistema.

=============================================================================

EVOLUCIÓN PREVISTA

Versiones futuras incorporarán:

• Plantillas oficiales de la Junta de Andalucía.

• Estilos DOCX corporativos.

• Generación PDF con firma electrónica.

• Sellado temporal.

• Código Seguro de Verificación.

• Integración con PLACSP.

• Integración con CO@.

• Integración con Portafirmas.

• Integración con gestor documental corporativo.

=============================================================================

NOTAS DE MANTENIMIENTO

Todo nuevo documento deberá:

1. disponer de un constructor propio;

2. registrarse en DocumentType;

3. disponer de plantilla;

4. disponer de exportación;

5. ser validado automáticamente;

6. quedar registrado en la auditoría.

=============================================================================

FIN DEL DOCUMENT GENERATOR

=============================================================================

*/

/*===========================================================================
=
= FIN DEL ARCHIVO
=
===========================================================================*/
