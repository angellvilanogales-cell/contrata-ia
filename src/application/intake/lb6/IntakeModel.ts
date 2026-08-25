export type IntakeMode = "GUIDED" | "QUESTIONNAIRE" | "HYBRID";
export type IntakeAnswerSource = "USER_GUIDED" | "QUESTIONNAIRE_IMPORT" | "SYSTEM_PROPOSAL";
export type IntakeQuestionRequirement = "REQUIRED" | "CONDITIONAL" | "OPTIONAL" | "SYSTEM_CAN_PROPOSE";

export type IntakeQuestionId =
  | "contractingAuthority"
  | "promotingUnit"
  | "object"
  | "need"
  | "estimatedValue"
  | "durationMonths"
  | "judgmentValuePercent"
  | "allAwardCriteriaFormulaBased"
  | "lotAssessment"
  | "subrogationObligation"
  | "publicBodyTransfersPersonalDataToContractor"
  | "budgetBaseVatIncluded"
  | "vatRatePercent"
  | "insufficiencyOfMeans"
  | "lotsMotivation"
  | "buildingsDescription"
  | "serviceHours"
  | "minimumTasks"
  | "qualityIndicators"
  | "productsRequirements"
  | "needPlacement"
  | "insufficiencyPlacement"
  | "additionalDocumentInstruction";

export interface IntakeQuestion {
  readonly id: IntakeQuestionId;
  readonly section: string;
  readonly label: string;
  readonly help: string;
  readonly requirement: IntakeQuestionRequirement;
  readonly answerType: "TEXT" | "MONEY" | "NUMBER" | "BOOLEAN" | "CHOICE" | "LIST";
  readonly choices?: readonly string[];
  readonly legalSourceIds: readonly string[];
}

export interface IntakeAnswer {
  readonly questionId: IntakeQuestionId;
  readonly value: string | number | boolean | readonly string[];
  readonly source: IntakeAnswerSource;
  readonly recordedAt: string;
}

export interface IntakeValidationRecord {
  readonly validated: boolean;
  readonly validatedAt?: string;
  readonly validatedBy?: string;
  readonly fingerprint?: string;
}

/**
 * Extensión persistente introducida en LB-7 para perfiles especializados y
 * revisión jurídica preventiva. Se mantiene fuera del catálogo LB-6 para no
 * convertir patrones especializados en reglas normativas del MVP de limpieza.
 */
export interface LB7CaseSupplement {
  readonly family?: "EVENT_SERVICES";
  readonly eventServices?: {
    readonly features: readonly string[];
    readonly answers: Readonly<Record<string, unknown>>;
  };
  readonly preLegalReviewInput?: Readonly<Record<string, unknown>>;
}

export interface IntakeCase {
  readonly id: string;
  readonly mode: IntakeMode;
  readonly createdAt: string;
  readonly answers: Readonly<Partial<Record<IntakeQuestionId, IntakeAnswer>>>;
  readonly validation: IntakeValidationRecord;
  readonly revision: number;
  readonly lb7?: LB7CaseSupplement;
}

export interface IntakeProgress {
  readonly totalQuestions: number;
  readonly answeredQuestions: number;
  readonly requiredPending: readonly IntakeQuestionId[];
  readonly nextQuestion?: IntakeQuestion;
  readonly canValidate: boolean;
  readonly warnings: readonly string[];
}

export interface IntakeReview {
  readonly caseId: string;
  readonly revision: number;
  readonly answers: Readonly<Record<string, unknown>>;
  readonly proposals: readonly string[];
  readonly warnings: readonly string[];
  readonly fingerprint: string;
  readonly canGenerateAfterValidation: boolean;
}
