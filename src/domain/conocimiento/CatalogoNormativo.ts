/**
 * ============================================================
 * CONTRATA IA
 * CatalogoNormativo
 * ============================================================
 *
 * Catálogo en memoria de artículos normativos.
 *
 * No interpreta la norma.
 *
 * No toma decisiones.
 *
 * Su única responsabilidad consiste en localizar
 * conocimiento jurídico.
 *
 * ============================================================
 */

import { ArticuloNormativo } from "./ArticuloNormativo";

export class CatalogoNormativo {

    private readonly articulos: Map<string, ArticuloNormativo> =
        new Map();

    /**
     * Añade un artículo.
     */
    public agregar(
        articulo: ArticuloNormativo
    ): void {

        this.articulos.set(
            articulo.id,
            articulo
        );

    }

    /**
     * Obtiene un artículo.
     */
    public obtener(
        id: string
    ): ArticuloNormativo | undefined {

        return this.articulos.get(id);

    }

    /**
     * Devuelve todos.
     */
    public obtenerTodos(): ArticuloNormativo[] {

        return [...this.articulos.values()];

    }

    /**
     * Busca artículos por palabra clave.
     */
    public buscarPorPalabraClave(
        palabra: string
    ): ArticuloNormativo[] {

        const criterio = palabra.toLowerCase();

        return this.obtenerTodos().filter(a =>
            a.contienePalabraClave(criterio)
        );

    }

    /**
     * Busca artículos de una norma.
     */
    public buscarPorNorma(
        norma: string
    ): ArticuloNormativo[] {

        const criterio = norma.toLowerCase();

        return this.obtenerTodos().filter(a =>
            a.norma.toLowerCase() === criterio
        );

    }

    /**
     * Devuelve únicamente los artículos vigentes.
     */
    public obtenerVigentes(
        fecha: Date = new Date()
    ): ArticuloNormativo[] {

        return this.obtenerTodos().filter(a =>
            a.estaVigente(fecha)
        );

    }

    /**
     * Número de artículos cargados.
     */
    public total(): number {

        return this.articulos.size;

    }

    /**
     * Elimina todos los artículos.
     */
    public limpiar(): void {

        this.articulos.clear();

    }

}
