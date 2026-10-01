import {describe,expect,it} from "vitest";
import {LB102_PANDA_PHYSICAL_SOURCE_PROFILE,comparePandaAgainstPhysicalSource,type PandaVisualFeature} from "../src/application/operations/lb102/PandaPhysicalSourceProfile";
import {LB102_SOURCE_FIDELITY_POLICY} from "../src/application/operations/lb102/LB102PreHumanMachineSimulation";

function visuals(kind:"MEMORIA"|"PCAP"|"PPT"){return Object.fromEntries(LB102_PANDA_PHYSICAL_SOURCE_PROFILE[kind].requiredVisualFeatures.map(x=>[x,true])) as Record<PandaVisualFeature,boolean>;}

describe("LB102 Panda physical source gate",()=>{
 it("registra las tres fuentes reales con profundidad física, identidad visual y neverGeneralModel",()=>{
  expect(LB102_PANDA_PHYSICAL_SOURCE_PROFILE.MEMORIA.sourcePages).toBe(5);expect(LB102_PANDA_PHYSICAL_SOURCE_PROFILE.PCAP.sourcePages).toBe(85);expect(LB102_PANDA_PHYSICAL_SOURCE_PROFILE.PPT.sourcePages).toBe(16);
  expect(LB102_PANDA_PHYSICAL_SOURCE_PROFILE.MEMORIA.requiredVisualFeatures).toContain("VERIFICATION_FOOTER");
  expect(Object.values(LB102_PANDA_PHYSICAL_SOURCE_PROFILE).every(x=>x.neverGeneralModel&&x.sourceRole==="VALIDATED_REAL_CASE_REGRESSION_SOURCE")).toBe(true);
 });
 it("fija la Parte IV del PCAP conforme a la fuente Panda real",()=>{
  expect(LB102_PANDA_PHYSICAL_SOURCE_PROFILE.PCAP.requiredHeadings).toContain("IV. PRERROGATIVAS DE LA ADMINISTRACIÓN, JURISDICCIÓN Y RECURSOS");
  expect(LB102_PANDA_PHYSICAL_SOURCE_PROFILE.PCAP.requiredHeadings).not.toContain("IV. EXTINCIÓN DEL CONTRATO");
 });
 it("bloquea una salida Panda abreviada aunque contenga datos del expediente",()=>{
  const out=comparePandaAgainstPhysicalSource({kind:"PPT",pageCount:2,text:"CONTR 2025 466864 PANDA SECURITY 1 INTRODUCCIÓN 2 ALCANCE DE LOS TRABAJOS",visualFeatures:visuals("PPT")});
  expect(out.passed).toBe(false);expect(out.pageCountMatched).toBe(false);expect(out.blockers.some(x=>x.includes("fuente 16"))).toBe(true);expect(out.missingHeadings).toContain("4.11 Seguridad");
 });
 it("bloquea expresamente el prototipo V2 actual: 7 páginas, placeholders y ausencia de identidad física",()=>{
  const text=[...LB102_PANDA_PHYSICAL_SOURCE_PROFILE.MEMORIA.requiredHeadings,...LB102_PANDA_PHYSICAL_SOURCE_PROFILE.MEMORIA.requiredMarkers,"DATOS VARIABLES DEL EXPEDIENTE · CONTRATA-IA · caseId: {{caseId}} · need: {{need}} · object: {{object}} · cpvMain: {{cpvMain}}"].join("\n");
  const out=comparePandaAgainstPhysicalSource({kind:"MEMORIA",pageCount:7,text,visualFeatures:{SOURCE_HEADING_HIERARCHY:true}});
  expect(out.passed).toBe(false);expect(out.pageCountMatched).toBe(false);expect(out.forbiddenMarkersFound).toContain("{{caseId}}");expect(out.forbiddenMarkersFound).toContain("CONTRATA-IA");expect(out.missingVisualFeatures).toContain("JUNTA_IDENTITY");expect(out.missingVisualFeatures).toContain("VERIFICATION_FOOTER");
 });
 it("solo acredita comparación cuando coinciden profundidad, epígrafes, marcadores e identidad visual",()=>{
  const p=LB102_PANDA_PHYSICAL_SOURCE_PROFILE.MEMORIA;const text=[...p.requiredHeadings,...p.requiredMarkers].join("\n");
  const out=comparePandaAgainstPhysicalSource({kind:"MEMORIA",pageCount:5,text,visualFeatures:visuals("MEMORIA")});
  expect(out.passed).toBe(true);expect(out.blockers).toEqual([]);expect(out.forbiddenMarkersFound).toEqual([]);expect(out.missingVisualFeatures).toEqual([]);
 });
 it("promueve Panda solo como estilo derivado protegido tras persistencia V8, nunca como ODT fuente original",()=>{
  const policy=LB102_SOURCE_FIDELITY_POLICY["supply-panda"];expect(policy.accredited).toBe(true);expect(policy.level).toBe("PROMOTED_SOURCE_DERIVED_STYLE");expect(policy.reason).toContain("persistida");expect(policy.reason).toContain("nunca");
 });
});
