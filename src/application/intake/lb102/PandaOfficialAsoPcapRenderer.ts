import {createHash} from "node:crypto";
import type {UniversalEditableTemplateBinaryStore} from "../lb23/UniversalOdtProductionRenderer";
import {computeOdtStyleFingerprint} from "../lb23/UniversalOdtProductionRenderer";
import {readOdtZip,writeOdtZip} from "../lb23/OdtPackageCodec";
import type {UniversalEvidenceRecord} from "../lb52/UniversalEvidenceWorkspace";
import {assertNoOdtSignatureResidue} from "./OdtSignatureResidueSanitizer";
import {PANDA_OFFICIAL_ASO_PCAP_SOURCE_URL,PANDA_OFFICIAL_ASO_PCAP_TEMPLATE_ID} from "./LB102PersistedPilotTemplateStores";

function sha256(bytes:Uint8Array){return createHash("sha256").update(bytes).digest("hex");}
function esc(value:string){return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&apos;");}
function decodeXml(value:string){return value.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'\"').replace(/&apos;/g,"'");}
function plain(xml:string){return decodeXml(xml.replace(/<[^>]+>/g," ")).replace(/\s+/g," ").trim();}
function compact(value:string){return plain(value).replace(/\s+/g,"").toLocaleLowerCase("es");}
function text(bytes:Uint8Array){const content=readOdtZip(bytes).find(entry=>entry.name==="content.xml");return content?plain(Buffer.from(content.bytes).toString("utf8")):"";}
function field(record:UniversalEvidenceRecord,key:string){const f=record.fields[key];if(!f||f.status!=="HUMAN_VALIDATED"||!f.humanValidated)throw new Error(`Panda V10: falta evidencia humana validada para ${key}.`);return f.value;}
function str(record:UniversalEvidenceRecord,key:string){const value=field(record,key);if(typeof value!=="string"||!value.trim())throw new Error(`Panda V10: ${key} debe ser texto validado.`);return value.trim();}
function num(record:UniversalEvidenceRecord,key:string){const value=field(record,key);if(typeof value!=="number"||!Number.isFinite(value))throw new Error(`Panda V10: ${key} debe ser número validado.`);return value;}
function bool(record:UniversalEvidenceRecord,key:string){const value=field(record,key);if(typeof value!=="boolean")throw new Error(`Panda V10: ${key} debe ser booleano validado.`);return value;}
function euros(cents:number){return new Intl.NumberFormat("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2,useGrouping:true}).format(cents/100);}
function replaceUniqueLiteral(xml:string,from:string,to:string,label:string){const count=xml.split(from).length-1;if(count!==1)throw new Error(`PCAP oficial ASO: anclaje ${label} aparece ${count} veces; se exige identidad física exacta.`);return xml.replace(from,to);}

function replaceStyledParagraph(xml:string,styleName:string,labelNeedle:string,replacementText:string,label:string){
 const re=new RegExp(`<text:p\\b[^>]*text:style-name="${styleName}"[^>]*>[\\s\\S]*?<\\/text:p>`,"g");let match:RegExpExecArray|null;let found:string|null=null;const needle=labelNeedle.replace(/\s+/g,"").toLocaleLowerCase("es");
 while((match=re.exec(xml))){if(compact(match[0]).includes(needle)){if(found)throw new Error(`PCAP oficial ASO: anclaje textual duplicado ${label}.`);found=match[0];}}
 if(!found)throw new Error(`PCAP oficial ASO: no se encuentra anclaje textual ${label}.`);
 const open=found.match(/^<text:p\b[^>]*>/)?.[0];if(!open)throw new Error(`PCAP oficial ASO: párrafo inválido en ${label}.`);
 return xml.replace(found,`${open}${esc(replacementText)}</text:p>`);
}

function fillFrontPage(xml:string,record:UniversalEvidenceRecord){
 const title=str(record,"administrative.title"),locality=str(record,"administrative.locality"),nuts=str(record,"administrative.nuts"),cpv=str(record,"cpvMain");
 xml=replaceUniqueLiteral(xml,'<text:p text:style-name="P113">Expediente:</text:p><text:p text:style-name="P113"/>',`<text:p text:style-name="P113">Expediente:</text:p><text:p text:style-name="P113">${esc(record.caseId)}</text:p>`,"portada.expediente");
 xml=replaceUniqueLiteral(xml,'<text:p text:style-name="P113">Titulo:</text:p><text:p text:style-name="P113"/>',`<text:p text:style-name="P113">Titulo:</text:p><text:p text:style-name="P113">${esc(title)}</text:p>`,"portada.titulo");
 xml=replaceUniqueLiteral(xml,'<text:p text:style-name="P113">Localidad <text:span text:style-name="T1023">de entrega</text:span>:</text:p><text:p text:style-name="P113"/>',`<text:p text:style-name="P113">Localidad <text:span text:style-name="T1023">de entrega</text:span>:</text:p><text:p text:style-name="P113">${esc(locality)}</text:p>`,"portada.localidad");
 xml=replaceUniqueLiteral(xml,'<text:p text:style-name="P113">Código NUTS del lugar principal de ejecución:</text:p><text:p text:style-name="P113"/>',`<text:p text:style-name="P113">Código NUTS del lugar principal de ejecución:</text:p><text:p text:style-name="P113">${esc(nuts)}</text:p>`,"portada.nuts");
 const start=xml.indexOf('<text:p text:style-name="P113">Código CPV: ');if(start<0)throw new Error("PCAP oficial ASO: no se localiza portada.cpv.");const close=xml.indexOf('</text:note></text:p>',start);if(close<0)throw new Error("PCAP oficial ASO: estructura de nota CPV inesperada.");const anchor='</text:note></text:p>';xml=xml.slice(0,close)+`</text:note><text:span text:style-name="T1023"> ${esc(cpv)}</text:span></text:p>`+xml.slice(close+anchor.length);
 return xml;
}

function fillAnnexI(xml:string,record:UniversalEvidenceRecord){
 const title=str(record,"administrative.title"),locality=str(record,"administrative.locality"),object=str(record,"object"),cpv=str(record,"cpvMain"),delivery=str(record,"technical.deliveryLocation"),noLots=str(record,"lots.noDivisionJustification");
 const pbl=num(record,"baseTenderBudgetCents"),vat=num(record,"economic.initialVatAmountCents"),pblVat=num(record,"economic.initialPblVatIncludedCents"),ve=num(record,"economic.legalEstimatedValueCents"),duration=num(record,"durationMonths"),extension=num(record,"extensionMonths");
 const lots=bool(record,"lots.divisionIntoLots"),integrated=bool(record,"lots.integratedOfferAllowed");
 xml=replaceStyledParagraph(xml,"P133","TÍTULO DEL CONTRATO",`TÍTULO DEL CONTRATO: ${title}`,"anexo1.titulo");
 xml=replaceStyledParagraph(xml,"P134","EXPEDIENTE",`EXPEDIENTE: ${record.caseId}`,"anexo1.expediente");
 xml=replaceStyledParagraph(xml,"P134","LOCALIDAD",`LOCALIDAD: ${locality}`,"anexo1.localidad");
 xml=replaceStyledParagraph(xml,"P515","Objeto del contrato",`Objeto del contrato: ${object}`,"anexo1.objeto");
 xml=replaceStyledParagraph(xml,"P138","Lugar de entrega del suministro",`Lugar de entrega del suministro: ${delivery}`,"anexo1.lugarEntrega");
 xml=replaceStyledParagraph(xml,"P51","División en lotes",`División en lotes: ${lots?"Sí":"No"}`,"anexo1.lotes");
 xml=replaceStyledParagraph(xml,"P571","Justificación de la no división",`Justificación de la no división del contrato en lotes: ${lots?"No procede.":noLots}`,"anexo1.justificacionNoLotes");
 xml=replaceStyledParagraph(xml,"P67","Oferta integradora",`Oferta integradora: ${integrated?"Sí":"No"}`,"anexo1.ofertaIntegradora");
 xml=replaceStyledParagraph(xml,"P559","Importe total (IVA excluido)",`Importe total (IVA excluido): ${euros(pbl)} euros.`,"anexo1.pblSinIva");
 xml=replaceStyledParagraph(xml,"P560","Importe del IVA",`Importe del IVA: ${euros(vat)} euros.`,"anexo1.iva");
 xml=replaceStyledParagraph(xml,"P560","Importe total (IVA incluido)",`Importe total (IVA incluido): ${euros(pblVat)} euros.`,"anexo1.pblIva");
 xml=replaceStyledParagraph(xml,"P581","Valor estimado del contrato",`Valor estimado del contrato: ${euros(ve)} euros.`,"anexo1.valorEstimado");
 xml=replaceStyledParagraph(xml,"P582","Método de cálculo",`Método de cálculo: ${str(record,"economic.estimatedValueCalculationMethod")}`,"anexo1.metodoVe");
 xml=replaceStyledParagraph(xml,"P586","Plazo total",`Plazo total (en meses): ${duration} meses`,"anexo1.plazo");
 xml=replaceStyledParagraph(xml,"P191","Posibilidad de prórroga",`Posibilidad de prórroga: ${extension>0?"Sí":"No"}`,"anexo1.prorroga");
 xml=replaceStyledParagraph(xml,"P192","Duración de la prórroga",`Duración de la prórroga: ${extension>0?`${extension} meses`:"No procede."}`,"anexo1.duracionProrroga");
 xml=replaceStyledParagraph(xml,"P444","Tramitación del gasto",`Tramitación del gasto: ${str(record,"processing.processingType")==="ORDINARIA"?"Ordinaria":"Anticipada"}.`,"anexo1.tramitacionGasto");
 const annexStart=xml.indexOf('<text:p text:style-name="P20">ANEXO I</text:p>');if(annexStart<0)throw new Error("PCAP oficial ASO: no se localiza inicio físico del Anexo I.");const cpvLabel=xml.indexOf("Código CPV",annexStart);if(cpvLabel<0)throw new Error("PCAP oficial ASO: no se localiza anexo1.cpv.");const cpvGap=xml.indexOf("_______",cpvLabel);if(cpvGap<0)throw new Error("PCAP oficial ASO: no se localiza hueco anexo1.cpv.");xml=xml.slice(0,cpvGap)+esc(cpv)+xml.slice(cpvGap+7);
 const mandatory=[record.caseId,title,object,cpv,euros(pbl),euros(ve),String(duration)];const rendered=plain(xml);for(const value of mandatory)if(!rendered.includes(value))throw new Error(`PCAP oficial ASO: no se materializó dato obligatorio ${value}.`);
 if(rendered.includes("FIRMADO POR")||rendered.includes("VERIFICACIÓN"))throw new Error("PCAP oficial ASO: se detecta residuo de firma en el modelo de salida.");
 return xml;
}

/** Gate físico del PCAP Panda V10. */
export async function loadPandaOfficialAsoPcapForCalibration(store:UniversalEditableTemplateBinaryStore){
 const source=await store.get(PANDA_OFFICIAL_ASO_PCAP_TEMPLATE_ID);
 if(!source)throw new Error(`Panda V10 bloqueado: falta el modelo oficial PCAP Suministro, procedimiento abierto simplificado ordinario, autofinanciado (17/12/2025). Fuente: ${PANDA_OFFICIAL_ASO_PCAP_SOURCE_URL}`);
 assertNoOdtSignatureResidue(source.bytes,"PCAP oficial ASO");
 const body=text(source.bytes);const required=["Suministro","Abierto Simplificado ordinario","ELEMENTOS DEL CONTRATO","ANEXO I","CARACTERÍSTICAS DEL CONTRATO"];
 for(const marker of required)if(!body.toLowerCase().includes(marker.toLowerCase()))throw new Error(`PCAP oficial ASO: falta marcador estructural ${marker}.`);
 return source;
}

export interface PandaOfficialAsoPcapRenderResult{bytes:Uint8Array;sha256:string;fileName:string;officialModel:true;humanValidationRequired:true;}
/**
 * Render V10 sobre el ODT oficial acreditado. Se sustituyen exclusivamente
 * anclajes físicos calibrados del modelo de diciembre de 2025; no se heredan
 * firmas, CSV ni maquetación del PCAP firmado del expediente Panda.
 */
export async function renderPandaOfficialAsoPcap(input:{templateStore:UniversalEditableTemplateBinaryStore;caseId:string;record:UniversalEvidenceRecord}):Promise<PandaOfficialAsoPcapRenderResult>{
 if(input.caseId!==input.record.caseId)throw new Error("Panda V10: caseId y snapshot no coinciden.");
 const source=await loadPandaOfficialAsoPcapForCalibration(input.templateStore);let entries=readOdtZip(source.bytes);const beforeStyle=computeOdtStyleFingerprint(entries);const content=entries.find(entry=>entry.name==="content.xml");if(!content)throw new Error("PCAP oficial ASO: falta content.xml.");
 let xml=Buffer.from(content.bytes).toString("utf8");xml=fillFrontPage(xml,input.record);xml=fillAnnexI(xml,input.record);entries=entries.map(entry=>entry.name==="content.xml"?{...entry,bytes:Buffer.from(xml,"utf8")}:entry);const afterStyle=computeOdtStyleFingerprint(entries);if(afterStyle!==beforeStyle)throw new Error("Panda V10: el render alteró la huella de estilo del modelo oficial.");
 const bytes=writeOdtZip(entries);assertNoOdtSignatureResidue(bytes,"PCAP Panda V10");return{bytes,sha256:sha256(bytes),fileName:`PCAP_${input.caseId.replaceAll("/","-").replaceAll(" ","-")}_JDA_ASO_Official_V10.odt`,officialModel:true,humanValidationRequired:true};
}
