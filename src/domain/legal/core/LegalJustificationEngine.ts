/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * LegalJustificationEngine
 * ------------------------------------------------------------
 * Construye la motivación jurídica de cada decisión adoptada
 * por el Motor Jurídico.
 *
 * No toma decisiones.
 *
 * Su única responsabilidad consiste en explicar por qué
 * se ha llegado a una determinada conclusión.
 *
 * ============================================================
 */

import {

    LegalJustification

} from "./DecisionResult";

export class LegalJustificationEngine {

    private readonly justifications: LegalJustification[] = [];

    /**
     * Añade una justificación.
     */
    public add(

        regla: string,

        normativa: string,

        articulo: string,

        explicacion: string

    ): void {

        this.justifications.push({

            regla,

            normativa,

            articulo,

            explicacion

        });

    }

    /**
     * Devuelve todas las justificaciones.
     */
    public build(): LegalJustification[] {

        return [...this.justifications];

    }

    /**
     * Elimina todas las justificaciones.
     */
    public clear(): void {

        this.justifications.length = 0;

    }

    /**
     * ¿Existe alguna justificación?
     */
    public hasJustifications(): boolean {

        return this.justifications.length > 0;

    }

}
