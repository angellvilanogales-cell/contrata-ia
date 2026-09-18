import { createHash } from "node:crypto";
import type { EvidenceField } from "../../domain/expediente/EvidenceField";
import type { SupplyUserDocumentPackage } from "../intake/lb95/SupplyUserDocumentPackageGenerator";
import type { LB103ServerValidatedPreflight } from "./LB103ServerValidatedPreflight";

export const LB120_CONSENT_FIELD = "closure.finalConsentRecord";

const PRIOR_DECISION_ANCHORS = [
  ["D01", "object", "contractType", "cpvMain"], ["D02", "lots.divisionIntoLots"], ["D03", "need"],
  ["D04", "technical.executionLocations"], ["D05", "economic.priceDeterminationRegime"], ["D06", "economic.legalEstimatedValueCents"],
  ["D07", "economic.fundingSource"], ["D08", "durationMonths"], ["D09", "procedure", "processing.processingType"],
  ["D10", "criteria.economicSolvency", "criteria.technicalSolvency"], ["D11", "criteria.awardCriteria"],
  ["D12", "guarantees.definitiveGuaranteeRegime"], ["D13", "execution.specialExecutionConditions"],
  ["D14", "execution.subcontractingRegime", "execution.assignmentRegime"], ["D15", "execution.plannedModificationRegime"],
  ["D16", "economic.priceRevisionRegime"], ["D17", "administrative.contractManager", "execution.receiptAndAcceptanceRegime", "execution.paymentRegime"],
  ["D18", "technical.technicalPurpose", "technical.technicalRequirements"], ["D19", "dataProtection.processingScenario", "security.informationSecurityRegime"],
] as const;

export function auditLB120PriorDecisionEvidence(evidence: Readonly<Record<string, EvidenceField<unknown>>>): readonly string[] {
  const blockers: string[]=[];
  for(const [decisionId,...paths] of PRIOR_DECISION_ANCHORS){
    for(const path of paths){const field=evidence[path];if(!field||field.status!=="HUMAN_VALIDATED"||!field.humanValidated||!field.humanValidation?.by||!field.humanValidation.at)blockers.push(`${decisionId}: falta validación humana de ${path}.`);}
  }
  return blockers;
}

export interface LB120DocumentPreview {
  readonly schemaVersion: "LB120-PREVIEW-1";
  readonly caseId: string;
  readonly snapshotSha256: string;
  readonly documentarySelectionSha256: string;
  readonly packageSha256: string;
  readonly documents: readonly { kind: "PCAP" | "MEMORIA" | "PPT"; fileName: string; sha256: string; provenance: string }[];
  readonly crossDocumentAuditReady: true;
  readonly blockers: readonly string[];
  readonly humanConsentRequired: true;
  readonly productionReady: false;
}

export interface LB120ConsentInput {
  readonly snapshotSha256: string;
  readonly documentarySelectionSha256: string;
  readonly packageSha256: string;
  readonly factsAndDecisionsConfirmed: boolean;
  readonly legalGroundsConfirmed: boolean;
  readonly crossDocumentConsistencyConfirmed: boolean;
  readonly officialPcapIntegrityConfirmed: boolean;
  readonly memoryAndPptStructureConfirmed: boolean;
  readonly noCriticalBlockersConfirmed: boolean;
  readonly finalStatement: string;
}

export interface LB120FinalConsentRecord extends LB120ConsentInput {
  readonly schemaVersion: "LB120-FINAL-CONSENT-1";
  readonly caseId: string;
  readonly documentSha256: Readonly<Record<"PCAP" | "MEMORIA" | "PPT", string>>;
  readonly reviewerId: string;
  readonly consentedAt: string;
  readonly consentSha256: string;
  readonly humanValidated: true;
  readonly productionReady: false;
}

function stable(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map(key => `${JSON.stringify(key)}:${stable(record[key])}`).join(",")}}`;
}

function sha256(value: unknown): string {
  return createHash("sha256").update(stable(value)).digest("hex");
}

function requireReadyPackage(pkg: SupplyUserDocumentPackage): asserts pkg is SupplyUserDocumentPackage & { sha256: string; manifest: NonNullable<SupplyUserDocumentPackage["manifest"]> } {
  if (!pkg.ready || !pkg.sha256 || !pkg.manifest || !pkg.manifest.crossDocumentAuditReady) {
    throw new Error("No existe un paquete completo y coherente sobre el que prestar consentimiento.");
  }
  const kinds = new Set(pkg.manifest.documents.map(document => document.kind));
  if (!["PCAP", "MEMORIA", "PPT"].every(kind => kinds.has(kind as "PCAP" | "MEMORIA" | "PPT"))) {
    throw new Error("El paquete no contiene la terna PCAP, Memoria y PPT.");
  }
  const pcap = pkg.manifest.documents.find(document => document.kind === "PCAP");
  if (!pcap?.provenance.startsWith("OFFICIAL_MODEL:")) {
    throw new Error("El PCAP no acredita procedencia de modelo oficial y no puede someterse a consentimiento.");
  }
}

export function createLB120DocumentPreview(preflight: LB103ServerValidatedPreflight, pkg: SupplyUserDocumentPackage): LB120DocumentPreview {
  if (!preflight.generationReady || !preflight.snapshot || !preflight.documentarySelection) {
    throw new Error("El expediente no está preparado para la conclusión documental.");
  }
  requireReadyPackage(pkg);
  return {
    schemaVersion: "LB120-PREVIEW-1",
    caseId: preflight.snapshot.caseId,
    snapshotSha256: preflight.snapshot.sha256,
    documentarySelectionSha256: preflight.documentarySelection.sha256,
    packageSha256: pkg.sha256,
    documents: pkg.manifest.documents.map(document => ({ ...document })),
    crossDocumentAuditReady: true,
    blockers: [],
    humanConsentRequired: true,
    productionReady: false,
  };
}

export function createLB120FinalConsent(preview: LB120DocumentPreview, input: LB120ConsentInput, reviewerId: string, consentedAt = new Date().toISOString()): LB120FinalConsentRecord {
  if (!reviewerId.trim()) throw new Error("El consentimiento final exige identidad nominativa.");
  if (input.snapshotSha256 !== preview.snapshotSha256 || input.documentarySelectionSha256 !== preview.documentarySelectionSha256 || input.packageSha256 !== preview.packageSha256) {
    throw new Error("Las huellas consentidas no coinciden con la vista previa reconstruida por el servidor.");
  }
  const confirmations = [input.factsAndDecisionsConfirmed, input.legalGroundsConfirmed, input.crossDocumentConsistencyConfirmed, input.officialPcapIntegrityConfirmed, input.memoryAndPptStructureConfirmed, input.noCriticalBlockersConfirmed];
  if (!confirmations.every(Boolean)) throw new Error("Deben confirmarse expresamente todos los extremos de coherencia y control documental.");
  const finalStatement = input.finalStatement.trim();
  if (finalStatement.length < 20) throw new Error("La conclusión final debe contener una motivación expresa de al menos 20 caracteres.");
  const documentSha256 = Object.fromEntries(preview.documents.map(document => [document.kind, document.sha256])) as Record<"PCAP" | "MEMORIA" | "PPT", string>;
  const payload = { ...input, finalStatement, schemaVersion: "LB120-FINAL-CONSENT-1" as const, caseId: preview.caseId, documentSha256, reviewerId: reviewerId.trim(), consentedAt, humanValidated: true as const, productionReady: false as const };
  return { ...payload, consentSha256: sha256(payload) };
}

export function validateLB120FinalConsent(field: EvidenceField<unknown> | undefined, preview: LB120DocumentPreview): readonly string[] {
  const blockers: string[] = [];
  if (!field || field.key !== LB120_CONSENT_FIELD || field.status !== "HUMAN_VALIDATED" || !field.humanValidated || !field.humanValidation) {
    return ["Falta el consentimiento final D20 validado humanamente."];
  }
  const record = field.value as LB120FinalConsentRecord | null;
  if (!record || record.schemaVersion !== "LB120-FINAL-CONSENT-1") return ["El registro de consentimiento D20 no tiene el esquema esperado."];
  const { consentSha256, ...payload } = record;
  if (sha256(payload) !== consentSha256) blockers.push("La huella interna del consentimiento D20 no es válida.");
  if (field.humanValidation.by !== record.reviewerId) blockers.push("El actor que validó la evidencia no coincide con quien prestó el consentimiento.");
  if (record.caseId !== preview.caseId || record.snapshotSha256 !== preview.snapshotSha256 || record.documentarySelectionSha256 !== preview.documentarySelectionSha256 || record.packageSha256 !== preview.packageSha256) blockers.push("El consentimiento D20 pertenece a otra versión del expediente o del paquete.");
  for (const document of preview.documents) if (record.documentSha256[document.kind] !== document.sha256) blockers.push(`La huella consentida de ${document.kind} ya no coincide.`);
  if (![record.factsAndDecisionsConfirmed, record.legalGroundsConfirmed, record.crossDocumentConsistencyConfirmed, record.officialPcapIntegrityConfirmed, record.memoryAndPptStructureConfirmed, record.noCriticalBlockersConfirmed].every(Boolean)) blockers.push("El consentimiento D20 no confirma todos los controles obligatorios.");
  return blockers;
}
