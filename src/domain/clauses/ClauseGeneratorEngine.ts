/*****************************************************************************************
* CLAUSE GENERATOR ENGINE
* Estructura consolidada a partir de la implementación existente.
******************************************************************************************/

import { ContractType } from "../contracts/ContractType";
import { CPVCode } from "../cpv/CPVCode";

export interface ClauseGenerationContext {
    contractType: ContractType;
    contractValue: number;
    estimatedValue: number;
    durationMonths: number;
    cpv?: CPVCode;
    lots: boolean;
    urgent: boolean;
    emergency: boolean;
    europeanFunds: boolean;
}

export interface GeneratedClause {
    id: string;
    title: string;
    content: string;
    mandatory: boolean;
}

export interface GeneratedDocument {
    title: string;
    clauses: GeneratedClause[];
}

export class ClauseGeneratorEngine {
    private clauses: GeneratedClause[] = [];

    constructor() {
        this.initialize();
    }

    public initialize(): void {
        this.clauses = [];
    }

    public generate(context: ClauseGenerationContext): GeneratedDocument {
        this.clear();
        this.generateMandatoryClauses(context);
        return {
            title: "Pliego de Cláusulas Administrativas",
            clauses: [...this.clauses]
        };
    }

    private addClause(clause: GeneratedClause): void {
        this.clauses.push(clause);
    }

    private generateMandatoryClauses(context: ClauseGenerationContext): void {
        this.generateLegalFrameworkClause(context);
        this.generateContractObjectClause(context);
        this.generateContractTypeClause(context);
        this.generateBudgetClause(context);
    }

    public clauseCount(): number {
        return this.clauses.length;
    }

    private generateLegalFrameworkClause(_context: ClauseGenerationContext): void {
        this.addClause({
            id: "LEGAL_FRAMEWORK",
            title: "Régimen jurídico",
            mandatory: true,
            content: [
                "El presente contrato tiene naturaleza administrativa y se regirá por la Ley 9/2017, de 8 de noviembre, de Contratos del Sector Público, por el resto de normativa administrativa que resulte de aplicación y por las cláusulas contenidas en el presente Pliego."
            ].join("\n")
        });
    }

    private hasClause(id: string): boolean {
        return this.clauses.some(c => c.id === id);
    }

    private generateContractObjectClause(context: ClauseGenerationContext): void {
        this.addClause({
            id: "CONTRACT_OBJECT",
            title: "Objeto del contrato",
            mandatory: true,
            content: this.buildContractObject(context)
        });
    }

    private buildContractObject(context: ClauseGenerationContext): string {
        let description = "Constituye el objeto del presente contrato la ejecución de las prestaciones definidas en el Pliego de Prescripciones Técnicas.";
        if (context.cpv) {
            description += "\n\nCódigo CPV principal: " + context.cpv.code + " - " + context.cpv.description + ".";
        }
        if (context.lots) {
            description += "\n\nEl contrato se divide en lotes conforme a la justificación incorporada al expediente.";
        } else {
            description += "\n\nNo se prevé división en lotes, constando en el expediente la correspondiente motivación.";
        }
        return description;
    }

    private generateContractTypeClause(context: ClauseGenerationContext): void {
        this.addClause({
            id: "CONTRACT_TYPE",
            title: "Calificación del contrato",
            mandatory: true,
            content: this.buildContractTypeText(context)
        });
    }

    private buildContractTypeText(context: ClauseGenerationContext): string {
        switch (context.contractType) {
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

    private generateBudgetClause(context: ClauseGenerationContext): void {
        this.addClause({
            id: "CONTRACT_BUDGET",
            title: "Presupuesto base de licitación y valor estimado",
            mandatory: true,
            content: this.buildBudgetText(context)
        });
    }

    private buildBudgetText(context: ClauseGenerationContext): string {
        const budget = context.contractValue.toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        const estimated = context.estimatedValue.toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return [
            "El presupuesto base de licitación asciende a " + budget + " euros.",
            "",
            "El valor estimado del contrato asciende a " + estimated + " euros, calculado conforme al artículo 101 de la Ley 9/2017, de Contratos del Sector Público.",
            "",
            "En dicho importe se han considerado todas las posibles prórrogas, modificaciones y demás conceptos exigidos por la normativa vigente, cuando resulten de aplicación."
        ].join("\n");
    }

    private generateDurationClause(context: ClauseGenerationContext): void {
        this.addClause({
            id: "CONTRACT_DURATION",
            title: "Duración del contrato",
            mandatory: true,
            content: this.buildDurationText(context)
        });
    }

    private buildDurationText(context: ClauseGenerationContext): string {
        const months = context.durationMonths;
        let text = "La duración inicial del contrato será de " + months + " meses.";
        if (months === 1) {
            text = "La duración inicial del contrato será de 1 mes.";
        }
        text += "\n\nEl cómputo del plazo comenzará desde la fecha de formalización del contrato o desde la fecha de inicio de la prestación cuando así se establezca en los pliegos.";
        text += "\n\nLa duración se entiende sin perjuicio de las posibles prórrogas que, en su caso, puedan establecerse expresamente en este Pliego.";
        return text;
    }

    private generatePriceRevisionClause(context: ClauseGenerationContext): void {
        this.addClause({
            id: "PRICE_REVIEW",
            title: "Revisión de precios",
            mandatory: true,
            content: this.buildPriceRevisionText(context)
        });
    }

    private buildPriceRevisionText(context: ClauseGenerationContext): string {
        if (context.durationMonths < 24) {
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

    private generateGuaranteeClause(context: ClauseGenerationContext): void {
        this.addClause({
            id: "FINAL_GUARANTEE",
            title: "Garantía definitiva",
            mandatory: true,
            content: this.buildGuaranteeText(context)
        });
    }

    private buildGuaranteeText(context: ClauseGenerationContext): string {
        if (context.contractValue < 50000) {
            return [
                "No se exige garantía definitiva.",
                "",
                "La exención deberá quedar debidamente motivada en el expediente cuando resulte conforme con la normativa aplicable."
            ].join("\n");
        }
        const guarantee = (context.contractValue * 0.05).toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return [
            "El adjudicatario deberá constituir una garantía definitiva equivalente al cinco por ciento (5 %) del importe de adjudicación, excluido el IVA.",
            "",
            "Importe orientativo de la garantía: " + guarantee + " euros.",
            "",
            "La garantía responderá de las obligaciones previstas en la Ley de Contratos del Sector Público."
        ].join("\n");
    }

    private generateSolvencyClause(context: ClauseGenerationContext): void {
        this.addClause({
            id: "SOLVENCY",
            title: "Solvencia económica y técnica",
            mandatory: true,
            content: this.buildSolvencyText(context)
        });
    }

    private buildSolvencyText(context: ClauseGenerationContext): string {
        if (context.contractValue < 50000) {
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

    private generateAwardCriteriaClause(context: ClauseGenerationContext): void {
        this.addClause({
            id: "AWARD_CRITERIA",
            title: "Criterios de adjudicación",
            mandatory: true,
            content: this.buildAwardCriteriaText(context)
        });
    }

    private buildAwardCriteriaText(context: ClauseGenerationContext): string {
        if (context.contractType === ContractType.SUPPLIES) {
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

    private generateSpecialExecutionClause(context: ClauseGenerationContext): void {
        this.addClause({
            id: "SPECIAL_EXECUTION",
            title: "Condiciones especiales de ejecución",
            mandatory: true,
            content: this.buildSpecialExecutionText(context)
        });
    }

    private buildSpecialExecutionText(context: ClauseGenerationContext): string {
        const clauses: string[] = [
            "Durante la ejecución del contrato deberán respetarse todas las obligaciones laborales, sociales, medioambientales y de igualdad establecidas por la legislación vigente."
        ];
        if (context.europeanFunds) {
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

    private generateExtensionClause(_context: ClauseGenerationContext): void {
        this.addClause({
            id: "CONTRACT_EXTENSION",
            title: "Prórrogas",
            mandatory: true,
            content: [
                "El contrato podrá ser objeto de una o varias prórrogas únicamente cuando dicha posibilidad se encuentre expresamente prevista en este Pliego y resulte conforme con la legislación vigente.",
                "",
                "Las prórrogas tendrán carácter obligatorio para el contratista cuando hayan sido previstas en los pliegos y se acuerden por el órgano de contratación antes de la finalización del contrato.",
                "",
                "La duración total del contrato, incluidas las prórrogas, no podrá superar los límites establecidos por la Ley 9/2017, de Contratos del Sector Público.",
                "",
                "La adopción del acuerdo de prórroga requerirá la tramitación administrativa correspondiente."
            ].join("\n")
        });
    }

    private generateContractManagerClause(_context: ClauseGenerationContext): void {
        this.addClause({
            id: "CONTRACT_MANAGER",
            title: "Responsable del contrato",
            mandatory: true,
            content: [
                "El órgano de contratación designará un responsable del contrato conforme a lo previsto en el artículo 62 de la Ley 9/2017, de Contratos del Sector Público.",
                "",
                "Corresponderá al responsable del contrato supervisar la ejecución, adoptar las decisiones necesarias para asegurar la correcta realización de la prestación y dictar las instrucciones precisas dentro del ámbito de sus competencias.",
                "",
                "Asimismo verificará el cumplimiento de los plazos, de las condiciones especiales de ejecución y de las obligaciones asumidas por el contratista.",
                "",
                "El responsable emitirá los informes necesarios durante la ejecución del contrato y propondrá, en su caso, la imposición de penalidades, la recepción de la prestación y la liquidación del contrato."
            ].join("\n")
        });
    }

    private generatePaymentClause(_context: ClauseGenerationContext): void {
        this.addClause({
            id: "PAYMENT",
            title: "Facturación y pago",
            mandatory: true,
            content: [
                "El contratista tendrá derecho al abono del precio una vez ejecutada correctamente la prestación y emitida la correspondiente conformidad por el responsable del contrato.",
                "",
                "Las facturas deberán presentarse en formato electrónico a través del Punto General de Entrada de Facturas Electrónicas que resulte aplicable.",
                "",
                "El pago se efectuará dentro del plazo legalmente establecido desde la aprobación de la factura, siempre que se hayan cumplido todos los requisitos administrativos y contractuales.",
                "",
                "Cuando existan incidencias en la ejecución del contrato o en la documentación presentada, el órgano de contratación podrá suspender la tramitación del pago hasta su completa subsanación."
            ].join("\n")
        });
    }

    private generateConfidentialityClause(_context: ClauseGenerationContext): void {
        this.addClause({
            id: "CONFIDENTIALITY",
            title: "Confidencialidad y protección de datos",
            mandatory: true,
            content: [
                "El contratista deberá guardar absoluta confidencialidad respecto de toda la información a la que tenga acceso con ocasión de la ejecución del contrato.",
                "",
                "Cuando el contrato implique tratamiento de datos personales, el adjudicatario deberá cumplir íntegramente el Reglamento (UE) 2016/679 (RGPD), la Ley Orgánica 3/2018 y demás normativa aplicable.",
                "",
                "Los datos personales únicamente podrán utilizarse para la correcta ejecución del contrato, quedando prohibida cualquier utilización distinta o cesión a terceros sin autorización legal.",
                "",
                "Finalizada la ejecución del contrato, el contratista deberá devolver o destruir la información y los datos personales en los términos establecidos por la normativa vigente y por las instrucciones del órgano de contratación."
            ].join("\n")
        });
    }

    private generateIntellectualPropertyClause(_context: ClauseGenerationContext): void {
        this.addClause({
            id: "INTELLECTUAL_PROPERTY",
            title: "Propiedad intelectual y uso de los trabajos",
            mandatory: true,
            content: [
                "Todos los estudios, informes, aplicaciones, desarrollos, documentación técnica, bases de datos y demás trabajos realizados como consecuencia de la ejecución del contrato quedarán a disposición del órgano de contratación en los términos previstos en los Pliegos y en la legislación vigente.",
                "",
                "El adjudicatario garantiza que los trabajos entregados son originales o que dispone de los derechos necesarios para su utilización, manteniendo indemne a la Administración frente a cualquier reclamación de terceros.",
                "",
                "Salvo que los Pliegos establezcan otra cosa, la Administración podrá utilizar, reproducir, modificar y conservar los trabajos realizados para el cumplimiento de sus fines públicos.",
                "",
                "La entrega de la documentación final comprenderá todos los archivos fuente, documentación técnica y elementos necesarios para asegurar la continuidad del servicio cuando ello resulte aplicable."
            ].join("\n")
        });
    }

    private generateTerminationClause(_context: ClauseGenerationContext): void {
        this.addClause({
            id: "CONTRACT_TERMINATION",
            title: "Resolución del contrato",
            mandatory: true,
            content: [
                "Serán causas de resolución del contrato las previstas en la Ley 9/2017, de Contratos del Sector Público y las que, en su caso, se establezcan expresamente en el presente Pliego.",
                "",
                "La resolución podrá producirse, entre otros supuestos, por incumplimiento culpable del contratista, imposibilidad sobrevenida de ejecución, mutuo acuerdo, demora en el cumplimiento de los plazos o cualquier otra causa legalmente prevista.",
                "",
                "La resolución del contrato se acordará mediante el correspondiente procedimiento administrativo, con audiencia del contratista cuando resulte preceptiva.",
                "",
                "Los efectos de la resolución serán los establecidos en la legislación vigente, incluyendo, cuando proceda, la incautación de la garantía definitiva y la indemnización por daños y perjuicios."
            ].join("\n")
        });
    }

    public generateCompletePCAP(context: ClauseGenerationContext): GeneratedDocument {
        this.clear();
        this.generateMandatoryClauses(context);
        this.generateDurationClause(context);
        this.generatePriceRevisionClause(context);
        this.generateGuaranteeClause(context);
        this.generateSolvencyClause(context);
        this.generateAwardCriteriaClause(context);
        this.generateSpecialExecutionClause(context);
        this.generateExtensionClause(context);
        this.generateContractManagerClause(context);
        this.generatePaymentClause(context);
        this.generateConfidentialityClause(context);
        this.generateIntellectualPropertyClause(context);
        this.generateTerminationClause(context);
        return {
            title: "Pliego de Cláusulas Administrativas Particulares",
            clauses: [...this.clauses]
        };
    }

    public summary(): string {
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
            "Prórrogas........................... ✔",
            "Responsable del contrato............ ✔",
            "Facturación y pago.................. ✔",
            "Confidencialidad.................... ✔",
            "Protección de datos................ ✔",
            "Propiedad intelectual............... ✔",
            "Resolución del contrato............. ✔",
            "",
            "Estado: OPERATIVO"
        ].join("\n");
    }

    public version(): string {
        return "ClauseGeneratorEngine v1.0.0";
    }

    public clear(): void {
        this.clauses = [];
    }
}
