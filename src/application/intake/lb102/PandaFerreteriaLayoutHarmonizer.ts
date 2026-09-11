import {readOdtZip,writeOdtZip,type OdtZipEntry} from "../lb23/OdtPackageCodec";

const TARGET_FONT="Source Sans Pro";
const TARGET_FONT_SIZE="10.5pt";
const TARGET_LINE_HEIGHT="115%";
const TARGET_MARGIN="2cm";

function replaceAllLiteral(value:string,from:string,to:string){return value.split(from).join(to);}

function harmonizeStylesXml(xml:string):string{
 let out=xml;
 out=replaceAllLiteral(out,"Liberation Sans",TARGET_FONT);
 out=out.replace(/fo:font-size="7\.6pt"/g,`fo:font-size="${TARGET_FONT_SIZE}"`);
 out=out.replace(/style:font-size-asian="7\.6pt"/g,`style:font-size-asian="${TARGET_FONT_SIZE}"`);
 out=out.replace(/style:font-size-complex="7\.6pt"/g,`style:font-size-complex="${TARGET_FONT_SIZE}"`);
 out=out.replace(/fo:line-height="100%"/g,`fo:line-height="${TARGET_LINE_HEIGHT}"`);
 out=out.replace(/fo:margin-top="1\.2cm"/g,`fo:margin-top="${TARGET_MARGIN}"`);
 out=out.replace(/fo:margin-bottom="1\.2cm"/g,`fo:margin-bottom="${TARGET_MARGIN}"`);
 out=out.replace(/fo:margin-left="1\.3cm"/g,`fo:margin-left="${TARGET_MARGIN}"`);
 out=out.replace(/fo:margin-right="1\.3cm"/g,`fo:margin-right="${TARGET_MARGIN}"`);
 return out;
}

function harmonizeContentXml(xml:string):string{
 let out=xml;
 out=replaceAllLiteral(out,"Liberation Sans",TARGET_FONT);
 out=out.replace(/fo:font-size="7\.6pt"/g,`fo:font-size="${TARGET_FONT_SIZE}"`);
 out=out.replace(/style:font-size-asian="7\.6pt"/g,`style:font-size-asian="${TARGET_FONT_SIZE}"`);
 out=out.replace(/style:font-size-complex="7\.6pt"/g,`style:font-size-complex="${TARGET_FONT_SIZE}"`);
 out=out.replace(/fo:line-height="100%"/g,`fo:line-height="${TARGET_LINE_HEIGHT}"`);
 return out;
}

/**
 * Transforma únicamente la capa de presentación del ODT Panda ya acreditado.
 * No modifica el texto del expediente ni su estructura documental. El objetivo
 * es aproximar tipografía, cuerpo, interlineado y caja de página al patrón
 * institucional visible en Ferretería, manteniendo trazabilidad del binario fuente.
 */
export function harmonizePandaOdtLayout(sourceBytes:Uint8Array):Uint8Array{
 const entries=readOdtZip(sourceBytes);
 const transformed:OdtZipEntry[]=entries.map(entry=>{
  if(entry.name!=="styles.xml"&&entry.name!=="content.xml")return entry;
  const xml=Buffer.from(entry.bytes).toString("utf8");
  const next=entry.name==="styles.xml"?harmonizeStylesXml(xml):harmonizeContentXml(xml);
  return{...entry,bytes:Buffer.from(next,"utf8")};
 });
 return writeOdtZip(transformed);
}

export const PANDA_FERRETERIA_LAYOUT_POLICY={font:TARGET_FONT,fontSize:TARGET_FONT_SIZE,lineHeight:TARGET_LINE_HEIGHT,pageMargin:TARGET_MARGIN} as const;
