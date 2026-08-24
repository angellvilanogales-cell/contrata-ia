import { describe, expect, it } from "vitest";
import {
  FERRETERIA_PPT_CATALOG_SCOPE_DECISION,
  FERRETERIA_PPT_V6_EDITABLE_SOURCE,
  evaluateFerreteriaPptPipelineReadiness,
} from "../src/application/intake/lb41/FerreteriaPptEditableActivation";

describe("LB41 - activación controlada PPT V6 ferretería", () => {
  it("registra el PPT V6 como fuente editable real del caso, no como modelo genérico automático", () => {
    expect(FERRETERIA_PPT_V6_EDITABLE_SOURCE.caseId).toBe("CONTR/2026/240267");
    expect(FERRETERIA_PPT_V6_EDITABLE_SOURCE.format).toBe("ODT");
    expect(FERRETERIA_PPT_V6_EDITABLE_SOURCE.sourceRole).toBe("REAL_CASE_REFERENCE");
    expect(FERRETERIA_PPT_V6_EDITABLE_SOURCE.editableSourceLocated).toBe(true);
    expect(FERRETERIA_PPT_V6_EDITABLE_SOURCE.exactRuntimeBinaryVerified).toBe(false);
  });

  it("impide interpretar 'no exhaustivo ni limitativo' como catálogo abierto", () => {
    expect(FERRETERIA_PPT_CATALOG_SCOPE_DECISION.quantityVariationAllowed).toBe(true);
    expect(FERRETERIA_PPT_CATALOG_SCOPE_DECISION.newReferencesViaPlannedModificationAllowed).toBe(false);
    expect(FERRETERIA_PPT_CATALOG_SCOPE_DECISION.newUnitPricesViaPlannedModificationAllowed).toBe(false);
    expect(FERRETERIA_PPT_CATALOG_SCOPE_DECISION.correctedWording).toMatch(/relación de referencias delimita/i);
  });

  it("bloquea el pipeline mientras no estén disponibles los bytes exactos del PPT", () => {
    const result = evaluateFerreteriaPptPipelineReadiness({ exactBinaryAvailable: false, catalog: [] });
    expect(result.ready).toBe(false);
    expect(result.stage).toBe("NEEDS_EXACT_BINARY");
  });

  it("después de disponer del binario exige catálogo canónico íntegro de 98 referencias", () => {
    const result = evaluateFerreteriaPptPipelineReadiness({ exactBinaryAvailable: true, catalog: [] });
    expect(result.ready).toBe(false);
    expect(result.stage).toBe("NEEDS_CANONICAL_CATALOG");
    expect(result.blockers.join(" ")).toMatch(/98 referencias/i);
  });
});
