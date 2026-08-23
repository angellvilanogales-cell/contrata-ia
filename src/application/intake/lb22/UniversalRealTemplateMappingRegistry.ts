import { CanonicalContractType } from "../../../domain/expediente/CanonicalExpedienteState";
import { UniversalAdministrativeDocumentKind } from "../lb17/UniversalOfficialTemplateCatalog";
import { UniversalDocumentMappingSpec, UniversalDocumentSlotMapping } from "../lb17/UniversalDocumentMappingPackage";

export type RealTemplateSourceQualification =
  | "OFFICIAL_EDITABLE_ORIGINAL"
  | "OFFICIAL_REFERENCE_PDF"
  | "DERIVED_EDITABLE_COPY"
  | "COMPLETED_CASE_EDITABLE"
  | "REFERENCE_EXAMPLE";

export interface RealTemplateSourceEvidence {
  sourceId: string;
  locator: string;
  fileName: string;
  mediaType: string;
  qualification: RealTemplateSourceQualification;
  officialModelStatement?: string;
  humanValidated: boolean;
  validatedBy?: string;
  note?: string;
}

export interface RealTemplateMappingSlot extends UniversalDocumentSlotMapping {
  /** Apartado verificable del modelo fuente, no una posición inventada. */
  sourceSection: string;
  sourceLabel: string;
}

export interface RealTemplateMappingProfile {
  profileId: string;
  contractType: CanonicalContractType;
  documentKind: UniversalAdministrativeDocumentKind;
  templateFamilyId: string;
  /** Solo existe cuando el activo editable original ha sido identificado inequívocamente. */
  templateId?: string;
  sourceId: string;
  slots: readonly RealTemplateMappingSlot[];
  evidenceLocators: readonly string[];
}

export interface RealTemplateMappingQualificationResult {
  structurallyVerified: boolean;
  productionEligible: boolean;
  mappingSpec: UniversalDocumentMappingSpec | null;
  blockers: readonly string[];
  warnings: readonly string[];
}

const KNOWN_UNIVERSAL_FIELDS = new Set([
  "object", "cpvMain", "lots", "estimatedValueCents", "baseTenderBudgetCents", "procedure",
  "durationMonths", "extensionMonths", "modificationPercent", "awardCriteria", "solvency", "publicity",
  "processing.processingType", "processing.urgency", "processing.emergency",
  "regulation.harmonizedRegulation", "regulation.europeanFunding", "regulation.threshold", "regulation.deadlines",
  "economic.vatPercent", "economic.budgetApplication", "economic.annualities", "economic.fundingSource",
  "economic.priceRevisionRegime", "economic.unitPrices", "economic.referenceConsumption", "economic.projectedConsumption",
  "economic.maximumApprovedBudgetCents", "economic.initialEstimatedValueBaseCents", "economic.extensionAmountExVatCents",
  "economic.modificationAmountExVatCents", "economic.optionsAmountExVatCents", "economic.otherEstimatedValueComponentsCents",
  "economic.legalEstimatedValueCents", "economic.initialVatAmountCents", "economic.initialPblVatIncludedCents",
  "economic.needsBasedContractDa33", "economic.budgetCoversEntireContractLife",
  "economic.estimatedValueCalculationMethod", "economic.priceDeterminationRegime",
  "administrative.contractingAuthority", "administrative.promotingUnit",
  "administrative.competentBody", "administrative.administrativeFileNumber", "administrative.contractManager",
  "administrative.reservedContractDa4", "technical.technicalPurpose", "technical.technicalRequirements", "technical.executionLocations",
  "technical.subrogationRequired", "technical.subrogationRegime", "lots.divisionIntoLots", "lots.lots",
  "lots.maxOfferableLots", "lots.maxAwardableLots", "lots.noDivisionJustification", "guarantees.provisionalGuaranteeRequired",
  "guarantees.provisionalGuaranteePercent", "guarantees.definitiveGuaranteePercent",
  "guarantees.complementaryGuaranteePercent", "execution.specialExecutionConditions", "execution.specificPenalties",
  "execution.subcontractingRegime", "execution.assignmentRegime", "execution.paymentRegime",
  "execution.receiptAndAcceptanceRegime", "execution.extensionStructure", "execution.extensionNoticeMonths",
  "execution.plannedModificationRegime", "criteria.awardCriteria", "criteria.economicSolvency",
  "criteria.technicalSolvency", "criteria.judgmentCriteriaExist", "criteria.singleCriterionMotivation",
]);

function validateSource(source: RealTemplateSourceEvidence): string[] {
  const blockers: string[] = [];
  if (!source.sourceId.trim()) blockers.push("sourceId vacío.");
  if (!source.locator.trim()) blockers.push(`La fuente ${source.sourceId} carece de localizador.`);
  if (!source.fileName.trim()) blockers.push(`La fuente ${source.sourceId} carece de nombre de archivo.`);
  if (source.humanValidated && !source.validatedBy?.trim()) blockers.push(`La fuente ${source.sourceId} figura validada sin identidad de validador.`);
  if (source.qualification === "OFFICIAL_EDITABLE_ORIGINAL" && !source.humanValidated) {
    blockers.push(`El original editable ${source.sourceId} requiere validación humana de procedencia antes de producción.`);
  }
  return blockers;
}

/**
 * LB22.1-LB22.4: cualifica una estructura real sin confundir referencia oficial,
 * copia derivada, ejemplo cumplimentado y activo original editable. Un PDF puede
 * acreditar estructura, pero nunca habilita por sí solo el renderizado editable.
 */
export function qualifyRealTemplateMapping(
  profile: RealTemplateMappingProfile,
  sources: readonly RealTemplateSourceEvidence[],
): RealTemplateMappingQualificationResult {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const sourceIds = new Set<string>();
  for (const source of sources) {
    blockers.push(...validateSource(source));
    if (sourceIds.has(source.sourceId)) blockers.push(`sourceId duplicado: ${source.sourceId}.`);
    sourceIds.add(source.sourceId);
  }

  const primary = sources.find(source => source.sourceId === profile.sourceId);
  if (!primary) blockers.push(`El perfil ${profile.profileId} referencia una fuente inexistente: ${profile.sourceId}.`);
  if (!profile.profileId.trim()) blockers.push("profileId vacío.");
  if (!profile.templateFamilyId.trim()) blockers.push(`El perfil ${profile.profileId} carece de familia documental.`);
  if (profile.evidenceLocators.length === 0) blockers.push(`El perfil ${profile.profileId} no conserva localizadores de evidencia estructural.`);

  const slotIds = new Set<string>();
  for (const slot of profile.slots) {
    if (!slot.slotId.trim()) blockers.push(`Slot vacío en ${profile.profileId}.`);
    if (slotIds.has(slot.slotId)) blockers.push(`slotId duplicado en ${profile.profileId}: ${slot.slotId}.`);
    slotIds.add(slot.slotId);
    if (!KNOWN_UNIVERSAL_FIELDS.has(slot.fieldKey)) blockers.push(`Campo universal desconocido en ${slot.slotId}: ${slot.fieldKey}.`);
    if (!slot.sourceSection.trim() || !slot.sourceLabel.trim()) blockers.push(`El slot ${slot.slotId} carece de ubicación verificable en la fuente.`);
  }

  const structurallyVerified = blockers.length === 0 && Boolean(primary);
  let productionEligible = false;
  if (structurallyVerified && primary) {
    if (primary.qualification === "OFFICIAL_REFERENCE_PDF") warnings.push("La fuente acredita estructura oficial, pero es PDF y no constituye activo editable de producción.");
    if (primary.qualification === "DERIVED_EDITABLE_COPY") warnings.push("Una copia editable derivada no puede sustituir al original oficial como fuente maestra.");
    if (primary.qualification === "COMPLETED_CASE_EDITABLE") warnings.push("Un expediente cumplimentado no puede promocionarse a modelo oficial genérico.");
    productionEligible = primary.qualification === "OFFICIAL_EDITABLE_ORIGINAL" && primary.humanValidated && Boolean(profile.templateId?.trim());
    if (!productionEligible) warnings.push("El perfil estructural queda bloqueado para producción hasta identificar y validar el original editable exacto.");
  }

  const mappingSpec = productionEligible && profile.templateId
    ? { documentKind: profile.documentKind, templateId: profile.templateId, slots: profile.slots.map(({ slotId, fieldKey, required }) => ({ slotId, fieldKey, required })) }
    : null;

  return { structurallyVerified, productionEligible, mappingSpec, blockers, warnings };
}

export interface RealTemplateMappingCoverageResult {
  ready: boolean;
  productionProfiles: readonly string[];
  referenceOnlyProfiles: readonly string[];
  blockers: readonly string[];
}

/** LB22.5 - cobertura de mapeos reales por escenario. */
export function evaluateRealTemplateMappingCoverage(
  requirements: readonly { contractType: CanonicalContractType; documentKind: UniversalAdministrativeDocumentKind }[],
  profiles: readonly RealTemplateMappingProfile[],
  sources: readonly RealTemplateSourceEvidence[],
): RealTemplateMappingCoverageResult {
  const blockers: string[] = [];
  const productionProfiles: string[] = [];
  const referenceOnlyProfiles: string[] = [];

  for (const requirement of requirements) {
    const matches = profiles.filter(profile => profile.contractType === requirement.contractType && profile.documentKind === requirement.documentKind);
    if (matches.length === 0) {
      blockers.push(`No existe perfil de mapeo real para ${requirement.contractType}/${requirement.documentKind}.`);
      continue;
    }
    if (matches.length > 1) {
      blockers.push(`Existen ${matches.length} perfiles concurrentes para ${requirement.contractType}/${requirement.documentKind}; debe seleccionarse una versión exacta.`);
      continue;
    }
    const profile = matches[0];
    if (!profile) continue;
    const result = qualifyRealTemplateMapping(profile, sources);
    blockers.push(...result.blockers.map(blocker => `${profile.profileId}: ${blocker}`));
    if (result.productionEligible) productionProfiles.push(profile.profileId);
    else {
      referenceOnlyProfiles.push(profile.profileId);
      blockers.push(`${profile.profileId}: estructura verificada, pero falta original editable oficial validado para producción.`);
    }
  }

  return { ready: blockers.length === 0, productionProfiles, referenceOnlyProfiles, blockers };
}
