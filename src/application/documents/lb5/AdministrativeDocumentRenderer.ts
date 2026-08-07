import type {
  AdministrativeDocument,
  EditableDocumentArtifact,
  LB5DocumentPackage,
  LB5RenderedPackage
} from "./DocumentModel";

function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

interface ZipEntry {
  readonly name: string;
  readonly data: Uint8Array;
}

function uint16(value: number): Buffer {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value & 0xffff, 0);
  return buffer;
}

function uint32(value: number): Buffer {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value >>> 0, 0);
  return buffer;
}

function createStoreZip(entries: readonly ZipEntry[]): Uint8Array {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;
  const dosTime = 0;
  const dosDate = 0x5c21; // 2026-01-01

  for (const entry of entries) {
    const name = Buffer.from(entry.name, "utf8");
    const data = Buffer.from(entry.data);
    const checksum = crc32(data);
    const local = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x03, 0x04]),
      uint16(20),
      uint16(0x0800),
      uint16(0),
      uint16(dosTime),
      uint16(dosDate),
      uint32(checksum),
      uint32(data.length),
      uint32(data.length),
      uint16(name.length),
      uint16(0),
      name,
      data
    ]);
    localParts.push(local);

    const central = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x01, 0x02]),
      uint16(20),
      uint16(20),
      uint16(0x0800),
      uint16(0),
      uint16(dosTime),
      uint16(dosDate),
      uint32(checksum),
      uint32(data.length),
      uint32(data.length),
      uint16(name.length),
      uint16(0),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(0),
      uint32(offset),
      name
    ]);
    centralParts.push(central);
    offset += local.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.concat([
    Buffer.from([0x50, 0x4b, 0x05, 0x06]),
    uint16(0),
    uint16(0),
    uint16(entries.length),
    uint16(entries.length),
    uint32(centralDirectory.length),
    uint32(offset),
    uint16(0)
  ]);
  return Buffer.concat([...localParts, centralDirectory, end]);
}

function paragraphXml(text: string, style?: "Title" | "Heading1" | "Normal"): string {
  const selected = style ?? "Normal";
  return `<w:p><w:pPr><w:pStyle w:val="${selected}"/><w:spacing w:after="120"/><w:jc w:val="${selected === "Title" ? "center" : "both"}"/></w:pPr><w:r><w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r></w:p>`;
}

function documentXml(document: AdministrativeDocument): string {
  const body: string[] = [];
  body.push(paragraphXml(document.title, "Title"));
  body.push(paragraphXml(`Documento: ${document.id}`, "Normal"));
  for (const section of document.sections) {
    body.push(paragraphXml(section.heading, "Heading1"));
    for (const paragraph of section.paragraphs) {
      body.push(paragraphXml(paragraph.text));
      if (paragraph.sourceIds.length > 0) {
        body.push(paragraphXml(`Fuentes: ${paragraph.sourceIds.join(", ")} · Estado: ${paragraph.validation}`));
      }
    }
  }
  if (document.warnings.length > 0) {
    body.push(paragraphXml("ADVERTENCIAS DE VALIDACIÓN", "Heading1"));
    for (const warning of document.warnings) body.push(paragraphXml(warning));
  }
  body.push(`<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708"/><w:cols w:space="708"/></w:sectPr>`);
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body.join("")}</w:body></w:document>`;
}

function stylesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Source Sans Pro" w:hAnsi="Source Sans Pro" w:eastAsia="Source Sans Pro"/><w:sz w:val="20"/><w:lang w:val="es-ES"/></w:rPr></w:rPrDefault></w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:rPr><w:rFonts w:ascii="Source Sans Pro" w:hAnsi="Source Sans Pro"/><w:sz w:val="20"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="240"/></w:pPr><w:rPr><w:rFonts w:ascii="Source Sans Pro" w:hAnsi="Source Sans Pro"/><w:b/><w:sz w:val="24"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="200" w:after="100"/></w:pPr><w:rPr><w:rFonts w:ascii="Source Sans Pro" w:hAnsi="Source Sans Pro"/><w:b/><w:sz w:val="21"/></w:rPr></w:style>
</w:styles>`;
}

function createDocx(document: AdministrativeDocument): Uint8Array {
  const entries: ZipEntry[] = [
    {
      name: "[Content_Types].xml",
      data: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`, "utf8")
    },
    {
      name: "_rels/.rels",
      data: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`, "utf8")
    },
    {
      name: "word/_rels/document.xml.rels",
      data: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`, "utf8")
    },
    { name: "word/document.xml", data: Buffer.from(documentXml(document), "utf8") },
    { name: "word/styles.xml", data: Buffer.from(stylesXml(), "utf8") },
    {
      name: "docProps/core.xml",
      data: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${xmlEscape(document.title)}</dc:title><dc:creator>Contrata-IA</dc:creator><cp:keywords>Junta de Andalucía; contratación pública; LB-5</cp:keywords><dcterms:created xsi:type="dcterms:W3CDTF">2026-08-07T00:00:00Z</dcterms:created></cp:coreProperties>`, "utf8")
    },
    {
      name: "docProps/app.xml",
      data: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Contrata-IA</Application><AppVersion>0.1.0</AppVersion></Properties>`, "utf8")
    }
  ];
  return createStoreZip(entries);
}

function pdfEscape(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")
    .replace(/[\u0100-\uffff]/g, "?");
}

function wrap(text: string, width = 92): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (!current) current = word;
    else if (`${current} ${word}`.length <= width) current += ` ${word}`;
    else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function createPdf(document: AdministrativeDocument): Uint8Array {
  const lines: string[] = [document.title, ""];
  for (const section of document.sections) {
    lines.push(section.heading);
    for (const paragraph of section.paragraphs) {
      lines.push(...wrap(paragraph.text));
      if (paragraph.sourceIds.length > 0) lines.push(...wrap(`Fuentes: ${paragraph.sourceIds.join(", ")} | Estado: ${paragraph.validation}`));
      lines.push("");
    }
  }
  const pages: string[][] = [];
  for (let index = 0; index < lines.length; index += 48) pages.push(lines.slice(index, index + 48));

  const objects: string[] = [];
  const addObject = (body: string): number => {
    objects.push(body);
    return objects.length;
  };
  const catalogId = addObject("<< /Type /Catalog /Pages 2 0 R >>");
  void catalogId;
  objects.push(""); // pages object placeholder at id 2
  const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  const pageIds: number[] = [];

  for (const pageLines of pages) {
    const commands = ["BT", "/F1 9 Tf", "50 800 Td", "12 TL"];
    for (const [index, line] of pageLines.entries()) {
      if (index > 0) commands.push("T*");
      commands.push(`(${pdfEscape(line)}) Tj`);
    }
    commands.push("ET");
    const stream = commands.join("\n");
    const streamLength = Buffer.byteLength(stream, "latin1");
    const contentId = addObject(`<< /Length ${streamLength} >>\nstream\n${stream}\nendstream`);
    const pageId = addObject(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    pageIds.push(pageId);
  }
  objects[1] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  const chunks: Buffer[] = [Buffer.from("%PDF-1.4\n%Contrata-IA\n", "latin1")];
  const offsets: number[] = [0];
  let position = chunks[0]!.length;
  for (let index = 0; index < objects.length; index += 1) {
    const objectId = index + 1;
    offsets[objectId] = position;
    const chunk = Buffer.from(`${objectId} 0 obj\n${objects[index]}\nendobj\n`, "latin1");
    chunks.push(chunk);
    position += chunk.length;
  }
  const xrefOffset = position;
  const xrefLines = [`xref`, `0 ${objects.length + 1}`, "0000000000 65535 f "];
  for (let id = 1; id <= objects.length; id += 1) {
    xrefLines.push(`${String(offsets[id]).padStart(10, "0")} 00000 n `);
  }
  const trailer = `${xrefLines.join("\n")}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  chunks.push(Buffer.from(trailer, "latin1"));
  return Buffer.concat(chunks);
}

export class AdministrativeDocumentRenderer {
  public render(packageValue: LB5DocumentPackage): LB5RenderedPackage {
    if (!packageValue.globalValidation.valid) {
      throw new Error(`Paquete documental LB-5 inválido: ${packageValue.globalValidation.errors.join("; ")}`);
    }
    const editable: EditableDocumentArtifact[] = [];
    const pdf: EditableDocumentArtifact[] = [];
    for (const document of packageValue.documents) {
      editable.push({
        documentId: document.id,
        fileName: `${document.fileBaseName}.docx`,
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        data: createDocx(document)
      });
      pdf.push({
        documentId: document.id,
        fileName: `${document.fileBaseName}.pdf`,
        mimeType: "application/pdf",
        data: createPdf(document)
      });
    }
    return { package: packageValue, editable, pdf };
  }
}
