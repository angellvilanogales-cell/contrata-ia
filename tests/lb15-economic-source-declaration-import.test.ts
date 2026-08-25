import { describe, expect, it } from "vitest";
import { importEconomicSourceDeclaration } from "../src/domain/economic/UniversalEconomicSourceDeclarationImporter";
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
    sources: [{ kind: "USER_INPUT", sourceId: "lb15.7" }],
    humanValidationRequired: true,
    humanValidated: true,
  };
}

function canonical(): CanonicalExpedienteState {
  return {
    id: "LB15-7-MAINTENANCE-007",
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

describe("Bloque 15.7 - incorporación universal de declaraciones económicas de fuente", () => {
  it("incorpora PBL, VE, prórroga, modificación y anualidades como declaraciones de fuente no promocionadas", () => {
    const expediente = createUniversalExpedienteFromCanonical(canonical());
    const result = importEconomicSourceDeclaration(expediente, declaration());

    expect(result.blockers).toEqual([]);
    expect(result.expediente.economic.initialEstimatedValueBaseCents.value).toBe(82_908_688);
    expect(result.expediente.economic.extensionAmountExVatCents.value).toBe(82_908_688);
    expect(result.expediente.economic.modificationAmountExVatCents.value).toBe(16_581_738);
    expect(result.expediente.economic.legalEstimatedValueCents.value).toBe(182_399_114);
    expect(result.expediente.canonical.fields.baseTenderBudgetCents.value).toBe(82_908_688);
    expect(result.expediente.canonical.fields.estimatedValueCents.value).toBe(182_399_114);
    expect(result.expediente.economic.annualities.value).toHaveLength(12);
    expect(result.expediente.economic.budgetApplication.value).toBe("1439030000 G/32L/21200/41 01");

    for (const field of [
      result.expediente.economic.initialEstimatedValueBaseCents,
      result.expediente.economic.extensionAmountExVatCents,
      result.expediente.economic.modificationAmountExVatCents,
      result.expediente.economic.legalEstimatedValueCents,
      result.expediente.canonical.fields.baseTenderBudgetCents,
      result.expediente.canonical.fields.estimatedValueCents,
    ]) {
      expect(field.status).toBe("SOURCE_DECLARED");
      expect(field.humanValidationRequired).toBe(true);
      expect(field.humanValidated).toBe(false);
      expect(isPromotableEvidenceField(field)).toBe(false);
    }
  });

  it("preserva exactamente el VE declarado y mantiene las diferencias de redondeo por lote como diagnóstico", () => {
    const result = importEconomicSourceDeclaration(createUniversalExpedienteFromCanonical(canonical()), declaration());

    expect(result.calculation.selectedEstimatedValueCents).toBe(182_399_114);
    expect(result.calculation.selectedValueOrigin).toBe("DECLARED_SOURCE");
    expect(result.calculation.lots[1].arithmeticEstimatedValueCents).toBe(22_543_525);
    expect(result.calculation.lots[1].declaredEstimatedValueCents).toBe(22_543_526);
    expect(result.calculation.lots[1].diagnostic?.declaredMinusArithmeticCents).toBe(1);
    expect(result.calculation.lots[3].diagnostic?.declaredMinusArithmeticCents).toBe(1);
    expect(result.calculation.lotDeclaredSumCents).toBe(182_399_116);
    expect(result.calculation.lotDeclaredSumDiagnostic?.declaredMinusArithmeticCents).toBe(-2);
    expect(result.expediente.economic.legalEstimatedValueCents.diagnostics?.some(item => item.includes("PRESERVE_DECLARED_VALUE_DO_NOT_AUTOCORRECT"))).toBe(true);
  });

  it("audita las anualidades sin alterar el total declarado por la fuente", () => {
    const result = importEconomicSourceDeclaration(createUniversalExpedienteFromCanonical(canonical()), declaration());

    expect(result.annualityAudit?.arithmeticTotalCents).toBe(100_319_513);
    expect(result.annualityAudit?.selectedTotalCents).toBe(100_319_513);
    expect(result.annualityAudit?.selectedValueOrigin).toBe("DECLARED_SOURCE");
    expect(result.annualityAudit?.allRowsVatIncluded).toBe(true);
    expect(result.annualityAudit?.years).toEqual([2026, 2027, 2028]);
  });

  it("no sobrescribe un VE ya validado humanamente", () => {
    const expediente = createUniversalExpedienteFromCanonical(canonical());
    expediente.economic.legalEstimatedValueCents = validated("economic.legalEstimatedValueCents", 999_999);

    const result = importEconomicSourceDeclaration(expediente, declaration());

    expect(result.expediente.economic.legalEstimatedValueCents.value).toBe(999_999);
    expect(result.expediente.economic.legalEstimatedValueCents.status).toBe("HUMAN_VALIDATED");
    expect(result.blockers.some(item => item.includes("legalEstimatedValueCents") && item.includes("no puede sobrescribirse"))).toBe(true);
  });

  it("mantiene bloqueado un conflicto de fuente preexistente y no lo resuelve con la nueva declaración", () => {
    const expediente = createUniversalExpedienteFromCanonical(canonical());
    expediente.canonical.fields.estimatedValueCents = {
      key: "estimatedValueCents",
      value: null,
      status: "SOURCE_CONFLICT",
      sources: [
        { kind: "PRIMARY_DOCUMENT", sourceId: "PCAP" },
        { kind: "PRIMARY_DOCUMENT", sourceId: "MEMORIA" },
      ],
      humanValidationRequired: true,
      humanValidated: false,
      conflict: { statements: ["1823991,14", "1823991,16"], treatment: "DO_NOT_AUTO_RESOLVE" },
    };

    const result = importEconomicSourceDeclaration(expediente, declaration());

    expect(result.expediente.canonical.fields.estimatedValueCents.status).toBe("SOURCE_CONFLICT");
    expect(result.expediente.canonical.fields.estimatedValueCents.value).toBeNull();
    expect(result.blockers.some(item => item.includes("conflicto de fuente"))).toBe(true);
  });

  it("rechaza la importación si la declaración económica pertenece a otra naturaleza contractual", () => {
    const expediente = createUniversalExpedienteFromCanonical(canonical());
    const result = importEconomicSourceDeclaration(expediente, { ...declaration(), contractKind: "SUPPLY" });

    expect(result.importedFields).toEqual([]);
    expect(result.blockers[0]).toContain("no coincide");
    expect(result.expediente.economic.legalEstimatedValueCents.status).toBe("PENDING");
  });
});
