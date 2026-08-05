/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * Conflict
 * ------------------------------------------------------------
 * Representa un conflicto detectado durante la ejecución
 * del Motor Jurídico.
 *
 * El conflicto NO se resuelve aquí.
 *
 * Simplemente se registra.
 *
 * ============================================================
 */

import { ConflictSeverity } from "./ConflictSeverity";
import { ConflictType } from "./ConflictType";

export interface Conflict {

    /**
     * Identificador.
     */
    id: string;

    /**
     * Tipo de conflicto.
     */
    type: ConflictType;

    /**
     * Nivel de gravedad.
     */
    severity: ConflictSeverity;

    /**
     * Regla origen.
     */
    sourceRule: string;

    /**
     * Regla destino.
     */
    targetRule: string;

    /**
     * Descripción.
     */
    description: string;

    /**
     * ¿Ha sido resuelto?
     */
    resolved: boolean;

    /**
     * Solución adoptada.
     */
    resolution?: string;

}
