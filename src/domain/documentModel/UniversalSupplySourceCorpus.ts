import { DocumentType } from "./DocumentType";

export type SupplySourceVariant =
  | "CATALOGUE_NEEDS"
  | "ICT_LICENSE_OR_SOFTWARE"
  | "DIGITAL_EQUIPMENT"
  | "SUPPLY_WITH_SERVICE_COMPONENT"
  | "MEDICAL_FRAMEWORK"
  | "FURNITURE_INSTALLATION"
  | "ORDINARY_GLOBAL_PRICE";

export interface UniversalSupplySourceCase {
  id: string;
  expediente: string;
  variant: SupplySourceVariant;
  memoryAvailable: boolean;
  pptAvailable: boolean;
  editableVerified: boolean;
  independent: true;
  sourceNames: readonly string[];
}

/** LB91.77-80 — corpus físico confirmado en los ZIP de fuentes REG-SUPPLY. */
export const UNIVERSAL_SUPPLY_SOURCE_CORPUS: readonly UniversalSupplySourceCase[] = [
  { id: "FERRETERIA", expediente: "CONTR/2026/240267", variant: "CATALOGUE_NEEDS", memoryAvailable: true, pptAvailable: true, editableVerified: true, independent: true, sourceNames: ["04_Memoría Ferretería SSCC SAE V12_letrado.odt", "PPT Feretería SSCC SAE V6.odt"] },
  { id: "PANDA", expediente: "REG-SUPPLY-002", variant: "ICT_LICENSE_OR_SOFTWARE", memoryAvailable: true, pptAvailable: true, editableVerified: false, independent: true, sourceNames: ["06 Memoria Panda antivirus.pdf", "06 PPT Panda antivirus.pdf"] },
  { id: "AULAS", expediente: "CONTR 2025 0000 489703", variant: "DIGITAL_EQUIPMENT", memoryAvailable: true, pptAvailable: true, editableVerified: false, independent: true, sourceNames: ["05 Memo aulas digitales.pdf", "05 PPT aulas digitales.pdf"] },
  { id: "TABLETS", expediente: "CONTR 2024 1239412", variant: "SUPPLY_WITH_SERVICE_COMPONENT", memoryAvailable: true, pptAvailable: true, editableVerified: false, independent: true, sourceNames: ["3 Memoria suministro Tablets.pdf", "3 PPT suministro Tablets.pdf"] },
  { id: "SAS-AM", expediente: "REG-SUPPLY-004", variant: "MEDICAL_FRAMEWORK", memoryAvailable: true, pptAvailable: true, editableVerified: false, independent: true, sourceNames: ["04 memoria suministros sas.pdf", "04 PPT Y ANX 470-25.zip"] },
  { id: "MUEBLES-CADIZ", expediente: "CONTR 2025 595132", variant: "FURNITURE_INSTALLATION", memoryAvailable: true, pptAvailable: true, editableVerified: false, independent: true, sourceNames: ["2 Memoria Muebles juzgados Cádiz.pdf", "2 PPT Muebles juzgados Cádiz.pdf"] },
  { id: "VEIASA", expediente: "REG-SUPPLY-006", variant: "ORDINARY_GLOBAL_PRICE", memoryAvailable: true, pptAvailable: true, editableVerified: false, independent: true, sourceNames: ["1 MEMORIA suministro windows Veiasa.pdf", "1 PPT suministro windows Veiasa.pdf"] },
] as const;

export function getSupplyCasesForDocument(documentType: DocumentType): readonly UniversalSupplySourceCase[] {
  if (documentType === DocumentType.MEMORY) return UNIVERSAL_SUPPLY_SOURCE_CORPUS.filter(x => x.memoryAvailable);
  if (documentType === DocumentType.PPT) return UNIVERSAL_SUPPLY_SOURCE_CORPUS.filter(x => x.pptAvailable);
  return [];
}

export function getSupplyVariantCases(variant: SupplySourceVariant): readonly UniversalSupplySourceCase[] {
  return UNIVERSAL_SUPPLY_SOURCE_CORPUS.filter(x => x.variant === variant);
}
