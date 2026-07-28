/**
 * ============================================================
 * CONTRATA IA
 * RepositorioNormativo
 * ============================================================
 *
 * Repositorio central de acceso a la normativa.
 *
 * No interpreta la ley.
 * No aplica reglas.
 *
 * Únicamente localiza y suministra conocimiento jurídico.
 *
 * ============================================================
 */

import { ArticuloNormativo } from "./ArticuloNormativo";
import { CatalogoNormativo } from "./CatalogoNormativo";

export class RepositorioNormativo {

    constructor(
        private readonly catalogo: CatalogoNormativo
    ) {}

    /**
     * Devuelve un artículo por su identificador.
     */
    public obtenerArticulo(
        id: string
    ): ArticuloNormativo | undefined {

        return this.catalogo.obtener(id);

    }

    /**
     * Devuelve todos los artículos.
     */
    public obtenerTodos(): ArticuloNormativo[] {

        return this.catalogo.obtenerTodos();

    }

    /**
     * Busca artículos por norma.
     */
    public buscarPorNorma(
        norma: string
    ): ArticuloNormativo[] {

        return this.catalogo.buscarPorNorma(norma);

    }

    /**
     * Busca artículos por palabra clave.
     */
    public buscarPorPalabraClave(
        palabra: string
    ): ArticuloNormativo[] {

        return this.catalogo.buscarPorPalabraClave(palabra);

    }

    /**
     * Devuelve únicamente artículos vigentes.
     */
    public obtenerVigentes(
        fecha: Date = new Date()
    ): ArticuloNormativo[] {

        return this.catalogo.obtenerVigentes(fecha);

    }

    /**
     * Registra un nuevo artículo.
     */
    public registrar(
        articulo: ArticuloNormativo
    ): void {

        this.catalogo.agregar(articulo);

    }

    /**
     * Número total de artículos.
     */
    public totalArticulos(): number {

        return this.catalogo.total();

    }

}
