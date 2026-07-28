/**
 * ============================================================
 * CONTRATA IA
 * RuleEngine
 * ============================================================
 *
 * Coordinador principal de los motores del sistema.
 *
 * Será el encargado de ejecutar:
 *
 * • CPVEngine
 * • ProcedimientoEngine
 * • PublicidadEngine
 * • DocumentEngine
 * • Motores futuros
 *
 * ============================================================
 */

export interface ResultadoEvaluacion {

    correcto: boolean;

    mensajes: string[];

}

export class RuleEngine {

    /**
     * Ejecuta todas las validaciones.
     */
    public evaluar(): ResultadoEvaluacion {

        return {

            correcto: true,

            mensajes: []

        };

    }

    /**
     * Añade un mensaje de validación.
     */
    public agregarMensaje(

        resultado: ResultadoEvaluacion,

        mensaje: string

    ): void {

        resultado.mensajes.push(

            mensaje

        );

    }

    /**
     * Comprueba si existen incidencias.
     */
    public tieneErrores(

        resultado: ResultadoEvaluacion

    ): boolean {

        return resultado.mensajes.length > 0;

    }

}
