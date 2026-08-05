/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ConflictResolver
 * ------------------------------------------------------------
 * Responsable de resolver conflictos detectados
 * durante la inferencia jurídica.
 *
 * No ejecuta reglas.
 * No genera documentos.
 * No interpreta normativa.
 *
 * Únicamente decide cuál de varios resultados
 * incompatibles debe mantenerse.
 *
 * ============================================================
 */

import { Conflict } from "./Conflict";
import { ConflictSeverity } from "./ConflictSeverity";
import { ConflictType } from "./ConflictType";

export class ConflictResolver {

    /**
     * Resuelve una colección de conflictos.
     */
    public resolve(

        conflicts: Conflict[]

    ): Conflict[] {

        return conflicts.map(

            c => this.resolveConflict(c)

        );

    }

    /**
     * Resolver un único conflicto.
     */
    public resolveConflict(

        conflict: Conflict

    ): Conflict {

        if (conflict.resolved) {

            return conflict;

        }

        switch (conflict.type) {

            case ConflictType.CPV_CONFLICT:

                return {

                    ...conflict,

                    resolved: true,

                    resolution:
                        "Se selecciona el CPV de mayor prioridad normativa."

                };

            case ConflictType.PROCEDURE_CONFLICT:

                return {

                    ...conflict,

                    resolved: true,

                    resolution:
                        "Se selecciona el procedimiento más restrictivo."

                };

            case ConflictType.DEADLINE_CONFLICT:

                return {

                    ...conflict,

                    resolved: true,

                    resolution:
                        "Se adopta el plazo más garantista."

                };

            case ConflictType.PUBLICITY_CONFLICT:

                return {

                    ...conflict,

                    resolved: true,

                    resolution:
                        "Se adopta el nivel superior de publicidad."

                };

            case ConflictType.SOLVENCY_CONFLICT:

                return {

                    ...conflict,

                    resolved: true,

                    resolution:
                        "Se mantiene la solvencia más exigente."

                };

            default:

                return {

                    ...conflict,

                    severity: ConflictSeverity.CRITICAL,

                    resolved: false,

                    resolution:
                        "Revisión jurídica manual requerida."

                };

        }

    }

}
