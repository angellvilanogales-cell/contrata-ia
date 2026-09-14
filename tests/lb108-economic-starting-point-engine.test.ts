import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { evaluateEconomicStartingPoint } from "../src/application/intake/lb108/EconomicStartingPointEngine";
import { UniversalEvidenceWorkspace } from "../src/application/intake/lb52/UniversalEvidenceWorkspace";

describe("LB108 · punto de partida económico y propuesta condicionada", () => {
  it("separa el límite con IVA del valor estimado sin IVA", () => {
    const result = evaluateEconomicStartingPoint({
      startingPoint: "KNOWN_CREDIT_LIMIT",
      contractType: "SUPPLY",
      grossCreditLimitCents: 1_210_000,
      vatRatePercent: 21,
      creditScope: "ENTIRE_CONTRACT_LIFE",
      initialDurationMonths: 24,
      extensionMonths: 24,
      plannedModificationPercent: 20,
      optionsAmountExVatCents: 0,
      otherEstimatedValueComponentsCents: 0,
      successiveNeeds: true,
      valuationEvidence: "Catálogo y consumos históricos fechados y contrastados por la unidad promotora.",
    });

    expect(result.budget).toEqual({
      availableCreditVatIncludedCents: 1_210_000,
      baseTenderBudgetExVatCents: 1_000_000,
      vatAmountCents: 210_000,
      baseTenderBudgetVatIncludedCents: 1_210_000,
      maximumApprovedBudgetCents: 1_000_000,
      budgetCoversEntireContractLife: true,
    });
    expect(result.estimatedValue).toMatchObject({
      initialBaseCents: 1_000_000,
      extensionsCents: 0,
      plannedModificationsCents: 200_000,
      legalEstimatedValueCents: 1_200_000,
    });
    expect(result.estimatedValue?.calculationMethod).toContain("Catálogo y consumos históricos");
    expect(result.procedure.code).toBe("MINOR_REVIEW");
    expect(result.warnings.join(" ")).toContain("no se vuelven a sumar");
    expect(result.legalBasis.some(item => item.article === "DA 33.ª")).toBe(true);
    expect(result.humanValidationRequired).toBe(true);
    expect(result.generationBlocked).toBe(true);
  });

  it("exige valorar las prórrogas cuando el crédito cubre solo el periodo inicial", () => {
    expect(() => evaluateEconomicStartingPoint({
      startingPoint: "KNOWN_CREDIT_LIMIT",
      contractType: "SERVICE",
      grossCreditLimitCents: 72_600_00,
      vatRatePercent: 21,
      creditScope: "INITIAL_PERIOD",
      initialDurationMonths: 12,
      extensionMonths: 12,
      plannedModificationPercent: 0,
      valuationEvidence: "Estudio de costes.",
    })).toThrow(/debe valorarse su importe sin IVA/);
  });

  it("calcula la modificación sobre la base inicial y no vuelve a aplicarla a la prórroga", () => {
    const result = evaluateEconomicStartingPoint({
      startingPoint: "KNOWN_CREDIT_LIMIT",
      contractType: "SERVICE",
      grossCreditLimitCents: 1_210_000,
      vatRatePercent: 21,
      creditScope: "INITIAL_PERIOD",
      initialDurationMonths: 12,
      extensionMonths: 12,
      extensionAmountExVatCents: 1_000_000,
      plannedModificationPercent: 20,
      valuationEvidence: "Costes unitarios y duración contrastados.",
    });
    expect(result.estimatedValue).toMatchObject({
      initialBaseCents: 1_000_000,
      extensionsCents: 1_000_000,
      plannedModificationsCents: 200_000,
      legalEstimatedValueCents: 2_200_000,
    });
    expect(result.budget?.maximumApprovedBudgetCents).toBeUndefined();
  });

  it("no confunde crédito disponible con PBL ni permite comprometer más crédito", () => {
    const result = evaluateEconomicStartingPoint({
      startingPoint: "KNOWN_CREDIT_LIMIT",
      contractType: "SUPPLY",
      grossCreditLimitCents: 2_420_000,
      contractBudgetVatIncludedCents: 1_210_000,
      vatRatePercent: 21,
      creditScope: "ENTIRE_CONTRACT_LIFE",
      initialDurationMonths: 12,
      extensionMonths: 0,
      plannedModificationPercent: 0,
      valuationEvidence: "Catálogo vigente.",
    });
    expect(result.budget?.availableCreditVatIncludedCents).toBe(2_420_000);
    expect(result.budget?.baseTenderBudgetVatIncludedCents).toBe(1_210_000);
    expect(result.budget?.baseTenderBudgetExVatCents).toBe(1_000_000);
    expect(() => evaluateEconomicStartingPoint({
      startingPoint: "KNOWN_CREDIT_LIMIT",
      contractType: "SUPPLY",
      grossCreditLimitCents: 1_210_000,
      contractBudgetVatIncludedCents: 2_420_000,
      vatRatePercent: 21,
      creditScope: "ENTIRE_CONTRACT_LIFE",
      initialDurationMonths: 12,
      extensionMonths: 0,
      plannedModificationPercent: 0,
      valuationEvidence: "Catálogo vigente.",
    })).toThrow(/no puede superar el crédito/);
  });

  it("no inventa precio ni procedimiento cuando la necesidad aún no está valorada", () => {
    const result = evaluateEconomicStartingPoint({
      startingPoint: "NEED_PENDING_VALUATION",
      contractType: "SERVICE",
      valuationRoute: "MARKET_CONSULTATION",
      knownTechnicalFacts: "Se conoce el resultado, pero faltan volumen y dedicaciones.",
    });
    expect(result.status).toBe("VALUATION_REQUIRED");
    expect(result.budget).toBeUndefined();
    expect(result.estimatedValue).toBeUndefined();
    expect(result.procedure.code).toBe("PENDING");
    expect(result.generationBlocked).toBe(true);
    expect(result.nextActions.join(" ")).toContain("MARKET_CONSULTATION");
  });

  it("propone procedimientos solo como candidatos dependientes del valor estimado", () => {
    const result = evaluateEconomicStartingPoint({
      startingPoint: "KNOWN_CREDIT_LIMIT",
      contractType: "SERVICE",
      grossCreditLimitCents: 7_260_000,
      vatRatePercent: 21,
      creditScope: "ENTIRE_CONTRACT_LIFE",
      initialDurationMonths: 12,
      extensionMonths: 0,
      plannedModificationPercent: 0,
      valuationEvidence: "Tres presupuestos comparables.",
    });
    expect(result.estimatedValue?.legalEstimatedValueCents).toBe(6_000_000);
    expect(result.procedure.code).toBe("OPEN_SIMPLIFIED_REVIEW");
    expect(result.procedure.humanValidationRequired).toBe(true);
    expect(result.productionReady).toBe(false);
  });

  it("permite persistir y validar todas las magnitudes promovidas por LB107 y LB108", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "contrata-lb108-evidence-"));
    try {
      const workspace = new UniversalEvidenceWorkspace(root);
      const values: Record<string, unknown> = {
        need: "Necesidad administrativa motivada.",
        "economic.initialEstimatedValueBaseCents": 1_000_000,
        "economic.extensionAmountExVatCents": 500_000,
        "economic.modificationAmountExVatCents": 200_000,
        "economic.optionsAmountExVatCents": 0,
        "economic.otherEstimatedValueComponentsCents": 0,
        modificationPercent: 20,
      };
      for (const [fieldPath, value] of Object.entries(values)) {
        workspace.declare("EXP-LB108-EVIDENCE", fieldPath, value, "operator-lb108");
        workspace.validate("EXP-LB108-EVIDENCE", fieldPath, "reviewer-lb108");
      }
      const record = workspace.get("EXP-LB108-EVIDENCE");
      expect(Object.values(record.fields).every(field => field.status === "HUMAN_VALIDATED")).toBe(true);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
