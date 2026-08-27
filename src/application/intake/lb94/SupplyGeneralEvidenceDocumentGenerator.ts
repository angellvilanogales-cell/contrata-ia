import type { EvidenceField } from "../../../domain/expediente/EvidenceField";
import type { UniversalEvidenceRecord } from "../lb52/UniversalEvidenceWorkspace";
import type { UniversalEditableTemplateBinaryStore } from "../lb23/UniversalOdtProductionRenderer";
import { loadPersistedSupplyGeneralTemplate } from "./PersistedSupplyGeneralTemplateRuntime";
import { renderSupplyGeneralEditableTemplate, type SupplyGeneralRenderedDocument } from "./SupplyGeneralEditableTemplateRenderer";

export interface SupplyGeneralEvidenceDocuments {
  ready: boolean;
  documents: readonly SupplyGeneralRenderedDocument[];
  blockers: readonly string[];
  humanValidationRequired: true;
}

function validatedField(record: UniversalEvidenceRecord, path: string): EvidenceField<unknown> {
  const field = record.fields[path];
  if (!field) throw new Error(`Falta evidencia para ${path}.`);
  if (field.status === "SOURCE_CONFLICT" || field.status === "PENDING") throw new Error(`${path} está ${field.status} y no puede entrar en un documento.`);
  if (field.status !== "NOT_APPLICABLE" && (!field.humanValidated || field.status !== "HUMAN_VALIDATED")) {
    throw new Error(`${path} requiere validación humana expresa antes de generación.`);
  }
  return field;
}

function value(record: UniversalEvidenceRecord, path: string): unknown {
  const field = validatedField(record, path);
  return field.status === "NOT_APPLICABLE" ? null : field.value;
}

function text(record: UniversalEvidenceRecord, path: string): string {
  const current = value(record, path);
  if (typeof current !== "string" || !current.trim()) throw new Error(`${path} debe contener texto validado.`);
  return current.trim();
}

function number(record: UniversalEvidenceRecord, path: string): number {
  const current = value(record, path);
  if (typeof current !== "number" || !Number.isFinite(current)) throw new Error(`${path} debe contener un número validado.`);
  return current;
}

function boolean(record: UniversalEvidenceRecord, path: string): boolean {
  const current = value(record, path);
  if (typeof current !== "boolean") throw new Error(`${path} debe contener un booleano validado.`);
  return current;
}

function stringArray(record: UniversalEvidenceRecord, path: string): readonly string[] {
  const current = value(record, path);
  if (!Array.isArray(current) || !current.every(item => typeof item === "string")) throw new Error(`${path} debe contener una lista de textos validada.`);
  return current as string[];
}

function euro(cents: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function stringifyControlled(value: unknown): string {
  if (value === null || value === undefined) return "No procede.";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value.map(item => {
      if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") return String(item);
      if (item && typeof item === "object" && !Array.isArray(item)) {
        const record = item as Record<string, unknown>;
        return Object.entries(record).map(([key, entry]) => `${key}: ${typeof entry === "object" ? JSON.stringify(entry) : String(entry)}`).join(", ");
      }
      return JSON.stringify(item);
    }).join("; ");
  }
  if (typeof value === "object") return Object.entries(value as Record<string, unknown>).map(([key, entry]) => `${key}: ${String(entry)}`).join("; ");
  throw new Error("Valor documental no serializable de forma controlada.");
}

function lotsRegime(record: UniversalEvidenceRecord): string {
  const divided = boolean(record, "lots.divisionIntoLots");
  if (!divided) return `No se divide el contrato en lotes. Motivación validada: ${text(record, "lots.noDivisionJustification")}`;
  const lots = record.fields["lots.lots"] ? value(record, "lots.lots") : null;
  if (!Array.isArray(lots) || lots.length === 0) throw new Error("La división en lotes exige lots.lots validado antes de generar la Memoria.");
  return `El contrato se divide en lotes conforme a la relación validada del expediente: ${stringifyControlled(lots)}`;
}

function economicSummary(record: UniversalEvidenceRecord): string {
  const base = number(record, "baseTenderBudgetCents");
  const vat = number(record, "economic.initialVatAmountCents");
  const total = number(record, "economic.initialPblVatIncludedCents");
  const estimated = number(record, "economic.legalEstimatedValueCents");
  const price = text(record, "economic.priceDeterminationRegime");
  const calculation = text(record, "economic.estimatedValueCalculationMethod");
  const revision = text(record, "economic.priceRevisionRegime");
  return `Presupuesto base sin IVA: ${euro(base)}. IVA: ${euro(vat)}. Presupuesto con IVA: ${euro(total)}. Valor estimado: ${euro(estimated)}. Sistema de determinación del precio: ${price} Método de cálculo del valor estimado: ${calculation} Revisión de precios: ${revision}`;
}

function durationSummary(record: UniversalEvidenceRecord): string {
  const initial = number(record, "durationMonths");
  const extensions = number(record, "extensionMonths");
  const structure = text(record, "execution.extensionStructure");
  const notice = number(record, "execution.extensionNoticeMonths");
  return `Duración inicial validada: ${initial} meses. Prórrogas máximas: ${extensions} meses. Estructura: ${structure} Preaviso declarado: ${notice} meses.`;
}

function procedureSummary(record: UniversalEvidenceRecord): string {
  const procedure = text(record, "procedure");
  const funding = text(record, "economic.fundingSource");
  return `Procedimiento validado: ${procedure}. Financiación declarada: ${funding}.`;
}

function awardCriteriaSummary(record: UniversalEvidenceRecord): string {
  const criteria = value(record, "criteria.awardCriteria");
  const motivation = text(record, "criteria.singleCriterionMotivation");
  return `Criterios de adjudicación validados: ${stringifyControlled(criteria)}. Motivación asociada: ${motivation}`;
}

function executionSummary(record: UniversalEvidenceRecord): string {
  const special = value(record, "execution.specialExecutionConditions");
  const receipt = text(record, "execution.receiptAndAcceptanceRegime");
  return `Condiciones especiales de ejecución: ${stringifyControlled(special)}. Régimen de recepción y conformidad: ${receipt}`;
}

function modificationSummary(record: UniversalEvidenceRecord): string {
  return `Régimen de modificación prevista validado: ${text(record, "execution.plannedModificationRegime")}`;
}

function supplyVariantRequirements(record: UniversalEvidenceRecord): string {
  const variant = text(record, "technical.supplyVariant");
  const parts: string[] = [`Subfamilia técnica declarada: ${variant}.`];
  for (const [path, label] of [
    ["technical.hasSuccessiveOrders", "Pedidos o entregas sucesivas"],
    ["technical.hasServicePlatformComponent", "Componente de servicio o plataforma"],
    ["technical.hasInstallationOrAssembly", "Montaje o instalación"],
  ] as const) {
    if (record.fields[path]) parts.push(`${label}: ${boolean(record, path) ? "Sí" : "No"}.`);
  }
  return parts.join(" ");
}

/**
 * LB94: Memoria y PPT físicos generales para Supply. La función no inventa
 * información jurídica ni técnica: únicamente concatena evidencia ya validada
 * humanamente y bloquea cualquier ruta pendiente, conflictiva o no declarada.
 */
export async function generateSupplyGeneralEvidenceDocuments(input: {
  record: UniversalEvidenceRecord;
  templateStore: UniversalEditableTemplateBinaryStore;
}): Promise<SupplyGeneralEvidenceDocuments> {
  const blockers: string[] = [];
  const documents: SupplyGeneralRenderedDocument[] = [];
  try {
    if (text(input.record, "contractType") !== "SUPPLY") throw new Error("LB94 solo genera estas plantillas para contratos de suministro.");
    const memory = await loadPersistedSupplyGeneralTemplate(input.templateStore, "MEMORY");
    const document = renderSupplyGeneralEditableTemplate({
      template: memory,
      caseId: input.record.caseId,
      values: [
        { slotId: "need", value: text(input.record, "need") },
        { slotId: "object", value: text(input.record, "object") },
        { slotId: "cpvMain", value: text(input.record, "cpvMain") },
        { slotId: "lotsRegime", value: lotsRegime(input.record) },
        { slotId: "economicSummary", value: economicSummary(input.record) },
        { slotId: "durationSummary", value: durationSummary(input.record) },
        { slotId: "procedureSummary", value: procedureSummary(input.record) },
        { slotId: "awardCriteriaSummary", value: awardCriteriaSummary(input.record) },
        { slotId: "executionSummary", value: executionSummary(input.record) },
        { slotId: "modificationSummary", value: modificationSummary(input.record) },
      ],
    });
    documents.push(document);
  } catch (error) {
    blockers.push(`MEMORIA: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    const ppt = await loadPersistedSupplyGeneralTemplate(input.templateStore, "PPT");
    const document = renderSupplyGeneralEditableTemplate({
      template: ppt,
      caseId: input.record.caseId,
      values: [
        { slotId: "object", value: text(input.record, "object") },
        { slotId: "contractManagement", value: `Órgano de contratación: ${text(input.record, "administrative.contractingAuthority")}` },
        { slotId: "durationSummary", value: durationSummary(input.record) },
        { slotId: "executionLocations", value: stringArray(input.record, "technical.executionLocations") },
        { slotId: "technicalRequirements", value: text(input.record, "technical.technicalRequirements") },
        { slotId: "supplyVariantRequirements", value: supplyVariantRequirements(input.record) },
        { slotId: "receiptAndAcceptanceRegime", value: text(input.record, "execution.receiptAndAcceptanceRegime") },
        { slotId: "specialExecutionConditions", value: value(input.record, "execution.specialExecutionConditions") },
      ],
    });
    documents.push(document);
  } catch (error) {
    blockers.push(`PPT: ${error instanceof Error ? error.message : String(error)}`);
  }

  return { ready: blockers.length === 0 && documents.length === 2, documents, blockers, humanValidationRequired: true };
}
