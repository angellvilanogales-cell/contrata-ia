import { EvidenceField, EvidenceReference } from "../../../domain/expediente/EvidenceField";
import { TipoEvento } from "../../../domain/expediente/ExpedienteJournal";
import { UniversalExpedienteV13 } from "../../../domain/expediente/UniversalExpedienteV13";
import { UniversalAdaptiveAction } from "./UniversalAdaptiveQuestionEngine";

export interface HumanDecisionMetadata {
  actor: string;
  rationale: string;
}

export interface HumanDecisionApplicationResult {
  expediente: UniversalExpedienteV13;
  updatedFieldKey: string;
}

function humanReference(actionId: string, metadata: HumanDecisionMetadata): EvidenceReference {
  return {
    kind: "USER_INPUT",
    sourceId: `human-decision:${actionId}`,
    note: `Validado por ${metadata.actor}. Motivación: ${metadata.rationale}`,
  };
}

function appendUniqueSource(
  sources: readonly EvidenceReference[],
  source: EvidenceReference,
): readonly EvidenceReference[] {
  if (sources.some(item => item.kind === source.kind && item.sourceId === source.sourceId)) return sources;
  return [...sources, source];
}

function getField(expediente: UniversalExpedienteV13, key: string): EvidenceField<unknown> | undefined {
  const canonical = expediente.canonical.fields as unknown as Record<string, EvidenceField<unknown>>;
  if (canonical[key]) return canonical[key];

  const [domainName] = key.split(".");
  const domain = (expediente as unknown as Record<string, unknown>)[domainName];
  if (!domain || typeof domain !== "object") return undefined;
  return (domain as Record<string, EvidenceField<unknown>>)[key.split(".").slice(1).join(".")];
}

function replaceField(
  expediente: UniversalExpedienteV13,
  key: string,
  field: EvidenceField<unknown>,
): UniversalExpedienteV13 {
  const canonical = expediente.canonical.fields as unknown as Record<string, EvidenceField<unknown>>;
  if (canonical[key]) {
    return {
      ...expediente,
      canonical: {
        ...expediente.canonical,
        fields: {
          ...expediente.canonical.fields,
          [key]: field,
        },
      },
    } as UniversalExpedienteV13;
  }

  const [domainName, ...rest] = key.split(".");
  const property = rest.join(".");
  const domain = (expediente as unknown as Record<string, unknown>)[domainName];
  if (!domain || typeof domain !== "object" || !property) {
    throw new Error(`No se puede localizar el campo universal ${key}.`);
  }

  return {
    ...expediente,
    [domainName]: {
      ...(domain as Record<string, unknown>),
      [property]: field,
    },
  } as UniversalExpedienteV13;
}

function appendTrace(
  expediente: UniversalExpedienteV13,
  source: EvidenceReference,
  action: UniversalAdaptiveAction,
  metadata: HumanDecisionMetadata,
  kind: "VALIDATION" | "CONFLICT_RESOLUTION",
): UniversalExpedienteV13 {
  const sourceRegistry = appendUniqueSource(expediente.traceability.sourceRegistry, source);
  const event = {
    fecha: new Date(),
    tipo: kind === "VALIDATION" ? TipoEvento.VALIDACION : TipoEvento.DECISION,
    origen: metadata.actor,
    titulo: kind === "VALIDATION" ? `Validación humana: ${action.fieldKey}` : `Resolución humana de conflicto: ${action.fieldKey}`,
    descripcion: metadata.rationale,
    normativa: [],
  };

  return {
    ...expediente,
    traceability: {
      ...expediente.traceability,
      sourceRegistry,
      events: [...expediente.traceability.events, event],
    },
  };
}

function assertMetadata(metadata: HumanDecisionMetadata): void {
  if (!metadata.actor.trim()) throw new Error("La decisión humana debe identificar al validador.");
  if (!metadata.rationale.trim()) throw new Error("La decisión humana debe incluir una motivación expresa.");
}

export class UniversalAdaptiveHumanDecisionApplier {
  public validate(
    expediente: UniversalExpedienteV13,
    action: UniversalAdaptiveAction,
    metadata: HumanDecisionMetadata,
  ): HumanDecisionApplicationResult {
    if (action.kind !== "VALIDATE_HUMAN" || !action.fieldKey) {
      throw new Error("Solo puede validarse una acción VALIDATE_HUMAN con campo explícito.");
    }
    assertMetadata(metadata);

    const current = getField(expediente, action.fieldKey);
    if (!current) throw new Error(`No existe el campo ${action.fieldKey}.`);
    if (current.status === "PENDING" || current.status === "SOURCE_CONFLICT" || current.value === null) {
      throw new Error(`El campo ${action.fieldKey} no contiene una propuesta validable.`);
    }

    const source = humanReference(action.id, metadata);
    const validated: EvidenceField<unknown> = {
      ...current,
      status: "HUMAN_VALIDATED",
      sources: appendUniqueSource(current.sources, source),
      humanValidationRequired: true,
      humanValidated: true,
      diagnostics: [
        ...(current.diagnostics ?? []),
        `Validación humana registrada por ${metadata.actor}: ${metadata.rationale}`,
      ],
    };

    let updated = replaceField(expediente, action.fieldKey, validated);
    updated = appendTrace(updated, source, action, metadata, "VALIDATION");
    return { expediente: updated, updatedFieldKey: action.fieldKey };
  }

  public resolveConflict(
    expediente: UniversalExpedienteV13,
    action: UniversalAdaptiveAction,
    chosenValue: unknown,
    metadata: HumanDecisionMetadata,
  ): HumanDecisionApplicationResult {
    if (action.kind !== "RESOLVE_SOURCE_CONFLICT" || !action.fieldKey) {
      throw new Error("Solo puede resolverse una acción RESOLVE_SOURCE_CONFLICT con campo explícito.");
    }
    assertMetadata(metadata);
    if (chosenValue === null || chosenValue === undefined) {
      throw new Error("La resolución del conflicto debe indicar expresamente el valor adoptado.");
    }

    const current = getField(expediente, action.fieldKey);
    if (!current || current.status !== "SOURCE_CONFLICT" || !current.conflict) {
      throw new Error(`El campo ${action.fieldKey} no contiene un conflicto de fuente resoluble.`);
    }

    const source = humanReference(action.id, metadata);
    const resolved: EvidenceField<unknown> = {
      ...current,
      value: chosenValue,
      status: "HUMAN_VALIDATED",
      sources: appendUniqueSource(current.sources, source),
      humanValidationRequired: true,
      humanValidated: true,
      conflict: current.conflict,
      diagnostics: [
        ...(current.diagnostics ?? []),
        `Conflicto preservado: ${current.conflict.statements.join(" | ")}`,
        `Resolución humana por ${metadata.actor}: ${metadata.rationale}`,
      ],
    };

    let updated = replaceField(expediente, action.fieldKey, resolved);
    updated = appendTrace(updated, source, action, metadata, "CONFLICT_RESOLUTION");
    return { expediente: updated, updatedFieldKey: action.fieldKey };
  }
}
