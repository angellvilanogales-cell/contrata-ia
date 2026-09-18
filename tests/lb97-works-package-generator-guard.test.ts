import { describe, expect, it } from "vitest";
import { generateWorksUserDocumentPackage } from "../src/application/intake/lb97/WorksUserDocumentPackageGenerator";
import type { UniversalEditableTemplateBinaryStore } from "../src/application/intake/lb23/UniversalOdtProductionRenderer";
import type { UniversalEvidenceRecord } from "../src/application/intake/lb52/UniversalEvidenceWorkspace";

describe("LB97 generador documental Works",()=>{
  it("bloquea un expediente incompleto antes de consultar plantillas físicas",async()=>{
    let storeCalls=0;
    const store:UniversalEditableTemplateBinaryStore={async get(){storeCalls+=1;return null;}};
    const record:UniversalEvidenceRecord={caseId:"REG-WORKS-INCOMPLETE-001",fields:{contractType:{key:"contractType",value:"WORKS",status:"HUMAN_VALIDATED",sources:[],humanValidationRequired:true,humanValidated:true}},updatedAt:new Date(0).toISOString()};
    const result=await generateWorksUserDocumentPackage({record,templateStore:store});
    expect(result.ready).toBe(false);
    expect(result.bytes).toBeNull();
    expect(result.blockers.length).toBeGreaterThan(5);
    expect(result.blockers.join(" ")).toContain("title");
    expect(result.blockers.join(" ")).toContain("projectSummary");
    expect(storeCalls).toBe(0);
  });
});
