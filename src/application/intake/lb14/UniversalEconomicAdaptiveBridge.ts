import { buildEconomicInputFromUniversal } from "../../../domain/economic/UniversalEconomicInputBuilder";
import { isPromotableEvidenceField } from "../../../domain/expediente/EvidenceField";
import { UniversalExpedienteV13 } from "../../../domain/expediente/UniversalExpedienteV13";
import { UniversalEconomicEngine, UniversalEconomicEngineResult } from "../../../engines/UniversalEconomicEngine";

export interface UniversalEconomicAdaptiveResult {
  executed: boolean;
  expediente: UniversalExpedienteV13;
  executedEngines: readonly string[];
  blockers: readonly string[];
  missingFields: readonly string[];
}

export class UniversalEconomicAdaptiveBridge {
  constructor(private readonly engine = new UniversalEconomicEngine()) {}

  public tryAdvance(expediente: UniversalExpedienteV13): UniversalEconomicAdaptiveResult {
    if (isPromotableEvidenceField(expediente.economic.legalEstimatedValueCents) || isPromotableEvidenceField(expediente.canonical.fields.estimatedValueCents)) {
      return { executed: false, expediente, executedEngines: [], blockers: [], missingFields: [] };
    }

    if (expediente.economic.legalEstimatedValueCents.status === "SYSTEM_PROPOSAL" || expediente.canonical.fields.estimatedValueCents.status === "SYSTEM_PROPOSAL") {
      return { executed: false, expediente, executedEngines: [], blockers: [], missingFields: [] };
    }

    const built = buildEconomicInputFromUniversal(expediente);
    if (!built.ready || !built.input) {
      return { executed: false, expediente, executedEngines: [], blockers: built.blockers, missingFields: built.missingFields };
    }

    const result: UniversalEconomicEngineResult = this.engine.calculateAndApply(expediente, built.input, "UniversalEconomicAdaptiveBridge:15.4");
    return {
      executed: result.executed.length > 0,
      expediente: result.expediente,
      executedEngines: result.executed,
      blockers: result.blockers,
      missingFields: [],
    };
  }
}
