/**
 * ============================================================
 * CONTRATA IA
 * RepositorioCPV
 * ============================================================
 *
 * Contrato del repositorio de códigos CPV.
 *
 * Todas las implementaciones deberán ajustarse
 * a esta interfaz.
 *
 * ============================================================
 */

import { ResultadoBusquedaCPV } from "./ResultadoBusquedaCPV";

export interface RepositorioCPV {

    /**
     * Busca CPV a partir de una descripción.
     */
    buscarPorDescripcion(
        descripcion: string
    ): Promise<ResultadoBusquedaCPV[]>;

    /**
     * Busca un CPV por código.
     */
    buscarPorCodigo(
        codigo: string
    ): Promise<ResultadoBusquedaCPV | null>;

    /**
     * Busca CPV por palabra clave.
     */
    buscarPorPalabraClave(
        palabra: string
    ): Promise<ResultadoBusquedaCPV[]>;

    /**
     * Obtiene códigos relacionados.
     */
    obtenerRelacionados(
        codigo: string
    ): Promise<ResultadoBusquedaCPV[]>;

    /**
     * Comprueba si un código existe.
     */
    existe(
        codigo: string
    ): Promise<boolean>;

    /**
     * Comprueba si pertenece a una familia.
     */
    perteneceAFamilia(
        codigo: string,
        familia: string
    ): Promise<boolean>;

    /**
     * Devuelve el CPV principal.
     */
    obtenerPrincipal(
        resultados: ResultadoBusquedaCPV[]
    ): ResultadoBusquedaCPV | null;

    /**
     * Devuelve CPV secundarios.
     */
    obtenerSecundarios(
        resultados: ResultadoBusquedaCPV[]
    ): ResultadoBusquedaCPV[];

    /**
     * Obtiene todas las palabras clave
     * asociadas a un código.
     */
    obtenerPalabrasClave(
        codigo: string
    ): Promise<string[]>;

    /**
     * Obtiene la descripción oficial.
     */
    obtenerDescripcion(
        codigo: string
    ): Promise<string | null>;

}
