import { CanonicalExpedienteEngine } from "./CanonicalExpedienteEngine";
import { resolveCanonicalDeadlineDecision } from "./CanonicalLegalSupplement";
import { DeadlineDecisionEngine } from "../domain/legal/modules/plazos/DeadlineDecisionEngine";
import { DeadlineRule } from "../domain/legal/modules/plazos/DeadlineRule";
import { EvidenceField, EvidenceReference } from "../domain/expediente/EvidenceField";
import { UniversalExpedienteV13 } from "../domain/expediente/UniversalExpedienteV13";
import { synchronizeCanonicalIntoUniversal } from "../domain/expediente/UniversalCanonicalSynchronization";

export interface UniversalEngineRunResult {
  expediente: UniversalExpedienteV13;
  executed: readonly string[];
  blockers: readonly string[];
}

function appendUniqueSources(
  current: readonly EvidenceReference[],
  fields: readonly EvidenceField<unknown>[],
): readonly EvidenceReference[] {
  const merged = [...current];
  const seen = new Set(merged.map(source => `${source.kind}|${source.sourceId}|${source.locator ?? ""}`));

  for (const field of fields) {
    for (const source of field.sources) {
      const key = `${source.kind}|${source.sourceId}|${source.locator ?? ""}`;
      if (!seen.has(key)) {
        merged.push(source);
        seen.add(key);
      }
    }
  }

  return merged;
}

function withCanonicalResult(
  expediente: UniversalExpedienteV13,
  canonical: UniversalExpedienteV13["canonical"],
  fieldsWithSources: readonly EvidenceField<unknown>[],
): UniversalExpedienteV13 {
  return {
    ...expediente,
    canonical,
    traceability: {
      ...expediente.traceability,
      sourceRegistry: appendUniqueSources(expediente.traceability.sourceRegistry, fieldsWithSources),
    },
  };
}

function synchronizeAfterCompatibilityRun(
  expediente: UniversalExpedienteV13,
): { expediente: UniversalExpedienteV13; blockers: readonly string[] } {
  const synchronization = synchronizeCanonicalIntoUniversal(expediente);
  return {
    expediente: synchronization.expediente,
    blockers: synchronization.blockers,
  };
}

export class UniversalExpedienteEngine {
  constructor(private readonly canonicalEngine: CanonicalExpedienteEngine) {}

  public ejecutarIdentificacion(expediente: UniversalExpedienteV13): UniversalEngineRunResult {
    const result = this.canonicalEngine.ejecutarIdentificacion(expediente.canonical);
    const updated = withCanonicalResult(
      expediente,
      result.state,
      [result.state.fields.cpvMain, result.state.fields.procedure],
    );
    const synchronized = synchronizeAfterCompatibilityRun(updated);

    return {
      expediente: synchronized.expediente,
      executed: result.executed,
      blockers: synchronized.blockers,
    };
  }

  public ejecutarRegimen(expediente: UniversalExpedienteV13): UniversalEngineRunResult {
    const result = this.canonicalEngine.ejecutarRegimen(expediente.canonical);
    const sourceFields: EvidenceField<unknown>[] = [result.state.fields.solvency];
    if (result.state.fields.publicity) sourceFields.push(result.state.fields.publicity);

    const updated = withCanonicalResult(expediente, result.state, sourceFields);
    const synchronized = synchronizeAfterCompatibilityRun(updated);
    return {
      expediente: synchronized.expediente,
      executed: result.executed,
      blockers: synchronized.blockers,
    };
  }

  public resolverPlazos(
    expediente: UniversalExpedienteV13,
    rules: DeadlineRule[],
    engine: DeadlineDecisionEngine = new DeadlineDecisionEngine(),
  ): UniversalEngineRunResult {
    const result = resolveCanonicalDeadlineDecision(
      expediente.canonical,
      {
        processingType: expediente.processing.processingType,
        harmonizedRegulation: expediente.regulation.harmonizedRegulation,
        urgency: expediente.processing.urgency,
        emergency: expediente.processing.emergency,
        europeanFunding: expediente.regulation.europeanFunding,
      },
      rules,
      engine,
    );

    if (!result.ready || !result.field) {
      return { expediente, executed: [], blockers: result.blockers };
    }

    const updated: UniversalExpedienteV13 = {
      ...expediente,
      regulation: {
        ...expediente.regulation,
        deadlines: { ...result.field, key: "regulation.deadlines" },
      },
      traceability: {
        ...expediente.traceability,
        sourceRegistry: appendUniqueSources(expediente.traceability.sourceRegistry, [result.field]),
      },
    };

    const synchronized = synchronizeAfterCompatibilityRun(updated);
    return {
      expediente: synchronized.expediente,
      executed: ["DeadlineDecisionEngine"],
      blockers: synchronized.blockers,
    };
  }
}
