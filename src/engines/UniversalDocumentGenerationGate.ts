import { UniversalExpedienteV13, UniversalDomainName, evaluateUniversalExpediente } from "../domain/expediente/UniversalExpedienteV13";
import {
  ContractDocumentModelProfile,
  ContractDocumentModelProfileRegistry,
  DocumentModelCoverage,
} from "../domain/documentModel/ContractDocumentModelProfile";
import { DocumentDefinition } from "../domain/documentModel/DocumentDefinition";
import { DocumentType } from "../domain/documentModel/DocumentType";
import { CanonicalDocumentProfileSelection, selectCanonicalDocumentProfile } from "./CanonicalDocumentProfileSelector";
import {
  UniversalFamilyPreparationGate,
  UniversalFamilyPreparationInput,
} from "../application/universal/UniversalFamilyPreparationGate";

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

function familyPreparationBlockers(
  expediente: UniversalExpedienteV13,
  familyPreparation?: UniversalFamilyPreparationInput,
): readonly string[] {
  const contractType = expediente.canonical.fields.contractType.value;
  if (contractType !== "WORKS" && contractType !== "CONCESSION" && contractType !== "MIXED") return [];
  if (!familyPreparation) {
    return [`La generación de ${contractType} exige evaluación previa de los hechos específicos de su familia contractual.`];
  }
  if (familyPreparation.contractType !== contractType) {
    return [`El gate familiar recibido corresponde a ${familyPreparation.contractType} y no a ${contractType}.`];
  }
  const result = new UniversalFamilyPreparationGate().evaluate(familyPreparation);
  return result.ready ? [] : result.blockers;
}

/**
 * Gate universal de generación. Para obras, concesiones y mixtos exige además
 * la preparación específica de familia: un expediente universal completo no
 * puede ocultar la ausencia de proyecto/replanteo, riesgo operacional/viabilidad
 * o determinación de la prestación principal.
 */
export function evaluateUniversalDocumentGeneration(
  expediente: UniversalExpedienteV13,
  documentType: DocumentType,
  registry: ContractDocumentModelProfileRegistry,
  requiredCoverage: DocumentModelCoverage = "FULL_MODEL",
  familyPreparation?: UniversalFamilyPreparationInput,
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

  blockers.push(...familyPreparationBlockers(expediente, familyPreparation));

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
