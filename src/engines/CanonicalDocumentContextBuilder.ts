import { CanonicalExpedienteState, evaluateCanonicalPromotion } from "../domain/expediente/CanonicalExpedienteState";
import { isPromotableEvidenceField } from "../domain/expediente/EvidenceField";
import { DocumentContext } from "../domain/documental/DocumentContext";
import { ProcedureType } from "../domain/types/ProcedureType";
import { CanonicalLegalDocumentResults } from "./CanonicalLegalSupplement";

export interface CanonicalDocumentContextBuildResult {
  ready: boolean;
  context?: DocumentContext;
  blockers: readonly string[];
  warnings: readonly string[];
}

const PROCEDURE_MAP: Record<string, ProcedureType> = {
  ABIERTO: ProcedureType.OPEN,
  ABIERTO_SIMPLIFICADO: ProcedureType.OPEN_SIMPLIFIED,
  ABIERTO_SIMPLIFICADO_ABREVIADO: ProcedureType.OPEN_SIMPLIFIED_ABBREVIATED,
  RESTRINGIDO: ProcedureType.RESTRICTED,
  LICITACION_CON_NEGOCIACION: ProcedureType.NEGOTIATED,
  CONTRATO_MENOR: ProcedureType.MINOR,
};

export function buildCanonicalDocumentContext(
  state: CanonicalExpedienteState,
  generatedAt: Date = new Date(),
  legalResults: CanonicalLegalDocumentResults = {},
): CanonicalDocumentContextBuildResult {
  const promotion = evaluateCanonicalPromotion(state);
  const blockers = [...promotion.blockers];
  const warnings = [...state.warnings];

  const contractType = state.fields.contractType.value;
  const procedureRaw = state.fields.procedure.value;
  const procedure = procedureRaw ? PROCEDURE_MAP[procedureRaw] : undefined;

  if (!contractType) blockers.push("No existe tipo de contrato canónico para el contexto documental.");
  if (!procedureRaw) blockers.push("No existe procedimiento canónico para el contexto documental.");
  if (procedureRaw && !procedure) blockers.push(`Procedimiento no mapeado al framework documental: ${procedureRaw}`);

  if (legalResults.threshold && (!isPromotableEvidenceField(legalResults.threshold) || legalResults.threshold.value === null)) {
    blockers.push("El resultado de umbral aportado no es promocionable.");
  }
  if (legalResults.deadlines && (!isPromotableEvidenceField(legalResults.deadlines) || legalResults.deadlines.value === null)) {
    blockers.push("El resultado de plazos aportado no es promocionable.");
  }

  if (blockers.length > 0 || !contractType || !procedure) {
    return { ready: false, blockers, warnings };
  }

  const context: DocumentContext = {
    request: {
      expedienteId: state.id,
      contract: {
        type: contractType,
        object: state.fields.object.value,
        estimatedValueCents: state.fields.estimatedValueCents.value,
        baseTenderBudgetCents: state.fields.baseTenderBudgetCents.value,
        durationMonths: state.fields.durationMonths.value,
        extensionMonths: state.fields.extensionMonths.value,
        modificationPercent: state.fields.modificationPercent.value,
      },
      procedure: procedureRaw,
      cpv: state.fields.cpvMain.value,
      metadata: {
        canonicalLifecycleState: state.lifecycleState,
        warnings: state.warnings,
      },
    },
    procedure: {
      value: procedure,
      justification: `Procedimiento trasladado desde el expediente canónico: ${procedureRaw}.`,
      requiresHumanValidation: false,
    },
    thresholds: legalResults.threshold?.value !== null && legalResults.threshold?.value !== undefined
      ? {
          value: legalResults.threshold.value,
          justification: "Resultado de umbral trasladado desde evidencia jurídica promocionable.",
          requiresHumanValidation: false,
        }
      : {
          justification: "No existe todavía un resultado de umbral promocionable; no se infiere silenciosamente.",
        },
    cpv: {
      value: state.fields.cpvMain.value ?? undefined,
      requiresHumanValidation: false,
    },
    solvency: {
      value: state.fields.solvency.value ? [...state.fields.solvency.value] : undefined,
      requiresHumanValidation: false,
    },
    award: {
      value: state.fields.awardCriteria.value ? [...state.fields.awardCriteria.value] : undefined,
      requiresHumanValidation: false,
    },
    publication: {
      value: state.fields.publicity?.value ?? undefined,
      requiresHumanValidation: false,
    },
    deadlines: legalResults.deadlines?.value
      ? {
          value: legalResults.deadlines.value,
          justification: legalResults.deadlines.diagnostics?.join(" | "),
          requiresHumanValidation: false,
        }
      : {
          justification: "No existe todavía un resultado de plazos promocionable; no se infiere silenciosamente.",
        },
    lots: {
      value: state.fields.lots.value ? [...state.fields.lots.value] : undefined,
      requiresHumanValidation: false,
    },
    contractType: {
      value: contractType,
      requiresHumanValidation: false,
    },
    expedienteNumber: state.id,
    generatedAt,
    version: "CANONICAL-DOCUMENT-CONTEXT-12.7-v1",
    language: "es-ES",
  };

  if (!state.fields.publicity) {
    warnings.push("Publicidad no disponible en el estado canónico; se mantiene sin inferencia automática.");
  }
  if (!legalResults.threshold) {
    warnings.push("Umbral jurídico no aportado como evidencia promocionable; permanece sin inferencia automática.");
  }
  if (!legalResults.deadlines) {
    warnings.push("Plazos jurídicos no aportados como evidencia promocionable; permanecen sin inferencia automática.");
  }

  return { ready: true, context, blockers: [], warnings };
}
