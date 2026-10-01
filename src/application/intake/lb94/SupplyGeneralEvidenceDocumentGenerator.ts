import type { EvidenceField } from "../../../domain/expediente/EvidenceField";
import type { UniversalEvidenceRecord } from "../lb52/UniversalEvidenceWorkspace";
import type { UniversalEditableTemplateBinaryStore } from "../lb23/UniversalOdtProductionRenderer";
import { loadPersistedSupplyGeneralTemplate } from "./PersistedSupplyGeneralTemplateRuntime";
import { renderSupplyGeneralEditableTemplate, type SupplyGeneralRenderedDocument } from "./SupplyGeneralEditableTemplateRenderer";
import { assertCanonicalOdtStructure } from "../lb104/CanonicalOdtStructureAudit";
import { assertCanonicalOdtVisualProfile } from "../lb105/CanonicalOdtVisualAudit";

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

const DOCUMENT_LABELS: Readonly<Record<string, string>> = {
  ABIERTO: "Abierto",
  ABIERTO_SIMPLIFICADO: "Abierto simplificado",
  ABIERTO_SIMPLIFICADO_ORDINARIO: "Abierto simplificado ordinario",
  ABIERTO_SIMPLIFICADO_ABREVIADO: "Abierto simplificado abreviado",
  AUTOFINANCED: "Fondos propios",
  AUTOFINANCIADA: "Fondos propios",
  EU_FUNDS: "Fondos europeos",
  OTHER: "Otra fuente de financiación",
  ORDINARY_GLOBAL_PRICE: "Suministro ordinario con cantidades determinadas y precio global",
  CATALOGUE_NEEDS: "Suministro por necesidades sucesivas y precios unitarios",
  QUOTES_OR_CATALOGUES: "Ofertas, tarifas o catálogos contrastables",
  COST_STUDY: "Estudio de costes",
  PRIOR_CONTRACTS: "Contratos anteriores comparables",
  MARKET_CONSULTATION: "Consulta preliminar de mercado",
};

function documentLabel(value: string): string {
  return DOCUMENT_LABELS[value] ?? value.replaceAll("_", " ").toLocaleLowerCase("es-ES");
}

function documentaryText(value: string): string {
  return Object.entries(DOCUMENT_LABELS).reduce(
    (current, [code, label]) => current.replaceAll(code, label),
    value,
  );
}

function optionalValue(record: UniversalEvidenceRecord, path: string): unknown {
  if (!record.fields[path]) return null;
  return value(record, path);
}

function optionalText(record: UniversalEvidenceRecord, path: string, fallback: string): string {
  const current = optionalValue(record, path);
  return typeof current === "string" && current.trim() ? documentaryText(current.trim()) : fallback;
}

function residualDecisions(record: UniversalEvidenceRecord): Record<string, unknown> {
  const current = optionalValue(record, "administrative.pcapAnnexIResidualDecisions");
  return current && typeof current === "object" && !Array.isArray(current) ? current as Record<string, unknown> : {};
}

function cpvSummary(record: UniversalEvidenceRecord): string {
  const principal = text(record, "cpvMain");
  const description = optionalValue(record, "cpvMainDescription");
  const additional = optionalValue(record, "cpvAdditional");
  const assignments = optionalValue(record, "lots.cpvAssignments");
  return [
    `Principal: ${principal}${typeof description === "string" && description.trim() ? ` — ${description.trim()}` : ""}.`,
    additional && (!Array.isArray(additional) || additional.length > 0) ? `Complementarios: ${stringifyControlled(additional)}.` : "",
    assignments && (!Array.isArray(assignments) || assignments.length > 0) ? `Asignación por lotes: ${stringifyControlled(assignments)}.` : "",
  ].filter(Boolean).join(" ");
}

function technicalSpecifications(record: UniversalEvidenceRecord): string {
  const rows: readonly [string, string][] = [
    ["technical.technicalPurpose", "Finalidad técnica"],
    ["technical.technicalRequirements", "Requisitos mínimos"],
    ["technical.verificationMethods", "Comprobación de los requisitos"],
    ["technical.accessibilityRegime", "Accesibilidad universal"],
    ["technical.environmentalTechnicalRegime", "Requisitos ambientales"],
    ["technical.equivalenceRegime", "Referencias técnicas y equivalencias"],
    ["technical.specialRequirements", "Prescripciones especiales"],
  ];
  return rows.map(([path, label]) => {
    const current = optionalValue(record, path);
    return `${label}: ${current === null ? "No procede." : stringifyControlled(current)}`;
  }).join("\n");
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
  return `Presupuesto base sin IVA: ${euro(base)}. IVA: ${euro(vat)}. Presupuesto con IVA: ${euro(total)}. Valor estimado: ${euro(estimated)}. Sistema de determinación del precio: ${documentaryText(price)} Método de cálculo del valor estimado: ${documentaryText(calculation)} Revisión de precios: ${documentaryText(revision)}`;
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
  return `Procedimiento validado: ${documentLabel(procedure)}. Financiación declarada: ${documentLabel(funding)}.`;
}

function awardCriteriaSummary(record: UniversalEvidenceRecord): string {
  const criteria = value(record, "criteria.awardCriteria");
  const motivation = Array.isArray(criteria) && criteria.length === 1 ? ` Motivación asociada: ${text(record, "criteria.singleCriterionMotivation")}` : "";
  if (!Array.isArray(criteria) || !criteria.length) throw new Error("Los criterios de adjudicación deben contener al menos una decisión validada.");
  const formatted = criteria.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return `${index + 1}. ${stringifyControlled(item)}`;
    const row = item as Record<string, unknown>;
    const name = String(row.nombre ?? row.name ?? `Criterio ${index + 1}`);
    const weight = Number(row.ponderacion ?? row.weight);
    const automatic = row.evaluableMedianteFormula ?? row.evaluation === "FORMULA";
    return `${index + 1}. ${name}: ${Number.isFinite(weight) ? `${weight} puntos` : "ponderación definida"}; ${automatic ? "valoración automática mediante fórmula" : "valoración técnica conforme al método definido"}.`;
  }).join(" ");
  return `Criterios de adjudicación: ${formatted}${motivation}`;
}

function backgroundAndCompetence(record: UniversalEvidenceRecord): string {
  const authority = text(record, "administrative.contractingAuthority");
  return `La contratación se promueve para atender la necesidad descrita en esta Memoria. El órgano de contratación es ${authority}, al que corresponde aprobar el expediente y los pliegos dentro de las competencias que tenga atribuidas.`;
}

function estimatedValueSummary(record: UniversalEvidenceRecord): string {
  return `El valor estimado del contrato asciende a ${euro(number(record, "economic.legalEstimatedValueCents"))}, IVA excluido. Se ha calculado mediante el siguiente método validado: ${documentaryText(text(record, "economic.estimatedValueCalculationMethod"))}`;
}

function procedureJustification(record: UniversalEvidenceRecord): string {
  const procedure = documentLabel(text(record, "procedure"));
  const processing = optionalText(record, "processing.processingType", "tramitación ordinaria");
  return `Se emplea el procedimiento ${procedure} por resultar compatible con la naturaleza y cuantía del contrato y con las decisiones jurídicas validadas en el expediente. La tramitación será ${processing.toLocaleLowerCase("es-ES")}.`;
}

function capacityAndSolvencySummary(record: UniversalEvidenceRecord): string {
  const economic = optionalText(record, "criteria.economicSolvency", "No se exige acreditar solvencia económica por el régimen del procedimiento seleccionado.");
  const technical = optionalText(record, "criteria.technicalSolvency", "No se exige acreditar solvencia técnica por el régimen del procedimiento seleccionado.");
  const residual = residualDecisions(record);
  const authorization = String(residual.professionalAuthorization ?? "No").toLocaleLowerCase("es-ES").startsWith("s")
    ? `Se exige habilitación profesional: ${String(residual.professionalAuthorizationDetail ?? "debe concretarse")}.`
    : "No se exige una habilitación empresarial o profesional específica distinta de la capacidad general para contratar.";
  return `${authorization} Solvencia económica: ${economic} Solvencia técnica o profesional: ${technical}`;
}

function guaranteesSummary(record: UniversalEvidenceRecord): string {
  const provisional = optionalValue(record, "guarantees.provisionalGuaranteeRequired") === true
    ? `Se exige garantía provisional: ${optionalText(record, "guarantees.provisionalGuaranteeJustification", "según la decisión motivada del expediente")}.`
    : "No se exige garantía provisional.";
  const definitive = optionalText(record, "guarantees.definitiveGuaranteeRegime", "No se exige garantía definitiva por el régimen del procedimiento seleccionado.");
  const warranty = optionalText(record, "guarantees.warrantyPeriodRegime", String(residualDecisions(record).warrantyTerm ?? "No se establece un plazo adicional distinto del legalmente aplicable."));
  return `${provisional} Garantía definitiva: ${definitive} Plazo de garantía: ${warranty}`;
}

function subcontractingAndAssignmentSummary(record: UniversalEvidenceRecord): string {
  return `Subcontratación: ${optionalText(record, "execution.subcontractingRegime", "Se admite en los términos y con los límites establecidos en la LCSP.")} Cesión: ${optionalText(record, "execution.assignmentRegime", "Se admite cuando se cumplan los requisitos legales y los establecidos en el PCAP.")}`;
}

function managementExecutionPaymentSummary(record: UniversalEvidenceRecord): string {
  const manager = optionalText(record, "administrative.contractManager", "la unidad que designe el órgano de contratación");
  const functions = optionalText(record, "execution.contractManagerFunctions", "supervisar la ejecución y dictar las instrucciones necesarias para asegurar el cumplimiento de la prestación");
  const receipt = text(record, "execution.receiptAndAcceptanceRegime");
  const invoice = optionalText(record, "execution.invoiceSubmissionRegime", "La factura se presentará electrónicamente en el punto general aplicable.");
  const payment = optionalText(record, "execution.paymentRegime", "El pago se efectuará tras la recepción conforme y la aprobación de la factura.");
  return `Responsable del contrato: ${manager}; ejercerá las siguientes funciones: ${functions} Recepción y conformidad: ${receipt} Facturación: ${invoice} Pago: ${payment}`;
}

function dataProtectionAndSecuritySummary(record: UniversalEvidenceRecord): string {
  return `Escenario de protección de datos: ${optionalText(record, "dataProtection.processingScenario", "la ejecución no requiere tratamiento de datos personales por cuenta del responsable")} Régimen aplicable: ${optionalText(record, "dataProtection.personalDataRegime", "deber de confidencialidad y cumplimiento de la normativa aplicable")} Seguridad de la información: ${optionalText(record, "security.informationSecurityRegime", "medidas proporcionadas a la información efectivamente tratada")}`;
}

function supplyDefinition(record: UniversalEvidenceRecord): string {
  const residual = residualDecisions(record);
  const units = String(residual.totalUnits ?? "").trim();
  const specification = String(residual.objectSpecification ?? "").trim();
  if (!units || /según la relación|documentación técnica/i.test(units)) throw new Error("El PPT exige el número o relación concreta de unidades del suministro; no basta una remisión genérica.");
  if (!specification || specification === text(record, "object")) throw new Error("El PPT exige especificaciones materiales adicionales al mero objeto del contrato.");
  return `Definición material del suministro: ${specification} Número o relación total de unidades: ${units}.`;
}

function technicalWarrantySummary(record: UniversalEvidenceRecord): string {
  const warranty = optionalText(record, "guarantees.warrantyPeriodRegime", String(residualDecisions(record).warrantyTerm ?? "").trim());
  if (!warranty) throw new Error("El PPT exige concretar el plazo y alcance de la garantía técnica.");
  return `Garantía técnica: ${warranty}`;
}

function pptDataProtectionSummary(record: UniversalEvidenceRecord): string {
  return `Protección de datos y confidencialidad durante la ejecución: ${optionalText(record, "dataProtection.personalDataRegime", "no se prevé tratamiento de datos personales por cuenta del responsable; se mantendrá la confidencialidad de la información a la que se acceda")}. Seguridad de la información: ${optionalText(record, "security.informationSecurityRegime", "se aplicarán medidas proporcionadas a la información efectivamente tratada")}.`;
}

function environmentalSummary(record: UniversalEvidenceRecord): string {
  return `Obligaciones ambientales vinculadas al suministro: ${optionalText(record, "technical.environmentalRequirements", "cumplimiento de la normativa ambiental aplicable, reducción de embalajes innecesarios y correcta gestión de los residuos generados en la entrega")}.`;
}

function technicalDocumentationSummary(record: UniversalEvidenceRecord): string {
  const documents = optionalText(record, "technical.requiredDocumentation", "fichas técnicas, instrucciones y documentación de conformidad que resulte aplicable a los bienes suministrados");
  return `Documentación que deberá acompañar al suministro: ${documents}. La documentación deberá permitir comprobar las características ofertadas y la conformidad de las unidades entregadas.`;
}

function executionSummary(record: UniversalEvidenceRecord): string {
  const special = value(record, "execution.specialExecutionConditions");
  const receipt = text(record, "execution.receiptAndAcceptanceRegime");
  return `Condiciones especiales de ejecución: ${stringifyControlled(special)}. Régimen de recepción y conformidad: ${receipt}`;
}

function modificationSummary(record: UniversalEvidenceRecord): string {
  const current = value(record, "execution.plannedModificationRegime");
  if (current && typeof current === "object" && !Array.isArray(current)) {
    const causes = current as Record<string, {applicable?: boolean; maximumPercent?: number; description?: string; limits?: string[]}>;
    return [["budgetStability", "Estabilidad presupuestaria"], ["needsDa33", "Mayores necesidades"], ["other", "Otras causas"]].map(([key,label]) => {
      const cause = causes[key!];
      if (!cause || typeof cause.applicable !== "boolean") throw new Error("Régimen de modificaciones incompleto.");
      return cause.applicable ? `${label}: porcentaje máximo declarado ${cause.maximumPercent} %. ${cause.description ?? ""} ${(cause.limits ?? []).join(" ")}`.trim() : `${label}: no prevista.`;
    }).join(" ");
  }
  return `Régimen de modificación prevista validado: ${stringifyControlled(current)}`;
}

function supplyVariantRequirements(record: UniversalEvidenceRecord): string {
  const variant = text(record, "technical.supplyVariant");
  const parts: string[] = [`Modalidad del suministro: ${documentLabel(variant)}.`];
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
        { slotId: "backgroundAndCompetence", value: backgroundAndCompetence(input.record) },
        { slotId: "object", value: text(input.record, "object") },
        { slotId: "cpvMain", value: cpvSummary(input.record) },
        { slotId: "lotsRegime", value: lotsRegime(input.record) },
        { slotId: "economicSummary", value: economicSummary(input.record) },
        { slotId: "estimatedValueSummary", value: estimatedValueSummary(input.record) },
        { slotId: "durationSummary", value: durationSummary(input.record) },
        { slotId: "procedureSummary", value: procedureSummary(input.record) },
        { slotId: "procedureJustification", value: procedureJustification(input.record) },
        { slotId: "capacityAndSolvencySummary", value: capacityAndSolvencySummary(input.record) },
        { slotId: "awardCriteriaSummary", value: awardCriteriaSummary(input.record) },
        { slotId: "guaranteesSummary", value: guaranteesSummary(input.record) },
        { slotId: "executionSummary", value: executionSummary(input.record) },
        { slotId: "subcontractingAndAssignmentSummary", value: subcontractingAndAssignmentSummary(input.record) },
        { slotId: "modificationSummary", value: modificationSummary(input.record) },
        { slotId: "priceRevisionSummary", value: documentaryText(text(input.record, "economic.priceRevisionRegime")) },
        { slotId: "managementExecutionPaymentSummary", value: managementExecutionPaymentSummary(input.record) },
        { slotId: "dataProtectionAndSecuritySummary", value: dataProtectionAndSecuritySummary(input.record) },
      ],
    });
    assertCanonicalOdtStructure({ bytes: document.bytes, document: "MEMORY", family: "SUPPLY" });
    assertCanonicalOdtVisualProfile(document.bytes);
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
        { slotId: "technicalRequirements", value: technicalSpecifications(input.record) },
        { slotId: "supplyDefinition", value: supplyDefinition(input.record) },
        { slotId: "supplyVariantRequirements", value: supplyVariantRequirements(input.record) },
        { slotId: "receiptAndAcceptanceRegime", value: text(input.record, "execution.receiptAndAcceptanceRegime") },
        { slotId: "specialExecutionConditions", value: value(input.record, "execution.specialExecutionConditions") },
        { slotId: "technicalWarrantySummary", value: technicalWarrantySummary(input.record) },
        { slotId: "pptDataProtectionSummary", value: pptDataProtectionSummary(input.record) },
        { slotId: "environmentalSummary", value: environmentalSummary(input.record) },
        { slotId: "technicalDocumentationSummary", value: technicalDocumentationSummary(input.record) },
      ],
    });
    assertCanonicalOdtStructure({ bytes: document.bytes, document: "PPT", family: "SUPPLY" });
    assertCanonicalOdtVisualProfile(document.bytes);
    documents.push(document);
  } catch (error) {
    blockers.push(`PPT: ${error instanceof Error ? error.message : String(error)}`);
  }

  return { ready: blockers.length === 0 && documents.length === 2, documents, blockers, humanValidationRequired: true };
}
