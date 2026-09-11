import { describe, expect, it } from "vitest";
import { evaluateUniversalDocumentGeneration } from "../src/engines/UniversalDocumentGenerationGate";
import { createStandardContractDocumentProfiles } from "../src/domain/documentModel/StandardContractDocumentProfiles";
import { DocumentType } from "../src/domain/documentModel/DocumentType";
import { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { createUniversalExpedienteFromCanonical } from "../src/domain/expediente/UniversalExpedienteV13";
import { EvidenceField } from "../src/domain/expediente/EvidenceField";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";

const confirmed = <T>(key: string, value: T): EvidenceField<T> => ({ key, value, status: "SOURCE_CONFIRMED", sources: [{ kind: "PRIMARY_DOCUMENT", sourceId: "test" }], humanValidationRequired: false, humanValidated: false });

function completeWorks() {
  const canonical: CanonicalExpedienteState = {
    id: "WORKS-GATE",
    lifecycleState: EstadoExpediente.BORRADOR,
    fields: {
      contractType: confirmed("contractType", "WORKS" as const), object: confirmed("object", "Obras de adecuación"), cpvMain: confirmed("cpvMain", "45000000-7"), lots: confirmed("lots", [] as readonly string[]),
      estimatedValueCents: confirmed("estimatedValueCents", 40_000_000), baseTenderBudgetCents: confirmed("baseTenderBudgetCents", 40_000_000), procedure: confirmed("procedure", "ABIERTO"), durationMonths: confirmed("durationMonths", 12), extensionMonths: confirmed("extensionMonths", 0), modificationPercent: confirmed("modificationPercent", 0), awardCriteria: confirmed("awardCriteria", ["precio"] as readonly string[]), solvency: confirmed("solvency", [] as readonly string[]), publicity: confirmed("publicity", "perfil"),
    }, blockers: [], warnings: [],
  };
  const e = createUniversalExpedienteFromCanonical(canonical);
  e.processing = { processingType: confirmed("processing.processingType", "ORDINARIA"), urgency: confirmed("processing.urgency", false), emergency: confirmed("processing.emergency", false) };
  e.regulation = { harmonizedRegulation: confirmed("regulation.harmonizedRegulation", false), europeanFunding: confirmed("regulation.europeanFunding", false), threshold: confirmed("regulation.threshold", 5_538_000), deadlines: confirmed("regulation.deadlines", { ofertasDias: 15, adjudicacionDias: 15, formalizacionDias: 15, subsanacionDias: 3, recursoDias: 0, ejecucionDias: 365, justificacion: "test", normativa: "LCSP", articulo: "156", confidence: 1 }) };
  e.economic = { ...e.economic, vatPercent: confirmed("economic.vatPercent", 21), budgetApplication: confirmed("economic.budgetApplication", "01"), annualities: confirmed("economic.annualities", []), fundingSource: confirmed("economic.fundingSource", "AUTO"), priceRevisionRegime: confirmed("economic.priceRevisionRegime", "NO"), unitPrices: confirmed("economic.unitPrices", []), initialEstimatedValueBaseCents: confirmed("economic.initialEstimatedValueBaseCents", 40_000_000), extensionAmountExVatCents: confirmed("economic.extensionAmountExVatCents", 0), modificationAmountExVatCents: confirmed("economic.modificationAmountExVatCents", 0), optionsAmountExVatCents: confirmed("economic.optionsAmountExVatCents", 0), otherEstimatedValueComponentsCents: confirmed("economic.otherEstimatedValueComponentsCents", 0), legalEstimatedValueCents: confirmed("economic.legalEstimatedValueCents", 40_000_000) };
  e.administrative = { contractingAuthority: confirmed("administrative.contractingAuthority", "Junta"), promotingUnit: confirmed("administrative.promotingUnit", "Unidad"), competentBody: confirmed("administrative.competentBody", "Órgano"), administrativeFileNumber: confirmed("administrative.administrativeFileNumber", "EXP"), contractManager: confirmed("administrative.contractManager", "Responsable") };
  e.lots = { divisionIntoLots: confirmed("lots.divisionIntoLots", false), lots: confirmed("lots.lots", []), maxOfferableLots: confirmed("lots.maxOfferableLots", 1), maxAwardableLots: confirmed("lots.maxAwardableLots", 1) };
  e.guarantees = { provisionalGuaranteeRequired: confirmed("guarantees.provisionalGuaranteeRequired", false), provisionalGuaranteePercent: confirmed("guarantees.provisionalGuaranteePercent", 0), definitiveGuaranteePercent: confirmed("guarantees.definitiveGuaranteePercent", 5), complementaryGuaranteePercent: confirmed("guarantees.complementaryGuaranteePercent", 0) };
  e.execution = { specialExecutionConditions: confirmed("execution.specialExecutionConditions", ["condición"]), specificPenalties: confirmed("execution.specificPenalties", []), subcontractingRegime: confirmed("execution.subcontractingRegime", "LCSP"), assignmentRegime: confirmed("execution.assignmentRegime", "LCSP"), paymentRegime: confirmed("execution.paymentRegime", "certificaciones"), receiptAndAcceptanceRegime: confirmed("execution.receiptAndAcceptanceRegime", "recepción") };
  e.criteria = { awardCriteria: confirmed("criteria.awardCriteria", []), economicSolvency: confirmed("criteria.economicSolvency", []), technicalSolvency: confirmed("criteria.technicalSolvency", []), judgmentCriteriaExist: confirmed("criteria.judgmentCriteriaExist", false) };
  return e;
}

describe("LB91.16 - gate familiar integrado en generación", () => {
  it("bloquea obras aunque los dominios universales estén completos si falta preparación específica", () => {
    const result = evaluateUniversalDocumentGeneration(completeWorks(), DocumentType.PCAP, createStandardContractDocumentProfiles(), "STRUCTURAL_MODEL");
    expect(result.ready).toBe(false);
    expect(result.blockers.some(item => item.includes("hechos específicos"))).toBe(true);
  });

  it("supera la guarda familiar con proyecto/replanteo válidos, aunque el perfil siga sin habilitar generación completa", () => {
    const result = evaluateUniversalDocumentGeneration(
      completeWorks(), DocumentType.PCAP, createStandardContractDocumentProfiles(), "STRUCTURAL_MODEL",
      { contractType: "WORKS", works: { projectPrepared: true, projectApproved: true, projectReplanted: true, baseTenderBudgetExVatCents: 40_000_000, supervisionReportAvailable: false, landAvailabilityConfirmed: true } },
    );
    expect(result.blockers.some(item => item.includes("hechos específicos"))).toBe(false);
    expect(result.selection.status).toBe("SELECTED");
  });
});
