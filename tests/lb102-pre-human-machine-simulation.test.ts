import {describe,expect,it} from "vitest";
import {evaluateLB102PreHumanMachineSimulation,LB102_SOURCE_FIDELITY_POLICY} from "../src/application/operations/lb102/LB102PreHumanMachineSimulation";

const hash="a".repeat(64);
describe("LB102 pre-human machine simulation",()=>{
 it("bloquea UAT aunque los cuatro paquetes generen si la fidelidad física no está acreditada",()=>{
  const status=evaluateLB102PreHumanMachineSimulation([
   {id:"supply-ferreteria",generationReady:true,sha256:hash,sourceFidelityLevel:LB102_SOURCE_FIDELITY_POLICY["supply-ferreteria"].level,sourceFidelityAccredited:true,blockers:[]},
   {id:"supply-panda",generationReady:true,sha256:hash,sourceFidelityLevel:LB102_SOURCE_FIDELITY_POLICY["supply-panda"].level,sourceFidelityAccredited:false,blockers:[]},
   {id:"service-huelva",generationReady:true,sha256:hash,sourceFidelityLevel:LB102_SOURCE_FIDELITY_POLICY["service-huelva"].level,sourceFidelityAccredited:false,blockers:[]},
   {id:"service-5g",generationReady:true,sha256:hash,sourceFidelityLevel:LB102_SOURCE_FIDELITY_POLICY["service-5g"].level,sourceFidelityAccredited:false,blockers:[]},
  ]);
  expect(status.passed).toBe(false);expect(status.humanSimulationAllowed).toBe(false);
  expect(status.blockers.some(x=>x.includes("supply-panda")&&x.includes("similitud física"))).toBe(true);
  expect(status.blockers.some(x=>x.includes("service-huelva")&&x.includes("similitud física"))).toBe(true);
 });
 it("solo permite UAT cuando generación y fidelidad física están acreditadas en los cuatro escenarios",()=>{
  const ids=["supply-ferreteria","supply-panda","service-huelva","service-5g"] as const;
  const status=evaluateLB102PreHumanMachineSimulation(ids.map(id=>({id,generationReady:true,sha256:hash,sourceFidelityLevel:"PROMOTED_SOURCE_DERIVED_STYLE" as const,sourceFidelityAccredited:true,blockers:[]})));
  expect(status.passed).toBe(true);expect(status.humanSimulationAllowed).toBe(true);expect(status.blockers).toEqual([]);
 });
});
