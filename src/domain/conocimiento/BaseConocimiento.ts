/**
 * CONTRATA IA
 * ---------------------------------------------------------
 * Base de conocimiento jurídico.
 *
 * Representa el conjunto de normas, artículos, criterios
 * e interpretaciones que utilizan los motores del sistema.
 * ---------------------------------------------------------
 */

import { ArticuloNormativo } from "../normativa/ArticuloNormativo";

export class BaseConocimiento {

    private readonly articulos: ArticuloNormativo[] = [];

    agregarArticulo(articulo: ArticuloNormativo): void {

        this.articulos.push(articulo);

    }

    obtenerArticulos(): readonly ArticuloNormativo[] {

        return this.articulos;

    }

}
