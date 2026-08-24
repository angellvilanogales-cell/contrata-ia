import { describe, expect, it } from "vitest";
import {
  FERRETERIA_V7_SECOND_RENDER_FINDINGS,
  evaluateFerreteriaV7SecondRenderComparison,
} from "../src/application/intake/lb37/FerreteriaV7RenderComparison";

describe("LB37 - comparación segundo render vs PCAP V7", () => {
  it("no permite aceptación humana final mientras existan diferencias documentales bloqueantes", () => {
    const result = evaluateFerreteriaV7SecondRenderComparison();
    expect(result.caseId).toBe("CONTR/2026/240267");
    expect(result.readyForHumanFinalAcceptance).toBe(false);
    expect(result.blockingDifferenceCount).toBe(4);
    expect(result.reviewRequiredCount).toBe(1);
  });

  it("bloquea específicamente portada, tabla de 98 referencias, Anexo V e identificadores de anexos", () => {
    const blockers = FERRETERIA_V7_SECOND_RENDER_FINDINGS
      .filter(item => item.status === "BLOCKING_DIFFERENCE")
      .map(item => item.id);
    expect(blockers).toEqual([
      "front-matter-case-identification",
      "anexo-i-98-reference-table",
      "anexo-v-economic-proposal-98-reference-table",
      "annex-case-identifiers",
    ]);
  });

  it("reconoce como conformes los datos nucleares y el apartado 14 ya cerrados", () => {
    const matches = FERRETERIA_V7_SECOND_RENDER_FINDINGS
      .filter(item => item.status === "MATCH")
      .map(item => item.id);
    expect(matches).toContain("anexo-i-core-economic-administrative-data");
    expect(matches).toContain("modification-section-14");
  });

  it("no convierte una diferencia aislada de paginación en error jurídico automático", () => {
    const pagination = FERRETERIA_V7_SECOND_RENDER_FINDINGS.find(item => item.id === "pagination-and-visual-parity");
    expect(pagination?.status).toBe("REVIEW_REQUIRED");
  });
});
