import type {LB102PilotPackageId} from "./LB102PilotPackageCatalog";

export type LB102SourceFidelityLevel=
 |"EXACT_VALIDATED_SOURCE_STYLE"
 |"PROMOTED_SOURCE_DERIVED_STYLE"
 |"DERIVED_STYLE_PENDING_COMPARISON";

export interface LB102MachineSimulationPackageEvidence{
 readonly id:LB102PilotPackageId;
 readonly generationReady:boolean;
 readonly sha256:string|null;
 readonly sourceFidelityLevel:LB102SourceFidelityLevel;
 readonly sourceFidelityAccredited:boolean;
 readonly blockers:readonly string[];
}

export interface LB102PreHumanMachineSimulationStatus{
 readonly block:"LB102-PRE-HUMAN-MACHINE-SIMULATION";
 readonly passed:boolean;
 readonly packages:readonly LB102MachineSimulationPackageEvidence[];
 readonly blockers:readonly string[];
 readonly humanSimulationAllowed:boolean;
 readonly productionReady:false;
}

/** Gate previo a cualquier UAT humana: la generación y la fidelidad física deben estar acreditadas. */
export function evaluateLB102PreHumanMachineSimulation(packages:readonly LB102MachineSimulationPackageEvidence[]):LB102PreHumanMachineSimulationStatus{
 const expected:readonly LB102PilotPackageId[]=["supply-ferreteria","supply-panda","service-huelva","service-5g"];const blockers:string[]=[];
 for(const id of expected){const item=packages.find(x=>x.id===id);if(!item){blockers.push(`${id}: falta escenario completo de simulación.`);continue;}if(!item.generationReady)blockers.push(`${id}: el paquete no se genera de extremo a extremo.`);if(!item.sha256||!/^[a-f0-9]{64}$/.test(item.sha256))blockers.push(`${id}: no existe SHA-256 final válido del paquete generado.`);if(!item.sourceFidelityAccredited)blockers.push(`${id}: la similitud física con la fuente/modelo de referencia no está acreditada (${item.sourceFidelityLevel}).`);for(const blocker of item.blockers)blockers.push(`${id}: ${blocker}`);}
 const passed=blockers.length===0;return{block:"LB102-PRE-HUMAN-MACHINE-SIMULATION",passed,packages,blockers,humanSimulationAllowed:passed,productionReady:false};
}

/**
 * La acreditación solo se activa cuando el paquete completo cuenta con evidencia física suficiente.
 * Tener una plantilla estructural o una fuente parcial no equivale a promoción física completa.
 */
export const LB102_SOURCE_FIDELITY_POLICY:Readonly<Record<LB102PilotPackageId,{level:LB102SourceFidelityLevel;accredited:boolean;reason:string}>>={
 "supply-ferreteria":{level:"EXACT_VALIDATED_SOURCE_STYLE",accredited:true,reason:"La identidad física esperada de PCAP y Memoria/PPT está protegida; la generación sigue bloqueada si faltan los binarios exactos persistidos."},
 "supply-panda":{level:"DERIVED_STYLE_PENDING_COMPARISON",accredited:false,reason:"Panda V4 reproduce la profundidad 5/85/16, pero no se acredita hasta persistir y recuperar los tres binarios íntegros y superar el E2E físico."},
 "service-huelva":{level:"DERIVED_STYLE_PENDING_COMPARISON",accredited:false,reason:"Memoria 13 páginas y PPT 28 páginas están acreditados como fuentes de regresión; falta PCAP primario específico y Service V2 todavía no reproduce su profundidad documental."},
 "service-5g":{level:"DERIVED_STYLE_PENDING_COMPARISON",accredited:false,reason:"PCAP 111 páginas y PPT 50 páginas están acreditados como fuentes de regresión; falta Memoria primaria independiente y Service V2 todavía no reproduce su profundidad documental."},
};
