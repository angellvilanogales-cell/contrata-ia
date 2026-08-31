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

/**
 * Gate previo a cualquier UAT humana. No basta con que el ZIP sea generable:
 * la salida física debe estar acreditada frente a una fuente/modelo promovido.
 * Un ODT derivado sin comparación física suficiente permanece bloqueado aunque
 * sus datos jurídicos sean correctos.
 */
export function evaluateLB102PreHumanMachineSimulation(
 packages:readonly LB102MachineSimulationPackageEvidence[],
):LB102PreHumanMachineSimulationStatus{
 const expected:readonly LB102PilotPackageId[]=["supply-ferreteria","supply-panda","service-huelva","service-5g"];
 const blockers:string[]=[];
 for(const id of expected){
  const item=packages.find(x=>x.id===id);
  if(!item){blockers.push(`${id}: falta escenario completo de simulación.`);continue;}
  if(!item.generationReady)blockers.push(`${id}: el paquete no se genera de extremo a extremo.`);
  if(!item.sha256||!/^[a-f0-9]{64}$/.test(item.sha256))blockers.push(`${id}: no existe SHA-256 final válido del paquete generado.`);
  if(!item.sourceFidelityAccredited)blockers.push(`${id}: la similitud física con la fuente/modelo de referencia no está acreditada (${item.sourceFidelityLevel}).`);
  for(const blocker of item.blockers)blockers.push(`${id}: ${blocker}`);
 }
 const passed=blockers.length===0;
 return{block:"LB102-PRE-HUMAN-MACHINE-SIMULATION",passed,packages,blockers,humanSimulationAllowed:passed,productionReady:false};
}

/**
 * Estado de acreditación física actualmente exigible por expediente.
 * Ferretería usa Memoria/PPT fuente exactas + PCAP oficial protegido.
 * Panda y Service continúan bloqueados hasta promover una plantilla cuya
 * estructura/estilo haya sido comparada contra las fuentes administrativas.
 */
export const LB102_SOURCE_FIDELITY_POLICY:Readonly<Record<LB102PilotPackageId,{level:LB102SourceFidelityLevel;accredited:boolean;reason:string}>>={
 "supply-ferreteria":{level:"EXACT_VALIDATED_SOURCE_STYLE",accredited:true,reason:"PCAP oficial y Memoria/PPT del expediente real protegidos por SHA y huella de estilo."},
 "supply-panda":{level:"DERIVED_STYLE_PENDING_COMPARISON",accredited:false,reason:"La plantilla ASO actual es derivada y todavía no tiene comparación física/promoción frente al expediente Panda de referencia."},
 "service-huelva":{level:"DERIVED_STYLE_PENDING_COMPARISON",accredited:false,reason:"La plantilla Service estricta actual es derivada y todavía no reproduce/acredita físicamente el modelo real de servicios de Junta/SAE."},
 "service-5g":{level:"DERIVED_STYLE_PENDING_COMPARISON",accredited:false,reason:"La plantilla Service estricta actual es derivada y todavía no reproduce/acredita físicamente el modelo real de servicios de Junta/SAE."},
};
