import { createHash } from "node:crypto";
import { readOdtZip, writeOdtZip, type OdtZipEntry } from "../lb23/OdtPackageCodec";
import { computeOdtStyleFingerprint } from "../lb23/UniversalOdtProductionRenderer";
import { auditJdaSupplyAsaRenderedOdt } from "../lb35/JuntaSupplyAsaAnexoIResidualAudit";

export type SupplyAsaResidualControl = "TEXT" | "YES_NO";
export interface SupplyAsaResidualDecisionDefinition { id:string; label:string; control:SupplyAsaResidualControl; pattern:RegExp; }

/** Ordered exactly as the authority-owned residual fields occur in the official Annex I. */
export const SUPPLY_ASA_ANNEX_I_RESIDUAL_DECISIONS: readonly SupplyAsaResidualDecisionDefinition[] = [
  {id:"objectSpecification",label:"Especificaciones adicionales del objeto",control:"TEXT",pattern:/^Especificaciones del objeto del contrato\s*:\s*$/i},
  {id:"totalUnits",label:"Número total de unidades",control:"TEXT",pattern:/^Total:\s*_{3,}\s*unidades/i},
  {id:"totalAmount",label:"Importe total asociado a las unidades (euros)",control:"TEXT",pattern:/^Total:\s*_{3,}\s*euros/i},
  {id:"lotsDescription",label:"Descripción de los lotes o indicación de que no procede",control:"TEXT",pattern:/^Descripción de los lotes\s*:/i},
  {id:"lot1",label:"Descripción del lote 1 o No procede",control:"TEXT",pattern:/^LOTE\s+1\./i},
  {id:"lot2",label:"Descripción del lote 2 o No procede",control:"TEXT",pattern:/^LOTE\s+2\./i},
  {id:"maxOfferableLots",label:"Máximo de lotes a los que se puede ofertar",control:"TEXT",pattern:/^Número máximo de lotes para los que/i},
  {id:"maxAwardableLots",label:"Máximo de lotes adjudicables",control:"TEXT",pattern:/^Número máximo de lotes que pueden adjudicarse/i},
  {id:"integrativeOffer",label:"Oferta integradora",control:"YES_NO",pattern:/^Oferta integradora:/i},
  {id:"reservedScope",label:"Ámbito de la reserva o No procede",control:"TEXT",pattern:/^En caso afirmativo, indicar el ámbito de la reserva:/i},
  {id:"priceRevisionComponents",label:"Componentes e índices de revisión o No procede",control:"TEXT",pattern:/^En caso afirmativo, indicar el peso de cada materia prima/i},
  {id:"priceVariation",label:"Variación de precios por objetivos",control:"YES_NO",pattern:/^Variación de precios en función/i},
  {id:"partialDeadlines",label:"Plazos parciales o No procede",control:"TEXT",pattern:/^Plazos parciales \(en meses\):/i},
  {id:"contractingAuthority",label:"Órgano de contratación",control:"TEXT",pattern:/^Órgano de contratación:/i},
  {id:"bindingClarifications",label:"Respuestas vinculantes sobre aclaraciones",control:"YES_NO",pattern:/^Respuestas vinculantes sobre la aclaración/i},
  {id:"procurementBoard",label:"Constitución de mesa de contratación",control:"YES_NO",pattern:/^Constitución de mesa de contratación:/i},
  {id:"withdrawalCompensation",label:"Compensación por renuncia (euros)",control:"TEXT",pattern:/^En caso de renuncia:/i},
  {id:"desistanceCompensation",label:"Compensación por desistimiento (euros)",control:"TEXT",pattern:/^En caso de desistimiento:/i},
  {id:"article129Bodies",label:"Organismos de información del artículo 129.1 LCSP",control:"TEXT",pattern:/^Organismos de los que las personas licitadoras/i},
  {id:"professionalAuthorization",label:"Habilitación empresarial o profesional",control:"YES_NO",pattern:/^Se exige habilitación empresarial o profesional:/i},
  {id:"professionalAuthorizationDetail",label:"Detalle de habilitación o No procede",control:"TEXT",pattern:/^En caso afirmativo, especificar:/i},
  {id:"ensRequirements",label:"Requisitos adicionales ENS o No procede",control:"TEXT",pattern:/^Otros requisitos necesarios.*ENS/i},
  {id:"organizationRequirementsDetail",label:"Requisitos de organización o No procede",control:"TEXT",pattern:/^En caso afirmativo, especificar:/i},
  {id:"specialConditionPenalties",label:"Penalidades por condiciones especiales",control:"YES_NO",pattern:/^Penalidades por incumplimiento de las condiciones especiales/i},
  {id:"specialConditionPenaltiesDetail",label:"Detalle de penalidades por condiciones especiales",control:"TEXT",pattern:/^En caso afirmativo, indicar las penalidades conforme/i},
  {id:"criticalPartsDetail",label:"Tareas críticas de ejecución directa o No procede",control:"TEXT",pattern:/^En caso afirmativo, indicar dichas partes o trabajos:/i},
  {id:"subcontractDocumentationPenalty",label:"Penalidad documental de subcontratación o No procede",control:"TEXT",pattern:/^En caso afirmativo, especificar las penalidades.*217\.1/i},
  {id:"delayPenalty",label:"Penalidades especiales por demora",control:"YES_NO",pattern:/^Penalidades por demora en la ejecución/i},
  {id:"delayPenaltyDetail",label:"Detalle de penalidades por demora o No procede",control:"TEXT",pattern:/^En caso afirmativo, especificar:/i},
  {id:"defectivePerformancePenalty",label:"Penalidades por cumplimiento defectuoso",control:"YES_NO",pattern:/^Penalidades por cumplimiento defectuoso:/i},
  {id:"defectivePerformanceDetail",label:"Detalle de cumplimiento defectuoso o No procede",control:"TEXT",pattern:/^En caso afirmativo, especificar:/i},
  {id:"partialPerformancePenalty",label:"Penalidades por incumplimiento parcial",control:"YES_NO",pattern:/^Penalidades por incumplimiento parcial/i},
  {id:"partialPerformanceDetail",label:"Detalle de incumplimiento parcial o No procede",control:"TEXT",pattern:/^En caso afirmativo, especificar:/i},
  {id:"environmentalSocialPenalty",label:"Penalidades medioambientales, sociales o laborales",control:"YES_NO",pattern:/^Penalidades por incumplimiento de las obligaciones en materia/i},
  {id:"environmentalSocialDetail",label:"Detalle de penalidades medioambientales/sociales o No procede",control:"TEXT",pattern:/^En caso afirmativo, especificar:/i},
  {id:"warrantyTerm",label:"Plazo de garantía",control:"TEXT",pattern:/^Plazo de garantía:/i},
  {id:"workProgramme",label:"Programa de trabajo",control:"YES_NO",pattern:/^Programa de trabajo:/i},
  {id:"confidentialInformation",label:"Información declarada confidencial",control:"TEXT",pattern:/^Información a la que se le atribuye carácter confidencial:/i},
  {id:"confidentialityTerm",label:"Plazo del deber de confidencialidad",control:"TEXT",pattern:/^Plazo durante el que.*confidencialidad/i},
  {id:"insuranceRequired",label:"Seguro específico exigido",control:"YES_NO",pattern:/^Obligación de tener suscrito seguro/i},
  {id:"insuranceTerms",label:"Términos del seguro o No procede",control:"TEXT",pattern:/^En su caso, términos del seguro:/i},
  {id:"assignmentAllowed",label:"Cesión del contrato",control:"YES_NO",pattern:/^Cesión del contrato:/i},
  {id:"suspensionSpecialRules",label:"Reglas especiales de suspensión",control:"YES_NO",pattern:/^En el supuesto de suspensión del contrato/i},
  {id:"suspensionSpecialRulesDetail",label:"Detalle de reglas de suspensión o No procede",control:"TEXT",pattern:/^En caso afirmativo, las reglas a aplicar/i},
  {id:"personalDataTreatment",label:"Tratamiento de datos por cuenta del responsable",control:"YES_NO",pattern:/^La ejecución del contrato requiere el tratamiento/i},
] as const;

export type SupplyAsaAnnexIResidualDecisionValues = Readonly<Record<string,string>>;

export function assertSupplyAsaAnnexIResidualDecisions(value:unknown): asserts value is SupplyAsaAnnexIResidualDecisionValues {
  if(!value||typeof value!=="object"||Array.isArray(value))throw new Error("La cumplimentación residual del Anexo I debe ser una estructura de decisiones.");
  const row=value as Record<string,unknown>;const expected=new Set(SUPPLY_ASA_ANNEX_I_RESIDUAL_DECISIONS.map(item=>item.id));
  const unexpected=Object.keys(row).filter(key=>!expected.has(key));if(unexpected.length)throw new Error(`Decisiones residuales no reconocidas: ${unexpected.join(", ")}.`);
  for(const definition of SUPPLY_ASA_ANNEX_I_RESIDUAL_DECISIONS){const current=row[definition.id];if(typeof current!=="string"||!current.trim())throw new Error(`${definition.label}: falta decisión.`);if(/_{3,}|Sí\s*\/\s*No/i.test(current))throw new Error(`${definition.label}: contiene un valor sin resolver.`);if(definition.control==="YES_NO"&&!/^(?:Sí|Si|No)$/i.test(current.trim()))throw new Error(`${definition.label}: seleccione Sí o No.`);}
}

interface ParagraphSpan{xml:string;start:number;end:number;}
function visible(xml:string){return xml.replace(/<text:tab[^>]*\/>/g,"\t").replace(/<text:s(?:\s+text:c="(\d+)")?\s*\/>/g,(_m,count:string|undefined)=>" ".repeat(Number(count??1))).replace(/<[^>]+>/g,"").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&apos;/g,"'");}
function xmlEscape(value:string){return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&apos;");}
function topLevelParagraphs(content:string):ParagraphSpan[]{const spans:ParagraphSpan[]=[];let cursor=0;while(cursor<content.length){const start=content.indexOf("<text:p",cursor);if(start<0)break;const openEnd=content.indexOf(">",start);if(openEnd<0)break;if(/\/\s*>$/.test(content.slice(start,openEnd+1))){cursor=openEnd+1;continue;}let depth=1,scan=openEnd+1;while(depth>0){const nextOpen=content.indexOf("<text:p",scan),nextClose=content.indexOf("</text:p>",scan);if(nextClose<0)throw new Error("ODT inválido: párrafo sin cierre.");if(nextOpen>=0&&nextOpen<nextClose){const nestedEnd=content.indexOf(">",nextOpen);if(nestedEnd<0)throw new Error("ODT inválido: apertura incompleta.");if(!/\/\s*>$/.test(content.slice(nextOpen,nestedEnd+1)))depth+=1;scan=nestedEnd+1;}else{depth-=1;scan=nextClose+"</text:p>".length;}}spans.push({xml:content.slice(start,scan),start,end:scan});cursor=scan;}return spans;}
function annexStart(content:string,roman:string){const matches=topLevelParagraphs(content).filter(item=>visible(item.xml).trim()===`ANEXO ${roman}`);if(!matches.length)throw new Error(`No se localiza ANEXO ${roman}.`);return matches[matches.length-1]!.start;}
function materialize(xml:string,current:string,value:string){const escaped=xmlEscape(value.trim());if(/Sí\s*\/\s*No/i.test(current)){const direct=xml.replace(/Sí\s*\/\s*No/i,escaped);if(direct!==xml)return direct;const open=xml.indexOf(">");return `${xml.slice(0,open+1)}${xmlEscape(current.replace(/Sí\s*\/\s*No/i,value.trim()))}</text:p>`;}const blank=xml.match(/_{3,}/)?.[0];if(blank)return xml.replace(blank,escaped);const close=xml.lastIndexOf("</text:p>");if(close<0)throw new Error("Párrafo ODF sin cierre.");return `${xml.slice(0,close)} ${escaped}${xml.slice(close)}`;}
function replaceContent(entries:readonly OdtZipEntry[],content:string){return entries.map(item=>item.name==="content.xml"?{...item,bytes:Buffer.from(content,"utf8")}:item);}

export function completeSupplyAsaAnnexIResidualFields(bytes:Uint8Array,value:unknown){
  assertSupplyAsaAnnexIResidualDecisions(value);let entries=readOdtZip(bytes);const style=computeOdtStyleFingerprint(entries);const contentEntry=entries.find(item=>item.name==="content.xml");if(!contentEntry)throw new Error("ODT inválido: falta content.xml.");let content=Buffer.from(contentEntry.bytes).toString("utf8");let cursor=annexStart(content,"I");
  for(const definition of SUPPLY_ASA_ANNEX_I_RESIDUAL_DECISIONS){const end=annexStart(content,"II");const section=content.slice(cursor,end);const found=topLevelParagraphs(section).find(item=>definition.pattern.test(visible(item.xml).trim())&&/(?:Sí\s*\/\s*No|_{3,}|:\s*$)/i.test(visible(item.xml).trim()));if(!found)throw new Error(`No se localiza de forma ordenada el campo residual ${definition.id}.`);const start=cursor+found.start;const next=materialize(found.xml,visible(found.xml).trim(),value[definition.id]!);content=content.slice(0,start)+next+content.slice(start+found.xml.length);cursor=start+next.length;}
  entries=replaceContent(entries,content);if(computeOdtStyleFingerprint(entries)!==style)throw new Error("La cumplimentación residual alteró la huella de estilos.");const completed=writeOdtZip(entries);const audit=auditJdaSupplyAsaRenderedOdt(completed);return{bytes:completed,sha256:createHash("sha256").update(completed).digest("hex"),auditReady:audit.ready,blockers:audit.blockers};
}
