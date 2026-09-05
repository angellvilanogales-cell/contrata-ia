import {describe,expect,it} from "vitest";
import {assertLb102ExactMaterialization,assertLb102NoCriticalPlaceholders,assertLb102SemanticConcepts,normalizeLb102Text} from "../src/application/intake/lb102/LB102UniversalDocumentQualityGate";
import {assertServiceOfficialPcapPreUat} from "../src/application/intake/lb102/ServiceSourceBackedPilotPackageGenerator";

describe("LB102 - puertas transversales aprendidas en Panda",()=>{
 it("normaliza acentos y puntuación para comparar datos objetivos sin falsos negativos",()=>{
  expect(normalizeLb102Text("CONTR/2026/240267 · Protección")).toBe("contr 2026 240267 proteccion");
  expect(()=>assertLb102ExactMaterialization("Expediente CONTR/2026/240267. CPV 48760000-3.","doc",["CONTR 2026 240267","48760000-3"])).not.toThrow();
 });
 it("valida texto libre por conceptos y no por copia literal del snapshot",()=>{
  const rendered="Renovación de licencias Panda Security para la protección de equipos y software corporativo.";
  expect(()=>assertLb102SemanticConcepts(rendered,"objeto",[["panda"],["licencia","licencias","software"],["seguridad","proteccion"]])).not.toThrow();
  expect(()=>assertLb102SemanticConcepts(rendered,"objeto",[["limpieza"]])).toThrow(/concepto material/);
 });
 it("bloquea huecos críticos y decisiones humanas incrustadas",()=>{
  expect(()=>assertLb102NoCriticalPlaceholders("Objeto del contrato: ________","pcap")).toThrow(/objeto vacío/);
  expect(()=>assertLb102NoCriticalPlaceholders("Tramitación del gasto: Ordinaria / Anticipada","pcap")).toThrow(/tramitación sin resolver/);
  expect(()=>assertLb102NoCriticalPlaceholders("Documento limpio y materializado.","pcap")).not.toThrow();
 });
 it("impide que Huelva y Sevilla lleguen a UAT con PCAP derivado de expediente real",()=>{
  expect(()=>assertServiceOfficialPcapPreUat("HUELVA")).toThrow(/officialModel=false/);
  expect(()=>assertServiceOfficialPcapPreUat("SEVILLA")).toThrow(/modelo oficial Junta/);
 });
});
