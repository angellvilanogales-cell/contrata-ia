import { EvidenceField, EvidenceReference } from "../expediente/EvidenceField";
import { UniversalEconomicEvidence } from "../expediente/UniversalExpedienteDomains";
import { UniversalExpedienteV13 } from "../expediente/UniversalExpedienteV13";

export interface EconomicSourceValidationInput {
  sourceId: string;
  validatedBy: string;
}

export interface EconomicSourceValidationResult {
  expediente: UniversalExpedienteV13;
  validatedFields: readonly string[];
  blockers: readonly string[];
}

const VALIDATABLE_ECONOMIC_FIELDS: readonly (keyof UniversalEconomicEvidence)[] = [
  "vatPercent",
  "budgetApplication",
  "annualities",
  "initialEstimatedValueBaseCents",
  "extensionAmountExVatCents",
  "modificationAmountExVatCents",
  "optionsAmountExVatCents",
  "otherEstimatedValueComponentsCents",
  "legalEstimatedValueCents",
];

function validationReference(input: EconomicSourceValidationInput): EvidenceReference {
  return {
    kind: "USER_INPUT",
    sourceId: `human-validation:${input.validatedBy}`,
    note: `Validación humana del paquete económico declarado por ${input.sourceId} en Bloque 15.8.`,
  };
}

function isDeclarationFrom<T>(field: EvidenceField<T>, sourceId: string): boolean {
  return field.status === "SOURCE_DECLARED" && field.sources.some(source => source.sourceId === sourceId);
}

function validated<T>(field: EvidenceField<T>, validationSource: EvidenceReference): EvidenceField<T> {
  return {
    ...field,
    status: "HUMAN_VALIDATED",
    sources: [...field.sources, validationSource],
    humanValidationRequired: true,
    humanValidated: true,
    diagnostics: [
      ...(field.diagnostics ?? []),
      "Declaración económica validada humanamente; se conserva el valor declarado y sus diagnósticos sin normalización automática.",
    ],
  };
}

function pairConsistency(
  left: EvidenceField<number>,
  right: EvidenceField<number>,
  label: string,
  sourceId: string,
  blockers: string[],
): void {
  const leftRelevant = isDeclarationFrom(left, sourceId);
  const rightRelevant = isDeclarationFrom(right, sourceId);
  if (!leftRelevant || !rightRelevant) return;
  if (left.value !== right.value) {
    blockers.push(
      `${label}: la vista canónica (${left.value ?? "sin valor"}) y la autoridad económica (${right.value ?? "sin valor"}) difieren. Debe resolverse antes de validar; no se sincronizan automáticamente.`,
    );
  }
}

function conflictBlocker(field: EvidenceField<unknown>, sourceId: string, blockers: string[]): void {
  if (field.status !== "SOURCE_CONFLICT") return;
  if (!field.sources.some(source => source.sourceId === sourceId)) return;
  blockers.push(`El campo ${field.key} mantiene un conflicto de fuente y no puede validarse mediante el cierre económico 15.8.`);
}

export function validateEconomicSourceDeclaration(
  expediente: UniversalExpedienteV13,
  input: EconomicSourceValidationInput,
): EconomicSourceValidationResult {
  const blockers: string[] = [];
  const validatedFields: string[] = [];

  if (!input.sourceId.trim()) blockers.push("Debe indicarse la fuente económica que se valida.");
  if (!input.validatedBy.trim()) blockers.push("Debe identificarse a la persona que realiza la validación humana.");
  if (blockers.length > 0) return { expediente, validatedFields, blockers };

  pairConsistency(
    expediente.canonical.fields.baseTenderBudgetCents,
    expediente.economic.initialEstimatedValueBaseCents,
    "Inconsistencia de PBL/base económica",
    input.sourceId,
    blockers,
  );
  pairConsistency(
    expediente.canonical.fields.estimatedValueCents,
    expediente.economic.legalEstimatedValueCents,
    "Inconsistencia de valor estimado",
    input.sourceId,
    blockers,
  );

  const fieldsToInspect: EvidenceField<unknown>[] = [
    expediente.canonical.fields.baseTenderBudgetCents,
    expediente.canonical.fields.estimatedValueCents,
    ...VALIDATABLE_ECONOMIC_FIELDS.map(key => expediente.economic[key] as EvidenceField<unknown>),
  ];
  for (const field of fieldsToInspect) conflictBlocker(field, input.sourceId, blockers);

  const sourceDeclaredFields = fieldsToInspect.filter(field => isDeclarationFrom(field, input.sourceId));
  if (sourceDeclaredFields.length === 0) {
    blockers.push(`No existen declaraciones económicas pendientes de validación procedentes de ${input.sourceId}.`);
  }

  if (blockers.length > 0) return { expediente, validatedFields, blockers };

  const validationSource = validationReference(input);
  const economic = { ...expediente.economic };
  const economicRecord = economic as unknown as Record<string, EvidenceField<unknown>>;

  for (const key of VALIDATABLE_ECONOMIC_FIELDS) {
    const field = economicRecord[String(key)];
    if (!isDeclarationFrom(field, input.sourceId)) continue;
    economicRecord[String(key)] = validated(field, validationSource);
    validatedFields.push(field.key);
  }

  let canonical = { ...expediente.canonical, fields: { ...expediente.canonical.fields } };
  const pbl = canonical.fields.baseTenderBudgetCents;
  if (isDeclarationFrom(pbl, input.sourceId)) {
    canonical = {
      ...canonical,
      fields: { ...canonical.fields, baseTenderBudgetCents: validated(pbl, validationSource) },
    };
    validatedFields.push(pbl.key);
  }

  const ve = canonical.fields.estimatedValueCents;
  if (isDeclarationFrom(ve, input.sourceId)) {
    canonical = {
      ...canonical,
      fields: { ...canonical.fields, estimatedValueCents: validated(ve, validationSource) },
    };
    validatedFields.push(ve.key);
  }

  const alreadyRegistered = expediente.traceability.sourceRegistry.some(
    source => source.kind === validationSource.kind && source.sourceId === validationSource.sourceId,
  );

  return {
    expediente: {
      ...expediente,
      canonical,
      economic,
      traceability: {
        ...expediente.traceability,
        sourceRegistry: alreadyRegistered
          ? expediente.traceability.sourceRegistry
          : [...expediente.traceability.sourceRegistry, validationSource],
      },
    },
    validatedFields,
    blockers,
  };
}
