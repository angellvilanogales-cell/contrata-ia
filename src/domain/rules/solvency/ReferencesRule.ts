/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ReferencesRule
 * ------------------------------------------------------------
 * Evaluación de experiencia mediante contratos similares.
 *
 * LCSP
 * Arts. 74–90
 *
 * ============================================================
 */

import { UUID } from "../../common/types";

import {
    ContractType,
    ProcedureType
} from "../../legal/types";

import {
    SolvencyContext,
    SolvencyRequirement,
    SolvencyType,
    SolvencyLevel
} from "./SolvencyTypes";

/* ============================================================
 * REFERENCIA
 * ============================================================
 */

export interface ContractReference {

    title: string;

    contractingAuthority: string;

    executionYear: number;

    amount: number;

    cpv?: string;

    completed: boolean;

}

/* ============================================================
 * REGLA
 * ============================================================
 */

export class ReferencesRule {

    /**
     * =====================================================
     * EVALUACIÓN
     * =====================================================
     */

    public evaluate(

        context: SolvencyContext

    ): SolvencyRequirement {

        return {

            id:

                crypto.randomUUID() as UUID,

            type:

                SolvencyType.REFERENCES,

            required:

                this.referencesRequired(

                    context

                ),

            level:

                this.level(

                    context

                ),

            justification:

                "Debe acreditarse experiencia mediante contratos ejecutados de naturaleza similar.",

            legalReference:

                "LCSP arts. 74–90",

            observations:

                this.requiredDocumentation(

                    context

                )

        };

    }

    /**
     * =====================================================
     * ¿PROCEDE?
     * =====================================================
     */

    public referencesRequired(

        context: SolvencyContext

    ): boolean {

        if (

            context.procedure === ProcedureType.MINOR

        ) {

            return false;

        }

        return true;

    }

    /**
     * =====================================================
     * NIVEL
     * =====================================================
     */

    private level(

        context: SolvencyContext

    ): SolvencyLevel {

        if (

            context.europeanThreshold

        ) {

            return SolvencyLevel.HIGH;

        }

        if (

            context.estimatedValue > 1000000

        ) {

            return SolvencyLevel.HIGH;

        }

        return SolvencyLevel.NORMAL;

    }

    /**
     * =====================================================
     * DOCUMENTACIÓN
     * =====================================================
     */

    private requiredDocumentation(

        context: SolvencyContext

    ): string[] {

        const docs: string[] = [];

        docs.push(

            "Relación de contratos ejecutados."

        );

        docs.push(

            "Importes."

        );

        docs.push(

            "Fechas."

        );

        docs.push(

            "Destinatarios públicos o privados."

        );

        docs.push(

            "Certificados de buena ejecución."

        );

        if (

            context.contractType === ContractType.WORKS

        ) {

            docs.push(

                "Certificados finales de obra."

            );

        }

        if (

            context.contractType === ContractType.SERVICES

        ) {

            docs.push(

                "Conformidad del servicio."

            );

        }

        return docs;

    }

    /**
     * =====================================================
     * VALIDACIÓN
     * =====================================================
     */

    public validate(

        references: ContractReference[],

        context: SolvencyContext

    ): boolean {

        if (

            !this.referencesRequired(

                context

            )

        ) {

            return true;

        }

        if (

            references.length === 0

        ) {

            return false;

        }

        const valid = references.filter(

            r =>

                r.completed &&

                r.amount > 0

        );

        return valid.length > 0;

    }

    /**
     * =====================================================
     * SUMA IMPORTES
     * =====================================================
     */

    public accumulatedAmount(

        references: ContractReference[]

    ): number {

        return references.reduce(

            (

                total,

                current

            ) =>

                total +

                current.amount,

            0

        );

    }

    /**
     * =====================================================
     * CONTRATOS RECIENTES
     * =====================================================
     */

    public recentReferences(

        references: ContractReference[],

        years = 5

    ): ContractReference[] {

        const currentYear =

            new Date().getFullYear();

        return references.filter(

            reference =>

                currentYear -

                reference.executionYear

                <=

                years

        );

    }

}
