import {describe,expect,it} from "vitest";
import {LB102_SERVICE_PHYSICAL_SOURCE_PROFILE,servicePhysicalSourceCoverage,servicePhysicalSourceBlockers} from "../src/application/operations/lb102/ServicePhysicalSourceProfile";
import {LB102_SOURCE_FIDELITY_POLICY} from "../src/application/operations/lb102/LB102PreHumanMachineSimulation";

describe("LB102 Service physical source profiles",()=>{
 it("acredita la triada primaria Huelva sin convertirla en modelo general",()=>{
  const p=LB102_SERVICE_PHYSICAL_SOURCE_PROFILE["service-huelva"];
  expect(p.documents.MEMORIA?.sourcePages).toBe(13);expect(p.documents.PCAP?.sourcePages).toBe(103);expect(p.documents.PPT?.sourcePages).toBe(28);
  expect(servicePhysicalSourceCoverage("service-huelva")).toMatchObject({available:3,total:3,complete:true});
  expect(Object.values(p.documents).every(d=>d?.neverGeneralModel&&d.sourceRole==="VALIDATED_REAL_CASE_REGRESSION_SOURCE")).toBe(true);
 });

 it("acredita como segunda triada primaria completa mantenimiento Sevilla 13/113/53",()=>{
  const p=LB102_SERVICE_PHYSICAL_SOURCE_PROFILE["service-sevilla"];
  expect(p.documents.MEMORIA?.sourcePages).toBe(13);expect(p.documents.PCAP?.sourcePages).toBe(113);expect(p.documents.PPT?.sourcePages).toBe(53);
  expect(servicePhysicalSourceCoverage("service-sevilla")).toMatchObject({available:3,total:3,complete:true});
  expect(p.caseId).toBe("CONTR 2026 38892");
  expect(Object.values(p.documents).every(d=>d?.neverGeneralModel&&d.sourceRole==="VALIDATED_REAL_CASE_REGRESSION_SOURCE")).toBe(true);
 });

 it("conserva 5G como regresión parcial mientras falte la Memoria primaria independiente",()=>{
  const p=LB102_SERVICE_PHYSICAL_SOURCE_PROFILE["service-5g"];
  expect(p.documents.PCAP?.sourcePages).toBe(111);expect(p.documents.PPT?.sourcePages).toBe(50);expect(p.documents.MEMORIA).toBeUndefined();
  expect(servicePhysicalSourceCoverage("service-5g")).toMatchObject({available:2,total:3,complete:false});
  expect(servicePhysicalSourceBlockers("service-5g").some(x=>x.includes("MEMORIA"))).toBe(true);
 });

 it("promueve Huelva y Sevilla tras persistencia protegida V8 sin convertirlas en modelos generales",()=>{
  for(const id of ["service-huelva","service-sevilla"] as const){const policy=LB102_SOURCE_FIDELITY_POLICY[id];expect(policy.accredited).toBe(true);expect(policy.level).toBe("PROMOTED_SOURCE_DERIVED_STYLE");expect(policy.reason).toContain("persistida");expect(policy.reason).toContain("nunca");}
  expect(LB102_SOURCE_FIDELITY_POLICY["service-huelva"].reason).toContain("13/103/28");
  expect(LB102_SOURCE_FIDELITY_POLICY["service-sevilla"].reason).toContain("13/113/53");
 });
});
