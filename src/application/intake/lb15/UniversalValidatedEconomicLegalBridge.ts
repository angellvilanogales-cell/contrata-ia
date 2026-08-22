import { isPromotableEvidenceField } from "../../../domain/expediente/EvidenceField";
import { UniversalExpedienteV13 } from "../../../domain/expediente/UniversalExpedienteV13";
import { UniversalEngineRunResult } from "../../../engines/UniversalExpedienteEngine";
import { UniversalAdaptiveEnginePort } from "../lb14/UniversalAdaptiveActionExecutor";

export interface UniversalValidatedEconomicLegalBridgeResult extends UniversalEngineRunResult {
  executedProcedure: boolean;
}

/**
 * Bloque 15.9.
 *
 * Conecta un valor estimado económico ya validado humanamente con la propuesta
 * normativa de procedimiento. El puente no calcula ni presume SARA: la sujeción
 * a regulación armonizada conserva su evidencia propia y permanece pendiente
 * hasta que exista una regla o fuente suficiente para resolverla.
 */
export class UniversalValidatedEconomicLegalBridge {
  constructor(private readonly engine: Pick<UniversalAdaptiveEnginePort, "ejecutarIdentificacion">) {}

  public tryAdvance(expediente: UniversalExpedienteV13): UniversalValidatedEconomicLegalBridgeResult {
    const contractType = expediente.canonical.fields.contractType;
    const canonicalVe = expediente.canonical.fields.estimatedValueCents;
    const legalVe = expediente.economic.legalEstimatedValueCents;
    const procedure = expediente.canonical.fields.procedure;

    if (contractType.status === "SOURCE_CONFLICT") {
      return {
        expediente,
        executed: [],
        blockers: ["No puede proponerse el procedimiento mientras exista un conflicto de fuente sobre la naturaleza contractual."],
        executedProcedure: false,
      };
    }

    if (canonicalVe.status === "SOURCE_CONFLICT" || legalVe.status === "SOURCE_CONFLICT") {
      return {
        expediente,
        executed: [],
        blockers: ["No puede proponerse el procedimiento mientras exista un conflicto de fuente sobre el valor estimado."],
        executedProcedure: false,
      };
    }

    if (!isPromotableEvidenceField(contractType) || contractType.value === null) {
      return {
        expediente,
        executed: [],
        blockers: ["La naturaleza contractual debe estar promocionada antes de determinar el procedimiento."],
        executedProcedure: false,
      };
    }

    if (canonicalVe.value !== legalVe.value) {
      return {
        expediente,
        executed: [],
        blockers: [
          `El VE canónico (${String(canonicalVe.value)}) y el VE jurídico universal (${String(legalVe.value)}) no coinciden. Debe resolverse la divergencia antes de determinar el procedimiento.`,
        ],
        executedProcedure: false,
      };
    }

    if (
      canonicalVe.status !== "HUMAN_VALIDATED" ||
      legalVe.status !== "HUMAN_VALIDATED" ||
      !canonicalVe.humanValidated ||
      !legalVe.humanValidated
    ) {
      return {
        expediente,
        executed: [],
        blockers: ["El valor estimado debe estar validado humanamente en sus vistas canónica y económica antes de determinar el procedimiento en el Bloque 15.9."],
        executedProcedure: false,
      };
    }

    if (procedure.status === "SOURCE_CONFLICT") {
      return {
        expediente,
        executed: [],
        blockers: ["Existe un conflicto de fuente sobre el procedimiento y no puede sustituirse por una propuesta automática."],
        executedProcedure: false,
      };
    }

    if (isPromotableEvidenceField(procedure) || procedure.status === "SYSTEM_PROPOSAL") {
      return {
        expediente,
        executed: [],
        blockers: [],
        executedProcedure: false,
      };
    }

    const harmonizedBefore = expediente.regulation.harmonizedRegulation;
    const result = this.engine.ejecutarIdentificacion(expediente);
    const executedProcedure = result.executed.includes("ProcedimientoEngine");

    if (!executedProcedure && result.blockers.length === 0) {
      return {
        expediente: result.expediente,
        executed: result.executed,
        blockers: ["El Bloque 15.9 no obtuvo una propuesta de procedimiento pese a disponer de naturaleza contractual y VE validados."],
        executedProcedure: false,
      };
    }

    const harmonizedAfter = result.expediente.regulation.harmonizedRegulation;
    if (
      harmonizedAfter.status !== harmonizedBefore.status ||
      harmonizedAfter.value !== harmonizedBefore.value
    ) {
      return {
        expediente,
        executed: [],
        blockers: ["El puente 15.9 intentó alterar la sujeción SARA sin evidencia específica; la operación se ha bloqueado."],
        executedProcedure: false,
      };
    }

    return {
      ...result,
      executedProcedure,
    };
  }
}
