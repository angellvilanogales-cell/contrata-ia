import { createHash } from "node:crypto";
import { OdtZipEntry, readOdtZip, writeOdtZip } from "../lb23/OdtPackageCodec";
import { computeOdtStyleFingerprint, UniversalEditableTemplateBinaryStore } from "../lb23/UniversalOdtProductionRenderer";
import { FERRETERIA_CANONICAL_CATALOG_98 } from "../lb43/FerreteriaCanonicalCatalogSourceData";

export const FERRETERIA_MEMORY_TEMPLATE_ID = "case:CONTR-2026-240267:memoria:v12:editable" as const;
export const FERRETERIA_PPT_TEMPLATE_ID = "case:CONTR-2026-240267:ppt:v6:editable" as const;

const MEMORY_SOURCE_SHA = "36ed482048e19bc8b1f9c4fe1b8f1bd47eb81ac9e256dd4f0488e7bc97b8e4dc";
const MEMORY_SOURCE_STYLE = "sha256:60bdf03935c18ee8c925e3184fc7bc864db873ffc7d32154098885b47e78448d";
const PPT_SOURCE_SHA = "c3f4199e3929718f278cc7d77c04d7e6082b79858e52ff193f1a79b17edd3f09";
const PPT_SOURCE_STYLE = "sha256:deadf7c2a176c83de774fad7022a0ac1d5adfcca514d8c0cddeb0b01029d1390";
const PPT_AUDITED_PAGE_COUNT_CACHE = 19;

export interface ProtectedCaseDocumentRender {
  kind: "MEMORIA" | "PPT";
  fileName: string;
  bytes: Uint8Array;
  sourceSha256: string;
  renderedSha256: string;
  sourceStyleFingerprint: string;
  renderedStyleFingerprint: string;
  auditReady: boolean;
  auditBlockers: readonly string[];
  appliedPhysicalBindings: readonly string[];
}

export interface ProtectedPhysicalBindingInventoryItem {
  id: string;
  part: "content.xml" | "styles.xml";
  sourceAnchor: string;
  effect: string;
}

export const FERRETERIA_MEMORY_PHYSICAL_BINDING_INVENTORY: readonly ProtectedPhysicalBindingInventoryItem[] = [
  { id: "memory.catalogue-scope", part: "content.xml", sourceAnchor: "Las especificaciones técnicas y la relación detallada de los artículos figuran", effect: "Cierra catálogo a referencias incluidas y limita variabilidad a unidades." },
  { id: "memory.estimated-value-paragraph", part: "content.xml", sourceAnchor: "Valor Estimado del Contrato:", effect: "Materializa VE 21.793,15 € y tratamiento DA 33.ª/prórrogas." },
  { id: "memory.estimated-value-table", part: "content.xml", sourceAnchor: "table:name=Tabla5", effect: "Reemplaza tabla del VE por presupuesto máximo + modificación 20 %." },
  { id: "memory.estimated-value-method", part: "content.xml", sourceAnchor: "Método de cálculo:", effect: "Elimina artículos nuevos y fija aumento de unidades existentes." },
  { id: "memory.rolece", part: "content.xml", sourceAnchor: "Se propone la tramitación por la vía del Procedimiento Abierto Simplificado Abreviado", effect: "Corrige régimen art. 159.6/159.4.a LCSP." },
  { id: "memory.qualification", part: "content.xml", sourceAnchor: "Esta medida legal facilita la concurrencia competitiva", effect: "Elimina habilitación específica inexistente." },
  { id: "memory.footer-page-count", part: "styles.xml", sourceAnchor: "<text:span text:style-name=\"MT2\">7</text:span>", effect: "Sustituye el denominador fijo por text:page-count para reflejar dinámicamente la paginación real del renderer." },
] as const;

export const FERRETERIA_PPT_PHYSICAL_BINDING_INVENTORY: readonly ProtectedPhysicalBindingInventoryItem[] = [
  { id: "ppt.catalogue-scope", part: "content.xml", sourceAnchor: "El listado de productos y sus cantidades estimadas tienen carácter meramente orientativo, no exhaustivo ni limitativo", effect: "Cierra catálogo: cantidades variables, referencias no ampliables por modificación prevista." },
  { id: "ppt.catalogue-98-source-backed", part: "content.xml", sourceAnchor: "4. DESCRIPCIÓN DE LOS MATERIALES OBJETO DEL PRESENTE CONTRATO", effect: "Sustituye íntegramente el bloque gráfico no editable entre el alcance del epígrafe 4 y el epígrafe 5 por una tabla ODF editable con las 98 referencias canónicas." },
  { id: "ppt.footer-page-count-cache", part: "styles.xml", sourceAnchor: "<text:page-count>7</text:page-count>", effect: "Conserva el campo dinámico text:page-count y actualiza su valor cacheado a la paginación auditada tras materializar la tabla editable." },
] as const;

function hash(bytes: Uint8Array): string { return createHash("sha256").update(bytes).digest("hex"); }
function entry(entries: readonly OdtZipEntry[], name: string): OdtZipEntry { const found = entries.find(item => item.name === name); if (!found) throw new Error(`ODT inválido: falta ${name}.`); return found; }
function part(entries: readonly OdtZipEntry[], name: string): string { return Buffer.from(entry(entries, name).bytes).toString("utf8"); }
function replacePart(entries: readonly OdtZipEntry[], name: string, value: string): OdtZipEntry[] { return entries.map(item => item.name === name ? { ...item, bytes: Buffer.from(value, "utf8") } : item); }
function count(text: string, token: string): number { if (!token) return 0; let total = 0; let cursor = 0; while ((cursor = text.indexOf(token, cursor)) >= 0) { total += 1; cursor += token.length; } return total; }
function replaceUnique(text: string, oldValue: string, newValue: string, label: string): string { const occurrences = count(text, oldValue); if (occurrences !== 1) throw new Error(`${label}: el anclaje físico aparece ${occurrences} veces; se exige coincidencia única.`); return text.replace(oldValue, newValue); }
function paragraphContaining(text: string, needle: string): { value: string; start: number; end: number } { const pattern = /<text:p\b[^>]*>[\s\S]*?<\/text:p>/g; const matches = [...text.matchAll(pattern)].filter(match => match[0].includes(needle)); if (matches.length !== 1 || matches[0]?.index === undefined) throw new Error(`Párrafo anclado por «${needle}» aparece ${matches.length} veces.`); const value = matches[0][0]; const start = matches[0].index; return { value, start, end: start + value.length }; }
function replaceParagraph(text: string, needle: string, replacement: string): string { const current = paragraphContaining(text, needle); return text.slice(0, current.start) + replacement + text.slice(current.end); }
function replaceParagraphSequence(text: string, firstNeedle: string, lastNeedle: string, replacement: string): string { const first = paragraphContaining(text, firstNeedle); const last = paragraphContaining(text, lastNeedle); if (last.start < first.start) throw new Error(`Secuencia física inválida: ${lastNeedle} precede a ${firstNeedle}.`); return text.slice(0, first.start) + replacement + text.slice(last.end); }
function replaceNamedTable(text: string, tableName: string, replacement: string): string { const token = `table:name=\"${tableName}\"`; const anchor = text.indexOf(token); if (anchor < 0) throw new Error(`No se localiza la tabla ${tableName}.`); if (text.indexOf(token, anchor + token.length) >= 0) throw new Error(`La tabla ${tableName} no es única.`); const start = text.lastIndexOf("<table:table ", anchor); const end = text.indexOf("</table:table>", anchor); if (start < 0 || end < 0) throw new Error(`No se puede delimitar físicamente la tabla ${tableName}.`); return text.slice(0, start) + replacement + text.slice(end + "</table:table>".length); }
function visibleText(xml: string): string { return xml.replace(/<text:tab[^>]*\/>/g, "\t").replace(/<text:line-break[^>]*\/>/g, "\n").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&apos;/g, "'"); }
function structuralStyleFingerprint(entries: readonly OdtZipEntry[]): string { const styles = part(entries, "styles.xml").replace(/<office:master-styles\b[\s\S]*?<\/office:master-styles>/, "<office:master-styles/>"); const content = part(entries, "content.xml"); const automatic = content.match(/<office:automatic-styles\b[\s\S]*?<\/office:automatic-styles>/)?.[0] ?? ""; const settings = entries.find(item => item.name === "settings.xml"); const settingsText = settings ? Buffer.from(settings.bytes).toString("utf8") : ""; return `sha256:${createHash("sha256").update([styles, automatic, settingsText].join("\n--CONTRATA-IA-STYLE-PART--\n")).digest("hex")}`; }
function assertSource(source: { bytes: Uint8Array; templateId: string }, expectedTemplate: string, expectedHash: string, expectedStyle: string): OdtZipEntry[] { if (source.templateId !== expectedTemplate) throw new Error(`Activo incorrecto: se esperaba ${expectedTemplate}.`); const actualHash = hash(source.bytes); if (actualHash !== expectedHash) throw new Error(`SHA-256 fuente no coincide para ${expectedTemplate}.`); const entries = readOdtZip(source.bytes); if (computeOdtStyleFingerprint(entries) !== expectedStyle) throw new Error(`Huella de estilos fuente no coincide para ${expectedTemplate}.`); return entries; }

const MEMORY_CATALOGUE_PARAGRAPH = '<text:p text:style-name="P51">Las especificaciones técnicas y la relación detallada de los artículos figuran en el Pliego de Prescripciones Técnicas (PPT). Con el fin de garantizar la libre concurrencia, las prestaciones se han dimensionado conforme a los consumos reales registrados en dichas sedes durante los últimos ejercicios. Dado que el contrato se articula mediante precios unitarios, las cantidades estimadas tienen carácter meramente orientativo y podrán variar en función de las necesidades reales. La relación de referencias del PPT delimita los artículos objeto del suministro, sin que esta previsión habilite la incorporación de artículos nuevos. En consecuencia, <text:span text:style-name="T60">se puede</text:span> adquirir un volumen superior o inferior de unidades de las referencias ya incluidas, quedando las entregas estrictamente subordinadas a las necesidades reales del servicio, a la existencia de crédito presupuestario y al presupuesto máximo aprobado.</text:p>';
const MEMORY_VE_PARAGRAPH = '<text:p text:style-name="P21"><text:soft-page-break/><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T45">Valor Estimado del Contrato:</text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T46"> A efectos de lo dispuesto en el artículo 101 de la Ley de Contratos del Sector Público (LCSP), el valor estimado del presente contrato se fija en 21.793,15 € (sin IVA) (veintiún mil setecientos noventa y tres euros con quince céntimos). El cálculo parte del presupuesto máximo aprobado para toda la vigencia del contrato conforme a la disposición adicional 33.ª LCSP, 18.160,96 € sin IVA, al que se añade exclusivamente la modificación prevista al alza del 20 % por necesidades reales superiores a las inicialmente estimadas. Las prórrogas previstas no incrementan por sí solas dicho presupuesto máximo.</text:span></text:span></text:p>';
const MEMORY_VE_TABLE = '<table:table table:name="Tabla5" table:style-name="Tabla5"><table:table-column table:style-name="Tabla5.A"/><table:table-column table:style-name="Tabla5.B"/><table:table-row><table:table-cell table:style-name="Tabla5.A1" office:value-type="string"><text:p text:style-name="P8"><text:span text:style-name="T41">VALOR ESTIMADO</text:span></text:p></table:table-cell><table:table-cell table:style-name="Tabla5.B1" office:value-type="string"><text:p text:style-name="P7"/></table:table-cell></table:table-row><table:table-row><table:table-cell table:style-name="Tabla5.A2" office:value-type="string"><text:p text:style-name="P5">PRESUPUESTO MÁXIMO DA 33.ª PARA TODA LA VIGENCIA (IVA NO INCLUIDO)</text:p></table:table-cell><table:table-cell table:style-name="Tabla5.B2" office:value-type="string"><text:p text:style-name="P7"><text:span text:style-name="T61">18.160,96</text:span> €</text:p></table:table-cell></table:table-row><table:table-row><table:table-cell table:style-name="Tabla5.A2" office:value-type="string"><text:p text:style-name="P5">MODIFICACIÓN ART. 204 AL ALZA (20 %)</text:p></table:table-cell><table:table-cell table:style-name="Tabla5.B2" office:value-type="string"><text:p text:style-name="P7"><text:span text:style-name="T61">3.632,19</text:span> €</text:p></table:table-cell></table:table-row><table:table-row><table:table-cell table:style-name="Tabla5.A2" office:value-type="string"><text:p text:style-name="P8"><text:s text:c="104"/><text:span text:style-name="T41">TOTAL</text:span></text:p></table:table-cell><table:table-cell table:style-name="Tabla5.B2" office:value-type="string"><text:p text:style-name="P11"><text:span text:style-name="T61">21.793,15 </text:span>€</text:p></table:table-cell></table:table-row></table:table>';
const MEMORY_VE_METHOD = '<text:p text:style-name="P20"><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T45">Método de cálculo:</text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T46"> El valor estimado se obtiene tomando como base el presupuesto máximo DA 33.ª para toda la vigencia, 18.160,96 € sin IVA, y añadiendo la modificación prevista máxima del 20 % al alza, 3.632,19 €, resultando 21.793,15 € sin IVA. La modificación solo podrá responder a necesidades reales superiores a las inicialmente estimadas mediante el aumento de unidades de referencias ya incluidas, manteniendo el mismo objeto y los precios unitarios adjudicados, sin incorporar artículos nuevos ni establecer precios unitarios nuevos.</text:span></text:span></text:p><text:p text:style-name="P9">Las prórrogas previstas, con una duración máxima conjunta de 24 meses, no incrementan automáticamente el presupuesto máximo aprobado para toda la vigencia.</text:p>';
const MEMORY_PROCEDURE_PARAGRAPH = '<text:p text:style-name="P68">Se propone la tramitación por la vía del Procedimiento Abierto Simplificado Abreviado (Supersimplificado) regulado en el artículo 159.6 de la LCSP, al ser el valor estimado del contrato inferior a 60.000 €. La adjudicación se articulará exclusivamente mediante criterios evaluables de forma automática (fórmulas). El plazo para la presentación de ofertas será, como mínimo, de 10 días hábiles o de 5 días hábiles cuando se trate de compras corrientes de bienes disponibles en el mercado. Conforme al artículo 159.6.b), se exime de acreditar la solvencia económica y financiera y técnica o profesional, y conforme al artículo 159.6.f) no se exige garantía definitiva. En lo no previsto en el apartado 6 se aplica la regulación general del procedimiento abierto simplificado, incluida la regla de inscripción registral del artículo 159.4.a), sin perjuicio de la admisión de la solicitud de inscripción presentada con anterioridad a la fecha final de presentación de ofertas en los términos previstos legalmente.</text:p>';
const MEMORY_QUALIFICATION_PARAGRAPH = '<text:p text:style-name="P67">La exención se refiere exclusivamente a la acreditación de la solvencia económica y financiera y técnica o profesional. Para este suministro no se exige habilitación empresarial o profesional específica, sin perjuicio de las autorizaciones generales que, en su caso, resulten legalmente necesarias para el ejercicio de la actividad.</text:p>';
const PPT_SCOPE_PARAGRAPH = '<text:p text:style-name="P39">Las cantidades estimadas tienen carácter meramente orientativo y podrán variar al alza o a la baja según las necesidades reales. La relación de referencias delimita los artículos objeto del suministro y no habilita la incorporación de artículos nuevos mediante la modificación prevista. Al haberse calculado en base a consumos históricos, el órgano de contratación no está obligado a alcanzar el volumen previsto y no podrá superarse, en ningún caso, el presupuesto máximo aprobado sin la previa tramitación que legalmente corresponda.</text:p>';

function xmlEscape(value: string): string { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;"); }
function money(cents: number): string { return `${(cents / 100).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false })} €`; }
function pptCell(value: string | number, header = false): string { return `<table:table-cell office:value-type="string"><text:p text:style-name="${header ? "P36" : "P21"}">${xmlEscape(String(value))}</text:p></table:table-cell>`; }
function buildEditablePptCatalogue(): string {
  const header = ["Nº", "Descripción", "Consumo anual estimado", "Uds. 24 meses", "Precio unitario sin IVA", "Total sin IVA", "IVA", "Total con IVA"].map(value => pptCell(value, true)).join("");
  const rows = FERRETERIA_CANONICAL_CATALOG_98.map(item => `<table:table-row>${pptCell(item.sequence)}${pptCell(item.description)}${pptCell(item.estimatedAnnualConsumption)}${pptCell(item.totalContractUnits24Months)}${pptCell(money(item.unitPriceCentsExVat))}${pptCell(money(item.totalPriceCentsExVat))}${pptCell(money(item.vatCents))}${pptCell(money(item.totalPriceCentsVatIncluded))}</table:table-row>`).join("");
  const totals = `<table:table-row>${pptCell("")}${pptCell("TOTAL")}${pptCell("")}${pptCell("")}${pptCell("")}${pptCell("10.552,44 €")}${pptCell("2.216,01 €")}${pptCell("12.768,45 €")}</table:table-row>`;
  return `<table:table table:name="ContrataIA_Catalogo98"><table:table-column table:number-columns-repeated="8"/><table:table-header-rows><table:table-row>${header}</table:table-row></table:table-header-rows>${rows}${totals}</table:table>`;
}
function replacePptImageCatalogue(content: string): string {
  const scope = paragraphContaining(content, "La relación de referencias delimita los artículos objeto del suministro");
  const section5 = paragraphContaining(content, "CONDICIONES DEL SUMINISTRO.");
  if (section5.start <= scope.end) throw new Error("PPT: secuencia alcance catálogo/epígrafe 5 inválida.");
  return content.slice(0, scope.end) + `<text:p text:style-name="P21"/>${buildEditablePptCatalogue()}<text:p text:style-name="P21"/>` + content.slice(section5.start);
}

function auditMemory(entries: readonly OdtZipEntry[], sourceStructuralStyle: string) {
  const text = visibleText(part(entries, "content.xml")); const styles = part(entries, "styles.xml"); const blockers: string[] = [];
  for (const required of ["21.793,15", "18.160,96", "3.632,19", "artículo 159.4.a", "sin incorporar artículos nuevos ni establecer precios unitarios nuevos", "no se exige habilitación empresarial o profesional específica"]) if (!text.includes(required)) blockers.push(`Memoria: falta contenido obligatorio «${required}».`);
  for (const forbidden of ["25.325,86", "Incorporación al contrato de otros artículos no contemplados", "se exime a los licitadores de la obligación de inscribirse"]) if (text.includes(forbidden)) blockers.push(`Memoria: persiste contenido incompatible «${forbidden}».`);
  if (count(styles, '<text:span text:style-name="MT2"><text:page-count>7</text:page-count></text:span>') !== 2) blockers.push("Memoria: el denominador de pie no está materializado como contador dinámico de páginas en las dos páginas maestras aplicables.");
  if (structuralStyleFingerprint(entries) !== sourceStructuralStyle) blockers.push("Memoria: se alteraron definiciones tipográficas/estilos estructurales fuera del contenido de pie permitido.");
  return { ready: blockers.length === 0, blockers } as const;
}

function auditPpt(entries: readonly OdtZipEntry[], sourceStructuralStyle: string) {
  const text = visibleText(part(entries, "content.xml")); const styles = part(entries, "styles.xml"); const blockers: string[] = [];
  if (text.includes("no exhaustivo ni limitativo")) blockers.push("PPT: persiste la formulación de catálogo abierto no exhaustivo ni limitativo.");
  if (!text.includes("La relación de referencias delimita los artículos objeto del suministro")) blockers.push("PPT: falta la regla explícita de catálogo cerrado.");
  if (!text.includes("El plazo de duración será de un máximo de 24 meses")) blockers.push("PPT: falta la duración inicial validada de 24 meses.");
  if (!text.includes("duración máxima conjunta de 24 meses")) blockers.push("PPT: falta la prórroga máxima conjunta validada de 24 meses.");
  if (!part(entries, "content.xml").includes('table:name="ContrataIA_Catalogo98"')) blockers.push("PPT: el catálogo canónico no está materializado como tabla editable ODF.");
  if (count(styles, `<text:page-count>${PPT_AUDITED_PAGE_COUNT_CACHE}</text:page-count>`) !== 1) blockers.push("PPT: el contador de páginas no conserva el valor cacheado auditado tras materializar la tabla editable.");
  if (structuralStyleFingerprint(entries) !== sourceStructuralStyle) blockers.push("PPT: se alteraron definiciones tipográficas/estilos estructurales fuera del contador de páginas permitido.");
  const missingDescriptions = FERRETERIA_CANONICAL_CATALOG_98.filter(item => !text.includes(item.description));
  if (missingDescriptions.length) blockers.push(`PPT: faltan ${missingDescriptions.length} de las 98 referencias canónicas (primera: ${missingDescriptions[0]?.sequence}).`);
  for (const total of ["10.552,44 €", "2.216,01 €", "12.768,45 €"]) if (!text.includes(total)) blockers.push(`PPT: falta total agregado declarado ${total}.`);
  return { ready: blockers.length === 0, blockers, catalogueRowsVerified: FERRETERIA_CANONICAL_CATALOG_98.length - missingDescriptions.length } as const;
}

export async function renderFerreteriaProtectedMemory(store: UniversalEditableTemplateBinaryStore): Promise<ProtectedCaseDocumentRender> {
  const source = await store.get(FERRETERIA_MEMORY_TEMPLATE_ID); if (!source) throw new Error("Memoria: no están disponibles los bytes exactos V12 en runtime.");
  let entries = assertSource(source, FERRETERIA_MEMORY_TEMPLATE_ID, MEMORY_SOURCE_SHA, MEMORY_SOURCE_STYLE); const sourceStructuralStyle = structuralStyleFingerprint(entries); let content = part(entries, "content.xml");
  content = replaceParagraph(content, "Las especificaciones técnicas y la relación detallada de los artículos figuran", MEMORY_CATALOGUE_PARAGRAPH);
  content = replaceParagraph(content, "Valor Estimado del Contrato:", MEMORY_VE_PARAGRAPH);
  content = replaceNamedTable(content, "Tabla5", MEMORY_VE_TABLE);
  content = replaceParagraphSequence(content, "Método de cálculo:", "Aumento del consumo estimado de los bienes a suministrar", MEMORY_VE_METHOD);
  content = replaceParagraph(content, "Se propone la tramitación por la vía del Procedimiento Abierto Simplificado Abreviado", MEMORY_PROCEDURE_PARAGRAPH);
  content = replaceParagraph(content, "Esta medida legal facilita la concurrencia competitiva", MEMORY_QUALIFICATION_PARAGRAPH);
  entries = replacePart(entries, "content.xml", content); let styles = part(entries, "styles.xml"); const footerToken = '<text:span text:style-name="MT2">7</text:span>';
  if (count(styles, footerToken) !== 2) throw new Error("Memoria: el anclaje de denominador de pie V12 no aparece exactamente dos veces.");
  styles = styles.split(footerToken).join('<text:span text:style-name="MT2"><text:page-count>7</text:page-count></text:span>');
  entries = replacePart(entries, "styles.xml", styles);
  const audit = auditMemory(entries, sourceStructuralStyle); const bytes = writeOdtZip(entries);
  return { kind: "MEMORIA", fileName: "CONTR-2026-240267_Memoria_Justificativa_V14_Protegida_Contrata-IA.odt", bytes, sourceSha256: MEMORY_SOURCE_SHA, renderedSha256: hash(bytes), sourceStyleFingerprint: MEMORY_SOURCE_STYLE, renderedStyleFingerprint: computeOdtStyleFingerprint(entries), auditReady: audit.ready, auditBlockers: audit.blockers, appliedPhysicalBindings: FERRETERIA_MEMORY_PHYSICAL_BINDING_INVENTORY.map(item => item.id) };
}

export async function renderFerreteriaProtectedPpt(store: UniversalEditableTemplateBinaryStore): Promise<ProtectedCaseDocumentRender> {
  const source = await store.get(FERRETERIA_PPT_TEMPLATE_ID); if (!source) throw new Error("PPT: no están disponibles los bytes exactos V6 en runtime.");
  let entries = assertSource(source, FERRETERIA_PPT_TEMPLATE_ID, PPT_SOURCE_SHA, PPT_SOURCE_STYLE); const sourceStructuralStyle = structuralStyleFingerprint(entries); let content = part(entries, "content.xml");
  content = replaceParagraph(content, "El listado de productos y sus cantidades estimadas tienen carácter meramente orientativo, no exhaustivo ni limitativo", PPT_SCOPE_PARAGRAPH);
  content = replacePptImageCatalogue(content);
  entries = replacePart(entries, "content.xml", content);
  let styles = part(entries, "styles.xml");
  styles = replaceUnique(styles, "<text:page-count>7</text:page-count>", `<text:page-count>${PPT_AUDITED_PAGE_COUNT_CACHE}</text:page-count>`, "PPT contador de páginas");
  entries = replacePart(entries, "styles.xml", styles);
  const audit = auditPpt(entries, sourceStructuralStyle); const renderedStyle = computeOdtStyleFingerprint(entries); const bytes = writeOdtZip(entries);
  return { kind: "PPT", fileName: "CONTR-2026-240267_PPT_V7_Protegido_Contrata-IA.odt", bytes, sourceSha256: PPT_SOURCE_SHA, renderedSha256: hash(bytes), sourceStyleFingerprint: PPT_SOURCE_STYLE, renderedStyleFingerprint: renderedStyle, auditReady: audit.ready, auditBlockers: audit.blockers, appliedPhysicalBindings: FERRETERIA_PPT_PHYSICAL_BINDING_INVENTORY.map(item => item.id) };
}

export function evaluateFerreteriaProtectedRendererPhysicalClosure() {
  const memoryIds = new Set(FERRETERIA_MEMORY_PHYSICAL_BINDING_INVENTORY.map(item => item.id)); const pptIds = new Set(FERRETERIA_PPT_PHYSICAL_BINDING_INVENTORY.map(item => item.id)); const blockers: string[] = [];
  if (memoryIds.size !== FERRETERIA_MEMORY_PHYSICAL_BINDING_INVENTORY.length) blockers.push("Memoria: inventario físico contiene bindings duplicados.");
  if (pptIds.size !== FERRETERIA_PPT_PHYSICAL_BINDING_INVENTORY.length) blockers.push("PPT: inventario físico contiene bindings duplicados.");
  if (FERRETERIA_CANONICAL_CATALOG_98.length !== 98) blockers.push("PPT: catálogo canónico no contiene 98 referencias.");
  return { ready: blockers.length === 0, blockers, memoryBindings: memoryIds.size, pptBindings: pptIds.size } as const;
}
