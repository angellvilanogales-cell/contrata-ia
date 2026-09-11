import { readOdtZip } from "../lb23/OdtPackageCodec";
import {
  CANONICAL_DOCUMENT_VISUAL_PROFILE_VERSION,
  CANONICAL_MEMORY_PPT_VISUAL_PROFILE,
  type CanonicalTextStyle,
} from "../../../domain/documentModel/CanonicalDocumentVisualProfile";

function xml(entries: ReturnType<typeof readOdtZip>, name: string): string {
  const entry = entries.find(item => item.name === name);
  return entry ? Buffer.from(entry.bytes).toString("utf8") : "";
}

function escaped(value: string): string { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function styleBlock(allXml: string, styleName: string): string {
  const name = escaped(styleName);
  return allXml.match(new RegExp(`<style:style\\b(?=[^>]*style:name="${name}")[\\s\\S]*?<\\/style:style>`))?.[0] ?? "";
}
function has(block: string, property: string, value: string | number): boolean {
  return new RegExp(`${escaped(property)}="${escaped(String(value))}"`, "i").test(block);
}

function auditTextStyle(allXml:string, role:string, expected:CanonicalTextStyle):string[]{
  const block=styleBlock(allXml,expected.styleName);if(!block)return [`Falta el estilo ${role} (${expected.styleName}).`];
  const blockers:string[]=[];
  if(!has(block,"fo:font-size",`${expected.fontSizePt}pt`))blockers.push(`${expected.styleName}: tamaño distinto de ${expected.fontSizePt}pt.`);
  if(!has(block,"fo:font-weight",expected.fontWeight))blockers.push(`${expected.styleName}: negrita/peso distinto de ${expected.fontWeight}.`);
  if(!has(block,"fo:color",expected.color))blockers.push(`${expected.styleName}: color distinto de ${expected.color}.`);
  if(!has(block,"fo:text-align",expected.alignment))blockers.push(`${expected.styleName}: alineación distinta de ${expected.alignment}.`);
  const familyOk=has(block,"style:font-name",expected.fontFamily)||has(block,"fo:font-family",expected.fontFamily);
  if(!familyOk)blockers.push(`${expected.styleName}: tipografía distinta de ${expected.fontFamily}.`);
  return blockers;
}

export function auditCanonicalOdtVisualProfile(bytes:Uint8Array){
  const entries=readOdtZip(bytes),content=xml(entries,"content.xml"),styles=xml(entries,"styles.xml"),allXml=`${styles}\n${content}`;
  const blockers:string[]=[];
  for(const [role,expected] of Object.entries(CANONICAL_MEMORY_PPT_VISUAL_PROFILE.styles))blockers.push(...auditTextStyle(allXml,role,expected));
  const bodyStyle = styleBlock(allXml, CANONICAL_MEMORY_PPT_VISUAL_PROFILE.styles.body.styleName);
  const paragraph = CANONICAL_MEMORY_PPT_VISUAL_PROFILE.paragraph;
  if (!has(bodyStyle, "fo:line-height", `${paragraph.lineHeightPercent}%`)) blockers.push("Cuerpo: interlineado distinto de 115%.");
  if (!has(bodyStyle, "fo:margin-bottom", `${paragraph.spaceAfterCm}cm`)) blockers.push("Cuerpo: separación posterior distinta de 0.18cm.");
  const layout=allXml.match(/<style:page-layout-properties\b[^>]*>/)?.[0]??"";
  const page=CANONICAL_MEMORY_PPT_VISUAL_PROFILE.page;
  for(const [property,value] of [["fo:page-width",`${page.widthCm}cm`],["fo:page-height",`${page.heightCm}cm`],["fo:margin-top",`${page.marginTopCm}cm`],["fo:margin-right",`${page.marginRightCm}cm`],["fo:margin-bottom",`${page.marginBottomCm}cm`],["fo:margin-left",`${page.marginLeftCm}cm`]] as const)if(!has(layout,property,value))blockers.push(`Página: falta ${property}=${value}.`);
  const imageHrefs=[...allXml.matchAll(/<draw:image\b[^>]*xlink:href="([^"]+)"/g)].map(match=>match[1]!);
  const imageEntries=entries.filter(item=>/^Pictures\//.test(item.name));
  if(!imageHrefs.some(href => imageEntries.some(entry => entry.name === href && entry.bytes.length > 0)))blockers.push("Falta un logotipo institucional embebido y referenciado.");
  const footer = styles.match(/<style:footer\b[^>]*>[\s\S]*?<\/style:footer>/)?.[0] ?? "";
  if(!/<text:page-number\b/.test(footer))blockers.push("El pie no contiene numeración de página automática.");
  return{ready:blockers.length===0,scope:"DECLARED_STYLES_AND_PACKAGE_REFERENCES" as const,requiresVisualReview:true as const,version:CANONICAL_DOCUMENT_VISUAL_PROFILE_VERSION,blockers,imageHrefs,embeddedImages:imageEntries.map(item=>item.name)} as const;
}

export function assertCanonicalOdtVisualProfile(bytes:Uint8Array):void{
  const audit=auditCanonicalOdtVisualProfile(bytes);if(!audit.ready)throw new Error(`Perfil visual ${audit.version} no conforme: ${audit.blockers.join(" ")}`);
}
