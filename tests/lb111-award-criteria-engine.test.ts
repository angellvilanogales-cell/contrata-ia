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
    expect(()=>evaluateAwardCriteria({...base,intellectualService:true})).toThrow(/más de un criterio/);
  });
  it("valida pluralidad, parámetros propios de anormalidad y desempate específico",()=>{
    const r=evaluateAwardCriteria({...base,procedure:"ABIERTO_SIMPLIFICADO",technicallyImprovableOrComplex:true,criteria:[{...price,weight:75},{name:"Calidad técnica",weight:25,kind:"QUALITY",evaluation:"JUDGMENT",formulaOrMethod:"Valoración por subcriterios descritos",objectLinkReason:"Afecta a la calidad de ejecución"}],singleCriterionMotivation:undefined,abnormalityRegime:"CUSTOM_OBJECTIVE_PARAMETERS",abnormalityParameters:"Umbral conjunto definido matemáticamente en el PCAP.",tieBreakRegime:"SPECIFIC_OBJECT_LINKED",tieBreakCriteria:"Medida social vinculada al personal adscrito."});
    expect(r.formulaWeight).toBe(75);expect(r.judgmentWeight).toBe(25);
    expect(r.documentaryStatements.find(x=>x.element==="SINGLE_CRITERION")).toMatchObject({status:"NOT_APPLICABLE"});
  });
  it("consigna expresamente la no aplicación en contrato menor",()=>{
    const r=evaluateAwardCriteria({...base,procedure:"CONTRATO_MENOR",criteria:[]});
    expect(r.documentaryStatements.every(x=>x.status==="NOT_APPLICABLE")).toBe(true);
    expect(r.documentaryStatements.every(x=>x.text.includes("No procede")||x.text.includes("No existen"))).toBe(true);
  });
});
