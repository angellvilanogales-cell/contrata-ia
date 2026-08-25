import { FerreteriaCatalogItem } from "../lb39/FerreteriaCanonicalCatalog";
import { FERRETERIA_CANONICAL_CATALOG_98 } from "../lb43/FerreteriaCanonicalCatalogSourceData";

export interface PcapAnexoIArticleRow {
  lot: "Lote único";
  description: string;
  estimatedAnnualUnits: number;
  annualReferenceAmountCentsExVat: number;
}

export interface PcapAnexoVEconomicRow {
  description: string;
  estimatedAnnualUnits: number;
  maxUnitPriceCentsExVat: number;
  bidderUnitPriceCentsExVat: null;
  bidderTotalCentsExVat: null;
}

export interface PptArticleRow extends FerreteriaCatalogItem {}

/**
 * LB45 — una única colección canónica, tres proyecciones documentales.
 *
 * No se copia el catálogo. Cada documento proyecta las columnas que realmente
 * exige su estructura desde FERRETERIA_CANONICAL_CATALOG_98.
 *
 * Anexo I: conserva la estructura de cuatro columnas del modelo y representa
 * las cantidades orientativas anuales de la fuente. El importe de referencia
 * anual es unidades estimadas × precio unitario máximo.
 *
 * Anexo V: reproduce la estructura material del V7: descripción, Uds.
 * estimadas, coste unitario máximo y dos columnas de oferta que deben quedar
 * vacías para la persona licitadora.
 *
 * PPT punto 4: conserva las ocho magnitudes de la fuente V6, incluidos los
 * redondeos declarados por fila.
 */
export function projectCanonicalCatalogToPcapAnexoI(
  items: readonly FerreteriaCatalogItem[] = FERRETERIA_CANONICAL_CATALOG_98,
): readonly PcapAnexoIArticleRow[] {
  return items.map(item => ({
    lot: "Lote único",
    description: item.description,
    estimatedAnnualUnits: item.estimatedAnnualConsumption,
    annualReferenceAmountCentsExVat: item.estimatedAnnualConsumption * item.unitPriceCentsExVat,
  }));
}

export function projectCanonicalCatalogToPcapAnexoV(
  items: readonly FerreteriaCatalogItem[] = FERRETERIA_CANONICAL_CATALOG_98,
): readonly PcapAnexoVEconomicRow[] {
  return items.map(item => ({
    description: item.description,
    estimatedAnnualUnits: item.estimatedAnnualConsumption,
    maxUnitPriceCentsExVat: item.unitPriceCentsExVat,
    bidderUnitPriceCentsExVat: null,
    bidderTotalCentsExVat: null,
  }));
}

export function projectCanonicalCatalogToPpt(
  items: readonly FerreteriaCatalogItem[] = FERRETERIA_CANONICAL_CATALOG_98,
): readonly PptArticleRow[] {
  return items.map(item => ({ ...item }));
}

export function auditFerreteriaCatalogProjectionParity() {
  const anexoI = projectCanonicalCatalogToPcapAnexoI();
  const anexoV = projectCanonicalCatalogToPcapAnexoV();
  const ppt = projectCanonicalCatalogToPpt();
  const blockers: string[] = [];
  for (let index = 0; index < FERRETERIA_CANONICAL_CATALOG_98.length; index += 1) {
    const canonical = FERRETERIA_CANONICAL_CATALOG_98[index]!;
    const i = anexoI[index]!;
    const v = anexoV[index]!;
    const p = ppt[index]!;
    if (i.description !== canonical.description || v.description !== canonical.description || p.description !== canonical.description) blockers.push(`Referencia ${canonical.sequence}: descripción divergente.`);
    if (i.estimatedAnnualUnits !== canonical.estimatedAnnualConsumption || v.estimatedAnnualUnits !== canonical.estimatedAnnualConsumption || p.estimatedAnnualConsumption !== canonical.estimatedAnnualConsumption) blockers.push(`Referencia ${canonical.sequence}: consumo anual divergente.`);
    if (v.maxUnitPriceCentsExVat !== canonical.unitPriceCentsExVat || p.unitPriceCentsExVat !== canonical.unitPriceCentsExVat) blockers.push(`Referencia ${canonical.sequence}: precio unitario divergente.`);
  }
  return { ready: blockers.length === 0, blockers, count: FERRETERIA_CANONICAL_CATALOG_98.length } as const;
}
