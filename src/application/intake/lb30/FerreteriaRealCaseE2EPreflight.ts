import {
  evaluateFerreteriaRealCaseAcceptance,
  FERRETERIA_REAL_CASE_EXPECTED,
} from "../lb25/FerreteriaRealCaseAcceptanceProfile";
import { JDA_SUPPLY_ASA_VERIFIED_MANIFEST } from "../lb25/JuntaSupplyAsaOfficialActivation";
import {
  JDA_SUPPLY_ASA_EXPANDED_EDITABLE_ASSET,
  JDA_SUPPLY_ASA_LB28_REMAINING_PHYSICAL_BLOCKERS,
} from "../lb28/JuntaSupplyAsaExpandedPhysicalProfile";
import { JDA_SUPPLY_ASA_PRODUCTION_REGISTRY_RECORD } from "../lb29/UniversalSupplyAsaProtectedPipeline";

export type FerreteriaE2EPreflightStage =
  | "CASE_PARITY_FAILED"
  | "OFFICIAL_TEMPLATE_IDENTITY_FAILED"
  | "PHYSICAL_COVERAGE_INCOMPLETE"
  | "NEEDS_RUNTIME_TEMPLATE_BYTES"
  | "READY_FOR_REAL_RENDER";

export interface FerreteriaE2EPreflightResult {
  readyForRealRender: boolean;
  stage: FerreteriaE2EPreflightStage;
  caseId: string;
  templateId: string;
  contentHash: string;
  styleFingerprint: string;
  blockers: readonly string[];
  warnings: readonly string[];
}

/**
 * LB30 - preflight E2E del primer expediente real.
 *
 * Consolida únicamente evidencias ya certificadas en bloques anteriores. No
 * genera un documento ni simula una aceptación humana. El paso READY solo puede
 * alcanzarse cuando la cobertura física declarada por LB28 sea completa y el
 * runtime confirme que dispone de los bytes exactos del modelo oficial.
 */
export function evaluateFerreteriaRealCaseE2EPreflight(runtimeTemplateBytesAvailable: boolean): FerreteriaE2EPreflightResult {
  const parity = evaluateFerreteriaRealCaseAcceptance(FERRETERIA_REAL_CASE_EXPECTED);
  if (!parity.ready) {
    return {
      readyForRealRender: false,
      stage: "CASE_PARITY_FAILED",
      caseId: FERRETERIA_REAL_CASE_EXPECTED.caseId,
      templateId: JDA_SUPPLY_ASA_EXPANDED_EDITABLE_ASSET.templateId,
      contentHash: JDA_SUPPLY_ASA_VERIFIED_MANIFEST.contentHash,
      styleFingerprint: JDA_SUPPLY_ASA_VERIFIED_MANIFEST.styleFingerprint,
      blockers: parity.blockers,
      warnings: parity.warnings,
    };
  }

  const identityBlockers: string[] = [];
  if (JDA_SUPPLY_ASA_PRODUCTION_REGISTRY_RECORD.templateId !== JDA_SUPPLY_ASA_EXPANDED_EDITABLE_ASSET.templateId) identityBlockers.push("El registro productivo no coincide con el activo ODT expandido.");
  if (JDA_SUPPLY_ASA_PRODUCTION_REGISTRY_RECORD.contentHash !== JDA_SUPPLY_ASA_VERIFIED_MANIFEST.contentHash) identityBlockers.push("El hash del registro productivo no coincide con el original oficial verificado.");
  if (JDA_SUPPLY_ASA_PRODUCTION_REGISTRY_RECORD.styleFingerprint !== JDA_SUPPLY_ASA_VERIFIED_MANIFEST.styleFingerprint) identityBlockers.push("La huella de estilo del registro productivo no coincide con el original oficial verificado.");
  if (JDA_SUPPLY_ASA_PRODUCTION_REGISTRY_RECORD.status !== "HUMAN_VALIDATED") identityBlockers.push("El modelo oficial no está validado humanamente en el registro.");
  if (identityBlockers.length) {
    return {
      readyForRealRender: false,
      stage: "OFFICIAL_TEMPLATE_IDENTITY_FAILED",
      caseId: FERRETERIA_REAL_CASE_EXPECTED.caseId,
      templateId: JDA_SUPPLY_ASA_EXPANDED_EDITABLE_ASSET.templateId,
      contentHash: JDA_SUPPLY_ASA_VERIFIED_MANIFEST.contentHash,
      styleFingerprint: JDA_SUPPLY_ASA_VERIFIED_MANIFEST.styleFingerprint,
      blockers: identityBlockers,
      warnings: parity.warnings,
    };
  }

  if (JDA_SUPPLY_ASA_LB28_REMAINING_PHYSICAL_BLOCKERS.length) {
    return {
      readyForRealRender: false,
      stage: "PHYSICAL_COVERAGE_INCOMPLETE",
      caseId: FERRETERIA_REAL_CASE_EXPECTED.caseId,
      templateId: JDA_SUPPLY_ASA_EXPANDED_EDITABLE_ASSET.templateId,
      contentHash: JDA_SUPPLY_ASA_VERIFIED_MANIFEST.contentHash,
      styleFingerprint: JDA_SUPPLY_ASA_VERIFIED_MANIFEST.styleFingerprint,
      blockers: JDA_SUPPLY_ASA_LB28_REMAINING_PHYSICAL_BLOCKERS,
      warnings: parity.warnings,
    };
  }

  if (!runtimeTemplateBytesAvailable) {
    return {
      readyForRealRender: false,
      stage: "NEEDS_RUNTIME_TEMPLATE_BYTES",
      caseId: FERRETERIA_REAL_CASE_EXPECTED.caseId,
      templateId: JDA_SUPPLY_ASA_EXPANDED_EDITABLE_ASSET.templateId,
      contentHash: JDA_SUPPLY_ASA_VERIFIED_MANIFEST.contentHash,
      styleFingerprint: JDA_SUPPLY_ASA_VERIFIED_MANIFEST.styleFingerprint,
      blockers: [`El runtime debe suministrar los bytes exactos ${JDA_SUPPLY_ASA_VERIFIED_MANIFEST.contentHash}.`],
      warnings: parity.warnings,
    };
  }

  return {
    readyForRealRender: true,
    stage: "READY_FOR_REAL_RENDER",
    caseId: FERRETERIA_REAL_CASE_EXPECTED.caseId,
    templateId: JDA_SUPPLY_ASA_EXPANDED_EDITABLE_ASSET.templateId,
    contentHash: JDA_SUPPLY_ASA_VERIFIED_MANIFEST.contentHash,
    styleFingerprint: JDA_SUPPLY_ASA_VERIFIED_MANIFEST.styleFingerprint,
    blockers: [],
    warnings: parity.warnings,
  };
}

export const FERRETERIA_REAL_CASE_E2E_PREFLIGHT = evaluateFerreteriaRealCaseE2EPreflight(false);
