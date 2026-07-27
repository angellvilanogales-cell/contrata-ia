/**
 * CONTRATA IA
 * ---------------------------------------------------------
 * Referencia utilizada para motivar una decisión jurídica.
 * ---------------------------------------------------------
 */

import { ArticuloNormativo } from "./ArticuloNormativo";

export class ReferenciaNormativa {

    constructor(

        public readonly articulo: ArticuloNormativo,

        public readonly observaciones: string = ""

    ) {}

}
