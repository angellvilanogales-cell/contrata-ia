import {describe,expect,it} from "vitest";
import {LB116_PRICE_REVISION_SCRIPT} from "../src/interfaces/lb103/LB116PriceRevisionScript";

describe("LB116 · interfaz",()=>{
  it("presenta primero la propuesta negativa y oculta la excepción",()=>{
    for(const x of ['prior.status!=="HUMAN_VALIDATED"',"Propuesta del sistema: no procede","Confirmar que no procede la revisión de precios","Estudiar excepcionalmente una revisión","lb116Study","Generando la justificación de que no procede"]) expect(LB116_PRICE_REVISION_SCRIPT).toContain(x);
  });
  it("descarta los supuestos de suministro cuando el contrato es de servicios",()=>{
    for(const x of ['type==="SUPPLY"',"Opciones descartadas automáticamente","este expediente es un contrato de servicios"]) expect(LB116_PRICE_REVISION_SCRIPT).toContain(x);
  });
  it("sustituye el formato técnico por fichas de componentes e índices",()=>{
    for(const x of ["Añadir componente e índice","Componente del coste","Peso en la fórmula","Índice oficial aplicable","No utilice códigos ni separadores"]) expect(LB116_PRICE_REVISION_SCRIPT).toContain(x);
    expect(LB116_PRICE_REVISION_SCRIPT).not.toContain("componente | peso % | índice oficial");
  });
  it("persiste siete elementos, informa del progreso y registra el consentimiento",()=>{
    for(const p of ["economic.priceRevisionRegime","economic.priceRevisionJustification","economic.priceRevisionFormula","economic.priceRevisionCostStructure","economic.priceRevisionIndices","economic.priceRevisionAccrualLimits","economic.priceRevisionPhysicalProfileSupported"]) expect(LB116_PRICE_REVISION_SCRIPT).toContain(p);
    expect(LB116_PRICE_REVISION_SCRIPT).toContain("Guardando decisión");
    expect(LB116_PRICE_REVISION_SCRIPT).toContain("lb116-human-validation");
  });
});
