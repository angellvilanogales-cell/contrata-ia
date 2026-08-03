/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DecisionTrace
 * ------------------------------------------------------------
 * Registro completo de trazabilidad de decisiones.
 *
 * RESPONSABILIDAD
 *
 * Este componente registra:
 *
 *  • Qué regla produjo una decisión.
 *  • Qué conocimiento se utilizó.
 *  • Qué concepto fue evaluado.
 *  • Qué documento justificó la decisión.
 *  • Qué artículo normativo la respalda.
 *
 * IMPORTANTE
 *
 * NO interpreta normativa.
 *
 * NO ejecuta reglas.
 *
 * Únicamente almacena trazabilidad.
 *
 * ============================================================
 */

export interface DecisionEvidence {

    /**
     * Documento origen.
     */
    document?: string;

    /**
     * Artículo normativo.
     */
    article?: string;

    /**
     * Observaciones.
     */
    notes?: string;

}

export interface DecisionTraceItem {

    /**
     * Fecha.
     */
    timestamp: Date;

    /**
     * Concepto evaluado.
     */
    concept: string;

    /**
     * Regla aplicada.
     */
    ruleId: string;

    /**
     * Nombre de la regla.
     */
    ruleName: string;

    /**
     * Resultado.
     */
    result: string;

    /**
     * Explicación.
     */
    explanation: string;

    /**
     * Evidencias.
     */
    evidences: DecisionEvidence[];

}

export class DecisionTrace {

    /**
     * Historial.
     */
    private readonly items: DecisionTraceItem[] = [];

    /**
     * Añade una decisión.
     */
    public add(

        item: DecisionTraceItem

    ): void {

        this.items.push(item);

    }

    /**
     * Historial completo.
     */
    public getAll(): ReadonlyArray<DecisionTraceItem> {

        return this.items;

    }

    /**
     * Filtra por concepto.
     */
    public byConcept(

        concept: string

    ): DecisionTraceItem[] {

        return this.items.filter(

            item => item.concept === concept

        );

    }

    /**
     * Filtra por regla.
     */
    public byRule(

        ruleId: string

    ): DecisionTraceItem[] {

        return this.items.filter(

            item => item.ruleId === ruleId

        );

    }

    /**
     * Número de decisiones.
     */
    public count(): number {

        return this.items.length;

    }

    /**
     * Vacía el historial.
     */
    public clear(): void {

        this.items.length = 0;

    }

    /**
     * Exportación sencilla para auditoría.
     */
    public toJSON(): DecisionTraceItem[] {

        return [...this.items];

    }

}
