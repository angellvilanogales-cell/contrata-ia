/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * MemoryComposer
 * ------------------------------------------------------------
 * Responsable de componer la Memoria Justificativa.
 *
 * En esta primera fase actúa como fachada.
 * La lógica seguirá viviendo temporalmente en MemoryGenerator
 * hasta completar la migración.
 *
 * ============================================================
 */

import { DocumentContext } from "../DocumentContext";

export class MemoryComposer {

    constructor(

        private readonly context: DocumentContext

    ) {}

    /**
     * Punto único de composición.
     *
     * En la siguiente fase irá absorbiendo
     * progresivamente la lógica de MemoryGenerator.
     */
    public compose(): void {

        // Primera versión.
        // Todavía no contiene lógica.
        // Se irá completando durante la refactorización.

    }

}
