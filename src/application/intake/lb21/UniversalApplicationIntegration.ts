import { isPromotableEvidenceField } from "../../../domain/expediente/EvidenceField";
import { UniversalExpedienteV13 } from "../../../domain/expediente/UniversalExpedienteV13";
import { evaluateUniversalDocumentReadiness } from "../lb17/UniversalDocumentReadinessGate";
import { UniversalAdministrativeDocumentKind } from "../lb17/UniversalOfficialTemplateCatalog";
import { UniversalOfficialTemplateRegistry } from "../lb19/UniversalOfficialTemplateRegistry";
import { evaluateUniversalTemplateProductionClosure } from "../lb20/UniversalTemplateProductionBootstrap";

export type UniversalApplicationStage =
  | "NEEDS_UNIVERSAL_EVIDENCE"
  | "NEEDS_HUMAN_VALIDATION"
  | "NEEDS_OFFICIAL_TEMPLATES"
  | "READY_FOR_PROTECTED_DOCUMENT_PIPELINE";

export interface UniversalApplicationIntegrationResult {
  ready: boolean;
  stage: UniversalApplicationStage;
  blockers: readonly string[];
  pendingFields: readonly string[];
  conflictFields: readonly string[];
  legacyGenerationAllowed: false;
}

/**
 * Bloque 21.2-21.4. Punto único de decisión para la aplicación visible.
 * La interfaz deja de poder interpretar que una validación LB6 equivale a
 * expediente universal listo. La generación V1 solo puede arrancar cuando
 * LB17 y el catálogo de producción LB20 están cerrados.
 */
export function evaluateUniversalApplicationIntegration(
  expediente: UniversalExpedienteV13,
  registry: UniversalOfficialTemplateRegistry,
  procurementDate: string,
  requiredKinds: readonly UniversalAdministrativeDocumentKind[],
): UniversalApplicationIntegrationResult {
  const readiness = evaluateUniversalDocumentReadiness(expediente);

  if (!readiness.ready) {
    const hasValidation = [
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
    ].filter(Boolean).some(field => field?.humanValidationRequired && !field.humanValidated);

    return {
      ready: false,
      stage: hasValidation ? "NEEDS_HUMAN_VALIDATION" : "NEEDS_UNIVERSAL_EVIDENCE",
      blockers: readiness.blockers,
      pendingFields: readiness.pendingFields,
      conflictFields: readiness.conflictFields,
      legacyGenerationAllowed: false,
    };
  }

  const contractType = expediente.canonical.fields.contractType;
  if (!isPromotableEvidenceField(contractType) || contractType.value === null) {
    return {
      ready: false,
      stage: "NEEDS_UNIVERSAL_EVIDENCE",
      blockers: ["El tipo contractual no está promocionado; no puede seleccionarse el modelo oficial de producción."],
      pendingFields: [contractType.key],
      conflictFields: [],
      legacyGenerationAllowed: false,
    };
  }

  const templates = evaluateUniversalTemplateProductionClosure(registry, [{
    contractType: contractType.value,
    procurementDate,
    requiredKinds,
  }]);

  if (!templates.ready) {
    return {
      ready: false,
      stage: "NEEDS_OFFICIAL_TEMPLATES",
      blockers: templates.blockers,
      pendingFields: [],
      conflictFields: [],
      legacyGenerationAllowed: false,
    };
  }

  return {
    ready: true,
    stage: "READY_FOR_PROTECTED_DOCUMENT_PIPELINE",
    blockers: [],
    pendingFields: [],
    conflictFields: [],
    legacyGenerationAllowed: false,
  };
}
