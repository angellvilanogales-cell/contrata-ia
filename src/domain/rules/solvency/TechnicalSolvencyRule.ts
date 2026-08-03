/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * TechnicalSolvencyRule
 * ------------------------------------------------------------
 * Determina los requisitos de solvencia técnica.
 *
 * ============================================================
 */

import {
    SolvencyContext,
    SolvencyRequirement,
    SolvencyType,
    SolvencyLevel
} from "./SolvencyTypes";

import { UUID } from "../../common/types";
import { ContractType, ProcedureType } from "../../legal/types";

export class TechnicalSolvencyRule {

    /**
     * =====================================================
     * EVALUACIÓN PRINCIPAL
     * =====================================================
     */

    public evaluate(

        context: SolvencyContext

    ): SolvencyRequirement {

        if (this.isMinor(context)) {

            return this.none();

        }

        if (this.isWorks(context)) {

            return this.works();

        }

        if (this.requiresHigh(context)) {

            return this.high();

        }

        if (this.requiresNormal(context)) {

            return this.normal();

        }

        return this.basic();

    }

    /**
     * =====================================================
     * CONTRATO MENOR
     * =====================================================
     */

    private isMinor(

        context: SolvencyContext

    ): boolean {

        return context.procedure === ProcedureType.MINOR;

    }

    /**
     * =====================================================
     * CONTRATO DE OBRAS
     * =====================================================
     */

    private isWorks(

        context: SolvencyContext

    ): boolean {

        return context.contractType === ContractType.WORKS;

    }

    /**
     * =====================================================
     * NIVEL ALTO
     * =====================================================
     */

    private requiresHigh(

        context: SolvencyContext

    ): boolean {

        return (

            context.europeanThreshold ||

            context.estimatedValue > 1000000

        );

    }

    /**
     * =====================================================
     * NIVEL NORMAL
     * =====================================================
     */

    private requiresNormal(

        context: SolvencyContext

    ): boolean {

        return (

            context.procedure === ProcedureType.OPEN ||

            context.procedure === ProcedureType.RESTRICTED ||

            context.procedure === ProcedureType.NEGOTIATED

        );

    }

    /**
     * =====================================================
     * RESULTADOS
     * =====================================================
     */

    private none(): SolvencyRequirement {

        return {

            id: crypto.randomUUID() as UUID,

            type: SolvencyType.TECHNICAL,

            required: false,

            level: SolvencyLevel.NONE,

            justification:

                "No procede exigir solvencia técnica.",

            legalReference:

                "LCSP"

        };

    }

    private basic(): SolvencyRequirement {

        return {

            id: crypto.randomUUID() as UUID,

            type: SolvencyType.TECHNICAL,

            required: true,

            level: SolvencyLevel.BASIC,

            justification:

                "Debe acreditarse capacidad técnica básica.",

            legalReference:

                "LCSP"

        };

    }

    private normal(): SolvencyRequirement {

        return {

            id: crypto.randomUUID() as UUID,

            type: SolvencyType.TECHNICAL,

            required: true,

            level: SolvencyLevel.NORMAL,

            justification:

                "Debe acreditarse experiencia suficiente para ejecutar el contrato.",

            legalReference:

                "LCSP"

        };

    }

    private high(): SolvencyRequirement {

        return {

            id: crypto.randomUUID() as UUID,

            type: SolvencyType.TECHNICAL,

            required: true,

            level: SolvencyLevel.HIGH,

            justification:

                "La complejidad del contrato exige una solvencia técnica reforzada.",

            legalReference:

                "LCSP"

        };

    }

    private works(): SolvencyRequirement {

        return {

            id: crypto.randomUUID() as UUID,

            type: SolvencyType.TECHNICAL,

            required: true,

            level: SolvencyLevel.HIGH,

            justification:

                "En contratos de obras debe acreditarse experiencia en trabajos similares.",

            legalReference:

                "LCSP"

        };

    }

}
