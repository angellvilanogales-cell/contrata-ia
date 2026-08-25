import { UniversalExpedienteV13, UniversalDomainName, evaluateUniversalExpediente } from "../domain/expediente/UniversalExpedienteV13";
import {
  ContractDocumentModelProfile,
  ContractDocumentModelProfileRegistry,
  DocumentModelCoverage,
} from "../domain/documentModel/ContractDocumentModelProfile";
import { DocumentDefinition } from "../domain/documentModel/DocumentDefinition";
import { DocumentType } from "../domain/documentModel/DocumentType";
import { CanonicalDocumentProfileSelection, selectCanonicalDocumentProfile } from "./CanonicalDocumentProfileSelector";

export interface UniversalDocumentGenerationGateResult {
  ready: boolean;
  profile?: ContractDocumentModelProfile;
  definition?: DocumentDefinition;
  selection: CanonicalDocumentProfileSelection;
  requiredDomains: readonly UniversalDomainName[];
  blockers: readonly string[];
}

const DOCUMENT_DOMAIN_REQUIREMENTS: Partial<Record<DocumentType, readonly UniversalDomainName[]>> = {
  [DocumentType.PCAP]: [
    "processing",
    "regulation",
    "economic",
    "administrative",
    "lots",
    "guarantees",
    "execution",
    "criteria",
  ],
  [DocumentType.PPT]: ["administrative", "technical", "lots"],
  [DocumentType.MEMORY]: ["processing", "economic", "administrative", "lots", "criteria"],
  [DocumentType.ECONOMIC_REPORT]: ["economic", "administrative", "lots"],
  [DocumentType.TECHNICAL_REPORT]: ["administrative", "technical", "lots"],
};

export function requiredUniversalDomainsForDocument(documentType: DocumentType): readonly UniversalDomainName[] {
  return DOCUMENT_DOMAIN_REQUIREMENTS[documentType] ?? [];
}

export function evaluateUniversalDocumentGeneration(
  expediente: UniversalExpedienteV13,
  documentType: DocumentType,
  registry: ContractDocumentModelProfileRegistry,
  requiredCoverage: DocumentModelCoverage = "FULL_MODEL",
): UniversalDocumentGenerationGateResult {
  const blockers: string[] = [];
  const evaluation = evaluateUniversalExpediente(expediente);
  const requiredDomains = requiredUniversalDomainsForDocument(documentType);

  if (!evaluation.canonicalPromotable) blockers.push(...expediente.canonical.blockers);

  for (const domain of requiredDomains) {
    if (!evaluation.domainCompleteness[domain]) {
      blockers.push(`Dominio universal requerido no completo para ${documentType}: ${domain}`);
    }
  }

  const selection = selectCanonicalDocumentProfile(
    expediente.canonical,
    documentType,
    registry,
    requiredCoverage,
  );

  if (selection.status !== "SELECTED") blockers.push(...selection.blockers);
  if (requiredCoverage === "FULL_MODEL" && !selection.canGenerateFullDocument) {
    blockers.push(`La generación completa de ${documentType} no está habilitada para el perfil seleccionado.`);
  }

  const ready = blockers.length === 0 && Boolean(selection.profile);
  return {
    ready,
    profile: ready ? selection.profile : undefined,
    definition: ready ? selection.profile?.definition : undefined,
    selection,
    requiredDomains,
    blockers,
  };
}
