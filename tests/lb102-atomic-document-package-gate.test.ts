import {describe,expect,it} from "vitest";
import {createHash} from "node:crypto";
import {assertAtomicDocumentPackage} from "../src/application/intake/lb102/AtomicDocumentPackageGate";
import {ferreteriaInterventionConsistencyAudit} from "../src/application/operations/lb102/FerreteriaPilotPackageGenerator";

const bytes=(s:string)=>Buffer.from(s,"utf8");
const sha=(b:Uint8Array)=>createHash("sha256").update(b).digest("hex");

describe("LB102 atomic document package gate",()=>{
 it("acepta una única tríada ligada al mismo snapshot/generación",()=>{
  const docs=[{kind:"PCAP" as const,fileName:"pcap.odt",bytes:bytes("p")},{kind:"MEMORIA" as const,fileName:"memoria.odt",bytes:bytes("m")},{kind:"PPT" as const,fileName:"ppt.odt",bytes:bytes("t")}];
  const a=assertAtomicDocumentPackage({caseId:"X",packageVersion:"V1",canonicalSnapshot:{b:2,a:1},documents:docs});
  const b=assertAtomicDocumentPackage({caseId:"X",packageVersion:"V1",canonicalSnapshot:{a:1,b:2},documents:docs});
  expect(a.generationReady).toBe(true);expect(a.documentSet).toEqual(["PCAP","MEMORIA","PPT"]);expect(a.snapshotHash).toBe(b.snapshotHash);expect(a.generationId).toBe(b.generationId);
 });
 it("bloquea entrega parcial, SHA divergente, contradicción o SOURCE_CONFLICT",()=>{
  const p=bytes("p");
  expect(()=>assertAtomicDocumentPackage({caseId:"X",packageVersion:"V1",canonicalSnapshot:{},documents:[{kind:"PCAP",fileName:"p.odt",bytes:p,sha256:sha(p)}]})).toThrow(/exactamente un MEMORIA/);
  expect(()=>assertAtomicDocumentPackage({caseId:"X",packageVersion:"V1",canonicalSnapshot:{},documents:[{kind:"PCAP",fileName:"p",bytes:p,sha256:"0".repeat(64)},{kind:"MEMORIA",fileName:"m",bytes:bytes("m")},{kind:"PPT",fileName:"t",bytes:bytes("t")}]})).toThrow(/SHA declarado/);
  expect(()=>assertAtomicDocumentPackage({caseId:"X",packageVersion:"V1",canonicalSnapshot:{},documents:[{kind:"PCAP",fileName:"p",bytes:p},{kind:"MEMORIA",fileName:"m",bytes:bytes("m")},{kind:"PPT",fileName:"t",bytes:bytes("t")}],crossDocumentBlockers:["plazo 3/5 días"]})).toThrow(/3\/5 días/);
  expect(()=>assertAtomicDocumentPackage({caseId:"X",packageVersion:"V1",canonicalSnapshot:{},documents:[{kind:"PCAP",fileName:"p",bytes:p},{kind:"MEMORIA",fileName:"m",bytes:bytes("m")},{kind:"PPT",fileName:"t",bytes:bytes("t")}],unresolvedConflicts:["identificador contradictorio"]})).toThrow(/SOURCE_CONFLICT/);
 });
});

describe("Ferretería · observaciones de Intervención",()=>{
 it("detecta las discrepancias reales que motivaron la revisión",()=>{
  const pcap="sin informe; tres licitadores; 3 días hábiles; garantía 3 años";
  const memoria="se podrán incorporar otros artículos no contemplados en el listado";
  const ppt="material defectuoso 5 días hábiles; adjudicación del acuerdo marco; plazo de garantía de tres (3) años para cada uno de los suministros realizados";
  const out=ferreteriaInterventionConsistencyAudit(pcap,memoria,ppt).join(" | ");
  expect(out).toMatch(/informe del letrado/);expect(out).toMatch(/artículos no contemplados/);expect(out).toMatch(/cuatro o más licitadores/);expect(out).toMatch(/5 días hábiles/);expect(out).toMatch(/acuerdo marco/);expect(out).toMatch(/garantía genérica/);expect(out).toMatch(/fungibles/);
 });
 it("acepta la coherencia declarada en la respuesta a Intervención",()=>{
  const pcap="Informe del letrado AJ-SAE 2026/16. Cuando concurran cuatro o más licitadores. Baja superior al 25% respecto al presupuesto base de licitación. Material defectuoso: 3 días hábiles. Los productos de carácter fungible quedan exceptuados.";
  const memoria="Catálogo cerrado de artículos.";
  const ppt="Material defectuoso: 3 días hábiles. Precio establecido en la adjudicación del contrato. Garantía de bienes duraderos y excepción de productos de carácter fungible.";
  expect(ferreteriaInterventionConsistencyAudit(pcap,memoria,ppt)).toEqual([]);
 });
});
