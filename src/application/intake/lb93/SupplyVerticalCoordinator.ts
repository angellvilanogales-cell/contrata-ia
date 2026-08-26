import type { EvidenceField } from "../../../domain/expediente/EvidenceField";
import type { UniversalEvidenceRecord } from "../lb52/UniversalEvidenceWorkspace";
import { UNIVERSAL_V1_UI_FIELD_MANIFEST } from "../lb51/UniversalV1UiFieldManifest";
import { SUPPLY_VERTICAL_FIELD_MANIFEST } from "./SupplyVerticalFieldManifest";
import { TipoProcedimiento } from "../../../domain/procedimiento/TipoProcedimiento";
import type { FinancingProfile, TechnicalDocumentFamily } from "../../../domain/documentModel/DocumentarySourceEvidenceCatalogue";
import type { SupplySourceVariant } from "../../../domain/documentModel/UniversalSupplySourceCorpus";
import { DocumentType } from "../../../domain/documentModel/DocumentType";
import { selectUniversalDocumentSource } from "../../../domain/documentModel/UniversalDocumentSourceSelector";
import { evaluateUniversalSupplyVariant } from "../../universal/UniversalSupplyVariantGate";

export type SupplyVerticalSectionStatus = "COMPLETE" | "PENDING" | "BLOCKED" | "CONFLICT";

export interface SupplyVerticalSectionResult {
  id: string;
  label: string;
  status: SupplyVerticalSectionStatus;
  completed: number;
  total: number;
  blockers: readonly string[];
}

export interface SupplyVerticalDocumentRow {
  documentType: DocumentType;
  decision: "RENDER_ALLOWED" | "BLOCKED";
  sourceId?: string;
  blockers: readonly string[];
}

export interface SupplyVerticalAssessment {
  caseId: string;
  isSupply: boolean;
  progressPct: number;
  workflowReadyForHumanReview: boolean;
  workflowHumanValidated: boolean;
  physicalPackageReady: boolean;
  sections: readonly SupplyVerticalSectionResult[];
  documents: readonly SupplyVerticalDocumentRow[];
  blockers: readonly string[];
  warnings: readonly string[];
  legalReferences: readonly string[];
  humanAcceptanceRequired: true;
  productionReady: false;
}

const SECTION_LABELS: Readonly<Record<string, string>> = {
  NEED_OBJECT: "Necesidad y objeto",
  PROCEDURE: "Procedimiento",
  ECONOMICS: "Economía",
  TECHNICAL: "Prescripciones técnicas",
  SOLVENCY: "Solvencia",
  EXECUTION: "Ejecución",
  LOTS: "Lotes",
  CRITERIA: "Criterios",
};

const CORE_PATHS_BY_SECTION: Readonly<Record<string, readonly string[]>> = {
  NEED_OBJECT: ["object", "contractType", "cpvMain", "need"],
  PROCEDURE: ["procedure", "administrative.contractingAuthority"],
  ECONOMICS: ["baseTenderBudgetCents", "economic.legalEstimatedValueCents", "economic.fundingSource", "durationMonths"],
  TECHNICAL: ["technical.supplyVariant", "technical.technicalRequirements", "technical.executionLocations"],
  SOLVENCY: ["criteria.economicSolvency", "criteria.technicalSolvency"],
  EXECUTION: ["execution.specialExecutionConditions", "execution.receiptAndAcceptanceRegime"],
  LOTS: ["lots.divisionIntoLots", "lots.noDivisionJustification"],
  CRITERIA: ["criteria.awardCriteria"],
};

function field(record: UniversalEvidenceRecord, path: string): EvidenceField<unknown> | undefined {
  return record.fields[path];
}

function value<T>(record: UniversalEvidenceRecord, path: string): T | undefined {
  return field(record, path)?.value as T | undefined;
}

function isUsable(f: EvidenceField<unknown> | undefined): boolean {
  return Boolean(f && f.status !== "PENDING" && f.status !== "SOURCE_CONFLICT" && f.status !== "SYSTEM_PROPOSAL");
}

function isValidated(f: EvidenceField<unknown> | undefined): boolean {
  return Boolean(f && (f.status === "HUMAN_VALIDATED" || f.status === "NOT_APPLICABLE") && (f.humanValidated || f.status === "NOT_APPLICABLE"));
}

function buildSections(record: UniversalEvidenceRecord): SupplyVerticalSectionResult[] {
  return Object.entries(CORE_PATHS_BY_SECTION).map(([id, paths]) => {
    const blockers: string[] = [];
    let completed = 0;
    let conflict = false;
    for (const path of paths) {
      const f = field(record, path);
      if (f?.status === "SOURCE_CONFLICT") {
        conflict = true;
        blockers.push(`${path}: conflicto de fuentes; no se resuelve automáticamente.`);
      } else if (isUsable(f)) completed += 1;
      else blockers.push(`Falta completar ${path}.`);
    }
    const status: SupplyVerticalSectionStatus = conflict ? "CONFLICT" : blockers.length ? "PENDING" : "COMPLETE";
    return { id, label: SECTION_LABELS[id] ?? id, status, completed, total: paths.length, blockers };
  });
}

function procedureBlockers(record: UniversalEvidenceRecord): string[] {
  const blockers: string[] = [];
  const procedure = value<string>(record, "procedure");
  const estimatedValue = value<number>(record, "economic.legalEstimatedValueCents");
  if (!procedure) return blockers;
  if (!Object.values(TipoProcedimiento).includes(procedure as TipoProcedimiento)) {
    blockers.push(`Procedimiento no reconocido: ${procedure}.`);
    return blockers;
  }
  if (typeof estimatedValue === "number") {
    if (procedure === TipoProcedimiento.CONTRATO_MENOR && estimatedValue >= 1_500_000) {
      blockers.push("El contrato menor de suministro exige valor estimado inferior a 15.000 € (art. 118 LCSP)." );
    }
    if (procedure === TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO && estimatedValue >= 6_000_000) {
      blockers.push("El abierto simplificado abreviado de suministros exige valor estimado inferior a 60.000 € (art. 159.6 LCSP)." );
    }
  }
  return blockers;
}

function lotsBlockers(record: UniversalEvidenceRecord): string[] {
  const hasLots = value<boolean>(record, "lots.divisionIntoLots");
  const justification = value<string>(record, "lots.noDivisionJustification");
  if (hasLots === false && (!justification || justification.trim().length < 12)) {
    return ["La no división en lotes requiere motivación suficiente conforme al art. 99.3 LCSP."];
  }
  return [];
}

function supplyVariantAssessment(record: UniversalEvidenceRecord) {
  return evaluateUniversalSupplyVariant({
    declaredVariant: value<SupplySourceVariant>(record, "technical.supplyVariant"),
    hasSuccessiveOrders: value<boolean>(record, "technical.hasSuccessiveOrders"),
    hasServicePlatformComponent: value<boolean>(record, "technical.hasServicePlatformComponent"),
    hasInstallationOrAssembly: value<boolean>(record, "technical.hasInstallationOrAssembly"),
    isFrameworkAgreement: value<boolean>(record, "administrative.isFrameworkAgreement"),
    euFunds: value<boolean>(record, "regulation.europeanFunding"),
  });
}

function technicalFamilyFor(documentType: DocumentType, variant?: SupplySourceVariant): TechnicalDocumentFamily {
  if (documentType === DocumentType.PCAP) return "GENERAL_ADMINISTRATIVE";
  if (variant === "CATALOGUE_NEEDS") return "CATALOGUE_NEEDS_SUPPLY";
  return "OTHER";
}

function documentRows(record: UniversalEvidenceRecord): SupplyVerticalDocumentRow[] {
  const procedure = value<TipoProcedimiento>(record, "procedure");
  const financing = value<FinancingProfile>(record, "economic.fundingSource");
  const variant = value<SupplySourceVariant>(record, "technical.supplyVariant");
  const required = [DocumentType.MEMORY, DocumentType.PCAP, DocumentType.PPT] as const;
  if (!procedure || !financing || !variant || financing === "UNKNOWN") {
    const reason = !procedure ? "Debe validarse el procedimiento." : !variant ? "Debe declararse la subfamilia técnica." : "La financiación UNKNOWN no permite seleccionar una plantilla física específica.";
    return required.map(documentType => ({ documentType, decision: "BLOCKED", blockers: [reason] }));
  }
  return required.map(documentType => {
    const selection = selectUniversalDocumentSource({
      contractType: "SUPPLY",
      documentType,
      procedure,
      financing,
      technicalFamily: technicalFamilyFor(documentType, variant),
    });
    const allowed = selection.status === "GENERAL_EDITABLE_SELECTED";
    return {
      documentType,
      decision: allowed ? "RENDER_ALLOWED" as const : "BLOCKED" as const,
      sourceId: selection.selected?.id,
      blockers: allowed ? [] : selection.blockers,
    };
  });
}

export function evaluateSupplyVertical(record: UniversalEvidenceRecord): SupplyVerticalAssessment {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const sections = buildSections(record);
  const contractType = value<string>(record, "contractType");
  const isSupply = contractType === "SUPPLY";
  if (!isSupply) blockers.push(contractType ? `El expediente está clasificado como ${contractType}; este vertical solo admite SUPPLY.` : "Debe declarar y validar el tipo contractual SUPPLY.");

  for (const f of Object.values(record.fields)) {
    if (f.status === "SOURCE_CONFLICT") blockers.push(`${f.key}: existe un conflicto de fuentes pendiente de decisión humana.`);
  }
  blockers.push(...procedureBlockers(record));
  blockers.push(...lotsBlockers(record));

  const variant = supplyVariantAssessment(record);
  blockers.push(...variant.blockers);
  warnings.push(...variant.warnings);

  const requiredPaths = [...new Set(Object.values(CORE_PATHS_BY_SECTION).flat())];
  const usable = requiredPaths.filter(path => isUsable(field(record, path))).length;
  const validated = requiredPaths.filter(path => isValidated(field(record, path))).length;
  const progressPct = Math.round((usable / requiredPaths.length) * 100);
  const workflowReadyForHumanReview = isSupply && blockers.length === 0 && usable === requiredPaths.length;
  const workflowHumanValidated = workflowReadyForHumanReview && validated === requiredPaths.length;

  const documents = documentRows(record);
  const physicalPackageReady = documents.every(row => row.decision === "RENDER_ALLOWED");
  if (!physicalPackageReady) warnings.push("El expediente puede estar jurídicamente preparado para revisión aunque el paquete físico universal siga bloqueado por falta de plantillas generales editables acreditadas.");

  return {
    caseId: record.caseId,
    isSupply,
    progressPct,
    workflowReadyForHumanReview,
    workflowHumanValidated,
    physicalPackageReady,
    sections,
    documents,
    blockers,
    warnings,
    legalReferences: [
      "LCSP arts. 28 y 99: necesidad, objeto y lotes.",
      "LCSP arts. 100-102: presupuesto, valor estimado y precio.",
      "LCSP arts. 118, 131 y 159: procedimiento de adjudicación.",
      "LCSP arts. 74 y 86-92: solvencia vinculada y proporcional.",
      "LCSP arts. 145-146: criterios de adjudicación.",
      "LCSP arts. 192-202: ejecución y condiciones especiales.",
      "LCSP arts. 203-207: modificaciones.",
    ],
    humanAcceptanceRequired: true,
    productionReady: false,
  };
}

export function getSupplyVerticalEditableManifest() {
  const universalPaths = new Set(UNIVERSAL_V1_UI_FIELD_MANIFEST.map(item => item.fieldPath));
  return [
    ...UNIVERSAL_V1_UI_FIELD_MANIFEST,
    ...SUPPLY_VERTICAL_FIELD_MANIFEST.filter(item => !universalPaths.has(item.fieldPath)),
  ];
}
