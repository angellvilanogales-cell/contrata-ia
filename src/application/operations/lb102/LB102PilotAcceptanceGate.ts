export interface LB102PilotEvidence{
  lb99PilotScopeClosed:boolean;
  sourceGovernanceReady:boolean;
  freeGenerationPathVerified:boolean;
  lb101SecurityReady:boolean;
  supplyRealCaseRuns:number;
  serviceRealCaseRuns:number;
  negativeRegressionConflictPassed:boolean;
  negativeRegressionMissingValidationPassed:boolean;
  negativeRegressionTemplateIntegrityPassed:boolean;
  userAcceptanceSessions:number;
  distinctPilotUsers:number;
  criticalDefectsOpen:number;
  /** Número de expedientes distintos con revisión humana registrada. */
  generatedPackagesHumanReviewed:number;
  acceptanceDecisionRecorded:boolean;
}
export interface LB102PilotAcceptanceStatus{
  block:"LB102";objective:"OPERATIONAL_PILOT_AND_FUNCTIONAL_ACCEPTANCE";technicalPrePilotReady:boolean;appViableForPilot:boolean;blockers:readonly string[];productionReady:false;institutionalReadinessRequired:true;humanAcceptanceRequired:true;
}
/**
 * La máquina puede acreditar pre-piloto técnico, pero no fabricar usuarios ni una
 * aceptación funcional. appViableForPilot solo se activa con evidencia humana registrada.
 */
export function evaluateLB102PilotAcceptance(e:LB102PilotEvidence):LB102PilotAcceptanceStatus{
  const technical:string[]=[];
  if(!e.lb99PilotScopeClosed)technical.push("LB99 debe estar cerrado para el alcance del piloto.");
  if(!e.sourceGovernanceReady)technical.push("LB100 debe acreditar gobierno de fuentes y cuarentena del conocimiento no verificado.");
  if(!e.freeGenerationPathVerified)technical.push("La ruta base de generación debe funcionar sin API de IA de pago obligatoria.");
  if(!e.lb101SecurityReady)technical.push("LB101 debe acreditar operación multiusuario segura para piloto.");
  if(e.supplyRealCaseRuns<2)technical.push("Deben ejecutarse al menos dos expedientes Supply reales/controlados.");
  if(e.serviceRealCaseRuns<2)technical.push("Deben ejecutarse al menos dos expedientes Service reales/controlados.");
  if(!e.negativeRegressionConflictPassed)technical.push("Falta regresión negativa de conflicto de fuentes.");
  if(!e.negativeRegressionMissingValidationPassed)technical.push("Falta regresión negativa de validación humana ausente.");
  if(!e.negativeRegressionTemplateIntegrityPassed)technical.push("Falta regresión negativa de integridad de plantilla.");
  const technicalPrePilotReady=technical.length===0;
  const blockers=[...technical];
  if(e.userAcceptanceSessions<2)blockers.push("Se requieren al menos dos sesiones de aceptación funcional con usuarios.");
  if(e.distinctPilotUsers<2)blockers.push("La aceptación debe involucrar al menos dos usuarios distintos.");
  if(e.generatedPackagesHumanReviewed<4)blockers.push("Deben revisarse humanamente los cuatro expedientes distintos del piloto (2 Supply + 2 Service).");
  if(e.criticalDefectsOpen>0)blockers.push("No puede haber defectos críticos abiertos al declarar viabilidad del piloto.");
  if(!e.acceptanceDecisionRecorded)blockers.push("Falta decisión de aceptación funcional registrada.");
  return{block:"LB102",objective:"OPERATIONAL_PILOT_AND_FUNCTIONAL_ACCEPTANCE",technicalPrePilotReady,appViableForPilot:blockers.length===0,blockers,productionReady:false,institutionalReadinessRequired:true,humanAcceptanceRequired:true};
}
