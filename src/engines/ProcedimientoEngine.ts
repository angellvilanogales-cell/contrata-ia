/**
 * ============================================================
 * CONTRATA IA
 * ProcedimientoEngine
 * ============================================================
 *
 * Motor encargado de determinar el procedimiento
 * de adjudicación utilizando exclusivamente el
 * banco de reglas jurídicas.
 *
 * Toda la lógica se encuentra externalizada en:
 *
 * knowledge/rules/procedimiento.rules.json
 *
 * ============================================================
 */

import * as path from "path";

import { BaseEngine } from "./BaseEngine";

import { RuleEngine } from "../domain/conocimiento/RuleEngine";
import { InferenceEngine } from "../domain/conocimiento/InferenceEngine";
import { DecisionJuridica } from "../domain/conocimiento/DecisionJuridica";
import { TipoProcedimiento } from "../domain/procedimiento/TipoProcedimiento";

export interface DatosProcedimiento {

    tipoContrato: string;

    valorEstimado: number;

}

export class ProcedimientoEngine extends BaseEngine {

    private readonly ruleEngine = new RuleEngine();

    private readonly inference: InferenceEngine;

    constructor() {

        super();

        this.ruleEngine.cargarReglas(

            path.join(

                process.cwd(),

                "knowledge",

                "rules",

                "procedimiento.rules.json"

            )

        );

        this.inference =

            new InferenceEngine(

                this.ruleEngine

            );

    }

    /**
     * Determina el procedimiento.
     */
    public determinar(

        datos: DatosProcedimiento

    ): DecisionJuridica<TipoProcedimiento> {

        const decision =

            new DecisionJuridica<TipoProcedimiento>();

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

                "No existe ninguna regla aplicable.";

            return decision;

        }

        decision.resultado =

            reglaAplicada.regla.resultado as TipoProcedimiento;

        decision.confianza = 100;

        decision.articulos.push(

            reglaAplicada.regla.articulo

        );

        decision.reglasAplicadas.push(

            reglaAplicada.regla.id

        );

        decision.explicacion =

            reglaAplicada.regla.nombre;

        return decision;

    }

}
