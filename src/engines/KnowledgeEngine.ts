/**
 * ============================================================
 * CONTRATA IA
 * KnowledgeEngine
 * ============================================================
 *
 * Motor central de acceso al conocimiento.
 *
 * Este motor NO toma decisiones.
 *
 * Su única responsabilidad es localizar el conocimiento
 * necesario para que los distintos motores jurídicos
 * puedan razonar.
 *
 * ============================================================
 */

import { RepositorioCPV } from "../domain/conocimiento/RepositorioCPV";
import { ResultadoBusquedaCPV } from "../domain/conocimiento/ResultadoBusquedaCPV";

export class KnowledgeEngine {

    constructor(
        private readonly repositorioCPV: RepositorioCPV
    ) {}

    /**
     * Obtiene candidatos CPV a partir
     * de una descripción.
     */
    public async obtenerCandidatosCPV(
        descripcion: string
    ): Promise<ResultadoBusquedaCPV[]> {

        return this.repositorioCPV.buscarPorDescripcion(
            descripcion
        );

    }

    /**
     * Comprueba si un código existe.
     */
    public async existeCPV(
        codigo: string
    ): Promise<boolean> {

        return this.repositorioCPV.existe(codigo);

    }

    /**
     * Obtiene la descripción oficial
     * de un CPV.
     */
    public async obtenerDescripcionCPV(
        codigo: string
    ): Promise<string | null> {

        return this.repositorioCPV.obtenerDescripcion(
            codigo
        );

    }

    /**
     * Obtiene las palabras clave
     * asociadas a un CPV.
     */
    public async obtenerPalabrasClaveCPV(
        codigo: string
    ): Promise<string[]> {

        return this.repositorioCPV.obtenerPalabrasClave(
            codigo
        );

    }

}
