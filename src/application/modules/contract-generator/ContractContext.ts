/**
 * =============================================================================
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 * -----------------------------------------------------------------------------
 * Archivo:
 * ContractContext.ts
 *
 * Módulo:
 * Contract Generator
 *
 * Propósito:
 * Modelo maestro del expediente administrativo.
 *
 * Todo el sistema trabajará utilizando este objeto.
 *
 * Ningún motor deberá intercambiar decenas de parámetros.
 *
 * El ContractContext será el único objeto compartido entre:
 *
 *  • Workflow
 *  • ContractGenerator
 *  • LegalReasoner
 *  • RuleEngine
 *  • InferenceEngine
 *  • ValidationEngine
 *  • DocumentGenerator
 *  • PPTGenerator
 *  • PCAPGenerator
 *  • MemoriaGenerator
 *  • InformeGenerator
 *  • ResolucionGenerator
 *  • Exportadores
 *  • Inteligencia Artificial
 *
 * =============================================================================
 */

import {

    UUID,
    ISODate,
    Money,
    Percentage

} from "../../domain/common/types";

import {

    CPVCode

} from "../../domain/contracts/CPV";

import {

    ContractType,
    ProcedureType,
    ProcessingType

} from "../../domain/contracts/ContractTypes";

import {

    LegalReference

} from "../../domain/legal/LegalReference";

/**
 * =============================================================================
 * Enumeraciones principales
 * =============================================================================
 */

export enum ContractContextStatus {

    DRAFT = "DRAFT",

    IN_PROGRESS = "IN_PROGRESS",

    LEGAL_ANALYSIS = "LEGAL_ANALYSIS",

    DOCUMENT_GENERATION = "DOCUMENT_GENERATION",

    VALIDATION = "VALIDATION",

    READY = "READY",

    APPROVED = "APPROVED",

    ARCHIVED = "ARCHIVED"

}

export enum ContractPriority {

    LOW = "LOW",

    NORMAL = "NORMAL",

    HIGH = "HIGH",

    URGENT = "URGENT",

    EMERGENCY = "EMERGENCY"

}

export enum FinancingType {

    ORDINARY = "ORDINARY",

    EUROPEAN = "EUROPEAN",

    STATE = "STATE",

    AUTONOMIC = "AUTONOMIC",

    MIXED = "MIXED"

}

/**
 * =============================================================================
 * Información básica del expediente
 * =============================================================================
 */

export interface ContractIdentification {

    id: UUID;

    expedienteNumber: string;

    title: string;

    description: string;

    creationDate: ISODate;

    lastUpdate: ISODate;

    status: ContractContextStatus;

    priority: ContractPriority;

}

/**
 * =============================================================================
 * Órgano de contratación
 * =============================================================================
 */

export interface ContractingAuthority {

    id: UUID;

    code: string;

    name: string;

    department: string;

    organization: string;

    nif: string;

    address: string;

    postalCode: string;

    municipality: string;

    province: string;

    autonomousCommunity: string;

    country: string;

    website?: string;

    profileUrl?: string;

}

/**
 * =============================================================================
 * Unidad promotora
 * =============================================================================
 */

export interface PromotingUnit {

    id: UUID;

    code: string;

    name: string;

    service: string;

    department: string;

    manager: string;

    email?: string;

    telephone?: string;

}

/**
 * =============================================================================
 * Responsable del contrato
 * =============================================================================
 */

export interface ContractManager {

    id: UUID;

    fullName: string;

    position: string;

    professionalCategory: string;

    email: string;

    telephone?: string;

    mobile?: string;

    digitalCertificate?: string;

}

/**
 * =============================================================================
 * Datos administrativos generales
 * =============================================================================
 */

export interface AdministrativeInformation {

    authority: ContractingAuthority;

    promotingUnit: PromotingUnit;

    contractManager: ContractManager;

    processingType: ProcessingType;

    financingType: FinancingType;

    budgetApplication: string;

    annuality: number;

    estimatedStartDate: ISODate;

    estimatedEndDate: ISODate;

}

/**
 * =============================================================================
 * Necesidad pública
 * =============================================================================
 */

export interface PublicNeed {

    id: UUID;

    title: string;

    description: string;

    background: string;

    publicInterest: string;

    objectives: string[];

    expectedBenefits: string[];

    legalCompetence: LegalReference[];

    urgencyJustification?: string;

    insufficiencyOfOwnResources: string;

}

/**
 * =============================================================================
 * Objeto del contrato
 * =============================================================================
 */

export interface ContractObject {

    id: UUID;

    title: string;

    description: string;

    contractType: ContractType;

    mainCPV: CPVCode;

    secondaryCPVs: CPVCode[];

    divisionIntoLots: boolean;

    justificationNoLots?: string;

    innovationComponent: boolean;

    environmentalComponent: boolean;

    socialComponent: boolean;

}

/**
 * =============================================================================
 * Alcance del contrato
 * =============================================================================
 */

export interface ContractScope {

    geographicalScope: string;

    executionLocations: string[];

    estimatedUsers: number;

    expectedDeliverables: string[];

    exclusions: string[];

    assumptions: string[];

}

/**
 * =============================================================================
 * Información económica
 * =============================================================================
 */

export interface EconomicInformation {

    baseBudget: Money;

    vatPercentage: Percentage;

    vatAmount: Money;

    totalBudget: Money;

    estimatedValue: Money;

    financingType: FinancingType;

    cofinanced: boolean;

    europeanFunds: boolean;

    fundingProgram?: string;

    budgetApplication: string;

    annualDistribution: AnnualBudget[];

}

/**
 * =============================================================================
 * Distribución por anualidades
 * =============================================================================
 */

export interface AnnualBudget {

    fiscalYear: number;

    amount: Money;

    percentage: Percentage;

}

/**
 * =============================================================================
 * Duración del contrato
 * =============================================================================
 */

export interface ContractDuration {

    executionMonths: number;

    executionDays: number;

    startDate: ISODate;

    expectedEndDate: ISODate;

    extensionsAllowed: boolean;

    maximumExtensions: number;

    extensionMonths: number;

    maximumDurationMonths: number;

}

/**
 * =============================================================================
 * Información temporal
 * =============================================================================
 */

export interface ScheduleInformation {

    estimatedPublicationDate: ISODate;

    estimatedAwardDate: ISODate;

    estimatedFormalizationDate: ISODate;

    estimatedExecutionStart: ISODate;

    estimatedCompletion: ISODate;

}

/**
 * =============================================================================
 * Procedimiento de contratación
 * =============================================================================
 */

export interface ProcurementProcedure {

    procedureType: ProcedureType;

    processingType: ProcessingType;

    harmonizedContract: boolean;

    reservedContract: boolean;

    simplifiedProcedure: boolean;

    negotiatedProcedure: boolean;

    emergencyProcessing: boolean;

    urgencyProcessing: boolean;

    priorConsultationRequired: boolean;

}

/**
 * =============================================================================
 * Publicidad
 * =============================================================================
 */

export interface PublicationInformation {

    publicationRequired: boolean;

    contractorProfile: boolean;

    douePublication: boolean;

    boePublication: boolean;

    bojaPublication: boolean;

    publicationObservations: string[];

}

/**
 * =============================================================================
 * Plazos del procedimiento
 * =============================================================================
 */

export interface ProcurementDeadlines {

    tenderSubmissionDays: number;

    clarificationDays: number;

    evaluationDays: number;

    awardDays: number;

    formalizationDays: number;

    appealDays: number;

}

/**
 * =============================================================================
 * Mesa de contratación
 * =============================================================================
 */

export interface ProcurementBoard {

    required: boolean;

    president: string;

    secretary: string;

    members: string[];

    technicalAdvisors: string[];

}

/**
 * =============================================================================
 * Solvencia económica y financiera
 * =============================================================================
 */

export interface EconomicSolvency {

    required: boolean;

    minimumTurnover: Money;

    turnoverYears: number;

    professionalRiskInsurance: boolean;

    insuranceAmount: Money;

    financialRatiosRequired: boolean;

    observations: string[];

}

/**
 * =============================================================================
 * Solvencia técnica y profesional
 * =============================================================================
 */

export interface TechnicalSolvency {

    required: boolean;

    similarContractsRequired: boolean;

    minimumSimilarContracts: number;

    referencePeriodYears: number;

    technicalStaffRequired: boolean;

    minimumTechnicalStaff: number;

    qualityCertificates: string[];

    environmentalCertificates: string[];

    observations: string[];

}

/**
 * =============================================================================
 * Garantías
 * =============================================================================
 */

export interface ContractGuarantees {

    provisionalGuaranteeRequired: boolean;

    provisionalGuaranteeAmount: Money;

    definitiveGuaranteeRequired: boolean;

    definitiveGuaranteePercentage: Percentage;

    complementaryGuaranteeRequired: boolean;

    complementaryGuaranteePercentage: Percentage;

    observations: string[];

}

/**
 * =============================================================================
 * Clasificación empresarial
 * =============================================================================
 */

export interface BusinessClassification {

    required: boolean;

    groups: string[];

    subgroups: string[];

    categories: string[];

    justification: string;

}

/**
 * =============================================================================
 * Criterios de adjudicación
 * =============================================================================
 */

export interface AwardCriteria {

    automaticCriteria: AutomaticCriterion[];

    judgementCriteria: JudgementCriterion[];

    automaticWeight: Percentage;

    judgementWeight: Percentage;

    abnormalOffersAnalysis: boolean;

    tieBreakingCriteria: string[];

}

/**
 * =============================================================================
 * Criterio automático
 * =============================================================================
 */

export interface AutomaticCriterion {

    id: UUID;

    name: string;

    description: string;

    weight: Percentage;

    maximumScore: number;

    mathematicalFormula: string;

    justification: string;

}

/**
 * =============================================================================
 * Criterio sometido a juicio de valor
 * =============================================================================
 */

export interface JudgementCriterion {

    id: UUID;

    name: string;

    description: string;

    weight: Percentage;

    maximumScore: number;

    evaluationMethod: string;

    justification: string;

}

/**
 * =============================================================================
 * Comité de expertos
 * =============================================================================
 */

export interface ExpertCommittee {

    required: boolean;

    members: string[];

    secretary: string;

    president: string;

    observations: string[];

}

/**
 * =============================================================================
 * Condiciones especiales de ejecución
 * =============================================================================
 */

export interface SpecialExecutionConditions {

    environmentalConditions: EnvironmentalCondition[];

    socialConditions: SocialCondition[];

    innovationConditions: InnovationCondition[];

    ethicalConditions: EthicalCondition[];

    monitoringRequired: boolean;

}

/**
 * =============================================================================
 * Condiciones medioambientales
 * =============================================================================
 */

export interface EnvironmentalCondition {

    id: UUID;

    description: string;

    mandatory: boolean;

    legalBasis: LegalReference[];

    verificationMethod: string;

}

/**
 * =============================================================================
 * Condiciones sociales
 * =============================================================================
 */

export interface SocialCondition {

    id: UUID;

    description: string;

    mandatory: boolean;

    legalBasis: LegalReference[];

    verificationMethod: string;

}

/**
 * =============================================================================
 * Condiciones de innovación
 * =============================================================================
 */

export interface InnovationCondition {

    id: UUID;

    description: string;

    mandatory: boolean;

    legalBasis: LegalReference[];

    verificationMethod: string;

}

/**
 * =============================================================================
 * Condiciones éticas
 * =============================================================================
 */

export interface EthicalCondition {

    id: UUID;

    description: string;

    mandatory: boolean;

    legalBasis: LegalReference[];

    verificationMethod: string;

}

/**
 * =============================================================================
 * Subcontratación
 * =============================================================================
 */

export interface SubcontractingInformation {

    allowed: boolean;

    maximumPercentage: Percentage;

    criticalTasks: string[];

    directPayments: boolean;

    subcontractorCommunicationRequired: boolean;

    observations: string[];

}

/**
 * =============================================================================
 * Modificaciones del contrato
 * =============================================================================
 */

export interface ContractModification {

    modificationsForeseen: boolean;

    maximumModificationPercentage: Percentage;

    modificationCauses: string[];

    legalBasis: LegalReference[];

    economicImpactAllowed: boolean;

    observations: string[];

}

/**
 * =============================================================================
 * Penalidades
 * =============================================================================
 */

export interface PenaltySystem {

    delayPenalties: boolean;

    qualityPenalties: boolean;

    executionPenalties: boolean;

    environmentalPenalties: boolean;

    socialPenalties: boolean;

    calculationMethod: string;

    maximumPenaltyPercentage: Percentage;

    observations: string[];

}

/**
 * =============================================================================
 * Resolución del contrato
 * =============================================================================
 */

export interface ContractTermination {

    terminationCauses: string[];

    specialTerminationCauses: string[];

    compensationRules: string[];

    seizureApplicable: boolean;

    observations: string[];

}

/**
 * =============================================================================
 * Subcontratación
 * =============================================================================
 */

export interface SubcontractingInformation {

    allowed: boolean;

    maximumPercentage: Percentage;

    criticalTasks: string[];

    directPayments: boolean;

    subcontractorCommunicationRequired: boolean;

    observations: string[];

}

/**
 * =============================================================================
 * Modificaciones del contrato
 * =============================================================================
 */

export interface ContractModification {

    modificationsForeseen: boolean;

    maximumModificationPercentage: Percentage;

    modificationCauses: string[];

    legalBasis: LegalReference[];

    economicImpactAllowed: boolean;

    observations: string[];

}

/**
 * =============================================================================
 * Penalidades
 * =============================================================================
 */

export interface PenaltySystem {

    delayPenalties: boolean;

    qualityPenalties: boolean;

    executionPenalties: boolean;

    environmentalPenalties: boolean;

    socialPenalties: boolean;

    calculationMethod: string;

    maximumPenaltyPercentage: Percentage;

    observations: string[];

}

/**
 * =============================================================================
 * Resolución del contrato
 * =============================================================================
 */

export interface ContractTermination {

    terminationCauses: string[];

    specialTerminationCauses: string[];

    compensationRules: string[];

    seizureApplicable: boolean;

    observations: string[];

}

/**
 * =============================================================================
 * Documentación del expediente
 * =============================================================================
 */

export interface ContractDocuments {

    administrativeReport: boolean;

    technicalReport: boolean;

    economicReport: boolean;

    budgetCertificate: boolean;

    needReport: boolean;

    insufficiencyReport: boolean;

    approvalResolution: boolean;

    pcapGenerated: boolean;

    pptGenerated: boolean;

    annexesGenerated: boolean;

    generatedDocuments: GeneratedDocument[];

}

/**
 * =============================================================================
 * Documento generado
 * =============================================================================
 */

export interface GeneratedDocument {

    id: UUID;

    code: string;

    name: string;

    description: string;

    version: string;

    generatedDate: ISODate;

    generatedBy: string;

    fileName: string;

    fileExtension: string;

    sizeInBytes: number;

    digitalSignature: boolean;

    hash: string;

}

/**
 * =============================================================================
 * Firmas electrónicas
 * =============================================================================
 */

export interface DigitalSignatureInformation {

    signaturesRequired: boolean;

    signatories: Signatory[];

    signed: boolean;

    signingDate?: ISODate;

}

/**
 * =============================================================================
 * Firmante
 * =============================================================================
 */

export interface Signatory {

    id: UUID;

    fullName: string;

    position: string;

    organization: string;

    certificateIdentifier?: string;

    signatureRequired: boolean;

    signatureCompleted: boolean;

}

/**
 * =============================================================================
 * Auditoría del expediente
 * =============================================================================
 */

export interface AuditInformation {

    createdBy: string;

    createdDate: ISODate;

    lastModifiedBy: string;

    lastModifiedDate: ISODate;

    reviewedBy?: string;

    reviewDate?: ISODate;

    approvedBy?: string;

    approvalDate?: ISODate;

    version: number;

    revision: number;

    auditTrail: AuditEntry[];

}

/**
 * =============================================================================
 * Entrada de auditoría
 * =============================================================================
 */

export interface AuditEntry {

    id: UUID;

    timestamp: ISODate;

    user: string;

    action: string;

    module: string;

    description: string;

    previousValue?: string;

    newValue?: string;

}

/**
 * =============================================================================
 * Histórico de versiones
 * =============================================================================
 */

export interface VersionHistory {

    currentVersion: string;

    previousVersions: VersionRecord[];

}

/**
 * =============================================================================
 * Registro de versión
 * =============================================================================
 */

export interface VersionRecord {

    version: string;

    creationDate: ISODate;

    author: string;

    description: string;

    approved: boolean;

}

/**
 * =============================================================================
 * Inteligencia Artificial
 * =============================================================================
 */

export interface AIContextInformation {

    enabled: boolean;

    assistantVersion: string;

    reasoningModel: string;

    confidence: number;

    generatedRecommendations: AIRecommendation[];

    detectedRisks: AIRisk[];

    optimizationSuggestions: AIOptimization[];

}

/**
 * =============================================================================
 * Recomendación IA
 * =============================================================================
 */

export interface AIRecommendation {

    id: UUID;

    title: string;

    description: string;

    priority: number;

    accepted: boolean;

}

/**
 * =============================================================================
 * Riesgo detectado por IA
 * =============================================================================
 */

export interface AIRisk {

    id: UUID;

    title: string;

    description: string;

    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

    legalReference?: LegalReference[];

    resolved: boolean;

}

/**
 * =============================================================================
 * Optimización propuesta por IA
 * =============================================================================
 */

export interface AIOptimization {

    id: UUID;

    area: string;

    proposal: string;

    estimatedBenefit: string;

    applied: boolean;

}

/**
 * =============================================================================
 * Observaciones generales
 * =============================================================================
 */

export interface GeneralObservations {

    technicalObservations: string[];

    legalObservations: string[];

    economicObservations: string[];

    administrativeObservations: string[];

    finalComments: string;

}

/**
 * =============================================================================
 * Metadatos del expediente
 * =============================================================================
 */

export interface ContractMetadata {

    language: string;

    locale: string;

    timezone: string;

    tags: string[];

    keywords: string[];

    classification: string;

    confidentialityLevel: ConfidentialityLevel;

    publicAccess: boolean;

}

/**
 * =============================================================================
 * Nivel de confidencialidad
 * =============================================================================
 */

export enum ConfidentialityLevel {

    PUBLIC = "PUBLIC",

    INTERNAL = "INTERNAL",

    RESTRICTED = "RESTRICTED",

    CONFIDENTIAL = "CONFIDENTIAL"

}

/**
 * =============================================================================
 * Configuración del expediente
 * =============================================================================
 */

export interface ContractConfiguration {

    automaticGeneration: boolean;

    automaticValidation: boolean;

    automaticLegalReview: boolean;

    automaticNotifications: boolean;

    automaticVersioning: boolean;

    preserveAuditTrail: boolean;

    allowManualOverrides: boolean;

}

/**
 * =============================================================================
 * Estadísticas del expediente
 * =============================================================================
 */

export interface ContractStatistics {

    generatedDocuments: number;

    validationErrors: number;

    validationWarnings: number;

    legalRecommendations: number;

    aiRecommendations: number;

    executionTimeMilliseconds: number;

    lastCalculationDate: ISODate;

}

/**
 * =============================================================================
 * Estado general del expediente
 * =============================================================================
 */

export interface ContractHealthStatus {

    complete: boolean;

    valid: boolean;

    reviewed: boolean;

    approved: boolean;

    exportable: boolean;

    pendingTasks: string[];

}

/**
 * =============================================================================
 * Contexto completo del expediente
 * =============================================================================
 *
 * Esta es la entidad principal utilizada por todo el sistema.
 *
 * Todos los motores reciben y devuelven este objeto.
 *
 * No deben intercambiar parámetros individuales.
 *
 * =============================================================================
 */

export interface ContractContext {

    /**
     * -------------------------------------------------------------------------
     * Identificación
     * -------------------------------------------------------------------------
     */

    identification:

        ContractIdentification;

    /**
     * -------------------------------------------------------------------------
     * Administración
     * -------------------------------------------------------------------------
     */

    administration:

        AdministrativeInformation;

    /**
     * -------------------------------------------------------------------------
     * Necesidad pública
     * -------------------------------------------------------------------------
     */

    publicNeed:

        PublicNeed;

    /**
     * -------------------------------------------------------------------------
     * Objeto contractual
     * -------------------------------------------------------------------------
     */

    contractObject:

        ContractObject;

    /**
     * -------------------------------------------------------------------------
     * Alcance
     * -------------------------------------------------------------------------
     */

    scope:

        ContractScope;

    /**
     * -------------------------------------------------------------------------
     * Información económica
     * -------------------------------------------------------------------------
     */

    economy:

        EconomicInformation;

    /**
     * -------------------------------------------------------------------------
     * Duración
     * -------------------------------------------------------------------------
     */

    duration:

        ContractDuration;

    /**
     * -------------------------------------------------------------------------
     * Planificación
     * -------------------------------------------------------------------------
     */

    schedule:

        ScheduleInformation;

}

    /**
     * -------------------------------------------------------------------------
     * Procedimiento de contratación
     * -------------------------------------------------------------------------
     */

    procedure:

        ProcurementProcedure;

    /**
     * -------------------------------------------------------------------------
     * Publicidad
     * -------------------------------------------------------------------------
     */

    publication:

        PublicationInformation;

    /**
     * -------------------------------------------------------------------------
     * Plazos
     * -------------------------------------------------------------------------
     */

    deadlines:

        ProcurementDeadlines;

    /**
     * -------------------------------------------------------------------------
     * Mesa de contratación
     * -------------------------------------------------------------------------
     */

    procurementBoard:

        ProcurementBoard;

    /**
     * -------------------------------------------------------------------------
     * Solvencia económica
     * -------------------------------------------------------------------------
     */

    economicSolvency:

        EconomicSolvency;

    /**
     * -------------------------------------------------------------------------
     * Solvencia técnica
     * -------------------------------------------------------------------------
     */

    technicalSolvency:

        TechnicalSolvency;

    /**
     * -------------------------------------------------------------------------
     * Garantías
     * -------------------------------------------------------------------------
     */

    guarantees:

        ContractGuarantees;

    /**
     * -------------------------------------------------------------------------
     * Clasificación empresarial
     * -------------------------------------------------------------------------
     */

    businessClassification:

        BusinessClassification;

    /**
     * -------------------------------------------------------------------------
     * Criterios de adjudicación
     * -------------------------------------------------------------------------
     */

    awardCriteria:

        AwardCriteria;

    /**
     * -------------------------------------------------------------------------
     * Comité de expertos
     * -------------------------------------------------------------------------
     */

    expertCommittee:

        ExpertCommittee;

}

    /**
     * -------------------------------------------------------------------------
     * Condiciones especiales de ejecución
     * -------------------------------------------------------------------------
     */

    specialExecutionConditions:

        SpecialExecutionConditions;

    /**
     * -------------------------------------------------------------------------
     * Subcontratación
     * -------------------------------------------------------------------------
     */

    subcontracting:

        SubcontractingInformation;

    /**
     * -------------------------------------------------------------------------
     * Modificaciones previstas
     * -------------------------------------------------------------------------
     */

    modifications:

        ContractModification;

    /**
     * -------------------------------------------------------------------------
     * Penalidades
     * -------------------------------------------------------------------------
     */

    penalties:

        PenaltySystem;

    /**
     * -------------------------------------------------------------------------
     * Resolución del contrato
     * -------------------------------------------------------------------------
     */

    termination:

        ContractTermination;

    /**
     * -------------------------------------------------------------------------
     * Documentación generada
     * -------------------------------------------------------------------------
     */

    documents:

        ContractDocuments;

    /**
     * -------------------------------------------------------------------------
     * Firmas electrónicas
     * -------------------------------------------------------------------------
     */

    signatures:

        DigitalSignatureInformation;

    /**
     * -------------------------------------------------------------------------
     * Auditoría
     * -------------------------------------------------------------------------
     */

    audit:

        AuditInformation;

    /**
     * -------------------------------------------------------------------------
     * Histórico de versiones
     * -------------------------------------------------------------------------
     */

    versionHistory:

        VersionHistory;

}

    /**
     * -------------------------------------------------------------------------
     * Inteligencia Artificial
     * -------------------------------------------------------------------------
     */

    artificialIntelligence:

        AIContextInformation;

    /**
     * -------------------------------------------------------------------------
     * Observaciones generales
     * -------------------------------------------------------------------------
     */

    observations:

        GeneralObservations;

    /**
     * -------------------------------------------------------------------------
     * Metadatos
     * -------------------------------------------------------------------------
     */

    metadata:

        ContractMetadata;

    /**
     * -------------------------------------------------------------------------
     * Configuración
     * -------------------------------------------------------------------------
     */

    configuration:

        ContractConfiguration;

    /**
     * -------------------------------------------------------------------------
     * Estadísticas
     * -------------------------------------------------------------------------
     */

    statistics:

        ContractStatistics;

    /**
     * -------------------------------------------------------------------------
     * Estado de salud del expediente
     * -------------------------------------------------------------------------
     */

    health:

        ContractHealthStatus;

    /**
     * -------------------------------------------------------------------------
     * Información adicional
     * -------------------------------------------------------------------------
     */

    customProperties?:

        Record<string, unknown>;

    /**
     * -------------------------------------------------------------------------
     * Información temporal de ejecución
     * -------------------------------------------------------------------------
     */

    runtime?:

        ContractRuntimeInformation;

}

/**
 * =============================================================================
 * Clase base ContractContextModel
 * =============================================================================
 *
 * Implementación por defecto del contexto contractual.
 *
 * Proporciona:
 *
 *  • Inicialización
 *  • Validación básica
 *  • Serialización
 *  • Clonado
 *  • Gestión de propiedades
 *  • Preparación para persistencia
 *
 * =============================================================================
 */

export class ContractContextModel
    implements ContractContext {

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

    public customProperties?:

        Record<string, unknown>;

    public runtime?:

        ContractRuntimeInformation;

}

/**
 * =============================================================================
 * Constructor
 * =============================================================================
 */

    constructor() {

        this.initialize();

    }

/**
 * =============================================================================
 * Inicialización completa
 * =============================================================================
 */

    private initialize(): void {

        this.customProperties = {};

        this.runtime = {

            currentStage: "INITIALIZATION",

            currentOperation: "ContractContext initialization",

            percentageCompleted: 0,

            startedAt: new Date().toISOString() as ISODate,

            lastUpdate: new Date().toISOString() as ISODate,

            elapsedMilliseconds: 0,

            generatedByEngine: "ContractGenerator",

            executionIdentifier: crypto.randomUUID() as UUID

        };

    }

/**
 * =============================================================================
 * Actualiza el progreso de generación
 * =============================================================================
 */

    public updateProgress(

        stage: string,

        operation: string,

        percentage: number

    ): void {

        if (!this.runtime) {

            return;

        }

        this.runtime.currentStage = stage;

        this.runtime.currentOperation = operation;

        this.runtime.percentageCompleted = percentage;

        this.runtime.lastUpdate = new Date().toISOString() as ISODate;

    }

/**
 * =============================================================================
 * Añade una propiedad dinámica
 * =============================================================================
 */

    public setProperty(

        key: string,

        value: unknown

    ): void {

        if (!this.customProperties) {

            this.customProperties = {};

        }

        this.customProperties[key] = value;

    }

/**
 * =============================================================================
 * Obtiene una propiedad dinámica
 * =============================================================================
 */

    public getProperty<T = unknown>(

        key: string

    ): T | undefined {

        return this.customProperties?.[key] as T;

    }

/**
 * =============================================================================
 * Comprueba si existe una propiedad dinámica
 * =============================================================================
 */

    public hasProperty(

        key: string

    ): boolean {

        return this.customProperties !== undefined &&
               key in this.customProperties;

    }

/**
 * =============================================================================
 * Elimina una propiedad dinámica
 * =============================================================================
 */

    public removeProperty(

        key: string

    ): void {

        if (!this.customProperties) {

            return;

        }

        delete this.customProperties[key];

    }

/**
 * =============================================================================
 * Devuelve todas las propiedades dinámicas
 * =============================================================================
 */

    public getProperties():

        Record<string, unknown> {

        return {

            ...(this.customProperties ?? {})

        };

    }

/**
 * =============================================================================
 * Reinicia las propiedades dinámicas
 * =============================================================================
 */

    public clearProperties(): void {

        this.customProperties = {};

    }

/**
 * =============================================================================
 * Actualiza las estadísticas del expediente
 * =============================================================================
 */

    public updateStatistics(

        statistics: Partial<ContractStatistics>

    ): void {

        if (!this.statistics) {

            return;

        }

        this.statistics = {

            ...this.statistics,

            ...statistics,

            lastCalculationDate:

                new Date().toISOString() as ISODate

        };

    }

/**
 * =============================================================================
 * Marca el expediente como revisado
 * =============================================================================
 */

    public markReviewed(

        reviewer: string

    ): void {

        if (!this.audit) {

            return;

        }

        this.audit.reviewedBy = reviewer;

        this.audit.reviewDate =

            new Date().toISOString() as ISODate;

    }

/**
 * =============================================================================
 * Marca el expediente como aprobado
 * =============================================================================
 */

    public markApproved(

        approver: string

    ): void {

        if (!this.audit) {

            return;

        }

        this.audit.approvedBy = approver;

        this.audit.approvalDate =

            new Date().toISOString() as ISODate;

        if (this.health) {

            this.health.approved = true;

        }

    }

/**
 * =============================================================================
 * Actualiza el estado del expediente
 * =============================================================================
 */

    public setStatus(

        status: ContractContextStatus

    ): void {

        this.identification.status = status;

        this.identification.lastUpdate =

            new Date().toISOString() as ISODate;

    }

/**
 * =============================================================================
 * Obtiene el estado actual
 * =============================================================================
 */

    public getStatus():

        ContractContextStatus {

        return this.identification.status;

    }

/**
 * =============================================================================
 * Comprueba si el expediente está listo para exportar
 * =============================================================================
 */

    public isExportable(): boolean {

        return (

            this.health?.complete === true &&

            this.health?.valid === true &&

            this.health?.approved === true &&

            this.documents?.generatedDocuments.length > 0

        );

    }

/**
 * =============================================================================
 * Comprueba si el expediente está completo
 * =============================================================================
 */

    public isComplete(): boolean {

        return this.health?.complete ?? false;

    }

/**
 * =============================================================================
 * Comprueba si el expediente ha sido validado
 * =============================================================================
 */

    public isValidated(): boolean {

        return this.health?.valid ?? false;

    }

/**
 * =============================================================================
 * Comprueba si el expediente ha sido aprobado
 * =============================================================================
 */

    public isApproved(): boolean {

        return this.health?.approved ?? false;

    }

/**
 * =============================================================================
 * Devuelve el número de documentos generados
 * =============================================================================
 */

    public getGeneratedDocumentsCount(): number {

        return this.documents?.generatedDocuments?.length ?? 0;

    }

/**
 * =============================================================================
 * Añade un documento generado al expediente
 * =============================================================================
 */

    public addGeneratedDocument(

        document: GeneratedDocument

    ): void {

        if (!this.documents) {

            return;

        }

        this.documents.generatedDocuments.push(document);

        if (this.statistics) {

            this.statistics.generatedDocuments =
                this.documents.generatedDocuments.length;

            this.statistics.lastCalculationDate =
                new Date().toISOString() as ISODate;

        }

    }

/**
 * =============================================================================
 * Busca un documento por su código
 * =============================================================================
 */

    public findDocument(

        code: string

    ): GeneratedDocument | undefined {

        return this.documents?.generatedDocuments.find(

            d => d.code === code

        );

    }

/**
 * =============================================================================
 * Elimina un documento generado
 * =============================================================================
 */

    public removeGeneratedDocument(

        code: string

    ): void {

        if (!this.documents) {

            return;

        }

        this.documents.generatedDocuments =

            this.documents.generatedDocuments.filter(

                d => d.code !== code

            );

        if (this.statistics) {

            this.statistics.generatedDocuments =
                this.documents.generatedDocuments.length;

            this.statistics.lastCalculationDate =
                new Date().toISOString() as ISODate;

        }

    }

/**
 * =============================================================================
 * Comprueba si existe un documento generado
 * =============================================================================
 */

    public hasGeneratedDocument(

        code: string

    ): boolean {

        return this.findDocument(code) !== undefined;

    }

/**
 * =============================================================================
 * Devuelve todos los documentos generados
 * =============================================================================
 */

    public getGeneratedDocuments():

        readonly GeneratedDocument[] {

        return [...(this.documents?.generatedDocuments ?? [])];

    }

/**
 * =============================================================================
 * Serializa el ContractContext a JSON
 * =============================================================================
 */

    public toJSON(): string {

        return JSON.stringify(

            this,

            null,

            2

        );

    }

/**
 * =============================================================================
 * Crea un ContractContext desde un JSON
 * =============================================================================
 */

    public static fromJSON(

        json: string

    ): ContractContextModel {

        const data = JSON.parse(json);

        const context = new ContractContextModel();

        Object.assign(context, data);

        return context;

    }

/**
 * =============================================================================
 * Crea una copia profunda del contexto
 * =============================================================================
 */

    public clone(): ContractContextModel {

        return ContractContextModel.fromJSON(

            this.toJSON()

        );

    }

/**
 * =============================================================================
 * Reinicia la información temporal de ejecución
 * =============================================================================
 */

    public resetRuntime(): void {

        this.runtime = {

            currentStage: "INITIALIZATION",

            currentOperation: "Runtime reset",

            percentageCompleted: 0,

            startedAt: new Date().toISOString() as ISODate,

            lastUpdate: new Date().toISOString() as ISODate,

            elapsedMilliseconds: 0,

            generatedByEngine: "ContractGenerator",

            executionIdentifier:

                crypto.randomUUID() as UUID

        };

    }

/**
 * =============================================================================
 * Finaliza la ejecución
 * =============================================================================
 */

    public finishRuntime(): void {

        if (!this.runtime) {

            return;

        }

        this.runtime.percentageCompleted = 100;

        this.runtime.currentStage = "FINISHED";

        this.runtime.currentOperation =

            "Generation completed";

        this.runtime.lastUpdate =

            new Date().toISOString() as ISODate;

    }

/**
 * =============================================================================
 * Obtiene el identificador del expediente
 * =============================================================================
 */

    public getId(): UUID {

        return this.identification.id;

    }

/**
 * =============================================================================
 * Calcula el tiempo transcurrido de ejecución
 * =============================================================================
 */

    public calculateElapsedTime(): number {

        if (!this.runtime) {

            return 0;

        }

        const start =

            new Date(this.runtime.startedAt).getTime();

        const end = Date.now();

        this.runtime.elapsedMilliseconds = end - start;

        return this.runtime.elapsedMilliseconds;

    }

/**
 * =============================================================================
 * Registra una entrada de auditoría
 * =============================================================================
 */

    public registerAuditEntry(

        action: string,

        module: string,

        description: string,

        previousValue?: string,

        newValue?: string

    ): void {

        if (!this.audit) {

            return;

        }

        this.audit.auditTrail.push({

            id: crypto.randomUUID() as UUID,

            timestamp: new Date().toISOString() as ISODate,

            user:

                this.audit.lastModifiedBy,

            action,

            module,

            description,

            previousValue,

            newValue

        });

    }

/**
 * =============================================================================
 * Obtiene la última entrada de auditoría
 * =============================================================================
 */

    public getLastAuditEntry():

        AuditEntry | undefined {

        if (!this.audit) {

            return undefined;

        }

        return this.audit.auditTrail[

            this.audit.auditTrail.length - 1

        ];

    }

/**
 * =============================================================================
 * Devuelve todas las entradas de auditoría
 * =============================================================================
 */

    public getAuditTrail():

        readonly AuditEntry[] {

        return [

            ...(this.audit?.auditTrail ?? [])

        ];

    }

/**
 * =============================================================================
 * Limpia el histórico de auditoría
 * =============================================================================
 */

    public clearAuditTrail(): void {

        if (!this.audit) {

            return;

        }

        this.audit.auditTrail = [];

    }

/**
 * =============================================================================
 * Valida la estructura mínima del ContractContext
 * =============================================================================
 */

    public validate(): string[] {

        const errors: string[] = [];

        if (!this.identification) {

            errors.push("Identification section is missing.");

        }

        if (!this.administration) {

            errors.push("Administration section is missing.");

        }

        if (!this.publicNeed) {

            errors.push("Public need section is missing.");

        }

        if (!this.contractObject) {

            errors.push("Contract object section is missing.");

        }

        if (!this.economy) {

            errors.push("Economic information section is missing.");

        }

        if (!this.procedure) {

            errors.push("Procurement procedure section is missing.");

        }

        if (!this.documents) {

            errors.push("Documents section is missing.");

        }

        if (!this.health) {

            errors.push("Health section is missing.");

        }

        return errors;

    }

/**
 * =============================================================================
 * Comprueba si el contexto es válido
 * =============================================================================
 */

    public isValid(): boolean {

        return this.validate().length === 0;

    }

/**
 * =============================================================================
 * Devuelve un resumen del expediente
 * =============================================================================
 */

    public getSummary() {

        return {

            expediente:

                this.identification.expedienteNumber,

            title:

                this.identification.title,

            status:

                this.identification.status,

            contractType:

                this.contractObject.contractType,

            procedure:

                this.procedure.procedureType,

            estimatedValue:

                this.economy.estimatedValue,

            generatedDocuments:

                this.documents.generatedDocuments.length,

            approved:

                this.health.approved,

            exportable:

                this.isExportable()

        };

    }

/**
 * =============================================================================
 * Actualiza la fecha de modificación
 * =============================================================================
 */

    public touch(): void {

        this.identification.lastUpdate =

            new Date().toISOString() as ISODate;

    }

/**
 * =============================================================================
 * Incrementa automáticamente la revisión
 * =============================================================================
 */

    public increaseRevision(): void {

        if (!this.audit) {

            return;

        }

        this.audit.revision++;

        this.touch();

    }

/**
 * =============================================================================
 * Exporta un objeto plano listo para persistencia
 * =============================================================================
 */

    public toPersistenceObject(): Record<string, unknown> {

        return {

            identification: this.identification,

            administration: this.administration,

            publicNeed: this.publicNeed,

            contractObject: this.contractObject,

            scope: this.scope,

            economy: this.economy,

            duration: this.duration,

            schedule: this.schedule,

            procedure: this.procedure,

            publication: this.publication,

            deadlines: this.deadlines,

            procurementBoard: this.procurementBoard,

            economicSolvency: this.economicSolvency,

            technicalSolvency: this.technicalSolvency,

            guarantees: this.guarantees,

            businessClassification: this.businessClassification,

            awardCriteria: this.awardCriteria,

            expertCommittee: this.expertCommittee,

            specialExecutionConditions:

                this.specialExecutionConditions,

            subcontracting: this.subcontracting,

            modifications: this.modifications,

            penalties: this.penalties,

            termination: this.termination,

            documents: this.documents,

            signatures: this.signatures,

            audit: this.audit,

            versionHistory: this.versionHistory,

            artificialIntelligence:

                this.artificialIntelligence,

            observations: this.observations,

            metadata: this.metadata,

            configuration: this.configuration,

            statistics: this.statistics,

            health: this.health,

            customProperties: this.customProperties

        };

    }

/**
 * =============================================================================
 * Reconstruye el contexto desde persistencia
 * =============================================================================
 */

    public loadFromPersistence(

        data: Partial<ContractContext>

    ): void {

        Object.assign(

            this,

            data

        );

        this.touch();

    }

/**
 * =============================================================================
 * Devuelve el tamaño aproximado del contexto
 * =============================================================================
 */

    public getApproximateSize(): number {

        return new Blob(

            [

                JSON.stringify(

                    this.toPersistenceObject()

                )

            ]

        ).size;

    }

/**
 * =============================================================================
 * Indica si existen cambios pendientes
 * =============================================================================
 */

    public hasPendingChanges(): boolean {

        if (!this.audit) {

            return false;

        }

        return (

            this.audit.lastModifiedDate !==

            this.audit.approvalDate

        );

    }

/**
 * =============================================================================
 * Sincroniza el estado general del expediente
 * =============================================================================
 */

    public synchronizeHealthStatus(): void {

        if (!this.health) {

            return;

        }

        this.health.complete = this.isValid();

        this.health.valid = this.validate().length === 0;

        this.health.exportable = this.isExportable();

    }

/**
 * =============================================================================
 * Recalcula automáticamente las estadísticas
 * =============================================================================
 */

    public recalculateStatistics(): void {

        if (!this.statistics) {

            return;

        }

        this.statistics.generatedDocuments =

            this.documents?.generatedDocuments.length ?? 0;

        this.statistics.validationErrors =

            this.validate().length;

        this.statistics.lastCalculationDate =

            new Date().toISOString() as ISODate;

    }

/**
 * =============================================================================
 * Actualiza completamente el contexto
 * =============================================================================
 */

    public refresh(): void {

        this.touch();

        this.calculateElapsedTime();

        this.synchronizeHealthStatus();

        this.recalculateStatistics();

    }

/**
 * =============================================================================
 * Obtiene el CPV principal
 * =============================================================================
 */

    public getMainCPV(): CPVCode {

        return this.contractObject.mainCPV;

    }

/**
 * =============================================================================
 * Obtiene todos los CPV
 * =============================================================================
 */

    public getAllCPVs(): CPVCode[] {

        return [

            this.contractObject.mainCPV,

            ...this.contractObject.secondaryCPVs

        ];

    }

/**
 * =============================================================================
 * Comprueba si existen lotes
 * =============================================================================
 */

    public hasLots(): boolean {

        return this.contractObject.divisionIntoLots;

    }

/**
 * =============================================================================
 * Devuelve el valor estimado
 * =============================================================================
 */

    public getEstimatedValue(): Money {

        return this.economy.estimatedValue;

    }

/**
 * =============================================================================
 * Comprueba si el contrato está sujeto a regulación armonizada
 * =============================================================================
 */

    public isHarmonizedContract(): boolean {

        return this.procedure.harmonizedContract;

    }

/**
 * =============================================================================
 * Comprueba si existen prórrogas previstas
 * =============================================================================
 */

    public hasExtensions(): boolean {

        return this.duration.extensionsAllowed;

    }

/**
 * =============================================================================
 * Devuelve la duración máxima del contrato
 * =============================================================================
 */

    public getMaximumDurationMonths(): number {

        return this.duration.maximumDurationMonths;

    }

/**
 * =============================================================================
 * Comprueba si la solvencia es exigible
 * =============================================================================
 */

    public requiresSolvency(): boolean {

        return (

            this.economicSolvency.required ||

            this.technicalSolvency.required

        );

    }

/**
 * =============================================================================
 * Comprueba si existe garantía definitiva
 * =============================================================================
 */

    public requiresDefinitiveGuarantee(): boolean {

        return this.guarantees.definitiveGuaranteeRequired;

    }

/**
 * =============================================================================
 * Devuelve el porcentaje de garantía definitiva
 * =============================================================================
 */

    public getDefinitiveGuaranteePercentage():

        Percentage {

        return this.guarantees.definitiveGuaranteePercentage;

    }

/**
 * =============================================================================
 * Comprueba si existen condiciones especiales de ejecución
 * =============================================================================
 */

    public hasSpecialExecutionConditions(): boolean {

        return (

            this.specialExecutionConditions.environmentalConditions.length > 0 ||

            this.specialExecutionConditions.socialConditions.length > 0 ||

            this.specialExecutionConditions.innovationConditions.length > 0 ||

            this.specialExecutionConditions.ethicalConditions.length > 0

        );

    }

/**
 * =============================================================================
 * Comprueba si existe financiación europea
 * =============================================================================
 */

    public hasEuropeanFunding(): boolean {

        return this.economy.europeanFunds;

    }

/**
 * =============================================================================
 * Obtiene un resumen ejecutivo del expediente
 * =============================================================================
 */

    public getExecutiveSummary(): Record<string, unknown> {

        return {

            expediente:

                this.identification.expedienteNumber,

            titulo:

                this.identification.title,

            organo:

                this.administration.authority.name,

            procedimiento:

                this.procedure.procedureType,

            tipoContrato:

                this.contractObject.contractType,

            cpvPrincipal:

                this.contractObject.mainCPV,

            valorEstimado:

                this.economy.estimatedValue,

            presupuestoTotal:

                this.economy.totalBudget,

            estado:

                this.identification.status,

            exportable:

                this.isExportable(),

            valido:

                this.isValidated(),

            aprobado:

                this.isApproved()

        };

    }

/**
 * =============================================================================
 * Obtiene información para los registros de log
 * =============================================================================
 */

    public getLogContext(): Record<string, string> {

        return {

            expediente:

                this.identification.expedienteNumber,

            executionId:

                this.runtime?.executionIdentifier ?? "",

            stage:

                this.runtime?.currentStage ?? "",

            operation:

                this.runtime?.currentOperation ?? ""

        };

    }

/**
 * =============================================================================
 * Actualiza el motor que está ejecutando actualmente
 * =============================================================================
 */

    public setCurrentEngine(

        engine: string,

        operation: string

    ): void {

        if (!this.runtime) {

            return;

        }

        this.runtime.generatedByEngine = engine;

        this.runtime.currentOperation = operation;

        this.runtime.lastUpdate =

            new Date().toISOString() as ISODate;

    }

/**
 * =============================================================================
 * Comprueba si el expediente contiene recomendaciones IA pendientes
 * =============================================================================
 */

    public hasPendingAIRecommendations(): boolean {

        return this.artificialIntelligence
            .generatedRecommendations
            .some(r => !r.accepted);

    }

/**
 * =============================================================================
 * Devuelve el número de riesgos críticos detectados
 * =============================================================================
 */

    public getCriticalRiskCount(): number {

        return this.artificialIntelligence
            .detectedRisks
            .filter(

                r =>

                    r.severity === "CRITICAL" &&

                    !r.resolved

            )

            .length;

    }

/**
 * =============================================================================
 * Libera recursos temporales de ejecución
 * =============================================================================
 */

    public dispose(): void {

        this.runtime = undefined;

        this.customProperties = {};

    }

/**
 * =============================================================================
 * Devuelve una representación simplificada para depuración
 * =============================================================================
 */

    public toString(): string {

        return [

            "ContractContext {",

            ` expediente="${this.identification.expedienteNumber}"`,

            ` estado="${this.identification.status}"`,

            ` contrato="${this.contractObject.contractType}"`,

            ` procedimiento="${this.procedure.procedureType}"`,

            ` cpv="${this.contractObject.mainCPV}"`,

            ` exportable=${this.isExportable()}`,

            "}"

        ].join("");

    }

}

/**
 * =============================================================================
 * FACTORÍA DEL CONTEXTO
 * =============================================================================
 */

export class ContractContextFactory {

    /**
     * Crea un contexto completamente inicializado.
     */

    public static create(): ContractContextModel {

        return new ContractContextModel();

    }

    /**
     * Crea un contexto a partir de un JSON.
     */

    public static fromJSON(

        json: string

    ): ContractContextModel {

        return ContractContextModel.fromJSON(json);

    }

    /**
     * Crea un contexto desde un objeto persistido.
     */

    public static fromObject(

        object: Partial<ContractContext>

    ): ContractContextModel {

        const context = new ContractContextModel();

        context.loadFromPersistence(object);

        return context;

    }

}

/**
 * =============================================================================
 * FIN DEL ARCHIVO
 * =============================================================================
 *
 * Este archivo constituye el modelo maestro del expediente.
 *
 * Todos los módulos del sistema deberán utilizar exclusivamente
 * ContractContext para intercambiar información.
 *
 * Módulos consumidores:
 *
 *  • ContractGenerator
 *  • ContractPipeline
 *  • ContractBuilder
 *  • Workflow
 *  • ValidationEngine
 *  • LegalReasoner
 *  • RuleEngine
 *  • InferenceEngine
 *  • DocumentGenerator
 *  • PPTGenerator
 *  • PCAPGenerator
 *  • MemoriaGenerator
 *  • InformeGenerator
 *  • ResolucionGenerator
 *  • Exportadores
 *  • IA
 *
 * =============================================================================
 */

