/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * InferenceEngine
 * ------------------------------------------------------------
 * Motor de ejecución de reglas jurídicas.
 *
 * Responsabilidades:
 *
 *  • Ejecutar reglas.
 *  • Respetar prioridades.
 *  • Registrar trazabilidad.
 *  • Detectar conflictos.
 *
 * NO interpreta resultados.
 * NO toma decisiones finales.
 *
 * ============================================================
 */

import { DecisionContext } from "./DecisionContext";
import {
    InferenceRule,
    RuleExecutionResult
} from "./InferenceRule";
import {
    InferenceResult,
    RuleExecution
} from "./InferenceResult";
import {
    InferenceTrace,
    ExecutedRule
} from "./InferenceTrace";

export class InferenceEngine {

    /**
     * Ejecuta todas las reglas.
     */
    public execute(

        context: DecisionContext,

        rules: InferenceRule[]

    ): {

        result: InferenceResult;

        trace: InferenceTrace;

    } {

        const orderedRules = [...rules].sort(

            (a, b) => b.priority - a.priority

        );

        const executions: RuleExecution[] = [];

        const traceRules: ExecutedRule[] = [];

        const references = [];

        const warnings: string[] = [];

        const errors: string[] = [];

        const engineStart = Date.now();

        for (const rule of orderedRules) {

            const start = Date.now();

            let executed = false;

            let applied = false;

            let executionResult: RuleExecutionResult;

            try {

                if (rule.condition(context)) {

                    executed = true;

                    executionResult = rule.execute(context);

                    applied = executionResult.applied;

                    executions.push({

                        ruleId: rule.id,

                        module: rule.module,

                        result: executionResult

                    });

                    references.push(

                        ...executionResult.legalReferences

                    );

                    if (executionResult.message) {

                        warnings.push(

                            executionResult.message

                        );

                    }

                } else {

                    executionResult = {

                        applied: false,

                        legalReferences: []

                    };

                }

            } catch (e) {

                executionResult = {

                    applied: false,

                    message:

                        e instanceof Error

                            ? e.message

                            : "Error desconocido",

                    legalReferences: []

                };

                errors.push(

                    executionResult.message ?? "Error"

                );

            }

            traceRules.push({

                ruleId: rule.id,

                module: rule.module,

                executed,

                applied,

                priority: rule.priority,

                executionTimeMs:

                    Date.now() - start,

                message:

                    executionResult.message

            });

        }

        const trace: InferenceTrace = {

            timestamp: new Date(),

            engineVersion: "1.0.0",

            executionTimeMs:

                Date.now() - engineStart,

            executedRules: traceRules

        };

        const result: InferenceResult = {

            success:

                errors.length === 0,

            executions,

            references,

            warnings,

            errors

        };

        return {

            result,

            trace

        };

    }

}
