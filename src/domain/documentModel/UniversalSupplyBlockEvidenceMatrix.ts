import { DocumentType } from "./DocumentType";
import { SupplySourceVariant, UNIVERSAL_SUPPLY_SOURCE_CORPUS } from "./UniversalSupplySourceCorpus";

export type SupplyBlockKey =
  | "NEED_AND_SUITABILITY"
  | "OBJECT_AND_CPV"
  | "LOTS"
  | "ECONOMICS"
  | "PROCEDURE"
  | "AWARD_CRITERIA"
  | "TECHNICAL_SPECIFICATIONS"
  | "DELIVERY_EXECUTION"
  | "RECEPTION_CONFORMITY"
  | "WARRANTY"
  | "DATA_SECURITY"
  | "EU_FUNDS_DNSH";

export interface SupplyBlockEvidenceRow {
  block: SupplyBlockKey;
  memoryCases: number;
  pptCases: number;
  variants: number;
  reusableAsStructuralPattern: boolean;
  physicalTemplateStillRequired: boolean;
}

const MEMORY_BLOCKS = new Set<SupplyBlockKey>(["NEED_AND_SUITABILITY", "OBJECT_AND_CPV", "LOTS", "ECONOMICS", "PROCEDURE", "AWARD_CRITERIA"]);
const PPT_BLOCKS = new Set<SupplyBlockKey>(["TECHNICAL_SPECIFICATIONS", "DELIVERY_EXECUTION", "RECEPTION_CONFORMITY", "WARRANTY"]);

/** LB91.81-83 — matriz de cobertura estructural; no copia texto entre expedientes. */
export function buildSupplyBlockEvidenceMatrix(): readonly SupplyBlockEvidenceRow[] {
  const cases = UNIVERSAL_SUPPLY_SOURCE_CORPUS;
  const variants = new Set<SupplySourceVariant>(cases.map(x => x.variant)).size;
  const allBlocks: SupplyBlockKey[] = [
    "NEED_AND_SUITABILITY", "OBJECT_AND_CPV", "LOTS", "ECONOMICS", "PROCEDURE", "AWARD_CRITERIA",
    "TECHNICAL_SPECIFICATIONS", "DELIVERY_EXECUTION", "RECEPTION_CONFORMITY", "WARRANTY", "DATA_SECURITY", "EU_FUNDS_DNSH",
  ];
  return allBlocks.map(block => {
    const memoryCases = MEMORY_BLOCKS.has(block) ? cases.filter(x => x.memoryAvailable).length : 0;
    const pptCases = PPT_BLOCKS.has(block) ? cases.filter(x => x.pptAvailable).length : 0;
    const specialized = block === "DATA_SECURITY" || block === "EU_FUNDS_DNSH";
    return {
      block,
      memoryCases,
      pptCases,
      variants,
      reusableAsStructuralPattern: specialized ? false : (memoryCases >= 2 || pptCases >= 2),
      physicalTemplateStillRequired: true,
    };
  });
}

export function canPromoteSupplyPhysicalPackage(): false {
  return false;
}

export const SUPPLY_SOURCE_EXTRACTION_PRIORITY: readonly { documentType: DocumentType; sourceCaseId: string; reason: string }[] = [
  { documentType: DocumentType.MEMORY, sourceCaseId: "VEIASA", reason: "Memoria de suministro ordinario y precio global: contraste útil frente a DA33 y PRTR." },
  { documentType: DocumentType.PPT, sourceCaseId: "VEIASA", reason: "PPT ordinario TIC: candidato para aislar bloques no ligados a pedidos sucesivos." },
  { documentType: DocumentType.MEMORY, sourceCaseId: "AULAS", reason: "Memoria extensa PRTR con lotes y economía distinta." },
  { documentType: DocumentType.PPT, sourceCaseId: "MUEBLES-CADIZ", reason: "PPT físico con instalación/puesta en marcha, útil para separar overlays técnicos." },
  { documentType: DocumentType.MEMORY, sourceCaseId: "SAS-AM", reason: "Acuerdo marco sanitario por precio unitario: evita generalizar reglas de contrato ordinario." },
];
