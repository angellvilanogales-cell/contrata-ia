import { CanonicalExpedienteEngine } from "./CanonicalExpedienteEngine";
import { resolveCanonicalDeadlineDecision } from "./CanonicalLegalSupplement";
import { DeadlineDecisionEngine } from "../domain/legal/modules/plazos/DeadlineDecisionEngine";
import { DeadlineRule } from "../domain/legal/modules/plazos/DeadlineRule";
import { EvidenceField, EvidenceReference } from "../domain/expediente/EvidenceField";
import { UniversalExpedienteV13 } from "../domain/expediente/UniversalExpedienteV13";
import {
  canonicalCompatibilityView,
  synchronizeCanonicalIntoUniversal,
} from "../domain/expediente/UniversalCanonicalSynchronization";

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

function synchronizationPreflight(
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
    const preflight = synchronizationPreflight(expediente);
    if (preflight.blockers.length > 0) {
      return { expediente: preflight.expediente, executed: [], blockers: preflight.blockers };
    }

    const result = this.canonicalEngine.ejecutarIdentificacion(canonicalCompatibilityView(preflight.expediente));
    const updated = withCanonicalResult(
      preflight.expediente,
      result.state,
      [result.state.fields.cpvMain, result.state.fields.procedure],
    );
    const synchronized = synchronizationPreflight(updated);

    return {
      expediente: synchronized.expediente,
      executed: result.executed,
      blockers: synchronized.blockers,
    };
  }

  public ejecutarRegimen(expediente: UniversalExpedienteV13): UniversalEngineRunResult {
    const preflight = synchronizationPreflight(expediente);
    if (preflight.blockers.length > 0) {
      return { expediente: preflight.expediente, executed: [], blockers: preflight.blockers };
    }

    const result = this.canonicalEngine.ejecutarRegimen(canonicalCompatibilityView(preflight.expediente));
    const sourceFields: EvidenceField<unknown>[] = [result.state.fields.solvency];
    if (result.state.fields.publicity) sourceFields.push(result.state.fields.publicity);

    const updated = withCanonicalResult(preflight.expediente, result.state, sourceFields);
    const synchronized = synchronizationPreflight(updated);
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
    const preflight = synchronizationPreflight(expediente);
    if (preflight.blockers.length > 0) {
      return { expediente: preflight.expediente, executed: [], blockers: preflight.blockers };
    }

    const result = resolveCanonicalDeadlineDecision(
      canonicalCompatibilityView(preflight.expediente),
      {
        processingType: preflight.expediente.processing.processingType,
        harmonizedRegulation: preflight.expediente.regulation.harmonizedRegulation,
        urgency: preflight.expediente.processing.urgency,
        emergency: preflight.expediente.processing.emergency,
        europeanFunding: preflight.expediente.regulation.europeanFunding,
      },
      rules,
      engine,
    );

    if (!result.ready || !result.field) {
      return { expediente: preflight.expediente, executed: [], blockers: result.blockers };
    }

    const updated: UniversalExpedienteV13 = {
      ...preflight.expediente,
      regulation: {
        ...preflight.expediente.regulation,
        deadlines: { ...result.field, key: "regulation.deadlines" },
      },
      traceability: {
        ...preflight.expediente.traceability,
        sourceRegistry: appendUniqueSources(preflight.expediente.traceability.sourceRegistry, [result.field]),
      },
    };

    const synchronized = synchronizationPreflight(updated);
    return {
      expediente: synchronized.expediente,
      executed: ["DeadlineDecisionEngine"],
      blockers: synchronized.blockers,
    };
  }
}
