import { FERRETERIA_CANONICAL_CATALOG_98 } from "../lb43/FerreteriaCanonicalCatalogSourceData";

/**
 * LB48 — cierre técnico del PPT del caso CONTR/2026/240267.
 * El contenido procede del PPT V6 real y el catálogo LB43. El runtime debe seguir
 * distinguiendo referencia editable de caso y modelo genérico institucional.
 */
export const FERRETERIA_PPT_FINAL_DOCUMENT = {
  caseId: "CONTR/2026/240267",
  sourceName: "PPT Feretería SSCC SAE V6.odt",
  sourceRole: "REAL_CASE_REFERENCE",
  finalFileName: "CONTR-2026-240267_PPT_V7_Final_Contrata-IA.odt",
  finalSha256: "7cf92aee119aaa14a4158aca5c2f2cf12907831988d12cf185196f257b71ddad",
  renderedPdfPages: 6,
  catalogueRows: FERRETERIA_CANONICAL_CATALOG_98.length,
  catalogueSemantics: "CLOSED_REFERENCES_VARIABLE_QUANTITIES",
  exactV6BinaryRuntimeIdentityVerified: false,
  visualCorporateFamilyAudited: true,
  engineeringClosed: true,
  humanAcceptanceRequired: true,
  productionReady: false,
} as const;

export function evaluateFerreteriaPptFinalClosure() {
  const blockers: string[] = [];
  if (FERRETERIA_PPT_FINAL_DOCUMENT.catalogueRows !== 98) blockers.push("El PPT no proyecta las 98 referencias canónicas.");
  if (FERRETERIA_PPT_FINAL_DOCUMENT.catalogueSemantics !== "CLOSED_REFERENCES_VARIABLE_QUANTITIES") blockers.push("El PPT reabre indebidamente el catálogo.");
  return {
    engineeringClosed: blockers.length === 0,
    blockers,
    exactV6BinaryRuntimeIdentityVerified: FERRETERIA_PPT_FINAL_DOCUMENT.exactV6BinaryRuntimeIdentityVerified,
    humanAcceptanceRequired: true,
    productionReady: false,
  } as const;
}
