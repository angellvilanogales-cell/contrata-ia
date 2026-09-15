export const LB111_AWARD_CRITERIA_VERSION = "LB111-AWARD-CRITERIA-V1" as const;
const LCSP = "https://www.boe.es/buscar/act.php?id=BOE-A-2017-12902";

export interface AwardCriterionInput { name: string; weight: number; kind: "COST" | "QUALITY"; evaluation: "FORMULA" | "JUDGMENT"; formulaOrMethod: string; objectLinkReason: string }
export interface AwardCriteriaInput {
  procedure: "CONTRATO_MENOR" | "ABIERTO_SIMPLIFICADO_ABREVIADO" | "ABIERTO_SIMPLIFICADO" | "ABIERTO";
  contractType: "SUPPLY" | "SERVICE";
  intellectualService: boolean;
  laborIntensiveOrSpecialService: boolean;
  technicallyImprovableOrComplex: boolean;
  criteria: readonly AwardCriterionInput[];
  singleCriterionMotivation?: string;
  abnormalityRegime: "RGLCAP_ART85_PRICE_ONLY" | "CUSTOM_OBJECTIVE_PARAMETERS";
  abnormalityParameters?: string;
  tieBreakRegime: "STATUTORY_ART147_2" | "SPECIFIC_OBJECT_LINKED";
  tieBreakCriteria?: string;
}

export interface AwardLegalBasis { id: string; article: string; paragraph: string; relevantOfficialExcerpt: string; officialUrl: string }
export interface AwardStatement { element: "AWARD_CRITERIA" | "FORMULAS" | "JUDGMENT" | "SINGLE_CRITERION" | "ABNORMALLY_LOW_TENDERS" | "TIE_BREAK"; status: "APPLIES" | "NOT_APPLICABLE"; text: string; destinations: readonly ("MEMORY" | "PCAP")[] }
export interface AwardCriteriaResult {
  version: typeof LB111_AWARD_CRITERIA_VERSION;
  normalizedCriteria: readonly { nombre: string; ponderacion: number; evaluableMedianteFormula: boolean }[];
  formulaWeight: number;
  judgmentWeight: number;
  documentaryStatements: readonly AwardStatement[];
  warnings: readonly string[];
  legalBasis: readonly AwardLegalBasis[];
  humanValidationRequired: true;
  generationBlocked: true;
  productionReady: false;
}

const basis = (id:string, article:string, paragraph:string, excerpt:string):AwardLegalBasis => ({ id, article, paragraph, relevantOfficialExcerpt:excerpt, officialUrl:`${LCSP}#a${article}` });
const LEGAL = {
  selection:basis("LCSP-145.1-2","145","1 y 2","La adjudicación utiliza una pluralidad de criterios basados en la mejor relación calidad-precio, o coste-eficacia previa justificación."),
  mandatory:basis("LCSP-145.3","145","3","En determinados contratos y prestaciones resulta obligatoria la aplicación de más de un criterio."),
  link:basis("LCSP-145.5-6","145","5 y 6","Los criterios deben formularse objetivamente, garantizar competencia efectiva y estar vinculados al objeto."),
  application:basis("LCSP-146.1-3","146","1 a 3","El criterio único debe estar relacionado con costes; las fórmulas deben justificarse y las ponderaciones constar en el pliego."),
  tie:basis("LCSP-147","147","1 y 2","El pliego puede prever desempates vinculados al objeto; en su defecto se aplica el orden social legal y finalmente sorteo."),
  abnormal:basis("LCSP-149.1-6","149","1 a 6","El pliego debe fijar parámetros objetivos de anormalidad y una oferta solo puede excluirse tras audiencia y resolución motivada."),
  asa:basis("LCSP-159.6.c","159","6.c","En el abierto simplificado abreviado la oferta se evalúa únicamente con criterios cuantificables mediante fórmulas."),
} as const;
const clean=(v:string|undefined,msg:string)=>{const x=v?.trim();if(!x)throw new Error(msg);return x;};

export function evaluateAwardCriteria(input:AwardCriteriaInput):AwardCriteriaResult {
  if(input.procedure==="CONTRATO_MENOR")return {version:LB111_AWARD_CRITERIA_VERSION,normalizedCriteria:[],formulaWeight:0,judgmentWeight:0,documentaryStatements:[
    {element:"AWARD_CRITERIA",status:"NOT_APPLICABLE",text:"No procede establecer criterios competitivos de adjudicación por tratarse de un contrato menor tramitado conforme al artículo 118 LCSP; deberá justificarse la selección de una empresa con capacidad y habilitación suficiente.",destinations:["MEMORY","PCAP"]},
    {element:"FORMULAS",status:"NOT_APPLICABLE",text:"No procede incorporar fórmulas de puntuación porque no existe comparación competitiva de ofertas en este expediente de contrato menor.",destinations:["MEMORY","PCAP"]},
    {element:"JUDGMENT",status:"NOT_APPLICABLE",text:"No existen criterios sujetos a juicio de valor en este expediente de contrato menor.",destinations:["MEMORY","PCAP"]},
    {element:"SINGLE_CRITERION",status:"NOT_APPLICABLE",text:"No procede motivar un criterio único de adjudicación porque no se configura un sistema competitivo de puntuación.",destinations:["MEMORY","PCAP"]},
    {element:"ABNORMALLY_LOW_TENDERS",status:"NOT_APPLICABLE",text:"No procede establecer parámetros de ofertas anormalmente bajas al no existir una licitación competitiva con criterios de adjudicación.",destinations:["MEMORY","PCAP"]},
    {element:"TIE_BREAK",status:"NOT_APPLICABLE",text:"No procede establecer criterios de desempate al no existir clasificación competitiva de proposiciones.",destinations:["MEMORY","PCAP"]},
  ],warnings:["La inexistencia de criterios de puntuación no elimina la justificación de necesidad, no fraccionamiento, aprobación del gasto y aptitud del contratista."],legalBasis:[LEGAL.link,LEGAL.application,LEGAL.tie,LEGAL.abnormal],humanValidationRequired:true,generationBlocked:true,productionReady:false};
  if (!Array.isArray(input.criteria)||input.criteria.length===0) throw new Error("Debe existir al menos un criterio de adjudicación.");
  let total=0, formulaWeight=0, judgmentWeight=0, costCount=0;
  const normalized=input.criteria.map((raw,index)=>{
    const name=clean(raw.name,`Criterio ${index+1}: falta la denominación.`), method=clean(raw.formulaOrMethod,`Criterio ${index+1}: falta la fórmula o método de valoración.`), link=clean(raw.objectLinkReason,`Criterio ${index+1}: falta justificar su vinculación con el objeto.`);
    if(!Number.isInteger(raw.weight)||raw.weight<=0||raw.weight>100)throw new Error(`Criterio ${index+1}: la ponderación debe ser un entero entre 1 y 100.`);
    if(raw.kind!=="COST"&&raw.kind!=="QUALITY")throw new Error(`Criterio ${index+1}: clase no admitida.`);
    if(raw.evaluation!=="FORMULA"&&raw.evaluation!=="JUDGMENT")throw new Error(`Criterio ${index+1}: método no admitido.`);
    total+=raw.weight;if(raw.evaluation==="FORMULA")formulaWeight+=raw.weight;else judgmentWeight+=raw.weight;if(raw.kind==="COST")costCount++;
    return { raw:{...raw,name,formulaOrMethod:method,objectLinkReason:link}, domain:{nombre:name,ponderacion:raw.weight,evaluableMedianteFormula:raw.evaluation==="FORMULA"} };
  });
  if(total!==100)throw new Error(`Las ponderaciones deben sumar 100 puntos; actualmente suman ${total}.`);
  if(costCount===0)throw new Error("Debe existir al menos un criterio relacionado con el precio o los costes.");
  const pluralityRequired=input.intellectualService||input.laborIntensiveOrSpecialService||input.technicallyImprovableOrComplex;
  if(pluralityRequired&&normalized.length===1)throw new Error("Las características declaradas obligan a utilizar más de un criterio de adjudicación.");
  if(input.procedure==="ABIERTO_SIMPLIFICADO_ABREVIADO"&&judgmentWeight>0)throw new Error("El abierto simplificado abreviado solo admite criterios evaluables mediante fórmulas.");
  const maxJudgment=input.intellectualService?45:25;
  if(input.procedure==="ABIERTO_SIMPLIFICADO"&&judgmentWeight>maxJudgment)throw new Error(`El juicio de valor supera el límite del ${maxJudgment} % compatible con el abierto simplificado validado.`);
  const single=normalized.length===1;
  const onlyCriterion=single?normalized[0]:undefined;
  if(onlyCriterion&&onlyCriterion.raw.kind!=="COST")throw new Error("El criterio único debe estar relacionado con los costes.");
  const singleMotivation=single?clean(input.singleCriterionMotivation,"El criterio único exige motivación específica."):"No procede motivación de criterio único porque se utiliza una pluralidad de criterios.";
  let abnormality:string;
  if(input.abnormalityRegime==="RGLCAP_ART85_PRICE_ONLY"){
    if(!onlyCriterion||onlyCriterion.raw.kind!=="COST")throw new Error("Los parámetros reglamentarios de precio único solo pueden elegirse cuando el único criterio es el precio.");
    abnormality="Se aplicarán los parámetros objetivos del artículo 85 RGLCAP para identificar ofertas incursas en presunción de anormalidad, con la tramitación contradictoria y resolución motivada del artículo 149 LCSP.";
  }else abnormality=`Parámetros objetivos de anormalidad aplicables a la oferta en su conjunto: ${clean(input.abnormalityParameters,"Deben concretarse los parámetros objetivos de anormalidad.")} Se aplicará la audiencia y resolución motivada del artículo 149 LCSP.`;
  const tie=input.tieBreakRegime==="STATUTORY_ART147_2"
    ?"No se establecen criterios específicos de desempate; se aplicará el orden de criterios sociales y, en último término, el sorteo previstos en el artículo 147.2 LCSP."
    :`Criterios específicos de desempate vinculados al objeto: ${clean(input.tieBreakCriteria,"Deben concretarse los criterios específicos de desempate.")}`;
  const criteriaText=normalized.map(x=>`${x.raw.name}: ${x.raw.weight} puntos; ${x.raw.kind==="COST"?"criterio de coste":"criterio cualitativo"}; ${x.raw.evaluation==="FORMULA"?"evaluación mediante fórmula":"evaluación mediante juicio de valor"}; método: ${x.raw.formulaOrMethod}; vinculación: ${x.raw.objectLinkReason}.`).join(" ");
  const formulas=normalized.filter(x=>x.raw.evaluation==="FORMULA");
  const judgments=normalized.filter(x=>x.raw.evaluation==="JUDGMENT");
  const statements:AwardStatement[]=[
    {element:"AWARD_CRITERIA",status:"APPLIES",text:criteriaText,destinations:["MEMORY","PCAP"]},
    {element:"FORMULAS",status:formulas.length?"APPLIES":"NOT_APPLICABLE",text:formulas.length?`Criterios automáticos (${formulaWeight} puntos): ${formulas.map(x=>`${x.raw.name}: ${x.raw.formulaOrMethod}`).join("; ")}. La elección de las fórmulas queda justificada por su medición objetiva.`:"No procede incorporar fórmulas porque no se ha validado ningún criterio automático.",destinations:["MEMORY","PCAP"]},
    {element:"JUDGMENT",status:judgments.length?"APPLIES":"NOT_APPLICABLE",text:judgments.length?`Criterios sujetos a juicio de valor (${judgmentWeight} puntos): ${judgments.map(x=>`${x.raw.name}: ${x.raw.formulaOrMethod}`).join("; ")}. Se evaluarán antes de abrir los criterios automáticos.`:"No existen criterios sujetos a juicio de valor; toda la valoración se efectúa mediante fórmulas.",destinations:["MEMORY","PCAP"]},
    {element:"SINGLE_CRITERION",status:single?"APPLIES":"NOT_APPLICABLE",text:single?`Se utiliza un único criterio relacionado con los costes. Motivación: ${singleMotivation}`:singleMotivation,destinations:["MEMORY","PCAP"]},
    {element:"ABNORMALLY_LOW_TENDERS",status:"APPLIES",text:abnormality,destinations:["MEMORY","PCAP"]},
    {element:"TIE_BREAK",status:"APPLIES",text:tie,destinations:["MEMORY","PCAP"]},
  ];
  return {version:LB111_AWARD_CRITERIA_VERSION,normalizedCriteria:normalized.map(x=>x.domain),formulaWeight,judgmentWeight,documentaryStatements:statements,warnings:["Las ponderaciones y fórmulas son decisiones del órgano de contratación: la LCSP delimita su contenido, pero no fija una distribución universal de puntos.",...(single?["La elección de criterio único debe quedar especialmente motivada frente a la regla general de pluralidad."]:[])],legalBasis:[LEGAL.selection,LEGAL.mandatory,LEGAL.link,LEGAL.application,LEGAL.tie,LEGAL.abnormal,...(input.procedure==="ABIERTO_SIMPLIFICADO_ABREVIADO"?[LEGAL.asa]:[])],humanValidationRequired:true,generationBlocked:true,productionReady:false};
}
