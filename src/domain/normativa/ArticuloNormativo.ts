/**
 * CONTRATA IA
 * ---------------------------------------------------------
 * Representa un artículo jurídico que fundamenta una
 * decisión administrativa.
 * ---------------------------------------------------------
 */

export class ArticuloNormativo {

    constructor(

        public readonly norma: string,

        public readonly articulo: string,

        public readonly texto: string

    ) {

        if (!norma.trim()) {

            throw new Error("Debe indicarse la norma.");

        }

        if (!articulo.trim()) {

            throw new Error("Debe indicarse el artículo.");

        }

    }

}
