import { readOdtZip, writeOdtZip, type OdtZipEntry } from "../lb23/OdtPackageCodec";
import { CANONICAL_MEMORY_PPT_VISUAL_PROFILE as PROFILE } from "../../../domain/documentModel/CanonicalDocumentVisualProfile";
import { canonicalMemoryPptStructure } from "../../../domain/documentModel/CanonicalMemoryPptStructure";
import type { SupplyGeneralTemplateKind } from "../lb94/SupplyGeneralEditableTemplateDerivation";

export const SUPPLY_CANONICAL_ODT_NORMALIZATION_VERSION = "LB105-SUPPLY-CANONICAL-ODT-V1" as const;

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

function body(kind: SupplyGeneralTemplateKind): string {
  const document = kind === "MEMORY" ? "MEMORY" : "PPT";
  const title = kind === "MEMORY" ? "MEMORIA JUSTIFICATIVA DEL CONTRATO DE SUMINISTRO" : "PLIEGO DE PRESCRIPCIONES TÉCNICAS DEL CONTRATO DE SUMINISTRO";
  const slots = kind === "MEMORY" ? MEMORY_SLOTS : PPT_SLOTS;
  const sections = canonicalMemoryPptStructure({ document, family: "SUPPLY" });
  return `<office:text><text:p text:style-name="${PROFILE.styles.title.styleName}">${title}</text:p><text:p text:style-name="${PROFILE.styles.heading2.styleName}">EXPEDIENTE: <text:variable-set text:name="CI_CASE_ID" office:value-type="string">{{caseId}}</text:variable-set></text:p>${sections.map(section => `<text:h text:outline-level="1" text:style-name="${PROFILE.styles.heading1.styleName}">${esc(`${section.number}. ${section.title}`)}</text:h><text:p text:style-name="${PROFILE.styles.body.styleName}">${slots[section.number] ?? "No procede para el alcance declarado."}</text:p>`).join("")}<text:p text:style-name="${PROFILE.styles.body.styleName}">Documento editable generado por Contrata-IA. Requiere revisión y validación humana antes de su aprobación o firma.</text:p></office:text>`;
}

function style(name: string, font: string, size: number, weight: string, color: string, align: string, extra = ""): string {
  return `<style:style style:name="${name}" style:family="paragraph"><style:paragraph-properties fo:text-align="${align}" fo:line-height="115%" fo:margin-bottom="0.18cm" ${extra}/><style:text-properties style:font-name="${font}" fo:font-size="${size}pt" fo:font-weight="${weight}" fo:color="${color}"/></style:style>`;
}

function styleDefinitions(): string {
  return Object.values(PROFILE.styles).map(item => style(item.styleName, item.fontFamily, item.fontSizePt, item.fontWeight, item.color, item.alignment, item.styleName === PROFILE.styles.heading1.styleName ? 'fo:keep-with-next="always"' : "")).join("");
}

function replaceEntry(entries: readonly OdtZipEntry[], name: string, value: string): OdtZipEntry[] {
  return entries.map(item => item.name === name ? { ...item, bytes: Buffer.from(value, "utf8") } : item);
}

/** Transforma el activo LB94 ya autenticado en la representación física LB104/LB105. */
export function normalizeSupplyGeneralOdtLb105(bytes: Uint8Array, kind: SupplyGeneralTemplateKind): Uint8Array {
  let entries = readOdtZip(bytes);
  const contentEntry = entries.find(item => item.name === "content.xml");
  const stylesEntry = entries.find(item => item.name === "styles.xml");
  if (!contentEntry || !stylesEntry) throw new Error("El ODT Supply no contiene content.xml y styles.xml.");
  let content = Buffer.from(contentEntry.bytes).toString("utf8");
  let styles = Buffer.from(stylesEntry.bytes).toString("utf8");
  content = content.replace(/<office:text\b[\s\S]*?<\/office:text>/, body(kind));
  if (!content.includes(SUPPLY_CANONICAL_ODT_NORMALIZATION_VERSION)) {
    content = content.replace(/<office:body\b/, `<!-- ${SUPPLY_CANONICAL_ODT_NORMALIZATION_VERSION} --><office:body`);
  }
  styles = styles.replace(/<office:styles\b[^>]*>/, match => `${match}${styleDefinitions()}`);
  styles = styles.replace(/<style:page-layout-properties\b[^>]*>/g, match => `<style:page-layout-properties fo:page-width="21cm" fo:page-height="29.7cm" fo:margin-top="1.8cm" fo:margin-right="2cm" fo:margin-bottom="1.8cm" fo:margin-left="2cm"${match.endsWith("/>") ? "/" : ""}>`);
  styles = styles.replace(/<style:footer(?:\s[^>]*)?>[\s\S]*?<\/style:footer>/, `<style:footer><text:p text:style-name="${PROFILE.styles.footer.styleName}">EXPEDIENTE: <text:variable-get text:name="CI_CASE_ID"/> · REVISIÓN HUMANA OBLIGATORIA · PÁGINA <text:page-number/></text:p></style:footer>`);
  entries = replaceEntry(entries, "content.xml", content);
  entries = replaceEntry(entries, "styles.xml", styles);
  return writeOdtZip(entries);
}
