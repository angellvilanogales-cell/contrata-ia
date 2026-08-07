import { UUID, ISODate, Money, Percentage } from "../../domain/common/types";
import { CPVCode } from "../../domain/contracts/CPV";
import { ContractType, ProcedureType, ProcessingType } from "../../domain/contracts/ContractTypes";
import { LegalReference } from "../../domain/legal/LegalReference";

export enum ContractContextStatus { DRAFT="DRAFT", IN_PROGRESS="IN_PROGRESS", LEGAL_ANALYSIS="LEGAL_ANALYSIS", DOCUMENT_GENERATION="DOCUMENT_GENERATION", VALIDATION="VALIDATION", READY="READY", APPROVED="APPROVED", ARCHIVED="ARCHIVED" }
export enum ContractPriority { LOW="LOW", NORMAL="NORMAL", HIGH="HIGH", URGENT="URGENT", EMERGENCY="EMERGENCY" }
export enum FinancingType { ORDINARY="ORDINARY", EUROPEAN="EUROPEAN", STATE="STATE", AUTONOMIC="AUTONOMIC", MIXED="MIXED" }
export enum ConfidentialityLevel { PUBLIC="PUBLIC", INTERNAL="INTERNAL", RESTRICTED="RESTRICTED", CONFIDENTIAL="CONFIDENTIAL" }

export interface ContractIdentification { id: UUID; expedienteNumber: string; title: string; description: string; creationDate: ISODate; lastUpdate: ISODate; status: ContractContextStatus; priority: ContractPriority; fileNumber?: string; contractingAuthority?: string; promotingUnit?: string; contractManager?: string; [key:string]: unknown; }
export interface ContractingAuthority { id: UUID; code: string; name: string; department: string; organization: string; nif: string; address: string; postalCode: string; municipality: string; province: string; autonomousCommunity: string; country: string; website?: string; profileUrl?: string; }
export interface PromotingUnit { id: UUID; code: string; name: string; service: string; department: string; manager: string; email?: string; telephone?: string; }
export interface ContractManager { id: UUID; fullName: string; position: string; professionalCategory: string; email: string; telephone?: string; mobile?: string; digitalCertificate?: string; }
export interface AdministrativeInformation { authority: ContractingAuthority; promotingUnit: PromotingUnit; contractManager: ContractManager; processingType: ProcessingType; financingType: FinancingType; budgetApplication: string; annuality: number; estimatedStartDate: ISODate; estimatedEndDate: ISODate; }
export interface PublicNeed { id: UUID; title: string; description: string; background: string; publicInterest: string; objectives: string[]; expectedBenefits: string[]; legalCompetence: LegalReference[]; urgencyJustification?: string; insufficiencyOfOwnResources: string; }
export interface ContractObject { id: UUID; title: string; description: string; contractType: ContractType; mainCPV: CPVCode; secondaryCPVs: CPVCode[]; divisionIntoLots: boolean; justificationNoLots?: string; innovationComponent: boolean; environmentalComponent: boolean; socialComponent: boolean; cpv?: string; }
export interface ContractScope { geographicalScope: string; executionLocations: string[]; estimatedUsers: number; expectedDeliverables: string[]; exclusions: string[]; assumptions: string[]; }
export interface AnnualBudget { fiscalYear: number; amount: Money; percentage: Percentage; }
export interface EconomicInformation { baseBudget: Money; vatPercentage: Percentage; vatAmount: Money; totalBudget: Money; estimatedValue: Money; financingType: FinancingType; cofinanced: boolean; europeanFunds: boolean; fundingProgram?: string; budgetApplication: string; annualDistribution: AnnualBudget[]; }
export interface ContractDuration { executionMonths: number; executionDays: number; startDate: ISODate; expectedEndDate: ISODate; extensionsAllowed: boolean; maximumExtensions: number; extensionMonths: number; maximumDurationMonths: number; }
export interface ScheduleInformation { estimatedPublicationDate: ISODate; estimatedAwardDate: ISODate; estimatedFormalizationDate: ISODate; estimatedExecutionStart: ISODate; estimatedCompletion: ISODate; }
export interface ProcurementProcedure { procedureType: ProcedureType; processingType: ProcessingType; harmonizedContract: boolean; reservedContract: boolean; simplifiedProcedure: boolean; negotiatedProcedure: boolean; emergencyProcessing: boolean; urgencyProcessing: boolean; priorConsultationRequired: boolean; procedure?: string; }
export interface PublicationInformation { publicationRequired: boolean; contractorProfile: boolean; douePublication: boolean; boePublication: boolean; bojaPublication: boolean; publicationObservations: string[]; }
export interface ProcurementDeadlines { tenderSubmissionDays: number; clarificationDays: number; evaluationDays: number; awardDays: number; formalizationDays: number; appealDays: number; }
export interface ProcurementBoard { required: boolean; president: string; secretary: string; members: string[]; technicalAdvisors: string[]; }
export interface EconomicSolvency { required: boolean; minimumTurnover: Money; turnoverYears: number; professionalRiskInsurance: boolean; insuranceAmount: Money; financialRatiosRequired: boolean; observations: string[]; }
export interface TechnicalSolvency { required: boolean; similarContractsRequired: boolean; minimumSimilarContracts: number; referencePeriodYears: number; technicalStaffRequired: boolean; minimumTechnicalStaff: number; qualityCertificates: string[]; environmentalCertificates: string[]; observations: string[]; }
export interface ContractGuarantees { provisionalGuaranteeRequired: boolean; provisionalGuaranteeAmount: Money; definitiveGuaranteeRequired: boolean; definitiveGuaranteePercentage: Percentage; complementaryGuaranteeRequired: boolean; complementaryGuaranteePercentage: Percentage; observations: string[]; }
export interface BusinessClassification { required: boolean; groups: string[]; subgroups: string[]; categories: string[]; justification: string; }
export interface AutomaticCriterion { id: UUID; name: string; description: string; weight: Percentage; maximumScore: number; mathematicalFormula: string; justification: string; }
export interface JudgementCriterion { id: UUID; name: string; description: string; weight: Percentage; maximumScore: number; evaluationMethod: string; justification: string; }
export interface AwardCriteria { automaticCriteria: AutomaticCriterion[]; judgementCriteria: JudgementCriterion[]; automaticWeight: Percentage; judgementWeight: Percentage; abnormalOffersAnalysis: boolean; tieBreakingCriteria: string[]; }
export interface ExpertCommittee { required: boolean; members: string[]; secretary: string; president: string; observations: string[]; }
export interface EnvironmentalCondition { id: UUID; description: string; mandatory: boolean; legalBasis: LegalReference[]; verificationMethod: string; }
export interface SocialCondition { id: UUID; description: string; mandatory: boolean; legalBasis: LegalReference[]; verificationMethod: string; }
export interface InnovationCondition { id: UUID; description: string; mandatory: boolean; legalBasis: LegalReference[]; verificationMethod: string; }
export interface EthicalCondition { id: UUID; description: string; mandatory: boolean; legalBasis: LegalReference[]; verificationMethod: string; }
export interface SpecialExecutionConditions { environmentalConditions: EnvironmentalCondition[]; socialConditions: SocialCondition[]; innovationConditions: InnovationCondition[]; ethicalConditions: EthicalCondition[]; monitoringRequired: boolean; }
export interface SubcontractingInformation { allowed: boolean; maximumPercentage: Percentage; criticalTasks: string[]; directPayments: boolean; subcontractorCommunicationRequired: boolean; observations: string[]; }
export interface ContractModification { modificationsForeseen: boolean; maximumModificationPercentage: Percentage; modificationCauses: string[]; legalBasis: LegalReference[]; economicImpactAllowed: boolean; observations: string[]; }
export interface PenaltySystem { delayPenalties: boolean; qualityPenalties: boolean; executionPenalties: boolean; environmentalPenalties: boolean; socialPenalties: boolean; calculationMethod: string; maximumPenaltyPercentage: Percentage; observations: string[]; }
export interface ContractTermination { terminationCauses: string[]; specialTerminationCauses: string[]; compensationRules: string[]; seizureApplicable: boolean; observations: string[]; }
export interface ContractDocuments { administrativeReport: boolean; technicalReport: boolean; legalReport: boolean; ppt: boolean; pcap: boolean; generatedDocuments: GeneratedDocument[]; }
export interface GeneratedDocument { id: UUID; code: string; name: string; type?: string; version: string; generatedAt: ISODate; generatedBy: string; path?: string; format?: string; [key:string]: unknown; }
export interface Signatory { id: UUID; fullName: string; position?: string; certificate?: string; }
export interface DigitalSignatureInformation { signaturesRequired: boolean; signatories: Signatory[]; signed: boolean; signatureDate?: ISODate; }
export interface AuditEntry { id: UUID; timestamp: ISODate; user: string; action: string; module: string; description: string; previousValue?: string; newValue?: string; }
export interface AuditInformation { createdBy: string; createdDate: ISODate; lastModifiedBy: string; lastModifiedDate: ISODate; revision: number; auditTrail: AuditEntry[]; }
export interface VersionRecord { version: string; creationDate: ISODate; createdBy: string; changes: string[]; }
export interface VersionHistory { currentVersion: string; records: VersionRecord[]; }
export interface AIRecommendation { id: UUID; title: string; description: string; accepted: boolean; priority: number; }
export interface AIRisk { id: UUID; title: string; description: string; severity: string; resolved: boolean; mitigation: string; }
export interface AIOptimization { id: UUID; area: string; proposal: string; applied: boolean; }
export interface AIContextInformation { enabled: boolean; assistantVersion: string; generatedRecommendations: AIRecommendation[]; risks: AIRisk[]; optimizations: AIOptimization[]; confidence: Percentage; }
export interface GeneralObservations { technicalObservations: string[]; legalObservations: string[]; economicObservations: string[]; administrativeObservations: string[]; finalComments: string; }
export interface ContractMetadata { language: string; locale: string; timezone: string; tags: string[]; keywords: string[]; classification: string; confidentialityLevel: ConfidentialityLevel; publicAccess: boolean; }
export interface ContractConfiguration { automaticGeneration: boolean; automaticValidation: boolean; automaticLegalReview: boolean; automaticNotifications: boolean; automaticVersioning: boolean; preserveAuditTrail: boolean; allowManualOverrides: boolean; }
export interface ContractStatistics { generatedDocuments: number; validationErrors: number; validationWarnings: number; legalRecommendations: number; aiRecommendations: number; executionTimeMilliseconds: number; lastCalculationDate: ISODate; }
export interface ContractHealthStatus { complete: boolean; valid: boolean; reviewed: boolean; approved: boolean; exportable: boolean; pendingTasks: string[]; }
export interface ContractRuntimeInformation { currentStage: string; currentOperation: string; percentageCompleted: number; startedAt: ISODate; lastUpdate: ISODate; elapsedMilliseconds: number; generatedByEngine: string; executionIdentifier: UUID; }

export interface ContractContext {
  identification: ContractIdentification;
  administration: AdministrativeInformation;
  publicNeed: PublicNeed;
  contractObject: ContractObject;
  scope: ContractScope;
  economy: EconomicInformation;
  duration: ContractDuration;
  schedule: ScheduleInformation;
  procedure: ProcurementProcedure;
  publication: PublicationInformation;
  deadlines: ProcurementDeadlines;
  procurementBoard: ProcurementBoard;
  economicSolvency: EconomicSolvency;
  technicalSolvency: TechnicalSolvency;
  guarantees: ContractGuarantees;
  businessClassification: BusinessClassification;
  awardCriteria: AwardCriteria;
  expertCommittee: ExpertCommittee;
  specialExecutionConditions: SpecialExecutionConditions;
  subcontracting: SubcontractingInformation;
  modifications: ContractModification;
  penalties: PenaltySystem;
  termination: ContractTermination;
  documents: ContractDocuments;
  signatures: DigitalSignatureInformation;
  audit: AuditInformation;
  versionHistory: VersionHistory;
  artificialIntelligence: AIContextInformation;
  observations: GeneralObservations;
  metadata: ContractMetadata;
  configuration: ContractConfiguration;
  statistics: ContractStatistics;
  health: ContractHealthStatus;
  customProperties?: Record<string, unknown>;
  runtime?: ContractRuntimeInformation;
}

const now = (): ISODate => new Date().toISOString();

export class ContractContextModel implements ContractContext {
  public identification!: ContractIdentification;
  public administration!: AdministrativeInformation;
  public publicNeed!: PublicNeed;
  public contractObject!: ContractObject;
  public scope!: ContractScope;
  public economy!: EconomicInformation;
  public duration!: ContractDuration;
  public schedule!: ScheduleInformation;
  public procedure!: ProcurementProcedure;
  public publication!: PublicationInformation;
  public deadlines!: ProcurementDeadlines;
  public procurementBoard!: ProcurementBoard;
  public economicSolvency!: EconomicSolvency;
  public technicalSolvency!: TechnicalSolvency;
  public guarantees!: ContractGuarantees;
  public businessClassification!: BusinessClassification;
  public awardCriteria!: AwardCriteria;
  public expertCommittee!: ExpertCommittee;
  public specialExecutionConditions!: SpecialExecutionConditions;
  public subcontracting!: SubcontractingInformation;
  public modifications!: ContractModification;
  public penalties!: PenaltySystem;
  public termination!: ContractTermination;
  public documents!: ContractDocuments;
  public signatures!: DigitalSignatureInformation;
  public audit!: AuditInformation;
  public versionHistory!: VersionHistory;
  public artificialIntelligence!: AIContextInformation;
  public observations!: GeneralObservations;
  public metadata!: ContractMetadata;
  public configuration!: ContractConfiguration;
  public statistics!: ContractStatistics;
  public health!: ContractHealthStatus;
  public customProperties: Record<string, unknown> = {};
  public runtime?: ContractRuntimeInformation;

  constructor() { this.initialize(); }

  private initialize(): void {
    const timestamp = now();
    const id = crypto.randomUUID();
    const authority: ContractingAuthority = { id: crypto.randomUUID(), code: "", name: "", department: "", organization: "", nif: "", address: "", postalCode: "", municipality: "", province: "", autonomousCommunity: "Andalucía", country: "España" };
    const unit: PromotingUnit = { id: crypto.randomUUID(), code: "", name: "", service: "", department: "", manager: "" };
    const manager: ContractManager = { id: crypto.randomUUID(), fullName: "", position: "", professionalCategory: "", email: "" };
    this.identification = { id, expedienteNumber: "", title: "", description: "", creationDate: timestamp, lastUpdate: timestamp, status: ContractContextStatus.DRAFT, priority: ContractPriority.NORMAL };
    this.administration = { authority, promotingUnit: unit, contractManager: manager, processingType: ProcessingType.ORDINARIA, financingType: FinancingType.ORDINARY, budgetApplication: "", annuality: new Date().getFullYear(), estimatedStartDate: timestamp, estimatedEndDate: timestamp };
    this.publicNeed = { id: crypto.randomUUID(), title: "", description: "", background: "", publicInterest: "", objectives: [], expectedBenefits: [], legalCompetence: [], insufficiencyOfOwnResources: "" };
    this.contractObject = { id: crypto.randomUUID(), title: "", description: "", contractType: ContractType.SERVICIOS, mainCPV: "", secondaryCPVs: [], divisionIntoLots: false, innovationComponent: false, environmentalComponent: false, socialComponent: false };
    this.scope = { geographicalScope: "", executionLocations: [], estimatedUsers: 0, expectedDeliverables: [], exclusions: [], assumptions: [] };
    this.economy = { baseBudget: 0, vatPercentage: 21, vatAmount: 0, totalBudget: 0, estimatedValue: 0, financingType: FinancingType.ORDINARY, cofinanced: false, europeanFunds: false, budgetApplication: "", annualDistribution: [] };
    this.duration = { executionMonths: 0, executionDays: 0, startDate: timestamp, expectedEndDate: timestamp, extensionsAllowed: false, maximumExtensions: 0, extensionMonths: 0, maximumDurationMonths: 0 };
    this.schedule = { estimatedPublicationDate: timestamp, estimatedAwardDate: timestamp, estimatedFormalizationDate: timestamp, estimatedExecutionStart: timestamp, estimatedCompletion: timestamp };
    this.procedure = { procedureType: ProcedureType.ABIERTO, processingType: ProcessingType.ORDINARIA, harmonizedContract: false, reservedContract: false, simplifiedProcedure: false, negotiatedProcedure: false, emergencyProcessing: false, urgencyProcessing: false, priorConsultationRequired: false };
    this.publication = { publicationRequired: false, contractorProfile: true, douePublication: false, boePublication: false, bojaPublication: false, publicationObservations: [] };
    this.deadlines = { tenderSubmissionDays: 0, clarificationDays: 0, evaluationDays: 0, awardDays: 0, formalizationDays: 0, appealDays: 0 };
    this.procurementBoard = { required: false, president: "", secretary: "", members: [], technicalAdvisors: [] };
    this.economicSolvency = { required: false, minimumTurnover: 0, turnoverYears: 0, professionalRiskInsurance: false, insuranceAmount: 0, financialRatiosRequired: false, observations: [] };
    this.technicalSolvency = { required: false, similarContractsRequired: false, minimumSimilarContracts: 0, referencePeriodYears: 0, technicalStaffRequired: false, minimumTechnicalStaff: 0, qualityCertificates: [], environmentalCertificates: [], observations: [] };
    this.guarantees = { provisionalGuaranteeRequired: false, provisionalGuaranteeAmount: 0, definitiveGuaranteeRequired: false, definitiveGuaranteePercentage: 0, complementaryGuaranteeRequired: false, complementaryGuaranteePercentage: 0, observations: [] };
    this.businessClassification = { required: false, groups: [], subgroups: [], categories: [], justification: "" };
    this.awardCriteria = { automaticCriteria: [], judgementCriteria: [], automaticWeight: 0, judgementWeight: 0, abnormalOffersAnalysis: false, tieBreakingCriteria: [] };
    this.expertCommittee = { required: false, members: [], secretary: "", president: "", observations: [] };
    this.specialExecutionConditions = { environmentalConditions: [], socialConditions: [], innovationConditions: [], ethicalConditions: [], monitoringRequired: false };
    this.subcontracting = { allowed: true, maximumPercentage: 0, criticalTasks: [], directPayments: false, subcontractorCommunicationRequired: false, observations: [] };
    this.modifications = { modificationsForeseen: false, maximumModificationPercentage: 0, modificationCauses: [], legalBasis: [], economicImpactAllowed: false, observations: [] };
    this.penalties = { delayPenalties: true, qualityPenalties: false, executionPenalties: false, environmentalPenalties: false, socialPenalties: false, calculationMethod: "", maximumPenaltyPercentage: 0, observations: [] };
    this.termination = { terminationCauses: [], specialTerminationCauses: [], compensationRules: [], seizureApplicable: false, observations: [] };
    this.documents = { administrativeReport: false, technicalReport: false, legalReport: false, ppt: false, pcap: false, generatedDocuments: [] };
    this.signatures = { signaturesRequired: false, signatories: [], signed: false };
    this.audit = { createdBy: "ContractGenerator", createdDate: timestamp, lastModifiedBy: "ContractGenerator", lastModifiedDate: timestamp, revision: 0, auditTrail: [] };
    this.versionHistory = { currentVersion: "1.0.0", records: [] };
    this.artificialIntelligence = { enabled: false, assistantVersion: "", generatedRecommendations: [], risks: [], optimizations: [], confidence: 0 };
    this.observations = { technicalObservations: [], legalObservations: [], economicObservations: [], administrativeObservations: [], finalComments: "" };
    this.metadata = { language: "es", locale: "es-ES", timezone: "Europe/Madrid", tags: [], keywords: [], classification: "", confidentialityLevel: ConfidentialityLevel.INTERNAL, publicAccess: false };
    this.configuration = { automaticGeneration: true, automaticValidation: true, automaticLegalReview: true, automaticNotifications: false, automaticVersioning: true, preserveAuditTrail: true, allowManualOverrides: true };
    this.statistics = { generatedDocuments: 0, validationErrors: 0, validationWarnings: 0, legalRecommendations: 0, aiRecommendations: 0, executionTimeMilliseconds: 0, lastCalculationDate: timestamp };
    this.health = { complete: false, valid: false, reviewed: false, approved: false, exportable: false, pendingTasks: [] };
    this.runtime = { currentStage: "INITIALIZATION", currentOperation: "ContractContext initialization", percentageCompleted: 0, startedAt: timestamp, lastUpdate: timestamp, elapsedMilliseconds: 0, generatedByEngine: "ContractGenerator", executionIdentifier: crypto.randomUUID() };
  }

  public updateProgress(stage: string, operation: string, percentage: number): void { if (!this.runtime) return; this.runtime.currentStage = stage; this.runtime.currentOperation = operation; this.runtime.percentageCompleted = percentage; this.runtime.lastUpdate = now(); }
  public setProperty(key: string, value: unknown): void { this.customProperties[key] = value; }
  public getProperty<T = unknown>(key: string): T | undefined { return this.customProperties[key] as T | undefined; }
  public hasProperty(key: string): boolean { return Object.prototype.hasOwnProperty.call(this.customProperties, key); }
  public removeProperty(key: string): void { delete this.customProperties[key]; }
  public getProperties(): Record<string, unknown> { return { ...this.customProperties }; }
  public clearProperties(): void { this.customProperties = {}; }
  public updateStatistics(statistics: Partial<ContractStatistics>): void { this.statistics = { ...this.statistics, ...statistics, lastCalculationDate: now() }; }
  public markReviewed(reviewer: string): void { this.health.reviewed = true; this.audit.lastModifiedBy = reviewer; this.touch(); }
  public updateRuntime(operation: string, stage = this.runtime?.currentStage ?? "RUNNING"): void { this.updateProgress(stage, operation, this.runtime?.percentageCompleted ?? 0); }
  public resetRuntime(): void { const timestamp = now(); this.runtime = { currentStage: "INITIALIZATION", currentOperation: "ContractContext reset", percentageCompleted: 0, startedAt: timestamp, lastUpdate: timestamp, elapsedMilliseconds: 0, generatedByEngine: "ContractGenerator", executionIdentifier: crypto.randomUUID() }; }
  public finishRuntime(): void { if (this.runtime) { this.runtime.currentStage = "COMPLETED"; this.runtime.currentOperation = "Generation completed"; this.runtime.percentageCompleted = 100; this.runtime.lastUpdate = now(); this.calculateElapsedTime(); } }
  public getId(): UUID { return this.identification.id; }
  public calculateElapsedTime(): number { if (!this.runtime) return 0; this.runtime.elapsedMilliseconds = Date.now() - new Date(this.runtime.startedAt).getTime(); return this.runtime.elapsedMilliseconds; }
  public registerAuditEntry(action: string, module: string, description: string, previousValue?: string, newValue?: string): void { this.audit.auditTrail.push({ id: crypto.randomUUID(), timestamp: now(), user: this.audit.lastModifiedBy, action, module, description, previousValue, newValue }); this.touch(); }
  public getLastAuditEntry(): AuditEntry | undefined { return this.audit.auditTrail.at(-1); }
  public getAuditTrail(): readonly AuditEntry[] { return [...this.audit.auditTrail]; }
  public clearAuditTrail(): void { this.audit.auditTrail = []; }
  public validate(): string[] { const errors: string[] = []; if (!this.identification) errors.push("Identification section is missing."); if (!this.administration) errors.push("Administration section is missing."); if (!this.publicNeed) errors.push("Public need section is missing."); if (!this.contractObject) errors.push("Contract object section is missing."); this.health.valid = errors.length === 0; this.health.complete = errors.length === 0; this.health.pendingTasks = [...errors]; return errors; }
  public isValid(): boolean { return this.validate().length === 0; }
  public getSummary(): Record<string, unknown> { return { expediente: this.identification.expedienteNumber, objeto: this.contractObject.description, valorEstimado: this.economy.estimatedValue, procedimiento: this.procedure.procedureType, estado: this.identification.status }; }
  public touch(): void { this.identification.lastUpdate = now(); this.audit.lastModifiedDate = this.identification.lastUpdate; }
  public increaseRevision(): void { this.audit.revision += 1; this.touch(); }
  public toPersistenceObject(): Record<string, unknown> { return JSON.parse(this.toJSON()) as Record<string, unknown>; }
  public getApproximateSize(): number { return Buffer.byteLength(this.toJSON(), "utf8"); }
  public hasPendingChanges(): boolean { return this.audit.revision > 0 && this.versionHistory.records.length === 0; }
  public synchronizeHealthStatus(): void { this.health.valid = this.validate().length === 0; this.health.exportable = this.health.valid && this.health.reviewed; }
  public recalculateStatistics(): void { this.statistics.generatedDocuments = this.documents.generatedDocuments.length; this.statistics.aiRecommendations = this.artificialIntelligence.generatedRecommendations.length; this.statistics.lastCalculationDate = now(); }
  public refresh(): void { this.touch(); this.calculateElapsedTime(); this.recalculateStatistics(); this.synchronizeHealthStatus(); }
  public getMainCPV(): CPVCode { return this.contractObject.mainCPV; }
  public getAllCPVs(): CPVCode[] { return [this.contractObject.mainCPV, ...this.contractObject.secondaryCPVs].filter(Boolean); }
  public hasLots(): boolean { return this.contractObject.divisionIntoLots; }
  public getEstimatedValue(): Money { return this.economy.estimatedValue; }
  public isHarmonizedContract(): boolean { return this.procedure.harmonizedContract; }
  public getMaximumDurationMonths(): number { return this.duration.maximumDurationMonths; }
  public requiresSolvency(): boolean { return this.economicSolvency.required || this.technicalSolvency.required; }
  public requiresDefinitiveGuarantee(): boolean { return this.guarantees.definitiveGuaranteeRequired; }
  public getDefinitiveGuaranteePercentage(): Percentage { return this.guarantees.definitiveGuaranteePercentage; }
  public hasSpecialExecutionConditions(): boolean { return this.specialExecutionConditions.environmentalConditions.length + this.specialExecutionConditions.socialConditions.length + this.specialExecutionConditions.innovationConditions.length + this.specialExecutionConditions.ethicalConditions.length > 0; }
  public hasEuropeanFunding(): boolean { return this.economy.europeanFunds; }
  public getExecutiveSummary(): Record<string, unknown> { return { ...this.getSummary(), necesidad: this.publicNeed.description, lotes: this.hasLots(), fondosEuropeos: this.hasEuropeanFunding() }; }
  public getLogContext(): Record<string, string> { return { expediente: this.identification.expedienteNumber, id: this.identification.id, stage: this.runtime?.currentStage ?? "" }; }
  public setCurrentEngine(engine: string, operation: string): void { if (!this.runtime) this.resetRuntime(); this.runtime!.generatedByEngine = engine; this.runtime!.currentOperation = operation; this.runtime!.lastUpdate = now(); }
  public hasPendingAIRecommendations(): boolean { return this.artificialIntelligence.generatedRecommendations.some(recommendation => !recommendation.accepted); }
  public dispose(): void { this.runtime = undefined; this.customProperties = {}; }
  public toString(): string { return `ContractContext { ${this.identification.expedienteNumber} | ${this.contractObject.description} }`; }
  public toJSON(): string { return JSON.stringify(this); }
  public clone(): ContractContextModel { return ContractContextModel.fromJSON(this.toJSON()); }
  public static create(): ContractContextModel { return new ContractContextModel(); }
  public static fromJSON(json: string): ContractContextModel { const context = new ContractContextModel(); Object.assign(context, JSON.parse(json)); return context; }
  public static fromObject(object: Partial<ContractContext>): ContractContextModel { const context = new ContractContextModel(); Object.assign(context, object); return context; }
}
