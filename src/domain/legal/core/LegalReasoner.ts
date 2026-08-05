/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * LegalReasoner
 * ------------------------------------------------------------
 * Núcleo de razonamiento jurídico.
 *
 * Responsabilidades:
 *
 * • Analizar el resultado de la inferencia.
 * • Resolver conflictos.
 * • Construir las justificaciones.
 * • Preparar la decisión jurídica.
 *
 * NO genera documentos.
 * NO ejecuta reglas.
 *
 * ============================================================
 */

import { Conflict } from "./Conflict";
import { ConflictResolver } from "./ConflictResolver";
import { InferenceResult } from "./InferenceResult";
import { LegalJustificationEngine } from "./LegalJustificationEngine";

export interface LegalReasoningResult {

    inference: InferenceResult;

    resolvedConflicts: Conflict[];

    legalJustifications: ReturnType<LegalJustificationEngine["build"]>;

    success: boolean;

}

export class LegalReasoner {

    constructor(

        private readonly conflictResolver: ConflictResolver,

        private readonly justificationEngine: LegalJustificationEngine

    ) {}

    /**
     * =====================================================
     * Ejecuta el razonamiento jurídico.
     * =====================================================
     */
    public reason(

        inference: InferenceResult,

        conflicts: Conflict[]

    ): LegalReasoningResult {

        const resolved =

            this.conflictResolver.resolve(conflicts);

        this.justificationEngine.clear();

        for (const execution of inference.executions) {

            for (const ref of execution.result.legalReferences) {

                this.justificationEngine.add(

                    execution.ruleId,

                    ref.normativa,

                    ref.articulo,

                    ref.descripcion ??
                    "Aplicación automática de la regla."

                );

            }

        }

        return {

            inference,

            resolvedConflicts: resolved,

            legalJustifications:

                this.justificationEngine.build(),

            success:

                inference.success &&
                resolved.every(c => c.resolved)

        };

    }

}
