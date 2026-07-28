/**
 * ============================================================
 * CONTRATA IA
 * PublicidadEngine
 * ============================================================
 *
 * Motor experto encargado de determinar
 * el régimen de publicidad de la licitación.
 *
 * Toda la lógica jurídica se encuentra
 * externalizada en:
 *
 * knowledge/rules/publicidad.rules.json
 *
 * ============================================================
 */

import * as path from "path";

import { BaseEngine } from "./BaseEngine";

import { RuleEngine } from "../domain/conocimiento/RuleEngine";
import { InferenceEngine } from "../domain/conocimiento/InferenceEngine";
import { DecisionJuridica } from "../domain/conocimiento/DecisionJuridica";

import { ExpedienteContext } from "../domain/expediente/ExpedienteContext";

import { TipoPublicidad } from "../domain/publicidad/TipoPublicidad";

export class PublicidadEngine extends BaseEngine {

    private readonly ruleEngine = new RuleEngine();

    private readonly inference: InferenceEngine;

    constructor() {

        super();

        this.ruleEngine.cargarReglas(

            path.join(

                process.cwd(),

                "knowledge",

                "rules",

                "publicidad.rules.json"

            )

        );

        this.inference =

            new InferenceEngine(

                this.ruleEngine

            );

    }

    /**
     * Ejecuta el motor de publicidad.
     */
    public ejecutar(

        contexto: ExpedienteContext

    ): DecisionJuridica<TipoPublicidad> {

        const decision =

            new DecisionJuridica<TipoPublicidad>();

        const evaluaciones =

            this.inference.evaluar(

                contexto as Record<string, unknown>

            );

        const regla =

            evaluaciones.find(

                r => r.cumplida

            );

        if (!regla) {

            decision.confianza = 0;

            decision.explicacion =

                "No existe ninguna regla de publicidad aplicable.";

            return decision;

        }

        const publicidad =

            regla.regla.resultado as TipoPublicidad;

        contexto.publicidad = publicidad;

        decision.resultado = publicidad;

        decision.confianza = 100;

        if (regla.regla.articulo) {

            decision.articulos.push(

                regla.regla.articulo

            );

        }

        decision.reglasAplicadas.push(

            regla.regla.id

        );

        decision.explicacion =

            regla.regla.nombre;

        return decision;

    }

}
