/**
 * CONTRATA IA
 * =========================================================
 * Motivación jurídica de una decisión.
 *
 * Contiene el razonamiento jurídico que fundamenta la
 * decisión administrativa propuesta por el sistema.
 * =========================================================
 */

import { ReferenciaNormativa } from "../normativa/ReferenciaNormativa";

export class MotivacionJuridica {

    constructor(

        public readonly resumen: string,

        public readonly referencias: ReferenciaNormativa[] = []

    ) {

        if (!resumen.trim()) {
            throw new Error(
                "Debe existir una motivación jurídica."
            );
        }

    }

}
