import { describe, expect, it } from "vitest";
import type { UniversalEvidenceRecord } from "../src/application/intake/lb52/UniversalEvidenceWorkspace";
import { evaluateServiceUserJourney } from "../src/application/intake/lb96/ServiceUserJourneyCoordinator";

function record(values: Record<string, unknown>): UniversalEvidenceRecord {
  return { caseId:"REG-SERVICE-LB96-001", updatedAt:new Date(0).toISOString(), fields:Object.fromEntries(Object.entries(values).map(([key,value])=>[key,{key,value,status:"HUMAN_VALIDATED",sources:[{kind:"USER_INPUT",sourceId:"test"}],humanValidationRequired:true,humanValidated:true}])) };
}
function base(extra:Record<string,unknown>={}):Record<string,unknown>{return {
  contractType:"SERVICE",need:"Necesidad acreditada","service.insufficiencyOfOwnMeansJustification":"Medios propios insuficientes acreditados.",object:"Servicio de prueba",cpvMain:"50700000-2","administrative.contractingAuthority":"Órgano", "lots.divisionIntoLots":false,"lots.noDivisionJustification":"Prestación integrada debidamente motivada.",baseTenderBudgetCents:10000000,"economic.initialVatAmountCents":2100000,"economic.initialPblVatIncludedCents":12100000,"economic.legalEstimatedValueCents":15000000,"economic.priceDeterminationRegime":"Precio global","economic.estimatedValueCalculationMethod":"PBL más prórroga","economic.fundingSource":"AUTOFINANCED","economic.priceRevisionRegime":"No procede",durationMonths:24,extensionMonths:12,procedure:"ABIERTO","criteria.awardCriteria":["Precio","Calidad"],"criteria.economicSolvency":"Proporcional","criteria.technicalSolvency":"Experiencia proporcional","service.variant":"MAINTENANCE","technical.technicalRequirements":"Mantenimiento preventivo y correctivo","technical.executionLocations":["Sevilla"],"service.personnelRequirements":"Personal técnico cualificado","service.technicalManagementSystem":"GMAO exigido","execution.specialExecutionConditions":"Condición ambiental","execution.receiptAndAcceptanceRegime":"Conformidad mensual","execution.plannedModificationRegime":"No prevista","service.subrogationRequired":false,"service.performanceControlRegime":"Indicadores mensuales",...extra};}

describe("LB96 Service user journey",()=>{
  it("mantiene Service separado de Supply y activa GMAO solo en mantenimiento",()=>{
    const result=evaluateServiceUserJourney(record(base()),false);
    const technical=result.stages.find(s=>s.id==="TECHNICAL")!;
    expect(technical.applicablePaths).toContain("service.technicalManagementSystem");
    expect(technical.applicablePaths).not.toContain("economic.unitPrices");
    expect(result.readyForFinalReview).toBe(true);
    expect(result.readyForDocuments).toBe(false);
  });
  it("exige información de subrogación solo cuando existe obligación acreditada",()=>{
    const noSub=evaluateServiceUserJourney(record(base()),false).stages.find(s=>s.id==="EXECUTION")!;
    expect(noSub.applicablePaths).not.toContain("service.subrogationInformation");
    const yesSub=evaluateServiceUserJourney(record(base({"service.subrogationRequired":true,"service.subrogationInformation":"Datos laborales conforme al art. 130 LCSP"})),false).stages.find(s=>s.id==="EXECUTION")!;
    expect(yesSub.applicablePaths).toContain("service.subrogationInformation");
  });
  it("no permite que un conflicto de lotes se resuelva automáticamente",()=>{
    const r=record(base());
    r.fields["lots.noDivisionJustification"]={...r.fields["lots.noDivisionJustification"]!,value:null,status:"SOURCE_CONFLICT",humanValidated:false,conflict:{statements:["Fuentes incompatibles"],treatment:"DO_NOT_AUTO_RESOLVE"}};
    const result=evaluateServiceUserJourney(r,false);
    expect(result.stages.find(s=>s.id==="IDENTIFICATION")?.status).toBe("BLOCKED");
    expect(result.blockers.join(" ")).toContain("conflicto de fuentes");
  });
});
