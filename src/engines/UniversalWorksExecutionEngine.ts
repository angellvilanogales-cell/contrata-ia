export interface UniversalWorksExecutionInput {
  settingOutCheckActRequired: boolean;
  settingOutCheckDeadlineDaysFromFormalization: number;
  exceptionalSettingOutDeadlineJustified?: boolean;
  worksDirectorIdentified: boolean;
  executionSubjectToApprovedProject: boolean;
  certificationFrequency: "MONTHLY" | "OTHER";
  alternativeCertificationFrequencyJustifiedInPcap?: boolean;
  receptionProcedureDefined: boolean;
  finalCertificationApprovalMonths: number;
  complexWorksOverTwelveMillionEuros?: boolean;
  extendedFinalCertificationDeadlineExpresslyProvidedInPcap?: boolean;
  guaranteePeriodDefined: boolean;
  hiddenDefectsLiabilityAcknowledged: boolean;
}

export interface UniversalWorksExecutionDecision {
  valid: boolean;
  blockers: readonly string[];
  warnings: readonly string[];
  legalBasis: readonly string[];
  humanValidationRequired: true;
}

/** Valida la estructura mínima de ejecución propia del contrato de obras. */
export class UniversalWorksExecutionEngine {
  public evaluate(input: UniversalWorksExecutionInput): UniversalWorksExecutionDecision {
    const blockers: string[] = [];
    const warnings: string[] = [];

    if (!input.settingOutCheckActRequired) blockers.push("La ejecución de obras debe comenzar con acta de comprobación del replanteo.");
    if (!Number.isFinite(input.settingOutCheckDeadlineDaysFromFormalization) || input.settingOutCheckDeadlineDaysFromFormalization <= 0) {
      throw new Error("settingOutCheckDeadlineDaysFromFormalization debe ser positivo.");
    }
    if (input.settingOutCheckDeadlineDaysFromFormalization > 31 && input.exceptionalSettingOutDeadlineJustified !== true) {
      blockers.push("El plazo para la comprobación del replanteo supera un mes desde la formalización sin excepción justificada.");
    }
    if (!input.worksDirectorIdentified) blockers.push("No consta identificada la dirección facultativa de las obras.");
    if (!input.executionSubjectToApprovedProject) blockers.push("La ejecución no consta sometida al proyecto aprobado que sirve de base al contrato.");

    if (input.certificationFrequency === "OTHER" && input.alternativeCertificationFrequencyJustifiedInPcap !== true) {
      blockers.push("La frecuencia de certificaciones distinta de la mensual no consta prevista expresamente en el PCAP.");
    }

    if (!input.receptionProcedureDefined) blockers.push("No consta definido el procedimiento de recepción de las obras.");
    if (!Number.isFinite(input.finalCertificationApprovalMonths) || input.finalCertificationApprovalMonths <= 0) {
      throw new Error("finalCertificationApprovalMonths debe ser positivo.");
    }
    const maxFinalMonths = input.complexWorksOverTwelveMillionEuros && input.extendedFinalCertificationDeadlineExpresslyProvidedInPcap ? 5 : 3;
    if (input.finalCertificationApprovalMonths > maxFinalMonths) {
      blockers.push(`El plazo declarado para aprobar la certificación final (${input.finalCertificationApprovalMonths} meses) supera el máximo aplicable de ${maxFinalMonths} meses.`);
    }
    if (input.finalCertificationApprovalMonths > 3 && !input.complexWorksOverTwelveMillionEuros) {
      blockers.push("La ampliación del plazo de certificación final solo puede plantearse para obras de VE superior a doce millones con operaciones especialmente complejas y previsión en pliego.");
    }
    if (!input.guaranteePeriodDefined) blockers.push("No consta definido el plazo de garantía de la obra.");
    if (!input.hiddenDefectsLiabilityAcknowledged) blockers.push("El clausulado no puede omitir el régimen legal de responsabilidad por vicios ocultos.");

    if (input.certificationFrequency === "MONTHLY") warnings.push("Las certificaciones son pagos a cuenta y no equivalen a aprobación ni recepción de la obra ejecutada.");

    return {
      valid: blockers.length === 0,
      blockers,
      warnings,
      legalBasis: ["arts. 237, 238, 240, 243 y 244 LCSP"],
      humanValidationRequired: true,
    };
  }
}
