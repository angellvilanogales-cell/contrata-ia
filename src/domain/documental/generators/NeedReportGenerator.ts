/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * NeedReportGenerator
 * ------------------------------------------------------------
 * Generador automático del Informe de Necesidad.
 *
 * Fundamenta la necesidad e idoneidad del contrato.
 *
 * ============================================================
 */

import { BaseDocumentGenerator } from "../BaseDocumentGenerator";
import { DocumentContext } from "../DocumentContext";
import { SectionBuilder } from "../SectionBuilder";
import { ParagraphBuilder } from "../ParagraphBuilder";
import { LegalCitationBuilder } from "../LegalCitationBuilder";

export class NeedReportGenerator extends BaseDocumentGenerator {

    private readonly sections =
        new SectionBuilder();

    private readonly citations =
        new LegalCitationBuilder();

    constructor(
        context: DocumentContext
    ) {
        super(context);
    }

    /**
     * =====================================================
     * Construcción completa del informe
     * =====================================================
     */

    protected build(): void {

        this.buildHeader();

        this.buildNeed();

        this.buildPublicInterest();

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
            "INFORME DE NECESIDAD"
        );

        p.blank();

        p.text(
            `Objeto del contrato: ${this.context.request.contract.object}`
        );

        p.text(
            `Órgano de contratación: ${this.context.request.contractingAuthority ?? "Pendiente de determinar"}`
        );

        this.sections.section(

            "HEADER",

            "INFORME DE NECESIDAD",

            p.build(),

            false

        );

    }

    /**
     * =====================================================
     * NECESIDAD
     * =====================================================
     */

    private buildNeed(): void {

        const p = new ParagraphBuilder();

        p.justification(
            "resulta necesaria la contratación para atender adecuadamente las competencias atribuidas al órgano de contratación"
        );

        p.blank();

        p.text(

            this.context.request.contract.needDescription ??

            "La unidad promotora completará la descripción concreta de la necesidad."

        );

        this.sections.section(

            "NECESIDAD",

            "1. Necesidad del contrato",

            p.build()

        );

    }

    /**
     * =====================================================
     * INTERÉS PÚBLICO E IDONEIDAD
     * =====================================================
     */

    private buildPublicInterest(): void {

        const p = new ParagraphBuilder();

        p.text(

            "La contratación propuesta constituye el instrumento más adecuado para satisfacer la necesidad pública identificada, garantizando la continuidad y eficacia en la prestación de las competencias atribuidas al órgano de contratación."

        );

        p.blank();

        p.text(

            "Las prestaciones objeto del contrato resultan imprescindibles para alcanzar los objetivos definidos por la unidad promotora y no pueden ser adecuadamente cubiertas mediante otros mecanismos organizativos."

        );

        p.blank();

        p.text(

            "La solución contractual seleccionada se considera proporcionada, eficiente y ajustada a los principios de buena administración, eficacia y utilización eficiente de los recursos públicos."

        );

        this.sections.section(

            "INTERES_PUBLICO",

            "2. Interés público e idoneidad",

            p.build()

        );

    }

    /**
     * =====================================================
     * MARCO JURÍDICO
     * =====================================================
     */

    private buildLegalFramework(): void {

        this.citations

            .lcsp(

                "28",

                "Necesidad e idoneidad del contrato."

            )

            .lcsp(

                "116",

                "Justificación del expediente."

            );

        this.sections.section(

            "MARCO",

            "3. Fundamentación jurídica",

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
