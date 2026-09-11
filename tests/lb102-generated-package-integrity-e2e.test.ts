import {createHash} from "node:crypto";
import {describe,expect,it} from "vitest";
import {createInMemoryEditableTemplateBinaryStore} from "../src/application/intake/lb23/UniversalOdtProductionRenderer";
import {readOdtZip} from "../src/application/intake/lb23/OdtPackageCodec";
import {generateSupplyAsoUserDocumentPackage} from "../src/application/intake/lb102/SupplyAsoUserDocumentPackageGenerator";
import {generateStrictServicePilotPackage} from "../src/application/intake/lb102/StrictServicePilotPackageGenerator";
import {LB102_SUPPLY_PANDA} from "../src/application/operations/lb102/RealSupplyPilotSnapshots";
import {LB102_SERVICE_5G,LB102_SERVICE_HUELVA} from "../src/application/operations/lb102/RealServicePilotSnapshots";
import {PANDA_ASO_PCAP_EXACT} from "./fixtures/lb102-panda-pcap-exact";
import {PANDA_ASO_MEMORY_EXACT} from "./fixtures/lb102-panda-memory-exact";
import {PANDA_ASO_PPT_EXACT} from "./fixtures/lb102-panda-ppt-exact";
import {SERVICE_STRICT_ASSETS} from "./fixtures/lb102-service-strict-assets";

function hash(bytes:Uint8Array){return createHash("sha256").update(bytes).digest("hex");}
function unzipStore(bytes:Uint8Array){const b=Buffer.from(bytes);const files=new Map<string,Buffer>();let p=0;while(p+30<=b.length&&b.readUInt32LE(p)===0x04034b50){const method=b.readUInt16LE(p+8);if(method!==0)throw new Error("El test solo admite ZIP STORE.");const size=b.readUInt32LE(p+18);const nameLen=b.readUInt16LE(p+26);const extraLen=b.readUInt16LE(p+28);const name=b.subarray(p+30,p+30+nameLen).toString("utf8");const start=p+30+nameLen+extraLen;const end=start+size;files.set(name,b.subarray(start,end));p=end;}return files;}
function visibleOdt(bytes:Uint8Array){const content=readOdtZip(bytes).find(x=>x.name==="content.xml");if(!content)throw new Error("ODT sin content.xml");return Buffer.from(content.bytes).toString("utf8").replace(/<[^>]+>/g," ").replace(/&amp;/g,"&").replace(/\s+/g," ").trim();}
function auditPackage(bytes:Uint8Array,caseId:string,expectedKinds:readonly string[]){const files=unzipStore(bytes);expect(files.has("manifest.json")).toBe(true);const manifest=JSON.parse(files.get("manifest.json")!.toString("utf8")) as {caseId:string;documents:{kind:string;fileName:string;sha256:string}[];productionReady:boolean;humanAcceptanceRequired:boolean;crossDocumentAuditReady?:boolean;packageCompleteForPilot?:boolean};expect(manifest.caseId).toBe(caseId);expect(manifest.productionReady).toBe(false);expect(manifest.humanAcceptanceRequired).toBe(true);expect(manifest.crossDocumentAuditReady).toBe(true);expect(manifest.documents.map(x=>x.kind).sort()).toEqual([...expectedKinds].sort());for(const document of manifest.documents){const binary=files.get(document.fileName);expect(binary,document.fileName).toBeTruthy();expect(hash(binary!)).toBe(document.sha256);const text=visibleOdt(binary!);expect(text).toContain(caseId);expect(text).not.toMatch(/\{\{[^}]+\}\}/);expect(text).not.toContain("REQUIERE DECISIÓN HUMANA");expect(text.length).toBeGreaterThan(100);}expect(files.size).toBe(manifest.documents.length+1);return manifest;}

const pandaAssets=[PANDA_ASO_PCAP_EXACT,PANDA_ASO_MEMORY_EXACT,PANDA_ASO_PPT_EXACT];
const pandaStore=createInMemoryEditableTemplateBinaryStore(pandaAssets.map(x=>({templateId:x.templateId,sourceId:x.sourceId,bytes:Buffer.from(x.base64,"base64")})));
const serviceAssets=Object.values(SERVICE_STRICT_ASSETS);
const serviceStore=createInMemoryEditableTemplateBinaryStore(serviceAssets.map(x=>({templateId:x.templateId,sourceId:x.sourceId,bytes:Buffer.from(x.base64,"base64")})));

describe("LB102 integridad física final de paquetes generados",()=>{
 it("Panda genera ZIP autoconsistente con PCAP Memoria PPT y manifest",async()=>{const out=await generateSupplyAsoUserDocumentPackage({record:LB102_SUPPLY_PANDA,templateStore:pandaStore});expect(out.ready).toBe(true);expect(out.bytes).toBeTruthy();expect(hash(out.bytes!)).toBe(out.sha256);auditPackage(out.bytes!,LB102_SUPPLY_PANDA.caseId,["PCAP","MEMORIA","PPT"]);});
 it.each([["Huelva",LB102_SERVICE_HUELVA],["5G",LB102_SERVICE_5G]])("%s genera ZIP autoconsistente con PCAP Memoria PPT y manifest",async(_label,snapshot)=>{const out=await generateStrictServicePilotPackage({snapshot,templateStore:serviceStore});expect(out.ready).toBe(true);expect(out.bytes).toBeTruthy();expect(hash(out.bytes!)).toBe(out.sha256);auditPackage(out.bytes!,snapshot.caseId,["PCAP","MEMORY","PPT"]);});
});
