import { CanonicalExpedienteState } from "./CanonicalExpedienteState";
import { EvidenceField, isPromotableEvidenceField } from "./EvidenceField";
import { UniversalExpedienteV13 } from "./UniversalExpedienteV13";

export interface UniversalCompatibilityResult {
  ready: boolean;
  state: CanonicalExpedienteState;
  blockers: readonly string[];
}

function comparable<T>(field: EvidenceField<T>): field is EvidenceField<T> & { value: T } {
  return isPromotableEvidenceField(field) && field.value !== null;
}

function sameArray(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function derivedField<T>(key: string, source: EvidenceField<unknown>, value: T, note: string): EvidenceField<T> {
  return {
    key,
    value,
    status: source.status,
    sources: source.sources,
    legalBasis: source.legalBasis,
    humanValidationRequired: source.humanValidationRequired,
    humanValidated: source.humanValidated,
    diagnostics: [...(source.diagnostics ?? []), note],
  };
}

export function buildCanonicalCompatibilityView(
  expediente: UniversalExpedienteV13,
): UniversalCompatibilityResult {
  const blockers: string[] = [];
  const fields = { ...expediente.canonical.fields };

  if (comparable(expediente.economic.legalEstimatedValueCents)) {
    const universalValue = expediente.economic.legalEstimatedValueCents.value;
    if (comparable(fields.estimatedValueCents) && fields.estimatedValueCents.value !== universalValue) {
      blockers.push(`Divergencia universal/canónica en valor estimado: ${universalValue} != ${fields.estimatedValueCents.value}.`);
    } else {
      fields.estimatedValueCents = derivedField(
        "estimatedValueCents",
        expediente.economic.legalEstimatedValueCents,
        universalValue,
        "Vista de compatibilidad derivada de economic.legalEstimatedValueCents.",
      );
    }
  }

  if (comparable(expediente.lots.lots)) {
    const allNamesPromotable = expediente.lots.lots.value.every(lot => comparable(lot.name));
    if (allNamesPromotable) {
      const lotNames = expediente.lots.lots.value.map(lot => lot.name.value as string);
      if (comparable(fields.lots) && !sameArray(fields.lots.value, lotNames)) {
        blockers.push("Divergencia universal/canónica en la relación de lotes.");
      } else {
        fields.lots = derivedField(
          "lots",
          expediente.lots.lots,
          lotNames,
          "Vista de compatibilidad derivada de lots.lots[].name.",
        );
      }
    }
  }

  if (comparable(expediente.criteria.awardCriteria)) {
    const names = expediente.criteria.awardCriteria.value.map(item => item.nombre);
    if (comparable(fields.awardCriteria) && !sameArray(fields.awardCriteria.value, names)) {
      blockers.push("Divergencia universal/canónica en criterios de adjudicación.");
    } else {
      fields.awardCriteria = derivedField(
        "awardCriteria",
        expediente.criteria.awardCriteria,
        names,
        "Vista de compatibilidad derivada de criteria.awardCriteria[].nombre.",
      );
    }
  }

  if (comparable(expediente.criteria.economicSolvency) && comparable(expediente.criteria.technicalSolvency)) {
    const descriptions = [
      ...expediente.criteria.economicSolvency.value.map(item => item.descripcion),
      ...expediente.criteria.technicalSolvency.value.map(item => item.descripcion),
    ];
    if (comparable(fields.solvency) && !sameArray(fields.solvency.value, descriptions)) {
      blockers.push("Divergencia universal/canónica en criterios de solvencia.");
    } else {
      fields.solvency = derivedField(
        "solvency",
        expediente.criteria.technicalSolvency,
        descriptions,
        "Vista de compatibilidad derivada de solvencia económica y técnica universal.",
      );
    }
  }

  return {
    ready: blockers.length === 0,
    state: { ...expediente.canonical, fields },
    blockers,
  };
}
