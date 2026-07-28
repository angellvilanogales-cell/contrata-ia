/**
 * ============================================================
 * CONTRATA IA
 * KnowledgeRepository
 * ============================================================
 *
 * Repositorio central del conocimiento jurídico.
 *
 * Centraliza el acceso a:
 *
 * - Reglas
 * - Cláusulas
 * - Plantillas
 * - Modelos
 * - Jurisprudencia
 * - Informes
 * - Umbrales
 * - CPV
 *
 * Ningún motor accederá directamente a los datos.
 *
 * ============================================================
 */

import { ReglaJuridica } from "../domain/conocimiento/ReglaJuridica";
import { KnowledgeCategory } from "../domain/conocimiento/KnowledgeCategory";

export class KnowledgeRepository {

    private readonly reglas = new Map<
        KnowledgeCategory,
        ReglaJuridica[]
    >();

    /**
     * Registra un conjunto de reglas.
     */
    public registrar(

        categoria: KnowledgeCategory,

        reglas: ReglaJuridica[]

    ): void {

        this.reglas.set(

            categoria,

            reglas

        );

    }

    /**
     * Obtiene todas las reglas de una categoría.
     */
    public obtener(

        categoria: KnowledgeCategory

    ): ReglaJuridica[] {

        return this.reglas.get(categoria) ?? [];

    }

    /**
     * Elimina una categoría.
     */
    public limpiar(

        categoria: KnowledgeCategory

    ): void {

        this.reglas.delete(categoria);

    }

    /**
     * Elimina todo el conocimiento cargado.
     */
    public limpiarTodo(): void {

        this.reglas.clear();

    }

}
