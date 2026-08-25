import { describe, expect, it } from "vitest";
import {
  FERRETERIA_PPT_CATALOG_SCOPE_DECISION,
  FERRETERIA_PPT_V6_EDITABLE_SOURCE,
  evaluateFerreteriaPptPipelineReadiness,
} from "../src/application/intake/lb41/FerreteriaPptEditableActivation";

describe("LB41/LB57 - activación controlada PPT V6 ferretería", () => {
  it("registra y verifica la identidad de la fuente editable sin fabricar verificación del runtime desplegado", () => {
    expect(FERRETERIA_PPT_V6_EDITABLE_SOURCE.caseId).toBe("CONTR/2026/240267");
    expect(FERRETERIA_PPT_V6_EDITABLE_SOURCE.format).toBe("ODT");
    expect(FERRETERIA_PPT_V6_EDITABLE_SOURCE.sourceRole).toBe("REAL_CASE_REFERENCE");
    expect(FERRETERIA_PPT_V6_EDITABLE_SOURCE.editableSourceLocated).toBe(true);
    expect(FERRETERIA_PPT_V6_EDITABLE_SOURCE.sourceBinaryIdentityVerified).toBe(true);
    expect(FERRETERIA_PPT_V6_EDITABLE_SOURCE.sourceBinarySha256).toBe("c3f4199e3929718f278cc7d77c04d7e6082b79858e52ff193f1a79b17edd3f09");
    expect(FERRETERIA_PPT_V6_EDITABLE_SOURCE.sourceStyleFingerprint).toBe("sha256:deadf7c2a176c83de774fad7022a0ac1d5adfcca514d8c0cddeb0b01029d1390");
    expect(FERRETERIA_PPT_V6_EDITABLE_SOURCE.exactRuntimeBinaryVerified).toBe(false);
  });

  it("impide interpretar 'no exhaustivo ni limitativo' como catálogo abierto", () => {
    expect(FERRETERIA_PPT_CATALOG_SCOPE_DECISION.quantityVariationAllowed).toBe(true);
    expect(FERRETERIA_PPT_CATALOG_SCOPE_DECISION.newReferencesViaPlannedModificationAllowed).toBe(false);
    expect(FERRETERIA_PPT_CATALOG_SCOPE_DECISION.newUnitPricesViaPlannedModificationAllowed).toBe(false);
    expect(FERRETERIA_PPT_CATALOG_SCOPE_DECISION.correctedWording).toMatch(/relación de referencias delimita/i);
  });

  it("bloquea el pipeline mientras el binario exacto no esté instalado en runtime", () => {
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
