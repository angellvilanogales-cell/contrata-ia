/**
 * CONTRATA IA
 * ---------------------------------------------------------
 * Representa una norma jurídica completa.
 * ---------------------------------------------------------
 */

import { ArticuloNormativo } from "./ArticuloNormativo";

export class Norma {

    constructor(

        public readonly codigo: string,

        public readonly nombre: string,

        public readonly fechaPublicacion: Date,

        public readonly articulos: ArticuloNormativo[] = []

    ) {

        if (!codigo.trim()) {
            throw new Error("El código de la norma es obligatorio.");
        }

        if (!nombre.trim()) {
            throw new Error("El nombre de la norma es obligatorio.");
        }

    }

    agregarArticulo(articulo: ArticuloNormativo): void {

        this.articulos.push(articulo);

    }

}
