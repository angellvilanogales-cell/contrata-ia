/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * PCAPGenerator
 * ------------------------------------------------------------
 * Generador automático del Pliego de Cláusulas
 * Administrativas Particulares.
 *
 * Utiliza toda la información producida por el
 * Motor Jurídico.
 *
 * ============================================================
 */

import { BaseDocumentGenerator } from "../BaseDocumentGenerator";

import { DocumentContext } from "../DocumentContext";

import { SectionBuilder } from "../SectionBuilder";

import { ParagraphBuilder } from "../ParagraphBuilder";

import { ClauseBuilder } from "../ClauseBuilder";

import { LegalCitationBuilder } from "../LegalCitationBuilder";

export class PCAPGenerator extends BaseDocumentGenerator {

    private readonly sections =

        new SectionBuilder();

    private readonly paragraphs =

        new ParagraphBuilder();

    private readonly clauses =

        new ClauseBuilder();

    private readonly citations =

        new LegalCitationBuilder();

    constructor(

        context: DocumentContext

    ){

        super(context);

    }

    /**
     * =====================================================
     * Construcción completa del PCAP
     * =====================================================
     */

    protected build(): void {

        this.buildHeader();

        this.buildObject();

        this.buildLegalRegime();

        this.buildProcedure();

        this.buildBudget();

        this.buildLots();

        this.buildDuration();

        this.buildExecution();

        this.buildSolvency();

        this.buildGuarantees();

        this.buildAwardCriteria();

        this.buildAbnormalOffers();

        this.buildDocumentation();

        this.buildExecutionConditions();

        this.buildPayments();

        this.buildModifications();

        this.buildTermination();

        this.buildAppeals();

        this.buildDataProtection();

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

            "PLIEGO DE CLÁUSULAS ADMINISTRATIVAS PARTICULARES"

        );

        p.blank();

        p.text(

            `Objeto: ${this.context.request.contract.object}`

        );

        p.text(

            `Tipo de contrato: ${this.context.contractType.mainPerformance}`

        );

        p.text(

            `Procedimiento: ${this.context.procedure.name}`

        );

        p.text(

            `CPV principal: ${this.context.cpv.principal}`

        );

        p.text(

            `Valor estimado: ${this.context.request.contract.estimatedValue.toLocaleString("es-ES")} €`

        );

        this.sections.section(

            "HEADER",

            "PLIEGO DE CLÁUSULAS ADMINISTRATIVAS PARTICULARES",

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

        const clause =

            new ParagraphBuilder()

                .text(

                    `Constituye el objeto del presente contrato ${this.context.request.contract.object}.`

                )

                .blank()

                .text(

                    `El contrato se clasifica como ${this.context.contractType.mainPerformance.toLowerCase()}.`

                )

                .build();

        this.sections.section(

            "OBJETO",

            "Cláusula 1. Objeto del contrato",

            clause

        );

    }

    /**
     * =====================================================
     * RÉGIMEN JURÍDICO
     * =====================================================
     */

    private buildLegalRegime(): void {

        const p = new ParagraphBuilder();

        p.text(

            `El presente contrato tiene naturaleza administrativa y se regirá por la Ley 9/2017, de 8 de noviembre, de Contratos del Sector Público, por el presente Pliego de Cláusulas Administrativas Particulares y por el Pliego de Prescripciones Técnicas.`

        );

        p.blank();

        p.text(

            `En todo lo no previsto expresamente será de aplicación la normativa administrativa y presupuestaria que resulte procedente.`

        );

        this.citations

            .lcsp(

                "25",

                "Régimen jurídico de los contratos administrativos."

            )

            .lcsp(

                "122",

                "Contenido del PCAP."

            );

        this.sections.section(

            "REGIMEN",

            "Cláusula 2. Régimen jurídico",

            p.build()

        );

    }

    /**
     * =====================================================
     * PROCEDIMIENTO
     * =====================================================
     */

    private buildProcedure(): void {

        const p = new ParagraphBuilder();

        p.text(

            `La adjudicación se realizará mediante el procedimiento ${this.context.procedure.name.toLowerCase()}.`

        );

        p.blank();

        p.text(

            this.context.procedure.justification

        );

        p.blank();

        p.text(

            `La tramitación del expediente será la determinada automáticamente conforme a los umbrales económicos previstos en la LCSP.`

        );

        this.sections.section(

            "PROCEDIMIENTO",

            "Cláusula 3. Procedimiento de adjudicación",

            p.build()

        );

    }

    /**
     * =====================================================
     * PRESUPUESTO
     * =====================================================
     */

    private buildBudget(): void {

        const p = new ParagraphBuilder();

        p.text(

            `El presupuesto base de licitación asciende a ${this.context.request.contract.estimatedValue.toLocaleString("es-ES")} euros.`

        );

        p.blank();

        p.text(

            `El valor estimado del contrato ha sido calculado conforme al artículo 101 de la LCSP.`

        );

        this.citations

            .lcsp(

                "100",

                "Presupuesto base de licitación."

            )

            .lcsp(

                "101",

                "Valor estimado."

            );

        this.sections.section(

            "PRESUPUESTO",

            "Cláusula 4. Presupuesto base y valor estimado",

            p.build()

        );

    }

    /**
     * =====================================================
     * DIVISIÓN EN LOTES
     * =====================================================
     */

    private buildLots(): void {

        const p = new ParagraphBuilder();

        p.text(

            this.context.lots.justification

        );

        if (

            this.context.lots.divideIntoLots

        ) {

            p.blank();

            p.text(

                "La división en lotes queda establecida de la siguiente forma:"

            );

            p.list(

                this.context.lots.lots.map(

                    lot => lot.name

                )

            );

        }

        this.citations

            .lcsp(

                "99",

                "División en lotes."

            );

        this.sections.section(

            "LOTES",

            "Cláusula 5. División en lotes",

            p.build()

        );

    }

    /**
     * =====================================================
     * DURACIÓN DEL CONTRATO
     * =====================================================
     */

    private buildDuration(): void {

        const p = new ParagraphBuilder();

        p.text(

            `La duración prevista del contrato será de ${this.context.request.contract.duration}.`

        );

        p.blank();

        p.text(

            `Las posibles prórrogas, en su caso, se ajustarán a los límites establecidos por la legislación de contratos del sector público.`

        );

        this.citations

            .lcsp(

                "29",

                "Duración de los contratos."

            );

        this.sections.section(

            "DURACION",

            "Cláusula 6. Duración del contrato",

            p.build()

        );

    }

    /**
     * =====================================================
     * EJECUCIÓN DEL CONTRATO
     * =====================================================
     */

    private buildExecution(): void {

        const p = new ParagraphBuilder();

        p.text(

            "La ejecución del contrato se realizará con estricta sujeción al presente Pliego, al Pliego de Prescripciones Técnicas y a la oferta presentada por el adjudicatario."

        );

        p.blank();

        p.text(

            "El responsable del contrato supervisará la correcta ejecución de las prestaciones contratadas."

        );

        p.blank();

        p.text(

            "El contratista estará obligado al cumplimiento íntegro de las condiciones especiales de ejecución establecidas en este expediente."

        );

        this.citations

            .lcsp(

                "192",

                "Responsable del contrato."

            )

            .lcsp(

                "193",

                "Cumplimiento del contrato."

            );

        this.sections.section(

            "EJECUCION",

            "Cláusula 7. Ejecución del contrato",

            p.build()

        );

    }

    /**
     * =====================================================
     * SOLVENCIA
     * =====================================================
     */

    private buildSolvency(): void {

        const p = new ParagraphBuilder();

        p.text(

            this.context.solvency.justification

        );

        p.blank();

        if (

            this.context.solvency.required

        ) {

            p.text(

                "La solvencia económica y técnica será acreditada conforme a los medios previstos por la LCSP y los especificados en este Pliego."

            );

        }

        else {

            p.text(

                "No resulta exigible acreditación específica de solvencia."

            );

        }

        this.citations

            .lcsp(

                "74",

                "Exigencia de solvencia."

            )

            .lcsp(

                "87",

                "Solvencia económica."

            )

            .lcsp(

                "90",

                "Solvencia técnica."

            );

        this.sections.section(

            "SOLVENCIA",

            "Cláusula 8. Solvencia",

            p.build()

        );

    }

    /**
     * =====================================================
     * GARANTÍAS
     * =====================================================
     */

    private buildGuarantees(): void {

        const p = new ParagraphBuilder();

        if (

            this.context.thresholds.requiresGuarantee

        ) {

            p.text(

                "El adjudicatario deberá constituir garantía definitiva conforme a la legislación vigente."

            );

        }

        else {

            p.text(

                "No procede la constitución de garantía definitiva conforme al análisis efectuado por el Motor Jurídico."

            );

        }

        this.citations

            .lcsp(

                "106",

                "Garantía definitiva."

            )

            .lcsp(

                "107",

                "Constitución."

            );

        this.sections.section(

            "GARANTIAS",

            "Cláusula 9. Garantías",

            p.build()

        );

    }

    /**
     * =====================================================
     * CRITERIOS DE ADJUDICACIÓN
     * =====================================================
     */

    private buildAwardCriteria(): void {

        const p = new ParagraphBuilder();

        p.text(
            "La adjudicación recaerá en la oferta que presente la mejor relación calidad-precio, conforme a los criterios establecidos en la presente cláusula."
        );

        p.blank();

        p.text(
            "Los criterios de adjudicación serán los siguientes:"
        );

        p.list(

            this.context.award.criteria.map(

                c => `${c.name} (${c.weight} puntos)`

            )

        );

        p.blank();

        p.text(

            this.context.award.justification

        );

        this.citations

            .lcsp(
                "145",
                "Criterios de adjudicación."
            )

            .lcsp(
                "146",
                "Valoración de criterios."
            );

        this.sections.section(

            "CRITERIOS",

            "Cláusula 10. Criterios de adjudicación",

            p.build()

        );

    }

    /**
     * =====================================================
     * OFERTAS ANORMALMENTE BAJAS
     * =====================================================
     */

    private buildAbnormalOffers(): void {

        const p = new ParagraphBuilder();

        p.text(
            "Cuando una oferta incurra en presunción de anormalidad se seguirá el procedimiento previsto en la legislación de contratos del sector público."
        );

        p.blank();

        p.text(
            "Se concederá trámite de audiencia al licitador para justificar adecuadamente la viabilidad de la oferta presentada."
        );

        this.citations

            .lcsp(
                "149",
                "Ofertas anormalmente bajas."
            );

        this.sections.section(

            "ANORMALES",

            "Cláusula 11. Ofertas anormalmente bajas",

            p.build()

        );

    }

    /**
     * =====================================================
     * DOCUMENTACIÓN ADMINISTRATIVA
     * =====================================================
     */

    private buildDocumentation(): void {

        const p = new ParagraphBuilder();

        p.text(
            "Los licitadores deberán presentar la documentación administrativa exigida en este Pliego dentro del plazo establecido."
        );

        p.blank();

        p.list([

            "Declaración responsable.",

            "Documentación acreditativa de la personalidad.",

            "Representación.",

            "Solvencia.",

            "Oferta económica.",

            "Oferta técnica."

        ]);

        this.citations

            .lcsp(
                "140",
                "Declaración responsable."
            );

        this.sections.section(

            "DOCUMENTACION",

            "Cláusula 12. Documentación administrativa",

            p.build()

        );

    }

    /**
     * =====================================================
     * CONDICIONES ESPECIALES DE EJECUCIÓN
     * =====================================================
     */

    private buildExecutionConditions(): void {

        const p = new ParagraphBuilder();

        p.text(
            "Durante la ejecución del contrato deberán cumplirse las condiciones especiales de ejecución previstas en el expediente."
        );

        p.blank();

        p.list(

            this.context.award.specialExecutionConditions

        );

        this.citations

            .lcsp(
                "202",
                "Condiciones especiales de ejecución."
            );

        this.sections.section(

            "CONDICIONES",

            "Cláusula 13. Condiciones especiales de ejecución",

            p.build()

        );

    }

    /**
     * =====================================================
     * PAGOS
     * =====================================================
     */

    private buildPayments(): void {

        const p = new ParagraphBuilder();

        p.text(
            "El contratista tendrá derecho al abono de las prestaciones efectivamente ejecutadas y recibidas de conformidad por la Administración."
        );

        p.blank();

        p.text(
            "Las facturas deberán presentarse mediante factura electrónica cuando resulte legalmente exigible."
        );

        this.citations

            .lcsp(
                "198",
                "Pago del precio."
            )

            .lcsp(
                "199",
                "Intereses de demora."
            );

        this.sections.section(

            "PAGOS",

            "Cláusula 14. Pago del precio",

            p.build()

        );

    }

    /**
     * =====================================================
     * MODIFICACIONES
     * =====================================================
     */

    private buildModifications(): void {

        const p = new ParagraphBuilder();

        p.text(
            "Las modificaciones del contrato únicamente podrán realizarse en los supuestos previstos en la LCSP y en los términos establecidos en este Pliego."
        );

        p.blank();

        p.text(
            "Las modificaciones deberán justificarse suficientemente en el expediente."
        );

        this.citations

            .lcsp(
                "203",
                "Modificación de los contratos."
            )

            .lcsp(
                "204",
                "Modificaciones previstas."
            )

            .lcsp(
                "205",
                "Modificaciones no previstas."
            );

        this.sections.section(

            "MODIFICACIONES",

            "Cláusula 15. Modificaciones",

            p.build()

        );

    }

    /**
     * =====================================================
     * RESOLUCIÓN
     * =====================================================
     */

    private buildTermination(): void {

        const p = new ParagraphBuilder();

        p.text(
            "Serán causas de resolución las previstas en la Ley de Contratos del Sector Público."
        );

        p.blank();

        p.text(
            "La resolución del contrato producirá los efectos previstos legalmente."
        );

        this.citations

            .lcsp(
                "211",
                "Causas de resolución."
            );

        this.sections.section(

            "RESOLUCION",

            "Cláusula 16. Resolución del contrato",

            p.build()

        );

    }

    /**
     * =====================================================
     * RECURSOS
     * =====================================================
     */

    private buildAppeals(): void {

        const p = new ParagraphBuilder();

        p.text(
            "Contra los actos susceptibles de recurso especial en materia de contratación podrá interponerse dicho recurso en los términos previstos por la legislación vigente."
        );

        this.citations

            .lcsp(
                "44",
                "Recurso especial."
            );

        this.sections.section(

            "RECURSOS",

            "Cláusula 17. Recursos",

            p.build()

        );

    }

    /**
     * =====================================================
     * PROTECCIÓN DE DATOS
     * =====================================================
     */

    private buildDataProtection(): void {

        const p = new ParagraphBuilder();

        p.text(
            "Las partes deberán cumplir la normativa vigente en materia de protección de datos personales durante toda la ejecución del contrato."
        );

        p.blank();

        p.text(
            "El adjudicatario tendrá la consideración que corresponda conforme al Reglamento (UE) 2016/679 y a la Ley Orgánica 3/2018."
        );

        this.sections.section(

            "DATOS",

            "Cláusula 18. Protección de datos",

            p.build()

        );

    }

    /**
     * =====================================================
     * MARCO JURÍDICO
     * =====================================================
     */

    private buildLegalFramework(): void {

        this.sections.section(

            "MARCO",

            "Anexo I. Normativa aplicable",

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

            const section

            of this.sections.build()

        ) {

            this.addSection(

                section.id,

                section.title,

                section.content,

                section.editable

            );

        }

        for (

            const citation

            of this.citations.build()

        ) {

            this.addReference(

                citation.norm,

                citation.text,

                citation.article

            );

        }

    }

}
