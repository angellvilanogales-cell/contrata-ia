export interface LB101PilotSecurityEvidence{
  namedIdentityCount:number;
  roleSeparationVerified:boolean;
  appendOnlyAuditVerified:boolean;
  documentVersioningVerified:boolean;
  backupVerified:boolean;
  restoreDrillVerified:boolean;
  httpsTerminationConfigured:boolean;
  persistenceAuthenticated:boolean;
  secretsOutsideRepository:boolean;
}
export interface LB101PilotSecurityStatus{
  block:"LB101";objective:"SECURE_MULTIUSER_PILOT_OPERATION";engineeringClosed:boolean;pilotSecurityReady:boolean;blockers:readonly string[];ensAlignedControls:boolean;ensComplianceClaimed:false;productionReady:false;humanValidationRequired:true;
}
/** Gate conservador: readiness de piloto no equivale a conformidad/certificación ENS. */
export function evaluateLB101PilotSecurityReadiness(e:LB101PilotSecurityEvidence):LB101PilotSecurityStatus{
  const blockers:string[]=[];
  if(e.namedIdentityCount<2)blockers.push("El piloto exige al menos dos identidades nominativas independientes.");
  if(!e.roleSeparationVerified)blockers.push("No está verificada la separación de roles y permisos.");
  if(!e.appendOnlyAuditVerified)blockers.push("No está verificada la integridad de la auditoría append-only.");
  if(!e.documentVersioningVerified)blockers.push("No está verificado el versionado inmutable de paquetes documentales.");
  if(!e.backupVerified)blockers.push("No se ha verificado un backup del estado del piloto.");
  if(!e.restoreDrillVerified)blockers.push("No se ha superado un ejercicio de restauración.");
  if(!e.httpsTerminationConfigured)blockers.push("El piloto debe operar detrás de HTTPS/TLS.");
  if(!e.persistenceAuthenticated)blockers.push("La persistencia remota debe requerir autenticación.");
  if(!e.secretsOutsideRepository)blockers.push("Las credenciales deben permanecer fuera del repositorio.");
  const ready=blockers.length===0;
  return{block:"LB101",objective:"SECURE_MULTIUSER_PILOT_OPERATION",engineeringClosed:ready,pilotSecurityReady:ready,blockers,ensAlignedControls:true,ensComplianceClaimed:false,productionReady:false,humanValidationRequired:true};
}
