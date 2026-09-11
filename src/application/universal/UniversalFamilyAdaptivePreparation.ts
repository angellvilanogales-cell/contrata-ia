import { UniversalFamilyPreparationGate, UniversalFamilyPreparationInput } from "./UniversalFamilyPreparationGate";
import { UniversalTargetContractType } from "../../domain/capabilities/UniversalContractCoverage";
import { UniversalWorksPreparationInput } from "../../engines/UniversalWorksPreparationEngine";
import { UniversalConcessionPreparationInput } from "../../engines/UniversalConcessionPreparationEngine";
import { MixedComponentInput, UniversalMixedContractInput } from "../../engines/UniversalMixedContractEngine";

export interface UniversalFamilyAdaptiveQuestion {
  id: string;
  field: string;
  question: string;
  help: string;
  blocking: true;
}

export interface UniversalFamilyAdaptiveState {
  contractType: UniversalTargetContractType;
  answers: Readonly<Record<string, unknown>>;
}

export interface UniversalFamilyAdaptiveAssessment {
  complete: boolean;
  preparation?: UniversalFamilyPreparationInput;
  next?: UniversalFamilyAdaptiveQuestion;
  blockers: readonly string[];
  humanValidationRequired: true;
}

const question = (id: string, field: string, text: string, help: string): UniversalFamilyAdaptiveQuestion => ({ id, field, question: text, help, blocking: true });
const has = (answers: Readonly<Record<string, unknown>>, key: string): boolean => Object.prototype.hasOwnProperty.call(answers, key);

function worksQuestion(a: Readonly<Record<string, unknown>>): UniversalFamilyAdaptiveQuestion | undefined {
  if (!has(a, "projectPrepared")) return question("works:project-prepared", "projectPrepared", "¿Existe proyecto de obras preparado para esta actuación?", "No se presume por existir una memoria o presupuesto.");
  if (!has(a, "projectApproved")) return question("works:project-approved", "projectApproved", "¿El proyecto de obras está formalmente aprobado?", "La aprobación debe constar en el expediente.");
  if (!has(a, "projectReplanted")) return question("works:project-replanted", "projectReplanted", "¿Se ha efectuado y aprobado el replanteo del proyecto?", "La comprobación previa de realidad geométrica y disponibilidad no se sustituye por una estimación.");
  if (!has(a, "baseTenderBudgetExVatCents")) return question("works:pbl", "baseTenderBudgetExVatCents", "¿Cuál es el presupuesto base de licitación de la obra, sin IVA?", "Introduzca céntimos enteros y mantenga la cifra del proyecto/expediente.");
  if (!has(a, "landAvailabilityConfirmed")) return question("works:land", "landAvailabilityConfirmed", "¿Consta acreditada la disponibilidad de los terrenos o espacios necesarios?", "Si existe una excepción legal debe documentarse fuera de esta respuesta booleana.");
  if (!has(a, "supervisionReportAvailable")) return question("works:supervision", "supervisionReportAvailable", "¿Consta informe de supervisión del proyecto cuando resulta exigible?", "El motor comprobará la exigencia en función del importe y de la afección a estabilidad, seguridad o estanqueidad.");
  if (!has(a, "affectsStabilitySafetyOrWatertightness")) return question("works:safety", "affectsStabilitySafetyOrWatertightness", "¿La obra afecta a estabilidad, seguridad o estanqueidad?", "Este hecho condiciona la necesidad de supervisión incluso por debajo del umbral ordinario.");
  return undefined;
}

function concessionQuestion(a: Readonly<Record<string, unknown>>): UniversalFamilyAdaptiveQuestion | undefined {
  if (!has(a, "subtype")) return question("concession:subtype", "subtype", "¿Se trata de concesión de obras o de concesión de servicios?", "La aplicación no inferirá el subtipo solo por el CPV.");
  if (!has(a, "operationalRiskTransferred")) return question("concession:risk", "operationalRiskTransferred", "¿Se transfiere efectivamente al concesionario riesgo operacional?", "Debe existir exposición real a las incertidumbres del mercado, no una garantía de recuperación íntegra.");
  if (!has(a, "demandRiskTransferred")) return question("concession:demand-risk", "demandRiskTransferred", "¿Existe transferencia de riesgo de demanda?", "Indique el hecho real; puede coexistir con riesgo de suministro.");
  if (!has(a, "supplyRiskTransferred")) return question("concession:supply-risk", "supplyRiskTransferred", "¿Existe transferencia de riesgo de suministro?", "Al menos una modalidad de riesgo debe quedar acreditada junto con el riesgo operacional.");
  if (!has(a, "viabilityStudyApproved")) return question("concession:viability", "viabilityStudyApproved", "¿Está aprobado el estudio de viabilidad exigible?", "No se sustituye por una mera memoria económica.");
  if (!has(a, "durationYears")) return question("concession:duration", "durationYears", "¿Cuál es la duración total prevista de la concesión, en años?", "Las duraciones superiores a cinco años abren una justificación adicional de recuperación de inversiones.");
  if (Number(a.durationYears) > 5 && !has(a, "durationRecoveryJustified")) return question("concession:recovery", "durationRecoveryJustified", "¿Está justificada la duración superior a cinco años por el período razonable de recuperación de las inversiones y rendimiento del capital?", "Debe existir soporte económico en el estudio correspondiente.");
  if (a.subtype === "WORKS_CONCESSION") {
    if (!has(a, "includesWorks")) return question("concession:includes-works", "includesWorks", "¿El objeto comprende efectivamente obras?", "Una concesión de obras requiere obra en su objeto.");
    if (!has(a, "worksAnteprojectPrepared") && !has(a, "worksProjectPreparedApprovedReplanted")) return question("concession:works-preparation", "worksProjectPreparedApprovedReplanted", "¿Consta proyecto de las obras preparado, aprobado y replanteado, o el grado de documentación equivalente exigible?", "Si procede anteproyecto, deberá quedar acreditado en la evidencia documental.");
  }
  if (a.subtype === "SERVICE_CONCESSION") {
    if (!has(a, "serviceReservedToAdministration")) return question("concession:reserved", "serviceReservedToAdministration", "¿La prestación está legalmente reservada a la Administración?", "Una respuesta afirmativa puede impedir esta forma concesional.");
    if (!has(a, "publicServiceLegalRegimeEstablished")) return question("concession:legal-regime", "publicServiceLegalRegimeEstablished", "Si se trata de servicio público, ¿consta establecido previamente su régimen jurídico?", "Debe identificarse la norma o acto correspondiente en la evidencia.");
  }
  return undefined;
}

function mixedQuestion(a: Readonly<Record<string, unknown>>): UniversalFamilyAdaptiveQuestion | undefined {
  if (!has(a, "components")) return question("mixed:components", "components", "¿Qué prestaciones contractuales distintas integran el contrato mixto?", "Aporte al menos dos componentes con tipo, vinculación funcional, complementariedad y VE separado cuando exista.");
  const components = Array.isArray(a.components) ? a.components as MixedComponentInput[] : [];
  if (components.length < 2) return question("mixed:components-min", "components", "Debe identificar al menos dos prestaciones de clases contractuales distintas. ¿Cuáles son?", "No basta dividir una misma prestación en capítulos.");
  if (components.some(c => c.functionallyLinked !== true || c.complementaryRelationship !== true)) return question("mixed:linkage", "components", "¿Puede confirmar y documentar que las prestaciones están directamente vinculadas y son complementarias para una unidad funcional?", "Si no lo están, no debe forzarse la figura del contrato mixto.");
  const types = new Set(components.map(c => c.contractType));
  const supplyService = types.size === 2 && types.has("SUPPLY") && types.has("SERVICE");
  const bothValues = components.every(c => c.estimatedValueExVatCents !== undefined);
  if (!supplyService || !bothValues) {
    if (!has(a, "declaredPrincipalContractType")) return question("mixed:principal", "declaredPrincipalContractType", "¿Cuál es la prestación principal jurídicamente determinada del contrato mixto?", "Aporte la decisión motivada; no se inventará a partir de porcentajes ausentes.");
  }
  if (!has(a, "includesConcessionComponent")) return question("mixed:concession", "includesConcessionComponent", "¿Alguno de los componentes es una concesión?", "La respuesta activa guardas adicionales del artículo 18 LCSP.");
  if (a.includesConcessionComponent === true && !has(a, "objectivelySeparable")) return question("mixed:separable", "objectivelySeparable", "¿Las prestaciones que incluyen componente concesional son objetivamente separables?", "Este hecho condiciona el régimen jurídico aplicable.");
  return undefined;
}

function buildInput(state: UniversalFamilyAdaptiveState): UniversalFamilyPreparationInput | undefined {
  const a = state.answers;
  if (state.contractType === "WORKS") return { contractType: "WORKS", works: a as unknown as UniversalWorksPreparationInput };
  if (state.contractType === "CONCESSION") return { contractType: "CONCESSION", concession: a as unknown as UniversalConcessionPreparationInput };
  if (state.contractType === "MIXED") return { contractType: "MIXED", mixed: a as unknown as UniversalMixedContractInput };
  return { contractType: state.contractType };
}

export class UniversalFamilyAdaptivePreparation {
  public start(contractType: UniversalTargetContractType): UniversalFamilyAdaptiveState {
    return { contractType, answers: {} };
  }

  public applyAnswer(state: UniversalFamilyAdaptiveState, field: string, value: unknown): UniversalFamilyAdaptiveState {
    if (!field.trim()) throw new Error("field es obligatorio.");
    return { ...state, answers: { ...state.answers, [field]: value } };
  }

  public assess(state: UniversalFamilyAdaptiveState): UniversalFamilyAdaptiveAssessment {
    if (state.contractType === "SUPPLY" || state.contractType === "SERVICE") {
      return { complete: true, preparation: { contractType: state.contractType }, blockers: [], humanValidationRequired: true };
    }
    const next = state.contractType === "WORKS"
      ? worksQuestion(state.answers)
      : state.contractType === "CONCESSION"
        ? concessionQuestion(state.answers)
        : mixedQuestion(state.answers);
    if (next) return { complete: false, next, blockers: [], humanValidationRequired: true };

    const preparation = buildInput(state)!;
    const evaluated = new UniversalFamilyPreparationGate().evaluate(preparation);
    return {
      complete: evaluated.ready,
      preparation,
      blockers: evaluated.blockers,
      humanValidationRequired: true,
    };
  }
}
