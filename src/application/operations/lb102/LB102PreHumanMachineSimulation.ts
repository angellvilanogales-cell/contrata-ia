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
 const expected:readonly LB102PilotPackageId[]=["supply-ferreteria","supply-panda","service-huelva","service-sevilla"];const blockers:string[]=[];
 for(const id of expected){const item=packages.find(x=>x.id===id);if(!item){blockers.push(`${id}: falta escenario completo de simulación.`);continue;}if(!item.generationReady)blockers.push(`${id}: el paquete no se genera de extremo a extremo.`);if(!item.sha256||!/^[a-f0-9]{64}$/.test(item.sha256))blockers.push(`${id}: no existe SHA-256 final válido del paquete generado.`);if(!item.sourceFidelityAccredited)blockers.push(`${id}: la similitud física con la fuente/modelo de referencia no está acreditada (${item.sourceFidelityLevel}).`);for(const blocker of item.blockers)blockers.push(`${id}: ${blocker}`);}
 const passed=blockers.length===0;return{block:"LB102-PRE-HUMAN-MACHINE-SIMULATION",passed,packages,blockers,humanSimulationAllowed:passed,productionReady:false};
}

/**
 * Política después de la materialización física LB102 del 02/09/2026.
 * Ferretería conserva identidad exacta de la tríada post-Intervención humanamente validada.
 * Panda, Huelva y Sevilla son reconstrucciones editables derivadas de sus fuentes primarias: se
 * promueven únicamente como estilo/fidelidad de caso de regresión, nunca como ODT fuente original
 * ni como modelo general. La acreditación efectiva sigue condicionada a que el self-test vivo
 * recupere desde persistencia, valide SHA + huella de estilo + marcadores y genere el ZIP completo.
 */
export const LB102_SOURCE_FIDELITY_POLICY:Readonly<Record<LB102PilotPackageId,{level:LB102SourceFidelityLevel;accredited:boolean;reason:string}>>={
 "supply-ferreteria":{level:"EXACT_VALIDATED_SOURCE_STYLE",accredited:true,reason:"Tríada PCAP V8 + Memoria V14 + PPT V8 post-Intervención, humanamente validada y protegida por identidad física exacta."},
 "supply-panda":{level:"PROMOTED_SOURCE_DERIVED_STYLE",accredited:true,reason:"Reconstrucción editable V8 derivada de la fuente primaria Panda 5/85/16, persistida y protegida por SHA, huella de estilo y marcadores físicos; nunca se presenta como ODT fuente original ni como modelo general."},
 "service-huelva":{level:"PROMOTED_SOURCE_DERIVED_STYLE",accredited:true,reason:"Reconstrucción editable V8 derivada de la tríada primaria Huelva 13/103/28, persistida y protegida por SHA, huella de estilo y marcadores físicos; nunca modelo general."},
 "service-sevilla":{level:"PROMOTED_SOURCE_DERIVED_STYLE",accredited:true,reason:"Reconstrucción editable V8 derivada de la tríada primaria Sevilla 13/113/53, persistida y protegida por SHA, huella de estilo y marcadores físicos; conserva las variantes de identificador como evidencia de fuente y nunca se eleva a modelo general."},
};
