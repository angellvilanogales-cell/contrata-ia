import { UniversalExpedienteV13 } from "../../../domain/expediente/UniversalExpedienteV13";
import { buildUniversalDocumentMappingPackage } from "../lb17/UniversalDocumentMappingPackage";
import { UniversalOfficialTemplateCatalog } from "../lb17/UniversalOfficialTemplateCatalog";
import { auditUniversalEditableRendering, renderUniversalEditableDocuments, UniversalEditableTemplateStore, UniversalRenderedEditableDocument } from "../lb18/UniversalEditableTemplateRendering";
import { registryRecordToEditableAsset, registryRecordToOfficialDescriptor, UniversalOfficialTemplateRegistry, UniversalOfficialTemplateRegistryRecord } from "../lb19/UniversalOfficialTemplateRegistry";
import { qualifyRealTemplateMapping } from "../lb22/UniversalRealTemplateMappingRegistry";
import { JDA_SUPPLY_ASA_OFFICIAL_ODT_DISCOVERY } from "../lb23/JuntaOfficialEditableTemplateDiscovery";
import { UniversalEditableTemplateBinaryStore, UniversalOdtProductionRenderer } from "../lb23/UniversalOdtProductionRenderer";
import { JDA_SUPPLY_ASA_VERIFIED_MANIFEST } from "../lb25/JuntaSupplyAsaOfficialActivation";
import {
  JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET,
  JDA_SUPPLY_ASA_LB34_MAPPING_PROFILE,
  JDA_SUPPLY_ASA_LB34_RENDERER_CONFIGURATION,
  evaluateJdaSupplyAsaLb34PhysicalClosure,
} from "../lb34/JuntaSupplyAsaModificationSection";
import { auditJdaSupplyAsaRenderedOdt } from "../lb35/JuntaSupplyAsaAnexoIResidualAudit";

export const JDA_SUPPLY_ASA_PRODUCTION_REGISTRY_RECORD: UniversalOfficialTemplateRegistryRecord = {
  registryId: "jda:pcap:supply:asa:2025-12-17:v1",
  templateId: JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET.templateId,
  sourceId: JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET.sourceId,
  sourceLocator: JDA_SUPPLY_ASA_OFFICIAL_ODT_DISCOVERY.locator,
  contractType: "SUPPLY",
  documentKind: "PCAP",
  format: "ODT",
  mediaType: JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET.mediaType,
  contentHash: JDA_SUPPLY_ASA_VERIFIED_MANIFEST.contentHash,
  styleFingerprint: JDA_SUPPLY_ASA_VERIFIED_MANIFEST.styleFingerprint,
  slotIds: [...JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET.slotIds],
  effectiveFrom: "2025-12-17",
  status: "HUMAN_VALIDATED",
  validatedBy: JDA_SUPPLY_ASA_OFFICIAL_ODT_DISCOVERY.validatedBy ?? "SOURCE_REVIEW_2026-08-23",
  validationNote: "Original ODT aportado e inspeccionado; hashes y bindings físicos LB31-LB34 verificados contra el modelo de diciembre de 2025. LB35 exige además auditoría residual posterior al render antes de considerar completo el Anexo I.",
};

export type SupplyAsaProtectedPipelineStage =
  | "NEEDS_UNIVERSAL_EVIDENCE"
  | "NEEDS_OFFICIAL_TEMPLATE"
  | "NEEDS_PHYSICAL_COVERAGE"
  | "NEEDS_TEMPLATE_BYTES"
  | "READY_FOR_PROTECTED_RENDER"
  | "RENDERED_AWAITING_HUMAN_AUDIT";

export interface SupplyAsaProtectedPipelineReadiness {
  ready: boolean;
  stage: SupplyAsaProtectedPipelineStage;
  blockers: readonly string[];
  templateId: string;
  legacyGenerationAllowed: false;
}

function templateRegistry(): UniversalOfficialTemplateRegistry {
  return new UniversalOfficialTemplateRegistry([JDA_SUPPLY_ASA_PRODUCTION_REGISTRY_RECORD]);
}

function mappingQualification() {
  return qualifyRealTemplateMapping(JDA_SUPPLY_ASA_LB34_MAPPING_PROFILE, [JDA_SUPPLY_ASA_OFFICIAL_ODT_DISCOVERY]);
}

/**
 * Puerta única del escenario PCAP suministro ASA. No usa el generador legacy
 * como fallback. LB34 acredita que todos los bindings actualmente registrados
 * tienen soporte físico seguro; LB35 comprueba después del render que el Anexo I
 * no conserve decisiones aplicables del órgano de contratación sin resolver.
 */
export function evaluateSupplyAsaProtectedPipelineReadiness(
  expediente: UniversalExpedienteV13,
  procurementDate: string,
  binaryAvailable: boolean,
): SupplyAsaProtectedPipelineReadiness {
  const registry = templateRegistry();
  const selected = registry.select("SUPPLY", "PCAP", procurementDate);
  if (!selected.ready || !selected.record) {
    return { ready: false, stage: "NEEDS_OFFICIAL_TEMPLATE", blockers: selected.blockers, templateId: JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET.templateId, legacyGenerationAllowed: false };
  }

  const qualification = mappingQualification();
  if (!qualification.productionEligible || !qualification.mappingSpec) {
    return { ready: false, stage: "NEEDS_OFFICIAL_TEMPLATE", blockers: qualification.blockers.length ? qualification.blockers : qualification.warnings, templateId: selected.record.templateId, legacyGenerationAllowed: false };
  }

  const catalog = new UniversalOfficialTemplateCatalog([registryRecordToOfficialDescriptor(selected.record)]);
  const mapping = buildUniversalDocumentMappingPackage(expediente, catalog, [qualification.mappingSpec]);
  if (!mapping.ready) {
    return { ready: false, stage: "NEEDS_UNIVERSAL_EVIDENCE", blockers: mapping.blockers, templateId: selected.record.templateId, legacyGenerationAllowed: false };
  }

  const physical = evaluateJdaSupplyAsaLb34PhysicalClosure();
  if (!physical.fullPhysicalCoverageReady) {
    return { ready: false, stage: "NEEDS_PHYSICAL_COVERAGE", blockers: physical.blockers.map(item => item.finding), templateId: selected.record.templateId, legacyGenerationAllowed: false };
  }

  if (!binaryAvailable) {
    return { ready: false, stage: "NEEDS_TEMPLATE_BYTES", blockers: [`No están disponibles en runtime los bytes SHA-256 ${selected.record.contentHash}.`], templateId: selected.record.templateId, legacyGenerationAllowed: false };
  }

  return { ready: true, stage: "READY_FOR_PROTECTED_RENDER", blockers: [], templateId: selected.record.templateId, legacyGenerationAllowed: false };
}

export interface SupplyAsaProtectedPipelineRenderResult {
  readiness: SupplyAsaProtectedPipelineReadiness;
  document: UniversalRenderedEditableDocument | null;
  auditReady: boolean;
  auditBlockers: readonly string[];
}

/** Ejecución del pipeline real sobre el activo oficial exacto y perfil físico LB34 + auditoría residual LB35. */
export async function renderSupplyAsaProtectedPcap(
  expediente: UniversalExpedienteV13,
  procurementDate: string,
  binaryStore: UniversalEditableTemplateBinaryStore,
): Promise<SupplyAsaProtectedPipelineRenderResult> {
  const source = await binaryStore.get(JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET.templateId);
  const readiness = evaluateSupplyAsaProtectedPipelineReadiness(expediente, procurementDate, Boolean(source));
  if (!readiness.ready) return { readiness, document: null, auditReady: false, auditBlockers: readiness.blockers };

  const registry = templateRegistry();
  const selected = registry.select("SUPPLY", "PCAP", procurementDate);
  if (!selected.record) throw new Error("Inconsistencia interna: modelo oficial no seleccionado tras superar readiness.");
  const qualification = mappingQualification();
  if (!qualification.mappingSpec) throw new Error("Inconsistencia interna: mapping oficial no disponible tras superar readiness.");

  const catalog = new UniversalOfficialTemplateCatalog([registryRecordToOfficialDescriptor(selected.record)]);
  const mapping = buildUniversalDocumentMappingPackage(expediente, catalog, [qualification.mappingSpec]);
  const asset = registryRecordToEditableAsset(selected.record);
  const assetStore: UniversalEditableTemplateStore = { async get(templateId) { return templateId === asset.templateId ? asset : null; } };
  const renderer = new UniversalOdtProductionRenderer(binaryStore, JDA_SUPPLY_ASA_LB34_RENDERER_CONFIGURATION);
  const rendering = await renderUniversalEditableDocuments(mapping, assetStore, renderer);
  const packageAudit = auditUniversalEditableRendering(mapping, rendering);
  const document = rendering.documents.find(item => item.documentKind === "PCAP") ?? null;
  const residualAudit = document ? auditJdaSupplyAsaRenderedOdt(document.bytes) : null;
  const auditBlockers = [...packageAudit.blockers, ...(residualAudit?.blockers ?? [])];
  return {
    readiness: { ...readiness, stage: document ? "RENDERED_AWAITING_HUMAN_AUDIT" : readiness.stage },
    document,
    auditReady: packageAudit.ready && Boolean(residualAudit?.ready),
    auditBlockers,
  };
}
