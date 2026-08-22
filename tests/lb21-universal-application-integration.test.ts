import { describe, expect, it } from "vitest";
import { bridgeLegacyIntakeCaseToUniversal } from "../src/application/intake/lb21/UniversalLegacyCaseBridge";
import { evaluateUniversalApplicationIntegration } from "../src/application/intake/lb21/UniversalApplicationIntegration";
import { UniversalOfficialTemplateRegistry } from "../src/application/intake/lb19/UniversalOfficialTemplateRegistry";
import type { IntakeCase } from "../src/application/intake/lb6/IntakeModel";

function legacyCase(): IntakeCase {
  return {
    id: "LB21-CASE-001",
    mode: "GUIDED",
    createdAt: "2026-08-22T20:00:00.000Z",
    revision: 4,
    validation: { validated: true, validatedAt: "2026-08-22T20:01:00.000Z", validatedBy: "reviewer" },
    answers: {
      contractingAuthority: { questionId: "contractingAuthority", value: "Junta de Andalucía", source: "USER_GUIDED", recordedAt: "2026-08-22T20:00:00.000Z" },
      promotingUnit: { questionId: "promotingUnit", value: "SAE", source: "USER_GUIDED", recordedAt: "2026-08-22T20:00:00.000Z" },
      object: { questionId: "object", value: "Suministro de material", source: "USER_GUIDED", recordedAt: "2026-08-22T20:00:00.000Z" },
      durationMonths: { questionId: "durationMonths", value: 12, source: "USER_GUIDED", recordedAt: "2026-08-22T20:00:00.000Z" },
      estimatedValue: { questionId: "estimatedValue", value: 100000, source: "USER_GUIDED", recordedAt: "2026-08-22T20:00:00.000Z" },
    },
  };
}

describe("LB21 universal application integration", () => {
  it("migrates only direct semantic equivalences and never infers type, CPV or money units", () => {
    const result = bridgeLegacyIntakeCaseToUniversal(legacyCase());

    expect(result.expediente.canonical.fields.object.value).toBe("Suministro de material");
    expect(result.expediente.canonical.fields.durationMonths.value).toBe(12);
    expect(result.expediente.administrative.contractingAuthority.value).toBe("Junta de Andalucía");
    expect(result.expediente.administrative.promotingUnit.value).toBe("SAE");
    expect(result.expediente.canonical.fields.contractType.status).toBe("PENDING");
    expect(result.expediente.canonical.fields.cpvMain.status).toBe("PENDING");
    expect(result.expediente.canonical.fields.estimatedValueCents.status).toBe("PENDING");
    expect(result.skippedLegacyAnswers).toContain("estimatedValue");
    expect(result.diagnostics.join(" ")).toMatch(/no se migra automáticamente/i);
  });

  it("does not treat an LB6 validated case as universally ready for generation", () => {
    const migrated = bridgeLegacyIntakeCaseToUniversal(legacyCase());
    const integration = evaluateUniversalApplicationIntegration(
      migrated.expediente,
      new UniversalOfficialTemplateRegistry(),
      "2026-08-22",
      ["DPCAF", "PCAP", "PPT"],
    );

    expect(integration.ready).toBe(false);
    expect(integration.stage).toBe("NEEDS_UNIVERSAL_EVIDENCE");
    expect(integration.legacyGenerationAllowed).toBe(false);
    expect(integration.blockers.length).toBeGreaterThan(0);
  });
});
