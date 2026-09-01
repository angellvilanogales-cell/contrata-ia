import {describe,expect,it} from "vitest";
import {LB102_SERVICE_ASSETS} from "../src/application/intake/lb102/LB102PersistedPilotTemplateStores";
import {SERVICE_V2_STYLE,SERVICE_V2_TEMPLATES} from "../src/application/intake/lb102/StrictServicePilotPackageGeneratorV2";
import {LB102_SOURCE_FIDELITY_POLICY} from "../src/application/operations/lb102/LB102PreHumanMachineSimulation";
import {LB102_PILOT_PACKAGE_CATALOG} from "../src/application/operations/lb102/LB102PilotPackageCatalog";
import {LB102_SERVICE_PHYSICAL_SOURCE_PROFILE,servicePhysicalSourceBlockers} from "../src/application/operations/lb102/ServicePhysicalSourceProfile";

describe("LB102 Service V2 source-structural gate",()=>{
 it("usa exclusivamente activos V2 protegidos y nunca los ODT mínimos V1",()=>{
  expect(LB102_SERVICE_ASSETS).toHaveLength(3);for(const asset of LB102_SERVICE_ASSETS){expect(asset.templateId).toContain("LB102-V2");expect(asset.templateId).not.toContain("LB102-V1");expect(asset.styleFingerprint).toBe(SERVICE_V2_STYLE);expect(asset.provenanceRole).toBe("CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE");expect(asset.sha256).toMatch(/^[a-f0-9]{64}$/);}
 });
 it("mantiene sincronizados store y renderer por identidad SHA",()=>{
  const byKind=new Map(LB102_SERVICE_ASSETS.map(x=>[x.kind,x]));expect(byKind.get("PCAP")?.templateId).toBe(SERVICE_V2_TEMPLATES.PCAP.templateId);expect(byKind.get("PCAP")?.sha256).toBe(SERVICE_V2_TEMPLATES.PCAP.sha256);expect(byKind.get("MEMORIA")?.templateId).toBe(SERVICE_V2_TEMPLATES.MEMORY.templateId);expect(byKind.get("MEMORIA")?.sha256).toBe(SERVICE_V2_TEMPLATES.MEMORY.sha256);expect(byKind.get("PPT")?.templateId).toBe(SERVICE_V2_TEMPLATES.PPT.templateId);expect(byKind.get("PPT")?.sha256).toBe(SERVICE_V2_TEMPLATES.PPT.sha256);
 });
 it("no acredita una plantilla estructural demasiado corta aunque Huelva ya tenga triada fuente completa",()=>{
  expect(LB102_SERVICE_PHYSICAL_SOURCE_PROFILE["service-huelva"].documents.MEMORIA?.sourcePages).toBe(13);expect(LB102_SERVICE_PHYSICAL_SOURCE_PROFILE["service-huelva"].documents.PCAP?.sourcePages).toBe(103);expect(LB102_SERVICE_PHYSICAL_SOURCE_PROFILE["service-huelva"].documents.PPT?.sourcePages).toBe(28);expect(servicePhysicalSourceBlockers("service-huelva")).toEqual([]);
  expect(LB102_SERVICE_PHYSICAL_SOURCE_PROFILE["service-5g"].documents.PCAP?.sourcePages).toBe(111);expect(LB102_SERVICE_PHYSICAL_SOURCE_PROFILE["service-5g"].documents.PPT?.sourcePages).toBe(50);expect(servicePhysicalSourceBlockers("service-5g").length).toBeGreaterThan(0);
  for(const id of ["service-huelva","service-5g"] as const){const policy=LB102_SOURCE_FIDELITY_POLICY[id];expect(policy.level).toBe("DERIVED_STYLE_PENDING_COMPARISON");expect(policy.accredited).toBe(false);expect(LB102_PILOT_PACKAGE_CATALOG.find(x=>x.id===id)?.profile).toBe("SERVICE_SOURCE_STRUCTURAL_PILOT_LB102_V2");}
 });
 it("mantiene V2 como estructura derivada, no modelo oficial",()=>{
  expect(SERVICE_V2_TEMPLATES.PCAP.minBytes).toBeGreaterThanOrEqual(10000);expect(SERVICE_V2_TEMPLATES.MEMORY.minBytes).toBeGreaterThanOrEqual(7000);expect(SERVICE_V2_TEMPLATES.PPT.minBytes).toBeGreaterThanOrEqual(9000);expect(LB102_SERVICE_ASSETS.every(x=>x.provenanceRole==="CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE")).toBe(true);
 });
});
