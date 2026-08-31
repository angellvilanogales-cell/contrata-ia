import {describe,expect,it} from "vitest";
import {LB102_PANDA_PHYSICAL_SOURCE_PROFILE,comparePandaAgainstPhysicalSource} from "../src/application/operations/lb102/PandaPhysicalSourceProfile";
import {LB102_SOURCE_FIDELITY_POLICY} from "../src/application/operations/lb102/LB102PreHumanMachineSimulation";

describe("LB102 Panda physical source gate",()=>{
 it("registra las tres fuentes reales con profundidad física y neverGeneralModel",()=>{
  expect(LB102_PANDA_PHYSICAL_SOURCE_PROFILE.MEMORIA.sourcePages).toBe(5);
  expect(LB102_PANDA_PHYSICAL_SOURCE_PROFILE.PCAP.sourcePages).toBe(85);
  expect(LB102_PANDA_PHYSICAL_SOURCE_PROFILE.PPT.sourcePages).toBe(16);
  expect(Object.values(LB102_PANDA_PHYSICAL_SOURCE_PROFILE).every(x=>x.neverGeneralModel&&x.sourceRole==="VALIDATED_REAL_CASE_REGRESSION_SOURCE")).toBe(true);
 });
 it("bloquea una salida Panda abreviada aunque contenga datos del expediente",()=>{
  const out=comparePandaAgainstPhysicalSource({kind:"PPT",pageCount:2,text:"CONTR 2025 466864 PANDA SECURITY 1 INTRODUCCIÓN 2 ALCANCE DE LOS TRABAJOS"});
  expect(out.passed).toBe(false);
  expect(out.pageCountMatched).toBe(false);
  expect(out.blockers.some(x=>x.includes("fuente 16"))).toBe(true);
  expect(out.missingHeadings).toContain("4.11 Seguridad");
 });
 it("solo acredita comparación cuando coinciden profundidad, epígrafes y marcadores",()=>{
  const p=LB102_PANDA_PHYSICAL_SOURCE_PROFILE.MEMORIA;
  const text=[...p.requiredHeadings,...p.requiredMarkers].join("\n");
  const out=comparePandaAgainstPhysicalSource({kind:"MEMORIA",pageCount:5,text});
  expect(out.passed).toBe(true);expect(out.blockers).toEqual([]);
 });
 it("mantiene Panda fuera de UAT mientras la plantilla desplegada no supere el perfil físico",()=>{
  expect(LB102_SOURCE_FIDELITY_POLICY["supply-panda"].accredited).toBe(false);
  expect(LB102_SOURCE_FIDELITY_POLICY["supply-panda"].level).toBe("DERIVED_STYLE_PENDING_COMPARISON");
 });
});
