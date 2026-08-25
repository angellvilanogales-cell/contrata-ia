import { EvidenceField, isPromotableEvidenceField } from "../../../domain/expediente/EvidenceField";
import { UniversalExpedienteV13 } from "../../../domain/expediente/UniversalExpedienteV13";

export interface EconomicLegalClosureResult {
  ready: boolean;
  blockers: readonly string[];
  confirmed: readonly string[];
}

function requirePromotable(field: EvidenceField<unknown>, label: string, blockers: string[], confirmed: string[]): void {
  if (field.status === "SOURCE_CONFLICT") {
    blockers.push(`${label}: existe un conflicto de fuente que no puede cerrarse automáticamente.`);
    return;
  }
  if (!isPromotableEvidenceField(field) || field.value === null) {
    blockers.push(`${label}: el campo no está promocionado/validado.`);
    return;
  }
  confirmed.push(field.key);
}

/**
 * Bloque 15.12 - puerta de cierre del tramo económico-jurídico.
 *
 * No exige completar dominios ajenos al Bloque 15. Su única función es certificar
 * que naturaleza, VE, procedimiento y decisión SARA disponen de evidencia
 * promocionable y que las dos vistas del VE permanecen exactamente alineadas.
 */
export function evaluateEconomicLegalClosure(expediente: UniversalExpedienteV13): EconomicLegalClosureResult {
  const blockers: string[] = [];
  const confirmed: string[] = [];
  const canonicalVe = expediente.canonical.fields.estimatedValueCents;
  const legalVe = expediente.economic.legalEstimatedValueCents;

  requirePromotable(expediente.canonical.fields.contractType, "Naturaleza contractual", blockers, confirmed);
  requirePromotable(canonicalVe, "VE canónico", blockers, confirmed);
  requirePromotable(legalVe, "VE económico universal", blockers, confirmed);
  requirePromotable(expediente.canonical.fields.procedure, "Procedimiento", blockers, confirmed);
  requirePromotable(expediente.regulation.threshold, "Umbral jurídico SARA", blockers, confirmed);
  requirePromotable(expediente.regulation.harmonizedRegulation, "Sujeción a regulación armonizada", blockers, confirmed);

  if (canonicalVe.value !== legalVe.value) {
    blockers.push(`El VE canónico (${String(canonicalVe.value)}) y el VE económico (${String(legalVe.value)}) no coinciden; el Bloque 15 no puede cerrarse.`);
  }

  return { ready: blockers.length === 0, blockers, confirmed };
}
