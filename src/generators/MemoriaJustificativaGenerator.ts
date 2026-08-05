/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * MemoriaJustificativaGenerator
 * ------------------------------------------------------------
 * ADAPTADOR DE COMPATIBILIDAD
 *
 * Mantiene la API antigua mientras delega toda la generación
 * documental en la nueva arquitectura.
 *
 * ESTE ARCHIVO DESAPARECERÁ CUANDO SE ELIMINE LA CARPETA
 * src/generators
 *
 * ============================================================
 */

import { ExpedienteContext } from "../domain/expediente/ExpedienteContext";

import { MemoryGenerator } from "../domain/documental/generators/MemoryGenerator";

import { DocumentContext } from "../domain/documental/DocumentContext";

export class MemoriaJustificativaGenerator {

    /**
     * Mantiene compatibilidad con el código antiguo.
     */
    public async generar(

        contexto: ExpedienteContext

    ): Promise<string> {

        const documentContext =

            new DocumentContext(

                contexto

            );

        const generator =

            new MemoryGenerator(

                documentContext

            );

        return generator.generate();

    }

}
