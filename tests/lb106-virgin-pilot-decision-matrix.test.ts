import { describe, expect, it } from "vitest";
import { evaluateLB103DocumentCompletion } from "../src/application/universal/LB103DocumentCompletion";
import { NEW_SUPPLY_VALUES } from "../src/application/universal/LB103SyntheticNewCaseFixture";
import { evaluateLB106VirginPilotReadiness } from "../src/application/universal/LB106VirginPilotReadiness";
import {
  auditLb106DecisionMatrix,
  LB106_LEGAL_BASES,
  LB106_VIRGIN_PILOT_DECISION_MATRIX,
} from "../src/domain/decision/lb106/VirginPilotDecisionMatrix";
import type { UniversalEvidenceRecord } from "../src/application/intake/lb52/UniversalEvidenceWorkspace";

function validatedRecord(): UniversalEvidenceRecord {
  return {
    caseId: "EXP-LB106-TEST",
    updatedAt: "2026-09-11T10:00:00.000Z",
    fields: Object.fromEntries(Object.entries(NEW_SUPPLY_VALUES).map(([key, value]) => [key, {
      key,
      value,
      status: "HUMAN_VALIDATED",
      sources: [{ kind: "USER_INPUT", sourceId: `ui:lb106:${key}` }],
      humanValidationRequired: true,
      humanValidated: true,
      humanValidation: { by: "reviewer-lb106", at: "2026-09-11T10:00:00.000Z" },
    }])),
  } as UniversalEvidenceRecord;
}

describe("LB106 · matriz jurídica y expediente piloto virgen", () => {
  it("cubre todo el canon y fundamenta cada decisión y alternativa", () => {
    const audit = auditLb106DecisionMatrix();
    expect(audit).toMatchObject({
      ready: true,
      decisionCount: 20,
      legalBasisCount: 33,
      coveredMemorySections: 19,
      coveredPptSections: 12,
      humanConsentRequired: true,
      productionReady: false,
    });
    expect(audit.blockers).toEqual([]);
    for (const decision of LB106_VIRGIN_PILOT_DECISION_MATRIX) {
      expect(decision.legalBasisIds.length).toBeGreaterThan(0);
      expect(decision.discardedAlternatives.length).toBeGreaterThan(0);
      expect(decision.consent.actions).toEqual(["VALIDAR", "MODIFICAR", "RECHAZAR"]);
      for (const alternative of decision.discardedAlternatives) expect(alternative.legalBasisIds.length).toBeGreaterThan(0);
    }
    for (const legal of LB106_LEGAL_BASES) {
      expect(legal.officialUrl).toMatch(/^https:\/\/www\.boe\.es\/buscar\/act\.php\?/);
      expect(legal.consolidatedAt).toBe("2026-04-09");
    }
  });

  it("cubre con ficha jurídica todos los campos documentales exigibles", () => {
    const completion = evaluateLB103DocumentCompletion(validatedRecord());
    expect(completion.matrixAudit.ready).toBe(true);
    expect(completion.fields.length).toBeGreaterThan(0);
    expect(completion.fields.every(field => field.legalDecision)).toBe(true);
  });

  it("abre el piloto sin precargar hechos ni fingir consentimiento", () => {
    const readiness = evaluateLB106VirginPilotReadiness();
    expect(readiness).toMatchObject({
      readyForHumanStart: true,
      readyForGeneration: false,
      virgin: true,
      answersPreloaded: false,
      sourceCaseIdsUsed: [],
      factualValues: {},
      syntheticTestsCountAsHumanAcceptance: false,
      humanConsentRequired: true,
      productionReady: false,
    });
    expect(readiness.documents.pcap.policy).toBe("MODELO_OFICIAL_INMUTABLE_SOLO_DESTINOS_AUTORIZADOS");
  });
});
