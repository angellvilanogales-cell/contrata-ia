import { EvidenceField, isPromotableEvidenceField } from "../../../domain/expediente/EvidenceField";
import { UniversalExpedienteV13 } from "../../../domain/expediente/UniversalExpedienteV13";

export const BLOCK_14_ADAPTIVE_ENGINE_VERSION = "14.5.0" as const;

export type AdaptiveActionKind = "ASK_USER" | "VALIDATE_HUMAN" | "RESOLVE_SOURCE_CONFLICT" | "RUN_ENGINE" | "COMPLETE";
export type AdaptiveActionPriority = "BLOCKING" | "HIGH" | "NORMAL";

export interface UniversalAdaptiveAction {
  kind: AdaptiveActionKind;
  id: string;
  fieldKey?: string;
  engine?: "CONTRACT_NATURE_CLASSIFIER" | "CPVEngine" | "ProcedimientoEngine" | "DeadlineDecisionEngine";
  question?: string;
  help?: string;
  reason: string;
  priority: AdaptiveActionPriority;
}

function fieldNeedsHumanValidation(field: EvidenceField<unknown>): boolean {
  return field.status !== "SOURCE_CONFLICT" && field.status !== "PENDING" && field.humanValidationRequired && !field.humanValidated;
}

function conflictAction(field: EvidenceField<unknown>): UniversalAdaptiveAction | null {
  if (field.status !== "SOURCE_CONFLICT") return null;
  return { kind: "RESOLVE_SOURCE_CONFLICT", id: `resolve:${field.key}`, fieldKey: field.key, reason: `El campo ${field.key} contiene declaraciones de fuente incompatibles y no puede resolverse automáticamente.`, priority: "BLOCKING" };
}

function validationAction(field: EvidenceField<unknown>): UniversalAdaptiveAction | null {
  if (!fieldNeedsHumanValidation(field)) return null;
  return { kind: "VALIDATE_HUMAN", id: `validate:${field.key}`, fieldKey: field.key, reason: `Ya existe una propuesta o declaración para ${field.key}; debe validarse antes de pedir o calcular información dependiente.`, priority: "HIGH" };
}

function allEvidenceFields(expediente: UniversalExpedienteV13): EvidenceField<unknown>[] {
  const canonical = Object.values(expediente.canonical.fields) as EvidenceField<unknown>[];
  const domains = [expediente.processing, expediente.regulation, expediente.economic, expediente.administrative, expediente.technical, expediente.lots, expediente.guarantees, expediente.execution, expediente.criteria];
  return [...canonical, ...domains.flatMap(domain => Object.values(domain) as EvidenceField<unknown>[])];
}

function ask(fieldKey: string, id: string, question: string, help: string, reason: string): UniversalAdaptiveAction {
  return { kind: "ASK_USER", id, fieldKey, question, help, reason, priority: "NORMAL" };
}

function run(engine: NonNullable<UniversalAdaptiveAction["engine"]>, id: string, fieldKey: string, reason: string): UniversalAdaptiveAction {
  return { kind: "RUN_ENGINE", id, engine, fieldKey, reason, priority: "HIGH" };
}

function isKnown(field: EvidenceField<unknown> | undefined): boolean {
  return Boolean(field && field.status !== "PENDING" && field.status !== "SOURCE_CONFLICT" && (field.value !== null || field.status === "NOT_APPLICABLE"));
}

function coreIdentificationAction(expediente: UniversalExpedienteV13): UniversalAdaptiveAction | null {
  const f = expediente.canonical.fields;
  if (!isKnown(f.object)) return ask(f.object.key, "ask:contract-need", "¿Qué necesita contratar la Administración y para qué?", "Descríbalo con lenguaje natural. No es necesario conocer el tipo jurídico del contrato ni el CPV.", "El objeto material de la necesidad es un hecho de partida que el sistema no debe inventar.");
  if (!isKnown(f.contractType)) return run("CONTRACT_NATURE_CLASSIFIER", "run:contract-nature", f.contractType.key, "Con una descripción de la necesidad ya disponible, primero debe intentarse una propuesta de naturaleza contractual antes de preguntar al usuario por una calificación jurídica.");
  if (!isKnown(f.cpvMain)) return run("CPVEngine", "run:cpv", f.cpvMain.key, "El objeto y el tipo contractual permiten obtener una propuesta CPV; no procede pedir al usuario un código que puede proponer el sistema.");
  return null;
}

function basicTermAndLotsAction(expediente: UniversalExpedienteV13): UniversalAdaptiveAction | null {
  const f = expediente.canonical.fields;
  const contractType = f.contractType.value;
  if (!isKnown(f.lots)) {
    if (!isKnown(expediente.lots.divisionIntoLots)) {
      const question = contractType === "SUPPLY" ? "¿Las familias de artículos pueden adjudicarse por separado sin perjudicar la gestión de pedidos y entregas?" : "¿Las prestaciones pueden ejecutarse por empresas diferentes sin perjudicar la coordinación o el resultado del contrato?";
      return ask(expediente.lots.divisionIntoLots.key, "ask:lot-separability", question, "Responda desde la realidad técnica. El sistema propondrá después la configuración y motivación jurídica de los lotes.", "La divisibilidad depende de hechos técnicos y organizativos que no deben presumirse.");
    }
    if (expediente.lots.divisionIntoLots.value === true) return ask(f.lots.key, "ask:lot-configuration", "¿Qué lotes funcionalmente autónomos se prevén?", "Indique una denominación clara para cada lote. Sus CPV, PBL y VE se completarán como evidencia individualizada.", "Una vez declarada la división, el sistema necesita identificar los lotes concretos.");
  }
  if (!isKnown(f.durationMonths)) return ask(f.durationMonths.key, "ask:initial-duration", contractType === "SUPPLY" ? "¿Cuál será la duración inicial del suministro?" : "¿Cuál será la duración inicial del contrato?", "Indique la duración prevista en meses.", "La duración inicial condiciona la economía y los plazos.");
  if (!isKnown(f.extensionMonths)) return ask(f.extensionMonths.key, "ask:extensions", "¿Se prevén prórrogas y qué duración total tendrán?", "Indique la duración total prevista en meses; si no habrá prórroga, indique 0.", "La prórroga no se presume ni se deduce del plazo inicial.");
  return null;
}

function economicAction(expediente: UniversalExpedienteV13): UniversalAdaptiveAction | null {
  const f = expediente.canonical.fields;
  const e = expediente.economic;
  const contractType = f.contractType.value;
  if (contractType === "SUPPLY") {
    if (!isKnown(e.maximumApprovedBudgetCents)) return ask(e.maximumApprovedBudgetCents.key, "ask:supply-maximum-budget", "¿Cuál es el presupuesto máximo aprobado para la vigencia que se está configurando, sin IVA?", "En suministros por necesidades es un límite máximo propio; no se confundirá con consumo, PBL ni VE.", "El presupuesto máximo aprobado no puede reconstruirse automáticamente a partir de otras magnitudes.");
    if (!isKnown(e.referenceConsumption)) return ask(e.referenceConsumption.key, "ask:supply-reference-consumption", "¿Existe un consumo histórico o estimado de referencia para dimensionar el suministro?", "Puede indicar la referencia disponible o que no existe. No altera por sí solo el presupuesto máximo.", "El consumo de referencia es una magnitud distinta del presupuesto y del VE.");
    if (!isKnown(e.projectedConsumption)) return ask(e.projectedConsumption.key, "ask:supply-projected-consumption", "¿Qué proyección de consumo se utilizará para la vigencia prevista?", "Indique la proyección o que no existe una proyección diferenciada. Se conservará separada del presupuesto máximo.", "La proyección de consumo no debe confundirse con una obligación de gasto.");
  } else if (!isKnown(f.baseTenderBudgetCents)) {
    return ask(f.baseTenderBudgetCents.key, "ask:base-tender-budget", "¿Cuál es el presupuesto base de licitación previsto, sin IVA?", "Si todavía es una estimación, se conservará como tal hasta su contraste y validación.", "El PBL necesita una fuente o decisión expresa.");
  }
  if (!isKnown(e.legalEstimatedValueCents) && !isKnown(f.estimatedValueCents)) return ask(e.legalEstimatedValueCents.key, "ask:estimated-value", "Si ya está calculado, ¿cuál es el valor estimado jurídico del contrato, sin IVA?", "Si todavía no está calculado, debe mantenerse pendiente hasta el motor económico del Bloque 15; no se inferirá por una regla simplificada.", "El procedimiento necesita un VE jurídicamente determinado o una propuesta trazable.");
  if (!isKnown(e.vatPercent)) return ask(e.vatPercent.key, "ask:vat", "¿Qué tipo de IVA resulta aplicable?", "Indique el porcentaje aplicable al contrato o a la configuración económica principal.", "El IVA debe constar de forma expresa para la documentación económica.");
  if (!isKnown(e.budgetApplication)) return ask(e.budgetApplication.key, "ask:budget-application", "¿Qué aplicación presupuestaria financiará el contrato?", "Indique la aplicación o aplicaciones que deban constar en el expediente.", "La aplicación presupuestaria es un dato administrativo-económico de fuente interna.");
  if (!isKnown(e.annualities)) return ask(e.annualities.key, "ask:annualities", "¿Cómo se distribuye el gasto por anualidades?", "Indique año, importe y si el importe incluye IVA. No se recalcularán redondeos declarados por la fuente.", "Las anualidades deben proceder de la planificación presupuestaria del expediente.");
  if (!isKnown(e.fundingSource)) return ask(e.fundingSource.key, "ask:funding-source", "¿Cuál es la fuente de financiación del contrato?", "Indique financiación ordinaria, fondos afectados u otra fuente relevante.", "La fuente de financiación puede condicionar controles y documentación.");
  if (!isKnown(e.priceRevisionRegime)) return ask(e.priceRevisionRegime.key, "ask:price-revision", "¿Qué régimen de revisión de precios se prevé?", "Indique si no procede o describa el régimen que deba justificarse.", "La revisión de precios no debe presumirse.");
  if (!isKnown(e.unitPrices)) return ask(e.unitPrices.key, "ask:unit-prices", "¿Existen precios unitarios que deban formar parte de la configuración económica?", "Aporte concepto, unidad y precio unitario cuando proceda; si no existen, indique una relación vacía.", "Los precios unitarios deben conservarse como datos de fuente cuando estructuran el presupuesto.");
  return null;
}

function legalDecisionAction(expediente: UniversalExpedienteV13): UniversalAdaptiveAction | null {
  const f = expediente.canonical.fields;
  if (!isKnown(f.procedure)) {
    if (isPromotableEvidenceField(f.contractType) && (isPromotableEvidenceField(expediente.economic.legalEstimatedValueCents) || isPromotableEvidenceField(f.estimatedValueCents))) return run("ProcedimientoEngine", "run:procedure", f.procedure.key, "Con tipo contractual y VE promocionables, el procedimiento debe ser propuesto por el motor normativo antes de preguntarlo al usuario.");
    return null;
  }
  if (isPromotableEvidenceField(f.procedure) && isPromotableEvidenceField(expediente.processing.processingType) && isPromotableEvidenceField(expediente.regulation.harmonizedRegulation) && isPromotableEvidenceField(expediente.processing.urgency) && isPromotableEvidenceField(expediente.processing.emergency) && isPromotableEvidenceField(expediente.regulation.europeanFunding) && !isKnown(expediente.regulation.deadlines)) return run("DeadlineDecisionEngine", "run:deadlines", expediente.regulation.deadlines.key, "Las entradas jurídicas necesarias están disponibles; los plazos deben calcularse mediante el motor existente.");
  return null;
}

function missingLegalInputAction(expediente: UniversalExpedienteV13): UniversalAdaptiveAction | null {
  const candidates: Array<[EvidenceField<unknown>, string, string, string]> = [
    [expediente.processing.processingType, "ask:processing-type", "¿La tramitación será ordinaria, urgente o de otro régimen expresamente previsto?", "Este dato condiciona reglas de plazo y no debe inferirse del importe."],
    [expediente.regulation.harmonizedRegulation, "ask:harmonized", "¿Consta determinada la sujeción o no a regulación armonizada?", "Si aún no está determinada debe quedar pendiente; no se asumirá por defecto."],
    [expediente.processing.urgency, "ask:urgency", "¿Se ha acordado o se prevé una declaración formal de urgencia?", "La urgencia requiere una decisión expresa."],
    [expediente.processing.emergency, "ask:emergency", "¿Existe una situación jurídicamente calificada de emergencia?", "La emergencia es excepcional y nunca se presume."],
    [expediente.regulation.europeanFunding, "ask:eu-funding", "¿El contrato está financiado total o parcialmente con fondos europeos?", "Puede abrir obligaciones y controles adicionales."],
    [expediente.regulation.threshold, "ask:threshold", "¿Qué umbral jurídico aplicable consta determinado para este expediente?", "Debe proceder del motor/regla normativa correspondiente o de una validación jurídica; no se inferirá aquí por cuantía."]
  ];
  for (const [field, id, question, help] of candidates) if (!isKnown(field)) return ask(field.key, id, question, help, "El expediente necesita este dato para completar su régimen jurídico.");
  return null;
}

function administrativeAction(expediente: UniversalExpedienteV13): UniversalAdaptiveAction | null {
  const a = expediente.administrative;
  const candidates: Array<[EvidenceField<unknown>, string, string]> = [
    [a.contractingAuthority, "ask:contracting-authority", "¿Cuál es el órgano de contratación?"],
    [a.promotingUnit, "ask:promoting-unit", "¿Qué unidad promueve el expediente?"],
    [a.competentBody, "ask:competent-body", "¿Qué órgano es competente para las actuaciones que deban constar en el expediente?"],
    [a.administrativeFileNumber, "ask:file-number", "¿Cuál es el número o referencia administrativa del expediente?"],
    [a.contractManager, "ask:contract-manager", "¿Quién será responsable del contrato o qué unidad ejercerá esa función?"]
  ];
  for (const [field, id, question] of candidates) if (!isKnown(field)) return ask(field.key, id, question, "Introduzca el dato administrativo que constará en el expediente.", "Es información organizativa interna que el sistema no debe inventar.");
  return null;
}

function technicalAction(expediente: UniversalExpedienteV13): UniversalAdaptiveAction | null {
  const t = expediente.technical;
  if (!isKnown(t.technicalPurpose)) return ask(t.technicalPurpose.key, "ask:technical-purpose", "¿Cuál es la finalidad técnica concreta de la prestación?", "Descríbala de forma suficiente para fundamentar el PPT.", "La finalidad técnica debe proceder de la unidad promotora.");
  if (!isKnown(t.technicalRequirements)) return ask(t.technicalRequirements.key, "ask:technical-requirements", "¿Cuáles son las prescripciones o requisitos técnicos imprescindibles?", "Indique solo requisitos necesarios; podrán ampliarse en el PPT.", "Las prescripciones técnicas dependen del objeto real y no deben generarse sin base factual.");
  if (!isKnown(t.executionLocations)) return ask(t.executionLocations.key, "ask:execution-locations", "¿Dónde se ejecutará o entregará la prestación?", "Indique centros, sedes, municipios o ámbito territorial aplicable.", "El lugar de ejecución condiciona la definición técnica y contractual.");
  if (!isKnown(t.subrogationRequired)) return ask(t.subrogationRequired.key, "ask:subrogation-required", "¿Existe obligación de subrogación de personal?", "Responda según convenio, norma o documentación laboral aplicable; no se presumirá.", "La subrogación solo puede afirmarse con base jurídica o documental.");
  if (t.subrogationRequired.value === true && !isKnown(t.subrogationRegime)) return ask(t.subrogationRegime.key, "ask:subrogation-regime", "¿Qué régimen y documentación de subrogación resultan aplicables?", "Identifique convenio, norma y datos que deban facilitarse a licitadores.", "Si existe subrogación, su alcance debe quedar determinado.");
  return null;
}

function lotsDetailAction(expediente: UniversalExpedienteV13): UniversalAdaptiveAction | null {
  const l = expediente.lots;
  if (!isKnown(l.lots)) return ask(l.lots.key, "ask:universal-lots", "¿Cuál es la configuración económica y CPV de cada lote?", "Para cada lote indique nombre, CPV, PBL y VE; cada dato quedará como evidencia individualizada.", "Los nombres canónicos no sustituyen la configuración jurídica y económica de cada lote.");
  if (!isKnown(l.maxOfferableLots)) return ask(l.maxOfferableLots.key, "ask:max-offerable-lots", "¿Existe límite al número de lotes a los que una licitadora puede presentar oferta?", "Indique el máximo; si no existe limitación, use el total de lotes configurados.", "La limitación de presentación debe constar expresamente y no puede inferirse.");
  if (!isKnown(l.maxAwardableLots)) return ask(l.maxAwardableLots.key, "ask:max-awardable-lots", "¿Existe límite al número de lotes que pueden adjudicarse a una misma licitadora?", "Indique el máximo; si no existe limitación, use el total de lotes configurados.", "La limitación de adjudicación es una decisión independiente de la presentación.");
  return null;
}

function criteriaAction(expediente: UniversalExpedienteV13): UniversalAdaptiveAction | null {
  const c = expediente.criteria;
  if (!isKnown(c.awardCriteria)) return ask(c.awardCriteria.key, "ask:award-criteria", "¿Qué criterios de adjudicación se utilizarán, con su ponderación y forma de evaluación?", "Indique nombre, ponderación y si cada criterio es evaluable mediante fórmula. La suma y compatibilidad jurídica se revisarán después.", "Los criterios deben responder al objeto y no pueden inventarse automáticamente.");
  if (!isKnown(c.judgmentCriteriaExist)) return ask(c.judgmentCriteriaExist.key, "ask:judgment-criteria", "¿Existe algún criterio sujeto a juicio de valor?", "Indíquelo expresamente para comprobar el procedimiento y la estructura de valoración.", "La existencia de juicio de valor condiciona reglas procedimentales.");
  if (!isKnown(c.economicSolvency)) return ask(c.economicSolvency.key, "ask:economic-solvency", "¿Qué solvencia económica y financiera se exigirá?", "Indique los requisitos y umbrales exactos que deban justificarse.", "La solvencia genérica de un motor no sustituye los requisitos concretos del expediente.");
  if (!isKnown(c.technicalSolvency)) return ask(c.technicalSolvency.key, "ask:technical-solvency", "¿Qué solvencia técnica o profesional se exigirá?", "Indique los requisitos y umbrales exactos que deban justificarse.", "La solvencia técnica debe concretarse según la prestación.");
  return null;
}

function guaranteesAction(expediente: UniversalExpedienteV13): UniversalAdaptiveAction | null {
  const g = expediente.guarantees;
  if (!isKnown(g.provisionalGuaranteeRequired)) return ask(g.provisionalGuaranteeRequired.key, "ask:provisional-guarantee", "¿Se exige garantía provisional?", "Indique sí o no. Si no se exige, su porcentaje quedará no aplicable.", "La garantía provisional no debe presumirse.");
  if (g.provisionalGuaranteeRequired.value === true && !isKnown(g.provisionalGuaranteePercent)) return ask(g.provisionalGuaranteePercent.key, "ask:provisional-guarantee-percent", "¿Qué porcentaje de garantía provisional se exige?", "Indique el porcentaje expresamente previsto y su justificación cuando proceda.", "El porcentaje debe constar de forma expresa.");
  if (!isKnown(g.definitiveGuaranteePercent)) return ask(g.definitiveGuaranteePercent.key, "ask:definitive-guarantee-percent", "¿Qué porcentaje de garantía definitiva se exigirá?", "Indique el porcentaje aplicable o 0 cuando jurídicamente no proceda.", "La garantía definitiva debe quedar determinada en el PCAP.");
  if (!isKnown(g.complementaryGuaranteePercent)) return ask(g.complementaryGuaranteePercent.key, "ask:complementary-guarantee-percent", "¿Se prevé garantía complementaria y, en su caso, qué porcentaje?", "Indique 0 si no se prevé.", "La garantía complementaria requiere previsión expresa.");
  return null;
}

function executionAction(expediente: UniversalExpedienteV13): UniversalAdaptiveAction | null {
  const e = expediente.execution;
  const candidates: Array<[EvidenceField<unknown>, string, string]> = [
    [e.specialExecutionConditions, "ask:special-execution", "¿Qué condiciones especiales de ejecución se establecerán?"],
    [e.specificPenalties, "ask:specific-penalties", "¿Qué penalidades específicas se prevén además del régimen legal aplicable?"],
    [e.subcontractingRegime, "ask:subcontracting", "¿Qué régimen de subcontratación debe establecerse?"],
    [e.assignmentRegime, "ask:assignment", "¿Qué régimen de cesión del contrato debe constar?"],
    [e.paymentRegime, "ask:payment", "¿Qué régimen de facturación y pago se aplicará?"],
    [e.receiptAndAcceptanceRegime, "ask:receipt", "¿Cómo se realizará la recepción o conformidad de la prestación?"]
  ];
  for (const [field, id, question] of candidates) if (!isKnown(field)) return ask(field.key, id, question, "Indique la configuración que deba constar en los pliegos; no se completará por analogía sin base.", "Es un elemento de ejecución que debe quedar determinado antes de generar el documento definitivo.");
  return null;
}

export class UniversalAdaptiveQuestionEngine {
  public next(expediente: UniversalExpedienteV13): UniversalAdaptiveAction {
    const fields = allEvidenceFields(expediente);
    for (const field of fields) { const action = conflictAction(field); if (action) return action; }
    const criticalValidationOrder: EvidenceField<unknown>[] = [expediente.canonical.fields.contractType, expediente.canonical.fields.object, expediente.canonical.fields.cpvMain, expediente.economic.legalEstimatedValueCents, expediente.canonical.fields.procedure, expediente.regulation.deadlines];
    for (const field of criticalValidationOrder) { const action = validationAction(field); if (action) return action; }
    return coreIdentificationAction(expediente)
      ?? basicTermAndLotsAction(expediente)
      ?? economicAction(expediente)
      ?? legalDecisionAction(expediente)
      ?? missingLegalInputAction(expediente)
      ?? administrativeAction(expediente)
      ?? technicalAction(expediente)
      ?? lotsDetailAction(expediente)
      ?? criteriaAction(expediente)
      ?? guaranteesAction(expediente)
      ?? executionAction(expediente)
      ?? { kind: "COMPLETE", id: "adaptive:complete", reason: "No queda ninguna pregunta o acción automática imprescindible en el alcance de servicios y suministros del Bloque 14.", priority: "NORMAL" };
  }
}
