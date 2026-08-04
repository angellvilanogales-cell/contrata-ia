/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * PPTGenerator
 * ------------------------------------------------------------
 * Generador automático del
 * Pliego de Prescripciones Técnicas.
 *
 * El PPT describe técnicamente la prestación.
 *
 * ============================================================
 */

import { BaseDocumentGenerator } from "../BaseDocumentGenerator";
import { DocumentContext } from "../DocumentContext";
import { SectionBuilder } from "../SectionBuilder";
import { ParagraphBuilder } from "../ParagraphBuilder";
import { LegalCitationBuilder } from "../LegalCitationBuilder";

export class PPTGenerator extends BaseDocumentGenerator {

    private readonly sections =

        new SectionBuilder();

    private readonly paragraphs =

        new ParagraphBuilder();

    private readonly citations =

        new LegalCitationBuilder();

    constructor(

        context: DocumentContext

    ){

        super(context);

    }

    /**
     * =====================================================
     * Construcción completa del PPT
     * =====================================================
     */

    protected build(): void {

        this.buildHeader();

        this.buildObject();

        this.buildScope();

        this.buildTechnicalRequirements();

        this.buildExecutionConditions();

        this.buildQualityRequirements();

        this.buildDeliverables();

        this.buildAcceptance();

        this.buildLegalFramework();

        this.exportDocument();

    }

    /**
     * =====================================================
     * CABECERA
     * =====================================================
     */

    private buildHeader(): void {

        const p = new ParagraphBuilder();

        p.text(

            "PLIEGO DE PRESCRIPCIONES TÉCNICAS"

        );

        p.blank();

        p.text(

            `Objeto: ${this.context.request.contract.object}`

        );

        p.text(

            `CPV principal: ${this.context.cpv.principal}`

        );

        this.sections.section(

            "HEADER",

            "PLIEGO DE PRESCRIPCIONES TÉCNICAS",

            p.build(),

            false

        );

    }

    /**
     * =====================================================
     * OBJETO
     * =====================================================
     */

    private buildObject(): void {

        const p = new ParagraphBuilder();

        p.text(

            `El presente Pliego tiene por objeto definir las prescripciones técnicas mínimas que deberán cumplir las prestaciones objeto del contrato.`

        );

        p.blank();

        p.text(

            `La prestación consiste en ${this.context.request.contract.object}.`

        );

        this.sections.section(

            "OBJETO",

            "1. Objeto",

            p.build()

        );

    }

    /**
     * =====================================================
     * ALCANCE DE LA PRESTACIÓN
     * =====================================================
     */

    private buildScope(): void {

        const p = new ParagraphBuilder();

        p.text(

            "La prestación comprenderá todas las actuaciones necesarias para conseguir el objeto del contrato descrito en el presente Pliego."

        );

        p.blank();

        p.text(

            "El adjudicatario asumirá la totalidad de los trabajos, suministros, medios personales y materiales necesarios para la correcta ejecución del contrato."

        );

        p.blank();

        p.text(

            "Se entenderán incluidas todas aquellas actuaciones accesorias imprescindibles para el correcto funcionamiento del servicio, aunque no aparezcan expresamente descritas."

        );

        this.sections.section(

            "ALCANCE",

            "2. Alcance de la prestación",

            p.build()

        );

    }

    /**
     * =====================================================
     * DESCRIPCIÓN TÉCNICA
     * =====================================================
     */

    private buildTechnicalRequirements(): void {

        const p = new ParagraphBuilder();

        p.text(

            "Las prestaciones deberán ejecutarse conforme a las especificaciones técnicas establecidas en este Pliego."

        );

        p.blank();

        p.text(

            this.context.request.contract.technicalDescription ??

            "La unidad promotora completará la descripción técnica específica del contrato."

        );

        p.blank();

        p.text(

            "El adjudicatario será responsable de garantizar que todas las prestaciones cumplen las condiciones técnicas exigidas."

        );

        this.sections.section(

            "REQUISITOS",

            "3. Requisitos técnicos",

            p.build()

        );

    }

    /**
     * =====================================================
     * MEDIOS PERSONALES
     * =====================================================
     */

    private buildHumanResources(): void {

        const p = new ParagraphBuilder();

        p.text(

            "El contratista deberá adscribir al contrato personal suficiente y con la cualificación adecuada para la correcta ejecución de las prestaciones."

        );

        p.blank();

        p.text(

            "Todo el personal deberá disponer de la capacitación profesional exigible para el desarrollo de las tareas encomendadas."

        );

        p.blank();

        p.text(

            "La sustitución del personal asignado no afectará a la calidad del servicio."

        );

        this.sections.section(

            "PERSONAL",

            "4. Medios personales",

            p.build()

        );

    }

    /**
     * =====================================================
     * MEDIOS MATERIALES
     * =====================================================
     */

    private buildMaterialResources(): void {

        const p = new ParagraphBuilder();

        p.text(

            "El adjudicatario aportará todos los equipos, herramientas, aplicaciones, maquinaria o elementos materiales necesarios para la correcta ejecución del contrato."

        );

        p.blank();

        p.text(

            "Todos los medios deberán encontrarse en perfecto estado de funcionamiento durante toda la ejecución contractual."

        );

        p.blank();

        p.text(

            "La Administración no facilitará medios materiales salvo previsión expresa."

        );

        this.sections.section(

            "MEDIOS",

            "5. Medios materiales",

            p.build()

        );

    }

    /**
     * =====================================================
     * CONDICIONES DE EJECUCIÓN TÉCNICA
     * =====================================================
     */

    private buildExecutionConditions(): void {

        const p = new ParagraphBuilder();

        p.text(

            "Las prestaciones deberán ejecutarse de forma continuada, coordinada y conforme a las instrucciones dictadas por el responsable del contrato."

        );

        p.blank();

        p.text(

            "El adjudicatario organizará los recursos necesarios para garantizar la continuidad de la prestación durante toda la vigencia contractual."

        );

        p.blank();

        p.text(

            "Toda incidencia que afecte al normal desarrollo del contrato deberá comunicarse inmediatamente al responsable del contrato."

        );

        this.sections.section(

            "EJECUCION",

            "6. Condiciones de ejecución técnica",

            p.build()

        );

    }

    /**
     * =====================================================
     * CONTROL DE CALIDAD
     * =====================================================
     */

    private buildQualityRequirements(): void {

        const p = new ParagraphBuilder();

        p.text(

            "Las prestaciones deberán cumplir permanentemente los niveles de calidad exigidos por la Administración."

        );

        p.blank();

        p.text(

            "El órgano de contratación podrá realizar comprobaciones, auditorías técnicas e inspecciones durante toda la ejecución contractual."

        );

        p.blank();

        p.text(

            "Las deficiencias detectadas deberán subsanarse en el plazo que determine el responsable del contrato."

        );

        this.sections.section(

            "CALIDAD",

            "7. Control de calidad",

            p.build()

        );

    }

    /**
     * =====================================================
     * ENTREGABLES
     * =====================================================
     */

    private buildDeliverables(): void {

        const p = new ParagraphBuilder();

        p.text(

            "El contratista entregará todos los productos, informes, documentación y resultados previstos en el contrato."

        );

        p.blank();

        p.text(

            "Todos los entregables deberán presentarse en formato editable cuando resulte técnicamente posible."

        );

        p.blank();

        p.text(

            "La Administración podrá solicitar aclaraciones o correcciones antes de aceptar definitivamente cualquier entregable."

        );

        this.sections.section(

            "ENTREGABLES",

            "8. Entregables",

            p.build()

        );

    }

    /**
     * =====================================================
     * NIVELES DE SERVICIO (SLA)
     * =====================================================
     */

    private buildServiceLevels(): void {

        const p = new ParagraphBuilder();

        p.text(

            "El adjudicatario deberá mantener los niveles de servicio comprometidos durante toda la ejecución contractual."

        );

        p.blank();

        p.text(

            "Los tiempos máximos de respuesta y resolución se determinarán en función de la criticidad de cada incidencia."

        );

        p.blank();

        p.text(

            "El incumplimiento reiterado de los niveles de servicio podrá dar lugar a la aplicación de penalidades."

        );

        this.sections.section(

            "SLA",

            "9. Niveles de servicio",

            p.build()

        );

    }

    /**
     * =====================================================
     * SEGURIDAD Y CONFIDENCIALIDAD
     * =====================================================
     */

    private buildSecurity(): void {

        const p = new ParagraphBuilder();

        p.text(

            "El adjudicatario garantizará la confidencialidad de toda la información a la que tenga acceso durante la ejecución del contrato."

        );

        p.blank();

        p.text(

            "Se adoptarán las medidas técnicas y organizativas necesarias para proteger la información frente a accesos no autorizados."

        );

        p.blank();

        p.text(

            "Las obligaciones de confidencialidad permanecerán vigentes incluso una vez finalizado el contrato."

        );

        this.sections.section(

            "SEGURIDAD",

            "10. Seguridad y confidencialidad",

            p.build()

        );

    }

    /**
     * =====================================================
     * PROTECCIÓN MEDIOAMBIENTAL
     * =====================================================
     */

    private buildEnvironmentalRequirements(): void {

        const p = new ParagraphBuilder();

        p.text(
            "Durante toda la ejecución del contrato deberán adoptarse las medidas necesarias para minimizar el impacto ambiental derivado de la prestación."
        );

        p.blank();

        p.text(
            "El adjudicatario utilizará, siempre que resulte posible, materiales reutilizables, reciclables y energéticamente eficientes."
        );

        p.blank();

        p.text(
            "Todos los residuos generados deberán gestionarse conforme a la normativa ambiental vigente."
        );

        this.sections.section(

            "MEDIOAMBIENTE",

            "11. Protección medioambiental",

            p.build()

        );

    }

    /**
     * =====================================================
     * PREVENCIÓN DE RIESGOS LABORALES
     * =====================================================
     */

    private buildOccupationalSafety(): void {

        const p = new ParagraphBuilder();

        p.text(
            "El adjudicatario deberá cumplir íntegramente la normativa vigente en materia de prevención de riesgos laborales."
        );

        p.blank();

        p.text(
            "Todo el personal adscrito al contrato deberá haber recibido la formación preventiva correspondiente."
        );

        p.blank();

        p.text(
            "El adjudicatario será responsable de la seguridad de los trabajos realizados."
        );

        this.sections.section(

            "PRL",

            "12. Prevención de riesgos laborales",

            p.build()

        );

    }

    /**
     * =====================================================
     * RECEPCIÓN Y ACEPTACIÓN
     * =====================================================
     */

    private buildAcceptance(): void {

        const p = new ParagraphBuilder();

        p.text(
            "Las prestaciones serán objeto de comprobación por el responsable del contrato antes de su recepción definitiva."
        );

        p.blank();

        p.text(
            "La aceptación únicamente tendrá lugar cuando las prestaciones cumplan íntegramente las especificaciones técnicas definidas en este Pliego."
        );

        p.blank();

        p.text(
            "Las deficiencias detectadas deberán subsanarse antes de la recepción definitiva."
        );

        this.sections.section(

            "RECEPCION",

            "13. Recepción de los trabajos",

            p.build()

        );

    }

    /**
     * =====================================================
     * DOCUMENTACIÓN FINAL
     * =====================================================
     */

    private buildFinalDocumentation(): void {

        const p = new ParagraphBuilder();

        p.text(
            "Al finalizar el contrato el adjudicatario entregará toda la documentación técnica generada durante la ejecución."
        );

        p.blank();

        p.text(
            "La documentación deberá entregarse en formato editable cuando sea técnicamente posible."
        );

        this.sections.section(

            "DOCUMENTACION",

            "14. Documentación final",

            p.build()

        );

    }

    /**
     * =====================================================
     * MARCO NORMATIVO
     * =====================================================
     */

    private buildLegalFramework(): void {

        this.citations

            .lcsp(
                "124",
                "Contenido del Pliego de Prescripciones Técnicas."
            )

            .lcsp(
                "125",
                "Prescripciones técnicas."
            );

        this.sections.section(

            "MARCO",

            "15. Normativa aplicable",

            this.citations

                .unique()

                .sort()

                .buildSection(),

            false

        );

    }

    /**
     * =====================================================
     * EXPORTACIÓN
     * =====================================================
     */

    private exportDocument(): void {

        for (

            const section of this.sections.build()

        ) {

            this.addSection(

                section.id,

                section.title,

                section.content,

                section.editable

            );

        }

        for (

            const citation of this.citations.build()

        ) {

            this.addReference(

                citation.norm,

                citation.text,

                citation.article

            );

        }

    }

}
