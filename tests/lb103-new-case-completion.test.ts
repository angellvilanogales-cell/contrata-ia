import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { describe, expect, it, vi } from "vitest";
import { AdaptiveCaseStore } from "../src/infrastructure/operations/lb7/AdaptiveCaseStore";
import { UniversalEvidenceCaseService } from "../src/application/intake/lb53/UniversalEvidenceCaseService";
import { evaluateLB103ServerValidatedPreflight } from "../src/application/universal/LB103ServerValidatedPreflight";
import { generateLB103AuthoritativeSupplyPackage } from "../src/application/universal/LB103AuthoritativeSupplyGeneration";
import { selectedLB103TemplateStore } from "../src/application/universal/LB103SelectedTemplateStore";
import { NEW_SUPPLY_VALUES } from "../src/application/universal/LB103SyntheticNewCaseFixture";
import { evaluateLB103DocumentCompletion } from "../src/application/universal/LB103DocumentCompletion";
import { LB103_AUTHORITATIVE_GENERATION_SCRIPT } from "../src/interfaces/lb103/LB103AuthoritativeGenerationScript";
import { runLB103NewCaseSelfTest } from "../src/application/universal/LB103NewCaseSelfTest";
import { assertSupplyAsaAnnexIResidualDecisions } from "../src/application/intake/lb95/SupplyAsaAnnexIResidualCompletion";

describe("LB103 nuevo expediente y selección física", () => {
  it("exige una decisión explícita y cerrada para cada residual del Anexo I",()=>{
    const decisions=NEW_SUPPLY_VALUES["administrative.pcapAnnexIResidualDecisions"];
    expect(()=>assertSupplyAsaAnnexIResidualDecisions(decisions)).not.toThrow();
    expect(()=>assertSupplyAsaAnnexIResidualDecisions({...decisions as object,insuranceRequired:"Pendiente"})).toThrow(/Sí o No/);
    const missing={...decisions as Record<string,string>};delete missing.warrantyTerm;
    expect(()=>assertSupplyAsaAnnexIResidualDecisions(missing)).toThrow(/Plazo de garantía/);
  });

  it("declara, valida y recupera datos documentales; cualquier cambio técnico invalida el sello anterior", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "lb103-completion-"));
    try {
      const store = new AdaptiveCaseStore(root); const created = store.create();
      const service = new UniversalEvidenceCaseService(store);
      for (const [fieldPath,value] of Object.entries(NEW_SUPPLY_VALUES)) {
        service.declare(created.caseId, {fieldPath,value}, "test-operator");
        service.validate(created.caseId,fieldPath,"test-reviewer");
      }
      store.save(created.caseId,{__lb103:{contractType:"SUPPLY",phase:"READY_FOR_DOCUMENT_GENERATION"}} as never);
      const restored = new AdaptiveCaseStore(root).get(created.caseId);
      expect(restored.universalEvidence?.["execution.plannedModificationRegime"].value).toEqual(NEW_SUPPLY_VALUES["execution.plannedModificationRegime"]);
      const before = evaluateLB103ServerValidatedPreflight(restored);
      expect(before.generationReady).toBe(true);
      const priceRevision = evaluateLB103DocumentCompletion({caseId:restored.caseId,fields:restored.universalEvidence??{},updatedAt:restored.updatedAt}).fields.find(field=>field.fieldPath==="economic.priceRevisionRegime");
      expect(priceRevision).toMatchObject({control:"SELECT",options:["No procede"],value:"No procede",ready:true});
      const seals = {snapshotSha256:before.snapshot!.sha256,documentarySelectionSha256:before.documentarySelection!.sha256};
      service.declare(created.caseId,{fieldPath:"technical.technicalRequirements",value:"Requisitos técnicos distintos."},"test-operator");
      service.validate(created.caseId,"technical.technicalRequirements","test-reviewer");
      const changed = store.get(created.caseId);
      const after = evaluateLB103ServerValidatedPreflight(changed);
      expect(after.snapshot!.sha256).not.toBe(seals.snapshotSha256);
      const generator=vi.fn();
      const rejected=await generateLB103AuthoritativeSupplyPackage({caseValue:changed,presentedSeals:seals,templateStore:{get:async()=>null},generator});
      expect(rejected.ready).toBe(false); expect(generator).not.toHaveBeenCalled();
      const physical = selectedLB103TemplateStore({get:async()=>({templateId:"wrong",sourceId:"wrong",bytes:Buffer.from("wrong")})},after.documentarySelection!);
      await expect(physical.get("unselected-template")).rejects.toThrow(/ajena/);
      await expect(physical.get("JDA-PCAP-SUPPLY-ASA-AUTOFINANCED-2025-12-17")).rejects.toThrow(/no coincide/);
    } finally { fs.rmSync(root,{recursive:true,force:true}); }
  });

  it("el autodiagnóstico sintético no acepta fuentes ausentes ni registra aceptación humana",async()=>{
    const result=await runLB103NewCaseSelfTest({get:async()=>null});
    expect(result.ready).toBe(false);
    expect(result).toMatchObject({synthetic:true,countsAsHumanAcceptance:false,productionReady:false});
    expect(result.blockers.join(" ")).toContain("no disponible");
  });

  it("el script documental es JavaScript ejecutable y conserva importes españoles sin redondeos",()=>{
    const script=LB103_AUTHORITATIVE_GENERATION_SCRIPT.replace('document.addEventListener("DOMContentLoaded"','globalThis.testEuros=euros;document.addEventListener("DOMContentLoaded"');
    const context:any={document:{addEventListener:()=>{}},localStorage:{getItem:()=>""}};
    vm.runInNewContext(script,context);
    expect(context.testEuros("1.234,56")).toBe(123456);
    expect(context.testEuros("0,01")).toBe(1);
    expect(()=>context.testEuros("1.234,567")).toThrow();
    expect(()=>context.testEuros("")).toThrow();
  });
});
