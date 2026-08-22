import { CanonicalContractType } from "../../../domain/expediente/CanonicalExpedienteState";
import { EvidenceField, EvidenceReference, isPromotableEvidenceField } from "../../../domain/expediente/EvidenceField";
import { UniversalExpedienteV13 } from "../../../domain/expediente/UniversalExpedienteV13";
import { evaluateUniversalDocumentReadiness } from "./UniversalDocumentReadinessGate";
import {
  UniversalAdministrativeDocumentKind,
  UniversalOfficialTemplateCatalog,
  UniversalOfficialTemplateDescriptor,
} from "./UniversalOfficialTemplateCatalog";

export interface UniversalDocumentSlotMapping {
  slotId: string;
  fieldKey: string;
  required: boolean;
}

export interface UniversalDocumentMappingSpec {
  documentKind: UniversalAdministrativeDocumentKind;
  templateId: string;
  slots: readonly UniversalDocumentSlotMapping[];
}

export interface UniversalMappedDocumentFact {
  slotId: string;
  fieldKey: string;
  value: unknown;
  evidenceStatus: EvidenceField<unknown>["status"];
  sources: readonly EvidenceReference[];
  legalBasis: readonly string[];
  diagnostics: readonly string[];
}

export interface UniversalMappedDocument {
  documentKind: UniversalAdministrativeDocumentKind;
  template: UniversalOfficialTemplateDescriptor;
  facts: readonly UniversalMappedDocumentFact[];
}

export type UniversalDocumentMappingStage =
  | "BLOCKED_READINESS"
  | "NEEDS_OFFICIAL_TEMPLATE"
  | "INVALID_MAPPING"
  | "READY_FOR_RENDERING";

export interface UniversalDocumentMappingPackageResult {
  ready: boolean;
  stage: UniversalDocumentMappingStage;
  contractType: CanonicalContractType | null;
  documents: readonly UniversalMappedDocument[];
  blockers: readonly string[];
}

function allFields(expediente: UniversalExpedienteV13): EvidenceField<unknown>[] {
  return [
    ...Object.values(expediente.canonical.fields),
    ...Object.values(expediente.processing),
    ...Object.values(expediente.regulation),
    ...Object.values(expediente.economic),
    ...Object.values(expediente.administrative),
    ...Object.values(expediente.technical),
    ...Object.values(expediente.lots),
    ...Object.values(expediente.guarantees),
    ...Object.values(expediente.execution),
    ...Object.values(expediente.criteria),
  ].filter(Boolean) as EvidenceField<unknown>[];
}

function findField(expediente: UniversalExpedienteV13, key: string): EvidenceField<unknown> | undefined {
  return allFields(expediente).find(field => field.key === key);
}

/**
 * Bloques 17.3 y 17.4 - proyección protegida de evidencia a los huecos de un
 * modelo oficial. No redacta cláusulas, no completa texto ausente y no cambia
 * el valor ni la procedencia de la evidencia.
 */
export function buildUniversalDocumentMappingPackage(
  expediente: UniversalExpedienteV13,
  catalog: UniversalOfficialTemplateCatalog,
  specs: readonly UniversalDocumentMappingSpec[],
): UniversalDocumentMappingPackageResult {
  const readiness = evaluateUniversalDocumentReadiness(expediente);
  const contractTypeField = expediente.canonical.fields.contractType;
  const contractType = contractTypeField.value as CanonicalContractType | null;

  if (!readiness.ready || !contractType || !isPromotableEvidenceField(contractTypeField)) {
    return {
      ready: false,
      stage: "BLOCKED_READINESS",
      contractType,
      documents: [],
      blockers: readiness.blockers.length > 0 ? readiness.blockers : ["El tipo contractual no está promocionado para selección de modelo."],
    };
  }

  const duplicateKinds = specs
    .map(spec => spec.documentKind)
    .filter((kind, index, values) => values.indexOf(kind) !== index);
  if (duplicateKinds.length > 0) {
    return {
      ready: false,
      stage: "INVALID_MAPPING",
      contractType,
      documents: [],
      blockers: [...new Set(duplicateKinds)].map(kind => `Existe más de una especificación documental para ${kind}.`),
    };
  }

  const requiredKinds = specs.map(spec => spec.documentKind);
  const bundle = catalog.resolveBundle(contractType, requiredKinds);
  if (!bundle.ready) {
    return {
      ready: false,
      stage: "NEEDS_OFFICIAL_TEMPLATE",
      contractType,
      documents: [],
      blockers: bundle.blockers,
    };
  }

  const templateByKind = new Map(bundle.templates.map(template => [template.documentKind, template] as const));
  const blockers: string[] = [];
  const documents: UniversalMappedDocument[] = [];

  for (const spec of specs) {
    const template = templateByKind.get(spec.documentKind);
    if (!template || template.templateId !== spec.templateId) {
      blockers.push(`La especificación ${spec.documentKind} no referencia exactamente el modelo oficial resuelto para ${contractType}.`);
      continue;
    }

    const duplicateSlots = spec.slots
      .map(slot => slot.slotId)
      .filter((slot, index, values) => values.indexOf(slot) !== index);
    if (duplicateSlots.length > 0) {
      blockers.push(`El modelo ${spec.templateId} contiene slotId duplicado: ${[...new Set(duplicateSlots)].join(", ")}.`);
      continue;
    }

    const facts: UniversalMappedDocumentFact[] = [];
    for (const slot of spec.slots) {
      const field = findField(expediente, slot.fieldKey);
      if (!field) {
        blockers.push(`El slot ${slot.slotId} referencia un campo inexistente: ${slot.fieldKey}.`);
        continue;
      }
      if (field.status === "SOURCE_CONFLICT" || !isPromotableEvidenceField(field)) {
        blockers.push(`El slot ${slot.slotId} no puede usar evidencia no promocionable: ${slot.fieldKey}.`);
        continue;
      }
      if (slot.required && field.status === "NOT_APPLICABLE") {
        blockers.push(`El slot obligatorio ${slot.slotId} no admite que ${slot.fieldKey} sea NOT_APPLICABLE.`);
        continue;
      }

      facts.push({
        slotId: slot.slotId,
        fieldKey: slot.fieldKey,
        value: field.value,
        evidenceStatus: field.status,
        sources: [...field.sources],
        legalBasis: [...(field.legalBasis ?? [])],
        diagnostics: [...(field.diagnostics ?? [])],
      });
    }

    documents.push({ documentKind: spec.documentKind, template, facts });
  }

  if (blockers.length > 0) {
    return { ready: false, stage: "INVALID_MAPPING", contractType, documents, blockers };
  }

  return { ready: true, stage: "READY_FOR_RENDERING", contractType, documents, blockers: [] };
}

export interface UniversalDocumentMappingClosureResult {
  ready: boolean;
  blockers: readonly string[];
}

/**
 * Bloque 17.5 - cierre. Solo certifica que existe un paquete trazable de datos
 * y modelos oficiales listo para la futura capa de renderizado; no afirma que
 * los documentos ya hayan sido redactados o generados.
 */
export function evaluateUniversalDocumentMappingClosure(
  result: UniversalDocumentMappingPackageResult,
  requiredKinds: readonly UniversalAdministrativeDocumentKind[],
): UniversalDocumentMappingClosureResult {
  const blockers = [...result.blockers];
  if (!result.ready || result.stage !== "READY_FOR_RENDERING") {
    if (blockers.length === 0) blockers.push("El paquete documental todavía no está listo para renderizado.");
    return { ready: false, blockers };
  }

  const present = new Set(result.documents.map(document => document.documentKind));
  for (const kind of requiredKinds) {
    if (!present.has(kind)) blockers.push(`Falta el documento requerido ${kind} en el paquete de mapeo.`);
  }

  for (const document of result.documents) {
    if (!document.template.official || !document.template.sourceId.trim()) {
      blockers.push(`El documento ${document.documentKind} no conserva una referencia a modelo oficial acreditado.`);
    }
  }

  return { ready: blockers.length === 0, blockers };
}
