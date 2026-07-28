import { LegalRule } from "./LegalRule";

import { NecesidadRules } from "./rules/NecesidadRules";
import { ObjetoRules } from "./rules/ObjetoRules";

export class LegalRulesCatalog {

    public obtenerTodas(): LegalRule[] {

        return [

            ...NecesidadRules,

            ...ObjetoRules

        ];

    }

    public obtenerActivas(): LegalRule[] {

        return this.obtenerTodas()

            .filter(

                regla => regla.activa

            );

    }

    public buscarPorArticulo(
        articulo: string
    ): LegalRule[] {

        return this.obtenerTodas()

            .filter(

                regla => regla.articulo === articulo

            );

    }

    public buscarPorMotor(
        motor: string
    ): LegalRule[] {

        return this.obtenerTodas()

            .filter(

                regla =>

                    regla.motores.includes(
                        motor
                    )

            );

    }

}
