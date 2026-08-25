export interface FerreteriaCatalogItem {
  sequence: number;
  description: string;
  estimatedAnnualConsumption: number;
  totalContractUnits24Months: number;
  unitPriceCentsExVat: number;
  totalPriceCentsExVat: number;
  vatCents: number;
  totalPriceCentsVatIncluded: number;
}

export interface FerreteriaCanonicalCatalogValidation {
  ready: boolean;
  blockers: readonly string[];
  itemCount: number;
  totalExVatCents: number;
}

/**
 * LB39 — contrato canónico del catálogo de ferretería.
 *
 * La misma colección validada debe alimentar simultáneamente:
 * - PCAP Anexo I (especificaciones del objeto),
 * - PCAP Anexo V (proposición económica: columnas predefinidas),
 * - PPT punto 4 (descripción técnica y consumos).
 *
 * Se prohíbe mantener tres copias manuales: una discrepancia entre esos
 * documentos bloquearía el paquete contractual.
 */
export function validateFerreteriaCanonicalCatalog(
  items: readonly FerreteriaCatalogItem[],
  expectedPblExVatCents = 1_055_244,
): FerreteriaCanonicalCatalogValidation {
  const blockers: string[] = [];
  if (items.length !== 98) blockers.push(`El catálogo debe contener exactamente 98 referencias; contiene ${items.length}.`);

  const sequences = new Set<number>();
  for (const item of items) {
    if (!Number.isInteger(item.sequence) || item.sequence < 1 || item.sequence > 98) blockers.push(`Secuencia inválida: ${item.sequence}.`);
    if (sequences.has(item.sequence)) blockers.push(`Referencia duplicada en secuencia ${item.sequence}.`);
    sequences.add(item.sequence);
    if (!item.description.trim()) blockers.push(`Referencia ${item.sequence}: descripción vacía.`);
    if (!Number.isSafeInteger(item.estimatedAnnualConsumption) || item.estimatedAnnualConsumption < 0) blockers.push(`Referencia ${item.sequence}: consumo anual inválido.`);
    if (!Number.isSafeInteger(item.totalContractUnits24Months) || item.totalContractUnits24Months < 0) blockers.push(`Referencia ${item.sequence}: unidades totales inválidas.`);
    if (item.totalContractUnits24Months !== item.estimatedAnnualConsumption * 2) blockers.push(`Referencia ${item.sequence}: las unidades de 24 meses no duplican el consumo anual de la fuente.`);
    for (const [label, value] of [
      ["precio unitario", item.unitPriceCentsExVat],
      ["total sin IVA", item.totalPriceCentsExVat],
      ["IVA", item.vatCents],
      ["total con IVA", item.totalPriceCentsVatIncluded],
    ] as const) {
      if (!Number.isSafeInteger(value) || value < 0) blockers.push(`Referencia ${item.sequence}: ${label} inválido.`);
    }
    if (item.totalPriceCentsExVat !== item.unitPriceCentsExVat * item.totalContractUnits24Months) {
      blockers.push(`Referencia ${item.sequence}: el total sin IVA no coincide con precio unitario × unidades de 24 meses.`);
    }
    if (item.totalPriceCentsVatIncluded !== item.totalPriceCentsExVat + item.vatCents) {
      blockers.push(`Referencia ${item.sequence}: el total con IVA no coincide con base + IVA.`);
    }
  }

  for (let sequence = 1; sequence <= 98; sequence += 1) {
    if (!sequences.has(sequence)) blockers.push(`Falta la referencia ${sequence}.`);
  }

  const totalExVatCents = items.reduce((sum, item) => sum + item.totalPriceCentsExVat, 0);
  if (items.length === 98 && totalExVatCents !== expectedPblExVatCents) {
    blockers.push(`La suma del catálogo (${totalExVatCents} céntimos) no coincide con el PBL declarado (${expectedPblExVatCents} céntimos).`);
  }

  return { ready: blockers.length === 0, blockers, itemCount: items.length, totalExVatCents };
}

export function assertCrossDocumentCatalogParity(args: {
  canonical: readonly FerreteriaCatalogItem[];
  pcapAnexoI: readonly FerreteriaCatalogItem[];
  pcapAnexoV: readonly FerreteriaCatalogItem[];
  ppt: readonly FerreteriaCatalogItem[];
}): void {
  const canonical = JSON.stringify(args.canonical);
  if (JSON.stringify(args.pcapAnexoI) !== canonical) throw new Error("PCAP Anexo I no coincide con el catálogo canónico de 98 referencias.");
  if (JSON.stringify(args.pcapAnexoV) !== canonical) throw new Error("PCAP Anexo V no coincide con el catálogo canónico de 98 referencias.");
  if (JSON.stringify(args.ppt) !== canonical) throw new Error("PPT no coincide con el catálogo canónico de 98 referencias.");
}
