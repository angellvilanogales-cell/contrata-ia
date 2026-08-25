import { CanonicalContractType } from "../../../domain/expediente/CanonicalExpedienteState";
import { UniversalAdministrativeDocumentKind, UniversalOfficialTemplateCatalog } from "../lb17/UniversalOfficialTemplateCatalog";
import { UniversalEditableTemplateAsset, UniversalEditableTemplateStore } from "../lb18/UniversalEditableTemplateRendering";
import {
  registryRecordToEditableAsset,
  registryRecordToOfficialDescriptor,
  UniversalOfficialTemplateRegistry,
  UniversalOfficialTemplateRegistryRecord,
} from "./UniversalOfficialTemplateRegistry";

export interface UniversalOfficialTemplateBundle {
  contractType: CanonicalContractType;
  procurementDate: string;
  records: readonly UniversalOfficialTemplateRegistryRecord[];
  catalog: UniversalOfficialTemplateCatalog;
  editableStore: UniversalEditableTemplateStore;
}

export interface UniversalOfficialTemplateBundleBuildResult {
  ready: boolean;
  bundle: UniversalOfficialTemplateBundle | null;
  blockers: readonly string[];
}

class InMemoryValidatedEditableTemplateStore implements UniversalEditableTemplateStore {
  private readonly byTemplateId: Map<string, UniversalEditableTemplateAsset>;

  constructor(assets: readonly UniversalEditableTemplateAsset[]) {
    this.byTemplateId = new Map(assets.map(asset => [asset.templateId, asset] as const));
  }

  public async get(templateId: string): Promise<UniversalEditableTemplateAsset | null> {
    return this.byTemplateId.get(templateId) ?? null;
  }
}

/**
 * Bloque 19.4 - puente desde el registro versionado hacia LB17/LB18. La capa
 * documental recibe exclusivamente versiones validadas y vigentes en la fecha
 * del expediente.
 */
export function buildUniversalOfficialTemplateBundle(
  registry: UniversalOfficialTemplateRegistry,
  contractType: CanonicalContractType,
  procurementDate: string,
  requiredKinds: readonly UniversalAdministrativeDocumentKind[],
): UniversalOfficialTemplateBundleBuildResult {
  const blockers: string[] = [];
  const records: UniversalOfficialTemplateRegistryRecord[] = [];

  for (const kind of requiredKinds) {
    const selected = registry.select(contractType, kind, procurementDate);
    if (!selected.ready || !selected.record) {
      blockers.push(...selected.blockers);
      continue;
    }
    records.push(selected.record);
  }

  if (blockers.length > 0) return { ready: false, bundle: null, blockers };

  const descriptors = records.map(registryRecordToOfficialDescriptor);
  const assets = records.map(registryRecordToEditableAsset);
  return {
    ready: true,
    bundle: {
      contractType,
      procurementDate,
      records,
      catalog: new UniversalOfficialTemplateCatalog(descriptors),
      editableStore: new InMemoryValidatedEditableTemplateStore(assets),
    },
    blockers: [],
  };
}

export interface UniversalOfficialTemplateRegistryClosureResult {
  ready: boolean;
  blockers: readonly string[];
  selectedRegistryIds: readonly string[];
}

/**
 * Bloque 19.5 - cierre de registro oficial. No exige que el repositorio contenga
 * todos los modelos posibles: exige que, para un tipo contractual y fecha
 * concretos, exista exactamente una versión humana-validada por documento
 * requerido, sin solapes silenciosos.
 */
export function evaluateUniversalOfficialTemplateRegistryClosure(
  registry: UniversalOfficialTemplateRegistry,
  contractType: CanonicalContractType,
  procurementDate: string,
  requiredKinds: readonly UniversalAdministrativeDocumentKind[],
): UniversalOfficialTemplateRegistryClosureResult {
  const build = buildUniversalOfficialTemplateBundle(registry, contractType, procurementDate, requiredKinds);
  if (!build.ready || !build.bundle) return { ready: false, blockers: build.blockers, selectedRegistryIds: [] };

  const selectedRegistryIds = build.bundle.records.map(record => record.registryId);
  const duplicated = selectedRegistryIds.filter((id, index, values) => values.indexOf(id) !== index);
  const blockers = duplicated.length > 0
    ? [`Un mismo registro se ha seleccionado más de una vez: ${[...new Set(duplicated)].join(", ")}.`]
    : [];

  return { ready: blockers.length === 0, blockers, selectedRegistryIds };
}
