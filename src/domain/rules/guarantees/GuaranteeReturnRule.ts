/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * GuaranteeReturnRule
 * ------------------------------------------------------------
 * Gestión de devolución, cancelación e incautación
 * de garantías.
 *
 * LCSP
 * Arts. 111 y siguientes
 *
 * ============================================================
 */

import {

    GuaranteeRequirement,
    GuaranteeStatus

} from "./GuaranteeTypes";

export interface GuaranteeReturnContext {

    contractFinished: boolean;

    finalReception: boolean;

    warrantyPeriodFinished: boolean;

    pendingResponsibilities: boolean;

    penaltiesPending: boolean;

    judicialProceedings: boolean;

}

export class GuaranteeReturnRule {

    /**
     * =====================================================
     * ¿PUEDE DEVOLVERSE?
     * =====================================================
     */

    public canReturn(

        context: GuaranteeReturnContext

    ): boolean {

        if (!context.contractFinished) {

            return false;

        }

        if (!context.finalReception) {

            return false;

        }

        if (!context.warrantyPeriodFinished) {

            return false;

        }

        if (context.pendingResponsibilities) {

            return false;

        }

        if (context.penaltiesPending) {

            return false;

        }

        if (context.judicialProceedings) {

            return false;

        }

        return true;

    }

    /**
     * =====================================================
     * ¿PUEDE CANCELARSE?
     * =====================================================
     */

    public canCancel(

        context: GuaranteeReturnContext

    ): boolean {

        return this.canReturn(

            context

        );

    }

    /**
     * =====================================================
     * ¿PUEDE INCAUTARSE?
     * =====================================================
     */

    public canForfeit(

        context: GuaranteeReturnContext

    ): boolean {

        return (

            context.pendingResponsibilities ||

            context.penaltiesPending

        );

    }

    /**
     * =====================================================
     * ACTUALIZA EL ESTADO
     * =====================================================
     */

    public updateStatus(

        guarantee: GuaranteeRequirement,

        context: GuaranteeReturnContext

    ): GuaranteeRequirement {

        const copy = {

            ...guarantee

        };

        if (

            this.canForfeit(

                context

            )

        ) {

            copy.status =

                GuaranteeStatus.FORFEITED;

            return copy;

        }

        if (

            this.canReturn(

                context

            )

        ) {

            copy.status =

                GuaranteeStatus.RETURNED;

            return copy;

        }

        return copy;

    }

    /**
     * =====================================================
     * JUSTIFICACIÓN
     * =====================================================
     */

    public justification(

        context: GuaranteeReturnContext

    ): string {

        if (

            this.canForfeit(

                context

            )

        ) {

            return "Procede la incautación de la garantía al existir responsabilidades pendientes.";

        }

        if (

            this.canReturn(

                context

            )

        ) {

            return "Procede la devolución de la garantía al haberse extinguido todas las responsabilidades.";

        }

        return "La garantía debe permanecer vigente.";

    }

    /**
     * =====================================================
     * OBSERVACIONES
     * =====================================================
     */

    public observations(

        context: GuaranteeReturnContext

    ): string[] {

        const list: string[] = [];

        if (

            context.pendingResponsibilities

        ) {

            list.push(

                "Existen responsabilidades pendientes."

            );

        }

        if (

            context.penaltiesPending

        ) {

            list.push(

                "Existen penalidades pendientes."

            );

        }

        if (

            context.judicialProceedings

        ) {

            list.push(

                "Existe procedimiento judicial relacionado."

            );

        }

        if (

            context.warrantyPeriodFinished === false

        ) {

            list.push(

                "No ha finalizado el plazo de garantía."

            );

        }

        return list;

    }

}
