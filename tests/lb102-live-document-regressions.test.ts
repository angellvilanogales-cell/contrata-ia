import fs from "node:fs";
import {describe,expect,it} from "vitest";
import {readOdtZip,writeOdtZip,type OdtZipEntry} from "../src/application/intake/lb23/OdtPackageCodec";
import {injectPandaInstitutionalStyles} from "../src/application/intake/lb102/PandaInstitutionalEvidenceFormatter";
import {institutionalizeServiceMemoryOdt} from "../src/application/intake/lb102/ServiceInstitutionalEvidenceFormatter";
import {assertServiceOfficialPcapPreUat} from "../src/application/intake/lb102/ServiceSourceBackedPilotPackageGenerator";
import {materializeServiceOfficialPcapCriticalFieldsForRegression,selectServiceOfficialAnnexRangeForRegression,selectServiceSourceAnnexLinesForRegression} from "../src/application/intake/lb102/ServiceOfficialOpenPcapRenderer";

function entry(name:string,content:string,method:0|8=8):OdtZipEntry{return{name,bytes:Buffer.from(content,"utf8"),method,modTime:0,modDate:0,externalAttributes:0};}
function serviceMemoryWithThirteenPhysicalParagraphs(){
 const paragraphs=Array.from({length:13},(_,i)=>`<text:p>SECCIÓN ${i+1}. CONTENIDO MATERIAL.<text:line-break/>Detalle administrativo ${i+1}.<text:line-break/>Justificación técnica ${i+1}.</text:p>`).join("");
 const content=`<?xml version="1.0" encoding="UTF-8"?><office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"><office:body><office:text>${paragraphs}</office:text></office:body></office:document-content>`;
 return writeOdtZip([entry("mimetype","application/vnd.oasis.opendocument.text",0),entry("content.xml",content)]);
}

describe("LB102 · regresiones de blockers vivos Render 2026-09-07/10",()=>{
 it("Panda crea office:automatic-styles cuando el ODT fuente válido no lo trae",()=>{
  const xml=`<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"><office:body/></office:document-content>`;
  const out=injectPandaInstitutionalStyles(xml);expect(out).toContain("<office:automatic-styles>");expect(out).toContain('style:name="CI_Body"');expect(out).toContain('fo:font-weight="normal"');expect(out.indexOf("<office:automatic-styles>")).toBeLessThan(out.indexOf("<office:body"));
 });

 it("Service reconstruye más de 20 párrafos materiales y diferencia cuerpo de títulos",()=>{
  const out=institutionalizeServiceMemoryOdt(serviceMemoryWithThirteenPhysicalParagraphs(),"Service TEST/MEMORIA");const content=readOdtZip(out).find(x=>x.name==="content.xml");expect(content).toBeTruthy();const xml=Buffer.from(content!.bytes).toString("utf8");expect((xml.match(/<text:p\b/g)??[]).length).toBeGreaterThanOrEqual(20);expect(xml).toContain('style:name="CI_Service_Body"');expect(xml).toContain('fo:text-align="justify"');expect(xml).toContain('fo:font-weight="normal"');
 });

 it("Service mantiene la puerta de PCAP oficial: bloquea false y admite únicamente true",()=>{
  expect(()=>assertServiceOfficialPcapPreUat("HUELVA",false)).toThrow(/modelo oficial Junta/i);expect(()=>assertServiceOfficialPcapPreUat("SEVILLA",true)).not.toThrow();
 });

 it("Service no trata un text:p autocerrado como apertura al materializar campos críticos",()=>{
  const xml='<office:text><text:p>EXPEDIENTE: _______</text:p><text:p>Código CPV: _______</text:p><text:p>Objeto del contrato: _______</text:p><text:p>Importe total (IVA excluido): _______</text:p><text:p/><text:p>Tramitación del gasto: Ordinaria / Anticipada</text:p><text:p>Valor estimado del contrato: _______</text:p><text:p>División en lotes: Sí / No</text:p></office:text>';
  const out=materializeServiceOfficialPcapCriticalFieldsForRegression(xml,{caseId:"CONTR TEST",mainCpv:"90911200-8",objectValue:"SERVICIO DE PRUEBA",pblExVat:"100,00",estimatedValue:"120,00",divisionIntoLots:"No",expenseProcessing:"Anticipada"});
  expect(out).toContain('<text:p/>');expect(out).toContain('<text:p>Tramitación del gasto: Anticipada.</text:p>');expect(out).not.toContain('<text:p/>Tramitación del gasto: Anticipada.</text:p>');expect(out).toContain('<text:p>Valor estimado del contrato: 120,00 €</text:p>');
 });

 it("Panda y Service materializan destino e hiperenlace interno al Anexo I",()=>{
  for(const file of ["src/application/intake/lb102/PandaOfficialAsoPcapRenderer.ts","src/application/intake/lb102/ServiceOfficialOpenPcapRenderer.ts"]){const source=fs.readFileSync(file,"utf8");expect(source).toContain('text:bookmark-start text:name="CI_ANEXO_I"');expect(source).toContain('xlink:href="#CI_ANEXO_I"');expect(source).toContain("DOCUMENTO A CUMPLIMENTAR POR EL ÓRGANO DE CONTRATACIÓN:");}
 });

 it("Service selecciona el Anexo I por evidencia administrativa y no por la última coincidencia textual",()=>{
  const source=fs.readFileSync("src/application/intake/lb102/ServiceOfficialOpenPcapRenderer.ts","utf8");expect(source).toContain("annexCandidateScore");expect(source).toContain("hasAdministrativeCore");expect(source).toContain("candidates.sort");expect(source).not.toContain("const start=starts[starts.length-1]");
 });

 it("Service descarta falsos Anexo I de cláusulas y conserva el Anexo I administrativo real",()=>{
  const p=(text:string)=>`<text:p>${text}</text:p>`;
  // Complete paragraphs must survive source-line reflow before the quality gate.
  const trueAnnex=["ANEXO I - CARACTERÍSTICAS DEL CONTRATO","EXPEDIENTE: CONTR TEST","Objeto del contrato: SERVICIO DE PRUEBA","Código CPV: 90911200-8","Presupuesto base de licitación: 100,00 €","Valor estimado del contrato: 120,00 €","División en lotes: No","Tramitación: Ordinaria",...Array.from({length:20},(_,i)=>`Campo administrativo ${i+1}.`)];
  const falseAnnex=["ANEXO I - CARACTERÍSTICAS DEL CONTRATO","La persona cedente debe tener ejecutado al menos un 20 % del importe del contrato.","16. Subcontratación.",...Array.from({length:90},(_,i)=>`Cláusula general ${i+1}`)];
  const xml=`<office:text>${trueAnnex.map(p).join("")}${p("ANEXO II - DECLARACIÓN")}${falseAnnex.map(p).join("")}${p("ANEXO III - MODELO")}</office:text>`;
  const range=selectServiceOfficialAnnexRangeForRegression(xml);expect(xml.slice(range.start,range.end)).toContain("CONTR TEST");expect(xml.slice(range.start,range.end)).not.toContain("Subcontratación");
  const selected=selectServiceSourceAnnexLinesForRegression([...trueAnnex,"ANEXO II - DECLARACIÓN",...falseAnnex,"ANEXO III - MODELO"]);expect(selected.join(" ")).toContain("CONTR TEST");expect(selected.join(" ")).not.toContain("Subcontratación");
  expect(selected.length).toBeGreaterThanOrEqual(20);
  expect(()=>selectServiceSourceAnnexLinesForRegression([...trueAnnex.slice(0,8),"ANEXO II - DECLARACIÓN"])).toThrow(/Anexo I insuficiente/);
 });
});
