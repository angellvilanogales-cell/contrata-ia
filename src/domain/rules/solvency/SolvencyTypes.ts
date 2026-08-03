/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * SolvencyTypes
 * ------------------------------------------------------------
 * Tipos comunes del subsistema de Solvencia.
 *
 * Este archivo NO contiene lógica.
 * Solo modelos de datos.
 * ============================================================
 */

import { UUID } from "../../common/types";
import { ContractType, ProcedureType } from "../../legal/types";

/* ============================================================
 * TIPOS DE SOLVENCIA
 * ============================================================
 */

export enum SolvencyType {

    ECONOMIC = "ECONOMIC",

    TECHNICAL = "TECHNICAL",

    PROFESSIONAL = "PROFESSIONAL",

    CLASSIFICATION = "CLASSIFICATION",

    INSURANCE = "INSURANCE",

    TURNOVER = "TURNOVER",

    REFERENCES = "REFERENCES",

    PERSONNEL = "PERSONNEL",

    EQUIPMENT = "EQUIPMENT"

}

/* ============================================================
 * NIVEL DE EXIGENCIA
 * ============================================================
 */

export enum SolvencyLevel {

    NONE = "NONE",

    BASIC = "BASIC",

    NORMAL = "NORMAL",

    HIGH = "HIGH",

    VERY_HIGH = "VERY_HIGH"

}

/* ============================================================
 * RESULTADO
 * ============================================================
 */

export interface SolvencyRequirement {

    id: UUID;

    type: SolvencyType;

    required: boolean;

    level: SolvencyLevel;

    justification: string;

    legalReference?: string;

    observations?: string[];

}

/* ============================================================
 * CONTEXTO
 * ============================================================
 */

export interface SolvencyContext {

    contractType: ContractType;

    procedure: ProcedureType;

    estimatedValue: number;

    cpvCodes: string[];

    lots: boolean;

    europeanThreshold: boolean;

}

/* ============================================================
 * INFORME
 * ============================================================
 */

export interface SolvencyReport {

    generatedAt: Date;

    requirements: SolvencyRequirement[];

    warnings: string[];

    recommendations: string[];

}

/* ============================================================
 * VALIDACIÓN
 * ============================================================
 */

export interface SolvencyValidation {

    valid: boolean;

    errors: string[];

    warnings: string[];

}

/* ============================================================
 * RESULTADO DEL EVALUADOR
 * ============================================================
 */

export interface SolvencyEvaluation {

    context: SolvencyContext;

    report: SolvencyReport;

    validation: SolvencyValidation;

}

/* ============================================================
 * PARÁMETROS ECONÓMICOS
 * ============================================================
 */

export interface FinancialCapacity {

    annualTurnover?: number;

    specificTurnover?: number;

    insuranceAmount?: number;

    netWorth?: number;

}

/* ============================================================
 * CAPACIDAD TÉCNICA
 * ============================================================
 */

export interface TechnicalCapacity {

    references?: number;

    personnel?: number;

    engineers?: number;

    equipment?: number;

    qualityCertificates?: string[];

    environmentalCertificates?: string[];

}

/* ============================================================
 * CLASIFICACIÓN
 * ============================================================
 */

export interface ContractorClassification {

    required: boolean;

    group?: string;

    subgroup?: string;

    category?: string;

}

/* ============================================================
 * CONFIGURACIÓN
 * ============================================================
 */

export interface SolvencyConfiguration {

    europeanThresholdServices: number;

    europeanThresholdWorks: number;

    minorContractLimit: number;

    simplifiedProcedureLimit: number;

    simplifiedShortLimit: number;

}

