export const LB112_GUARANTEES_VERSION = "LB112-GUARANTEES-V1" as const;
const LCSP="https://www.boe.es/buscar/act.php?id=BOE-A-2017-12902";
export type GuaranteeProcedure="CONTRATO_MENOR"|"ABIERTO_SIMPLIFICADO_ABREVIADO"|"ABIERTO_SIMPLIFICADO"|"ABIERTO";
export interface GuaranteesInput { procedure:GuaranteeProcedure; contractType:"SUPPLY"|"SERVICE"; provisionalRequired:boolean; provisionalPercent?:number; provisionalPublicInterestReason?:string; definitiveRegime:"ORDINARY_5"|"EXEMPT"; definitiveExemptionReason?:string; unitPriceContract:boolean; complementaryRequired:boolean; complementaryPercent?:number; complementaryRiskReason?:string; warrantyPeriodMonths:number; warrantyNotRequiredReason?:string }
export interface GuaranteeLegalBasis { id:string; article:string; paragraph:string; relevantOfficialExcerpt:string; officialUrl:string }
export interface GuaranteeStatement { element:"PROVISIONAL"|"DEFINITIVE"|"DEFINITIVE_BASE"|"COMPLEMENTARY"|"WARRANTY_PERIOD"; status:"APPLIES"|"NOT_APPLICABLE"; text:string; destinations:readonly ("MEMORY"|"PCAP"|"PPT")[] }
export interface GuaranteesResult { version:typeof LB112_GUARANTEES_VERSION; provisionalPercent:number; definitivePercent:number; complementaryPercent:number; warrantyPeriodMonths:number; documentaryStatements:readonly GuaranteeStatement[]; warnings:readonly string[]; legalBasis:readonly GuaranteeLegalBasis[]; humanValidationRequired:true; generationBlocked:true; productionReady:false }
const basis=(id:string,article:string,paragraph:string,excerpt:string):GuaranteeLegalBasis=>({id,article,paragraph,relevantOfficialExcerpt:excerpt,officialUrl:`${LCSP}#a${article}`});
const LEGAL={
 provisional:basis("LCSP-106.1-2","106","1 y 2","La garantía provisional no procede salvo excepción motivada por interés público; su máximo es el 3 % del PBL, IVA excluido."),
 definitive:basis("LCSP-107.1","107","1","La garantía definitiva ordinaria es el 5 % del precio final ofertado, IVA excluido; la exención exige justificación y no cabe en obras ni concesión de obras."),
 complementary:basis("LCSP-107.2","107","2","En casos especiales y mediante resolución motivada puede exigirse hasta otro 5 %, con un máximo total del 10 %."),
 unit:basis("LCSP-107.3","107","3","Cuando el precio se formule por precios unitarios, la garantía se fija sobre el PBL, IVA excluido."),
 asa:basis("LCSP-159.6.f","159","6.f","En el procedimiento abierto simplificado abreviado no se requiere garantía definitiva."),
 liability:basis("LCSP-110.e","110","e","La garantía definitiva responde de vicios o defectos durante el plazo de garantía previsto."),
 warranty:basis("LCSP-210.3","210","3","Debe fijarse un plazo de garantía; su ausencia solo cabe si la naturaleza o características no lo requieren, con justificación expresa en expediente y pliego."),
} as const;
const clean=(v:string|undefined,msg:string)=>{const x=v?.trim();if(!x)throw new Error(msg);return x;};
const percent=(v:number|undefined,max:number,label:string)=>{if(typeof v!=="number"||!Number.isFinite(v)||v<=0||v>max)throw new Error(`${label} debe ser superior a 0 y no exceder del ${max} %.`);return v;};

export function evaluateGuarantees(input:GuaranteesInput):GuaranteesResult {
 if(!Number.isInteger(input.warrantyPeriodMonths)||input.warrantyPeriodMonths<0)throw new Error("El plazo de garantía debe expresarse en meses mediante un entero igual o superior a cero.");
 const minor=input.procedure==="CONTRATO_MENOR", asa=input.procedure==="ABIERTO_SIMPLIFICADO_ABREVIADO";
 if((minor||asa)&&input.provisionalRequired)throw new Error("No puede exigirse garantía provisional en el procedimiento validado.");
 const provisional=input.provisionalRequired?percent(input.provisionalPercent,3,"La garantía provisional"):0;
 const provisionalReason=input.provisionalRequired?clean(input.provisionalPublicInterestReason,"La garantía provisional excepcional exige motivación concreta de interés público."):"No se exige garantía provisional: se aplica la regla general de improcedencia del artículo 106.1 LCSP.";
 if((minor||asa)&&input.definitiveRegime!=="EXEMPT")throw new Error("El procedimiento validado no requiere garantía definitiva.");
 let definitive=0, definitiveText:string;
 if(input.definitiveRegime==="ORDINARY_5") { definitive=5; definitiveText="Se exige garantía definitiva ordinaria del 5 % conforme al artículo 107.1 LCSP."; }
 else if(minor) definitiveText="No procede garantía definitiva en este contrato menor.";
 else if(asa) definitiveText="No se requiere garantía definitiva en el procedimiento abierto simplificado abreviado, conforme al artículo 159.6.f LCSP.";
 else definitiveText=`Se acuerda la exención de garantía definitiva. Motivación: ${clean(input.definitiveExemptionReason,"La exención de garantía definitiva exige motivación concreta.")}`;
 if(definitive===0&&input.complementaryRequired)throw new Error("No puede exigirse garantía complementaria sin garantía definitiva ordinaria.");
 const complementary=input.complementaryRequired?percent(input.complementaryPercent,5,"La garantía complementaria"):0;
 const complementaryText=input.complementaryRequired?`Se exige garantía complementaria del ${complementary} % por el riesgo especial siguiente: ${clean(input.complementaryRiskReason,"La garantía complementaria exige motivación concreta del riesgo especial.")} La garantía total será del ${definitive+complementary} %.`:"No procede garantía complementaria porque no se ha acreditado un riesgo especial que justifique incrementar la garantía ordinaria.";
 const warrantyReason=input.warrantyPeriodMonths===0?clean(input.warrantyNotRequiredReason,"La ausencia de plazo de garantía exige justificar por qué la naturaleza o características del contrato no lo requieren."):"";
 const baseText=definitive>0?(input.unitPriceContract?"La garantía definitiva se calculará sobre el presupuesto base de licitación, IVA excluido, por formularse el precio mediante precios unitarios.":"La garantía definitiva se calculará sobre el precio final ofertado, IVA excluido."):"No procede fijar base de cálculo de garantía definitiva porque esta no se exige.";
 const statements:GuaranteeStatement[]=[
  {element:"PROVISIONAL",status:provisional?"APPLIES":"NOT_APPLICABLE",text:provisional?`Se exige excepcionalmente garantía provisional del ${provisional} % del PBL, IVA excluido. Interés público: ${provisionalReason}`:provisionalReason,destinations:["MEMORY","PCAP"]},
  {element:"DEFINITIVE",status:definitive?"APPLIES":"NOT_APPLICABLE",text:definitiveText,destinations:["MEMORY","PCAP"]},
  {element:"DEFINITIVE_BASE",status:definitive?"APPLIES":"NOT_APPLICABLE",text:baseText,destinations:["MEMORY","PCAP"]},
  {element:"COMPLEMENTARY",status:complementary?"APPLIES":"NOT_APPLICABLE",text:complementaryText,destinations:["MEMORY","PCAP"]},
  {element:"WARRANTY_PERIOD",status:input.warrantyPeriodMonths>0?"APPLIES":"NOT_APPLICABLE",text:input.warrantyPeriodMonths>0?`Se establece un plazo de garantía de ${input.warrantyPeriodMonths} meses desde la recepción o conformidad, sin perjuicio de las garantías técnicas o legales específicas de los bienes o prestaciones.`:`No se establece plazo de garantía contractual. Justificación por la naturaleza o características de la prestación: ${warrantyReason}`,destinations:["MEMORY","PCAP","PPT"]},
 ];
 return {version:LB112_GUARANTEES_VERSION,provisionalPercent:provisional,definitivePercent:definitive,complementaryPercent:complementary,warrantyPeriodMonths:input.warrantyPeriodMonths,documentaryStatements:statements,warnings:["Garantía provisional, garantía definitiva y plazo de garantía son instituciones diferentes; el aplicativo no las sustituye unas por otras.","La garantía comercial o técnica del fabricante debe concretarse en el PPT cuando resulte aplicable y no altera por sí sola la garantía definitiva."],legalBasis:[LEGAL.provisional,LEGAL.definitive,LEGAL.complementary,...(input.unitPriceContract?[LEGAL.unit]:[]),...(asa?[LEGAL.asa]:[]),LEGAL.liability,LEGAL.warranty],humanValidationRequired:true,generationBlocked:true,productionReady:false};
}
