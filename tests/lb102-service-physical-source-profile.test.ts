import {describe,expect,it} from "vitest";
import {LB102_SERVICE_PHYSICAL_SOURCE_PROFILE,servicePhysicalSourceCoverage,servicePhysicalSourceBlockers} from "../src/application/operations/lb102/ServicePhysicalSourceProfile";
import {LB102_SOURCE_FIDELITY_POLICY} from "../src/application/operations/lb102/LB102PreHumanMachineSimulation";

describe("LB102 Service physical source profiles",()=>{
 it("acredita la triada primaria Huelva sin convertirla en modelo general",()=>{
  const p=LB102_SERVICE_PHYSICAL_SOURCE_PROFILE["service-huelva"];
  expect(p.documents.MEMORIA?.sourcePages).toBe(13);
  expect(p.documents.PCAP?.sourcePages).toBe(103);
  expect(p.documents.PPT?.sourcePages).toBe(28);
  expect(servicePhysicalSourceCoverage("service-huelva")).toMatchObject({available:3,total:3,complete:true});
  expect(Object.values(p.documents).every(d=>d?.neverGeneralModel&&d.sourceRole==="VALIDATED_REAL_CASE_REGRESSION_SOURCE")).toBe(true);
 });

 it("mantiene 5G incompleto mientras falte la Memoria primaria independiente",()=>{
  const p=LB102_SERVICE_PHYSICAL_SOURCE_PROFILE["service-5g"];
  expect(p.documents.PCAP?.sourcePages).toBe(111);
  expect(p.documents.PPT?.sourcePages).toBe(50);
  expect(p.documents.MEMORIA).toBeUndefined();
  expect(servicePhysicalSourceCoverage("service-5g")).toMatchObject({available:2,total:3,complete:false});
  expect(servicePhysicalSourceBlockers("service-5g").some(x=>x.includes("MEMORIA"))).toBe(true);
 });

 it("no acredita Service por el mero hecho de haber localizado las fuentes",()=>{
  expect(LB102_SOURCE_FIDELITY_POLICY["service-huelva"].accredited).toBe(false);
  expect(LB102_SOURCE_FIDELITY_POLICY["service-5g"].accredited).toBe(false);
  expect(LB102_SOURCE_FIDELITY_POLICY["service-huelva"].reason).toContain("PCAP 103 páginas");
  expect(LB102_SOURCE_FIDELITY_POLICY["service-5g"].reason).toContain("Memoria primaria completa");
 });
});
