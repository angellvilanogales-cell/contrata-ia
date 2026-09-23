export type LB102PilotContractFamily="SUPPLY"|"SERVICE";
export type LB102PilotPackageId="supply-ferreteria"|"supply-panda"|"service-huelva"|"service-sevilla";
export interface LB102RequiredPilotCase{readonly id:LB102PilotPackageId;readonly caseId:string;readonly family:LB102PilotContractFamily;}

/**
 * Los cuatro expedientes que acreditan la UAT LB102. Esta lista es deliberadamente
 * cerrada: revisiones de otros expedientes no pueden satisfacer el gate de aceptación.
 */
export const LB102_REQUIRED_PILOT_CASES:readonly LB102RequiredPilotCase[]=[
 {id:"supply-ferreteria",caseId:"CONTR/2026/240267",family:"SUPPLY"},
 {id:"supply-panda",caseId:"CONTR 2025 466864",family:"SUPPLY"},
 {id:"service-huelva",caseId:"CONTR 2025 0000468715",family:"SERVICE"},
 {id:"service-sevilla",caseId:"CONTR 2026 38892",family:"SERVICE"},
] as const;

export function requiredPilotCaseById(id:string){return LB102_REQUIRED_PILOT_CASES.find(x=>x.id===id)??null;}
export function requiredPilotCaseByCaseId(caseId:string){const normalized=caseId.trim();return LB102_REQUIRED_PILOT_CASES.find(x=>x.caseId===normalized)??null;}
