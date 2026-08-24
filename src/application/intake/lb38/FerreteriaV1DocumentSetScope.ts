export type FerreteriaV1DocumentKind = "PCAP" | "MEMORIA" | "PPT";

export type FerreteriaDocumentProductionState =
  | "REAL_RENDER_IN_PROGRESS"
  | "SOURCE_BACKED_EDITABLE_AVAILABLE"
  | "SOURCE_BACKED_PDF_ONLY"
  | "NEEDS_EDITABLE_MASTER"
  | "READY_FOR_PROTECTED_PIPELINE";

export interface FerreteriaDocumentSourceStatus {
  kind: FerreteriaV1DocumentKind;
  requiredForV1: true;
  sourceName: string;
  sourceFormat: "ODT" | "PDF";
  sourceRole: "OFFICIAL_MODEL" | "REAL_CASE_REFERENCE";
  productionState: FerreteriaDocumentProductionState;
  blockers: readonly string[];
}

/**
 * LB38 — alcance documental V1 irrevocable para el caso real CONTR/2026/240267.
 *
 * La V1 no se puede declarar completa limitándose al PCAP. El paquete mínimo
 * objeto de aceptación es PCAP + Memoria justificativa + PPT. Cada documento
 * conserva su propio activo editable y su propia auditoría; compartir datos del
 * expediente no autoriza a reconstruir ni a sustituir silenciosamente su modelo.
 */
export const FERRETERIA_V1_DOCUMENT_SET: readonly FerreteriaDocumentSourceStatus[] = [
  {
    kind: "PCAP",
    requiredForV1: true,
    sourceName: "PCAP suministro ASA autofinanciada — modelo oficial Junta diciembre 2025",
    sourceFormat: "ODT",
    sourceRole: "OFFICIAL_MODEL",
    productionState: "REAL_RENDER_IN_PROGRESS",
    blockers: [
      "Completar paridad LB37: portada y propagación de expediente/título.",
      "Materializar desde LB43 el catálogo canónico de 98 referencias en Anexo I y Anexo V, sin copias manuales independientes.",
      "Superar comparación visual final y validación humana.",
    ],
  },
  {
    kind: "MEMORIA",
    requiredForV1: true,
    sourceName: "04_Memoría Ferretería SSCC SAE V12_letrado.odt",
    sourceFormat: "ODT",
    sourceRole: "REAL_CASE_REFERENCE",
    productionState: "SOURCE_BACKED_EDITABLE_AVAILABLE",
    blockers: [
      "LB40/LB44 ya verifican el editable auténtico V12, el candidato V13 corregido y su identidad binaria; falta completar el mapping físico reproducible de los nueve bloques documentales.",
      "La Memoria V13 no puede marcarse productionReady hasta que el aplicativo la regenere desde evidencia universal y la salida supere comparación visual/humana.",
    ],
  },
  {
    kind: "PPT",
    requiredForV1: true,
    sourceName: "PPT Feretería SSCC SAE V6.odt",
    sourceFormat: "ODT",
    sourceRole: "REAL_CASE_REFERENCE",
    productionState: "SOURCE_BACKED_EDITABLE_AVAILABLE",
    blockers: [
      "Debe incorporarse físicamente el catálogo canónico LB43 de 98 referencias al punto 4, preservando estructura y estilos del ODT V6.",
      "Debe corregirse la expresión 'no exhaustivo ni limitativo' para que la variabilidad se refiera a cantidades de referencias existentes y no permita introducir artículos nuevos al amparo de la DA 33.ª.",
      "Debe someterse el primer render protegido del PPT a auditoría semántica y visual independiente.",
    ],
  },
] as const;

export function evaluateFerreteriaV1DocumentSetReadiness() {
  const blockers = FERRETERIA_V1_DOCUMENT_SET.flatMap(document =>
    document.productionState === "READY_FOR_PROTECTED_PIPELINE" ? [] : document.blockers.map(blocker => `${document.kind}: ${blocker}`),
  );
  return {
    requiredKinds: FERRETERIA_V1_DOCUMENT_SET.map(document => document.kind),
    allThreeDocumentsRequired: FERRETERIA_V1_DOCUMENT_SET.length === 3,
    productionReady: blockers.length === 0,
    blockers,
  } as const;
}
