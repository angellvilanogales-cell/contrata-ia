import { describe, expect, it } from "vitest";
import {
  FERRETERIA_ANEXO_I_SECOND_PASS_PROFILE,
  evaluateFerreteriaAnexoISecondPassProfile,
} from "../src/application/intake/lb36/FerreteriaAnexoISecondPassProfile";

describe("LB36 - segunda pasada source-backed del Anexo I de ferretería", () => {
  it("no contiene decisiones vacías, placeholders ni Sí/No sin resolver", () => {
    const result = evaluateFerreteriaAnexoISecondPassProfile();
    expect(result.readyForPhysicalMaterialization).toBe(true);
    expect(result.blockers).toEqual([]);
    expect(result.decisionCount).toBeGreaterThan(40);
  });

  it("conserva las decisiones administrativas del V7 para procedimiento y aptitud", () => {
    const byId = Object.fromEntries(FERRETERIA_ANEXO_I_SECOND_PASS_PROFILE.map(item => [item.id, item]));
    expect(byId["contracting-authority"]?.value).toContain("Dirección Gerencia del Servicio Andaluz de Empleo");
    expect(byId["binding-clarifications"]?.value).toBe("No.");
    expect(byId["procurement-board"]?.value).toBe("Sí.");
    expect(byId["variants"]?.value).toBe("No.");
    expect(byId["professional-authorisation"]?.value).toBe("No.");
  });

  it("mantiene los importes y datos de facturación declarados por la fuente", () => {
    const byId = Object.fromEntries(FERRETERIA_ANEXO_I_SECOND_PASS_PROFILE.map(item => [item.id, item]));
    expect(byId["pbl-breakdown-direct"]?.value).toContain("8.019,85");
    expect(byId["pbl-breakdown-indirect-profit"]?.value).toContain("1.899,44");
    expect(byId["pbl-breakdown-indirect-profit"]?.value).toContain("633,15");
    expect(byId["invoice-dir3"]?.value).toContain("A01004615");
    expect(byId["invoice-dir3"]?.value).toContain("A01004456");
  });

  it("conserva el régimen de penalidades del V7 sin convertirlo en reglas inventadas", () => {
    const byId = Object.fromEntries(FERRETERIA_ANEXO_I_SECOND_PASS_PROFILE.map(item => [item.id, item]));
    expect(byId["delay-penalty"]?.value).toContain("10,00 €");
    expect(byId["delay-penalty"]?.value).toContain("50 %");
    expect(byId["defective-performance-penalty"]?.value).toBe("No.");
    expect(byId["partial-performance-penalty"]?.value).toBe("No.");
    expect(byId["environmental-social-penalty"]?.value).toMatch(/apartado 8\.B/i);
    expect(byId["special-condition-penalties"]?.value).toContain("300,00 €");
    expect(byId["special-condition-penalties"]?.value).toContain("5 %");
  });

  it("usa el mínimo de cinco años del propio modelo oficial para el único hueco no cumplimentado por V7", () => {
    const decision = FERRETERIA_ANEXO_I_SECOND_PASS_PROFILE.find(item => item.id === "confidentiality-term");
    expect(decision?.value).toBe("5 años.");
    expect(decision?.source).toBe("OFFICIAL_MODEL");
  });
});
