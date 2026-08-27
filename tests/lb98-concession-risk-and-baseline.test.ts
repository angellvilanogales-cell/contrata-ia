import { describe, expect, it } from "vitest";
import { evaluateConcessionPhysicalBaseline, LB98_CONCESSION_REAL_CASES } from "../src/application/intake/lb98/ConcessionPhysicalBaseline";
import { evaluateConcessionRiskOperational } from "../src/application/intake/lb98/ConcessionRiskOperationalGate";
import { evaluateConcessionViabilityContent } from "../src/application/intake/lb98/ConcessionViabilityContentGate";
import { evaluateConcessionVerticalClosure } from "../src/application/intake/lb98/ConcessionVerticalClosureGate";

const validRisk = () => evaluateConcessionRiskOperational({
  subtype: "SERVICE_CONCESSION",
  viabilityStudyApproved: true,
  viabilityStudyConcludesViable: true,
  demandRiskTransferred: true,
  supplyRiskTransferred: false,
  marketExposureReal: true,
  recoveryOfInvestmentGuaranteed: false,
  recoveryOfCostsGuaranteed: false,
  estimatedPotentialLossMoreThanNominal: true,
  concessionRevenueModelDefined: true,
  netPresentValueAnalysisAvailable: true,
  stateAidRelevant: false,
  stateAidCompatibilityAddressed: false,
});

const validViability = () => evaluateConcessionViabilityContent({
  subtype: "SERVICE_CONCESSION",
  concessionChoiceJustification: true,
  demandForecast: true,
  investmentAndFinancingPlan: true,
  operatingCostRevenueModel: true,
  netPresentValueAndDiscountRate: true,
  riskAllocationMatrix: true,
  stateAidResolved: true,
});

describe("LB98 Concession baseline, riesgo y cierre", () => {
  it("registra Puerto Real como caso real completo pero no como modelo general", () => {
    expect(LB98_CONCESSION_REAL_CASES).toHaveLength(1);
    const real = LB98_CONCESSION_REAL_CASES[0]!;
    expect(real.subtype).toBe("SERVICE_CONCESSION");
    expect(real.hasPcap && real.hasPpt && real.hasMemory && real.hasViabilityStudy).toBe(true);
    expect(real.generalizable).toBe(false);
    expect(real.editableBinaryVerified).toBe(false);
    const baseline = evaluateConcessionPhysicalBaseline();
    expect(baseline.completeRealCaseLocated).toBe(true);
    expect(baseline.generalOfficialTemplateAvailable).toBe(false);
    expect(baseline.engineeringClosed).toBe(false);
  });

  it("admite la calificación solo con riesgo operacional real y viabilidad", () => {
    const result = validRisk();
    expect(result.operationalRiskTransferred).toBe(true);
    expect(result.viabilityReady).toBe(true);
    expect(result.concessionQualificationSupported).toBe(true);
  });

  it("no confunde riesgo y ventura ordinario con riesgo operacional", () => {
    const result = evaluateConcessionRiskOperational({
      subtype: "SERVICE_CONCESSION", viabilityStudyApproved: true, viabilityStudyConcludesViable: true,
      demandRiskTransferred: false, supplyRiskTransferred: false, marketExposureReal: false,
      recoveryOfInvestmentGuaranteed: false, recoveryOfCostsGuaranteed: false,
      estimatedPotentialLossMoreThanNominal: false, concessionRevenueModelDefined: true,
      netPresentValueAnalysisAvailable: true, stateAidRelevant: false, stateAidCompatibilityAddressed: false,
    });
    expect(result.concessionQualificationSupported).toBe(false);
    expect(result.blockers.join(" ")).toContain("demanda");
    expect(result.blockers.join(" ")).toContain("incertidumbres del mercado");
  });

  it("bloquea recuperación garantizada de inversión o costes", () => {
    const result = evaluateConcessionRiskOperational({
      subtype: "SERVICE_CONCESSION", viabilityStudyApproved: true, viabilityStudyConcludesViable: true,
      demandRiskTransferred: true, supplyRiskTransferred: false, marketExposureReal: true,
      recoveryOfInvestmentGuaranteed: true, recoveryOfCostsGuaranteed: true,
      estimatedPotentialLossMoreThanNominal: true, concessionRevenueModelDefined: true,
      netPresentValueAnalysisAvailable: true, stateAidRelevant: false, stateAidCompatibilityAddressed: false,
    });
    expect(result.concessionQualificationSupported).toBe(false);
    expect(result.blockers.join(" ")).toContain("recuperación garantizada");
  });

  it("bloquea si el estudio concluye inviabilidad", () => {
    const result = evaluateConcessionRiskOperational({
      subtype: "SERVICE_CONCESSION", viabilityStudyApproved: true, viabilityStudyConcludesViable: false,
      demandRiskTransferred: true, supplyRiskTransferred: false, marketExposureReal: true,
      recoveryOfInvestmentGuaranteed: false, recoveryOfCostsGuaranteed: false,
      estimatedPotentialLossMoreThanNominal: true, concessionRevenueModelDefined: true,
      netPresentValueAnalysisAvailable: true, stateAidRelevant: false, stateAidCompatibilityAddressed: false,
    });
    expect(result.viabilityReady).toBe(false);
    expect(result.blockers.join(" ")).toContain("inviabilidad");
  });

  it("bloquea ayuda de Estado no analizada", () => {
    const result = evaluateConcessionRiskOperational({
      subtype: "SERVICE_CONCESSION", viabilityStudyApproved: true, viabilityStudyConcludesViable: true,
      demandRiskTransferred: true, supplyRiskTransferred: false, marketExposureReal: true,
      recoveryOfInvestmentGuaranteed: false, recoveryOfCostsGuaranteed: false,
      estimatedPotentialLossMoreThanNominal: true, concessionRevenueModelDefined: true,
      netPresentValueAnalysisAvailable: true, stateAidRelevant: true, stateAidCompatibilityAddressed: false,
    });
    expect(result.concessionQualificationSupported).toBe(false);
    expect(result.blockers.join(" ")).toContain("ayuda de Estado");
  });

  it("no cierra aunque riesgo y viabilidad sean correctos mientras falten activos y E2E", () => {
    const closure = evaluateConcessionVerticalClosure({
      realCaseEvidenceReady: true,
      risk: validRisk(), viabilityContent: validViability(),
      pcapAvailable: false, memoryAvailable: false, pptAvailable: false, viabilityTemplateAvailable: false,
      packageGeneratorReady: false, e2eReady: false,
    });
    expect(closure.operationalRiskReady).toBe(true);
    expect(closure.viabilityContentReady).toBe(true);
    expect(closure.engineeringClosed).toBe(false);
    expect(closure.productionReady).toBe(false);
  });
});
