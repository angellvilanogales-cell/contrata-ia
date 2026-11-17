import fs from "node:fs";
import {describe,expect,it} from "vitest";
import {LB102_SOURCE_PACKAGE_PROFILES} from "../src/application/intake/lb102/LB102SourcePackageIngress";

describe("LB102 source package ingress profiles",()=>{
 it("mantiene separados el paquete V8 y la tríada Ferretería post-Intervención",()=>{
  const core=LB102_SOURCE_PACKAGE_PROFILES.PANDA_HUELVA_SEVILLA_V8;
  const ferr=LB102_SOURCE_PACKAGE_PROFILES.FERRETERIA_POST_INTERVENCION_V2;
  expect(core).toHaveLength(9);expect(ferr).toHaveLength(3);
  expect(ferr.map(x=>x.kind).sort()).toEqual(["MEMORIA","PCAP","PPT"]);
  expect(ferr.map(x=>x.fileName).sort()).toEqual(["Memoria_Ferreteria_V14_post_Intervencion.odt","PCAP_Ferreteria_V8_post_Intervencion.odt","PPT_Ferreteria_V8_post_Intervencion.odt"].sort());
  expect(core.some(x=>x.group==="ferreteria")).toBe(false);expect(ferr.every(x=>x.group==="ferreteria")).toBe(true);
 });
 it("retira por completo las antiguas fuentes Ferretería V12/V6 del transporte LB102",()=>{const source=fs.readFileSync("src/application/intake/lb102/LB102SourcePackageIngress.ts","utf8");expect(source).not.toContain("V12_letrado");expect(source).not.toContain("PPT Feretería SSCC SAE V6");expect(source).toContain("atomicValidationBeforePersistence:true");});
 it("habilita la carga browser de Ferretería y exige readiness de los cuatro grupos",()=>{const ui=fs.readFileSync("src/interfaces/lb102/LB102SourceIngressUi.ts","utf8");expect(ui).toContain("Validar y materializar Ferretería");expect(ui).toContain("1.596,06 €");expect(ui).toContain("25.325,86 €");expect(ui).not.toContain("Esperando tríada post-Intervención");const server=fs.readFileSync("src/interfaces/lb102/LB102SourceIngressServer.ts","utf8");expect(server).toContain("groupStatus.every(item=>item.ready)");expect(server).not.toContain('filter(item=>item.group!=="ferreteria")');});
});
