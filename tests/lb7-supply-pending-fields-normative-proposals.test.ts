import { describe, expect, it } from "vitest";
import { SUPPLY_PENDING_FIELDS_NORMATIVE_PROPOSAL_SCRIPT } from "../src/interfaces/lb7/SupplyPendingFieldsNormativeProposalScript";
import { ADAPTIVE_FLOW_UI } from "../src/interfaces/lb7/AdaptiveFlowUi";

describe("LB7 propuestas normativas automáticas en paso 8", () => {
  it("propone anormalidad por artículo 149.2 LCSP y artículo 85 RGLCAP", () => {
    expect(SUPPLY_PENDING_FIELDS_NORMATIVE_PROPOSAL_SCRIPT).toContain("Artículo 149.2 LCSP");
    expect(SUPPLY_PENDING_FIELDS_NORMATIVE_PROPOSAL_SCRIPT).toContain("artículo 85 RGLCAP");
    expect(SUPPLY_PENDING_FIELDS_NORMATIVE_PROPOSAL_SCRIPT).toContain("1 licitador");
    expect(SUPPLY_PENDING_FIELDS_NORMATIVE_PROPOSAL_SCRIPT).toContain("4 o más licitadores");
  });

  it("propone desempate legal y régimen general de penalidades sin autovalidar", () => {
    expect(SUPPLY_PENDING_FIELDS_NORMATIVE_PROPOSAL_SCRIPT).toContain("artículo 147.2 LCSP");
    expect(SUPPLY_PENDING_FIELDS_NORMATIVE_PROPOSAL_SCRIPT).toContain("artículo 193 LCSP");
    expect(SUPPLY_PENDING_FIELDS_NORMATIVE_PROPOSAL_SCRIPT).toContain("artículo 192 LCSP");
    expect(SUPPLY_PENDING_FIELDS_NORMATIVE_PROPOSAL_SCRIPT).toContain('tie.value="LEGAL_ART_147_2"');
    expect(SUPPLY_PENDING_FIELDS_NORMATIVE_PROPOSAL_SCRIPT).toContain('penalties.value="NONE"');
    expect(SUPPLY_PENDING_FIELDS_NORMATIVE_PROPOSAL_SCRIPT).not.toContain("supplyAbnormallyLowParametersValidated=true");
    expect(SUPPLY_PENDING_FIELDS_NORMATIVE_PROPOSAL_SCRIPT).not.toContain("supplyTieBreakValidated=true");
    expect(SUPPLY_PENDING_FIELDS_NORMATIVE_PROPOSAL_SCRIPT).not.toContain("supplySpecificPenaltiesDecisionValidated=true");
  });

  it("mantiene la capa normativa aislada dentro de la interfaz", () => {
    expect(() => new Function(SUPPLY_PENDING_FIELDS_NORMATIVE_PROPOSAL_SCRIPT)).not.toThrow();
    expect(ADAPTIVE_FLOW_UI).toContain("Contrata-IA propuestas normativas Paso 8");
    expect(ADAPTIVE_FLOW_UI).toContain("SUPPLY_PENDING_FIELDS_NORMATIVE_PROPOSAL_SCRIPT");
  });
});
