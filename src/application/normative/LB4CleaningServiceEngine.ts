export type LB4Procedure =
  | "OPEN_SIMPLIFIED_ABBREVIATED"
  | "OPEN_SIMPLIFIED"
  | "OPEN_ORDINARY";

export type HumanValidationState = "DETERMINED" | "PROPOSED" | "PENDING_HUMAN_VALIDATION";

export interface LB4CleaningServiceInput {
  readonly object: string;
  readonly need: string;
  readonly estimatedValue: number;
  readonly durationMonths: number;
  readonly judgmentValuePercent: number;
  readonly allAwardCriteriaFormulaBased: boolean;
  readonly lotAssessment?: "DIVIDE" | "NO_DIVIDE_TECHNICAL_COORDINATION" | "UNASSESSED";
  readonly subrogationObligation?: "APPLIES" | "DOES_NOT_APPLY" | "UNKNOWN";
  readonly publicBodyTransfersPersonalDataToContractor?: boolean;
}

export interface LegalTrace {
  readonly ruleId: string;
  readonly sourceIds: readonly string[];
  readonly justification: string;
  readonly validation: HumanValidationState;
}

export interface CPVDecision {
  readonly primary: "90911200-8";
  readonly alternatives: readonly ["90919200-4"];
  readonly validation: "PENDING_HUMAN_VALIDATION";
}

export interface ProcedureDecision {
  readonly procedure: LB4Procedure;
  readonly sara: boolean;
  readonly tenderDeadlineDaysMinimum: number;
  readonly deadlineUnit: "CALENDAR_DAYS" | "WORKING_DAYS";
  readonly validation: "PENDING_HUMAN_VALIDATION";
}

export interface LotsDecision {
  readonly result: "DIVIDE" | "NO_DIVISION_PROPOSED" | "ASSESS_DIVISION";
  readonly validation: "PENDING_HUMAN_VALIDATION";
}

export interface SolvencyDecision {
  readonly economic: {
    readonly fallbackMethod: "ANNUAL_TURNOVER";
    readonly minimumMultiplier: 1.5;
    readonly basis: "ESTIMATED_VALUE" | "AVERAGE_ANNUAL_VALUE";
    readonly calculatedMinimum: number;
  };
  readonly technical: {
    readonly method: "SIMILAR_SERVICES_LAST_3_YEARS";
    readonly cpvSimilarityFallback: "FIRST_3_CPV_DIGITS";
  };
  readonly validation: "PENDING_HUMAN_VALIDATION";
}

export interface GuaranteeDecision {
  readonly provisional: "NOT_REQUIRED_DEFAULT";
  readonly definitive: {
    readonly required: boolean;
    readonly percentOfFinalPriceExVat: 0 | 5;
  };
  readonly validation: "PENDING_HUMAN_VALIDATION";
}

export interface AwardCriteriaDecision {
  readonly approach: "BEST_QUALITY_PRICE_PLURALITY";
  readonly automaticCriteriaPreferredWherePossible: true;
  readonly socialEnvironmentalCriteriaMustBeLinkedToObject: true;
  readonly validation: "PENDING_HUMAN_VALIDATION";
}

export interface ExecutionConditionDecision {
  readonly mandatoryMinimum: 1;
  readonly proposedFamily: "ENVIRONMENTAL_CLEANING";
  readonly proposedText: string;
  readonly dataProtectionConditionRequired: boolean;
  readonly validation: "PENDING_HUMAN_VALIDATION";
}

export interface SubrogationDecision {
  readonly status: "DISCLOSE_REQUIRED_INFORMATION" | "NO_ART130_ACTION_FROM_DECLARED_FACTS" | "VERIFY_APPLICABLE_COLLECTIVE_RULES";
  readonly validation: "PENDING_HUMAN_VALIDATION";
}

export interface LB4CleaningServiceDecision {
  readonly scope: "CLEANING_BUILDINGS_OFFICES_JUNTA_ANDALUCIA";
  readonly effectivePeriod: "2026-2027";
  readonly cpv: CPVDecision;
  readonly procedure: ProcedureDecision;
  readonly lots: LotsDecision;
  readonly solvency: SolvencyDecision;
  readonly guarantees: GuaranteeDecision;
  readonly awardCriteria: AwardCriteriaDecision;
  readonly specialExecutionCondition: ExecutionConditionDecision;
  readonly subrogation: SubrogationDecision;
  readonly traces: readonly LegalTrace[];
  readonly overallValidation: "PENDING_HUMAN_VALIDATION";
}

const SOURCE_LCSP = "LCSP-2017-CONSOLIDADA-2026";
const SOURCE_EU_THRESHOLDS = "UE-2025-2152";
const SOURCE_JA_MODELS = "JA-MODELOS-PCAP";
const SOURCE_JA_SOCIAL_ENV = "JA-CLAUSULAS-SOCIALES-AMBIENTALES";
const SOURCE_USER_CLEANING = "JA-PCAP-LIMPIEZA-EJEMPLOS-USUARIO";

function requireFinitePositive(name: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} debe ser un número positivo.`);
  }
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export class LB4CleaningServiceEngine {
  public evaluate(input: LB4CleaningServiceInput): LB4CleaningServiceDecision {
    if (!input.object.trim()) throw new Error("El objeto del contrato es obligatorio.");
    if (!input.need.trim()) throw new Error("La necesidad administrativa es obligatoria.");
    requireFinitePositive("estimatedValue", input.estimatedValue);
    requireFinitePositive("durationMonths", input.durationMonths);
    if (!Number.isFinite(input.judgmentValuePercent) || input.judgmentValuePercent < 0 || input.judgmentValuePercent > 100) {
      throw new Error("judgmentValuePercent debe estar entre 0 y 100.");
    }

    const traces: LegalTrace[] = [];

    const cpv: CPVDecision = {
      primary: "90911200-8",
      alternatives: ["90919200-4"],
      validation: "PENDING_HUMAN_VALIDATION"
    };
    traces.push({
      ruleId: "LB4-SVC-CLEAN-CPV-001",
      sourceIds: [SOURCE_USER_CLEANING],
      justification: "Se propone 90911200-8 para limpieza general de edificios y 90919200-4 como alternativa específica de oficinas; debe validarse contra la descripción final de prestaciones.",
      validation: "PROPOSED"
    });

    const sara = input.estimatedValue >= 216000;
    traces.push({
      ruleId: "LB4-SVC-SARA-001",
      sourceIds: [SOURCE_LCSP, SOURCE_EU_THRESHOLDS],
      justification: sara
        ? "El valor estimado alcanza el umbral SARA de 216.000 euros aplicable en 2026-2027 a servicios adjudicados por entidades distintas de la AGE y entidades estatales equivalentes."
        : "El valor estimado no alcanza el umbral SARA regional de servicios de 216.000 euros vigente en 2026-2027.",
      validation: "DETERMINED"
    });

    let procedure: LB4Procedure;
    let tenderDeadlineDaysMinimum: number;
    let deadlineUnit: "CALENDAR_DAYS" | "WORKING_DAYS";

    if (input.estimatedValue < 60000 && input.allAwardCriteriaFormulaBased && input.judgmentValuePercent === 0) {
      procedure = "OPEN_SIMPLIFIED_ABBREVIATED";
      tenderDeadlineDaysMinimum = 10;
      deadlineUnit = "WORKING_DAYS";
      traces.push({
        ruleId: "LB4-SVC-PROC-000",
        sourceIds: [SOURCE_LCSP],
        justification: "El valor estimado es inferior a 60.000 euros y todos los criterios son cuantificables mediante fórmulas; el artículo 159.6 permite la tramitación simplificada abreviada para servicios no intelectuales.",
        validation: "PROPOSED"
      });
    } else if (input.estimatedValue < 140000 && input.judgmentValuePercent <= 25) {
      procedure = "OPEN_SIMPLIFIED";
      tenderDeadlineDaysMinimum = 15;
      deadlineUnit = "CALENDAR_DAYS";
      traces.push({
        ruleId: "LB4-SVC-PROC-001",
        sourceIds: [SOURCE_LCSP],
        justification: "El valor estimado es inferior a 140.000 euros y los criterios sujetos a juicio de valor no superan el 25%; concurren los guardas principales del artículo 159.1 para este servicio no intelectual.",
        validation: "PROPOSED"
      });
    } else {
      procedure = "OPEN_ORDINARY";
      tenderDeadlineDaysMinimum = sara ? 35 : 15;
      deadlineUnit = "CALENDAR_DAYS";
      traces.push({
        ruleId: "LB4-SVC-PROC-002",
        sourceIds: [SOURCE_LCSP],
        justification: input.estimatedValue >= 140000
          ? "No se cumple el límite económico del procedimiento abierto simplificado; dentro del MVP ordinario se propone procedimiento abierto."
          : "La ponderación de criterios sujetos a juicio de valor impide utilizar el abierto simplificado; dentro del MVP ordinario se propone procedimiento abierto.",
        validation: "PROPOSED"
      });
    }

    traces.push({
      ruleId: "LB4-SVC-DEADLINE-001",
      sourceIds: [SOURCE_LCSP],
      justification: procedure === "OPEN_SIMPLIFIED_ABBREVIATED"
        ? "El artículo 159.6 fija un mínimo de 10 días hábiles para la presentación de proposiciones en esta tramitación, sin aplicar aquí la excepción de compras corrientes de bienes."
        : procedure === "OPEN_SIMPLIFIED"
          ? "El artículo 159.3 fija un mínimo de 15 días desde el día siguiente a la publicación en el perfil de contratante."
          : sara
            ? "Para abierto SARA se conserva el plazo general de 35 días; el MVP no aplica automáticamente reducciones que exigen hechos adicionales."
            : "Para abierto no SARA de servicios se aplica el mínimo general de 15 días.",
      validation: "DETERMINED"
    });

    const lotAssessment = input.lotAssessment ?? "UNASSESSED";
    const lots: LotsDecision = lotAssessment === "DIVIDE"
      ? { result: "DIVIDE", validation: "PENDING_HUMAN_VALIDATION" }
      : lotAssessment === "NO_DIVIDE_TECHNICAL_COORDINATION"
        ? { result: "NO_DIVISION_PROPOSED", validation: "PENDING_HUMAN_VALIDATION" }
        : { result: "ASSESS_DIVISION", validation: "PENDING_HUMAN_VALIDATION" };
    traces.push({
      ruleId: "LB4-SVC-LOTS-001",
      sourceIds: [SOURCE_LCSP, SOURCE_USER_CLEANING],
      justification: lots.result === "NO_DIVISION_PROPOSED"
        ? "La no división solo se propone porque se ha declarado una necesidad de coordinación técnica; esa circunstancia debe motivarse y acreditarse en el expediente conforme al artículo 99.3."
        : lots.result === "DIVIDE"
          ? "Se propone división en lotes, coherente con la regla general del artículo 99.3 cuando la naturaleza u objeto lo permiten."
          : "No hay hechos suficientes para decidir lotes; el artículo 99.3 exige valorar la división y motivar expresamente la no división.",
      validation: "PENDING_HUMAN_VALIDATION"
    });

    const annualBasis = input.durationMonths <= 12
      ? input.estimatedValue
      : input.estimatedValue / (input.durationMonths / 12);
    const solvency: SolvencyDecision = {
      economic: {
        fallbackMethod: "ANNUAL_TURNOVER",
        minimumMultiplier: 1.5,
        basis: input.durationMonths <= 12 ? "ESTIMATED_VALUE" : "AVERAGE_ANNUAL_VALUE",
        calculatedMinimum: roundMoney(annualBasis * 1.5)
      },
      technical: {
        method: "SIMILAR_SERVICES_LAST_3_YEARS",
        cpvSimilarityFallback: "FIRST_3_CPV_DIGITS"
      },
      validation: "PENDING_HUMAN_VALIDATION"
    };
    traces.push({
      ruleId: "LB4-SVC-SOLV-ECO-001",
      sourceIds: [SOURCE_LCSP, SOURCE_JA_MODELS],
      justification: `Como referencia supletoria si el pliego no concreta otro criterio proporcional, el volumen anual de negocios resultante es ${solvency.economic.calculatedMinimum.toFixed(2)} euros (1,5 veces la base legal aplicable).`,
      validation: "PENDING_HUMAN_VALIDATION"
    });
    traces.push({
      ruleId: "LB4-SVC-SOLV-TECH-001",
      sourceIds: [SOURCE_LCSP, SOURCE_JA_MODELS],
      justification: "Se propone experiencia en servicios de igual o similar naturaleza de los tres últimos años como medio de solvencia técnica; el mínimo concreto debe justificarse y ser proporcional al objeto.",
      validation: "PENDING_HUMAN_VALIDATION"
    });

    const guarantees: GuaranteeDecision = procedure === "OPEN_SIMPLIFIED_ABBREVIATED"
      ? {
          provisional: "NOT_REQUIRED_DEFAULT",
          definitive: { required: false, percentOfFinalPriceExVat: 0 },
          validation: "PENDING_HUMAN_VALIDATION"
        }
      : {
          provisional: "NOT_REQUIRED_DEFAULT",
          definitive: { required: true, percentOfFinalPriceExVat: 5 },
          validation: "PENDING_HUMAN_VALIDATION"
        };
    traces.push({
      ruleId: "LB4-SVC-GUAR-001",
      sourceIds: [SOURCE_LCSP],
      justification: procedure === "OPEN_SIMPLIFIED_ABBREVIATED"
        ? "La garantía provisional no procede y la tramitación del artículo 159.6 no exige garantía definitiva."
        : "La garantía provisional no procede con carácter general; la garantía definitiva ordinaria es el 5% del precio final ofertado sin IVA, sin perjuicio de excepciones legalmente motivadas.",
      validation: "PENDING_HUMAN_VALIDATION"
    });

    const awardCriteria: AwardCriteriaDecision = {
      approach: "BEST_QUALITY_PRICE_PLURALITY",
      automaticCriteriaPreferredWherePossible: true,
      socialEnvironmentalCriteriaMustBeLinkedToObject: true,
      validation: "PENDING_HUMAN_VALIDATION"
    };
    traces.push({
      ruleId: "LB4-SVC-AWARD-001",
      sourceIds: [SOURCE_LCSP, SOURCE_JA_SOCIAL_ENV],
      justification: "Se propone pluralidad de criterios basados en mejor relación calidad-precio, con preponderancia de criterios automáticos cuando sea posible y cualquier criterio social/ambiental realmente vinculado al servicio de limpieza.",
      validation: "PENDING_HUMAN_VALIDATION"
    });

    const dataProtectionConditionRequired = input.publicBodyTransfersPersonalDataToContractor === true;
    const specialExecutionCondition: ExecutionConditionDecision = {
      mandatoryMinimum: 1,
      proposedFamily: "ENVIRONMENTAL_CLEANING",
      proposedText: "Durante la ejecución, la contratista deberá aplicar medidas de reducción de residuos y uso responsable de productos de limpieza que se definan en el PPT con indicadores verificables y vinculados a la prestación.",
      dataProtectionConditionRequired,
      validation: "PENDING_HUMAN_VALIDATION"
    };
    traces.push({
      ruleId: "LB4-SVC-EXEC-001",
      sourceIds: [SOURCE_LCSP, SOURCE_JA_SOCIAL_ENV],
      justification: "El PCAP debe establecer al menos una condición especial de ejecución del artículo 202. Para limpieza se propone una familia ambiental vinculada a la prestación, pendiente de concreción técnica medible en el PPT.",
      validation: "PENDING_HUMAN_VALIDATION"
    });
    if (dataProtectionConditionRequired) {
      traces.push({
        ruleId: "LB4-SVC-DATA-001",
        sourceIds: [SOURCE_LCSP],
        justification: "Al declararse cesión de datos personales desde la entidad pública al contratista, debe incorporarse la condición especial de ejecución específica de sometimiento a la normativa nacional y de la Unión en protección de datos.",
        validation: "DETERMINED"
      });
    }

    const subrogationFact = input.subrogationObligation ?? "UNKNOWN";
    const subrogation: SubrogationDecision = {
      status: subrogationFact === "APPLIES"
        ? "DISCLOSE_REQUIRED_INFORMATION"
        : subrogationFact === "DOES_NOT_APPLY"
          ? "NO_ART130_ACTION_FROM_DECLARED_FACTS"
          : "VERIFY_APPLICABLE_COLLECTIVE_RULES",
      validation: "PENDING_HUMAN_VALIDATION"
    };
    traces.push({
      ruleId: "LB4-SVC-SUBROG-001",
      sourceIds: [SOURCE_LCSP, SOURCE_USER_CLEANING],
      justification: subrogation.status === "DISCLOSE_REQUIRED_INFORMATION"
        ? "Se ha declarado que existe obligación de subrogación: el pliego debe facilitar convenio, categoría, contrato, jornada, antigüedad, vencimiento, salario bruto anual y pactos aplicables del personal afectado."
        : subrogation.status === "NO_ART130_ACTION_FROM_DECLARED_FACTS"
          ? "Se ha declarado que no existe obligación de subrogación; el motor no la presume, pero la conclusión debe validarse frente a norma, convenio o acuerdo colectivo aplicable."
          : "No consta si existe obligación de subrogación. Debe comprobarse la norma legal, convenio colectivo o acuerdo de negociación colectiva aplicable antes de cerrar costes y pliegos.",
      validation: "PENDING_HUMAN_VALIDATION"
    });

    return {
      scope: "CLEANING_BUILDINGS_OFFICES_JUNTA_ANDALUCIA",
      effectivePeriod: "2026-2027",
      cpv,
      procedure: {
        procedure,
        sara,
        tenderDeadlineDaysMinimum,
        deadlineUnit,
        validation: "PENDING_HUMAN_VALIDATION"
      },
      lots,
      solvency,
      guarantees,
      awardCriteria,
      specialExecutionCondition,
      subrogation,
      traces,
      overallValidation: "PENDING_HUMAN_VALIDATION"
    };
  }
}

export function runLB4CleaningDemo(): LB4CleaningServiceDecision {
  return new LB4CleaningServiceEngine().evaluate({
    object: "Servicio de limpieza de edificios y oficinas administrativas",
    need: "Mantener las dependencias en condiciones adecuadas de higiene, salubridad y uso",
    estimatedValue: 120000,
    durationMonths: 24,
    judgmentValuePercent: 20,
    allAwardCriteriaFormulaBased: false,
    lotAssessment: "UNASSESSED",
    subrogationObligation: "UNKNOWN",
    publicBodyTransfersPersonalDataToContractor: false
  });
}
