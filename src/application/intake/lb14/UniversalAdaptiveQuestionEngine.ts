import { EvidenceField, isPromotableEvidenceField } from "../../../domain/expediente/EvidenceField";
import { UniversalExpedienteV13 } from "../../../domain/expediente/UniversalExpedienteV13";

export const BLOCK_14_ADAPTIVE_ENGINE_VERSION = "14.6.0" as const;
export type AdaptiveActionKind = "ASK_USER" | "VALIDATE_HUMAN" | "RESOLVE_SOURCE_CONFLICT" | "RUN_ENGINE" | "COMPLETE";
export type AdaptiveActionPriority = "BLOCKING" | "HIGH" | "NORMAL";
export interface UniversalAdaptiveAction { kind: AdaptiveActionKind; id: string; fieldKey?: string; engine?: "CONTRACT_NATURE_CLASSIFIER" | "CPVEngine" | "ProcedimientoEngine" | "DeadlineDecisionEngine"; question?: string; help?: string; reason: string; priority: AdaptiveActionPriority; }

const isKnown = (field: EvidenceField<unknown> | undefined): boolean => Boolean(field && field.status !== "PENDING" && field.status !== "SOURCE_CONFLICT" && (field.value !== null || field.status === "NOT_APPLICABLE"));
const ask = (fieldKey: string, id: string, question: string, help: string, reason: string): UniversalAdaptiveAction => ({ kind: "ASK_USER", id, fieldKey, question, help, reason, priority: "NORMAL" });
const run = (engine: NonNullable<UniversalAdaptiveAction["engine"]>, id: string, fieldKey: string, reason: string): UniversalAdaptiveAction => ({ kind: "RUN_ENGINE", id, engine, fieldKey, reason, priority: "HIGH" });

function allEvidenceFields(e: UniversalExpedienteV13): EvidenceField<unknown>[] {
  return [...Object.values(e.canonical.fields), ...[e.processing,e.regulation,e.economic,e.administrative,e.technical,e.lots,e.guarantees,e.execution,e.criteria].flatMap(domain => Object.values(domain))] as EvidenceField<unknown>[];
}
function conflictAction(field: EvidenceField<unknown>): UniversalAdaptiveAction | null {
  return field.status === "SOURCE_CONFLICT" ? { kind: "RESOLVE_SOURCE_CONFLICT", id: `resolve:${field.key}`, fieldKey: field.key, reason: `El campo ${field.key} contiene declaraciones de fuente incompatibles y no puede resolverse automáticamente.`, priority: "BLOCKING" } : null;
}
function validationAction(field: EvidenceField<unknown>): UniversalAdaptiveAction | null {
  return field.status !== "SOURCE_CONFLICT" && field.status !== "PENDING" && field.humanValidationRequired && !field.humanValidated
    ? { kind: "VALIDATE_HUMAN", id: `validate:${field.key}`, fieldKey: field.key, reason: `Ya existe una propuesta o declaración para ${field.key}; debe validarse antes de continuar.`, priority: "HIGH" }
    : null;
}

function coreIdentification(e: UniversalExpedienteV13): UniversalAdaptiveAction | null {
  const f=e.canonical.fields;
  if(!isKnown(f.object)) return ask(f.object.key,"ask:contract-need","¿Qué necesita contratar la Administración y para qué?","Descríbalo con lenguaje natural; no necesita conocer el tipo jurídico ni el CPV.","El objeto es un hecho de partida que el sistema no debe inventar.");
  if(!isKnown(f.contractType)) return run("CONTRACT_NATURE_CLASSIFIER","run:contract-nature",f.contractType.key,"Con la necesidad descrita debe intentarse primero una propuesta automática de naturaleza contractual.");
  if(!isKnown(f.cpvMain)) return run("CPVEngine","run:cpv",f.cpvMain.key,"El objeto y el tipo permiten proponer CPV sin pedir al usuario un código técnico.");
  return null;
}
function basicTermAndLots(e: UniversalExpedienteV13): UniversalAdaptiveAction | null {
  const f=e.canonical.fields, type=f.contractType.value;
  if(!isKnown(f.lots)) {
    if(!isKnown(e.lots.divisionIntoLots)) return ask(e.lots.divisionIntoLots.key,"ask:lot-separability",type==="SUPPLY"?"¿Las familias de artículos pueden adjudicarse por separado sin perjudicar pedidos y entregas?":"¿Las prestaciones pueden ejecutarse por empresas diferentes sin perjudicar la coordinación o el resultado?","Responda desde la realidad técnica.","La divisibilidad no debe presumirse.");
    if(e.lots.divisionIntoLots.value===true) return ask(f.lots.key,"ask:lot-configuration","¿Qué lotes funcionalmente autónomos se prevén?","Indique una denominación clara para cada lote.","Debe identificarse cada lote concreto.");
  }
  if(!isKnown(f.durationMonths)) return ask(f.durationMonths.key,"ask:initial-duration",type==="SUPPLY"?"¿Cuál será la duración inicial del suministro?":"¿Cuál será la duración inicial del contrato?","Indique meses.","La duración condiciona economía y ejecución.");
  if(!isKnown(f.extensionMonths)) return ask(f.extensionMonths.key,"ask:extensions","¿Se prevén prórrogas y qué duración total tendrán?","Indique meses; 0 si no existen.","La prórroga no se presume.");
  return null;
}
function coreEconomic(e: UniversalExpedienteV13): UniversalAdaptiveAction | null {
  const f=e.canonical.fields, x=e.economic, type=f.contractType.value;
  if(type==="SUPPLY" && !isKnown(x.maximumApprovedBudgetCents)) return ask(x.maximumApprovedBudgetCents.key,"ask:supply-maximum-budget","¿Cuál es el presupuesto máximo aprobado para la vigencia que se está configurando, sin IVA?","No se confundirá con el consumo estimado ni con el valor estimado jurídico; tampoco se equipara automáticamente al PBL.","El presupuesto máximo es una magnitud propia.");
  if(type!=="SUPPLY" && !isKnown(f.baseTenderBudgetCents)) return ask(f.baseTenderBudgetCents.key,"ask:base-tender-budget","¿Cuál es el presupuesto base de licitación previsto, sin IVA?","Si es estimado se conservará como tal hasta su contraste.","El PBL necesita una fuente o decisión expresa.");
  if(!isKnown(x.legalEstimatedValueCents) && !isKnown(f.estimatedValueCents)) return ask(x.legalEstimatedValueCents.key,"ask:estimated-value","Si ya está calculado, ¿cuál es el valor estimado jurídico del contrato, sin IVA?","Si no está calculado se mantendrá pendiente para el motor económico del Bloque 15.","El procedimiento necesita un VE jurídicamente determinado o una propuesta trazable.");
  return null;
}
function legalDecision(e: UniversalExpedienteV13): UniversalAdaptiveAction | null {
  const f=e.canonical.fields;
  if(!isKnown(f.procedure) && isPromotableEvidenceField(f.contractType) && (isPromotableEvidenceField(e.economic.legalEstimatedValueCents)||isPromotableEvidenceField(f.estimatedValueCents))) return run("ProcedimientoEngine","run:procedure",f.procedure.key,"Con tipo y VE promocionables el procedimiento debe proponerse por el motor normativo.");
  if(isPromotableEvidenceField(f.procedure)&&isPromotableEvidenceField(e.processing.processingType)&&isPromotableEvidenceField(e.regulation.harmonizedRegulation)&&isPromotableEvidenceField(e.processing.urgency)&&isPromotableEvidenceField(e.processing.emergency)&&isPromotableEvidenceField(e.regulation.europeanFunding)&&!isKnown(e.regulation.deadlines)) return run("DeadlineDecisionEngine","run:deadlines",e.regulation.deadlines.key,"Las entradas jurídicas necesarias permiten calcular los plazos mediante el motor existente.");
  return null;
}
function missingLegal(e: UniversalExpedienteV13): UniversalAdaptiveAction | null {
  const candidates:Array<[EvidenceField<unknown>,string,string,string]>=[
    [e.processing.processingType,"ask:processing-type","¿La tramitación será ordinaria, urgente o de otro régimen expresamente previsto?","No se infiere del importe."],
    [e.regulation.harmonizedRegulation,"ask:harmonized","¿Consta determinada la sujeción o no a regulación armonizada?","No se asumirá por defecto."],
    [e.processing.urgency,"ask:urgency","¿Se ha acordado o se prevé una declaración formal de urgencia?","La urgencia requiere decisión expresa."],
    [e.processing.emergency,"ask:emergency","¿Existe una situación jurídicamente calificada de emergencia?","La emergencia es excepcional."],
    [e.regulation.europeanFunding,"ask:eu-funding","¿El contrato está financiado total o parcialmente con fondos europeos?","Puede abrir controles adicionales."],
    [e.regulation.threshold,"ask:threshold","¿Qué umbral jurídico aplicable consta determinado para este expediente?","Debe proceder de regla o validación jurídica; este flujo no lo inventa."]];
  for(const [field,id,q,h] of candidates) if(!isKnown(field)) return ask(field.key,id,q,h,"El régimen jurídico necesita este dato.");
  return null;
}
function supplementaryEconomic(e: UniversalExpedienteV13): UniversalAdaptiveAction | null {
  const x=e.economic, type=e.canonical.fields.contractType.value;
  if(type==="SUPPLY"&&!isKnown(x.referenceConsumption)) return ask(x.referenceConsumption.key,"ask:supply-reference-consumption","¿Existe un consumo histórico o estimado de referencia?","Puede indicar la referencia o que no existe; no altera por sí solo el presupuesto máximo.","El consumo es distinto del presupuesto y del VE.");
  if(type==="SUPPLY"&&!isKnown(x.projectedConsumption)) return ask(x.projectedConsumption.key,"ask:supply-projected-consumption","¿Qué proyección de consumo se utilizará?","Se conservará separada del presupuesto máximo.","La proyección no equivale a obligación de gasto.");
  const candidates:Array<[EvidenceField<unknown>,string,string,string]>=[
    [x.vatPercent,"ask:vat","¿Qué tipo de IVA resulta aplicable?","Indique el porcentaje."],
    [x.budgetApplication,"ask:budget-application","¿Qué aplicación presupuestaria financiará el contrato?","Indique la aplicación que constará en el expediente."],
    [x.annualities,"ask:annualities","¿Cómo se distribuye el gasto por anualidades?","Indique año, importe y si incluye IVA; no se normalizarán redondeos declarados."],
    [x.fundingSource,"ask:funding-source","¿Cuál es la fuente de financiación?","Indique la fuente aplicable."],
    [x.priceRevisionRegime,"ask:price-revision","¿Qué régimen de revisión de precios se prevé?","Indique si no procede o el régimen aplicable."],
    [x.unitPrices,"ask:unit-prices","¿Existen precios unitarios que deban formar parte de la configuración económica?","Aporte concepto, unidad y precio, o una relación vacía si no existen."]];
  for(const [field,id,q,h] of candidates) if(!isKnown(field)) return ask(field.key,id,q,h,"Dato económico necesario para la documentación.");
  return null;
}
function administrative(e:UniversalExpedienteV13):UniversalAdaptiveAction|null { const a=e.administrative; const c:Array<[EvidenceField<unknown>,string,string]>=[[a.contractingAuthority,"ask:contracting-authority","¿Cuál es el órgano de contratación?"],[a.promotingUnit,"ask:promoting-unit","¿Qué unidad promueve el expediente?"],[a.competentBody,"ask:competent-body","¿Qué órgano competente debe constar?"],[a.administrativeFileNumber,"ask:file-number","¿Cuál es el número o referencia del expediente?"],[a.contractManager,"ask:contract-manager","¿Quién será responsable del contrato o qué unidad ejercerá esa función?"]]; for(const [f,id,q] of c) if(!isKnown(f)) return ask(f.key,id,q,"Introduzca el dato administrativo.","El sistema no debe inventar organización interna."); return null; }
function technical(e:UniversalExpedienteV13):UniversalAdaptiveAction|null { const t=e.technical; if(!isKnown(t.technicalPurpose)) return ask(t.technicalPurpose.key,"ask:technical-purpose","¿Cuál es la finalidad técnica concreta de la prestación?","Descríbala para fundamentar el PPT.","La finalidad técnica procede de la unidad promotora."); if(!isKnown(t.technicalRequirements)) return ask(t.technicalRequirements.key,"ask:technical-requirements","¿Cuáles son los requisitos técnicos imprescindibles?","Indique solo requisitos necesarios.","No deben inventarse prescripciones sin base factual."); if(!isKnown(t.executionLocations)) return ask(t.executionLocations.key,"ask:execution-locations","¿Dónde se ejecutará o entregará la prestación?","Indique centros o ámbito territorial.","El lugar de ejecución condiciona el contrato."); if(!isKnown(t.subrogationRequired)) return ask(t.subrogationRequired.key,"ask:subrogation-required","¿Existe obligación de subrogación de personal?","Responda según convenio, norma o documentación aplicable.","La subrogación no se presume."); if(t.subrogationRequired.value===true&&!isKnown(t.subrogationRegime)) return ask(t.subrogationRegime.key,"ask:subrogation-regime","¿Qué régimen y documentación de subrogación resultan aplicables?","Identifique convenio, norma y datos necesarios.","Debe determinarse el alcance de la subrogación."); return null; }
function lotsDetail(e:UniversalExpedienteV13):UniversalAdaptiveAction|null { const l=e.lots; if(!isKnown(l.divisionIntoLots)) return ask(l.divisionIntoLots.key,"ask:lot-separability","¿El contrato se divide jurídicamente en lotes?","Confirme expresamente la división o no división.","La lista de nombres no sustituye esta decisión."); if(!isKnown(l.lots)) return ask(l.lots.key,"ask:universal-lots","¿Cuál es la configuración de cada lote?","Indique nombre, CPV, PBL y VE de cada lote.","Cada lote mantiene evidencia propia."); if(!isKnown(l.maxOfferableLots)) return ask(l.maxOfferableLots.key,"ask:max-offerable-lots","¿Existe límite de lotes a los que una licitadora puede presentar oferta?","Indique el máximo; si no existe, use el total de lotes.","La limitación debe constar expresamente."); if(!isKnown(l.maxAwardableLots)) return ask(l.maxAwardableLots.key,"ask:max-awardable-lots","¿Existe límite de lotes adjudicables a una misma licitadora?","Indique el máximo; si no existe, use el total.","Es una decisión independiente de la presentación."); return null; }
function criteria(e:UniversalExpedienteV13):UniversalAdaptiveAction|null { const c=e.criteria; if(!isKnown(c.awardCriteria)) return ask(c.awardCriteria.key,"ask:award-criteria","¿Qué criterios de adjudicación se utilizarán, con ponderación y forma de evaluación?","Indique nombre, ponderación y si cada uno es evaluable mediante fórmula.","Deben responder al objeto."); if(!isKnown(c.judgmentCriteriaExist)) return ask(c.judgmentCriteriaExist.key,"ask:judgment-criteria","¿Existe algún criterio sujeto a juicio de valor?","Indíquelo expresamente.","Condiciona reglas procedimentales."); if(!isKnown(c.economicSolvency)) return ask(c.economicSolvency.key,"ask:economic-solvency","¿Qué solvencia económica y financiera se exigirá?","Indique requisitos y umbrales exactos.","La solvencia genérica no sustituye el requisito concreto."); if(!isKnown(c.technicalSolvency)) return ask(c.technicalSolvency.key,"ask:technical-solvency","¿Qué solvencia técnica o profesional se exigirá?","Indique requisitos y umbrales exactos.","Debe concretarse según la prestación."); return null; }
function guarantees(e:UniversalExpedienteV13):UniversalAdaptiveAction|null { const g=e.guarantees; if(!isKnown(g.provisionalGuaranteeRequired)) return ask(g.provisionalGuaranteeRequired.key,"ask:provisional-guarantee","¿Se exige garantía provisional?","Indique sí o no.","No debe presumirse."); if(g.provisionalGuaranteeRequired.value===true&&!isKnown(g.provisionalGuaranteePercent)) return ask(g.provisionalGuaranteePercent.key,"ask:provisional-guarantee-percent","¿Qué porcentaje de garantía provisional se exige?","Indique el porcentaje previsto.","Debe constar expresamente."); if(!isKnown(g.definitiveGuaranteePercent)) return ask(g.definitiveGuaranteePercent.key,"ask:definitive-guarantee-percent","¿Qué porcentaje de garantía definitiva se exigirá?","Indique el porcentaje o 0 si no procede.","Debe quedar determinado."); if(!isKnown(g.complementaryGuaranteePercent)) return ask(g.complementaryGuaranteePercent.key,"ask:complementary-guarantee-percent","¿Se prevé garantía complementaria y qué porcentaje?","Indique 0 si no se prevé.","Requiere previsión expresa."); return null; }
function execution(e:UniversalExpedienteV13):UniversalAdaptiveAction|null { const x=e.execution; const c:Array<[EvidenceField<unknown>,string,string]>=[[x.specialExecutionConditions,"ask:special-execution","¿Qué condiciones especiales de ejecución se establecerán?"],[x.specificPenalties,"ask:specific-penalties","¿Qué penalidades específicas se prevén?"],[x.subcontractingRegime,"ask:subcontracting","¿Qué régimen de subcontratación debe establecerse?"],[x.assignmentRegime,"ask:assignment","¿Qué régimen de cesión debe constar?"],[x.paymentRegime,"ask:payment","¿Qué régimen de facturación y pago se aplicará?"],[x.receiptAndAcceptanceRegime,"ask:receipt","¿Cómo se realizará la recepción o conformidad?"]]; for(const [f,id,q] of c) if(!isKnown(f)) return ask(f.key,id,q,"Indique la configuración que deba constar en los pliegos.","Elemento de ejecución necesario para el documento definitivo."); return null; }

export class UniversalAdaptiveQuestionEngine {
  public next(e:UniversalExpedienteV13):UniversalAdaptiveAction {
    for(const field of allEvidenceFields(e)){ const a=conflictAction(field); if(a) return a; }
    for(const field of [e.canonical.fields.contractType,e.canonical.fields.object,e.canonical.fields.cpvMain,e.economic.legalEstimatedValueCents,e.canonical.fields.procedure,e.regulation.deadlines] as EvidenceField<unknown>[]){ const a=validationAction(field); if(a) return a; }
    return coreIdentification(e) ?? basicTermAndLots(e) ?? coreEconomic(e) ?? legalDecision(e) ?? missingLegal(e) ?? supplementaryEconomic(e) ?? administrative(e) ?? technical(e) ?? lotsDetail(e) ?? criteria(e) ?? guarantees(e) ?? execution(e) ?? {kind:"COMPLETE",id:"adaptive:complete",reason:"No queda ninguna pregunta o acción automática imprescindible para servicios y suministros en el Bloque 14.",priority:"NORMAL"};
  }
}
