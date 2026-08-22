import { CanonicalContractType } from "../../../domain/expediente/CanonicalExpedienteState";

export type UniversalAdministrativeDocumentKind = "MEMORIA" | "DPCAF" | "PCAP" | "PPT";

export interface UniversalOfficialTemplateDescriptor {
  templateId: string;
  sourceId: string;
  contractType: CanonicalContractType;
  documentKind: UniversalAdministrativeDocumentKind;
  official: boolean;
  version?: string;
  locator?: string;
}

export interface UniversalOfficialTemplateBundleResult {
  ready: boolean;
  contractType: CanonicalContractType;
  templates: readonly UniversalOfficialTemplateDescriptor[];
  missingKinds: readonly UniversalAdministrativeDocumentKind[];
  blockers: readonly string[];
}

/**
 * Bloque 17.2 - catálogo de modelos oficiales por tipo de contrato.
 *
 * El catálogo no contiene modelos inventados ni aplica fallback entre tipos de
 * contrato. Los descriptores deben proceder de una fuente identificada y estar
 * marcados expresamente como oficiales. La selección exacta del modelo queda
 * así separada de la generación documental.
 */
export class UniversalOfficialTemplateCatalog {
  private readonly descriptors: readonly UniversalOfficialTemplateDescriptor[];

  constructor(descriptors: readonly UniversalOfficialTemplateDescriptor[]) {
    const seen = new Set<string>();
    for (const descriptor of descriptors) {
      const key = `${descriptor.contractType}:${descriptor.documentKind}`;
      if (seen.has(key)) throw new Error(`Modelo oficial duplicado para ${key}.`);
      seen.add(key);
      if (!descriptor.templateId.trim()) throw new Error(`templateId vacío para ${key}.`);
      if (!descriptor.sourceId.trim()) throw new Error(`sourceId vacío para ${key}.`);
      if (!descriptor.official) throw new Error(`El modelo ${descriptor.templateId} no está acreditado como oficial.`);
    }
    this.descriptors = [...descriptors];
  }

  public resolveBundle(
    contractType: CanonicalContractType,
    requiredKinds: readonly UniversalAdministrativeDocumentKind[],
  ): UniversalOfficialTemplateBundleResult {
    const templates = this.descriptors.filter(item => item.contractType === contractType);
    const byKind = new Map(templates.map(item => [item.documentKind, item] as const));
    const missingKinds = requiredKinds.filter(kind => !byKind.has(kind));

    return {
      ready: missingKinds.length === 0,
      contractType,
      templates: requiredKinds.flatMap(kind => {
        const found = byKind.get(kind);
        return found ? [found] : [];
      }),
      missingKinds,
      blockers: missingKinds.map(kind => `No existe modelo oficial ${kind} registrado para el tipo contractual ${contractType}.`),
    };
  }
}
