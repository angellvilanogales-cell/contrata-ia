import { UNIVERSAL_V1_DOCUMENT_RENDERER_CAPABILITIES } from "../lb58/UniversalDocumentRendererReadiness";
import { evaluateFerreteriaThreeDocumentClosureGate } from "../lb49/FerreteriaThreeDocumentClosureGate";

/**
 * LB64 — cierre de todo lo que puede resolverse autónomamente dentro del código.
 *
 * No convierte implementación en prueba de despliegue ni aceptación humana.
 * Separa expresamente las capacidades ya construidas de las evidencias que solo
 * pueden obtenerse ejecutando el sistema con activos reales en el entorno piloto.
 */
export const UNIVERSAL_V1_AUTONOMOUS_ENGINEERING = {
  memoryProtectedRendererImplemented: true,
  pptProtectedRendererImplemented: true,
  pcapProtectedRendererImplemented: true,
  protectedThreeDocumentPackageCoordinatorImplemented: true,
  browserZipDownloadWired: true,
  runtimeExactAssetManifestClosed: true,
  runtimeAssetIntegrityVerificationImplemented: true,
  postRenderAuditsImplemented: true,
  crossDocumentAuditImplemented: true,
  legacyProductionGenerationDisabled: true,
  exactRuntimeExecutionStillRequired: true,
  browserE2eWithRealAssetsStillRequired: true,
  externalHttpsPilotStillRequired: true,
  restartPersistencePilotStillRequired: true,
  backupRestorePilotStillRequired: true,
  humanDocumentAcceptanceStillRequired: true,
} as const;

export function evaluateUniversalV1AutonomousEngineeringClosure() {
  const documents = evaluateFerreteriaThreeDocumentClosureGate();
  const renderers = UNIVERSAL_V1_DOCUMENT_RENDERER_CAPABILITIES;
  const blockers: string[] = [];
  if (!documents.engineeringClosed) blockers.push(...documents.blockers);
  for (const kind of ["PCAP", "MEMORIA", "PPT"] as const) {
    if (!renderers[kind].protectedRendererReady) blockers.push(`${kind}: renderer protegido no cerrado.`);
    if (!renderers[kind].exactSourceIdentityVerified) blockers.push(`${kind}: identidad fuente exacta no verificada.`);
    if (!renderers[kind].physicalMappingReady) blockers.push(`${kind}: mapeo físico no cerrado.`);
  }
  return {
    engineeringReady: blockers.length === 0,
    blockers,
    productionReady: false,
    remainingExternalEvidence: [
      "Instalar los tres ODT exactos en CONTRATA_IA_TEMPLATE_DIR y verificar sus SHA-256 en el runtime desplegado.",
      "Ejecutar generación real PCAP + Memoria + PPT desde navegador y abrir los tres documentos generados.",
      "Verificar piloto HTTPS, persistencia tras reinicio y backup/restauración.",
      "Registrar aceptación humana final del paquete documental.",
    ],
  } as const;
}
