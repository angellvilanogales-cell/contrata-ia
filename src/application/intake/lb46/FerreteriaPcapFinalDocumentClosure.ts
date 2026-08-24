import { FERRETERIA_CANONICAL_CATALOG_98 } from "../lb43/FerreteriaCanonicalCatalogSourceData";

/** LB46 — cierre técnico del PCAP real CONTR/2026/240267. */
export const FERRETERIA_PCAP_FINAL_DOCUMENT = {
  caseId: "CONTR/2026/240267",
  fileName: "CONTR-2026-240267_PCAP_Final_Candidato_V1_Contrata-IA.odt",
  sha256: "7db992b23ac38546606a6840e94b8102d6845d50d1b8f2e34588139849eef64c",
  renderedPdfPages: 89,
  sourceOfficialModelSha256: "45e1e6b16ec41d77206d3ef385c70f87c9120bb0ccce4e43d9a24d245812cadc",
  catalogueRows: FERRETERIA_CANONICAL_CATALOG_98.length,
  catalogueProjection: {
    anexoI: "SOURCE_BACKED_98_ROWS",
    anexoV: "SOURCE_BACKED_98_ROWS_WITH_BIDDER_COLUMNS",
  },
  annexIdentityPropagation: "EXPEDIENTE_AND_TITLE_II_TO_XIII",
  residualAuthorityPlaceholdersBlocked: true,
  humanAcceptanceRequired: true,
  engineeringClosed: true,
  productionReady: false,
} as const;

export function evaluateFerreteriaPcapFinalClosure() {
  const blockers: string[] = [];
  if (FERRETERIA_PCAP_FINAL_DOCUMENT.catalogueRows !== 98) blockers.push("El catálogo físico final no contiene 98 referencias.");
  if (!FERRETERIA_PCAP_FINAL_DOCUMENT.residualAuthorityPlaceholdersBlocked) blockers.push("Quedan placeholders imputables al órgano de contratación.");
  return {
    engineeringClosed: blockers.length === 0,
    blockers,
    humanAcceptanceRequired: true,
    productionReady: false,
  } as const;
}
