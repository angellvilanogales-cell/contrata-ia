export type MixedComponentContractType="SUPPLY"|"SERVICE"|"WORKS"|"CONCESSION";
export interface MixedQualificationComponent{id:string;contractType:MixedComponentContractType;estimatedValueExVatCents:number|null;functionallyLinked:boolean;complementaryRelationship:boolean;}
export interface MixedQualificationInput{
  components:readonly MixedQualificationComponent[];
  declaredPrincipalContractType:MixedComponentContractType|null;
  objectivelySeparable:boolean|null;
  singleContractChosen:boolean|null;
  nonConcessionThresholdExceeded:boolean|null;
  effectsRegimeSeparatedByComponent:boolean;
  worksElementValueCents:number|null;
  worksProjectAvailable:boolean;
  concessionViabilityStudyAvailable:boolean;
  concessionAnteprojectResolved:boolean|null;
}
export interface MixedQualificationResult{
  ready:boolean;
  mixedNatureReady:boolean;
  governingAwardRegime:MixedComponentContractType|null;
  principalContractType:MixedComponentContractType|null;
  projectRequired:boolean;
  concessionViabilityRequired:boolean;
  blockers:readonly string[];
  warnings:readonly string[];
  legalBasis:readonly string[];
  humanValidationRequired:true;
}
function validMoney(value:number|null){return value===null||(Number.isSafeInteger(value)&&value>=0);}

/** Gate conservador de los arts. 18, 34.2 y 122.2 LCSP. No crea una prestación principal si la ley exige juicio material o falta evidencia. */
export function evaluateMixedQualification(input:MixedQualificationInput):MixedQualificationResult{
  const blockers:string[]=[];const warnings:string[]=[];
  if(input.components.length<2)blockers.push("El contrato mixto exige al menos dos prestaciones diferenciadas.");
  const types=new Set(input.components.map(c=>c.contractType));
  if(types.size<2)blockers.push("Las prestaciones pertenecen a una sola clase contractual y no acreditan naturaleza mixta.");
  for(const c of input.components){
    if(!c.id.trim())blockers.push("Cada prestación mixta debe tener identificador trazable.");
    if(!validMoney(c.estimatedValueExVatCents))throw new Error("El valor estimado de cada prestación debe ser entero no negativo o null.");
    if(!c.functionallyLinked||!c.complementaryRelationship)blockers.push(`La prestación ${c.id} (${c.contractType}) no consta directamente vinculada y complementaria al objeto conjunto conforme al art. 34.2 LCSP.`);
  }
  const hasConcession=types.has("CONCESSION");const hasWorks=types.has("WORKS");
  let principal=input.declaredPrincipalContractType;let governing:MixedComponentContractType|null=null;

  const onlySupplyService=types.size===2&&types.has("SUPPLY")&&types.has("SERVICE");
  if(onlySupplyService){
    const supply=input.components.filter(c=>c.contractType==="SUPPLY").reduce((a,c)=>c.estimatedValueExVatCents===null?NaN:a+c.estimatedValueExVatCents,0);
    const service=input.components.filter(c=>c.contractType==="SERVICE").reduce((a,c)=>c.estimatedValueExVatCents===null?NaN:a+c.estimatedValueExVatCents,0);
    if(Number.isNaN(supply)||Number.isNaN(service))blockers.push("Faltan valores estimados separados de suministro y servicio para aplicar el art. 18.1.a LCSP.");
    else if(supply===service)blockers.push("Los valores estimados de suministro y servicio son iguales; no puede determinarse automáticamente el objeto principal.");
    else{
      const derived:MixedComponentContractType=supply>service?"SUPPLY":"SERVICE";
      if(principal&&principal!==derived)blockers.push(`La prestación principal declarada (${principal}) contradice el mayor valor estimado (${derived}) exigido por el art. 18.1.a LCSP.`);
      else principal=derived;
      governing=derived;
    }
  }else if(!hasConcession){
    if(!principal)blockers.push("Debe determinarse y validarse el carácter de la prestación principal; fuera del mixto suministro-servicio el sistema no la deriva solo por valor.");
    else if(!types.has(principal))blockers.push("La prestación principal declarada no pertenece a las prestaciones que integran el contrato.");
    else governing=principal;
  }

  if(hasConcession){
    if(input.objectivelySeparable===null)blockers.push("Debe determinarse expresamente si las prestaciones concesionales y no concesionales son objetivamente separables (art. 18.1.b LCSP).");
    if(input.objectivelySeparable===false){
      if(!principal)blockers.push("Si las prestaciones con componente concesional no son separables debe determinarse el carácter de la prestación principal.");
      else if(!types.has(principal))blockers.push("La prestación principal declarada no pertenece al contrato mixto.");
      else governing=principal;
    }
    if(input.objectivelySeparable===true){
      if(input.singleContractChosen===null)blockers.push("Si las prestaciones son separables debe constar si se opta motivadamente por un contrato único.");
      if(input.singleContractChosen===false)blockers.push("Se ha declarado adjudicación separada: el expediente debe descomponerse en contratos independientes y no continuar por el vertical MIXED de contrato único.");
      if(input.singleContractChosen===true){
        if(input.nonConcessionThresholdExceeded===null)blockers.push("Falta resolver, con los umbrales aplicables, si las prestaciones no concesionales superan las cuantías de los arts. 20, 21 o 22 a efectos del art. 18.1.b.2º LCSP.");
        else governing=input.nonConcessionThresholdExceeded?pickNonConcessionRegime(input.components,principal,blockers):"CONCESSION";
      }
    }
    if(!input.concessionViabilityStudyAvailable)blockers.push("Todo contrato mixto con elemento concesional debe acompañarse del estudio de viabilidad correspondiente (art. 18.3 LCSP).");
    if(input.concessionAnteprojectResolved===null)blockers.push("Debe resolverse expresamente si procede anteproyecto de construcción y explotación para el elemento concesional.");
    warnings.push("La composición documental debe preservar riesgo operacional, viabilidad y especialidades de la concesión aunque el régimen de adjudicación principal sea no concesional.");
  }

  const projectRequired=hasWorks&&typeof input.worksElementValueCents==="number"&&input.worksElementValueCents>5_000_000;
  if(hasWorks&&input.worksElementValueCents===null)blockers.push("Falta valor del elemento de obra para aplicar el umbral de 50.000 € del art. 18.3 LCSP.");
  if(!validMoney(input.worksElementValueCents))throw new Error("mixed.worksElementValueCents debe ser entero no negativo o null.");
  if(projectRequired&&!input.worksProjectAvailable)blockers.push("El elemento de obra supera 50.000 € y exige proyecto tramitado conforme a los arts. 231 y siguientes (art. 18.3 LCSP).");
  if(!input.effectsRegimeSeparatedByComponent)blockers.push("El PCAP debe detallar el régimen jurídico aplicable a efectos, cumplimiento y extinción de cada prestación del contrato mixto conforme al art. 122.2 LCSP.");

  const mixedNatureReady=types.size>=2&&input.components.every(c=>c.functionallyLinked&&c.complementaryRelationship);
  return{ready:blockers.length===0&&governing!==null,mixedNatureReady,governingAwardRegime:governing,principalContractType:principal,projectRequired,concessionViabilityRequired:hasConcession,blockers:[...new Set(blockers)],warnings,legalBasis:["arts. 18, 34.2 y 122.2 LCSP"],humanValidationRequired:true};
}

function pickNonConcessionRegime(components:readonly MixedQualificationComponent[],declared:MixedComponentContractType|null,blockers:string[]):MixedComponentContractType|null{
  const non=components.filter(c=>c.contractType!=="CONCESSION");const types=new Set(non.map(c=>c.contractType));
  if(types.size===1)return non[0]?.contractType??null;
  if(types.size===2&&types.has("SUPPLY")&&types.has("SERVICE")){
    const s=non.filter(c=>c.contractType==="SUPPLY");const v=non.filter(c=>c.contractType==="SERVICE");
    if(s.some(c=>c.estimatedValueExVatCents===null)||v.some(c=>c.estimatedValueExVatCents===null)){blockers.push("Faltan valores separados para determinar el régimen no concesional principal.");return null;}
    const sv=s.reduce((a,c)=>a+(c.estimatedValueExVatCents??0),0);const vv=v.reduce((a,c)=>a+(c.estimatedValueExVatCents??0),0);
    if(sv===vv){blockers.push("Empate de valores entre suministro y servicio dentro de la parte no concesional.");return null;}
    return sv>vv?"SUPPLY":"SERVICE";
  }
  if(!declared||declared==="CONCESSION"||!types.has(declared)){blockers.push("La parte no concesional contiene varias clases y requiere determinación validada de su prestación principal.");return null;}
  return declared;
}
