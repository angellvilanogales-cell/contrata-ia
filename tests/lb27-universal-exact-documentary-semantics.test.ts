import { describe, expect, it } from "vitest";
import { qualifyRealTemplateMapping, RealTemplateMappingProfile, RealTemplateSourceEvidence } from "../src/application/intake/lb22/UniversalRealTemplateMappingRegistry";
import { UniversalEconomicEvidence, UniversalExecutionEvidence, UniversalLotsEvidence } from "../src/domain/expediente/UniversalExpedienteDomains";
import { createPendingEvidenceField } from "../src/domain/expediente/EvidenceField";

const source: RealTemplateSourceEvidence = {
  sourceId: "official:test:odt",
  locator: "https://example.invalid/model.odt",
  fileName: "model.odt",
  mediaType: "application/vnd.oasis.opendocument.text",
  qualification: "OFFICIAL_EDITABLE_ORIGINAL",
  officialModelStatement: "Modelo oficial editable de prueba",
  humanValidated: true,
  validatedBy: "LB27_TEST",
};

describe("LB27 - semántica documental exacta", () => {
  it("admite campos propios para DA33, no división, método VE y modificación sin equivalencias aproximadas", () => {
    const profile: RealTemplateMappingProfile = {
      profileId: "lb27:test",
      contractType: "SUPPLY",
      documentKind: "PCAP",
      templateFamilyId: "TEST",
      templateId: "TEST-ODT",
      sourceId: source.sourceId,
      evidenceLocators: ["ANEXO I"],
      slots: [
        { slotId: "s1", fieldKey: "lots.noDivisionJustification", required: true, sourceSection: "1.A", sourceLabel: "Justificación no división" },
        { slotId: "s2", fieldKey: "economic.needsBasedContractDa33", required: true, sourceSection: "1.C", sourceLabel: "DA 33ª" },
        { slotId: "s3", fieldKey: "economic.budgetCoversEntireContractLife", required: true, sourceSection: "2.A", sourceLabel: "Presupuesto máximo toda vigencia" },
        { slotId: "s4", fieldKey: "economic.estimatedValueCalculationMethod", required: true, sourceSection: "2.B", sourceLabel: "Método cálculo VE" },
        { slotId: "s5", fieldKey: "economic.priceDeterminationRegime", required: true, sourceSection: "2.C", sourceLabel: "Sistema precio" },
        { slotId: "s6", fieldKey: "execution.extensionStructure", required: true, sourceSection: "3", sourceLabel: "Estructura prórrogas" },
        { slotId: "s7", fieldKey: "execution.extensionNoticeMonths", required: true, sourceSection: "3", sourceLabel: "Preaviso" },
        { slotId: "s8", fieldKey: "execution.plannedModificationRegime", required: true, sourceSection: "14", sourceLabel: "Modificación prevista" },
        { slotId: "s9", fieldKey: "criteria.singleCriterionMotivation", required: true, sourceSection: "7", sourceLabel: "Motivación criterio único" },
      ],
    };

    const result = qualifyRealTemplateMapping(profile, [source]);
    expect(result.structurallyVerified).toBe(true);
    expect(result.productionEligible).toBe(true);
    expect(result.blockers).toEqual([]);
    expect(result.mappingSpec?.slots).toHaveLength(9);
  });

  it("mantiene los nuevos campos opcionales para no romper expedientes universales anteriores", () => {
    const economic = {
      vatPercent: createPendingEvidenceField<number>("economic.vatPercent"),
      budgetApplication: createPendingEvidenceField<string>("economic.budgetApplication"),
      annualities: createPendingEvidenceField("economic.annualities"),
      fundingSource: createPendingEvidenceField<string>("economic.fundingSource"),
      priceRevisionRegime: createPendingEvidenceField<string>("economic.priceRevisionRegime"),
      unitPrices: createPendingEvidenceField("economic.unitPrices"),
      referenceConsumption: createPendingEvidenceField<string>("economic.referenceConsumption"),
      projectedConsumption: createPendingEvidenceField<string>("economic.projectedConsumption"),
      maximumApprovedBudgetCents: createPendingEvidenceField<number>("economic.maximumApprovedBudgetCents"),
      initialEstimatedValueBaseCents: createPendingEvidenceField<number>("economic.initialEstimatedValueBaseCents"),
      extensionAmountExVatCents: createPendingEvidenceField<number>("economic.extensionAmountExVatCents"),
      modificationAmountExVatCents: createPendingEvidenceField<number>("economic.modificationAmountExVatCents"),
      optionsAmountExVatCents: createPendingEvidenceField<number>("economic.optionsAmountExVatCents"),
      otherEstimatedValueComponentsCents: createPendingEvidenceField<number>("economic.otherEstimatedValueComponentsCents"),
      legalEstimatedValueCents: createPendingEvidenceField<number>("economic.legalEstimatedValueCents"),
    } satisfies UniversalEconomicEvidence;

    const lots = {
      divisionIntoLots: createPendingEvidenceField<boolean>("lots.divisionIntoLots"),
      lots: createPendingEvidenceField("lots.lots"),
      maxOfferableLots: createPendingEvidenceField<number>("lots.maxOfferableLots"),
      maxAwardableLots: createPendingEvidenceField<number>("lots.maxAwardableLots"),
    } satisfies UniversalLotsEvidence;

    const execution = {
      specialExecutionConditions: createPendingEvidenceField("execution.specialExecutionConditions"),
      specificPenalties: createPendingEvidenceField("execution.specificPenalties"),
      subcontractingRegime: createPendingEvidenceField<string>("execution.subcontractingRegime"),
      assignmentRegime: createPendingEvidenceField<string>("execution.assignmentRegime"),
      paymentRegime: createPendingEvidenceField<string>("execution.paymentRegime"),
      receiptAndAcceptanceRegime: createPendingEvidenceField<string>("execution.receiptAndAcceptanceRegime"),
    } satisfies UniversalExecutionEvidence;

    expect(economic.needsBasedContractDa33).toBeUndefined();
    expect(lots.noDivisionJustification).toBeUndefined();
    expect(execution.plannedModificationRegime).toBeUndefined();
  });
});
