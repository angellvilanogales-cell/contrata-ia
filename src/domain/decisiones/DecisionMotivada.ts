/**
 * CONTRATA IA
 * =========================================================
 * Decisión administrativa motivada.
 *
 * Une una decisión con su fundamentación jurídica.
 * =========================================================
 */

import { DecisionAdministrativa } from "./DecisionAdministrativa";
import { MotivacionJuridica } from "./MotivacionJuridica";

export class DecisionMotivada {

    constructor(

        public readonly decision: DecisionAdministrativa,

        public readonly motivacion: MotivacionJuridica

    ) {}

}
