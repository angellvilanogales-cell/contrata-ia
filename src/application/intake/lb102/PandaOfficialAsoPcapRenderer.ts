import type {UniversalEditableTemplateBinaryStore} from "../lb23/UniversalOdtProductionRenderer";
import {readOdtZip} from "../lb23/OdtPackageCodec";
import {assertNoOdtSignatureResidue} from "./OdtSignatureResidueSanitizer";
import {PANDA_OFFICIAL_ASO_PCAP_SOURCE_URL,PANDA_OFFICIAL_ASO_PCAP_TEMPLATE_ID} from "./LB102PersistedPilotTemplateStores";

function text(bytes:Uint8Array){const content=readOdtZip(bytes).find(entry=>entry.name==="content.xml");return content?Buffer.from(content.bytes).toString("utf8").replace(/<[^>]+>/g," ").replace(/\s+/g," "):"";}

/**
 * Gate físico del PCAP Panda V10. El modelo oficial debe existir en persistencia
 * antes de calibrar sus anclajes de Anexo I. No se permite volver a usar como
 * plantilla el PCAP firmado del expediente real ni el modelo derivado V1.
 */
export async function loadPandaOfficialAsoPcapForCalibration(store:UniversalEditableTemplateBinaryStore){
 const source=await store.get(PANDA_OFFICIAL_ASO_PCAP_TEMPLATE_ID);
 if(!source)throw new Error(`Panda V10 bloqueado: falta el modelo oficial PCAP Suministro, procedimiento abierto simplificado ordinario, autofinanciado (17/12/2025). Fuente: ${PANDA_OFFICIAL_ASO_PCAP_SOURCE_URL}`);
 assertNoOdtSignatureResidue(source.bytes,"PCAP oficial ASO");
 const body=text(source.bytes);
 const required=["Suministro","Abierto Simplificado ordinario","ELEMENTOS DEL CONTRATO"];
 for(const marker of required)if(!body.toLowerCase().includes(marker.toLowerCase()))throw new Error(`PCAP oficial ASO: falta marcador estructural ${marker}.`);
 return source;
}

export async function renderPandaOfficialAsoPcap(input:{templateStore:UniversalEditableTemplateBinaryStore;caseId:string}){
 const source=await loadPandaOfficialAsoPcapForCalibration(input.templateStore);
 void source;
 throw new Error("PANDA_V10_OFFICIAL_PCAP_ANCHORS_NOT_CALIBRATED: el modelo oficial ASO está acreditado, pero sus anclajes de Anexo I deben calibrarse contra el binario oficial antes de generar datos del expediente. No se permite una sustitución aproximada.");
}
