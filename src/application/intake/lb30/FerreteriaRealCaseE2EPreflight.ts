import {
  evaluateFerreteriaRealCaseAcceptance,
  FERRETERIA_REAL_CASE_EXPECTED,
} from "../lb25/FerreteriaRealCaseAcceptanceProfile";
import { JDA_SUPPLY_ASA_VERIFIED_MANIFEST } from "../lb25/JuntaSupplyAsaOfficialActivation";
import { JDA_SUPPLY_ASA_PRODUCTION_REGISTRY_RECORD } from "../lb29/UniversalSupplyAsaProtectedPipeline";
import {
  JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET,
  evaluateJdaSupplyAsaLb34PhysicalClosure,
} from "../lb34/JuntaSupplyAsaModificationSection";

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
 * Preflight E2E del primer expediente real después del cierre físico LB34.
 * No genera el documento ni sustituye la revisión humana. La cobertura física
 * completa permite llegar a READY solo si el runtime dispone de los bytes
 * exactos del ODT oficial cuyo hash ya fue verificado.
 */
export function evaluateFerreteriaRealCaseE2EPreflight(runtimeTemplateBytesAvailable: boolean): FerreteriaE2EPreflightResult {
  const parity = evaluateFerreteriaRealCaseAcceptance(FERRETERIA_REAL_CASE_EXPECTED);
  if (!parity.ready) {
    return {
      readyForRealRender: false,
      stage: "CASE_PARITY_FAILED",
      caseId: FERRETERIA_REAL_CASE_EXPECTED.caseId,
      templateId: JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET.templateId,
      contentHash: JDA_SUPPLY_ASA_VERIFIED_MANIFEST.contentHash,
      styleFingerprint: JDA_SUPPLY_ASA_VERIFIED_MANIFEST.styleFingerprint,
      blockers: parity.blockers,
      warnings: parity.warnings,
    };
  }

  const identityBlockers: string[] = [];
  if (JDA_SUPPLY_ASA_PRODUCTION_REGISTRY_RECORD.templateId !== JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET.templateId) identityBlockers.push("El registro productivo no coincide con el activo ODT final LB34.");
  if (JDA_SUPPLY_ASA_PRODUCTION_REGISTRY_RECORD.contentHash !== JDA_SUPPLY_ASA_VERIFIED_MANIFEST.contentHash) identityBlockers.push("El hash del registro productivo no coincide con el original oficial verificado.");
  if (JDA_SUPPLY_ASA_PRODUCTION_REGISTRY_RECORD.styleFingerprint !== JDA_SUPPLY_ASA_VERIFIED_MANIFEST.styleFingerprint) identityBlockers.push("La huella de estilo del registro productivo no coincide con el original oficial verificado.");
  if (JDA_SUPPLY_ASA_PRODUCTION_REGISTRY_RECORD.status !== "HUMAN_VALIDATED") identityBlockers.push("El modelo oficial no está validado humanamente en el registro.");
  if (identityBlockers.length) {
    return {
      readyForRealRender: false,
      stage: "OFFICIAL_TEMPLATE_IDENTITY_FAILED",
      caseId: FERRETERIA_REAL_CASE_EXPECTED.caseId,
      templateId: JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET.templateId,
      contentHash: JDA_SUPPLY_ASA_VERIFIED_MANIFEST.contentHash,
      styleFingerprint: JDA_SUPPLY_ASA_VERIFIED_MANIFEST.styleFingerprint,
      blockers: identityBlockers,
      warnings: parity.warnings,
    };
  }

  const physical = evaluateJdaSupplyAsaLb34PhysicalClosure();
  if (!physical.fullPhysicalCoverageReady) {
    return {
      readyForRealRender: false,
      stage: "PHYSICAL_COVERAGE_INCOMPLETE",
      caseId: FERRETERIA_REAL_CASE_EXPECTED.caseId,
      templateId: JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET.templateId,
      contentHash: JDA_SUPPLY_ASA_VERIFIED_MANIFEST.contentHash,
      styleFingerprint: JDA_SUPPLY_ASA_VERIFIED_MANIFEST.styleFingerprint,
      blockers: physical.blockers.map(item => item.finding),
      warnings: parity.warnings,
    };
  }

  if (!runtimeTemplateBytesAvailable) {
    return {
      readyForRealRender: false,
      stage: "NEEDS_RUNTIME_TEMPLATE_BYTES",
      caseId: FERRETERIA_REAL_CASE_EXPECTED.caseId,
      templateId: JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET.templateId,
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
    templateId: JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET.templateId,
    contentHash: JDA_SUPPLY_ASA_VERIFIED_MANIFEST.contentHash,
    styleFingerprint: JDA_SUPPLY_ASA_VERIFIED_MANIFEST.styleFingerprint,
    blockers: [],
    warnings: parity.warnings,
  };
}

export const FERRETERIA_REAL_CASE_E2E_PREFLIGHT = evaluateFerreteriaRealCaseE2EPreflight(false);
