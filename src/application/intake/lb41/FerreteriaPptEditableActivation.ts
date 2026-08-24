import { FerreteriaCatalogItem, validateFerreteriaCanonicalCatalog } from "../lb39/FerreteriaCanonicalCatalog";

/**
 * LB41/LB57 — activación controlada del PPT editable real del expediente CONTR/2026/240267.
 * La identidad de la fuente aportada está verificada, sin presumir que el mismo binario
 * esté todavía instalado y verificado en un runtime de producción.
 */
export const FERRETERIA_PPT_V6_EDITABLE_SOURCE = {
  caseId: "CONTR/2026/240267",
  documentKind: "PPT",
  format: "ODT",
  sourceFileName: "PPT Feretería SSCC SAE V6.odt",
  sourceRole: "REAL_CASE_REFERENCE",
  editableSourceLocated: true,
  sourceBinaryIdentityVerified: true,
  sourceBinarySha256: "c3f4199e3929718f278cc7d77c04d7e6082b79858e52ff193f1a79b17edd3f09",
  sourceStyleFingerprint: "sha256:deadf7c2a176c83de774fad7022a0ac1d5adfcca514d8c0cddeb0b01029d1390",
  exactRuntimeBinaryVerified: false,
  structure: {
    pageCount: 7,
    title: "PLIEGO DE PRESCRIPCIONES TÉCNICAS QUE HA DE REGIR EN EL CONTRATO DE SUMINISTRO DE MATERIALES DE FERRETERÍA PARA LAS INSTALACIONES LOS EDIFICIOS DONDE SE UBICAN LOS SERVICIOS CENTRALES DEL SERVICIO ANDALUZ DE EMPLEO Y SUS OFICINAS ANEXAS.",
    sections: [
      "1. OBJETO DEL PLIEGO DE PRESCRIPCIONES TÉCNICAS",
      "2. UNIDAD GESTORA DEL CONTRATO",
      "3. PLAZO DE EJECUCIÓN",
      "4. DESCRIPCIÓN DE LOS MATERIALES OBJETO DEL PRESENTE CONTRATO",
      "5. CONDICIONES DEL SUMINISTRO",
      "6. RECEPCIÓN DE LOS ARTÍCULOS SUMINISTRADOS",
    ],
  },
} as const;

export const FERRETERIA_PPT_CATALOG_SCOPE_DECISION = {
  originalWording: "El listado de productos y sus cantidades estimadas tienen carácter meramente orientativo, no exhaustivo ni limitativo.",
  correctedWording: "Las cantidades estimadas tienen carácter meramente orientativo y podrán variar al alza o a la baja según las necesidades reales. La relación de referencias delimita los artículos objeto del suministro y no habilita la incorporación de artículos nuevos mediante la modificación prevista.",
  quantityVariationAllowed: true,
  newReferencesViaPlannedModificationAllowed: false,
  newUnitPricesViaPlannedModificationAllowed: false,
  maximumApprovedBudgetMustNotBeExceededWithoutPriorModification: true,
} as const;

export interface FerreteriaPptPipelineReadiness {
  ready: boolean;
  stage: "NEEDS_EXACT_BINARY" | "NEEDS_CANONICAL_CATALOG" | "READY_FOR_PHYSICAL_MAPPING";
  blockers: readonly string[];
}

export function evaluateFerreteriaPptPipelineReadiness(args: {
  exactBinaryAvailable: boolean;
  catalog: readonly FerreteriaCatalogItem[];
}): FerreteriaPptPipelineReadiness {
  const blockers: string[] = [];
  if (!args.exactBinaryAvailable) {
    blockers.push("Falta cargar en runtime el binario exacto del PPT V6 para bindings físicos reproducibles.");
    return { ready: false, stage: "NEEDS_EXACT_BINARY", blockers };
  }
  const catalog = validateFerreteriaCanonicalCatalog(args.catalog);
  if (!catalog.ready) return { ready: false, stage: "NEEDS_CANONICAL_CATALOG", blockers: catalog.blockers };
  return { ready: true, stage: "READY_FOR_PHYSICAL_MAPPING", blockers: [] };
}
