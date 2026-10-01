import { describe, expect, it } from "vitest";
import { evaluateProcedureAndProcessing } from "../src/application/intake/lb109/ProcedureAndProcessingEngine";

const base = {
  contractType: "SUPPLY" as const,
  pblVatIncludedCents: 7_139_000,
  legalEstimatedValueExVatCents: 5_900_000,
  authorityProfile: "OTHER_PUBLIC_ADMINISTRATION" as const,
  recurrentOrForeseeableNeed: false,
  artificialSplittingRisk: false,
  allAwardCriteriaFormulaBased: true,
  judgmentCriteriaPercent: 0,
  processingPreference: "ORDINARY" as const,
};

describe("LB109 · procedimiento y tramitación", () => {
  it("usa valor estimado sin IVA para los umbrales y no el PBL con IVA", () => {
    const result = evaluateProcedureAndProcessing(base);
    expect(result.thresholdBasis).toMatchObject({
      magnitude: "LEGAL_ESTIMATED_VALUE_EX_VAT",
      amountCents: 5_900_000,
      pblVatIncludedCents: 7_139_000,
    });
    expect(result.proposedProcedure).toBe("ABIERTO_SIMPLIFICADO_ABREVIADO");
    expect(result.thresholdBasis.explanation).toContain("excluye el IVA");
  });

  it("descarta el menor si la necesidad es recurrente", () => {
    const result = evaluateProcedureAndProcessing({ ...base, legalEstimatedValueExVatCents: 1_000_000, recurrentOrForeseeableNeed: true });
    expect(result.proposedProcedure).toBe("ABIERTO_SIMPLIFICADO_ABREVIADO");
    expect(result.alternativesDiscarded).toContainEqual(expect.objectContaining({ procedure: "CONTRATO_MENOR" }));
  });

  it("impide ASA para servicios intelectuales y admite el simplificado con límite del 45 %", () => {
    const result = evaluateProcedureAndProcessing({ ...base, contractType: "SERVICE", intellectualService: true, judgmentCriteriaPercent: 40, allAwardCriteriaFormulaBased: false });
    expect(result.proposedProcedure).toBe("ABIERTO_SIMPLIFICADO");
    expect(result.alternativesDiscarded).toContainEqual(expect.objectContaining({ procedure: "ABIERTO_SIMPLIFICADO_ABREVIADO" }));
  });

  it("exige motivación de urgencia y separa la emergencia", () => {
    expect(() => evaluateProcedureAndProcessing({ ...base, processingPreference: "URGENT" })).toThrow(/motivación concreta/);
    const urgent = evaluateProcedureAndProcessing({ ...base, processingPreference: "URGENT", urgencyReasons: "Necesidad inaplazable acreditada por continuidad del servicio." });
    expect(urgent.processingType).toBe("URGENTE");
    const emergency = evaluateProcedureAndProcessing({ ...base, processingPreference: "EMERGENCY_CLAIMED", emergencyFacts: "Daños catastróficos pendientes de acreditación." });
    expect(emergency.processingType).toBe("EMERGENCIA_REQUIERE_EXPEDIENTE_SEPARADO");
    expect(emergency.generationBlocked).toBe(true);
  });

  it("calcula SARA para una Administración autonómica con el umbral vigente", () => {
    expect(evaluateProcedureAndProcessing({ ...base, legalEstimatedValueExVatCents: 21_600_000 }).harmonizedRegulation).toBe(true);
    expect(evaluateProcedureAndProcessing({ ...base, legalEstimatedValueExVatCents: 21_599_999 }).harmonizedRegulation).toBe(false);
  });
});
