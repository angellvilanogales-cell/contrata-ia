import { describe, expect, it } from "vitest";
import {
  UNIVERSAL_V1_CURRENT_RELEASE_EVIDENCE,
  evaluateUniversalV1FinalRelease,
} from "../src/application/intake/lb56/UniversalV1FinalReleaseGate";

describe("LB56 - gate final V1", () => {
  it("no confunde el cierre técnico de los tres documentos con productionReady", () => {
    const result = evaluateUniversalV1FinalRelease(UNIVERSAL_V1_CURRENT_RELEASE_EVIDENCE);
    expect(result.productionReady).toBe(false);
    expect(result.stage).toBe("NEEDS_RUNTIME_ASSETS");
    expect(result.documents.engineeringClosed).toBe(true);
  });

  it("exige generación protegida conjunta y legacy deshabilitado", () => {
    const result = evaluateUniversalV1FinalRelease({
      ...UNIVERSAL_V1_CURRENT_RELEASE_EVIDENCE,
      runtimeAssetsVerified: true,
      legacyGenerationDisabledForProduction: false,
    });
    expect(result.stage).toBe("NEEDS_PROTECTED_PACKAGE_GENERATION");
    expect(result.blockers.join(" ")).toMatch(/legacy/i);
  });

  it("exige E2E navegador, piloto operativo y aceptación humana", () => {
    const base = {
      ...UNIVERSAL_V1_CURRENT_RELEASE_EVIDENCE,
      runtimeAssetsVerified: true,
      protectedPackageGenerationVerified: true,
      legacyGenerationDisabledForProduction: true,
    };
    expect(evaluateUniversalV1FinalRelease(base).stage).toBe("NEEDS_BROWSER_E2E");
    expect(evaluateUniversalV1FinalRelease({ ...base, browserJourneyVerified: true }).stage).toBe("NEEDS_EXTERNAL_PILOT");
    expect(evaluateUniversalV1FinalRelease({
      ...base,
      browserJourneyVerified: true,
      httpsPilotVerified: true,
      restartPersistenceVerified: true,
      backupRestoreVerified: true,
    }).stage).toBe("NEEDS_HUMAN_ACCEPTANCE");
  });

  it("solo permite release V1 tras todas las evidencias, sin reclamar universalidad", () => {
    const result = evaluateUniversalV1FinalRelease({
      browserJourneyVerified: true,
      runtimeAssetsVerified: true,
      protectedPackageGenerationVerified: true,
      legacyGenerationDisabledForProduction: true,
      httpsPilotVerified: true,
      restartPersistenceVerified: true,
      backupRestoreVerified: true,
      humanDocumentAcceptance: true,
    });
    expect(result.productionReady).toBe(true);
    expect(result.stage).toBe("READY_FOR_V1_RELEASE");
    expect(result.coverage.universalProductionClaimAllowed).toBe(false);
  });
});
