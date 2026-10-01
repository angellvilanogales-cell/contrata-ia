import {createHash} from "node:crypto";
import {afterEach,describe,expect,it,vi} from "vitest";
import {JdaOfficialPcapRemoteFallbackStore} from "../src/application/intake/lb102/JdaOfficialPcapRemoteFallbackStore";
import {resolveJdaOfficialPcapModel} from "../src/application/intake/lb102/JdaOfficialPcapModelManifest2025";
import {readOdtZip,writeOdtZip,type OdtZipEntry} from "../src/application/intake/lb23/OdtPackageCodec";
import {computeOdtStyleFingerprint,type UniversalEditableTemplateBinaryStore} from "../src/application/intake/lb23/UniversalOdtProductionRenderer";
import type {PersistedTemplateAssetDescriptor} from "../src/application/intake/lb94/HttpPersistedTemplateAssetStore";
import {JDA_SUPPLY_ASA_EU_FUNDS_PCAP_SOURCE_URL,JDA_SUPPLY_ASA_EU_FUNDS_PCAP_TEMPLATE_ID} from "../src/application/intake/lb96/ServicePersistedTemplateAssetStore";

const encoder=new TextEncoder();
function entry(name:string,value:string,method:0|8=8):OdtZipEntry{return{name,bytes:encoder.encode(value),method};}
function fixture(){return writeOdtZip([
 entry("mimetype","application/vnd.oasis.opendocument.text",0),
 entry("content.xml",'<office:document-content xmlns:office="urn:o"><office:body><office:text/></office:body></office:document-content>'),
 entry("styles.xml",'<office:document-styles xmlns:office="urn:o"><office:styles/></office:document-styles>'),
]);}
function descriptor(bytes:Uint8Array):PersistedTemplateAssetDescriptor{return{
 kind:"PCAP",templateId:JDA_SUPPLY_ASA_EU_FUNDS_PCAP_TEMPLATE_ID,sourceId:"jda:test:eu-funds",
 sha256:createHash("sha256").update(bytes).digest("hex"),
 styleFingerprint:computeOdtStyleFingerprint(readOdtZip(bytes)),provenanceRole:"OFFICIAL_MODEL",
};}
const missing:UniversalEditableTemplateBinaryStore={get:async()=>null};

afterEach(()=>vi.unstubAllGlobals());

describe("LB103 — recuperación cerrada del PCAP oficial ASA fondos europeos",()=>{
 it("fija la URL oficial completa del modelo seleccionado",()=>{
  expect(JDA_SUPPLY_ASA_EU_FUNDS_PCAP_SOURCE_URL).toBe("https://www.juntadeandalucia.es/sites/default/files/inline-files/2026/02/2025_12_17_pcap_suministro_abierto_simplificado_abreviado_ffee.odt");
  expect(resolveJdaOfficialPcapModel({family:"SUPPLY",procedure:"ASA",financing:"EU_FUNDS"})).toMatchObject({
   sha256:"0b6ec38663e874ef54e2182951cee48cf18a6d5945e0405930b513c4d52969f7",
   styleFingerprint:"sha256:8a85db38c2f7a067003527b5e8b7da3987b8b6038dab9dcc450206445032b5f0",
  });
 });
 it("usa el ODT oficial cuando falta en persistencia y coinciden ambas huellas",async()=>{
  const bytes=fixture();vi.stubGlobal("fetch",vi.fn(async()=>new Response(bytes,{status:200})));
  const store=new JdaOfficialPcapRemoteFallbackStore(missing,descriptor(bytes),JDA_SUPPLY_ASA_EU_FUNDS_PCAP_SOURCE_URL,"PCAP UE de prueba");
  const source=await store.get(JDA_SUPPLY_ASA_EU_FUNDS_PCAP_TEMPLATE_ID);
  expect(source?.templateId).toBe(JDA_SUPPLY_ASA_EU_FUNDS_PCAP_TEMPLATE_ID);
  expect(source?.sourceId).toBe("jda:test:eu-funds");
  expect(Buffer.from(source?.bytes??[]).equals(Buffer.from(bytes))).toBe(true);
 });
 it("bloquea una sustitución remota aunque el recurso siga siendo un ODT",async()=>{
  const accredited=fixture();
  const changed=writeOdtZip([...readOdtZip(accredited),entry("extra.xml","<changed/>")]);
  vi.stubGlobal("fetch",vi.fn(async()=>new Response(changed,{status:200})));
  const store=new JdaOfficialPcapRemoteFallbackStore(missing,descriptor(accredited),JDA_SUPPLY_ASA_EU_FUNDS_PCAP_SOURCE_URL,"PCAP UE de prueba");
  await expect(store.get(JDA_SUPPLY_ASA_EU_FUNDS_PCAP_TEMPLATE_ID)).rejects.toThrow(/SHA-256 remoto distinto/);
 });
});
