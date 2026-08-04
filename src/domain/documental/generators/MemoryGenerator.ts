/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * MemoryGenerator
 * ------------------------------------------------------------
 * Generador automático de la Memoria Justificativa.
 *
 * Utiliza TODA la información calculada por el Motor Jurídico.
 *
 * ============================================================
 */

import { BaseDocumentGenerator } from "../BaseDocumentGenerator";

import { DocumentContext } from "../DocumentContext";

import { SectionBuilder } from "../SectionBuilder";

import { ParagraphBuilder } from "../ParagraphBuilder";

import { ClauseBuilder } from "../ClauseBuilder";

import { LegalCitationBuilder } from "../LegalCitationBuilder";

export class MemoryGenerator extends BaseDocumentGenerator {

    private readonly sectionsBuilder =

        new SectionBuilder();

    private readonly paragraphs =

        new ParagraphBuilder();

    private readonly clauses =

        new ClauseBuilder();

    private readonly citations =

        new LegalCitationBuilder();

    constructor(

        context: DocumentContext

    ) {

        super(context);

    }

    /**
     * =====================================================
     * Construcción completa de la memoria.
     * =====================================================
     */

    protected build(): void {

        this.buildIdentification();

        this.buildNeed();

        this.buildObject();

        this.buildInsufficiency();

        this.buildContractType();

        this.buildCPV();

        this.buildLots();

        this.buildBudget();

        this.buildProcedure();

        this.buildAwardCriteria();

        this.buildPublication();

        this.buildDeadlines();

        this.buildSolvency();

        this.buildLegalFramework();

        this.exportSections();

    }

    /**
     * =====================================================
     * IDENTIFICACIÓN DEL EXPEDIENTE
     * =====================================================
     */

    private buildIdentification(): void {

        const c = this.context.request.contract;

        const text = new ParagraphBuilder()

            .text(
                `La presente Memoria Justificativa se redacta con el objeto de fundamentar la necesidad y conveniencia de tramitar el expediente de contratación relativo a "${c.object}".`
            )

            .blank()

            .text(
                `Órgano de contratación: ${this.context.request.contractingAuthority ?? "Pendiente de determinar"}.`
            )

            .text(
                `Unidad promotora: ${this.context.request.promotingUnit ?? "Pendiente de determinar"}.`
            )

            .text(
                `Valor estimado del contrato: ${c.estimatedValue.toLocaleString("es-ES")} €.`
            )

            .text(
                `Tipo de contrato: ${this.context.contractType.contractType}.`
            )

            .build();

        this.sectionsBuilder.section(

            "IDENTIFICACION",

            "1. Identificación del expediente",

            text

        );

    }

    /**
     * =====================================================
     * NECESIDAD DEL CONTRATO
     * =====================================================
     */

    private buildNeed(): void {

        const p = new ParagraphBuilder();

        p.justification(

            "resulta necesaria la contratación para satisfacer una necesidad pública cuya atención corresponde al órgano de contratación"

        );

        p.blank();

        p.text(

            this.context.request.contract.needDescription ??

            "La necesidad concreta será descrita por la unidad promotora."

        );

        p.blank();

        p.text(

            "La contratación propuesta responde a objetivos de interés público y se considera el instrumento más adecuado para garantizar la correcta prestación del servicio o suministro requerido."

        );

        this.citations

            .lcsp(

                "28",

                "Necesidad e idoneidad del contrato."

            )

            .lcsp(

                "116",

                "Justificación del expediente."

            );

        this.sectionsBuilder.section(

            "NECESIDAD",

            "2. Necesidad e idoneidad del contrato",

            p.build()

        );

    }

    /**
     * =====================================================
     * OBJETO DEL CONTRATO
     * =====================================================
     */

    private buildObject(): void {

        const p = new ParagraphBuilder();

        p.text(

            `El objeto del presente contrato consiste en ${this.context.request.contract.object}.`

        );

        p.blank();

        p.text(

            `El contrato ha sido clasificado automáticamente por el Motor Jurídico como un contrato de ${this.context.contractType.mainPerformance.toLowerCase()}.`

        );

        p.blank();

        p.text(

            `El CPV principal asociado al expediente es ${this.context.cpv.principal}.`

        );

        if (

            this.context.cpv.secondary.length > 0

        ) {

            p.blank();

            p.text(

                "CPV complementarios:"

            );

            p.list(

                this.context.cpv.secondary

            );

        }

        this.citations

            .lcsp(

                "99",

                "Objeto del contrato."

            );

        this.sectionsBuilder.section(

            "OBJETO",

            "3. Objeto del contrato",

            p.build()

        );

    }

    /**
     * =====================================================
     * INSUFICIENCIA DE MEDIOS
     * =====================================================
     */

    private buildInsufficiency(): void {

        const p = new ParagraphBuilder();

        p.justification(

            "los medios personales y materiales disponibles en la Administración resultan insuficientes para atender adecuadamente la necesidad descrita"

        );

        p.blank();

        p.text(

            this.context.request.contract.insufficiencyOfMeans ??

            "La unidad promotora acredita que no dispone de medios suficientes para ejecutar directamente las prestaciones objeto del contrato."

        );

        p.blank();

        p.text(

            "La contratación externa constituye la alternativa más eficiente y adecuada para garantizar la correcta satisfacción del interés público perseguido."

        );

        this.citations

            .lcsp(

                "28",

                "Necesidad e insuficiencia de medios."

            )

            .lcsp(

                "116",

                "Justificación del expediente."

            );

        this.sectionsBuilder.section(

            "INSUFICIENCIA",

            "4. Insuficiencia de medios",

            p.build()

        );

    }

    /**
     * =====================================================
     * PRESUPUESTO Y VALOR ESTIMADO
     * =====================================================
     */

    private buildBudget(): void {

        const p = new ParagraphBuilder();

        p.text(

            `El valor estimado del contrato asciende a ${this.context.request.contract.estimatedValue.toLocaleString("es-ES")} €.`

        );

        p.blank();

        p.text(

            `El expediente se tramitará conforme a los umbrales calculados automáticamente por el Motor Jurídico.`

        );

        this.sectionsBuilder.section(

            "PRESUPUESTO",

            "5. Presupuesto y valor estimado",

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

            `El procedimiento de adjudicación propuesto es ${this.context.procedure.name}.`

        );

        p.blank();

        p.text(

            this.context.procedure.justification

        );

        this.sectionsBuilder.section(

            "PROCEDIMIENTO",

            "6. Procedimiento de adjudicación",

            p.build()

        );

    }

    /**
     * =====================================================
     * LOTES
     * =====================================================
     */

    private buildLots(): void {

        const p = new ParagraphBuilder();

        if (

            this.context.lots.divideIntoLots

        ) {

            p.text(

                this.context.lots.justification

            );

            p.blank();

            p.text(

                "La división propuesta es la siguiente:"

            );

            p.list(

                this.context.lots.lots.map(

                    l=>l.name

                )

            );

        }

        else{

            p.text(

                this.context.lots.justification

            );

        }

        this.sectionsBuilder.section(

            "LOTES",

            "7. División en lotes",

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

        this.sectionsBuilder.section(

            "SOLVENCIA",

            "8. Solvencia",

            p.build()

        );

    }

    /**
     * =====================================================
     * PUBLICIDAD
     * =====================================================
     */

    private buildPublication(): void {

        const p = new ParagraphBuilder();

        p.text(

            this.context.publication.justification

        );

        this.sectionsBuilder.section(

            "PUBLICIDAD",

            "9. Publicidad",

            p.build()

        );

    }

    /**
     * =====================================================
     * PLAZOS
     * =====================================================
     */

    private buildDeadlines(): void {

        const p = new ParagraphBuilder();

        p.text(

            `El plazo mínimo de presentación de ofertas será de ${this.context.deadlines.offerSubmissionDays} días.`

        );

        this.sectionsBuilder.section(

            "PLAZOS",

            "10. Plazos",

            p.build()

        );

    }

    /**
     * =====================================================
     * MARCO JURÍDICO
     * =====================================================
     */

    private buildLegalFramework(): void {

        this.sectionsBuilder.section(

            "MARCO",

            "11. Marco jurídico",

            this.citations.buildSection()

        );

    }

    /**
     * =====================================================
     * EXPORTACIÓN
     * =====================================================
     */

    private exportSections(): void {

        for(

            const section

            of this.sectionsBuilder.build()

        ){

            this.addSection(

                section.id,

                section.title,

                section.content,

                section.editable

            );

        }

        for(

            const citation

            of this.citations.build()

        ){

            this.addReference(

                citation.norm,

                citation.text,

                citation.article

            );

        }

    }

}
