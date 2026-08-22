import { describe, expect, it } from "vitest";
import { UniversalHarmonizedRegulationResolver, HarmonizedThresholdRule } from "../src/domain/legal/modules/harmonized/UniversalHarmonizedRegulationResolver";
import { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { createPendingEvidenceField, EvidenceField } from "../src/domain/expediente/EvidenceField";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { createUniversalExpedienteFromCanonical, UniversalExpedienteV13 } from "../src/domain/expediente/UniversalExpedienteV13";

function validated<T>(key: string, value: T): EvidenceField<T> {
  return {
    key,
    value,
    status: "HUMAN_VALIDATED",
    sources: [{ kind: "USER_INPUT", sourceId: "human-validation:lb15.10" }],
    humanValidationRequired: true,
    humanValidated: true,
  };
}

function expediente(veCents = 182_399_114): UniversalExpedienteV13 {
  const canonical: CanonicalExpedienteState = {
    id: "LB15-10-SARA",
    lifecycleState: EstadoExpediente.VALOR_VALIDADO,
    blockers: [],
    warnings: [],
    fields: {
      contractType: validated("contractType", "SERVICE"),
      object: validated("object", "Servicio de prueba"),
      cpvMain: validated("cpvMain", "50700000-2"),
      lots: validated("lots", ["Lote 1"]),
      estimatedValueCents: validated("estimatedValueCents", veCents),
      baseTenderBudgetCents: validated("baseTenderBudgetCents", 80_000_000),
      procedure: validated("procedure", "ABIERTO"),
      durationMonths: validated("durationMonths", 24),
      extensionMonths: validated("extensionMonths", 0),
      modificationPercent: validated("modificationPercent", 0),
      awardCriteria: createPendingEvidenceField("awardCriteria"),
      solvency: createPendingEvidenceField("solvency"),
      publicity: createPendingEvidenceField("publicity"),
    },
  };
  const result = createUniversalExpedienteFromCanonical(canonical);
  result.economic.legalEstimatedValueCents = validated("economic.legalEstimatedValueCents", veCents);
  return result;
}

function rule(thresholdCents = 100_000_000): HarmonizedThresholdRule {
  return {
    id: "FIXTURE-SARA-001",
    contractKinds: ["SERVICE"],
    thresholdCents,
    sourceId: "normative-fixture:sara-threshold",
    locator: "fixture",
    legalBasis: ["Norma de prueba"],
    scopeConfirmed: true,
    scopeDescription: "Ámbito de contratación de servicios y exclusiones contrastados para la prueba.",
  };
}

describe("Bloque 15.10 - resolución SARA guiada por fuente normativa", () => {
  it("propone SARA cuando el VE validado alcanza el umbral aportado", () => {
    const result = new UniversalHarmonizedRegulationResolver().resolve(expediente(), rule());
    expect(result.blockers).toEqual([]);
    expect(result.proposed).toBe(true);
    expect(result.expediente.regulation.harmonizedRegulation.value).toBe(true);
    expect(result.expediente.regulation.harmonizedRegulation.status).toBe("SYSTEM_PROPOSAL");
    expect(result.expediente.regulation.harmonizedRegulation.humanValidationRequired).toBe(true);
    expect(result.expediente.regulation.threshold.value).toBe(1_000_000);
    expect(result.expediente.regulation.threshold.status).toBe("SYSTEM_PROPOSAL");
  });

  it("propone no SARA si la regla aportada fija un umbral superior", () => {
    const result = new UniversalHarmonizedRegulationResolver().resolve(expediente(), rule(200_000_000));
    expect(result.blockers).toEqual([]);
    expect(result.expediente.regulation.harmonizedRegulation.value).toBe(false);
  });

  it("demuestra que el umbral no está codificado: dos reglas producen decisiones distintas para el mismo VE", () => {
    const resolver = new UniversalHarmonizedRegulationResolver();
    const yes = resolver.resolve(expediente(), rule(100_000_000));
    const no = resolver.resolve(expediente(), rule(200_000_000));
    expect(yes.expediente.regulation.harmonizedRegulation.value).toBe(true);
    expect(no.expediente.regulation.harmonizedRegulation.value).toBe(false);
  });

  it("bloquea cuando el ámbito jurídico de la regla no está confirmado", () => {
    const unsafe = { ...rule(), scopeConfirmed: false };
    const result = new UniversalHarmonizedRegulationResolver().resolve(expediente(), unsafe);
    expect(result.proposed).toBe(false);
    expect(result.blockers.join(" ")).toContain("no está confirmado");
    expect(result.expediente.regulation.harmonizedRegulation.status).toBe("PENDING");
  });

  it("bloquea una regla que no cubre el tipo contractual", () => {
    const incompatible = { ...rule(), contractKinds: ["SUPPLY" as const] };
    const result = new UniversalHarmonizedRegulationResolver().resolve(expediente(), incompatible);
    expect(result.proposed).toBe(false);
    expect(result.blockers.join(" ")).toContain("no cubre el tipo contractual SERVICE");
  });

  it("exige que ambas vistas del VE estén validadas y coincidan", () => {
    const input = expediente();
    input.economic.legalEstimatedValueCents = validated("economic.legalEstimatedValueCents", 182_399_116);
    const result = new UniversalHarmonizedRegulationResolver().resolve(input, rule());
    expect(result.proposed).toBe(false);
    expect(result.blockers.join(" ")).toContain("divergen");
  });

  it("preserva un conflicto de fuente SARA y nunca lo sustituye", () => {
    const input = expediente();
    input.regulation.harmonizedRegulation = {
      key: "regulation.harmonizedRegulation",
      value: null,
      status: "SOURCE_CONFLICT",
      sources: [{ kind: "PRIMARY_DOCUMENT", sourceId: "PCAP-A" }, { kind: "PRIMARY_DOCUMENT", sourceId: "PCAP-B" }],
      humanValidationRequired: true,
      humanValidated: false,
      conflict: { statements: ["SARA", "NO SARA"], treatment: "DO_NOT_AUTO_RESOLVE" },
    };
    const result = new UniversalHarmonizedRegulationResolver().resolve(input, rule());
    expect(result.proposed).toBe(false);
    expect(result.expediente.regulation.harmonizedRegulation.status).toBe("SOURCE_CONFLICT");
    expect(result.expediente.regulation.harmonizedRegulation.value).toBeNull();
  });
});
