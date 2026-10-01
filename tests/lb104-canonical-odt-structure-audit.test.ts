import { describe, expect, it } from "vitest";
import { writeOdtZip } from "../src/application/intake/lb23/OdtPackageCodec";
import { auditCanonicalOdtStructure, assertCanonicalOdtStructure } from "../src/application/intake/lb104/CanonicalOdtStructureAudit";
import { canonicalMemoryPptStructure } from "../src/domain/documentModel/CanonicalMemoryPptStructure";

function odt(paragraphs: readonly string[]): Uint8Array {
  const content = `<?xml version="1.0" encoding="UTF-8"?><office:document-content xmlns:office="urn:o" xmlns:text="urn:t"><office:body><office:text>${paragraphs.map(value => `<text:p>${value}</text:p>`).join("")}</office:text></office:body></office:document-content>`;
  return writeOdtZip([
    { name: "mimetype", bytes: Buffer.from("application/vnd.oasis.opendocument.text"), method: 0, modTime: 0, modDate: 0, externalAttributes: 0 },
    { name: "content.xml", bytes: Buffer.from(content), method: 8, modTime: 0, modDate: 0, externalAttributes: 0 },
  ]);
}

function literals(document: "MEMORY" | "PPT") {
  return canonicalMemoryPptStructure({ document, family: "SUPPLY" }).map(item => `${item.number}. ${item.title}`);
}

describe("LB104 puerta de estructura física ODT", () => {
  it("acepta todos los epígrafes exactos, una sola vez y en orden", () => {
    const result = auditCanonicalOdtStructure({ bytes: odt(literals("MEMORY")), document: "MEMORY", family: "SUPPLY" });
    expect(result).toMatchObject({ ready: true, missing: [], duplicated: [] });
    expect(() => assertCanonicalOdtStructure({ bytes: odt(literals("PPT")), document: "PPT", family: "SUPPLY" })).not.toThrow();
  });

  it("rechaza omisiones, cambios de nomenclatura y duplicados", () => {
    const headings = [...literals("PPT")];
    headings[0] = "1. Objeto del pliego";
    headings.push(headings[1]!);
    const result = auditCanonicalOdtStructure({ bytes: odt(headings), document: "PPT", family: "SUPPLY" });
    expect(result.ready).toBe(false);
    expect(result.missing).toContain("1. Objeto y alcance de las prescripciones técnicas");
    expect(result.duplicated).toContain("2. Organización e interlocución técnica");
  });

  it("exige los epígrafes especiales solo cuando el supuesto está activado", () => {
    const base = literals("PPT");
    const without = auditCanonicalOdtStructure({ bytes: odt(base), document: "PPT", family: "SUPPLY" });
    const withOverlay = auditCanonicalOdtStructure({ bytes: odt(base), document: "PPT", family: "SUPPLY", overlays: ["SOFTWARE_LICENSING"] });
    expect(without.ready).toBe(true);
    expect(withOverlay.ready).toBe(false);
    expect(withOverlay.missing).toEqual(["4.1. Licenciamiento, derechos de uso, actualizaciones y soporte"]);
  });
});
