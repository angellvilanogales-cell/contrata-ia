import { describe, expect, it } from "vitest";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import {
  CanonicalExpedienteState,
  evaluateCanonicalPromotion,
} from "../src/domain/expediente/CanonicalExpedienteState";
import {
  EvidenceField,
  assertNoSilentConflictResolution,
  createPendingEvidenceField,
  isPromotableEvidenceField,
} from "../src/domain/expediente/EvidenceField";

function confirmed<T>(key: string, value: T): EvidenceField<T> {
  return {
    key,
    value,
    status: "SOURCE_CONFIRMED",
    sources: [{ kind: "PRIMARY_DOCUMENT", sourceId: "TEST-SOURCE" }],
    humanValidationRequired: false,
    humanValidated: false,
  };
}

describe("Bloque 12.1 - estado canónico del expediente", () => {
  it("mantiene compatibilidad con la máquina oficial de estados", () => {
    const pending = createPendingEvidenceField<string>("object");
    expect(pending.status).toBe("PENDING");
    expect(EstadoExpediente.BORRADOR).toBe("BORRADOR");
  });

  it("impide promocionar una contradicción de fuente", () => {
    const conflict: EvidenceField<string> = {
      key: "lots.maximumBidLots",
      value: null,
      status: "SOURCE_CONFLICT",
      sources: [
        { kind: "PRIMARY_DOCUMENT", sourceId: "PCAP", locator: "Anexo I" },
        { kind: "PRIMARY_DOCUMENT", sourceId: "PCAP", locator: "Anexo I" },
      ],
      humanValidationRequired: true,
      humanValidated: false,
      conflict: {
        statements: [
          "No existe limitación.",
          "Número máximo de lotes ofertables: dos.",
        ],
        treatment: "DO_NOT_AUTO_RESOLVE",
      },
    };

    expect(() => assertNoSilentConflictResolution(conflict)).not.toThrow();
    expect(isPromotableEvidenceField(conflict)).toBe(false);
  });

  it("rechaza una contradicción que ya tenga un valor resuelto silenciosamente", () => {
    const invalidConflict: EvidenceField<number> = {
      key: "lots.maximumBidLots",
      value: 2,
      status: "SOURCE_CONFLICT",
      sources: [],
      humanValidationRequired: true,
      humanValidated: false,
      conflict: {
        statements: ["Sin límite", "Máximo dos"],
        treatment: "DO_NOT_AUTO_RESOLVE",
      },
    };

    expect(() => assertNoSilentConflictResolution(invalidConflict)).toThrow(/no puede tener un valor promovido/i);
  });

  it("evalúa el expediente completo y conserva pendientes como bloqueantes", () => {
    const state: CanonicalExpedienteState = {
      id: "REG-SERVICE-007",
      lifecycleState: EstadoExpediente.REVISION_JURIDICA,
      fields: {
        contractType: confirmed("contractType", "SERVICE"),
        object: confirmed("object", "Mantenimiento integral"),
        cpvMain: confirmed("cpvMain", "50700000-2"),
        lots: confirmed("lots", ["L1", "L2", "L3", "L4"]),
        estimatedValueCents: confirmed("estimatedValueCents", 182399114),
        baseTenderBudgetCents: confirmed("baseTenderBudgetCents", 82908688),
        procedure: confirmed("procedure", "OPEN"),
        durationMonths: confirmed("durationMonths", 24),
        extensionMonths: confirmed("extensionMonths", 24),
        modificationPercent: confirmed("modificationPercent", 20),
        awardCriteria: createPendingEvidenceField("awardCriteria"),
        solvency: createPendingEvidenceField("solvency"),
      },
      blockers: [],
      warnings: ["Se preservan diferencias de redondeo declaradas por la fuente."],
    };

    const result = evaluateCanonicalPromotion(state);
    expect(result.promotable).toBe(false);
    expect(result.blockers).toContain("Campo no promocionable: awardCriteria");
    expect(result.blockers).toContain("Campo no promocionable: solvency");
  });
});
