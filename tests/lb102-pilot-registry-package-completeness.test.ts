import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {describe,expect,it} from "vitest";
import {PilotAcceptanceRegistry} from "../src/application/operations/lb102/PilotAcceptanceRegistry";

describe("LB102 package completeness",()=>{
  it("no contabiliza ZIP parciales aunque el resultado se marque PASS",()=>{
    const dir=fs.mkdtempSync(path.join(os.tmpdir(),"lb102-reg-"));const reg=new PilotAcceptanceRegistry(path.join(dir,"pilot.jsonl"));
    reg.append({type:"CASE_RUN",timestamp:new Date().toISOString(),actorId:"reviewer-a",caseId:"REAL-1",family:"SUPPLY",sourceAuthority:"REAL_SOURCE",packageSha256:"abc",packageComplete:false,documents:["PCAP","MEMORY"],humanReviewed:true,result:"PASS"});
    expect(reg.summarize().supplyRealCaseRuns).toBe(0);
  });
  it("contabiliza solo paquete PCAP Memoria PPT completo",()=>{
    const dir=fs.mkdtempSync(path.join(os.tmpdir(),"lb102-reg-"));const reg=new PilotAcceptanceRegistry(path.join(dir,"pilot.jsonl"));
    reg.append({type:"CASE_RUN",timestamp:new Date().toISOString(),actorId:"reviewer-a",caseId:"REAL-2",family:"SERVICE",sourceAuthority:"REAL_SOURCE",packageSha256:"def",packageComplete:true,documents:["PCAP","MEMORY","PPT"],humanReviewed:true,result:"PASS"});
    const s=reg.summarize();expect(s.serviceRealCaseRuns).toBe(1);expect(s.generatedPackagesHumanReviewed).toBe(1);
  });
});
