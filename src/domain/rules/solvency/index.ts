/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * Solvency Module
 * ------------------------------------------------------------
 * Punto único de exportación del subsistema de Solvencia.
 *
 * ============================================================
 */

/* ============================================================
 * TIPOS
 * ============================================================
 */

export * from "./SolvencyTypes";

/* ============================================================
 * REGLAS
 * ============================================================
 */

export * from "./EconomicSolvencyRule";

export * from "./TechnicalSolvencyRule";

export * from "./ProfessionalSolvencyRule";

export * from "./InsuranceRule";

export * from "./TurnoverRule";

export * from "./ClassificationRule";

export * from "./MeansRule";

export * from "./ReferencesRule";

/* ============================================================
 * MOTOR
 * ============================================================
 */

export * from "./SolvencyValidator";

export * from "./SolvencyResolver";

/* ============================================================
 * EXPORTACIÓN AGRUPADA
 * ============================================================
 */

import { EconomicSolvencyRule } from "./EconomicSolvencyRule";
import { TechnicalSolvencyRule } from "./TechnicalSolvencyRule";
import { ProfessionalSolvencyRule } from "./ProfessionalSolvencyRule";
import { InsuranceRule } from "./InsuranceRule";
import { TurnoverRule } from "./TurnoverRule";
import { ClassificationRule } from "./ClassificationRule";
import { MeansRule } from "./MeansRule";
import { ReferencesRule } from "./ReferencesRule";
import { SolvencyValidator } from "./SolvencyValidator";
import { SolvencyResolver } from "./SolvencyResolver";

export const SolvencyModule = {

    EconomicSolvencyRule,

    TechnicalSolvencyRule,

    ProfessionalSolvencyRule,

    InsuranceRule,

    TurnoverRule,

    ClassificationRule,

    MeansRule,

    ReferencesRule,

    SolvencyValidator,

    SolvencyResolver

};

export default SolvencyModule;
