import { describe, expect, it } from "vitest";
import { JDA_SUPPLY_ASA_OFFICIAL_ODT_DISCOVERY } from "../src/application/intake/lb23/JuntaOfficialEditableTemplateDiscovery";
import { evaluateUniversalProductionRendererClosure } from "../src/application/intake/lb23/UniversalProductionRendererClosure";
import {
  evaluateSimplifiedAbbreviatedCurrentLaw,
  LCSP_159_6_2026_SOURCE,
} from "../src/application/intake/lb24/UniversalCurrentLawAcceptance";
import { evaluateRealCaseAcceptance, RealCaseAcceptanceStage } from "../src/application/intake/lb24/UniversalRealCaseAcceptance";
import { evaluateUniversalV1AcceptanceClosure } from "../src/application/intake/lb24/UniversalV1AcceptanceClosure";

const stages: readonly RealCaseAcceptanceStage[] = [
  "INTAKE", "UNIVERSAL_EVIDENCE", "HUMAN_VALIDATION", "LEGAL_CLOSURE", "TEMPLATE_SELECTION",
  "MAPPING", "RENDERING", "DOCUMENT_AUDIT", "PERSISTENCE_RELOAD",
];

function currentLaw(valueCents = 5_999_999) {
  return evaluateSimplifiedAbbreviatedCurrentLaw({
    contractType: "SUPPLY",
    estimatedValueCents: valueCents,
    intellectualService: false,
    allAwardCriteriaAutomaticallyEvaluable: true,
    source: LCSP_159_6_2026_SOURCE,
  });
}

function productionRenderer(productionReady: boolean) {
  return evaluateUniversalProductionRendererClosure({
    source: productionReady
      ? { ...JDA_SUPPLY_ASA_OFFICIAL_ODT_DISCOVERY, humanValidated: true, validatedBy: "custodian" }
      : JDA_SUPPLY_ASA_OFFICIAL_ODT_DISCOVERY,
    binaryAcquired: productionReady,
    contentHashVerified: productionReady,
    styleFingerprintVerified: productionReady,
    physicalBindingsVerified: productionReady,
    rendererAuditPassed: true,
  });
}

describe("LB24 - aceptación real end-to-end y normativa vigente", () => {
  it("aplica el límite estricto inferior a 60.000 euros del art. 159.6 para suministro", () => {
    expect(currentLaw(5_999_999).ready).toBe(true);
    const atLimit = currentLaw(6_000_000);
    expect(atLimit.ready).toBe(false);
    expect(atLimit.blockers.join(" ")).toMatch(/60\.000/);
  });

  it("rechaza servicios intelectuales y criterios no automáticos en ASA", () => {
    const result = evaluateSimplifiedAbbreviatedCurrentLaw({
      contractType: "SERVICE",
      estimatedValueCents: 2_000_000,
      intellectualService: true,
      allAwardCriteriaAutomaticallyEvaluable: false,
      source: LCSP_159_6_2026_SOURCE,
    });
    expect(result.ready).toBe(false);
    expect(result.blockers.join(" ")).toMatch(/intelectual/i);
    expect(result.blockers.join(" ")).toMatch(/automáticamente/i);
  });

  it("mantiene la aceptación productiva bloqueada si falta el original editable activado", () => {
    const result = evaluateRealCaseAcceptance({
      caseId: "REAL-SUPPLY-ASA-001",
      sourceCase: "fuente-real-suministro",
      realSourceConfirmed: true,
      checkpoints: stages.map(stage => ({ stage, passed: true, evidenceId: `evidence:${stage}` })),
      currentLaw: currentLaw(),
      rendererClosure: productionRenderer(false),
      humanReviewedDocuments: false,
    });
    expect(result.engineeringReady).toBe(true);
    expect(result.productionAccepted).toBe(false);
    expect(result.blockers.join(" ")).toMatch(/bytes|validada humanamente|documentos finales/i);
  });

  it("acepta un expediente real únicamente tras recorrer todos los checkpoints y revisión humana", () => {
    const result = evaluateRealCaseAcceptance({
      caseId: "REAL-SUPPLY-ASA-001",
      sourceCase: "fuente-real-suministro",
      realSourceConfirmed: true,
      checkpoints: stages.map(stage => ({ stage, passed: true, evidenceId: `evidence:${stage}` })),
      currentLaw: currentLaw(),
      rendererClosure: productionRenderer(true),
      humanReviewedDocuments: true,
      reviewer: "legal-document-reviewer",
    });
    expect(result.engineeringReady).toBe(true);
    expect(result.productionAccepted).toBe(true);
    expect(result.completedStages).toHaveLength(stages.length);
  });

  it("cierra V1 solo si existe al menos un caso real completamente aceptado", () => {
    const blockedCase = evaluateRealCaseAcceptance({
      caseId: "REAL-SUPPLY-ASA-001",
      sourceCase: "fuente-real-suministro",
      realSourceConfirmed: true,
      checkpoints: stages.map(stage => ({ stage, passed: true, evidenceId: `evidence:${stage}` })),
      currentLaw: currentLaw(),
      rendererClosure: productionRenderer(false),
      humanReviewedDocuments: false,
    });
    expect(evaluateUniversalV1AcceptanceClosure([blockedCase]).productionReady).toBe(false);

    const acceptedCase = evaluateRealCaseAcceptance({
      caseId: "REAL-SUPPLY-ASA-002",
      sourceCase: "fuente-real-suministro",
      realSourceConfirmed: true,
      checkpoints: stages.map(stage => ({ stage, passed: true, evidenceId: `evidence:${stage}` })),
      currentLaw: currentLaw(),
      rendererClosure: productionRenderer(true),
      humanReviewedDocuments: true,
      reviewer: "legal-document-reviewer",
    });
    const closure = evaluateUniversalV1AcceptanceClosure([acceptedCase]);
    expect(closure.engineeringReady).toBe(true);
    expect(closure.productionReady).toBe(true);
    expect(closure.blockers).toEqual([]);
  });
});
