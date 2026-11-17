import { describe, expect, it } from "vitest";
import { evaluateWorksPreparationGate } from "../src/application/intake/lb97/WorksPreparationGate";
import { evaluateWorksProjectContent } from "../src/application/intake/lb97/WorksProjectContentGate";
import { evaluateWorksConcessionPreparation } from "../src/application/intake/lb98/WorksConcessionPreparationGate";
import { LB98_CONCESSION_REAL_CASES } from "../src/application/intake/lb98/ConcessionPhysicalBaseline";

function project(){return evaluateWorksProjectContent({baseTenderBudgetExVatCents:80_000_000,workCategory:"FIRST_ESTABLISHMENT",memory:true,plans:true,technicalSpecifications:true,budgetMeasurementsAndPrices:true,worksProgramme:true,replanteoReferences:true,healthAndSafetyStudy:true,otherLegallyRequiredDocuments:true});}
function prep(){return evaluateWorksPreparationGate({projectExists:true,projectApproved:true,baseTenderBudgetExVatCents:80_000_000,affectsStabilitySafetyOrWatertightness:true,supervisionReportAvailable:true,replanteoCompleted:true,terrainAvailabilityAccredited:true});}

describe("LB98 preparación Works Concession",()=>{
  it("registra Málaga como autoridad real de viabilidad/proyecto pero no como plantilla general",()=>{
    const malaga=LB98_CONCESSION_REAL_CASES.find(x=>x.subtype==="WORKS_CONCESSION");
    expect(malaga).toBeTruthy();
    expect(malaga?.hasViabilityStudy).toBe(true);
    expect(malaga?.viabilityApproved).toBe(true);
    expect(malaga?.hasProjectDocumentation).toBe(true);
    expect(malaga?.generalizable).toBe(false);
    expect(malaga?.editableBinaryVerified).toBe(false);
  });

  it("bloquea mientras no se resuelva si procede anteproyecto",()=>{
    const result=evaluateWorksConcessionPreparation({viabilityStudyApproved:true,viabilityContentComplete:true,administrationFullyDefinesWorks:true,anteprojectRequired:null,anteprojectAvailable:false,anteprojectApproved:false,anteprojectPublicInformationCompleted:false,projectAvailable:true,projectContent:project(),worksPreparation:prep(),financialEvaluationOfficeReportApplicable:false,financialEvaluationOfficeReportAvailable:false});
    expect(result.ready).toBe(false);
    expect(result.blockers.join(" ")).toContain("anteproyecto");
  });

  it("bloquea informe financiero si su aplicabilidad sigue sin resolver",()=>{
    const result=evaluateWorksConcessionPreparation({viabilityStudyApproved:true,viabilityContentComplete:true,administrationFullyDefinesWorks:true,anteprojectRequired:false,anteprojectAvailable:false,anteprojectApproved:false,anteprojectPublicInformationCompleted:false,projectAvailable:true,projectContent:project(),worksPreparation:prep(),financialEvaluationOfficeReportApplicable:null,financialEvaluationOfficeReportAvailable:false});
    expect(result.ready).toBe(false);
    expect(result.blockers.join(" ")).toContain("Oficina de Evaluación Financiera");
  });

  it("reutiliza los gates técnicos de proyecto sin convertir el PCAP Works ordinario en concesional",()=>{
    const result=evaluateWorksConcessionPreparation({viabilityStudyApproved:true,viabilityContentComplete:true,administrationFullyDefinesWorks:true,anteprojectRequired:false,anteprojectAvailable:false,anteprojectApproved:false,anteprojectPublicInformationCompleted:false,projectAvailable:true,projectContent:project(),worksPreparation:prep(),financialEvaluationOfficeReportApplicable:false,financialEvaluationOfficeReportAvailable:false});
    expect(result.ready).toBe(true);
    expect(result.projectLayerReady).toBe(true);
    expect(result.financialEvaluationLayerReady).toBe(true);
  });
});
