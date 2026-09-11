import { createHash } from "node:crypto";
import { readOdtZip, writeOdtZip, type OdtZipEntry } from "../lb23/OdtPackageCodec";
import { CANONICAL_MEMORY_PPT_VISUAL_PROFILE as PROFILE } from "../../../domain/documentModel/CanonicalDocumentVisualProfile";
import { canonicalMemoryPptStructure } from "../../../domain/documentModel/CanonicalMemoryPptStructure";
import type { SupplyGeneralTemplateKind } from "../lb94/SupplyGeneralEditableTemplateDerivation";

export const SUPPLY_CANONICAL_ODT_NORMALIZATION_VERSION = "LB105-SUPPLY-CANONICAL-ODT-V1" as const;
export const SUPPLY_LB105_JUNTA_LOGO = {
  path: "Pictures/10000000000000D900000092C15C4D5A3F76B932.jpg",
  sha256: "2f8e3d5db6bec32620b59173842b4cf124acd67bf38db87e7161c580a58885de",
} as const;
const CONTINUATION_HEADING_STYLE = "CI_LB105_Heading1_Continuation";

const MEMORY_SLOTS: Readonly<Record<string, string>> = {
  "1": "La contratación se promueve por el órgano competente identificado en el expediente.",
  "2": "{{need}}",
  "3": "{{object}} CPV principal: {{cpvMain}}.",
  "4": "{{lotsRegime}}",
  "5": "{{economicSummary}}",
  "6": "El valor estimado y su método de cálculo se recogen en el apartado económico precedente.",
  "7": "{{procedureSummary}}",
  "8": "{{durationSummary}}",
  "9": "El procedimiento y la tramitación son los validados en el expediente.",
  "10": "La capacidad, habilitación y solvencia se regirán por el PCAP oficial aplicable.",
  "11": "{{awardCriteriaSummary}}",
  "12": "Las garantías se regirán por el PCAP oficial aplicable.",
  "13": "{{executionSummary}}",
  "14": "La subcontratación y la cesión se regirán por el PCAP oficial aplicable.",
  "15": "{{modificationSummary}}",
  "16": "El régimen de revisión de precios consta en la información económica validada.",
  "17": "El responsable, la ejecución, la recepción y el pago se ajustarán a los datos validados y al PCAP.",
  "18": "Se aplicarán las obligaciones de protección de datos y seguridad que resulten del expediente.",
  "19": "Se propone continuar la tramitación, sujeta a revisión y validación humana antes de la aprobación.",
};

const PPT_SLOTS: Readonly<Record<string, string>> = {
  "1": "{{object}}",
  "2": "{{contractManagement}}",
  "3": "{{durationSummary}} Lugares de ejecución o entrega: {{executionLocations}}.",
  "4": "{{technicalRequirements}} {{supplyVariantRequirements}}",
  "5": "Los medios deberán ser suficientes y adecuados para cumplir todas las prescripciones técnicas.",
  "6": "La ejecución estará sujeta al seguimiento del responsable del contrato y al control de calidad.",
  "7": "{{receiptAndAcceptanceRegime}}",
  "8": "{{specialExecutionConditions}}",
  "9": "La garantía técnica, el mantenimiento y el soporte se prestarán conforme al expediente validado.",
  "10": "La persona contratista observará las obligaciones aplicables de confidencialidad, seguridad y protección de datos.",
  "11": "La ejecución incorporará las medidas ambientales y de gestión de residuos que resulten aplicables.",
  "12": "La documentación técnica exigible y sus anexos formarán parte de la entrega y de la comprobación de conformidad.",
};

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
}

function body(kind: SupplyGeneralTemplateKind, logoPath: string): string {
  const document = kind === "MEMORY" ? "MEMORY" : "PPT";
  const title = kind === "MEMORY" ? "MEMORIA JUSTIFICATIVA DEL CONTRATO DE SUMINISTRO" : "PLIEGO DE PRESCRIPCIONES TÉCNICAS DEL CONTRATO DE SUMINISTRO";
  const slots = kind === "MEMORY" ? MEMORY_SLOTS : PPT_SLOTS;
  const sections = canonicalMemoryPptStructure({ document, family: "SUPPLY" });
  const coverLogo = `<text:p><draw:frame draw:name="CI_LB105_Cover_Junta_Andalucia" text:anchor-type="paragraph" svg:width="2.2cm" svg:height="1.48cm"><draw:image xlink:href="${logoPath}" xlink:type="simple" xlink:show="embed" xlink:actuate="onLoad" draw:mime-type="image/jpeg"/></draw:frame></text:p>`;
  return `<office:text>${coverLogo}<text:p text:style-name="${PROFILE.styles.title.styleName}">${title}</text:p><text:p text:style-name="${PROFILE.styles.heading2.styleName}">EXPEDIENTE: <text:variable-set text:name="CI_CASE_ID" office:value-type="string">{{caseId}}</text:variable-set></text:p>${sections.map(section => `<text:h text:outline-level="1" text:style-name="${kind === "MEMORY" && section.number === "12" ? CONTINUATION_HEADING_STYLE : PROFILE.styles.heading1.styleName}">${esc(`${section.number}. ${section.title}`)}</text:h><text:p text:style-name="${PROFILE.styles.body.styleName}">${slots[section.number] ?? "No procede para el alcance declarado."}</text:p>`).join("")}</office:text>`;
}

function style(name: string, font: string, size: number, weight: string, color: string, align: string, extra = ""): string {
  return `<style:style style:name="${name}" style:family="paragraph"><style:paragraph-properties fo:text-align="${align}" fo:line-height="115%" fo:margin-bottom="0.18cm" ${extra}/><style:text-properties style:font-name="${font}" fo:font-size="${size}pt" fo:font-weight="${weight}" fo:color="${color}"/></style:style>`;
}

function styleDefinitions(): string {
  const canonical = Object.values(PROFILE.styles).map(item => style(item.styleName, item.fontFamily, item.fontSizePt, item.fontWeight, item.color, item.alignment, item.styleName === PROFILE.styles.heading1.styleName ? 'fo:keep-with-next="always"' : "")).join("");
  const heading = PROFILE.styles.heading1;
  return `${canonical}${style(CONTINUATION_HEADING_STYLE, heading.fontFamily, heading.fontSizePt, heading.fontWeight, heading.color, heading.alignment, 'fo:keep-with-next="always" fo:break-before="page"')}`;
}

function replaceEntry(entries: readonly OdtZipEntry[], name: string, value: string): OdtZipEntry[] {
  return entries.map(item => item.name === name ? { ...item, bytes: Buffer.from(value, "utf8") } : item);
}

function institutionalLogo(entries: readonly OdtZipEntry[], styles: string): string {
  const exact = entries.find(item => item.name === SUPPLY_LB105_JUNTA_LOGO.path);
  if (exact) {
    const actual = createHash("sha256").update(exact.bytes).digest("hex");
    if (actual !== SUPPLY_LB105_JUNTA_LOGO.sha256) throw new Error("El logotipo Junta de Andalucía no coincide con el activo gráfico validado LB105.");
    return exact.name;
  }
  const referenced = [...styles.matchAll(/<draw:image\b[^>]*xlink:href="(Pictures\/[^"]+)"/g)].map(match => match[1]!);
  const fallback = referenced.find(name => entries.some(item => item.name === name && item.bytes.length > 0));
  if (!fallback) throw new Error("La plantilla Supply no contiene un activo gráfico institucional utilizable.");
  return fallback;
}

function normalizeMasterPages(styles: string, logoPath: string): string {
  const header = `<style:header><text:p/></style:header>`;
  const footer = `<style:footer><text:p text:style-name="${PROFILE.styles.footer.styleName}">EXPEDIENTE: <text:variable-get text:name="CI_CASE_ID"/> · REVISIÓN HUMANA OBLIGATORIA · PÁGINA <text:page-number/></text:p></style:footer>`;
  const expanded = styles.replace(/<style:master-page\b([^>]*)\/>/g, (_match, attributes: string) => `<style:master-page${attributes}>${header}${footer}</style:master-page>`);
  return expanded.replace(/<style:master-page\b[^>]*>[\s\S]*?<\/style:master-page>/g, block => {
    let result = /<style:header(?:\s[^>]*)?>/.test(block)
      ? block.replace(/<style:header(?:\s[^>]*)?>[\s\S]*?<\/style:header>/, header)
      : block.replace(/^(<style:master-page\b[^>]*>)/, `$1${header}`);
    result = /<style:footer(?:\s[^>]*)?>/.test(result)
      ? result.replace(/<style:footer(?:\s[^>]*)?>[\s\S]*?<\/style:footer>/, footer)
      : result.replace(/<\/style:master-page>$/, `${footer}</style:master-page>`);
    return result;
  });
}

function normalizePageLayoutRegions(styles: string): string {
  const headerStyle = '<style:header-style><style:header-footer-properties fo:min-height="1.5cm" fo:margin-left="0cm" fo:margin-right="0cm" fo:margin-bottom="0.2cm" style:dynamic-spacing="true"/></style:header-style>';
  const footerStyle = '<style:footer-style><style:header-footer-properties fo:min-height="0.6cm" fo:margin-left="0cm" fo:margin-right="0cm" fo:margin-top="0.2cm" style:dynamic-spacing="true"/></style:footer-style>';
  return styles.replace(/<style:page-layout\b[^>]*>[\s\S]*?<\/style:page-layout>/g, block => {
    let result = /<style:header-style(?:\s[^>]*)?\/>/.test(block)
      ? block.replace(/<style:header-style(?:\s[^>]*)?\/>/, headerStyle)
      : /<style:header-style(?:\s[^>]*)?>/.test(block)
        ? block.replace(/<style:header-style(?:\s[^>]*)?>[\s\S]*?<\/style:header-style>/, headerStyle)
        : block.replace(/<\/style:page-layout>$/, `${headerStyle}</style:page-layout>`);
    result = /<style:footer-style(?:\s[^>]*)?\/>/.test(result)
      ? result.replace(/<style:footer-style(?:\s[^>]*)?\/>/, footerStyle)
      : /<style:footer-style(?:\s[^>]*)?>/.test(result)
        ? result.replace(/<style:footer-style(?:\s[^>]*)?>[\s\S]*?<\/style:footer-style>/, footerStyle)
        : result.replace(/<\/style:page-layout>$/, `${footerStyle}</style:page-layout>`);
    return result;
  });
}

/** Transforma el activo LB94 ya autenticado en la representación física LB104/LB105. */
export function normalizeSupplyGeneralOdtLb105(bytes: Uint8Array, kind: SupplyGeneralTemplateKind): Uint8Array {
  let entries = readOdtZip(bytes);
  const contentEntry = entries.find(item => item.name === "content.xml");
  const stylesEntry = entries.find(item => item.name === "styles.xml");
  if (!contentEntry || !stylesEntry) throw new Error("El ODT Supply no contiene content.xml y styles.xml.");
  let content = Buffer.from(contentEntry.bytes).toString("utf8");
  let styles = Buffer.from(stylesEntry.bytes).toString("utf8");
  const logoPath = institutionalLogo(entries, styles);
  content = content.replace(/<office:text\b[\s\S]*?<\/office:text>/, body(kind, logoPath));
  if (!content.includes(SUPPLY_CANONICAL_ODT_NORMALIZATION_VERSION)) {
    content = content.replace(/<office:body\b/, `<!-- ${SUPPLY_CANONICAL_ODT_NORMALIZATION_VERSION} --><office:body`);
  }
  styles = styles.replace(/<office:styles\b[^>]*>/, match => `${match}${styleDefinitions()}`);
  const repeatedMasterPage = styles.includes('style:name="MP0"') ? "MP0" : styles.includes('style:name="Standard"') ? "Standard" : undefined;
  if (repeatedMasterPage) {
    styles = styles.replace(`style:name="${PROFILE.styles.title.styleName}" style:family="paragraph"`, `style:name="${PROFILE.styles.title.styleName}" style:family="paragraph" style:master-page-name="${repeatedMasterPage}"`);
    styles = styles.replace(`style:name="${CONTINUATION_HEADING_STYLE}" style:family="paragraph"`, `style:name="${CONTINUATION_HEADING_STYLE}" style:family="paragraph" style:master-page-name="${repeatedMasterPage}"`);
  }
  styles = styles.replace(/<style:page-layout-properties\b[^>]*>/g, match => `<style:page-layout-properties fo:page-width="21cm" fo:page-height="29.7cm" fo:margin-top="1.8cm" fo:margin-right="2cm" fo:margin-bottom="1.8cm" fo:margin-left="2cm"${match.endsWith("/>") ? "/" : ""}>`);
  styles = normalizePageLayoutRegions(styles);
  styles = normalizeMasterPages(styles, logoPath);
  entries = replaceEntry(entries, "content.xml", content);
  entries = replaceEntry(entries, "styles.xml", styles);
  return writeOdtZip(entries);
}
