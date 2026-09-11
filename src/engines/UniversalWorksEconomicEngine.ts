import { calculateUniversalEconomics } from "../domain/economic/UniversalEconomicCalculation";

export interface UniversalWorksEconomicInput {
  projectExecutionAmountExVatCents: number;
  suppliesProvidedByAuthorityExVatCents?: number;
  extensionAmountExVatCents?: number;
  plannedModificationAmountExVatCents?: number;
  optionsAmountExVatCents?: number;
  otherEstimatedValueComponentsCents?: number;
  declaredEstimatedValueCents?: number;
  approvedProject: boolean;
  measurementsAvailable: boolean;
}

export interface UniversalWorksEconomicDecision {
  arithmeticEstimatedValueCents: number;
  selectedEstimatedValueCents: number;
  selectedValueOrigin: "DECLARED_SOURCE" | "DERIVED_CALCULATION";
  blockers: readonly string[];
  diagnostics: readonly string[];
  legalBasis: readonly string[];
  humanValidationRequired: true;
}

function assertCents(value: number | undefined, name: string): number {
  const amount = value ?? 0;
  if (!Number.isInteger(amount) || amount < 0) throw new Error(`${name} debe expresarse en céntimos enteros no negativos.`);
  return amount;
}

/**
 * Perfil económico específico de obras.
 * No sustituye proyecto, mediciones ni presupuesto aprobado. Solo calcula el VE
 * cuando los componentes económicos están acreditados y conserva cualquier VE
 * declarado por fuente aunque difiera de la suma aritmética.
 */
export class UniversalWorksEconomicEngine {
  public evaluate(input: UniversalWorksEconomicInput): UniversalWorksEconomicDecision {
    const blockers: string[] = [];
    const project = assertCents(input.projectExecutionAmountExVatCents, "projectExecutionAmountExVatCents");
    const supplies = assertCents(input.suppliesProvidedByAuthorityExVatCents, "suppliesProvidedByAuthorityExVatCents");

    if (project <= 0) blockers.push("No consta un importe de ejecución de la obra superior a cero.");
    if (!input.approvedProject) blockers.push("El proyecto de obras no consta aprobado; la economía no puede considerarse cerrada.");
    if (!input.measurementsAvailable) blockers.push("No constan mediciones/presupuesto del proyecto suficientes para auditar el importe de obra.");

    const calculation = calculateUniversalEconomics({
      contractKind: "WORKS",
      initialAmountExVatCents: project,
      extensionAmountExVatCents: input.extensionAmountExVatCents,
      modificationAmountExVatCents: input.plannedModificationAmountExVatCents,
      optionsAmountExVatCents: input.optionsAmountExVatCents,
      otherEstimatedValueComponentsCents: supplies + assertCents(input.otherEstimatedValueComponentsCents, "otherEstimatedValueComponentsCents"),
      declaredEstimatedValueCents: input.declaredEstimatedValueCents,
    });

    return {
      arithmeticEstimatedValueCents: calculation.arithmeticEstimatedValueCents,
      selectedEstimatedValueCents: calculation.selectedEstimatedValueCents,
      selectedValueOrigin: calculation.selectedValueOrigin,
      blockers,
      diagnostics: [
        ...calculation.diagnostics,
        "El valor estimado de obras incorpora el importe de las obras y, cuando proceda, el valor de suministros necesarios puestos a disposición del contratista por el órgano de contratación.",
        ...(calculation.diagnostic
          ? [`Existe diferencia entre VE declarado y aritmético de ${calculation.diagnostic.declaredMinusArithmeticCents} céntimos; se conserva la declaración de fuente y se eleva a auditoría.`]
          : []),
      ],
      legalBasis: ["arts. 100, 101.1.a, 101.2 y 101.8 LCSP", "arts. 231-236 LCSP"],
      humanValidationRequired: true,
    };
  }
}
