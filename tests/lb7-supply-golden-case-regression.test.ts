import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SUPPLY_GOLDEN_CASE_001 } from "../src/regression/SupplyGoldenCase001";
import { SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT } from "../src/interfaces/lb7/SupplyCrossDocumentFinalAuditScript";
import { SUPPLY_GOLDEN_CASE_REGISTRY_SCRIPT } from "../src/interfaces/lb7/SupplyGoldenCaseRegistryScript";

describe("Paso 11.6 - regresión automática del caso dorado CONTR-2026-240267", () => {
  it("mantiene inmutable la identidad y el estado del golden case", () => {
    expect(SUPPLY_GOLDEN_CASE_001.id).toBe("CONTR-2026-240267-SUPPLY-DA33-GOLDEN-001");
    expect(SUPPLY_GOLDEN_CASE_001.status).toBe("VALIDATED_DOCUMENTARY_GOLDEN_CASE");
    expect(SUPPLY_GOLDEN_CASE_001.expediente).toBe("CONTR/2026/240267");
    expect(SUPPLY_GOLDEN_CASE_001.contractType).toBe("SUMINISTRO");
    expect(SUPPLY_GOLDEN_CASE_001.cpv).toBe("44316400-2");
  });

  it("protege las magnitudes económicas validadas", () => {
    expect(SUPPLY_GOLDEN_CASE_001.economics).toEqual({
      initialPblExVat: 10552.44,
      vatRatePercent: 21,
      initialPblVatIncluded: 12768.45,
      directCostsPercent: 76,
      directCostsExVat: 8019.85,
      indirectCostsPercent: 18,
      indirectCostsExVat: 1899.44,
      industrialProfitPercent: 6,
      industrialProfitExVat: 633.15,
      maximumBudgetAllTermExVat: 18160.96,
      estimatedValueExVat: 21793.15,
      plannedModificationPercent: 20,
      plannedModificationMaximumExVat: 3632.19,
    });
  });

  it("protege catálogo, duración, adjudicación y ejecución", () => {
    expect(SUPPLY_GOLDEN_CASE_001.catalogue.references).toBe(98);
    expect(SUPPLY_GOLDEN_CASE_001.catalogue.referenceEconomicBaseExVat).toBe(4540.24);
    expect(SUPPLY_GOLDEN_CASE_001.catalogue.closedToNewItems).toBe(true);
    expect(SUPPLY_GOLDEN_CASE_001.catalogue.closedToNewUnitPrices).toBe(true);
    expect(SUPPLY_GOLDEN_CASE_001.duration.initialMonths).toBe(24);
    expect(SUPPLY_GOLDEN_CASE_001.duration.extensionsMonths).toEqual([12, 12]);
    expect(SUPPLY_GOLDEN_CASE_001.award.soleCriterion).toBe("PRECIO");
    expect(SUPPLY_GOLDEN_CASE_001.award.points).toBe(100);
    expect(SUPPLY_GOLDEN_CASE_001.execution.deliveryBusinessDays).toBe(5);
  });

  it("protege la modificación DA 33.ª y sus límites", () => {
    expect(SUPPLY_GOLDEN_CASE_001.modification.legalBasis).toEqual(["DA 33.ª LCSP", "art. 204 LCSP"]);
    expect(SUPPLY_GOLDEN_CASE_001.modification.reason).toBe("MAYORES_NECESIDADES_REALES");
    expect(SUPPLY_GOLDEN_CASE_001.modification.sameObject).toBe(true);
    expect(SUPPLY_GOLDEN_CASE_001.modification.sameAwardedUnitPrices).toBe(true);
    expect(SUPPLY_GOLDEN_CASE_001.modification.noNewItems).toBe(true);
    expect(SUPPLY_GOLDEN_CASE_001.modification.noNewUnitPrices).toBe(true);
  });

  it("mantiene sincronizados manifest, auditor final y registro UI", () => {
    const manifest = JSON.parse(fs.readFileSync(path.resolve("docs/regression/CONTR-2026-240267-SUPPLY-DA33-GOLDEN-001.json"), "utf8"));
    expect(manifest.id).toBe(SUPPLY_GOLDEN_CASE_001.id);
    expect(manifest.economics.estimatedValueExVat).toBe(SUPPLY_GOLDEN_CASE_001.economics.estimatedValueExVat);
    expect(manifest.economics.maximumBudgetAllTermExVat).toBe(SUPPLY_GOLDEN_CASE_001.economics.maximumBudgetAllTermExVat);
    expect(manifest.modification.noNewUnitPrices).toBe(true);
    expect(SUPPLY_GOLDEN_CASE_REGISTRY_SCRIPT).toContain(SUPPLY_GOLDEN_CASE_001.id);
    expect(SUPPLY_GOLDEN_CASE_REGISTRY_SCRIPT).toContain("Bloqueantes admitidos: 0");
    for (const token of ["10.552,44", "18.160,96", "21.793,15", "3.632,19", "20 %", "100 PUNTOS", "DISPOSICIÓN ADICIONAL 33"]) {
      expect(SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_SCRIPT).toContain(token);
    }
  });

  it("muestra 11.5 aunque esté pendiente tras la calibración", () => {
    expect(SUPPLY_GOLDEN_CASE_REGISTRY_SCRIPT).toContain("supplyCrossDocumentFinalCalibrationDone===true");
    expect(SUPPLY_GOLDEN_CASE_REGISTRY_SCRIPT).toContain("Paso 11.5 todavía bloqueado");
    expect(SUPPLY_GOLDEN_CASE_REGISTRY_SCRIPT).toContain("Repita ahora 11.4.3");
  });

  it("exige auditoría final sin bloqueantes y validación humana", () => {
    expect(SUPPLY_GOLDEN_CASE_001.finalAudit.requiredBlockers).toBe(0);
    expect(SUPPLY_GOLDEN_CASE_001.finalAudit.requiresHumanValidation).toBe(true);
    expect(SUPPLY_GOLDEN_CASE_REGISTRY_SCRIPT).toContain("supplyCrossDocumentFinalAuditRan===true");
    expect(SUPPLY_GOLDEN_CASE_REGISTRY_SCRIPT).toContain("b.length!==0");
    expect(SUPPLY_GOLDEN_CASE_REGISTRY_SCRIPT).toContain("Registrar caso dorado 11.5");
    expect(SUPPLY_GOLDEN_CASE_REGISTRY_SCRIPT).toContain("11.6 Regresión automática del caso dorado");
  });

  it("está integrado después de la auditoría final y su calibración", () => {
    const ui = fs.readFileSync(path.resolve("src/interfaces/lb7/AdaptiveFlowUi.ts"), "utf8");
    expect(ui).toContain("SUPPLY_GOLDEN_CASE_REGISTRY_SCRIPT");
    expect(ui.indexOf("${SUPPLY_GOLDEN_CASE_REGISTRY_SCRIPT}")).toBeGreaterThan(ui.indexOf("${SUPPLY_CROSS_DOCUMENT_FINAL_AUDIT_CALIBRATION_SCRIPT}"));
  });
});
