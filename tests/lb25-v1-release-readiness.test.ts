import { describe, expect, it } from "vitest";
import { evaluateUniversalV1AcceptanceClosure } from "../src/application/intake/lb24/UniversalV1AcceptanceClosure";
import {
  evaluateUniversalV1ReleaseReadiness,
  UniversalV1ReleaseReadinessInput,
} from "../src/application/intake/lb25/UniversalV1ReleaseReadiness";
import { evaluateCurrentContrataIAV1Candidate } from "../src/application/intake/lb25/ContrataIAV1ReleaseCandidate";

function acceptedCase() {
  return {
    engineeringReady: true,
    productionAccepted: true,
    blockers: [] as string[],
    completedStages: [
      "INTAKE",
      "UNIVERSAL_EVIDENCE",
      "HUMAN_VALIDATION",
      "LEGAL_CLOSURE",
      "TEMPLATE_SELECTION",
      "MAPPING",
      "RENDERING",
      "DOCUMENT_AUDIT",
      "PERSISTENCE_RELOAD",
    ] as const,
  };
}

function completeInput(): UniversalV1ReleaseReadinessInput {
  return {
    version: "1.0.0",
    releaseId: "v1-acceptance-001",
    acceptance: evaluateUniversalV1AcceptanceClosure([acceptedCase()]),
    supportedScenarios: [{
      scenarioId: "SUPPLY-ASA-AUTOFINANCED",
      contractType: "SUPPLY",
      procedure: "OPEN_SIMPLIFIED_ABBREVIATED",
      requiredDocuments: ["MEMORIA", "DPCAF", "PCAP", "PPT"],
      acceptedRealCaseIds: ["REAL-SUPPLY-001"],
    }],
    operations: {
      authenticatedProductionModeVerified: true,
      persistenceReloadVerified: true,
      backupRestoreVerified: true,
      httpsDeploymentVerified: true,
      browserUserJourneyVerified: true,
      officialEditableAssetsVerified: true,
      legacyGenerationDisabledForProduction: true,
      userDocumentationReady: true,
    },
    releaseReviewed: true,
    releaseReviewer: "release-custodian",
  };
}

describe("LB25 - cierre V1", () => {
  it("mantiene bloqueado el candidato real actual sin inventar evidencias externas", () => {
    const result = evaluateCurrentContrataIAV1Candidate();
    expect(result.productionReady).toBe(false);
    expect(result.blockers.join(" ")).toMatch(/caso real|escenario contractual|HTTPS|activos editables|generación heredada/i);
  });

  it("no amplía el alcance V1 a un escenario sin caso real aceptado", () => {
    const input = completeInput();
    input.supportedScenarios = [{
      ...input.supportedScenarios[0]!,
      acceptedRealCaseIds: [],
    }];
    const result = evaluateUniversalV1ReleaseReadiness(input);
    expect(result.engineeringReady).toBe(false);
    expect(result.productionReady).toBe(false);
    expect(result.blockers.join(" ")).toMatch(/caso real aceptado/i);
  });

  it("distingue CI/ingeniería de verificación operativa externa", () => {
    const input = completeInput();
    input.operations = { ...input.operations, httpsDeploymentVerified: false };
    const result = evaluateUniversalV1ReleaseReadiness(input);
    expect(result.engineeringReady).toBe(true);
    expect(result.productionReady).toBe(false);
    expect(result.blockers.join(" ")).toMatch(/HTTPS/i);
  });

  it("exige revisión humana final de la release", () => {
    const input = completeInput();
    input.releaseReviewed = false;
    input.releaseReviewer = undefined;
    const result = evaluateUniversalV1ReleaseReadiness(input);
    expect(result.productionReady).toBe(false);
    expect(result.blockers.join(" ")).toMatch(/revisión humana final/i);
  });

  it("solo declara V1 productiva cuando alcance, caso real, activos y operación están acreditados", () => {
    const result = evaluateUniversalV1ReleaseReadiness(completeInput());
    expect(result.engineeringReady).toBe(true);
    expect(result.productionReady).toBe(true);
    expect(result.blockers).toEqual([]);
    expect(result.supportedScenarioIds).toEqual(["SUPPLY-ASA-AUTOFINANCED"]);
  });
});
