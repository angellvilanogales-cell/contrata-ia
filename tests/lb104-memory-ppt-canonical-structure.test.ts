import { describe, expect, it } from "vitest";
import { MemoryDefinition } from "../src/domain/documentModel/definitions/MemoryDefinition";
import { ServicePptDefinition } from "../src/domain/documentModel/definitions/ServicePptDefinition";
import { SupplyPptDefinition } from "../src/domain/documentModel/definitions/SupplyPptDefinition";
import {
  CANONICAL_MEMORY_CORE,
  CANONICAL_MEMORY_PPT_STRUCTURE_VERSION,
  CANONICAL_PPT_CORE,
  CANONICAL_STRUCTURE_SOURCE_CORPUS,
  auditCanonicalMemoryPptHeadings,
  canonicalMemoryPptStructure,
  canonicalSupplyOverlaysFromFacts,
} from "../src/domain/documentModel/CanonicalMemoryPptStructure";

describe("LB104 - canon de epígrafes de Memoria y PPT",()=>{
  it("fija una única nomenclatura y numeración estable para los epígrafes comunes",()=>{
    expect(CANONICAL_MEMORY_PPT_STRUCTURE_VERSION).toBe("LB104-MEMORY-PPT-CANON-V1");
    expect(CANONICAL_MEMORY_CORE).toHaveLength(19);
    expect(CANONICAL_PPT_CORE).toHaveLength(12);
    expect(new Set(CANONICAL_MEMORY_CORE.map(x=>x.id)).size).toBe(CANONICAL_MEMORY_CORE.length);
    expect(new Set(CANONICAL_PPT_CORE.map(x=>x.id)).size).toBe(CANONICAL_PPT_CORE.length);
    expect(CANONICAL_MEMORY_CORE.map(x=>x.number)).toEqual(Array.from({length:19},(_,i)=>String(i+1)));
    expect(CANONICAL_PPT_CORE.map(x=>x.number)).toEqual(Array.from({length:12},(_,i)=>String(i+1)));
  });

  it("inserta epígrafes especiales como subepígrafes sin renumerar el núcleo",()=>{
    const service=canonicalMemoryPptStructure({document:"MEMORY",family:"SERVICE"});
    expect(service.find(x=>x.id==="INSUFFICIENCY_OF_MEANS")).toMatchObject({number:"2.1",title:"Insuficiencia de medios propios",scope:"OVERLAY"});
    expect(service.filter(x=>x.scope==="CORE").map(x=>x.number)).toEqual(CANONICAL_MEMORY_CORE.map(x=>x.number));
    const digital=canonicalMemoryPptStructure({document:"PPT",family:"SUPPLY",overlays:["DIGITAL_EQUIPMENT","EUROPEAN_FUNDS"]});
    expect(digital.find(x=>x.id==="DIGITAL_COMPATIBILITY")).toMatchObject({number:"4.1"});
    expect(digital.filter(x=>x.scope==="CORE").map(x=>x.number)).toEqual(CANONICAL_PPT_CORE.map(x=>x.number));
  });

  it("diferencia correctamente las especialidades de cada familia",()=>{
    expect(canonicalMemoryPptStructure({document:"PPT",family:"WORKS"}).some(x=>x.id==="WORKS_PROJECT_SCOPE")).toBe(true);
    expect(canonicalMemoryPptStructure({document:"PPT",family:"CONCESSION"}).some(x=>x.id==="CONCESSION_CONTINUITY")).toBe(true);
    expect(canonicalMemoryPptStructure({document:"PPT",family:"MIXED"}).some(x=>x.id==="MIXED_TECHNICAL_COMPONENTS")).toBe(true);
    expect(canonicalMemoryPptStructure({document:"PPT",family:"SUPPLY"}).every(x=>x.scope==="CORE")).toBe(true);
  });

  it("elige los overlays Supply solo desde subfamilia y financiación declaradas",()=>{
    expect(canonicalSupplyOverlaysFromFacts({variant:"MEDICAL_FRAMEWORK",fundingSource:"AUTOFINANCED"})).toEqual(["SUCCESSIVE_NEEDS_CATALOGUE","HEALTH_FRAMEWORK"]);
    expect(canonicalSupplyOverlaysFromFacts({variant:"DIGITAL_EQUIPMENT",fundingSource:"EU_FUNDS"})).toEqual(["DIGITAL_EQUIPMENT","EUROPEAN_FUNDS"]);
    expect(canonicalSupplyOverlaysFromFacts({variant:"ORDINARY_GLOBAL_PRICE",fundingSource:"AUTOFINANCED"})).toEqual([]);
  });

  it("audita literalmente orden, número y título",()=>{
    const plan=canonicalMemoryPptStructure({document:"MEMORY",family:"SERVICE"});
    const ok=auditCanonicalMemoryPptHeadings({document:"MEMORY",family:"SERVICE",headings:plan.map(x=>({number:x.number,title:x.title}))});
    expect(ok.ready).toBe(true);
    const altered=plan.map(x=>({number:x.number,title:x.title}));const objectIndex=plan.findIndex(x=>x.id==="OBJECT_NATURE_CPV");altered[objectIndex]={...altered[objectIndex]!,title:"Objeto del contrato"};
    const fail=auditCanonicalMemoryPptHeadings({document:"MEMORY",family:"SERVICE",headings:altered});
    expect(fail.ready).toBe(false);expect(fail.blockers.join(" ")).toContain("Objeto, naturaleza y codificación CPV");
  });

  it("alinea las definiciones lógicas existentes y conserva trazabilidad multicaso",()=>{
    expect(MemoryDefinition.sections.map(x=>x.title)).toEqual(CANONICAL_MEMORY_CORE.map(x=>x.title));
    expect(SupplyPptDefinition.sections.slice(0,4).map(x=>x.title)).toEqual(CANONICAL_PPT_CORE.slice(0,4).map(x=>x.title));
    expect(SupplyPptDefinition.sections.some(x=>x.id==="ESTIMATED_CONSUMPTION")).toBe(true);
    expect(ServicePptDefinition.sections.some(x=>x.id==="SERVICE_PERSONNEL_SUBROGATION")).toBe(true);
    expect(CANONICAL_STRUCTURE_SOURCE_CORPUS.filter(x=>x.memory&&x.ppt).length).toBeGreaterThanOrEqual(7);
  });
});
