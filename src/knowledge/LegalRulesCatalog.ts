import { LegalRule } from "./LegalRule";

import { NecesidadRules } from "./rules/NecesidadRules";
import { ObjetoRules } from "./rules/ObjetoRules";
import { ProcedimientoRules } from "./rules/ProcedimientoRules";
import { SolvenciaRules } from "./rules/SolvenciaRules";
import { CriteriosAdjudicacionRules } from "./rules/CriteriosAdjudicacionRules";

export class LegalRulesCatalog {

    public obtenerTodas(): LegalRule[] {

        return [

            ...NecesidadRules,

            ...ObjetoRules,

            ...ProcedimientoRules,

            ...SolvenciaRules,

            ...CriteriosAdjudicacionRules

        ];

    }

    public obtenerActivas(): LegalRule[] {

        return this.obtenerTodas().filter(

            regla => regla.activa

        );

    }

    public buscarPorArticulo(
        articulo: string
    ): LegalRule[] {

        return this.obtenerTodas().filter(

            regla => regla.articulo === articulo

        );

    }

    public buscarPorMotor(
        motor: string
    ): LegalRule[] {

        return this.obtenerTodas().filter(

            regla =>

                regla.motores.includes(motor)

        );

    }

}
