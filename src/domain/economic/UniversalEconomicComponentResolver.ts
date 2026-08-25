import { EvidenceField, EvidenceReference, isPromotableEvidenceField } from "../expediente/EvidenceField";
import { UniversalExpedienteV13 } from "../expediente/UniversalExpedienteV13";

export interface UniversalEconomicComponentResolution {
  expediente: UniversalExpedienteV13;
  derivedFields: readonly string[];
  blockers: readonly string[];
}

const SOURCE_ID = "UniversalEconomicComponentResolver:15.5";

function derivedSource(note: string): EvidenceReference {
  return { kind: "DERIVED_CALCULATION", sourceId: SOURCE_ID, note };
}

function notApplicable(key: string, note: string): EvidenceField<number> {
  return {
    key,
    value: null,
    status: "NOT_APPLICABLE",
    sources: [derivedSource(note)],
    humanValidationRequired: false,
    humanValidated: false,
    diagnostics: [note],
  };
}

function proposal(key: string, value: number, note: string): EvidenceField<number> {
  return {
    key,
    value,
    status: "SYSTEM_PROPOSAL",
    sources: [derivedSource(note)],
    humanValidationRequired: true,
    humanValidated: false,
    diagnostics: [
      note,
      "La propuesta económica requiere validación humana antes de incorporarse al cálculo jurídico del valor estimado.",
    ],
  };
}

function appendSource(expediente: UniversalExpedienteV13): UniversalExpedienteV13 {
  if (expediente.traceability.sourceRegistry.some(source => source.kind === "DERIVED_CALCULATION" && source.sourceId === SOURCE_ID)) {
    return expediente;
  }
  return {
    ...expediente,
    traceability: {
      ...expediente.traceability,
      sourceRegistry: [
        ...expediente.traceability.sourceRegistry,
        derivedSource("Resolución segura de componentes económicos del Bloque 15.5."),
      ],
    },
  };
}

export function resolveEconomicComponents(expediente: UniversalExpedienteV13): UniversalEconomicComponentResolution {
  const derivedFields: string[] = [];
  const blockers: string[] = [];
  let economic = expediente.economic;

  const extensionMonths = expediente.canonical.fields.extensionMonths;
  if (economic.extensionAmountExVatCents.status === "PENDING" && isPromotableEvidenceField(extensionMonths) && extensionMonths.value !== null) {
    if (extensionMonths.value === 0) {
      economic = {
        ...economic,
        extensionAmountExVatCents: notApplicable(
          "economic.extensionAmountExVatCents",
          "La duración de prórroga validada es 0 meses; no existe componente económico de prórroga.",
        ),
      };
      derivedFields.push("economic.extensionAmountExVatCents");
    }
    // Si hay prórroga positiva no se extrapola importe desde meses: debe existir un importe económico explícito.
  }

  const modificationPercent = expediente.canonical.fields.modificationPercent;
  if (economic.modificationAmountExVatCents.status === "PENDING" && isPromotableEvidenceField(modificationPercent) && modificationPercent.value !== null) {
    if (modificationPercent.value < 0 || modificationPercent.value > 100) {
      blockers.push("El porcentaje de modificación debe estar comprendido entre 0 y 100 antes de calcular su componente económico.");
    } else if (modificationPercent.value === 0) {
      economic = {
        ...economic,
        modificationAmountExVatCents: notApplicable(
          "economic.modificationAmountExVatCents",
          "El porcentaje de modificación validado es 0%; no existe componente económico de modificación prevista.",
        ),
      };
      derivedFields.push("economic.modificationAmountExVatCents");
    } else if (
      isPromotableEvidenceField(economic.initialEstimatedValueBaseCents) &&
      economic.initialEstimatedValueBaseCents.value !== null
    ) {
      const base = economic.initialEstimatedValueBaseCents.value;
      const amount = Math.round((base * modificationPercent.value) / 100);
      economic = {
        ...economic,
        modificationAmountExVatCents: proposal(
          "economic.modificationAmountExVatCents",
          amount,
          `Propuesta aritmética: ${base} céntimos × ${modificationPercent.value}% = ${amount} céntimos. El porcentaje y la base deben corresponder a la misma magnitud económica; no se presume otra base de cálculo.`,
        ),
      };
      derivedFields.push("economic.modificationAmountExVatCents");
    }
  }

  let updated: UniversalExpedienteV13 = { ...expediente, economic };
  if (derivedFields.length > 0) updated = appendSource(updated);

  return { expediente: updated, derivedFields, blockers };
}
