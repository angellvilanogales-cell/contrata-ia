import { describe, expect, it } from "vitest";
import { SUPPLY_OFFICIAL_ANNEX_DRAFT_SCRIPT } from "../src/interfaces/lb7/SupplyOfficialAnnexDraftScript";
import { SUPPLY_FINALIZATION_SCRIPT } from "../src/interfaces/lb7/SupplyFinalizationScript";
import { ADAPTIVE_FLOW_UI } from "../src/interfaces/lb7/AdaptiveFlowUi";

describe("LB7 suministro - paso 9 borrador editable", () => {
  it("compila de forma aislada y no utiliza MutationObserver", () => {
    expect(() => new Function(SUPPLY_OFFICIAL_ANNEX_DRAFT_SCRIPT)).not.toThrow();
    expect(SUPPLY_OFFICIAL_ANNEX_DRAFT_SCRIPT).not.toContain("MutationObserver");
  });

  it("mantiene el paso 9 fuera del script estable 4-7", () => {
    expect(SUPPLY_FINALIZATION_SCRIPT).not.toContain("9. Primer borrador editable del Anexo I");
    expect(ADAPTIVE_FLOW_UI).toContain("SUPPLY_OFFICIAL_ANNEX_DRAFT_SCRIPT");
  });

  it("genera un DOCX real y limita expresamente el alcance al Anexo I", () => {
    expect(SUPPLY_OFFICIAL_ANNEX_DRAFT_SCRIPT).toContain("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    expect(SUPPLY_OFFICIAL_ANNEX_DRAFT_SCRIPT).toContain("_Anexo_I_Borrador_Contrata-IA.docx");
    expect(SUPPLY_OFFICIAL_ANNEX_DRAFT_SCRIPT).toContain("ANNEX_I_PARAMETERIZED_DRAFT_NOT_FULL_OFFICIAL_PCAP");
    expect(SUPPLY_OFFICIAL_ANNEX_DRAFT_SCRIPT).toContain("no sustituye las cláusulas generales del modelo oficial");
  });

  it("solo se habilita después del cierre completo del paso 8", () => {
    expect(SUPPLY_OFFICIAL_ANNEX_DRAFT_SCRIPT).toContain("supplyOfficialTemplatePendingFieldsValidated===true");
    expect(SUPPLY_OFFICIAL_ANNEX_DRAFT_SCRIPT).toContain("supplyAbnormallyLowParametersValidated===true");
    expect(SUPPLY_OFFICIAL_ANNEX_DRAFT_SCRIPT).toContain("supplyTieBreakValidated===true");
    expect(SUPPLY_OFFICIAL_ANNEX_DRAFT_SCRIPT).toContain("supplySpecificPenaltiesDecisionValidated===true");
  });
});
