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
      "Completar paridad LB37: portada, propagación de expediente/título y catálogo de 98 referencias en Anexo I y Anexo V.",
      "Superar comparación visual final y validación humana.",
    ],
  },
  {
    kind: "MEMORIA",
    requiredForV1: true,
    sourceName: "04_Memoría Ferretería SSCC SAE V12_letrado.pdf",
    sourceFormat: "PDF",
    sourceRole: "REAL_CASE_REFERENCE",
    productionState: "NEEDS_EDITABLE_MASTER",
    blockers: [
      "La fuente V12 letrado disponible acredita contenido y formato visual, pero es PDF y no constituye por sí sola un activo editable de producción.",
      "Debe localizarse o aportarse el editable auténtico de la memoria, o validarse expresamente un modelo editable institucional aplicable antes de automatizar su render.",
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
      "El ODT V6 es un expediente real editable y sirve para inventariar estructura y estilos, pero antes de generalizarlo debe clasificarse como modelo reutilizable o referencia de caso.",
      "Debe conectarse el catálogo canónico de 98 referencias y someterse a render y auditoría independientes del PCAP.",
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
