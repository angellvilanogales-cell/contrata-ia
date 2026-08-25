/**
 * ============================================================
 * CONTRATA IA
 * ObjetoValidator
 * ============================================================
 *
 * Validador del objeto y de la necesidad administrativa.
 *
 * El objeto se contrasta principalmente con los artículos 28 y 99 LCSP.
 * Presupuesto, valor estimado, precio y duración disponen de sus propios
 * dominios y no deben convertir en inválida una descripción de objeto que se
 * encuentra todavía en fase inicial del expediente.
 * ============================================================
 */

import { ObjetoContrato } from "./ObjetoContrato";

export class ObjetoValidator {

    /**
     * Ejecuta solo las validaciones que pertenecen semánticamente al objeto.
     * No exige VE, PBL ni duración: hacerlo aquí duplicaría los motores
     * económico y de plazo y produciría falsos bloqueos tempranos.
     */
    public validar(objeto: ObjetoContrato): string[] {

        const errores: string[] = [];

        errores.push(...this.validarTitulo(objeto));
        errores.push(...this.validarDescripcion(objeto));
        errores.push(...this.validarNecesidad(objeto));

        return errores;

    }

    private validarTitulo(objeto: ObjetoContrato): string[] {

        if (!objeto.titulo.trim()) {
            return ["Debe indicarse el título del contrato."];
        }

        return [];

    }

    private validarDescripcion(objeto: ObjetoContrato): string[] {

        const normalizada = objeto.descripcion.trim().replace(/\s+/g, " ");

        if (!normalizada) {
            return ["Debe describirse el objeto del contrato."];
        }

        if (normalizada.length < 20) {
            return ["La descripción del objeto resulta insuficiente para delimitar la prestación."];
        }

        return [];

    }

    private validarNecesidad(objeto: ObjetoContrato): string[] {

        if (!objeto.necesidad.trim()) {
            return ["Debe justificarse la necesidad administrativa conforme al artículo 28 LCSP."];
        }

        return [];

    }

}
