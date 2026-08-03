/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ProfessionalSolvencyRule
 * ------------------------------------------------------------
 * Determina la solvencia profesional exigible.
 * ============================================================
 */

import {
    SolvencyContext,
    SolvencyRequirement,
    SolvencyType,
    SolvencyLevel
} from "./SolvencyTypes";

import { UUID } from "../../common/types";
import { ContractType } from "../../legal/types";

export class ProfessionalSolvencyRule {

    /**
     * =====================================================
     * EVALUACIÓN PRINCIPAL
     * =====================================================
     */

    public evaluate(

        context: SolvencyContext

    ): SolvencyRequirement {

        if (this.requiresProfessionalCapacity(context)) {

            return this.professional();

        }

        return this.notRequired();

    }

    /**
     * =====================================================
     * DETERMINA SI PROCEDE
     * =====================================================
     */

    private requiresProfessionalCapacity(

        context: SolvencyContext

    ): boolean {

        switch (context.contractType) {

            case ContractType.SERVICES:

                return true;

            default:

                return false;

        }

    }

    /**
     * =====================================================
     * RESULTADOS
     * =====================================================
     */

    private professional(): SolvencyRequirement {

        return {

            id: crypto.randomUUID() as UUID,

            type: SolvencyType.PROFESSIONAL,

            required: true,

            level: SolvencyLevel.NORMAL,

            justification:

                "Debe acreditarse la habilitación profesional para la ejecución del contrato.",

            legalReference:

                "LCSP - Solvencia profesional",

            observations: [

                "Colegiación cuando proceda.",

                "Autorizaciones administrativas.",

                "Habilitaciones sectoriales.",

                "Inscripciones obligatorias."

            ]

        };

    }

    private notRequired(): SolvencyRequirement {

        return {

            id: crypto.randomUUID() as UUID,

            type: SolvencyType.PROFESSIONAL,

            required: false,

            level: SolvencyLevel.NONE,

            justification:

                "No procede exigir habilitación profesional específica.",

            legalReference:

                "LCSP"

        };

    }

    /**
     * =====================================================
     * UTILIDADES FUTURAS
     * =====================================================
     */

    public requiresProfessionalRegistry(

        context: SolvencyContext

    ): boolean {

        return this.requiresProfessionalCapacity(context);

    }

    public requiresProfessionalLicence(

        context: SolvencyContext

    ): boolean {

        return this.requiresProfessionalCapacity(context);

    }

    public requiresProfessionalCollege(

        context: SolvencyContext

    ): boolean {

        return this.requiresProfessionalCapacity(context);

    }

}
