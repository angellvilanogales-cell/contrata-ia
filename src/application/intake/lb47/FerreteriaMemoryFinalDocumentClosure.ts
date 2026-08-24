/** LB47 — cierre técnico de la Memoria justificativa real CONTR/2026/240267. */
export const FERRETERIA_MEMORY_FINAL_DOCUMENT = {
  caseId: "CONTR/2026/240267",
  sourceFileName: "04_Memoría Ferretería SSCC SAE V12_letrado.odt",
  sourceSha256: "36ed482048e19bc8b1f9c4fe1b8f1bd47eb81ac9e256dd4f0488e7bc97b8e4dc",
  finalFileName: "CONTR-2026-240267_Memoria_Justificativa_V14_Final_Contrata-IA.odt",
  finalSha256: "15b5d02febb8570e95f568f070bf1ed0b19af44c62c9d86a9422bdda3f8f75e6",
  renderedPdfPages: 9,
  fixes: [
    "VE_DA33_21793_15",
    "NO_NEW_ARTICLES",
    "ROLECE_WORDING",
    "NO_SPECIFIC_BUSINESS_QUALIFICATION",
    "FOOTER_PAGE_DENOMINATOR_9",
  ],
  engineeringClosed: true,
  humanAcceptanceRequired: true,
  productionReady: false,
} as const;

export function evaluateFerreteriaMemoryFinalClosure() {
  const required = new Set(["VE_DA33_21793_15", "NO_NEW_ARTICLES", "ROLECE_WORDING", "NO_SPECIFIC_BUSINESS_QUALIFICATION", "FOOTER_PAGE_DENOMINATOR_9"]);
  const missing = [...required].filter(id => !FERRETERIA_MEMORY_FINAL_DOCUMENT.fixes.includes(id));
  return { engineeringClosed: missing.length === 0, blockers: missing, humanAcceptanceRequired: true, productionReady: false } as const;
}
