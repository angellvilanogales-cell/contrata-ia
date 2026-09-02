import {describe,expect,it} from "vitest";
import {LB102_FERRETERIA_SOURCE_ASSETS,LB102_PANDA_ASSETS,LB102_SERVICE_SOURCEBACKED_ASSETS} from "../src/application/intake/lb102/LB102PersistedPilotTemplateStores";
import {LB102_PROTECTED_SOURCE_GROUPS,parseLB102ProtectedSourceGroup,parseLB102ProtectedSourceKind,persistLB102ProtectedSource} from "../src/application/intake/lb102/LB102ProtectedSourceIngress";

describe("LB102 - ingreso binario protegido universal",()=>{
 it("mantiene una allowlist cerrada para Ferretería, Panda, Huelva y Sevilla",()=>{
  expect(Object.keys(LB102_PROTECTED_SOURCE_GROUPS).sort()).toEqual(["ferreteria","panda","service-huelva","service-sevilla"].sort());
  expect(LB102_PROTECTED_SOURCE_GROUPS.ferreteria.assets).toEqual(LB102_FERRETERIA_SOURCE_ASSETS);
  expect(LB102_PROTECTED_SOURCE_GROUPS.ferreteria.assets).toHaveLength(3);
  expect(LB102_PROTECTED_SOURCE_GROUPS.panda.assets).toEqual(LB102_PANDA_ASSETS);
  expect(LB102_PROTECTED_SOURCE_GROUPS["service-huelva"].assets).toHaveLength(3);
  expect(LB102_PROTECTED_SOURCE_GROUPS["service-sevilla"].assets).toHaveLength(3);
  expect(LB102_PROTECTED_SOURCE_GROUPS["service-huelva"].assets.every(x=>x.templateId.startsWith("case:CONTR-2025-468715:"))).toBe(true);
  expect(LB102_PROTECTED_SOURCE_GROUPS["service-sevilla"].assets.every(x=>x.templateId.startsWith("case:CONTR-2026-38892:"))).toBe(true);
  expect(LB102_SERVICE_SOURCEBACKED_ASSETS).toHaveLength(6);
 });
 it("conserva procedencia y prohíbe convertir regresiones reales en modelos generales",()=>{
  for(const group of Object.values(LB102_PROTECTED_SOURCE_GROUPS)){
   expect(group.neverGeneralModel).toBe(true);expect(group.assets.length).toBeGreaterThan(0);
   for(const asset of group.assets){expect(asset.provenanceRole).toMatch(/VALIDATED_REAL_CASE_SOURCE|HUMAN_VALIDATED_CORRECTED_REAL_CASE_SOURCE|CONTRATA_IA_DERIVED_SOURCE_STRUCTURAL_TEMPLATE/);}
  }
  expect(LB102_PROTECTED_SOURCE_GROUPS.ferreteria.family).toBe("SUPPLY");expect(LB102_PROTECTED_SOURCE_GROUPS.panda.family).toBe("SUPPLY");expect(LB102_PROTECTED_SOURCE_GROUPS["service-huelva"].family).toBe("SERVICE");expect(LB102_PROTECTED_SOURCE_GROUPS["service-sevilla"].family).toBe("SERVICE");
 });
 it("rechaza grupos y tipos documentales fuera de allowlist",()=>{expect(parseLB102ProtectedSourceGroup("service-huelva")).toBe("service-huelva");expect(parseLB102ProtectedSourceGroup("otro")).toBeNull();expect(parseLB102ProtectedSourceKind("pcap")).toBe("PCAP");expect(parseLB102ProtectedSourceKind("memoria")).toBe("MEMORIA");expect(parseLB102ProtectedSourceKind("ppt")).toBe("PPT");expect(parseLB102ProtectedSourceKind("docx")).toBeNull();});
 it("falla por SHA antes de intentar persistir un binario no autorizado",async()=>{const previousUrl=process.env.CONTRATA_IA_PERSISTENCE_URL;const previousToken=process.env.CONTRATA_IA_PERSISTENCE_TOKEN;delete process.env.CONTRATA_IA_PERSISTENCE_URL;delete process.env.CONTRATA_IA_PERSISTENCE_TOKEN;try{await expect(persistLB102ProtectedSource("panda","PCAP",Buffer.alloc(512,7))).rejects.toThrow(/SHA-256 no coincide/);await expect(persistLB102ProtectedSource("service-huelva","PPT",Buffer.alloc(512,9))).rejects.toThrow(/SHA-256 no coincide/);}finally{if(previousUrl===undefined)delete process.env.CONTRATA_IA_PERSISTENCE_URL;else process.env.CONTRATA_IA_PERSISTENCE_URL=previousUrl;if(previousToken===undefined)delete process.env.CONTRATA_IA_PERSISTENCE_TOKEN;else process.env.CONTRATA_IA_PERSISTENCE_TOKEN=previousToken;}});
});
