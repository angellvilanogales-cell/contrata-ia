import { describe, expect, it } from "vitest";
import { evaluateWorksProjectContent } from "../src/application/intake/lb97/WorksProjectContentGate";

describe("LB97 contenido del proyecto de obras",()=>{
  const full={baseTenderBudgetExVatCents:60_000_000,workCategory:"REFORM" as const,memory:true,plans:true,technicalSpecifications:true,budgetMeasurementsAndPrices:true,worksProgramme:true,replanteoReferences:true,healthAndSafetyStudy:true,otherLegallyRequiredDocuments:true};
  it("acepta el contenido mínimo completo del artículo 233",()=>{const r=evaluateWorksProjectContent(full);expect(r.complete).toBe(true);expect(r.blockers).toEqual([]);});
  it("no suprime automáticamente documentos por estar debajo de 500.000 euros",()=>{const r=evaluateWorksProjectContent({...full,baseTenderBudgetExVatCents:40_000_000,memory:false});expect(r.simplificationPotentiallyAvailable).toBe(true);expect(r.simplificationApplied).toBe(false);expect(r.complete).toBe(false);});
  it("solo aplica simplificación cuando existe motivación expresa y supuesto habilitante",()=>{const r=evaluateWorksProjectContent({...full,baseTenderBudgetExVatCents:40_000_000,memory:false,plans:false,simplifiedProjectExpresslyMotivated:true});expect(r.simplificationApplied).toBe(true);expect(r.complete).toBe(true);});
  it("rechaza la simplificación si el presupuesto no permite el supuesto",()=>{const r=evaluateWorksProjectContent({...full,memory:false,simplifiedProjectExpresslyMotivated:true});expect(r.complete).toBe(false);expect(r.blockers.join(" ")).toContain("sin quedar acreditado");});
});
