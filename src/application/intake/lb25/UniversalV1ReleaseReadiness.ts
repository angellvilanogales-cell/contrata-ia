import { CanonicalContractType } from "../../../domain/expediente/CanonicalExpedienteState";
import { UniversalAdministrativeDocumentKind } from "../lb17/UniversalOfficialTemplateCatalog";
import { UniversalV1AcceptanceClosureResult } from "../lb24/UniversalV1AcceptanceClosure";

export interface UniversalV1SupportedScenario {
  scenarioId: string;
  contractType: CanonicalContractType;
  procedure: string;
  requiredDocuments: readonly UniversalAdministrativeDocumentKind[];
  acceptedRealCaseIds: readonly string[];
}

export interface UniversalV1OperationalEvidence {
  authenticatedProductionModeVerified: boolean;
  persistenceReloadVerified: boolean;
  backupRestoreVerified: boolean;
  httpsDeploymentVerified: boolean;
  browserUserJourneyVerified: boolean;
  officialEditableAssetsVerified: boolean;
  legacyGenerationDisabledForProduction: boolean;
  userDocumentationReady: boolean;
}

export interface UniversalV1ReleaseReadinessInput {
  version: "1.0.0";
  releaseId: string;
  acceptance: UniversalV1AcceptanceClosureResult;
  supportedScenarios: readonly UniversalV1SupportedScenario[];
  operations: UniversalV1OperationalEvidence;
  releaseReviewed: boolean;
  releaseReviewer?: string;
}

export interface UniversalV1ReleaseReadinessResult {
  engineeringReady: boolean;
  productionReady: boolean;
  blockers: readonly string[];
  supportedScenarioIds: readonly string[];
}

/**
 * LB25.1-LB25.4. Puerta final de versión. No amplía el alcance jurídico por la
 * mera existencia de tipos en el dominio: solo declara escenarios respaldados
 * por al menos un caso real aceptado. Tampoco confunde CI verde con puesta en
 * producción: despliegue HTTPS, restore, recorrido de navegador y revisión
 * humana siguen siendo evidencias obligatorias.
 */
export function evaluateUniversalV1ReleaseReadiness(
  input: UniversalV1ReleaseReadinessInput,
): UniversalV1ReleaseReadinessResult {
  const blockers: string[] = [];
  if (!input.releaseId.trim()) blockers.push("La release V1 carece de releaseId trazable.");
  if (input.supportedScenarios.length === 0) blockers.push("La V1 no tiene ningún escenario contractual explícitamente soportado.");

  const ids = new Set<string>();
  for (const scenario of input.supportedScenarios) {
    if (!scenario.scenarioId.trim()) blockers.push("Existe un escenario V1 sin scenarioId.");
    if (ids.has(scenario.scenarioId)) blockers.push(`scenarioId duplicado: ${scenario.scenarioId}.`);
    ids.add(scenario.scenarioId);
    if (!scenario.procedure.trim()) blockers.push(`${scenario.scenarioId}: falta procedimiento.`);
    if (scenario.requiredDocuments.length === 0) blockers.push(`${scenario.scenarioId}: no define documentos administrativos requeridos.`);
    if (scenario.acceptedRealCaseIds.length === 0) blockers.push(`${scenario.scenarioId}: no existe caso real aceptado que respalde este alcance.`);
  }

  if (!input.acceptance.engineeringReady) blockers.push(...input.acceptance.blockers.map(item => `Aceptación V1: ${item}`));

  const engineeringBlockers = [...blockers];
  const engineeringReady = engineeringBlockers.length === 0;

  if (!input.acceptance.productionReady) blockers.push(...input.acceptance.blockers.map(item => `Producción: ${item}`));

  const operationalChecks: Array<[keyof UniversalV1OperationalEvidence, string]> = [
    ["authenticatedProductionModeVerified", "No se ha verificado el modo productivo autenticado."],
    ["persistenceReloadVerified", "No se ha verificado persistencia y recarga del expediente real."],
    ["backupRestoreVerified", "No se ha verificado backup y restauración sobre la release candidata."],
    ["httpsDeploymentVerified", "No se ha verificado un despliegue HTTPS de la release candidata."],
    ["browserUserJourneyVerified", "No se ha completado el recorrido real de usuario desde navegador."],
    ["officialEditableAssetsVerified", "No están verificados todos los activos editables oficiales del alcance V1."],
    ["legacyGenerationDisabledForProduction", "La generación heredada no está acreditada como deshabilitada para producción."],
    ["userDocumentationReady", "La documentación de usuario/operación de V1 no está cerrada."],
  ];
  for (const [key, message] of operationalChecks) if (!input.operations[key]) blockers.push(message);

  if (!input.releaseReviewed || !input.releaseReviewer?.trim()) {
    blockers.push("La release V1 no cuenta con revisión humana final identificada.");
  }

  return {
    engineeringReady,
    productionReady: engineeringReady && blockers.length === 0,
    blockers: [...new Set(blockers)],
    supportedScenarioIds: input.supportedScenarios.map(item => item.scenarioId),
  };
}
