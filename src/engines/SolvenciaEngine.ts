/**
 * ============================================================
 * CONTRATA IA
 * SolvenciaEngine
 * ============================================================
 *
 * Motor encargado de determinar automáticamente
 * el régimen de solvencia aplicable conforme a la LCSP.
 *
 * Toda la lógica jurídica se encuentra externalizada en:
 *
 * knowledge/rules/solvencia.rules.json
 *
 * ============================================================
 */

import * as path from "path";

import { BaseEngine } from "./BaseEngine";

import { RuleEngine } from "../domain/conocimiento/RuleEngine";
import { InferenceEngine } from "../domain/conocimiento/InferenceEngine";
import { DecisionJuridica } from "../domain/conocimiento/DecisionJuridica";

export interface DatosSolvencia {

    procedimiento: string;

    tipoContrato: string;

    valorEstimado: number;

}

export class SolvenciaEngine extends BaseEngine {

    private readonly ruleEngine = new RuleEngine();

    private readonly inference: InferenceEngine;

    constructor() {

        super();

        this.ruleEngine.cargarReglas(

            path.join(

                process.cwd(),

                "knowledge",

                "rules",

                "solvencia.rules.json"

            )

        );

        this.inference =

            new InferenceEngine(

                this.ruleEngine

            );

    }

    /**
     * Determina el régimen de solvencia.
     */
    public determinar(

        datos: DatosSolvencia

    ): DecisionJuridica<string> {

        const decision =

            new DecisionJuridica<string>();

        const evaluaciones =

            this.inference.evaluar(

                datos as Record<string, unknown>

            );

        const reglaAplicada =

            evaluaciones.find(

                r => r.cumplida

            );

        if (!reglaAplicada) {

            decision.confianza = 0;

            decision.explicacion =

                "No existe ninguna regla de solvencia aplicable.";

            return decision;

        }

        decision.resultado =

            String(

                reglaAplicada.regla.resultado

            );

        decision.confianza = 100;

        if (reglaAplicada.regla.articulo) {

            decision.articulos.push(

                reglaAplicada.regla.articulo

            );

        }

        decision.reglasAplicadas.push(

            reglaAplicada.regla.id

        );

        decision.explicacion =

            reglaAplicada.regla.nombre;

        return decision;

    }

}
