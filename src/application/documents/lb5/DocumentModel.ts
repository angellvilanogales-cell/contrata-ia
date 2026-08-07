import type { LB4CleaningServiceDecision, LB4CleaningServiceInput } from "../../normative/LB4CleaningServiceEngine";

export type DocumentBlockId =
  | "IDENTIFICATION"
  | "NEED_IDONEITY"
  | "OBJECT_CPV"
  | "INSUFFICIENCY_MEANS"
  | "LOTS"
  | "BUDGET_VALUE"
  | "PROCEDURE"
  | "SOLVENCY"
  | "AWARD_CRITERIA"
  | "GUARANTEES"
  | "SPECIAL_EXECUTION"
  | "SUBROGATION"
  | "DATA_PROTECTION"
  | "TECHNICAL_SCOPE"
  | "TECHNICAL_EXECUTION"
  | "QUALITY_CONTROL"
  | "ADMINISTRATIVE_REGIME"
  | "LEGAL_TRACEABILITY";

export type AdministrativeDocumentKind =
  | "MEMORIA_JUSTIFICATIVA"
  | "INFORME_NECESIDAD"
  | "INFORME_INSUFICIENCIA_MEDIOS"
  | "PCAP"
  | "PPT"
  | "CUSTOM";

export type BlockPlacement = "IN_MEMORY" | "STANDALONE";

export interface DocumentSourceReference {
  readonly id: string;
  readonly authority: string;
  readonly title: string;
  readonly locator: string;
  readonly effectiveContext: string;
}

export interface DocumentParagraph {
  readonly text: string;
  readonly sourceIds: readonly string[];
  readonly validation: "DETERMINED" | "PROPOSED" | "PENDING_HUMAN_VALIDATION";
}

export interface DocumentSection {
  readonly id: DocumentBlockId | `CUSTOM:${string}`;
  readonly heading: string;
  readonly paragraphs: readonly DocumentParagraph[];
}

export interface AdministrativeDocument {
  readonly id: string;
  readonly kind: AdministrativeDocumentKind;
  readonly title: string;
  readonly fileBaseName: string;
  readonly sections: readonly DocumentSection[];
  readonly sourceIds: readonly string[];
  readonly warnings: readonly string[];
  readonly validation: DocumentValidation;
}

export interface DocumentValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly pendingHumanValidation: readonly string[];
}

export interface CustomDocumentRequest {
  readonly title: string;
  readonly fileBaseName?: string;
  readonly blockIds: readonly DocumentBlockId[];
  readonly introductoryText?: string;
}

export interface LB5CompositionOptions {
  readonly needPlacement: BlockPlacement;
  readonly insufficiencyPlacement: BlockPlacement;
  readonly generateNeedReportWhenStandalone?: boolean;
  readonly generateInsufficiencyReportWhenStandalone?: boolean;
  readonly customDocuments?: readonly CustomDocumentRequest[];
}

export interface LB5TechnicalSpecification {
  readonly buildingsDescription: string;
  readonly serviceHours?: string;
  readonly minimumTasks: readonly string[];
  readonly qualityIndicators: readonly string[];
  readonly productsRequirements?: readonly string[];
}

export interface LB5DocumentContext {
  readonly expedienteId: string;
  readonly contractingAuthority: string;
  readonly promotingUnit: string;
  readonly input: LB4CleaningServiceInput;
  readonly normativeDecision: LB4CleaningServiceDecision;
  readonly budgetBaseVatIncluded?: number;
  readonly vatRatePercent?: number;
  readonly insufficiencyOfMeans?: string;
  readonly lotsMotivation?: string;
  readonly awardCriteriaDescription?: readonly string[];
  readonly technical: LB5TechnicalSpecification;
  readonly sources: readonly DocumentSourceReference[];
}

export interface LB5DocumentPackage {
  readonly context: LB5DocumentContext;
  readonly documents: readonly AdministrativeDocument[];
  readonly globalValidation: DocumentValidation;
  readonly coherenceFingerprint: Readonly<Record<string, string | number | boolean>>;
}

export interface EditableDocumentArtifact {
  readonly documentId: string;
  readonly fileName: string;
  readonly mimeType: string;
  readonly data: Uint8Array;
}

export interface LB5RenderedPackage {
  readonly package: LB5DocumentPackage;
  readonly editable: readonly EditableDocumentArtifact[];
  readonly pdf: readonly EditableDocumentArtifact[];
}
