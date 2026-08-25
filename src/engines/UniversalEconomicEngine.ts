import { calculateUniversalEconomics, EconomicCalculationInput, EconomicCalculationResult } from "../domain/economic/UniversalEconomicCalculation";
import { EvidenceField, EvidenceReference } from "../domain/expediente/EvidenceField";
import { UniversalExpedienteV13 } from "../domain/expediente/UniversalExpedienteV13";
import { UniversalLot } from "../domain/expediente/UniversalExpedienteDomains";

export interface UniversalEconomicEngineResult {
  expediente: UniversalExpedienteV13;
  calculation: EconomicCalculationResult;
  executed: readonly string[];
  blockers: readonly string[];
}

function proposal(key: string, value: number, sourceId: string, diagnostics: readonly string[]): EvidenceField<number> {
  return {
    key,
    value,
    status: "SYSTEM_PROPOSAL",
    sources: [{ kind: "DERIVED_CALCULATION", sourceId }],
    humanValidationRequired: true,
    humanValidated: false,
    diagnostics,
  };
}

function appendUniqueSource(expediente: UniversalExpedienteV13, source: EvidenceReference): UniversalExpedienteV13 {
  if (expediente.traceability.sourceRegistry.some(item => item.kind === source.kind && item.sourceId === source.sourceId)) {
    return expediente;
  }
  return {
    ...expediente,
    traceability: {
      ...expediente.traceability,
      sourceRegistry: [...expediente.traceability.sourceRegistry, source],
    },
  };
}

function appendDiagnostic<T>(field: EvidenceField<T>, message: string): EvidenceField<T> {
  return { ...field, diagnostics: [...(field.diagnostics ?? []), message] };
}

function expectedContractKind(expediente: UniversalExpedienteV13): EconomicCalculationInput["contractKind"] | null {
  const kind = expediente.canonical.fields.contractType.value;
  if (kind === "SERVICE" || kind === "SUPPLY" || kind === "WORKS") return kind;
  if (kind === "OTHER" || kind === "MIXED" || kind === "CONCESSION") return "OTHER";
  return null;
}

function updateLot(
  lot: UniversalLot,
  calculation: EconomicCalculationResult["lots"][number],
  sourceId: string,
): UniversalLot {
  const current = lot.estimatedValueCents;
  const selectedLotValue = calculation.declaredEstimatedValueCents ?? calculation.arithmeticEstimatedValueCents;
  if (current.status === "PENDING") {
    return {
      ...lot,
      estimatedValueCents: proposal(
        current.key,
        selectedLotValue,
        `${sourceId}:lot:${lot.id}`,
        [
          `VE aritmético del lote: ${calculation.arithmeticEstimatedValueCents} céntimos.`,
          ...(calculation.diagnostic
            ? [`Diferencia declarada menos aritmética: ${calculation.diagnostic.declaredMinusArithmeticCents} céntimos; no se autocorrige.`]
            : []),
        ],
      ),
    };
  }

  if (current.value !== null && current.value !== calculation.arithmeticEstimatedValueCents) {
    return {
      ...lot,
      estimatedValueCents: appendDiagnostic(
        current,
        `Auditoría económica: el valor existente (${current.value}) difiere del cálculo aritmético (${calculation.arithmeticEstimatedValueCents}) en ${current.value - calculation.arithmeticEstimatedValueCents} céntimos. Se conserva el valor existente.`,
      ),
    };
  }
  return lot;
}

export class UniversalEconomicEngine {
  public calculateAndApply(
    expediente: UniversalExpedienteV13,
    input: EconomicCalculationInput,
    sourceId = "UniversalEconomicEngine:VE",
  ): UniversalEconomicEngineResult {
    const blockers: string[] = [];
    const expected = expectedContractKind(expediente);
    if (expected && expected !== input.contractKind) {
      blockers.push(`El tipo económico ${input.contractKind} no coincide con la naturaleza contractual ${expected} del expediente.`);
    }

    const currentUniversal = expediente.economic.legalEstimatedValueCents;
    const currentCanonical = expediente.canonical.fields.estimatedValueCents;
    if (currentUniversal.status === "SOURCE_CONFLICT" || currentCanonical.status === "SOURCE_CONFLICT") {
      blockers.push("No puede ejecutarse el motor económico mientras exista un conflicto de fuente sobre el valor estimado.");
    }

    const calculation = calculateUniversalEconomics(input);
    if (blockers.length > 0) return { expediente, calculation, executed: [], blockers };

    let universalField = currentUniversal;
    let canonicalField = currentCanonical;
    const diagnostics = [
      ...calculation.diagnostics,
      `VE aritmético: ${calculation.arithmeticEstimatedValueCents} céntimos.`,
      ...(calculation.diagnostic
        ? [`Diferencia entre VE declarado y aritmético: ${calculation.diagnostic.declaredMinusArithmeticCents} céntimos; se conserva la declaración de fuente.`]
        : []),
    ];

    if (currentUniversal.status === "PENDING" && currentCanonical.status === "PENDING") {
      universalField = proposal("economic.legalEstimatedValueCents", calculation.selectedEstimatedValueCents, sourceId, diagnostics);
      canonicalField = { ...universalField, key: "estimatedValueCents" };
    } else {
      if (currentUniversal.value !== null && currentUniversal.value !== calculation.arithmeticEstimatedValueCents) {
        universalField = appendDiagnostic(
          currentUniversal,
          `Auditoría económica: VE existente ${currentUniversal.value}; VE aritmético ${calculation.arithmeticEstimatedValueCents}; diferencia ${currentUniversal.value - calculation.arithmeticEstimatedValueCents} céntimos. No se sustituye el valor existente.`,
        );
      }
      if (currentCanonical.value !== null && currentCanonical.value !== calculation.arithmeticEstimatedValueCents) {
        canonicalField = appendDiagnostic(
          currentCanonical,
          `Auditoría económica: VE existente ${currentCanonical.value}; VE aritmético ${calculation.arithmeticEstimatedValueCents}; no se sustituye el valor existente.`,
        );
      }
    }

    let lots = expediente.lots;
    if (lots.lots.value && calculation.lots.length > 0) {
      const byId = new Map(calculation.lots.map(item => [item.lotId, item]));
      lots = {
        ...lots,
        lots: {
          ...lots.lots,
          value: lots.lots.value.map(lot => {
            const lotCalculation = byId.get(lot.id);
            return lotCalculation ? updateLot(lot, lotCalculation, sourceId) : lot;
          }),
        },
      };
    }

    let updated: UniversalExpedienteV13 = {
      ...expediente,
      canonical: {
        ...expediente.canonical,
        fields: { ...expediente.canonical.fields, estimatedValueCents: canonicalField },
      },
      economic: { ...expediente.economic, legalEstimatedValueCents: universalField },
      lots,
    };
    updated = appendUniqueSource(updated, { kind: "DERIVED_CALCULATION", sourceId });

    return {
      expediente: updated,
      calculation,
      executed: ["UniversalEconomicEngine"],
      blockers: [],
    };
  }
}
