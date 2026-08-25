import { describe, expect, it } from "vitest";
import { importEconomicSourceDeclaration } from "../src/domain/economic/UniversalEconomicSourceDeclarationImporter";
import { validateEconomicSourceDeclaration } from "../src/domain/economic/UniversalEconomicSourceDeclarationValidator";
import { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { createPendingEvidenceField, EvidenceField, isPromotableEvidenceField } from "../src/domain/expediente/EvidenceField";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { createUniversalExpedienteFromCanonical } from "../src/domain/expediente/UniversalExpedienteV13";
import { SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_ECONOMICS as CASE007 } from "../src/regression/ServiceRegressionCase007MaintenanceSevilleEconomics";

function validated<T>(key: string, value: T): EvidenceField<T> {
  return {
    key,
    value,
    status: "HUMAN_VALIDATED",
    sources: [{ kind: "USER_INPUT", sourceId: "lb15.8-seed" }],
    humanValidationRequired: true,
    humanValidated: true,
  };
}

function canonical(): CanonicalExpedienteState {
  return {
    id: "LB15-8-MAINTENANCE-007",
    lifecycleState: EstadoExpediente.OBJETO_VALIDADO,
    blockers: [],
    warnings: [],
    fields: {
      contractType: validated("contractType", "SERVICE"),
      object: validated("object", "Mantenimiento de edificios e instalaciones SAE Sevilla"),
      cpvMain: validated("cpvMain", "50700000-2"),
      lots: validated("lots", ["Lote 1", "Lote 2", "Lote 3", "Lote 4"]),
      estimatedValueCents: createPendingEvidenceField("estimatedValueCents"),
      baseTenderBudgetCents: createPendingEvidenceField("baseTenderBudgetCents"),
      procedure: createPendingEvidenceField("procedure"),
      durationMonths: createPendingEvidenceField("durationMonths"),
      extensionMonths: validated("extensionMonths", 24),
      modificationPercent: validated("modificationPercent", 20),
      awardCriteria: createPendingEvidenceField("awardCriteria"),
      solvency: createPendingEvidenceField("solvency"),
      publicity: createPendingEvidenceField("publicity"),
    },
  };
}

function declaration() {
  const source = CASE007.estimatedValue;
  return {
    sourceId: "PCAP:REG-SERVICE-007",
    locator: CASE007.sourceSection,
    contractKind: "SERVICE" as const,
    initialAmountExVatCents: source.declaredTotals.tenderAmountExVatCents,
    extensionAmountExVatCents: source.declaredTotals.extensionCents,
    modificationAmountExVatCents: source.declaredTotals.modificationCents,
    declaredEstimatedValueCents: source.declaredTotals.estimatedValueCents,
    lots: source.lots.map(lot => ({
      lotId: String(lot.lot),
      initialAmountExVatCents: lot.tenderAmountExVatCents,
      extensionAmountExVatCents: lot.extensionCents,
      modificationAmountExVatCents: lot.modificationCents,
      declaredEstimatedValueCents: lot.declaredEstimatedValueCents,
    })),
    vatPercent: 21,
    budgetApplication: CASE007.annualitiesVatIncluded.budgetApplication,
    annualities: CASE007.annualitiesVatIncluded.rows.map(row => ({
      year: row.year,
      amountCents: row.amountCents,
      vatIncluded: true,
    })),
    annualitiesDeclaredTotalCents: CASE007.annualitiesVatIncluded.declaredTotalCents,
  };
}

function imported() {
  return importEconomicSourceDeclaration(createUniversalExpedienteFromCanonical(canonical()), declaration()).expediente;
}

describe("Bloque 15.8 - validación humana del paquete económico declarado", () => {
  it("promociona de forma conjunta las declaraciones económicas de la misma fuente tras validación humana expresa", () => {
    const result = validateEconomicSourceDeclaration(imported(), {
      sourceId: "PCAP:REG-SERVICE-007",
      validatedBy: "TECNICO-001",
    });

    expect(result.blockers).toEqual([]);
    expect(result.validatedFields).toContain("economic.initialEstimatedValueBaseCents");
    expect(result.validatedFields).toContain("economic.legalEstimatedValueCents");
    expect(result.validatedFields).toContain("estimatedValueCents");
    expect(result.validatedFields).toContain("baseTenderBudgetCents");
    expect(result.expediente.economic.legalEstimatedValueCents.status).toBe("HUMAN_VALIDATED");
    expect(result.expediente.economic.legalEstimatedValueCents.humanValidated).toBe(true);
    expect(result.expediente.canonical.fields.estimatedValueCents.status).toBe("HUMAN_VALIDATED");
    expect(isPromotableEvidenceField(result.expediente.economic.legalEstimatedValueCents)).toBe(true);
    expect(isPromotableEvidenceField(result.expediente.canonical.fields.estimatedValueCents)).toBe(true);
  });

  it("conserva los valores exactos declarados y no elimina los diagnósticos de redondeo", () => {
    const result = validateEconomicSourceDeclaration(imported(), {
      sourceId: "PCAP:REG-SERVICE-007",
      validatedBy: "TECNICO-001",
    });

    expect(result.expediente.economic.legalEstimatedValueCents.value).toBe(182_399_114);
    expect(result.expediente.canonical.fields.estimatedValueCents.value).toBe(182_399_114);
    expect(result.expediente.economic.legalEstimatedValueCents.diagnostics?.some(item => item.includes("PRESERVE_DECLARED_VALUE_DO_NOT_AUTOCORRECT"))).toBe(true);
    expect(result.expediente.economic.legalEstimatedValueCents.diagnostics?.some(item => item.includes("validada humanamente"))).toBe(true);
  });

  it("registra la identidad funcional de quien valida sin sustituir la fuente documental original", () => {
    const result = validateEconomicSourceDeclaration(imported(), {
      sourceId: "PCAP:REG-SERVICE-007",
      validatedBy: "TECNICO-001",
    });

    const sources = result.expediente.economic.legalEstimatedValueCents.sources;
    expect(sources.some(source => source.kind === "PRIMARY_DOCUMENT" && source.sourceId === "PCAP:REG-SERVICE-007")).toBe(true);
    expect(sources.some(source => source.kind === "USER_INPUT" && source.sourceId === "human-validation:TECNICO-001")).toBe(true);
    expect(result.expediente.traceability.sourceRegistry.some(source => source.sourceId === "human-validation:TECNICO-001")).toBe(true);
  });

  it("bloquea la validación si la vista canónica y la autoridad económica contienen valores distintos para el mismo VE", () => {
    const expediente = imported();
    expediente.canonical.fields.estimatedValueCents = {
      ...expediente.canonical.fields.estimatedValueCents,
      value: 182_399_116,
    };

    const result = validateEconomicSourceDeclaration(expediente, {
      sourceId: "PCAP:REG-SERVICE-007",
      validatedBy: "TECNICO-001",
    });

    expect(result.validatedFields).toEqual([]);
    expect(result.blockers.some(item => item.includes("Inconsistencia de valor estimado"))).toBe(true);
    expect(result.expediente.economic.legalEstimatedValueCents.status).toBe("SOURCE_DECLARED");
    expect(result.expediente.canonical.fields.estimatedValueCents.status).toBe("SOURCE_DECLARED");
  });

  it("no utiliza el cierre económico para resolver un conflicto de fuente", () => {
    const expediente = imported();
    expediente.economic.legalEstimatedValueCents = {
      key: "economic.legalEstimatedValueCents",
      value: null,
      status: "SOURCE_CONFLICT",
      sources: [
        { kind: "PRIMARY_DOCUMENT", sourceId: "PCAP:REG-SERVICE-007" },
        { kind: "PRIMARY_DOCUMENT", sourceId: "MEMORIA:REG-SERVICE-007" },
      ],
      humanValidationRequired: true,
      humanValidated: false,
      conflict: { statements: ["1.823.991,14", "1.823.991,16"], treatment: "DO_NOT_AUTO_RESOLVE" },
    };

    const result = validateEconomicSourceDeclaration(expediente, {
      sourceId: "PCAP:REG-SERVICE-007",
      validatedBy: "TECNICO-001",
    });

    expect(result.validatedFields).toEqual([]);
    expect(result.blockers.some(item => item.includes("conflicto de fuente"))).toBe(true);
    expect(result.expediente.economic.legalEstimatedValueCents.status).toBe("SOURCE_CONFLICT");
    expect(result.expediente.economic.legalEstimatedValueCents.value).toBeNull();
  });

  it("no valida paquetes sin identificar la fuente y la persona responsable", () => {
    const expediente = imported();
    const noSource = validateEconomicSourceDeclaration(expediente, { sourceId: "", validatedBy: "TECNICO-001" });
    const noValidator = validateEconomicSourceDeclaration(expediente, { sourceId: "PCAP:REG-SERVICE-007", validatedBy: "" });

    expect(noSource.validatedFields).toEqual([]);
    expect(noSource.blockers[0]).toContain("fuente económica");
    expect(noValidator.validatedFields).toEqual([]);
    expect(noValidator.blockers[0]).toContain("persona");
  });
});
