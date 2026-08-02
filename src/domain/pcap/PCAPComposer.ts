/******************************************************************************************
 *
 * CONTRATA-IA
 *
 * PCAP COMPOSER
 *
 * ----------------------------------------------------------------------------
 * RESPONSABILIDAD
 * ----------------------------------------------------------------------------
 *
 * Este componente construye íntegramente el Pliego de Cláusulas
 * Administrativas Particulares utilizando el Document Composer Framework.
 *
 * NO contiene reglas jurídicas.
 *
 * Las reglas jurídicas pertenecen al RuleEngine y a los motores
 * especializados (LCSP, CPV, Procedimiento, Solvencia, etc.).
 *
 * Este componente únicamente organiza y compone el documento.
 *
 ******************************************************************************************/

import {

    DocumentSection,

    DocumentAnnex,

    SectionType

} from "../document-composer/types";

import { SectionComposer }

from "../document-composer/SectionComposer";

import { AnnexComposer }

from "../document-composer/AnnexComposer";

import { NumberingEngine }

from "../document-composer/NumberingEngine";



/******************************************************************************
 *
 * INTERFACES
 *
 *****************************************************************************/

export interface PCAPComposerContext {

    expediente: any;

    reglas: any;

    opciones?: any;

}

export interface PCAPDocument {

    sections: DocumentSection[];

    annexes: DocumentAnnex[];

}



/******************************************************************************
 *
 * PCAP COMPOSER
 *
 *****************************************************************************/

export class PCAPComposer {

    /**************************************************************************
     *
     * COMPONENTES
     *
     *************************************************************************/

    private readonly sections =

        new SectionComposer();

    private readonly annexes =

        new AnnexComposer();

    private readonly numbering =

        new NumberingEngine();



    /**************************************************************************
     *
     * CONTEXTO
     *
     *************************************************************************/

    private expediente: any;

    private reglas: any;

    private opciones: any;



    /**************************************************************************
     *
     * CONSTRUCTOR
     *
     *************************************************************************/

    constructor(

        private readonly context: PCAPComposerContext

    ) {

        this.expediente = context.expediente;

        this.reglas = context.reglas;

        this.opciones = context.opciones ?? {};

    }



    /**************************************************************************
     *
     * MÉTODO PRINCIPAL
     *
     *************************************************************************/

    public compose(): PCAPDocument {

        this.reset();

        this.composeCover();

        this.composeIndex();

        this.composeObject();

        this.composeLegalFramework();

        this.composeNeed();

        this.composeProcedure();

        this.composeBudget();

        this.composeLots();

        this.composeDuration();

        this.composeCPV();

        this.composeExecutionPlace();

        this.composeContractManager();

        return {

            sections:

                this.sections.build(),

            annexes:

                this.annexes.build()

        };

    }



    /**************************************************************************
     *
     * RESET
     *
     *************************************************************************/

    private reset(): void {

        this.sections.clear();

        this.annexes.clear();

        this.numbering.reset();

    }



    /**************************************************************************
     *
     * CAPÍTULO 1
     *
     * PORTADA
     *
     *************************************************************************/

    private composeCover(): void {

        this.sections.title(

            1,

            "PLIEGO DE CLÁUSULAS ADMINISTRATIVAS PARTICULARES"

        );



        this.sections.paragraph(

            2,

            "EXPEDIENTE",

            this.expediente.identificacion?.codigo ??

            ""

        );



        this.sections.paragraph(

            3,

            "ÓRGANO DE CONTRATACIÓN",

            this.expediente.identificacion

                ?.organoContratacion ??

            ""

        );



        this.sections.paragraph(

            4,

            "UNIDAD PROMOTORA",

            this.expediente.identificacion

                ?.unidadPromotora ??

            ""

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 2
     *
     * ÍNDICE
     *
     *************************************************************************/

    private composeIndex(): void {

        this.sections.add({

            id: crypto.randomUUID(),

            order: 10,

            title: "ÍNDICE",

            type: SectionType.TABLE,

            visible: true,

            content: []

        });

    }



    /**************************************************************************
     *
     * CAPÍTULO 3
     *
     * OBJETO DEL CONTRATO
     *
     *************************************************************************/

    private composeObject(): void {

        this.sections.paragraph(

            20,

            "OBJETO DEL CONTRATO",

            this.expediente.objeto

                ?.descripcion ??

            ""

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 4
     *
     * RÉGIMEN JURÍDICO
     *
     *************************************************************************/

    private composeLegalFramework(): void {

        this.sections.paragraph(

            30,

            "RÉGIMEN JURÍDICO",

            ""

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 5
     *
     * NECESIDAD
     *
     *************************************************************************/

    private composeNeed(): void {

        this.sections.paragraph(

            40,

            "NECESIDAD",

            this.expediente.necesidad

                ?.descripcion ??

            ""

        );

    }

    /**************************************************************************
     *
     * CAPÍTULO 6
     *
     * PROCEDIMIENTO DE ADJUDICACIÓN
     *
     *************************************************************************/

    private composeProcedure(): void {

        this.sections.paragraph(

            50,

            "PROCEDIMIENTO DE ADJUDICACIÓN",

            this.reglas?.procedimiento?.descripcion ??

            ""

        );



        this.sections.list(

            51,

            "CARACTERÍSTICAS DEL PROCEDIMIENTO",

            [

                `Tipo: ${this.reglas?.procedimiento?.tipo ?? ""}`,

                `Tramitación: ${this.reglas?.procedimiento?.tramitacion ?? ""}`,

                `Regulación armonizada: ${this.reglas?.procedimiento?.sar ?? ""}`,

                `Publicidad: ${this.reglas?.procedimiento?.publicidad ?? ""}`

            ]

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 7
     *
     * PRESUPUESTO BASE DE LICITACIÓN
     *
     *************************************************************************/

    private composeBudget(): void {

        this.sections.paragraph(

            60,

            "PRESUPUESTO BASE DE LICITACIÓN",

            ""

        );



        this.sections.table(

            61,

            "DESGLOSE ECONÓMICO",

            [

                {

                    concepto: "Importe sin IVA",

                    importe:

                        this.expediente.presupuesto

                            ?.importeSinIVA

                },

                {

                    concepto: "IVA",

                    importe:

                        this.expediente.presupuesto

                            ?.iva

                },

                {

                    concepto: "Importe total",

                    importe:

                        this.expediente.presupuesto

                            ?.importeTotal

                }

            ]

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 8
     *
     * DIVISIÓN EN LOTES
     *
     *************************************************************************/

    private composeLots(): void {

        this.sections.paragraph(

            70,

            "DIVISIÓN EN LOTES",

            this.expediente.lotes

                ?.justificacion ??

            ""

        );



        if (

            Array.isArray(

                this.expediente.lotes?.lista

            )

        ) {

            this.sections.table(

                71,

                "LOTES",

                this.expediente.lotes.lista

            );

        }

    }



    /**************************************************************************
     *
     * CAPÍTULO 9
     *
     * DURACIÓN DEL CONTRATO
     *
     *************************************************************************/

    private composeDuration(): void {

        this.sections.paragraph(

            80,

            "PLAZO DE EJECUCIÓN",

            ""

        );



        this.sections.list(

            81,

            "DURACIÓN",

            [

                `Duración inicial: ${this.expediente.plazos?.duracion ?? ""}`,

                `Prórrogas: ${this.expediente.plazos?.prorrogas ?? ""}`,

                `Plazo máximo: ${this.expediente.plazos?.maximo ?? ""}`

            ]

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 10
     *
     * CPV
     *
     *************************************************************************/

    private composeCPV(): void {

        if (

            !Array.isArray(

                this.expediente.cpv

            )

        ) {

            return;

        }



        this.sections.table(

            90,

            "CÓDIGOS CPV",

            this.expediente.cpv

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 11
     *
     * LUGAR DE EJECUCIÓN
     *
     *************************************************************************/

    private composeExecutionPlace(): void {

        this.sections.paragraph(

            100,

            "LUGAR DE EJECUCIÓN",

            this.expediente.ejecucion

                ?.lugar ??

            ""

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 12
     *
     * RESPONSABLE DEL CONTRATO
     *
     *************************************************************************/

    private composeContractManager(): void {

        this.sections.paragraph(

            110,

            "RESPONSABLE DEL CONTRATO",

            this.expediente.identificacion

                ?.responsableContrato ??

            ""

        );

    }

    /**************************************************************************
     *
     * CAPÍTULO 13
     *
     * CAPACIDAD PARA CONTRATAR
     *
     *************************************************************************/

    private composeCapacity(): void {

        this.sections.paragraph(

            120,

            "CAPACIDAD PARA CONTRATAR",

            ""

        );

        this.sections.list(

            121,

            "REQUISITOS",

            this.reglas.capacidad?.requisitos ?? []

        );

        this.sections.paragraph(

            122,

            "PROHIBICIONES DE CONTRATAR",

            this.reglas.capacidad

                ?.prohibiciones ??

            ""

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 14
     *
     * SOLVENCIA ECONÓMICA
     *
     *************************************************************************/

    private composeEconomicSolvency(): void {

        this.sections.paragraph(

            130,

            "SOLVENCIA ECONÓMICA Y FINANCIERA",

            ""

        );

        this.sections.table(

            131,

            "REQUISITOS",

            this.reglas.solvencia

                ?.economica ??

            []

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 15
     *
     * SOLVENCIA TÉCNICA
     *
     *************************************************************************/

    private composeTechnicalSolvency(): void {

        this.sections.paragraph(

            140,

            "SOLVENCIA TÉCNICA Y PROFESIONAL",

            ""

        );

        this.sections.table(

            141,

            "REQUISITOS",

            this.reglas.solvencia

                ?.tecnica ??

            []

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 16
     *
     * CLASIFICACIÓN EMPRESARIAL
     *
     *************************************************************************/

    private composeClassification(): void {

        if (

            !this.reglas.clasificacion

        ) {

            return;

        }

        this.sections.paragraph(

            150,

            "CLASIFICACIÓN",

            this.reglas.clasificacion

                ?.descripcion ??

            ""

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 17
     *
     * GARANTÍA PROVISIONAL
     *
     *************************************************************************/

    private composeTemporaryGuarantee(): void {

        this.sections.paragraph(

            160,

            "GARANTÍA PROVISIONAL",

            this.reglas.garantias

                ?.provisional ??

            ""

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 18
     *
     * GARANTÍA DEFINITIVA
     *
     *************************************************************************/

    private composeDefinitiveGuarantee(): void {

        this.sections.paragraph(

            170,

            "GARANTÍA DEFINITIVA",

            this.reglas.garantias

                ?.definitiva ??

            ""

        );

        this.sections.list(

            171,

            "CONDICIONES",

            this.reglas.garantias

                ?.condiciones ??

            []

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 19
     *
     * CRITERIOS DE ADJUDICACIÓN
     *
     *************************************************************************/

    private composeAwardCriteria(): void {

        this.sections.paragraph(

            180,

            "CRITERIOS DE ADJUDICACIÓN",

            ""

        );

        this.sections.table(

            181,

            "CRITERIOS",

            this.reglas.criterios

                ?.criterios ??

            []

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 20
     *
     * FÓRMULAS DE VALORACIÓN
     *
     *************************************************************************/

    private composeScoringFormula(): void {

        this.sections.paragraph(

            190,

            "FÓRMULAS DE VALORACIÓN",

            ""

        );

        this.sections.table(

            191,

            "FÓRMULAS",

            this.reglas.criterios

                ?.formulas ??

            []

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 21
     *
     * OFERTAS ANORMALMENTE BAJAS
     *
     *************************************************************************/

    private composeAbnormalOffers(): void {

        this.sections.paragraph(

            200,

            "OFERTAS ANORMALMENTE BAJAS",

            this.reglas.criterios

                ?.anormalmenteBajas ??

            ""

        );

    }

      /**************************************************************************
     *
     * CAPÍTULO 22
     *
     * CONDICIONES ESPECIALES DE EJECUCIÓN
     *
     *************************************************************************/

    private composeSpecialExecutionConditions(): void {

        this.sections.paragraph(

            210,

            "CONDICIONES ESPECIALES DE EJECUCIÓN",

            ""

        );

        this.sections.table(

            211,

            "CONDICIONES",

            this.reglas.ejecucion

                ?.condiciones ??

            []

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 23
     *
     * OBLIGACIONES ESENCIALES
     *
     *************************************************************************/

    private composeEssentialObligations(): void {

        this.sections.paragraph(

            220,

            "OBLIGACIONES ESENCIALES",

            ""

        );

        this.sections.list(

            221,

            "OBLIGACIONES",

            this.reglas.ejecucion

                ?.obligaciones ??

            []

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 24
     *
     * OBLIGACIONES MEDIOAMBIENTALES
     *
     *************************************************************************/

    private composeEnvironmentalConditions(): void {

        this.sections.paragraph(

            230,

            "CONDICIONES MEDIOAMBIENTALES",

            ""

        );

        this.sections.list(

            231,

            "MEDIDAS",

            this.reglas.medioAmbiente

                ?.condiciones ??

            []

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 25
     *
     * CONDICIONES SOCIALES
     *
     *************************************************************************/

    private composeSocialConditions(): void {

        this.sections.paragraph(

            240,

            "CONDICIONES SOCIALES",

            ""

        );

        this.sections.list(

            241,

            "MEDIDAS",

            this.reglas.sociales

                ?.condiciones ??

            []

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 26
     *
     * PENALIDADES
     *
     *************************************************************************/

    private composePenalties(): void {

        this.sections.paragraph(

            250,

            "PENALIDADES",

            ""

        );

        this.sections.table(

            251,

            "RÉGIMEN DE PENALIDADES",

            this.reglas.penalidades

                ?.tabla ??

            []

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 27
     *
     * MODIFICACIÓN DEL CONTRATO
     *
     *************************************************************************/

    private composeContractModifications(): void {

        this.sections.paragraph(

            260,

            "MODIFICACIÓN DEL CONTRATO",

            this.reglas.modificaciones

                ?.descripcion ??

            ""

        );

        this.sections.list(

            261,

            "SUPUESTOS",

            this.reglas.modificaciones

                ?.supuestos ??

            []

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 28
     *
     * SUBCONTRATACIÓN
     *
     *************************************************************************/

    private composeSubcontracting(): void {

        this.sections.paragraph(

            270,

            "SUBCONTRATACIÓN",

            this.reglas.subcontratacion

                ?.descripcion ??

            ""

        );

        this.sections.list(

            271,

            "LIMITACIONES",

            this.reglas.subcontratacion

                ?.limitaciones ??

            []

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 29
     *
     * CESIÓN DEL CONTRATO
     *
     *************************************************************************/

    private composeAssignment(): void {

        this.sections.paragraph(

            280,

            "CESIÓN DEL CONTRATO",

            this.reglas.cesion

                ?.descripcion ??

            ""

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 30
     *
     * CONFIDENCIALIDAD
     *
     *************************************************************************/

    private composeConfidentiality(): void {

        this.sections.paragraph(

            290,

            "CONFIDENCIALIDAD",

            this.reglas.confidencialidad

                ?.descripcion ??

            ""

        );

    }

    /**************************************************************************
     *
     * CAPÍTULO 31
     *
     * PROTECCIÓN DE DATOS
     *
     *************************************************************************/

    private composeDataProtection(): void {

        this.sections.paragraph(

            300,

            "PROTECCIÓN DE DATOS",

            this.reglas.proteccionDatos

                ?.descripcion ??

            ""

        );

        this.sections.list(

            301,

            "OBLIGACIONES",

            this.reglas.proteccionDatos

                ?.obligaciones ??

            []

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 32
     *
     * PROPIEDAD INTELECTUAL
     *
     *************************************************************************/

    private composeIntellectualProperty(): void {

        this.sections.paragraph(

            310,

            "PROPIEDAD INTELECTUAL",

            this.reglas.propiedadIntelectual

                ?.descripcion ??

            ""

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 33
     *
     * FACTURACIÓN
     *
     *************************************************************************/

    private composeBilling(): void {

        this.sections.paragraph(

            320,

            "FACTURACIÓN",

            this.reglas.facturacion

                ?.descripcion ??

            ""

        );

        this.sections.list(

            321,

            "REQUISITOS",

            this.reglas.facturacion

                ?.requisitos ??

            []

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 34
     *
     * PAGO DEL CONTRATO
     *
     *************************************************************************/

    private composePayments(): void {

        this.sections.paragraph(

            330,

            "PAGO DEL CONTRATO",

            this.reglas.pago

                ?.descripcion ??

            ""

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 35
     *
     * RECEPCIÓN
     *
     *************************************************************************/

    private composeReception(): void {

        this.sections.paragraph(

            340,

            "RECEPCIÓN DEL CONTRATO",

            this.reglas.recepcion

                ?.descripcion ??

            ""

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 36
     *
     * LIQUIDACIÓN
     *
     *************************************************************************/

    private composeLiquidation(): void {

        this.sections.paragraph(

            350,

            "LIQUIDACIÓN",

            this.reglas.liquidacion

                ?.descripcion ??

            ""

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 37
     *
     * RESOLUCIÓN
     *
     *************************************************************************/

    private composeTermination(): void {

        this.sections.paragraph(

            360,

            "RESOLUCIÓN DEL CONTRATO",

            this.reglas.resolucion

                ?.descripcion ??

            ""

        );

        this.sections.list(

            361,

            "CAUSAS",

            this.reglas.resolucion

                ?.causas ??

            []

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 38
     *
     * RECURSOS
     *
     *************************************************************************/

    private composeAppeals(): void {

        this.sections.paragraph(

            370,

            "RÉGIMEN DE RECURSOS",

            this.reglas.recursos

                ?.descripcion ??

            ""

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 39
     *
     * NOTIFICACIONES
     *
     *************************************************************************/

    private composeNotifications(): void {

        this.sections.paragraph(

            380,

            "NOTIFICACIONES",

            this.reglas.notificaciones

                ?.descripcion ??

            ""

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 40
     *
     * JURISDICCIÓN
     *
     *************************************************************************/

    private composeJurisdiction(): void {

        this.sections.paragraph(

            390,

            "JURISDICCIÓN COMPETENTE",

            this.reglas.jurisdiccion

                ?.descripcion ??

            ""

        );

    }

      /**************************************************************************
     *
     * CAPÍTULO 41
     *
     * CONSTRUCCIÓN AUTOMÁTICA DEL ÍNDICE
     *
     *************************************************************************/

    private rebuildIndex(): void {

        const index: any[] = [];

        this.sections.build().forEach(section => {

            if (

                section.type === SectionType.TITLE ||

                section.type === SectionType.PARAGRAPH

            ) {

                index.push({

                    numero: this.numbering.preview(1),

                    titulo: section.title

                });

            }

        });

        this.sections.replaceContent(

            "ÍNDICE",

            index

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 42
     *
     * NUMERACIÓN AUTOMÁTICA
     *
     *************************************************************************/

    private applyNumbering(): void {

        const sections = this.sections.build();

        this.numbering.reset();

        sections.forEach(section => {

            section.number = this.numbering.next(

                section.level ?? 1

            );

        });

    }



    /**************************************************************************
     *
     * CAPÍTULO 43
     *
     * CONSTRUCCIÓN DE ANEXOS
     *
     *************************************************************************/

    private composeAnnexes(): void {

        this.composeEconomicAnnex();

        this.composeCPVAnnex();

        this.composeCriteriaAnnex();

        this.composeDeclarationAnnex();

    }



    /**************************************************************************
     *
     * ANEXO
     *
     * PRESUPUESTO
     *
     *************************************************************************/

    private composeEconomicAnnex(): void {

        this.annexes.table(

            "ANEXO I. PRESUPUESTO",

            this.expediente.presupuesto

                ?.desglose ??

            []

        );

    }



    /**************************************************************************
     *
     * ANEXO
     *
     * CPV
     *
     *************************************************************************/

    private composeCPVAnnex(): void {

        this.annexes.table(

            "ANEXO II. CÓDIGOS CPV",

            this.expediente.cpv ??

            []

        );

    }



    /**************************************************************************
     *
     * ANEXO
     *
     * CRITERIOS
     *
     *************************************************************************/

    private composeCriteriaAnnex(): void {

        this.annexes.table(

            "ANEXO III. CRITERIOS",

            this.reglas.criterios

                ?.criterios ??

            []

        );

    }



    /**************************************************************************
     *
     * ANEXO
     *
     * DECLARACIÓN RESPONSABLE
     *
     *************************************************************************/

    private composeDeclarationAnnex(): void {

        this.annexes.document(

            "ANEXO IV. DECLARACIÓN RESPONSABLE",

            this.reglas.modelos

                ?.declaracionResponsable ??

            {}

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 44
     *
     * VALIDACIÓN INTERNA
     *
     *************************************************************************/

    private validateComposition(): void {

        if (

            this.sections.count() === 0

        ) {

            throw new Error(

                "El PCAP no contiene secciones."

            );

        }

        if (

            this.annexes.count() === 0

        ) {

            console.warn(

                "El PCAP no contiene anexos."

            );

        }

    }



    /**************************************************************************
     *
     * CAPÍTULO 45
     *
     * ENSAMBLADO FINAL
     *
     *************************************************************************/

    private finish(): void {

        this.applyNumbering();

        this.rebuildIndex();

        this.composeAnnexes();

        this.validateComposition();

    }

      /**************************************************************************
     *
     * CAPÍTULO 46
     *
     * PIPELINE DE COMPOSICIÓN
     *
     *************************************************************************/

    private readonly pipeline: Array<() => void> = [

        () => this.composeCover(),

        () => this.composeIndex(),

        () => this.composeObject(),

        () => this.composeLegalFramework(),

        () => this.composeNeed(),

        () => this.composeProcedure(),

        () => this.composeBudget(),

        () => this.composeLots(),

        () => this.composeDuration(),

        () => this.composeCPV(),

        () => this.composeExecutionPlace(),

        () => this.composeContractManager(),

        () => this.composeCapacity(),

        () => this.composeEconomicSolvency(),

        () => this.composeTechnicalSolvency(),

        () => this.composeClassification(),

        () => this.composeTemporaryGuarantee(),

        () => this.composeDefinitiveGuarantee(),

        () => this.composeAwardCriteria(),

        () => this.composeScoringFormula(),

        () => this.composeAbnormalOffers(),

        () => this.composeSpecialExecutionConditions(),

        () => this.composeEssentialObligations(),

        () => this.composeEnvironmentalConditions(),

        () => this.composeSocialConditions(),

        () => this.composePenalties(),

        () => this.composeContractModifications(),

        () => this.composeSubcontracting(),

        () => this.composeAssignment(),

        () => this.composeConfidentiality(),

        () => this.composeDataProtection(),

        () => this.composeIntellectualProperty(),

        () => this.composeBilling(),

        () => this.composePayments(),

        () => this.composeReception(),

        () => this.composeLiquidation(),

        () => this.composeTermination(),

        () => this.composeAppeals(),

        () => this.composeNotifications(),

        () => this.composeJurisdiction()

    ];



    /**************************************************************************
     *
     * EJECUCIÓN DEL PIPELINE
     *
     *************************************************************************/

    private executePipeline(): void {

        this.pipeline.forEach(step => {

            step();

        });

    }



    /**************************************************************************
     *
     * FILTRO DE ETAPAS
     *
     *************************************************************************/

    private executeFilteredPipeline(

        filter: (

            step: () => void,

            index: number

        ) => boolean

    ): void {

        this.pipeline

            .filter(filter)

            .forEach(step => step());

    }



    /**************************************************************************
     *
     * CAPÍTULO 47
     *
     * APLICACIÓN DE REGLAS
     *
     *************************************************************************/

    private applyRules(): void {

        if (

            !this.reglas

        ) {

            return;

        }

        this.applyVisibilityRules();

        this.applyOptionalRules();

    }



    /**************************************************************************
     *
     * VISIBILIDAD
     *
     *************************************************************************/

    private applyVisibilityRules(): void {

        this.sections.build().forEach(section => {

            if (

                this.reglas.visibilidad?.[section.id]

                === false

            ) {

                section.visible = false;

            }

        });

    }



    /**************************************************************************
     *
     * CAPÍTULO OPCIONAL
     *
     *************************************************************************/

    private applyOptionalRules(): void {

        this.sections.build().forEach(section => {

            if (

                this.reglas.opcional?.includes(

                    section.id

                )

            ) {

                section.optional = true;

            }

        });

    }



    /**************************************************************************
     *
     * CAPÍTULO 48
     *
     * ESTADÍSTICAS
     *
     *************************************************************************/

    public statistics() {

        return {

            sections:

                this.sections.count(),

            annexes:

                this.annexes.count(),

            visible:

                this.sections

                    .build()

                    .filter(s => s.visible)

                    .length,

            hidden:

                this.sections

                    .build()

                    .filter(s => !s.visible)

                    .length

        };

    }



    /**************************************************************************
     *
     * CAPÍTULO 49
     *
     * DEPURACIÓN
     *
     *************************************************************************/

    public debug(): void {

        console.table(

            this.statistics()

        );

    }

      /**************************************************************************
     *
     * CAPÍTULO 50
     *
     * EXTENSIONES DEL COMPOSITOR
     *
     *************************************************************************/

    private readonly extensions:

        Array<(composer: PCAPComposer) => void> = [];



    /**
     * Registra una extensión.
     */

    public registerExtension(

        extension: (

            composer: PCAPComposer

        ) => void

    ): void {

        this.extensions.push(extension);

    }



    /**
     * Ejecuta todas las extensiones.
     */

    private executeExtensions(): void {

        this.extensions.forEach(

            extension =>

                extension(this)

        );

    }



    /**************************************************************************
     *
     * CAPÍTULO 51
     *
     * ETAPAS FINALES
     *
     *************************************************************************/

    private finalizeDocument(): void {

        this.executeExtensions();

        this.finish();

    }



    /**************************************************************************
     *
     * CAPÍTULO 52
     *
     * MÉTODOS AUXILIARES
     *
     *************************************************************************/

    protected hasValue(

        value: unknown

    ): boolean {

        if (

            value === null ||

            value === undefined

        ) {

            return false;

        }

        if (

            typeof value === "string"

        ) {

            return value.trim().length > 0;

        }

        if (

            Array.isArray(value)

        ) {

            return value.length > 0;

        }

        return true;

    }



    protected valueOrDefault<T>(

        value: T | undefined,

        defaultValue: T

    ): T {

        return value ?? defaultValue;

    }



    protected asArray<T>(

        value: T | T[] | undefined

    ): T[] {

        if (

            value === undefined ||

            value === null

        ) {

            return [];

        }

        if (

            Array.isArray(value)

        ) {

            return value;

        }

        return [value];

    }



    /**************************************************************************
     *
     * CAPÍTULO 53
     *
     * ACCESORES
     *
     *************************************************************************/

    public getSections() {

        return this.sections.build();

    }



    public getAnnexes() {

        return this.annexes.build();

    }



    public getExpediente() {

        return this.expediente;

    }



    public getRules() {

        return this.reglas;

    }



    /**************************************************************************
     *
     * CAPÍTULO 54
     *
     * REGENERACIÓN
     *
     *************************************************************************/

    public rebuild(): PCAPDocument {

        this.reset();

        this.executePipeline();

        this.applyRules();

        this.finalizeDocument();

        return {

            sections:

                this.sections.build(),

            annexes:

                this.annexes.build()

        };

    }



    /**************************************************************************
     *
     * CAPÍTULO 55
     *
     * EXPORTACIÓN INTERNA
     *
     *************************************************************************/

    public export() {

        return {

            metadata: {

                title:

                    "PCAP"

            },

            sections:

                this.sections.build(),

            annexes:

                this.annexes.build()

        };

    }

      /**************************************************************************
     *
     * CAPÍTULO 56
     *
     * INFORMACIÓN DEL COMPOSITOR
     *
     *************************************************************************/

    public info() {

        return {

            component: "PCAPComposer",

            version: "1.0.0",

            framework: "Document Composer Framework",

            sections: this.sections.count(),

            annexes: this.annexes.count(),

            pipelineSteps: this.pipeline.length

        };

    }



    /**************************************************************************
     *
     * CAPÍTULO 57
     *
     * COMPROBACIÓN DE INTEGRIDAD
     *
     *************************************************************************/

    public checkIntegrity(): boolean {

        if (this.sections.count() === 0) {

            return false;

        }

        if (this.pipeline.length === 0) {

            return false;

        }

        return true;

    }



    /**************************************************************************
     *
     * CAPÍTULO 58
     *
     * LIMPIEZA
     *
     *************************************************************************/

    public dispose(): void {

        this.sections.clear();

        this.annexes.clear();

        this.numbering.reset();

        this.extensions.length = 0;

    }



    /**************************************************************************
     *
     * CAPÍTULO 59
     *
     * PUNTOS DE EXTENSIÓN FUTUROS
     *
     *************************************************************************/

    /*
        TODO

        □ Integración con LCSP Engine

        □ Integración con CPV Engine

        □ Integración con Rule Engine v2

        □ Integración con Plantillas

        □ Integración con IA

        □ Integración con WordComposer

        □ Integración con PDFComposer

        □ Firma electrónica

        □ Versionado documental

        □ Histórico de modificaciones

        □ Comparador de versiones

    */



    /**************************************************************************
     *
     * CAPÍTULO 60
     *
     * FIN DEL COMPOSITOR
     *
     *************************************************************************/

}
  
