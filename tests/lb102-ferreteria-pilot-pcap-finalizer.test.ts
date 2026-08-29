import {describe,expect,it} from "vitest";
import {finalizeFerreteriaPilotPcapAuthorityFields} from "../src/application/operations/lb102/FerreteriaPilotPcapRenderer";
import {readOdtZip,writeOdtZip,type OdtZipEntry} from "../src/application/intake/lb23/OdtPackageCodec";
import {auditJdaSupplyAsaRenderedOdt} from "../src/application/intake/lb35/JuntaSupplyAsaAnexoIResidualAudit";

function entry(name:string,text:string,method:0|8=8):OdtZipEntry{return{name,bytes:Buffer.from(text,"utf8"),method,modTime:0,modDate:0,externalAttributes:0};}
function odt(lines:string[]):Uint8Array{return writeOdtZip([
 entry("mimetype","application/vnd.oasis.opendocument.text",0),
 entry("content.xml",`<office:document-content xmlns:office="urn:o" xmlns:text="urn:t"><office:body><office:text><text:p>ANEXO I</text:p><text:p>CARACTERÍSTICAS DEL CONTRATO</text:p>${lines.map(x=>`<text:p text:style-name="P1">${x}</text:p>`).join("")}<text:p>ANEXO II</text:p></office:text></office:body></office:document-content>`),
]);}
function text(bytes:Uint8Array){const e=readOdtZip(bytes).find(x=>x.name==="content.xml")!;return Buffer.from(e.bytes).toString("utf8").replace(/<[^>]+>/g," ").replace(/\s+/g," ");}

describe("LB102 Ferretería pilot PCAP finalizer",()=>{
 it("materializa decisiones del órgano de contratación sin silenciar la auditoría",()=>{
  const source=odt([
   "Especificaciones del objeto del contrato: _______",
   "Total: ___ unidades",
   "Total: ___ euros",
   "Descripción de los lotes: _______",
   "LOTE 1. _______",
   "LOTE 2. _______",
   "Número máximo de lotes para los que una misma persona licitadora puede presentar oferta: _______",
   "Número máximo de lotes que pueden adjudicarse a cada persona licitadora: _______",
   "Oferta integradora: Sí/No",
   "Régimen jurídico específico por razón del objeto del contrato: _______",
   "Fórmula de revisión: _______",
   "Variación de precios en función del cumplimiento o incumplimiento de objetivos: Sí/No",
   "Plazos parciales: _______",
   "Órgano de contratación: _______",
   "Respuestas vinculantes sobre la aclaración de los pliegos: Sí/No",
   "Constitución de mesa de contratación: Sí/No",
   "Posibilidad de variantes: Sí/No",
   "En caso de renuncia: _______ euros",
   "En caso de desistimiento: _______ euros",
   "Organismos de los que las personas licitadoras pueden obtener la información pertinente sobre las obligaciones previstas en el artículo 129.1 de la LCSP: _______",
   "Se exige habilitación empresarial o profesional: Sí/No",
   "Otros requisitos necesarios para asegurar la conformidad de dichos sistemas con el ENS, en su caso: _______",
   "Criterios de adjudicación: _______",
   "Parámetros objetivos para considerar una oferta anormalmente baja: _______",
   "Criterios de desempate: _______",
   "Penalidades por demora en la ejecución parcial o total del plazo de ejecución: Sí/No",
   "Penalidades por cumplimiento defectuoso: Sí/No",
   "Penalidades por incumplimiento parcial en la ejecución: Sí/No",
   "Penalidades por incumplimiento de las obligaciones en materia medioambiental, social o laboral: Sí/No",
   "Plazo de garantía: _______",
   "Programa de trabajo: Sí/No",
   "Información a la que se le atribuye carácter confidencial: _______",
   "Plazo durante el que la persona contratista deberá mantener el deber de confidencialidad: _______",
   "Obligación de tener suscrito seguro que cubra las responsabilidades que se deriven de la ejecución del contrato: Sí/No",
   "En su caso, términos del seguro: _______",
   "Cesión del contrato: Sí/No",
   "En el supuesto de suspensión del contrato acordada por la Administración: Sí/No",
   "La ejecución del contrato requiere el tratamiento por la persona contratista de datos personales: Sí/No",
  ]);
  expect(auditJdaSupplyAsaRenderedOdt(source).ready).toBe(false);
  const closed=finalizeFerreteriaPilotPcapAuthorityFields(source);
  const audit=auditJdaSupplyAsaRenderedOdt(closed);
  expect(audit.ready).toBe(true);
  const body=text(closed);
  expect(body).toContain("Dirección Gerencia del Servicio Andaluz de Empleo");
  expect(body).toContain("10.552,44 euros");
  expect(body).toContain("3 años para bienes duraderos");
  expect(body).not.toContain("Sí/No");
 });
});
