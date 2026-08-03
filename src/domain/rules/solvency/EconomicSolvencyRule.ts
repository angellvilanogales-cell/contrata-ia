/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * EconomicSolvencyRule
 * ------------------------------------------------------------
 * Determina los requisitos de solvencia económica y financiera.
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

export class EconomicSolvencyRule {

    /**
     * Evalúa la solvencia económica exigible.
     */
    public evaluate(
        context: SolvencyContext
    ): SolvencyRequirement {

        if (this.isMinor(context)) {
            return this.none();
        }

        if (this.requiresHighLevel(context)) {
            return this.high();
        }

        if (this.requiresNormalLevel(context)) {
            return this.normal();
        }

        return this.basic();
    }

    /* ============================================================
     * CONTRATO MENOR
     * ============================================================
     */

    private isMinor(
        context: SolvencyContext
    ): boolean {

        return context.procedure === ProcedureType.MINOR;
    }

    /* ============================================================
     * NIVEL ALTO
     * ============================================================
     */

    private requiresHighLevel(
        context: SolvencyContext
    ): boolean {

        return (
            context.europeanThreshold ||
            context.estimatedValue > 1000000 ||
            context.contractType === ContractType.WORKS
        );
    }

    /* ============================================================
     * NIVEL NORMAL
     * ============================================================
     */

    private requiresNormalLevel(
        context: SolvencyContext
    ): boolean {

        return (
            context.procedure === ProcedureType.OPEN ||
            context.procedure === ProcedureType.RESTRICTED ||
            context.procedure === ProcedureType.NEGOTIATED
        );
    }

    /* ============================================================
     * RESULTADOS
     * ============================================================
     */

    private none(): SolvencyRequirement {

        return {

            id: crypto.randomUUID() as UUID,

            type: SolvencyType.ECONOMIC,

            required: false,

            level: SolvencyLevel.NONE,

            justification:
                "No procede exigir solvencia económica.",

            legalReference:
                "LCSP"

        };

    }

    private basic(): SolvencyRequirement {

        return {

            id: crypto.randomUUID() as UUID,

            type: SolvencyType.ECONOMIC,

            required: true,

            level: SolvencyLevel.BASIC,

            justification:
                "Procede una acreditación económica básica.",

            legalReference:
                "LCSP"

        };

    }

    private normal(): SolvencyRequirement {

        return {

            id: crypto.randomUUID() as UUID,

            type: SolvencyType.ECONOMIC,

            required: true,

            level: SolvencyLevel.NORMAL,

            justification:
                "Debe acreditarse solvencia económica conforme al procedimiento.",

            legalReference:
                "LCSP"

        };

    }

    private high(): SolvencyRequirement {

        return {

            id: crypto.randomUUID() as UUID,

            type: SolvencyType.ECONOMIC,

            required: true,

            level: SolvencyLevel.HIGH,

            justification:
                "Debe exigirse una solvencia económica reforzada por el valor o naturaleza del contrato.",

            legalReference:
                "LCSP"

        };

    }

}
