/**
 * ============================================================
 * CONTRATA IA
 * ObjetoValidator
 * ============================================================
 *
 * Validador jurídico del objeto del contrato.
 *
 * Implementa las comprobaciones derivadas de los
 * artículos 99 a 102 de la LCSP.
 *
 * En esta primera versión contiene únicamente
 * validaciones generales.
 *
 * ============================================================
 */

import { ObjetoContrato } from "./ObjetoContrato";

export class ObjetoValidator {

    /**
     * Ejecuta todas las validaciones.
     */
    public validar(objeto: ObjetoContrato): string[] {

        const errores: string[] = [];

        errores.push(...this.validarTitulo(objeto));

        errores.push(...this.validarDescripcion(objeto));

        errores.push(...this.validarNecesidad(objeto));

        errores.push(...this.validarValor(objeto));

        errores.push(...this.validarDuracion(objeto));

        return errores;

    }

    /**
     * Comprueba el título.
     */
    private validarTitulo(objeto: ObjetoContrato): string[] {

        const errores: string[] = [];

        if (!objeto.titulo.trim()) {

            errores.push(
                "Debe indicarse el título del contrato."
            );

        }

        return errores;

    }

    /**
     * Comprueba la descripción.
     */
    private validarDescripcion(objeto: ObjetoContrato): string[] {

        const errores: string[] = [];

        if (objeto.descripcion.trim().length < 20) {

            errores.push(
                "La descripción del objeto resulta insuficiente."
            );

        }

        return errores;

    }

    /**
     * Comprueba la necesidad.
     */
    private validarNecesidad(objeto: ObjetoContrato): string[] {

        const errores: string[] = [];

        if (!objeto.necesidad.trim()) {

            errores.push(
                "Debe justificarse la necesidad administrativa."
            );

        }

        return errores;

    }

    /**
     * Comprueba el valor estimado.
     */
    private validarValor(objeto: ObjetoContrato): string[] {

        const errores: string[] = [];

        if (objeto.valorEstimado <= 0) {

            errores.push(
                "El valor estimado debe ser superior a cero."
            );

        }

        return errores;

    }

    /**
     * Comprueba la duración.
     */
    private validarDuracion(objeto: ObjetoContrato): string[] {

        const errores: string[] = [];

        if (objeto.duracionMeses <= 0) {

            errores.push(
                "Debe indicarse la duración del contrato."
            );

        }

        return errores;

    }

}
