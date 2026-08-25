import { evaluateFerreteriaThreeDocumentClosureGate } from "../lb49/FerreteriaThreeDocumentClosureGate";
import { evaluateProcurementSourceCaseCoverage } from "../lb50/ProcurementSourceCaseCoverageMatrix";

export interface UniversalV1FinalReleaseEvidence {
  browserJourneyVerified: boolean;
  runtimeAssetsVerified: boolean;
  protectedPackageGenerationVerified: boolean;
  legacyGenerationDisabledForProduction: boolean;
  httpsPilotVerified: boolean;
  restartPersistenceVerified: boolean;
  backupRestoreVerified: boolean;
  humanDocumentAcceptance: boolean;
}

export type UniversalV1FinalReleaseStage =
  | "NEEDS_DOCUMENT_ENGINEERING"
  | "NEEDS_RUNTIME_ASSETS"
  | "NEEDS_PROTECTED_PACKAGE_GENERATION"
  | "NEEDS_BROWSER_E2E"
  | "NEEDS_EXTERNAL_PILOT"
  | "NEEDS_HUMAN_ACCEPTANCE"
  | "READY_FOR_V1_RELEASE";

/**
 * LB56 — gate final y veraz de la V1.
 *
 * El cierre técnico de PCAP + Memoria + PPT es necesario, pero no suficiente.
 * La V1 solo puede declararse productiva cuando existen activos runtime verificados,
 * generación protegida conjunta, recorrido real desde navegador, operación HTTPS con
 * persistencia/backup y aceptación humana de los documentos. Este gate prohíbe
 * convertir pruebas sintéticas o cierres de ingeniería en una falsa aceptación.
 */
export function evaluateUniversalV1FinalRelease(
  evidence: UniversalV1FinalReleaseEvidence,
) {
  const documents = evaluateFerreteriaThreeDocumentClosureGate();
  const coverage = evaluateProcurementSourceCaseCoverage();
  const blockers: string[] = [];

  if (!documents.engineeringClosed) {
    blockers.push(...documents.blockers);
    return {
      productionReady: false,
      stage: "NEEDS_DOCUMENT_ENGINEERING" as const,
      blockers,
      documents,
      coverage,
    };
  }

  if (!evidence.runtimeAssetsVerified) {
    blockers.push("Falta verificar en runtime la identidad binaria de todos los activos editables exigidos por la V1.");
    return { productionReady: false, stage: "NEEDS_RUNTIME_ASSETS" as const, blockers, documents, coverage };
  }

  if (!evidence.protectedPackageGenerationVerified || !evidence.legacyGenerationDisabledForProduction) {
    if (!evidence.protectedPackageGenerationVerified) blockers.push("Falta demostrar generación protegida conjunta PCAP + Memoria + PPT desde el expediente universal.");
    if (!evidence.legacyGenerationDisabledForProduction) blockers.push("La vía legacy no está demostrada como deshabilitada para producción.");
    return { productionReady: false, stage: "NEEDS_PROTECTED_PACKAGE_GENERATION" as const, blockers, documents, coverage };
  }

  if (!evidence.browserJourneyVerified) {
    blockers.push("Falta completar el recorrido E2E real desde navegador: abrir expediente, validar evidencia y generar el paquete documental.");
    return { productionReady: false, stage: "NEEDS_BROWSER_E2E" as const, blockers, documents, coverage };
  }

  if (!evidence.httpsPilotVerified || !evidence.restartPersistenceVerified || !evidence.backupRestoreVerified) {
    if (!evidence.httpsPilotVerified) blockers.push("Falta verificar el piloto sobre una URL HTTPS real.");
    if (!evidence.restartPersistenceVerified) blockers.push("Falta verificar persistencia después de reinicio en el entorno desplegado.");
    if (!evidence.backupRestoreVerified) blockers.push("Falta demostrar backup y restauración en el entorno desplegado.");
    return { productionReady: false, stage: "NEEDS_EXTERNAL_PILOT" as const, blockers, documents, coverage };
  }

  if (!evidence.humanDocumentAcceptance) {
    blockers.push("Falta la aceptación humana final del paquete PCAP + Memoria + PPT; el sistema no puede autocertificarla.");
    return { productionReady: false, stage: "NEEDS_HUMAN_ACCEPTANCE" as const, blockers, documents, coverage };
  }

  return {
    productionReady: true,
    stage: "READY_FOR_V1_RELEASE" as const,
    blockers: [],
    documents,
    coverage,
    universalProductionClaimAllowed: false,
    supportedProductionScope: "SUPPLY / OPEN_SIMPLIFIED_ABBREVIATED / familia validada por CONTR/2026/240267",
  };
}

export const UNIVERSAL_V1_CURRENT_RELEASE_EVIDENCE: UniversalV1FinalReleaseEvidence = {
  browserJourneyVerified: false,
  runtimeAssetsVerified: false,
  protectedPackageGenerationVerified: false,
  legacyGenerationDisabledForProduction: true,
  httpsPilotVerified: false,
  restartPersistenceVerified: false,
  backupRestoreVerified: false,
  humanDocumentAcceptance: false,
};
