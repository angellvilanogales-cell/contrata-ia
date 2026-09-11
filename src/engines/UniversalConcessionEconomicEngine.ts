export type ConcessionSubtype = "WORKS_CONCESSION" | "SERVICE_CONCESSION";

export interface ConcessionEconomicComponent {
  amountExVatCents: number;
  alreadyIncludedInForecastNetTurnover: boolean;
}

export interface UniversalConcessionEconomicInput {
  subtype: ConcessionSubtype;
  forecastNetTurnoverExVatCents: number;
  userChargesAndFines?: ConcessionEconomicComponent;
  publicPaymentsAndAdvantages?: ConcessionEconomicComponent;
  thirdPartySubsidiesAndAdvantages?: ConcessionEconomicComponent;
  assetSaleValue?: ConcessionEconomicComponent;
  authorityProvidedSuppliesAndServices?: ConcessionEconomicComponent;
  optionsAndExtensionsAdditionalTurnoverExVatCents?: number;
  plannedModificationAdditionalTurnoverExVatCents?: number;
  declaredEstimatedValueCents?: number;
  viabilityStudyApproved: boolean;
  operationalRiskTransferred: boolean;
}

export interface UniversalConcessionEconomicDecision {
  arithmeticEstimatedValueCents: number;
  selectedEstimatedValueCents: number;
  selectedValueOrigin: "DECLARED_SOURCE" | "DERIVED_CALCULATION";
  additionalComponentsExVatCents: number;
  blockers: readonly string[];
  diagnostics: readonly string[];
  legalBasis: readonly string[];
  humanValidationRequired: true;
}

function cents(value: number | undefined, name: string): number {
  const amount = value ?? 0;
  if (!Number.isInteger(amount) || amount < 0) throw new Error(`${name} debe expresarse en céntimos enteros no negativos.`);
  return amount;
}

function componentAmount(component: ConcessionEconomicComponent | undefined, name: string): number {
  if (!component) return 0;
  const value = cents(component.amountExVatCents, name);
  return component.alreadyIncludedInForecastNetTurnover ? 0 : value;
}

/**
 * Valor estimado concesional conforme al enfoque del art. 101 LCSP.
 * La cifra base es el volumen neto de negocio esperado de la concesionaria.
 * Los conceptos adicionales solo se suman si la fuente declara expresamente que
 * NO están ya integrados en esa previsión, para evitar doble contabilización.
 */
export class UniversalConcessionEconomicEngine {
  public evaluate(input: UniversalConcessionEconomicInput): UniversalConcessionEconomicDecision {
    const blockers: string[] = [];
    const forecast = cents(input.forecastNetTurnoverExVatCents, "forecastNetTurnoverExVatCents");
    if (forecast <= 0) blockers.push("No consta una previsión positiva y auditable de cifra neta de negocios de la concesión.");
    if (!input.viabilityStudyApproved) blockers.push("No consta aprobado el estudio de viabilidad o viabilidad económico-financiera exigible a la concesión.");
    if (!input.operationalRiskTransferred) blockers.push("No consta transferencia efectiva del riesgo operacional; no puede cerrarse la economía como concesión.");

    const additionalComponentsExVatCents =
      componentAmount(input.userChargesAndFines, "userChargesAndFines") +
      componentAmount(input.publicPaymentsAndAdvantages, "publicPaymentsAndAdvantages") +
      componentAmount(input.thirdPartySubsidiesAndAdvantages, "thirdPartySubsidiesAndAdvantages") +
      componentAmount(input.assetSaleValue, "assetSaleValue") +
      componentAmount(input.authorityProvidedSuppliesAndServices, "authorityProvidedSuppliesAndServices") +
      cents(input.optionsAndExtensionsAdditionalTurnoverExVatCents, "optionsAndExtensionsAdditionalTurnoverExVatCents") +
      cents(input.plannedModificationAdditionalTurnoverExVatCents, "plannedModificationAdditionalTurnoverExVatCents");

    const arithmeticEstimatedValueCents = forecast + additionalComponentsExVatCents;
    const declared = input.declaredEstimatedValueCents === undefined
      ? undefined
      : cents(input.declaredEstimatedValueCents, "declaredEstimatedValueCents");

    const diagnostics: string[] = [
      "El VE concesional parte de la cifra neta de negocios prevista durante toda la concesión, sin IVA.",
      "Tasas/multas de usuarios, pagos o ventajas públicas, subsidios de terceros, venta de activos y suministros/servicios puestos a disposición solo se agregan cuando no estén ya incorporados a la previsión de negocio.",
      "Opciones, prórrogas y modificaciones previstas solo se incorporan por su efecto económico adicional explícitamente cuantificado; nunca por extrapolación automática de duración o porcentaje.",
    ];
    if (declared !== undefined && declared !== arithmeticEstimatedValueCents) {
      diagnostics.push(`El VE declarado (${declared}) difiere del aritmético (${arithmeticEstimatedValueCents}) en ${declared - arithmeticEstimatedValueCents} céntimos; se conserva el declarado y se somete la diferencia a auditoría.`);
    }

    return {
      arithmeticEstimatedValueCents,
      selectedEstimatedValueCents: declared ?? arithmeticEstimatedValueCents,
      selectedValueOrigin: declared === undefined ? "DERIVED_CALCULATION" : "DECLARED_SOURCE",
      additionalComponentsExVatCents,
      blockers,
      diagnostics,
      legalBasis: ["arts. 14-15, 29.6 y 101.1.b, 101.2 y 101.3 LCSP", input.subtype === "WORKS_CONCESSION" ? "arts. 247-250 LCSP" : "arts. 284-285 LCSP"],
      humanValidationRequired: true,
    };
  }
}
