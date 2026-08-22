import { CanonicalContractType } from "../../../domain/expediente/CanonicalExpedienteState";
import { UniversalAdministrativeDocumentKind } from "../lb17/UniversalOfficialTemplateCatalog";
import {
  qualifyRealTemplateMapping,
  RealTemplateMappingProfile,
  RealTemplateSourceEvidence,
} from "./UniversalRealTemplateMappingRegistry";

export interface RealTemplateMappingRequirement {
  contractType: CanonicalContractType;
  documentKind: UniversalAdministrativeDocumentKind;
}

export interface UniversalRealTemplateMappingClosureResult {
  engineeringReady: boolean;
  productionReady: boolean;
  structurallyVerifiedProfiles: readonly string[];
  productionProfiles: readonly string[];
  blockers: readonly string[];
  productionBlockers: readonly string[];
}

/**
 * Cierre LB22. Separa dos afirmaciones que no deben confundirse:
 * 1) la capa de cualificación/mapeo real está implementada y existe estructura
 *    verificada para el alcance declarado;
 * 2) existen los originales editables oficiales necesarios para producción.
 *
 * LB22 puede cerrar como ingeniería con productionReady=false. El segundo estado
 * solo cambia cuando el custodio incorpora y valida el original editable exacto.
 */
export function evaluateUniversalRealTemplateMappingClosure(
  requirements: readonly RealTemplateMappingRequirement[],
  profiles: readonly RealTemplateMappingProfile[],
  sources: readonly RealTemplateSourceEvidence[],
): UniversalRealTemplateMappingClosureResult {
  const blockers: string[] = [];
  const productionBlockers: string[] = [];
  const structurallyVerifiedProfiles: string[] = [];
  const productionProfiles: string[] = [];

  for (const requirement of requirements) {
    const matching = profiles.filter(profile =>
      profile.contractType === requirement.contractType && profile.documentKind === requirement.documentKind,
    );
    const label = `${requirement.contractType}/${requirement.documentKind}`;
    if (matching.length !== 1) {
      blockers.push(`${label}: se requiere exactamente un perfil real de mapeo y existen ${matching.length}.`);
      continue;
    }
    const profile = matching[0];
    if (!profile) continue;
    const qualification = qualifyRealTemplateMapping(profile, sources);
    if (!qualification.structurallyVerified) {
      blockers.push(...qualification.blockers.map(blocker => `${profile.profileId}: ${blocker}`));
      continue;
    }
    structurallyVerifiedProfiles.push(profile.profileId);
    if (qualification.productionEligible) productionProfiles.push(profile.profileId);
    else productionBlockers.push(`${profile.profileId}: falta un original editable oficial identificado, validado y enlazado mediante templateId.`);
  }

  const engineeringReady = blockers.length === 0 && structurallyVerifiedProfiles.length === requirements.length;
  return {
    engineeringReady,
    productionReady: engineeringReady && productionBlockers.length === 0 && productionProfiles.length === requirements.length,
    structurallyVerifiedProfiles,
    productionProfiles,
    blockers,
    productionBlockers,
  };
}
