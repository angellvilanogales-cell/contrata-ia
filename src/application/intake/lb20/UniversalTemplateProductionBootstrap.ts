import { CanonicalContractType } from "../../../domain/expediente/CanonicalExpedienteState";
import { UniversalAdministrativeDocumentKind } from "../lb17/UniversalOfficialTemplateCatalog";
import { evaluateUniversalOfficialTemplateRegistryClosure } from "../lb19/UniversalOfficialTemplateBundle";
import { UniversalOfficialTemplateRegistry } from "../lb19/UniversalOfficialTemplateRegistry";
import { UniversalTemplateSourceIngestionResult } from "./UniversalTemplateSourceIngestion";

export interface UniversalTemplateBootstrapResult {
  registry: UniversalOfficialTemplateRegistry;
  ingestedRegistryIds: readonly string[];
  skipped: readonly string[];
  blockers: readonly string[];
}

/**
 * Bloque 20.4 - incorporación al registro. Solo consume resultados de ingesta
 * técnicamente completos. Incluso entonces permanecen SOURCE_DECLARED hasta la
 * validación humana explícita de LB19.
 */
export function bootstrapUniversalTemplateRegistry(
  baseRegistry: UniversalOfficialTemplateRegistry,
  results: readonly UniversalTemplateSourceIngestionResult[],
): UniversalTemplateBootstrapResult {
  let registry = baseRegistry;
  const ingestedRegistryIds: string[] = [];
  const skipped: string[] = [];
  const blockers: string[] = [];

  for (const result of results) {
    if (!result.ready || result.stage !== "READY_FOR_SOURCE_DECLARATION" || !result.record) {
      skipped.push(...result.blockers, ...result.warnings);
      continue;
    }
    try {
      registry = registry.ingest(result.record);
      ingestedRegistryIds.push(result.record.registryId);
    } catch (error) {
      blockers.push(error instanceof Error ? error.message : "Fallo de incorporación al registro de modelos.");
    }
  }

  return { registry, ingestedRegistryIds, skipped, blockers };
}

export interface UniversalTemplateProductionRequirement {
  contractType: CanonicalContractType;
  procurementDate: string;
  requiredKinds: readonly UniversalAdministrativeDocumentKind[];
}

export interface UniversalTemplateProductionClosureResult {
  ready: boolean;
  blockers: readonly string[];
  covered: readonly string[];
  sourceDeclaredPendingValidation: readonly string[];
}

/**
 * Bloque 20.5 - cierre de disponibilidad de modelos de producción. No confunde
 * "pipeline de ingesta completo" con "catálogo de producción completo". Para
 * declararse viable exige una versión humana-validada y vigente por cada
 * documento requerido en cada escenario contractual definido.
 */
export function evaluateUniversalTemplateProductionClosure(
  registry: UniversalOfficialTemplateRegistry,
  requirements: readonly UniversalTemplateProductionRequirement[],
): UniversalTemplateProductionClosureResult {
  const blockers: string[] = [];
  const covered: string[] = [];

  for (const requirement of requirements) {
    const result = evaluateUniversalOfficialTemplateRegistryClosure(
      registry,
      requirement.contractType,
      requirement.procurementDate,
      requirement.requiredKinds,
    );
    const label = `${requirement.contractType}@${requirement.procurementDate}`;
    if (!result.ready) blockers.push(...result.blockers.map(blocker => `${label}: ${blocker}`));
    else covered.push(...result.selectedRegistryIds.map(id => `${label}:${id}`));
  }

  const sourceDeclaredPendingValidation = registry.list()
    .filter(record => record.status === "SOURCE_DECLARED")
    .map(record => record.registryId);

  return {
    ready: blockers.length === 0,
    blockers,
    covered,
    sourceDeclaredPendingValidation,
  };
}

export interface UniversalTemplateSourceInventoryEntry {
  sourceSet: string;
  fileName: string;
  mediaType: string;
  editableCandidate: boolean;
  role: "REFERENCE_ONLY" | "POTENTIAL_OFFICIAL_MODEL";
  note?: string;
}

export interface UniversalTemplateSourceInventoryAudit {
  total: number;
  editableCandidates: number;
  referenceOnly: number;
  blockers: readonly string[];
}

/**
 * Inventario técnico de fuentes disponibles. Los PDF nunca se cuentan como
 * activos editables de producción, aunque sean PCAP/PPT/memorias útiles como
 * ejemplo o evidencia primaria.
 */
export function auditUniversalTemplateSourceInventory(
  entries: readonly UniversalTemplateSourceInventoryEntry[],
): UniversalTemplateSourceInventoryAudit {
  const editableCandidates = entries.filter(entry => entry.editableCandidate).length;
  const referenceOnly = entries.filter(entry => entry.role === "REFERENCE_ONLY").length;
  const blockers: string[] = [];

  for (const entry of entries) {
    const lower = entry.fileName.toLowerCase();
    if (entry.editableCandidate && !(lower.endsWith(".docx") || lower.endsWith(".odt"))) {
      blockers.push(`${entry.sourceSet}/${entry.fileName}: marcado editable sin extensión DOCX/ODT.`);
    }
    if (!entry.editableCandidate && (lower.endsWith(".docx") || lower.endsWith(".odt"))) {
      blockers.push(`${entry.sourceSet}/${entry.fileName}: existe original editable pero el inventario no lo ha marcado como candidato.`);
    }
  }

  return { total: entries.length, editableCandidates, referenceOnly, blockers };
}
