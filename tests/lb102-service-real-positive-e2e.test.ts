import {describe,expect,it} from "vitest";
import {createInMemoryEditableTemplateBinaryStore} from "../src/application/intake/lb23/UniversalOdtProductionRenderer";
import {generateStrictServicePilotPackage} from "../src/application/intake/lb102/StrictServicePilotPackageGenerator";
import {LB102_SERVICE_HUELVA,LB102_SERVICE_5G} from "../src/application/operations/lb102/RealServicePilotSnapshots";
import {SERVICE_STRICT_ASSETS} from "./fixtures/lb102-service-strict-assets";

const assets=Object.values(SERVICE_STRICT_ASSETS);
const store=createInMemoryEditableTemplateBinaryStore(assets.map(x=>({templateId:x.templateId,sourceId:x.sourceId,bytes:Buffer.from(x.base64,"base64")})));

describe("LB102 Service real strict E2E",()=>{
 it.each([
  ["Huelva",LB102_SERVICE_HUELVA,"CONTR 2025 0000468715","174.582,58","296.790,39"],
  ["5G",LB102_SERVICE_5G,"CONTR/2023/957915","5.613.300,00","80530000"],
 ])("genera paquete completo %s con trazabilidad primaria y auditoría cruzada",async(_label,snapshot,caseId,termA,termB)=>{
  const out=await generateStrictServicePilotPackage({snapshot,templateStore:store});
  expect(out.blockers).toEqual([]);expect(out.ready).toBe(true);expect(out.bytes?.length).toBeGreaterThan(0);expect(out.sha256).toMatch(/^[a-f0-9]{64}$/);
  expect(out.manifest?.caseId).toBe(caseId);expect(out.manifest?.profile).toBe("SERVICE_STRICT_PILOT_LB102");expect(out.manifest?.packageCompleteForPilot).toBe(true);expect(out.manifest?.crossDocumentAuditReady).toBe(true);expect(out.manifest?.productionReady).toBe(false);
  expect(out.manifest?.documents.map(x=>x.kind).sort()).toEqual(["MEMORY","PCAP","PPT"]);expect(out.manifest?.documents.every(x=>x.officialModel===false)).toBe(true);
  const joined=JSON.stringify(snapshot.values);expect(joined).toContain(termA);expect(joined).toContain(termB);
 });
 it.each([["Huelva",LB102_SERVICE_HUELVA],["5G",LB102_SERVICE_5G]])("produce SHA estable para %s con iguales fuentes",async(_label,snapshot)=>{const a=await generateStrictServicePilotPackage({snapshot,templateStore:store});const b=await generateStrictServicePilotPackage({snapshot,templateStore:store});expect(a.ready).toBe(true);expect(b.ready).toBe(true);expect(a.sha256).toBe(b.sha256);expect(Buffer.from(a.bytes??[]).equals(Buffer.from(b.bytes??[]))).toBe(true);});
 it("bloquea un expediente Service con conflicto de fuente",async()=>{
  const snapshot={...LB102_SERVICE_HUELVA,sourceConflict:true as true,sourceConfirmed:true as true};
  const out=await generateStrictServicePilotPackage({snapshot:snapshot as never,templateStore:store});expect(out.ready).toBe(false);expect(out.blockers.join(" ")).toMatch(/conflict/i);
 });
 it("bloquea manipulación física de una plantilla",async()=>{
  const corrupted=createInMemoryEditableTemplateBinaryStore(assets.map((x,i)=>({templateId:x.templateId,sourceId:x.sourceId,bytes:i===0?Buffer.concat([Buffer.from(x.base64,"base64"),Buffer.from([0])]):Buffer.from(x.base64,"base64")})));
  const out=await generateStrictServicePilotPackage({snapshot:LB102_SERVICE_5G,templateStore:corrupted});expect(out.ready).toBe(false);expect(out.blockers.join(" ")).toMatch(/SHA-256/);
 });
});
