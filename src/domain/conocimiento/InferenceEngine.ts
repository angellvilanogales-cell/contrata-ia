/**
 * ============================================================
 * CONTRATA IA
 * InferenceEngine
 * ============================================================
 *
 * Motor genérico de inferencia.
 *
 * Todos los motores jurídicos deberán utilizar esta clase
 * para evaluar reglas.
 *
 * No conoce la LCSP.
 * No conoce CPV.
 * No conoce procedimientos.
 *
 * Únicamente evalúa reglas.
 *
 * ============================================================
 */

import { ReglaJuridica } from "./ReglaJuridica";

export class InferenceEngine {

    /**
     * Devuelve la primera regla válida.
     */
    public evaluarPrimera<T>(

        reglas: ReglaJuridica[],

        contexto: T,

        evaluador: (
            regla: ReglaJuridica,
            contexto: T
        ) => boolean

    ): ReglaJuridica | undefined {

        for (const regla of reglas) {

            if (!regla.disponible()) {
                continue;
            }

            if (evaluador(regla, contexto)) {
                return regla;
            }

        }

        return undefined;

    }

    /**
     * Devuelve todas las reglas válidas.
     */
    public evaluarTodas<T>(

        reglas: ReglaJuridica[],

        contexto: T,

        evaluador: (
            regla: ReglaJuridica,
            contexto: T
        ) => boolean

    ): ReglaJuridica[] {

        return reglas.filter(regla =>

            regla.disponible() &&

            evaluador(regla, contexto)

        );

    }

    /**
     * Ordena reglas por prioridad.
     */
    public ordenar(

        reglas: ReglaJuridica[]

    ): ReglaJuridica[] {

        return [...reglas].sort(

            (a, b) =>

                b.prioridad - a.prioridad

        );

    }

}
