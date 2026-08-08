export type PreLegalReviewSeverity = "REVIEW_REQUIRED" | "WARNING";
export type PreLegalReviewTopic =
  | "OFFICIAL_PCAP_MODEL"
  | "NEEDS_BASED_CONTRACT_BUDGET_AND_EXTENSIONS"
  | "SINGLE_AWARD_CRITERION"
  | "MODIFICATION_NEW_UNPRICED_ITEMS";

export interface PreLegalReviewInput {
  readonly contractType: "SUPPLIES" | "SERVICES";
  readonly usesOfficialRecommendedPcapModel?: boolean;
  readonly needsBasedUnderDa33?: boolean;
  readonly extensionMonths?: number;
  readonly extensionAddsBudget?: boolean;
  readonly estimatedValueIncludesExtensionBudgetAgain?: boolean;
  readonly singleAwardCriterion?: boolean;
  readonly deliveryTimeVariable?: boolean;
  readonly plannedModification?: boolean;
  readonly modificationAllowsNewUnpricedItems?: boolean;
  readonly catalogueOpenEnded?: boolean;
}

export interface PreLegalReviewFinding {
  readonly riskId: string;
  readonly severity: PreLegalReviewSeverity;
  readonly topic: PreLegalReviewTopic;
  readonly message: string;
  readonly originCaseId: "LEGAL-REAL-001";
  readonly legalStatus: "REQUIRES_CURRENT_LAW_VERIFICATION";
  readonly requiresHumanValidation: true;
  readonly documentsAffected: readonly string[];
  readonly actionBeforeLegalReferral: string;
}

export interface PreLegalReviewResult {
  readonly mode: "PRE_LEGAL_REFERRAL_REVIEW";
  readonly findings: readonly PreLegalReviewFinding[];
  readonly canBeTreatedAsLegalOpinion: false;
  readonly rulePromotionAllowed: false;
}

function finding(
  riskId: string,
  severity: PreLegalReviewSeverity,
  topic: PreLegalReviewTopic,
  message: string,
  documentsAffected: readonly string[],
  actionBeforeLegalReferral: string
): PreLegalReviewFinding {
  return {
    riskId,
    severity,
    topic,
    message,
    originCaseId: "LEGAL-REAL-001",
    legalStatus: "REQUIRES_CURRENT_LAW_VERIFICATION",
    requiresHumanValidation: true,
    documentsAffected,
    actionBeforeLegalReferral
  };
}

/**
 * Detector preventivo calibrado con LEGAL-REAL-001.
 *
 * No emite dictamen jurídico y no convierte el informe AJ-SAE 2026/16 en una regla
 * universal. Su función es detectar configuraciones fácticas semejantes para que
 * sean revisadas contra la normativa/modelo vigente antes de remitir el expediente
 * a la Asesoría Jurídica.
 */
export class PreLegalReview {
  public review(input: PreLegalReviewInput): PreLegalReviewResult {
    const findings: PreLegalReviewFinding[] = [];

    if (input.usesOfficialRecommendedPcapModel === false) {
      findings.push(finding(
        "PRELEGAL-PCAP-MODEL-001",
        "WARNING",
        "OFFICIAL_PCAP_MODEL",
        "El expediente declara que el PCAP no parte del modelo recomendado oficial. Debe comprobarse la selección del modelo aplicable y su versión antes de cerrar el pliego.",
        ["PCAP"],
        "Verificar tipo de contrato, procedimiento, financiación y versión vigente del modelo recomendado."
      ));
    }

    if (input.needsBasedUnderDa33 === true && (input.extensionAddsBudget === true || input.estimatedValueIncludesExtensionBudgetAgain === true)) {
      findings.push(finding(
        "PRELEGAL-DA33-BUDGET-EXTENSION-001",
        "REVIEW_REQUIRED",
        "NEEDS_BASED_CONTRACT_BUDGET_AND_EXTENSIONS",
        "Se ha configurado un contrato en función de necesidades y, al mismo tiempo, la prórroga parece reponer o duplicar presupuesto. Esta combinación reprodujo una observación jurídica en LEGAL-REAL-001 y requiere revisión específica.",
        ["MEMORIA_JUSTIFICATIVA", "PCAP_ANEXO_I"],
        "Revisar presupuesto máximo, duración/prórrogas y método de cálculo del valor estimado contra la DA 33.ª, artículos aplicables y criterio oficial vigente."
      ));
    }

    if (input.singleAwardCriterion === true && (input.deliveryTimeVariable === true || input.plannedModification === true)) {
      findings.push(finding(
        "PRELEGAL-SINGLE-CRITERION-001",
        "REVIEW_REQUIRED",
        "SINGLE_AWARD_CRITERION",
        "Se propone un único criterio de adjudicación mientras existen elementos variables de ejecución o una modificación prevista. La configuración debe justificarse y contrastarse antes de remitir el expediente.",
        ["MEMORIA_JUSTIFICATIVA", "PCAP_ANEXO_I", "MODELO_PROPOSICION"],
        "Comprobar la aplicación del artículo 145.3 al tipo contractual concreto y valorar, si procede, una pluralidad de criterios automáticos vinculados al objeto."
      ));
    }

    if (input.modificationAllowsNewUnpricedItems === true || input.catalogueOpenEnded === true) {
      findings.push(finding(
        "PRELEGAL-UNPRICED-MODIFICATION-001",
        "REVIEW_REQUIRED",
        "MODIFICATION_NEW_UNPRICED_ITEMS",
        "La documentación permite incorporar bienes o prestaciones no definidos inicialmente sin precio unitario previamente fijado, o mantiene un catálogo abierto. Esta configuración fue objetada en LEGAL-REAL-001.",
        ["MEMORIA_JUSTIFICATIVA", "PCAP_ANEXO_I", "PPT"],
        "Delimitar el alcance de la modificación y comprobar que los bienes/prestaciones y precios quedan suficientemente determinados conforme a la normativa vigente."
      ));
    }

    return {
      mode: "PRE_LEGAL_REFERRAL_REVIEW",
      findings,
      canBeTreatedAsLegalOpinion: false,
      rulePromotionAllowed: false
    };
  }
}
