/**
 * CONTRATA IA
 * =========================================================
 * MOTOR JURÍDICO LCSP
 * =========================================================
 *
 * Este componente constituye el núcleo del sistema experto.
 *
 * Su misión será transformar los hechos administrativos
 * introducidos por la persona usuaria en decisiones
 * administrativas motivadas conforme a la LCSP.
 */

import { HechoAdministrativo } from "../hechos/HechoAdministrativo";
import { DecisionAdministrativa } from "../decisiones/DecisionAdministrativa";
import { BaseConocimiento } from "../conocimiento/BaseConocimiento";

export class MotorJuridicoLCSP {

    constructor(
        private readonly baseConocimiento: BaseConocimiento
    ) {}

    public async evaluar(
        hechos: HechoAdministrativo[]
    ): Promise<DecisionAdministrativa[]> {

        /**
         * IMPLEMENTACIÓN FUTURA
         *
         * 1. Analizar hechos.
         * 2. Buscar artículos aplicables.
         * 3. Aplicar reglas jurídicas.
         * 4. Generar decisiones motivadas.
         */

        return [];

    }

}
