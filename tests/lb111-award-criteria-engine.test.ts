import { describe, expect, it } from "vitest";
import { evaluateAwardCriteria } from "../src/application/intake/lb111/AwardCriteriaEngine";

const price = { name:"Precio", weight:100, kind:"COST" as const, evaluation:"FORMULA" as const, formulaOrMethod:"P = 100 × oferta más baja / oferta valorada", objectLinkReason:"Valora el coste de la prestación definida" };
const base = { procedure:"ABIERTO_SIMPLIFICADO_ABREVIADO" as const, contractType:"SUPPLY" as const, intellectualService:false, laborIntensiveOrSpecialService:false, technicallyImprovableOrComplex:false, criteria:[price], singleCriterionMotivation:"Bienes corrientes completamente definidos sin mejora cualitativa útil.", abnormalityRegime:"RGLCAP_ART85_PRICE_ONLY" as const, tieBreakRegime:"STATUTORY_ART147_2" as const };

describe("LB111 · criterios de adjudicación",()=>{
  it("valida precio único motivado y genera todas las declaraciones",()=>{
    const r=evaluateAwardCriteria(base);
    expect(r.normalizedCriteria).toEqual([{nombre:"Precio",ponderacion:100,evaluableMedianteFormula:true}]);
    expect(r.documentaryStatements).toHaveLength(6);
    expect(r.documentaryStatements.every(x=>x.text.trim().length>0)).toBe(true);
    expect(r.documentaryStatements.find(x=>x.element==="JUDGMENT")).toMatchObject({status:"NOT_APPLICABLE"});
    expect(r.documentaryStatements.find(x=>x.element==="ABNORMALLY_LOW_TENDERS")?.text).toContain("artículo 85 RGLCAP");
    expect(r.documentaryStatements.find(x=>x.element==="TIE_BREAK")?.text).toContain("147.2");
  });
  it("exige suma 100, vinculación, método y criterio de coste",()=>{
    expect(()=>evaluateAwardCriteria({...base,criteria:[{...price,weight:99}]})).toThrow(/suman 99/);
    expect(()=>evaluateAwardCriteria({...base,criteria:[{...price,objectLinkReason:""}]})).toThrow(/vinculación/);
    expect(()=>evaluateAwardCriteria({...base,criteria:[{...price,kind:"QUALITY"}]})).toThrow(/costes/);
  });
  it("impide juicio de valor en ASA y precio único donde la pluralidad es obligatoria",()=>{
    expect(()=>evaluateAwardCriteria({...base,criteria:[{...price,evaluation:"JUDGMENT"}]})).toThrow(/solo admite criterios.*fórmulas/);
    expect(()=>evaluateAwardCriteria({...base,intellectualService:true})).toThrow(/51 puntos de calidad/);
  });
  it("valida pluralidad, parámetros propios de anormalidad y desempate específico",()=>{
    const r=evaluateAwardCriteria({...base,procedure:"ABIERTO_SIMPLIFICADO",technicallyImprovableOrComplex:true,criteria:[{...price,weight:75},{name:"Calidad técnica",weight:25,kind:"QUALITY",evaluation:"JUDGMENT",formulaOrMethod:"Valoración por subcriterios descritos",objectLinkReason:"Afecta a la calidad de ejecución"}],singleCriterionMotivation:undefined,abnormalityRegime:"CUSTOM_OBJECTIVE_PARAMETERS",abnormalityParameters:"Umbral conjunto definido matemáticamente en el PCAP.",tieBreakRegime:"SPECIFIC_OBJECT_LINKED",tieBreakCriteria:"Medida social vinculada al personal adscrito."});
    expect(r.formulaWeight).toBe(75);expect(r.judgmentWeight).toBe(25);
    expect(r.documentaryStatements.find(x=>x.element==="SINGLE_CRITERION")).toMatchObject({status:"NOT_APPLICABLE"});
  });
  it("impide validar un reparto inferior al 51 % de calidad para servicios del anexo IV o intelectuales",()=>{
    const mixed=[{...price,weight:70},{name:"Calidad",weight:30,kind:"QUALITY" as const,evaluation:"JUDGMENT" as const,formulaOrMethod:"Escala técnica detallada",objectLinkReason:"Calidad de ejecución"}];
    const values={...base,procedure:"ABIERTO_SIMPLIFICADO" as const,criteria:mixed,abnormalityRegime:"CUSTOM_OBJECTIVE_PARAMETERS" as const,abnormalityParameters:"Umbral objetivo de oferta definido en PCAP"};
    expect(()=>evaluateAwardCriteria({...values,annexIvService:true})).toThrow(/51 puntos de calidad/);
    expect(()=>evaluateAwardCriteria({...values,intellectualService:true})).toThrow(/51 puntos de calidad/);
    const valid=evaluateAwardCriteria({...values,annexIvService:true,intellectualService:true,criteria:[{...price,weight:49},{...mixed[1],weight:30},{...mixed[1],name:"Calidad automática",weight:21,evaluation:"FORMULA"}]});
    expect(valid.formulaWeight).toBe(70);
    expect(valid.legalBasis.some(x=>x.article==="145"&&x.paragraph==="4")).toBe(true);
  });
  it("consigna expresamente la no aplicación en contrato menor",()=>{
    const r=evaluateAwardCriteria({...base,procedure:"CONTRATO_MENOR",criteria:[]});
    expect(r.documentaryStatements.every(x=>x.status==="NOT_APPLICABLE")).toBe(true);
    expect(r.documentaryStatements.every(x=>x.text.includes("No procede")||x.text.includes("No existen"))).toBe(true);
  });
});
