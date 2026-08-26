import { SupplySourceVariant } from "../../domain/documentModel/UniversalSupplySourceCorpus";
import { buildSupplyStructuralCore } from "../../domain/documentModel/UniversalSupplyPromotionReadiness";
import { DocumentType } from "../../domain/documentModel/DocumentType";

export interface UniversalSupplyVariantInput {
  declaredVariant?: SupplySourceVariant;
  hasSuccessiveOrders?: boolean;
  hasServicePlatformComponent?: boolean;
  hasInstallationOrAssembly?: boolean;
  isFrameworkAgreement?: boolean;
  euFunds?: boolean;
}

export interface UniversalSupplyVariantAssessment {
  ready: boolean;
  variant?: SupplySourceVariant;
  pptCommonBlocks: readonly string[];
  technicalOverlay: readonly string[];
  blockers: readonly string[];
  warnings: readonly string[];
  humanValidationRequired: true;
}

/**
 * LB91.86-89. No infiere automáticamente una subfamilia jurídica/técnica a partir
 * de un único indicio. La variante debe declararse y los hechos incompatibles
 * bloquean el uso del overlay; así ningún suministro hereda el PPT de ferretería.
 */
export function evaluateUniversalSupplyVariant(input: UniversalSupplyVariantInput): UniversalSupplyVariantAssessment {
  const blockers: string[] = [];
  const warnings: string[] = [];
  if (!input.declaredVariant) {
    return { ready: false, pptCommonBlocks: [], technicalOverlay: [], blockers: ["Debe declararse la subfamilia técnica del suministro antes de seleccionar un overlay PPT."], warnings, humanValidationRequired: true };
  }

  const variant = input.declaredVariant;
  if (variant === "CATALOGUE_NEEDS" && input.hasSuccessiveOrders !== true) blockers.push("CATALOGUE_NEEDS requiere acreditar pedidos/entregas sucesivas según necesidades.");
  if (variant === "SUPPLY_WITH_SERVICE_COMPONENT" && input.hasServicePlatformComponent !== true) blockers.push("La variante con componente de servicio requiere acreditar dicho componente; no se presume por CPV.");
  if (variant === "FURNITURE_INSTALLATION" && input.hasInstallationOrAssembly !== true) blockers.push("La variante de mobiliario con instalación requiere montaje/instalación en el objeto real.");
  if (variant === "MEDICAL_FRAMEWORK" && input.isFrameworkAgreement !== true) blockers.push("La variante sanitaria de acuerdo marco requiere que el expediente sea efectivamente un acuerdo marco.");
  if (variant === "DIGITAL_EQUIPMENT" && input.euFunds !== true) warnings.push("El caso de aulas digitales usado como evidencia incorpora PRTR; no deben heredarse cláusulas MRR/DNSH si el nuevo expediente no tiene financiación europea.");

  const core = buildSupplyStructuralCore(DocumentType.PPT);
  return {
    ready: blockers.length === 0,
    variant,
    pptCommonBlocks: core.commonBlocks,
    technicalOverlay: core.variantSpecificExamples[variant],
    blockers,
    warnings,
    humanValidationRequired: true,
  };
}
