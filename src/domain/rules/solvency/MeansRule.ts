/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * MeansRule
 * ------------------------------------------------------------
 * Evaluación de medios personales y materiales.
 *
 * LCSP
 * Arts. 74 a 89
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
 * MEDIOS EXIGIBLES
 * ============================================================
 */

export interface RequiredMeans {

    personnel: string[];

    equipment: string[];

    certificates: string[];

    experienceYears?: number;

}

/* ============================================================
 * REGLA
 * ============================================================
 */

export class MeansRule {

    /**
     * =====================================================
     * EVALUACIÓN
     * =====================================================
     */

    public evaluate(

        context: SolvencyContext

    ): SolvencyRequirement {

        const means =

            this.requiredMeans(context);

        return {

            id:

                crypto.randomUUID() as UUID,

            type:

                SolvencyType.EQUIPMENT,

            required:

                means.personnel.length > 0 ||

                means.equipment.length > 0 ||

                means.certificates.length > 0,

            level:

                this.level(context),

            justification:

                "Los medios exigidos deberán ser proporcionales al objeto contractual.",

            legalReference:

                "LCSP arts. 74–89",

            observations: [

                ...means.personnel,

                ...means.equipment,

                ...means.certificates,

                means.experienceYears

                    ? `Experiencia mínima: ${means.experienceYears} años`

                    : ""

            ].filter(Boolean)

        };

    }

    /**
     * =====================================================
     * MEDIOS NECESARIOS
     * =====================================================
     */

    public requiredMeans(

        context: SolvencyContext

    ): RequiredMeans {

        const result: RequiredMeans = {

            personnel: [],

            equipment: [],

            certificates: []

        };

        switch (

            context.contractType

        ) {

            case ContractType.WORKS:

                result.personnel.push(

                    "Jefe de obra"

                );

                result.personnel.push(

                    "Técnico competente"

                );

                result.equipment.push(

                    "Maquinaria adecuada"

                );

                result.experienceYears = 5;

                break;

            case ContractType.SERVICES:

                result.personnel.push(

                    "Equipo técnico"

                );

                result.certificates.push(

                    "Currículum del personal"

                );

                result.experienceYears = 3;

                break;

            case ContractType.SUPPLIES:

                result.equipment.push(

                    "Capacidad logística"

                );

                result.certificates.push(

                    "Control de calidad"

                );

                break;

            default:

                break;

        }

        if (

            context.europeanThreshold

        ) {

            result.certificates.push(

                "ISO 9001"

            );

        }

        return result;

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

        if (

            context.procedure === ProcedureType.OPEN

        ) {

            return SolvencyLevel.NORMAL;

        }

        return SolvencyLevel.BASIC;

    }

    /**
     * =====================================================
     * VALIDACIÓN
     * =====================================================
     */

    public validateMeans(

        available: RequiredMeans,

        required: RequiredMeans

    ): boolean {

        const personnel =

            required.personnel.every(

                p => available.personnel.includes(p)

            );

        const equipment =

            required.equipment.every(

                e => available.equipment.includes(e)

            );

        const certificates =

            required.certificates.every(

                c => available.certificates.includes(c)

            );

        return (

            personnel &&

            equipment &&

            certificates

        );

    }

}
