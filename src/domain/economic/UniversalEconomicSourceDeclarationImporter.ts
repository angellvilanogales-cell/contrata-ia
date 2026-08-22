import { EvidenceField, EvidenceReference } from "../expediente/EvidenceField";
import { UniversalAnnuality } from "../expediente/UniversalExpedienteDomains";
import { UniversalExpedienteV13 } from "../expediente/UniversalExpedienteV13";
import { AnnualityAuditResult, auditAnnualities } from "./UniversalEconomicAudit";
import {
  EconomicCalculationResult,
  EconomicContractKind,
  EconomicLotInput,
  calculateUniversalEconomics,
} from "./UniversalEconomicCalculation";

export interface UniversalEconomicSourceDeclaration {
  sourceId: string;
  locator?: string;
  contractKind: EconomicContractKind;
  initialAmountExVatCents: number;
  extensionAmountExVatCents?: number;
  modificationAmountExVatCents?: number;
  optionsAmountExVatCents?: number;
  otherEstimatedValueComponentsCents?: number;
  declaredEstimatedValueCents: number;
  lots?: readonly EconomicLotInput[];
  vatPercent?: number;
  budgetApplication?: string;
  annualities?: readonly UniversalAnnuality[];
  annualitiesDeclaredTotalCents?: number;
}

export interface UniversalEconomicSourceImportResult {
  expediente: UniversalExpedienteV13;
  importedFields: readonly string[];
  blockers: readonly string[];
  calculation: EconomicCalculationResult;
  annualityAudit?: AnnualityAuditResult;
}

function sourceReference(declaration: UniversalEconomicSourceDeclaration): EvidenceReference {
  return {
    kind: "PRIMARY_DOCUMENT",
    sourceId: declaration.sourceId,
    locator: declaration.locator,
    note: "Declaración económica primaria incorporada en Bloque 15.7 sin promoción automática.",
  };
}

function declaredField<T>(
  key: string,
  value: T,
  source: EvidenceReference,
  diagnostics?: readonly string[],
): EvidenceField<T> {
  return {
    key,
    value,
    status: "SOURCE_DECLARED",
    sources: [source],
    humanValidationRequired: true,
    humanValidated: false,
    diagnostics,
  };
}

function canImport<T>(field: EvidenceField<T>, key: string, blockers: string[]): boolean {
  if (field.status === "PENDING") return true;
  if (field.status === "SOURCE_DECLARED" && !field.humanValidated) return true;
  if (field.status === "SOURCE_CONFLICT") {
    blockers.push(`No se importa ${key}: existe un conflicto de fuente que debe permanecer bloqueado.`);
    return false;
  }
  blockers.push(`No se importa ${key}: ya existe un valor promocionado o validado y no puede sobrescribirse silenciosamente.`);
  return false;
}

function validateContractKind(expediente: UniversalExpedienteV13, contractKind: EconomicContractKind): string | undefined {
  const canonicalKind = expediente.canonical.fields.contractType.value;
  if (!canonicalKind) return undefined;
  if (canonicalKind === contractKind) return undefined;
  return `No se importa la declaración económica: el tipo ${contractKind} no coincide con la naturaleza contractual ${canonicalKind}.`;
}

export function importEconomicSourceDeclaration(
  expediente: UniversalExpedienteV13,
  declaration: UniversalEconomicSourceDeclaration,
): UniversalEconomicSourceImportResult {
  const blockers: string[] = [];
  const importedFields: string[] = [];
  const source = sourceReference(declaration);

  const contractBlocker = validateContractKind(expediente, declaration.contractKind);
  const calculation = calculateUniversalEconomics({
    contractKind: declaration.contractKind,
    initialAmountExVatCents: declaration.initialAmountExVatCents,
    extensionAmountExVatCents: declaration.extensionAmountExVatCents,
    modificationAmountExVatCents: declaration.modificationAmountExVatCents,
    optionsAmountExVatCents: declaration.optionsAmountExVatCents,
    otherEstimatedValueComponentsCents: declaration.otherEstimatedValueComponentsCents,
    declaredEstimatedValueCents: declaration.declaredEstimatedValueCents,
    lots: declaration.lots,
  });
  const annualityAudit = declaration.annualities
    ? auditAnnualities(declaration.annualities, declaration.annualitiesDeclaredTotalCents)
    : undefined;

  if (contractBlocker) {
    return { expediente, importedFields, blockers: [contractBlocker], calculation, annualityAudit };
  }

  let economic = { ...expediente.economic };
  let canonical = { ...expediente.canonical, fields: { ...expediente.canonical.fields } };

  const assignEconomic = <K extends keyof typeof economic>(
    key: K,
    value: NonNullable<(typeof economic)[K]["value"]>,
    diagnostics?: readonly string[],
  ): void => {
    const field = economic[key] as EvidenceField<NonNullable<(typeof economic)[K]["value"]>>;
    if (!canImport(field, String(field.key), blockers)) return;
    economic = {
      ...economic,
      [key]: declaredField(String(field.key), value, source, diagnostics),
    };
    importedFields.push(String(field.key));
  };

  assignEconomic("initialEstimatedValueBaseCents", declaration.initialAmountExVatCents);
  if (declaration.extensionAmountExVatCents !== undefined) {
    assignEconomic("extensionAmountExVatCents", declaration.extensionAmountExVatCents);
  }
  if (declaration.modificationAmountExVatCents !== undefined) {
    assignEconomic("modificationAmountExVatCents", declaration.modificationAmountExVatCents);
  }
  if (declaration.optionsAmountExVatCents !== undefined) {
    assignEconomic("optionsAmountExVatCents", declaration.optionsAmountExVatCents);
  }
  if (declaration.otherEstimatedValueComponentsCents !== undefined) {
    assignEconomic("otherEstimatedValueComponentsCents", declaration.otherEstimatedValueComponentsCents);
  }

  const veDiagnostics = [
    ...calculation.diagnostics,
    ...(calculation.diagnostic
      ? [`Diferencia declarado-aritmético: ${calculation.diagnostic.declaredMinusArithmeticCents} céntimos. ${calculation.diagnostic.treatment}.`]
      : []),
    ...(calculation.lotDeclaredSumDiagnostic
      ? [`Diferencia VE global declarado-suma VE declarados por lote: ${calculation.lotDeclaredSumDiagnostic.declaredMinusArithmeticCents} céntimos. ${calculation.lotDeclaredSumDiagnostic.treatment}.`]
      : []),
  ];
  assignEconomic("legalEstimatedValueCents", declaration.declaredEstimatedValueCents, veDiagnostics);

  if (declaration.vatPercent !== undefined) assignEconomic("vatPercent", declaration.vatPercent);
  if (declaration.budgetApplication !== undefined) assignEconomic("budgetApplication", declaration.budgetApplication);
  if (declaration.annualities !== undefined) {
    const annualityDiagnostics = annualityAudit?.diagnostic
      ? [`Diferencia total anualidades declarado-aritmético: ${annualityAudit.diagnostic.declaredMinusArithmeticCents} céntimos. ${annualityAudit.diagnostic.treatment}.`]
      : undefined;
    assignEconomic("annualities", declaration.annualities, annualityDiagnostics);
  }

  const canonicalPbl = canonical.fields.baseTenderBudgetCents;
  if (canImport(canonicalPbl, canonicalPbl.key, blockers)) {
    canonical = {
      ...canonical,
      fields: {
        ...canonical.fields,
        baseTenderBudgetCents: declaredField(canonicalPbl.key, declaration.initialAmountExVatCents, source),
      },
    };
    importedFields.push(canonicalPbl.key);
  }

  const canonicalVe = canonical.fields.estimatedValueCents;
  if (canImport(canonicalVe, canonicalVe.key, blockers)) {
    canonical = {
      ...canonical,
      fields: {
        ...canonical.fields,
        estimatedValueCents: declaredField(canonicalVe.key, declaration.declaredEstimatedValueCents, source, veDiagnostics),
      },
    };
    importedFields.push(canonicalVe.key);
  }

  const sourceAlreadyRegistered = expediente.traceability.sourceRegistry.some(
    item => item.kind === source.kind && item.sourceId === source.sourceId && item.locator === source.locator,
  );

  const updated: UniversalExpedienteV13 = {
    ...expediente,
    canonical,
    economic,
    traceability: {
      ...expediente.traceability,
      sourceRegistry: sourceAlreadyRegistered
        ? expediente.traceability.sourceRegistry
        : [...expediente.traceability.sourceRegistry, source],
    },
  };

  return { expediente: updated, importedFields, blockers, calculation, annualityAudit };
}
