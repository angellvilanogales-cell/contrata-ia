/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * GuaranteeTypes
 * ------------------------------------------------------------
 * Modelos comunes del subsistema de Garantías.
 *
 * LCSP
 * Arts. 106–114
 *
 * ============================================================
 */

import { UUID } from "../../common/types";
import {
    ContractType,
    ProcedureType
} from "../../legal/types";

/* ============================================================
 * TIPO DE GARANTÍA
 * ============================================================
 */

export enum GuaranteeType {

    NONE = "NONE",

    PROVISIONAL = "PROVISIONAL",

    DEFINITIVE = "DEFINITIVE",

    COMPLEMENTARY = "COMPLEMENTARY"

}

/* ============================================================
 * ESTADO
 * ============================================================
 */

export enum GuaranteeStatus {

    NOT_REQUIRED = "NOT_REQUIRED",

    REQUIRED = "REQUIRED",

    CONSTITUTED = "CONSTITUTED",

    RETURNED = "RETURNED",

    CANCELLED = "CANCELLED",

    FORFEITED = "FORFEITED"

}

/* ============================================================
 * FORMA DE CONSTITUCIÓN
 * ============================================================
 */

export enum GuaranteeMethod {

    CASH = "CASH",

    BANK_GUARANTEE = "BANK_GUARANTEE",

    INSURANCE = "INSURANCE",

    PUBLIC_DEBT = "PUBLIC_DEBT"

}

/* ============================================================
 * CONTEXTO
 * ============================================================
 */

export interface GuaranteeContext {

    contractType: ContractType;

    procedure: ProcedureType;

    estimatedValue: number;

    awardPrice: number;

    europeanThreshold: boolean;

    abnormalBid: boolean;

    riskLevel: number;

}

/* ============================================================
 * GARANTÍA
 * ============================================================
 */

export interface GuaranteeRequirement {

    id: UUID;

    type: GuaranteeType;

    required: boolean;

    percentage: number;

    amount: number;

    status: GuaranteeStatus;

    justification: string;

    legalReference?: string;

    acceptedMethods: GuaranteeMethod[];

    observations: string[];

}

/* ============================================================
 * VALIDACIÓN
 * ============================================================
 */

export interface GuaranteeValidation {

    valid: boolean;

    warnings: string[];

    errors: string[];

}

/* ============================================================
 * INFORME
 * ============================================================
 */

export interface GuaranteeReport {

    generatedAt: Date;

    requirements: GuaranteeRequirement[];

    warnings: string[];

    recommendations: string[];

}

/* ============================================================
 * DECISIÓN
 * ============================================================
 */

export interface GuaranteeDecision {

    valid: boolean;

    provisional: GuaranteeRequirement;

    definitive: GuaranteeRequirement;

    complementary: GuaranteeRequirement;

    report: GuaranteeReport;

    validation: GuaranteeValidation;

}

/* ============================================================
 * CONFIGURACIÓN
 * ============================================================
 */

export interface GuaranteeConfiguration {

    provisionalPercentage: number;

    definitivePercentage: number;

    complementaryPercentage: number;

    abnormalBidPercentage: number;

}
