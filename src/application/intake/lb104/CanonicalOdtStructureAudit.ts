import { readOdtZip } from "../lb23/OdtPackageCodec";
import {
  auditCanonicalMemoryPptHeadings,
  canonicalMemoryPptStructure,
  type CanonicalDocumentFamily,
  type CanonicalNonPcapDocument,
  type CanonicalOverlay,
} from "../../../domain/documentModel/CanonicalMemoryPptStructure";

function decodeXml(value: string): string {
  return value
    .replace(/<text:tab\b[^>]*\/>/g, "\t")
    .replace(/<text:line-break\b[^>]*\/>/g, "\n")
    .replace(/<text:s\b[^>]*\/>/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function visibleOdtParagraphs(bytes: Uint8Array): readonly string[] {
  const content = readOdtZip(bytes).find(entry => entry.name === "content.xml");
  if (!content) throw new Error("ODT inválido: falta content.xml.");
  const xml = Buffer.from(content.bytes).toString("utf8");
  return [...xml.matchAll(/<text:(?:p|h)\b[^>]*>([\s\S]*?)<\/text:(?:p|h)>/g)]
    .map(match => decodeXml(match[1] ?? ""))
    .filter(Boolean);
}

/**
 * Puerta física LB104. Solo reconoce como epígrafe canónico el literal exacto
 * «número. título». No normaliza mayúsculas ni acepta sinónimos silenciosamente.
 */
export function auditCanonicalOdtStructure(input: {
  bytes: Uint8Array;
  document: CanonicalNonPcapDocument;
  family: CanonicalDocumentFamily;
  overlays?: readonly CanonicalOverlay[];
}) {
  const expected = canonicalMemoryPptStructure(input);
  const expectedLiterals = new Map(expected.map(section => [`${section.number}. ${section.title}`, section]));
  const paragraphs = visibleOdtParagraphs(input.bytes);
  const headings = paragraphs
    .filter(paragraph => expectedLiterals.has(paragraph))
    .map(paragraph => {
      const section = expectedLiterals.get(paragraph)!;
      return { number: section.number, title: section.title };
    });
  const audit = auditCanonicalMemoryPptHeadings({
    document: input.document,
    family: input.family,
    overlays: input.overlays,
    headings,
  });
  const present = new Set(headings.map(item => `${item.number}. ${item.title}`));
  const missing = audit.expected
    .map(item => `${item.number}. ${item.title}`)
    .filter(literal => !present.has(literal));
  const duplicated = [...present].filter(literal => paragraphs.filter(item => item === literal).length > 1);
  const blockers = [
    ...audit.blockers,
    ...missing.map(literal => `Falta el epígrafe canónico «${literal}».`),
    ...duplicated.map(literal => `El epígrafe canónico «${literal}» está duplicado.`),
  ];
  return {
    ready: blockers.length === 0,
    version: audit.version,
    document: input.document,
    family: input.family,
    headings,
    missing,
    duplicated,
    blockers,
  } as const;
}

export function assertCanonicalOdtStructure(input: Parameters<typeof auditCanonicalOdtStructure>[0]): void {
  const audit = auditCanonicalOdtStructure(input);
  if (!audit.ready) throw new Error(`Estructura física ${audit.document} no conforme con ${audit.version}: ${audit.blockers.join(" ")}`);
}
