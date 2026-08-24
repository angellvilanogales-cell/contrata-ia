import { UniversalEvidenceWorkspace } from "../lb52/UniversalEvidenceWorkspace";
import { VerifiedRuntimeTemplateStore } from "../lb53/VerifiedRuntimeTemplateStore";
import { universalV1ProtectedRendererState, universalV1RendererBlockers } from "../lb58/UniversalDocumentRendererReadiness";

export type V1PackageStage = "NEEDS_EVIDENCE" | "NEEDS_ASSETS" | "NEEDS_DOCUMENT_RENDERERS" | "READY_FOR_BROWSER_GENERATION";

export interface UniversalV1ProductionReadiness {
  ready: boolean;
  stage: V1PackageStage;
  blockers: readonly string[];
  evidenceReady: boolean;
  assetsReady: boolean;
  protectedRenderers: Readonly<Record<"PCAP" | "MEMORIA" | "PPT", boolean>>;
  legacyProductionEnabled: false;
}

/**
 * LB54/LB58: puerta de paquete productivo. No confunde el cierre documental manual
 * del caso real con disponer de renderers universales reproducibles para los tres documentos.
 * El estado por defecto procede del registro explícito de capacidades LB58 y no de
 * booleanos optimistas embebidos en esta función.
 */
export function evaluateUniversalV1ProductionReadiness(
  caseId: string,
  evidence: UniversalEvidenceWorkspace,
  assets: VerifiedRuntimeTemplateStore,
  rendererState: Readonly<Record<"PCAP" | "MEMORIA" | "PPT", boolean>> = universalV1ProtectedRendererState(),
): UniversalV1ProductionReadiness {
  const evidenceResult = evidence.readiness(caseId);
  if (!evidenceResult.ready) {
    return {
      ready: false,
      stage: "NEEDS_EVIDENCE",
      blockers: evidenceResult.blockers,
      evidenceReady: false,
      assetsReady: false,
      protectedRenderers: rendererState,
      legacyProductionEnabled: false,
    };
  }

  const assetResult = assets.packageReadiness();
  if (!assetResult.ready) {
    return {
      ready: false,
      stage: "NEEDS_ASSETS",
      blockers: assetResult.blockers,
      evidenceReady: true,
      assetsReady: false,
      protectedRenderers: rendererState,
      legacyProductionEnabled: false,
    };
  }

  const missingKinds = (Object.entries(rendererState) as Array<["PCAP" | "MEMORIA" | "PPT", boolean]>)
    .filter(([, ready]) => !ready)
    .map(([kind]) => kind);
  if (missingKinds.length) {
    const registeredBlockers = universalV1RendererBlockers().filter(blocker => missingKinds.some(kind => blocker.startsWith(`${kind}:`)));
    return {
      ready: false,
      stage: "NEEDS_DOCUMENT_RENDERERS",
      blockers: registeredBlockers.length ? registeredBlockers : missingKinds.map(kind => `${kind}: falta renderer universal protegido reproducible.`),
      evidenceReady: true,
      assetsReady: true,
      protectedRenderers: rendererState,
      legacyProductionEnabled: false,
    };
  }

  return {
    ready: true,
    stage: "READY_FOR_BROWSER_GENERATION",
    blockers: [],
    evidenceReady: true,
    assetsReady: true,
    protectedRenderers: rendererState,
    legacyProductionEnabled: false,
  };
}

export function assertLegacyGenerationDisabledInProduction(env: NodeJS.ProcessEnv = process.env): void {
  if (env.NODE_ENV === "production" && env.CONTRATA_IA_ENABLE_LEGACY_GENERATION === "true") {
    throw new Error("La generación legacy no puede habilitarse en producción V1.");
  }
}

export function legacyGenerationAllowed(env: NodeJS.ProcessEnv = process.env): boolean {
  assertLegacyGenerationDisabledInProduction(env);
  return env.NODE_ENV !== "production" && env.CONTRATA_IA_ENABLE_LEGACY_GENERATION === "true";
}
