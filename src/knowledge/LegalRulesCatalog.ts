import { LegalRule } from "./LegalRule";

import { NecesidadRules } from "./rules/NecesidadRules";
import { ObjetoRules } from "./rules/ObjetoRules";
import { ProcedimientoRules } from "./rules/ProcedimientoRules";
import { SolvenciaRules } from "./rules/SolvenciaRules";
import { CriteriosAdjudicacionRules } from "./rules/CriteriosAdjudicacionRules";
import { PublicidadRules } from "./rules/PublicidadRules";

export class LegalRulesCatalog {

    /**
     * Devuelve todas las reglas jurídicas del sistema.
     */
    public obtenerTodas(): LegalRule[] {

        return [

            ...NecesidadRules,

            ...ObjetoRules,

            ...ProcedimientoRules,

            ...SolvenciaRules,

            ...CriteriosAdjudicacionRules,

            ...PublicidadRules

        ];

    }

    /**
     * Devuelve únicamente las reglas activas.
     */
    public obtenerActivas(): LegalRule[] {

        return this.obtenerTodas()

            .filter(

                regla => regla.activa

            );

    }

    /**
     * Busca reglas por artículo LCSP.
     */
    public buscarPorArticulo(
        articulo: string
    ): LegalRule[] {

        return this.obtenerTodas()

            .filter(

                regla =>

                    regla.articulo === articulo

            );

    }

    /**
     * Busca reglas utilizadas por un motor.
     */
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

    /**
     * Busca reglas que afectan a un documento.
     */
    public buscarPorDocumento(
        documento: string
    ): LegalRule[] {

        return this.obtenerTodas()

            .filter(

                regla =>

                    regla.documentos.includes(
                        documento
                    )

            );

    }

}
