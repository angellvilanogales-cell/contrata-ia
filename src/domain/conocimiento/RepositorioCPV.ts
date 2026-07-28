/**
 * =========================================================
 * CONTRATA IA
 * Repositorio de códigos CPV
 * =========================================================
 *
 * Contrato de acceso al catálogo CPV.
 *
 * Su implementación podrá utilizar:
 *
 * • JSON
 * • Base de datos
 * • API
 * • IA
 *
 * sin modificar el resto del sistema.
 * =========================================================
 */

export interface ResultadoBusquedaCPV {

    codigo: string;

    descripcion: string;

    principal: boolean;

    confianza: number;

    palabrasClave: string[];

}

export interface RepositorioCPV {

    /**
     * Busca CPV por descripción libre.
     */
    buscarPorDescripcion(
        descripcion: string
    ): Promise<ResultadoBusquedaCPV[]>;

    /**
     * Busca un CPV por su código.
     */
    buscarPorCodigo(
        codigo: string
    ): Promise<ResultadoBusquedaCPV | null>;

    /**
     * Busca por palabra clave.
     */
    buscarPorPalabraClave(
        palabra: string
    ): Promise<ResultadoBusquedaCPV[]>;

    /**
     * Devuelve CPV relacionados.
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
     * Comprueba si un código pertenece
     * a una familia determinada.
     */
    perteneceAFamilia(
        codigo: string,
        familia: string
    ): Promise<boolean>;

    /**
     * Obtiene el CPV principal.
     */
    obtenerPrincipal(
        resultados: ResultadoBusquedaCPV[]
    ): ResultadoBusquedaCPV | null;

    /**
     * Obtiene CPV secundarios.
     */
    obtenerSecundarios(
        resultados: ResultadoBusquedaCPV[]
    ): ResultadoBusquedaCPV[];

}
