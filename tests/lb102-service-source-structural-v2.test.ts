import {describe,expect,it} from "vitest";
import {LB102_SERVICE_ASSETS,LB102_SERVICE_SOURCEBACKED_ASSETS} from "../src/application/intake/lb102/LB102PersistedPilotTemplateStores";
import {SERVICE_V2_STYLE,SERVICE_V2_TEMPLATES} from "../src/application/intake/lb102/StrictServicePilotPackageGeneratorV2";
import {LB102_SOURCE_FIDELITY_POLICY} from "../src/application/operations/lb102/LB102PreHumanMachineSimulation";
import {LB102_PILOT_PACKAGE_CATALOG} from "../src/application/operations/lb102/LB102PilotPackageCatalog";
import {LB102_SERVICE_PHYSICAL_SOURCE_PROFILE,servicePhysicalSourceBlockers} from "../src/application/operations/lb102/ServicePhysicalSourceProfile";

describe("LB102 Service V2 source-structural gate",()=>{
 it("conserva V2 como estructura protegida de desarrollo, separada de los activos source-backed UAT",()=>{
  expect(LB102_SERVICE_ASSETS).toHaveLength(3);for(const asset of LB102_SERVICE_ASSETS){expect(asset.templateId).toContain("LB102-V2");expect(asset.styleFingerprint).toBe(SERVICE_V2_STYLE);expect(asset.provenanceRole).toBe("CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE");expect(asset.sha256).toMatch(/^[a-f0-9]{64}$/);}
  expect(LB102_SERVICE_SOURCEBACKED_ASSETS).toHaveLength(6);expect(LB102_SERVICE_SOURCEBACKED_ASSETS.every(x=>x.provenanceRole==="CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE")).toBe(true);
 });
 it("mantiene sincronizados store V2 y renderer V2 por identidad SHA",()=>{
  const byKind=new Map(LB102_SERVICE_ASSETS.map(x=>[x.kind,x]));expect(byKind.get("PCAP")?.templateId).toBe(SERVICE_V2_TEMPLATES.PCAP.templateId);expect(byKind.get("PCAP")?.sha256).toBe(SERVICE_V2_TEMPLATES.PCAP.sha256);expect(byKind.get("MEMORIA")?.templateId).toBe(SERVICE_V2_TEMPLATES.MEMORY.templateId);expect(byKind.get("MEMORIA")?.sha256).toBe(SERVICE_V2_TEMPLATES.MEMORY.sha256);expect(byKind.get("PPT")?.templateId).toBe(SERVICE_V2_TEMPLATES.PPT.templateId);expect(byKind.get("PPT")?.sha256).toBe(SERVICE_V2_TEMPLATES.PPT.sha256);
 });
 it("los dos pilotos UAT Service apuntan a reconstrucciones source-backed, sin acreditar aún fidelidad final",()=>{
  expect(LB102_SERVICE_PHYSICAL_SOURCE_PROFILE["service-huelva"].documents.MEMORIA?.sourcePages).toBe(13);expect(LB102_SERVICE_PHYSICAL_SOURCE_PROFILE["service-huelva"].documents.PCAP?.sourcePages).toBe(103);expect(LB102_SERVICE_PHYSICAL_SOURCE_PROFILE["service-huelva"].documents.PPT?.sourcePages).toBe(28);expect(servicePhysicalSourceBlockers("service-huelva")).toEqual([]);
  expect(LB102_SERVICE_PHYSICAL_SOURCE_PROFILE["service-sevilla"].documents.MEMORIA?.sourcePages).toBe(13);expect(LB102_SERVICE_PHYSICAL_SOURCE_PROFILE["service-sevilla"].documents.PCAP?.sourcePages).toBe(113);expect(LB102_SERVICE_PHYSICAL_SOURCE_PROFILE["service-sevilla"].documents.PPT?.sourcePages).toBe(53);expect(servicePhysicalSourceBlockers("service-sevilla")).toEqual([]);
  expect(LB102_PILOT_PACKAGE_CATALOG.find(x=>x.id==="service-huelva")?.profile).toBe("SERVICE_HUELVA_SOURCE_BACKED_REGRESSION_LB102_V1");
  expect(LB102_PILOT_PACKAGE_CATALOG.find(x=>x.id==="service-sevilla")?.profile).toBe("SERVICE_SEVILLA_SOURCE_BACKED_REGRESSION_LB102_V1");
  for(const id of ["service-huelva","service-sevilla"] as const){const policy=LB102_SOURCE_FIDELITY_POLICY[id];expect(policy.level).toBe("DERIVED_STYLE_PENDING_COMPARISON");expect(policy.accredited).toBe(false);}
 });
 it("mantiene 5G como fuente de regresión parcial, fuera de los cuatro pilotos UAT",()=>{
  expect(servicePhysicalSourceBlockers("service-5g").length).toBeGreaterThan(0);expect(LB102_PILOT_PACKAGE_CATALOG.some(x=>x.id===("service-5g" as never))).toBe(false);
 });
 it("V2 sigue siendo estructura derivada y no modelo oficial ni activo UAT físico",()=>{
  expect(SERVICE_V2_TEMPLATES.PCAP.minBytes).toBeGreaterThanOrEqual(10000);expect(SERVICE_V2_TEMPLATES.MEMORY.minBytes).toBeGreaterThanOrEqual(7000);expect(SERVICE_V2_TEMPLATES.PPT.minBytes).toBeGreaterThanOrEqual(9000);expect(LB102_SERVICE_ASSETS.every(x=>x.provenanceRole==="CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE")).toBe(true);
 });
});
