import { inflateRawSync } from "node:zlib";
import type { IntakeCase, IntakeQuestion, IntakeQuestionId } from "./IntakeModel";
import { LB6_QUESTIONS } from "./IntakeEngine";

function xmlEscape(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}
function xmlUnescape(value: string): string {
  return value.replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", '"').replaceAll("&apos;", "'").replaceAll("&amp;", "&");
}
function crc32(data: Uint8Array): number { let crc = 0xffffffff; for (const byte of data) { crc ^= byte; for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); } return (crc ^ 0xffffffff) >>> 0; }
function u16(value: number): Buffer { const b = Buffer.alloc(2); b.writeUInt16LE(value & 0xffff, 0); return b; }
function u32(value: number): Buffer { const b = Buffer.alloc(4); b.writeUInt32LE(value >>> 0, 0); return b; }
function zip(entries: readonly { name: string; data: Uint8Array }[]): Uint8Array {
  const locals: Buffer[] = []; const centrals: Buffer[] = []; let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name); const data = Buffer.from(entry.data); const crc = crc32(data);
    const local = Buffer.concat([Buffer.from([0x50,0x4b,0x03,0x04]),u16(20),u16(0x0800),u16(0),u16(0),u16(0x5c21),u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0),name,data]);
    locals.push(local);
    centrals.push(Buffer.concat([Buffer.from([0x50,0x4b,0x01,0x02]),u16(20),u16(20),u16(0x0800),u16(0),u16(0),u16(0x5c21),u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),name]));
    offset += local.length;
  }
  const central = Buffer.concat(centrals);
  return Buffer.concat([...locals, central, Buffer.concat([Buffer.from([0x50,0x4b,0x05,0x06]),u16(0),u16(0),u16(entries.length),u16(entries.length),u32(central.length),u32(offset),u16(0)])]);
}
function p(text: string, style = "Normal"): string { return `<w:p><w:pPr><w:pStyle w:val="${style}"/></w:pPr><w:r><w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r></w:p>`; }
function displayAnswer(caseValue: IntakeCase | undefined, id: IntakeQuestionId): string {
  const value = caseValue?.answers[id]?.value;
  if (value === undefined) return "";
  if (Array.isArray(value)) return value.join("; ");
  if (typeof value === "boolean") return value ? "Sí" : "No";
  return String(value);
}
function requirementLabel(question: IntakeQuestion): string {
  return question.requirement === "REQUIRED" ? "OBLIGATORIO" : question.requirement === "CONDITIONAL" ? "SI PROCEDE" : question.requirement === "SYSTEM_CAN_PROPOSE" ? "PUEDE PROPONER CONTRATA-IA" : "OPCIONAL";
}
function documentXml(caseValue?: IntakeCase): string {
  const parts: string[] = [p("FICHA DE DATOS DEL EXPEDIENTE", "Title"), p("Contrata-IA · cumplimentación externa e importación posterior"), p("Instrucciones: escriba la respuesta después de ‘RESPUESTA:’. En listas, separe elementos con punto y coma. No elimine los identificadores [[Q:...]], porque permiten la importación automática."), p(`Expediente: ${caseValue?.id ?? "NUEVO"}`)];
  let section = "";
  for (const question of LB6_QUESTIONS) {
    if (question.section !== section) { section = question.section; parts.push(p(section, "Heading1")); }
    parts.push(p(`[[Q:${question.id}]]`));
    parts.push(p(`${question.label} · ${requirementLabel(question)}`, "Heading2"));
    parts.push(p(question.help));
    if (question.choices) parts.push(p(`Opciones: ${question.choices.join(" | ")}`));
    parts.push(p(`RESPUESTA: ${displayAnswer(caseValue, question.id)}`));
  }
  parts.push(`<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr>`);
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${parts.join("")}</w:body></w:document>`;
}
function stylesXml(): string { return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Source Sans Pro" w:hAnsi="Source Sans Pro"/><w:sz w:val="20"/><w:lang w:val="es-ES"/></w:rPr></w:rPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:rPr><w:b/><w:sz w:val="28"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:rPr><w:b/><w:sz w:val="24"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:rPr><w:b/></w:rPr></w:style></w:styles>`; }

export function createQuestionnaireDocx(caseValue?: IntakeCase): Uint8Array {
  return zip([
    { name: "[Content_Types].xml", data: Buffer.from(`<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`) },
    { name: "_rels/.rels", data: Buffer.from(`<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`) },
    { name: "word/_rels/document.xml.rels", data: Buffer.from(`<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`) },
    { name: "word/document.xml", data: Buffer.from(documentXml(caseValue)) },
    { name: "word/styles.xml", data: Buffer.from(stylesXml()) }
  ]);
}

function findEocd(buffer: Buffer): number { for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 65557); i -= 1) if (buffer.readUInt32LE(i) === 0x06054b50) return i; throw new Error("DOCX inválido: no se encontró el directorio ZIP."); }
function extractZipEntry(data: Uint8Array, wanted: string): Buffer {
  const buffer = Buffer.from(data); const eocd = findEocd(buffer); const count = buffer.readUInt16LE(eocd + 10); let pos = buffer.readUInt32LE(eocd + 16);
  for (let n = 0; n < count; n += 1) {
    if (buffer.readUInt32LE(pos) !== 0x02014b50) throw new Error("DOCX inválido: directorio central corrupto.");
    const method = buffer.readUInt16LE(pos + 10); const compressedSize = buffer.readUInt32LE(pos + 20); const nameLen = buffer.readUInt16LE(pos + 28); const extraLen = buffer.readUInt16LE(pos + 30); const commentLen = buffer.readUInt16LE(pos + 32); const localOffset = buffer.readUInt32LE(pos + 42); const name = buffer.subarray(pos + 46, pos + 46 + nameLen).toString("utf8");
    if (name === wanted) {
      if (buffer.readUInt32LE(localOffset) !== 0x04034b50) throw new Error("DOCX inválido: entrada local corrupta.");
      const localNameLen = buffer.readUInt16LE(localOffset + 26); const localExtraLen = buffer.readUInt16LE(localOffset + 28); const start = localOffset + 30 + localNameLen + localExtraLen; const payload = buffer.subarray(start, start + compressedSize);
      if (method === 0) return payload; if (method === 8) return inflateRawSync(payload); throw new Error(`DOCX con método de compresión no soportado: ${method}.`);
    }
    pos += 46 + nameLen + extraLen + commentLen;
  }
  throw new Error(`DOCX inválido: falta ${wanted}.`);
}
function paragraphTexts(xml: string): string[] {
  return [...xml.matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)].map(match => [...match[0].matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(t => xmlUnescape(t[1] ?? "")).join("").trim());
}

export function parseQuestionnaireDocx(data: Uint8Array): Readonly<Partial<Record<IntakeQuestionId, string>>> {
  const xml = extractZipEntry(data, "word/document.xml").toString("utf8"); const paragraphs = paragraphTexts(xml); const answers: Partial<Record<IntakeQuestionId, string>> = {}; const validIds = new Set(LB6_QUESTIONS.map(q => q.id));
  for (let index = 0; index < paragraphs.length; index += 1) {
    const marker = /^\[\[Q:([A-Za-z0-9_]+)\]\]$/.exec(paragraphs[index] ?? ""); if (!marker) continue; const id = marker[1] as IntakeQuestionId; if (!validIds.has(id)) continue;
    for (let cursor = index + 1; cursor < Math.min(paragraphs.length, index + 8); cursor += 1) {
      const line = paragraphs[cursor] ?? ""; if (line.startsWith("[[Q:")) break; if (line.startsWith("RESPUESTA:")) { const value = line.slice("RESPUESTA:".length).trim(); if (value) answers[id] = value; break; }
    }
  }
  return answers;
}
