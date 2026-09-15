import type { CanonicalExpedienteState } from "../../../domain/expediente/CanonicalExpedienteState";
import { CriterioAdjudicacion } from "../../../domain/expediente/CriterioAdjudicacion";
import type { EvidenceField, EvidenceReference } from "../../../domain/expediente/EvidenceField";
import { isPromotableEvidenceField } from "../../../domain/expediente/EvidenceField";
import { EstadoExpediente } from "../../../domain/expediente/EstadoExpediente";
import type { UniversalLot, UniversalSupplyAsaPlannedModificationDecision } from "../../../domain/expediente/UniversalExpedienteDomains";
import { createUniversalExpedienteFromCanonical, type UniversalExpedienteV13 } from "../../../domain/expediente/UniversalExpedienteV13";
import type { UniversalEvidenceRecord } from "../lb52/UniversalEvidenceWorkspace";

const DERIVED_SOURCE: EvidenceReference = { kind: "DERIVED_CALCULATION", sourceId: "lb95:supply-asa-projection" };

function must<T>(record: UniversalEvidenceRecord, path: string): EvidenceField<T> {
  const field = record.fields[path];
  if (!field || !isPromotableEvidenceField(field)) throw new Error(`${path}: falta evidencia validada y promocionable.`);
  return field as EvidenceField<T>;
}

function derived<T>(key: string, value: T, from: readonly EvidenceField<unknown>[]): EvidenceField<T> {
  return {
    key,
    value,
    status: "HUMAN_VALIDATED",
    sources: [...from.flatMap(item => item.sources), DERIVED_SOURCE],
    humanValidationRequired: true,
    humanValidated: true,
    diagnostics: ["Proyección documental LB95 desde evidencia humana validada; no introduce una decisión jurídica nueva."],
  };
}

function notApplicable<T>(key: string, sourceId: string, legalBasis: readonly string[]): EvidenceField<T> {
  return {
    key,
    value: null,
    status: "NOT_APPLICABLE",
    sources: [{ kind: "NORMATIVE_RULE", sourceId }],
    legalBasis,
    humanValidationRequired: false,
    humanValidated: false,
  };
}

function normalizeCriteria(record: UniversalEvidenceRecord): { domain: EvidenceField<readonly CriterioAdjudicacion[]>; canonical: EvidenceField<readonly string[]> } {
  const source = must<readonly unknown[]>(record, "criteria.awardCriteria");
  if (!Array.isArray(source.value) || source.value.length === 0) throw new Error("criteria.awardCriteria: se requiere al menos un criterio estructurado.");
  const criteria = source.value.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error(`criteria.awardCriteria[${index}]: criterio no estructurado.`);
    const candidate = item as { nombre?: unknown; ponderacion?: unknown; evaluableMedianteFormula?: unknown };
    if (typeof candidate.nombre !== "string" || !candidate.nombre.trim() || !Number.isFinite(candidate.ponderacion) || typeof candidate.evaluableMedianteFormula !== "boolean") {
      throw new Error(`criteria.awardCriteria[${index}]: deben constar nombre, ponderación y evaluación mediante fórmula.`);
    }
    return new CriterioAdjudicacion(candidate.nombre.trim(), Number(candidate.ponderacion), candidate.evaluableMedianteFormula);
  });
  const domain = derived<readonly CriterioAdjudicacion[]>("criteria.awardCriteria", criteria, [source]);
  const canonical = derived<readonly string[]>("awardCriteria", criteria.map(item => `${item.nombre} (${item.ponderacion} %)`) , [source]);
  return { domain, canonical };
}

function modificationDecision(record: UniversalEvidenceRecord): { source: EvidenceField<string | UniversalSupplyAsaPlannedModificationDecision>; percent: number } {
  const source = must<string | UniversalSupplyAsaPlannedModificationDecision>(record, "execution.plannedModificationRegime");
  if (typeof source.value === "string") {
    if (source.value !== "CONTR-2026-240267:STABILITY-DOWN-20:DA33-UP-20:NO-NEW-ARTICLES-OR-PRICES") {
      throw new Error("execution.plannedModificationRegime: el texto libre no es promocionable al PCAP general; use el perfil estructurado LB95.");
    }
    return { source, percent: 20 };
  }
  if (!source.value || typeof source.value !== "object") throw new Error("execution.plannedModificationRegime: falta perfil estructurado.");
  const d = source.value;
  const values = [d.budgetStability, d.needsDa33, d.other];
  for (const item of values) {
    if (!item || typeof item.applicable !== "boolean" || !Number.isFinite(item.maximumPercent) || item.maximumPercent < 0 || item.maximumPercent > 20) {
      throw new Error("execution.plannedModificationRegime: perfil estructurado inválido o superior al 20 %.");
    }
  }
  return { source, percent: Math.max(...values.filter(item => item.applicable).map(item => item.maximumPercent), 0) };
}

function canonicalLots(record: UniversalEvidenceRecord): EvidenceField<readonly string[]> {
  const division = must<boolean>(record, "lots.divisionIntoLots");
  if (division.value === false) return derived("lots", [], [division]);
  const lots = must<readonly UniversalLot[]>(record, "lots.lots");
  if (!Array.isArray(lots.value) || lots.value.length === 0) throw new Error("lots.lots: la división en lotes exige lotes estructurados.");
  const names = lots.value.map((lot, index) => {
    const name = lot?.name;
    if (!name || !isPromotableEvidenceField(name) || typeof name.value !== "string" || !name.value.trim()) throw new Error(`lots.lots[${index}].name: falta denominación validada.`);
    return name.value.trim();
  });
  return derived("lots", names, [division, lots]);
}

export function projectSupplyAsaEvidence(record: UniversalEvidenceRecord): UniversalExpedienteV13 {
  const contractType = must<"SUPPLY">(record, "contractType");
  if (contractType.value !== "SUPPLY") throw new Error("El proyector PCAP ASA solo admite contratos de suministro.");
  const procedure = must<string>(record, "procedure");
  if (procedure.value !== "ABIERTO_SIMPLIFICADO_ABREVIADO") throw new Error("El proyector PCAP ASA solo admite el procedimiento abierto simplificado abreviado.");
  const funding = must<string>(record, "economic.fundingSource");
  if (!["AUTOFINANCED", "AUTOFINANCIADA"].includes(String(funding.value))) throw new Error("El proyector PCAP ASA acreditado exige financiación autofinanciada.");

  const object = must<string>(record, "object");
  const cpv = must<string>(record, "cpvMain");
  const pbl = must<number>(record, "baseTenderBudgetCents");
  const ve = must<number>(record, "economic.legalEstimatedValueCents");
  const duration = must<number>(record, "durationMonths");
  const extension = must<number>(record, "extensionMonths");
  const criteria = normalizeCriteria(record);
  const modification = modificationDecision(record);

  const canonical: CanonicalExpedienteState = {
    id: record.caseId,
    lifecycleState: EstadoExpediente.REVISION_JURIDICA,
    fields: {
      contractType,
      object,
      cpvMain: cpv,
      lots: canonicalLots(record),
      estimatedValueCents: derived("estimatedValueCents", ve.value as number, [ve]),
      baseTenderBudgetCents: pbl,
      procedure,
      durationMonths: duration,
      extensionMonths: extension,
      modificationPercent: derived("modificationPercent", modification.percent, [modification.source]),
      awardCriteria: criteria.canonical,
      solvency: notApplicable("solvency", "LCSP:159.6.b", ["LCSP art. 159.6.b"]),
    },
    blockers: [],
    warnings: [],
  };

  const expediente = createUniversalExpedienteFromCanonical(canonical);
  expediente.processing.processingType = must<string>(record, "processing.processingType");
  expediente.administrative.contractingAuthority = must<string>(record, "administrative.contractingAuthority");
  expediente.administrative.reservedContractDa4 = must<boolean>(record, "administrative.reservedContractDa4");
  expediente.technical.executionLocations = must<readonly string[]>(record, "technical.executionLocations");
  expediente.lots.divisionIntoLots = must<boolean>(record, "lots.divisionIntoLots");
  if (record.fields["lots.noDivisionJustification"]) expediente.lots.noDivisionJustification = must<string>(record, "lots.noDivisionJustification");
  expediente.economic.fundingSource = funding;
  expediente.economic.initialVatAmountCents = must<number>(record, "economic.initialVatAmountCents");
  expediente.economic.initialPblVatIncludedCents = must<number>(record, "economic.initialPblVatIncludedCents");
  expediente.economic.needsBasedContractDa33 = must<boolean>(record, "economic.needsBasedContractDa33");
  expediente.economic.budgetCoversEntireContractLife = must<boolean>(record, "economic.budgetCoversEntireContractLife");
  expediente.economic.legalEstimatedValueCents = ve;
  expediente.economic.estimatedValueCalculationMethod = must<string>(record, "economic.estimatedValueCalculationMethod");
  expediente.economic.priceDeterminationRegime = must<string>(record, "economic.priceDeterminationRegime");
  expediente.economic.priceRevisionRegime = must<string>(record, "economic.priceRevisionRegime");
  expediente.economic.annualityBudgetRows = must(record, "economic.annualityBudgetRows");
  expediente.execution.extensionStructure = must<string>(record, "execution.extensionStructure");
  expediente.execution.extensionNoticeMonths = must<number>(record, "execution.extensionNoticeMonths");
  expediente.execution.plannedModificationRegime = modification.source;
  expediente.execution.specialExecutionConditions = must<readonly string[]>(record, "execution.specialExecutionConditions");
  expediente.criteria.awardCriteria = criteria.domain;
  if (criteria.domain.value?.length === 1) expediente.criteria.singleCriterionMotivation = must<string>(record, "criteria.singleCriterionMotivation");
  return expediente;
}
