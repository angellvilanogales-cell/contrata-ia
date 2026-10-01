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
    expect(()=>assertSupplyAsaAnnexIResidualDecisions({...decisions as object,totalUnits:"Según la relación de unidades validada en la documentación técnica."})).toThrow(/genérica/);
    expect(()=>assertSupplyAsaAnnexIResidualDecisions({...decisions as object,totalUnits:"Unidades definidas"})).toThrow(/cifra o una relación cuantificada/);
    expect(()=>assertSupplyAsaAnnexIResidualDecisions({...decisions as object,contractingAuthority:"El órgano de contratación competente"})).toThrow(/genérica/);
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

  it("abre la recuperación documental aunque la combinación de modelos siga pendiente",()=>{
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).not.toContain("!result.packageReady){panel.innerHTML=\"\"");
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain("Completar datos para los documentos");
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain("proposedValue");
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain("economic.priceDeterminationRegime");
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain("technical.supplyVariant");
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain("technical.executionLocations");
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain("execution.extensionStructure");
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain("economic.annualityBudgetRows");
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain("No se cambiará el procedimiento ni la financiación");
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain("ui:lb103:document-recovery");
  });

  it("propone la necesidad, exige comprobar los recursos disponibles y separa el órgano competente",()=>{
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain("proposedNeedText");
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain("Texto propuesto y editable");
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain("Comprobación previa obligatoria");
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain("existencias disponibles, reutilización o redistribución de materiales");
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain("medios personales y técnicos propios");
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain("Puede atenderse parcialmente; debo revisar o reducir el objeto");
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain("Todavía no se ha comprobado");
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain("Esta decisión es distinta de la necesidad");
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain("ui:lb103:need-and-means-review");
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain('fieldPath:"need"');
  });

  it("presenta en español las subfamilias de suministro sin alterar sus valores internos",()=>{
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain('"ORDINARY_GLOBAL_PRICE":"Suministro ordinario con cantidades determinadas y precio global"');
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain('"CATALOGUE_NEEDS":"Suministro mediante pedidos sucesivos según necesidades y precios unitarios"');
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain(`value="'+esc(o)+'"`);
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain('optionLabel(f.fieldPath,o)');
  });

  it("convierte las decisiones residuales del Anexo I en una revisión guiada y propuesta",()=>{
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain("Revisión guiada del Anexo I");
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain("Paso "+"'+(index+1)+'"+" de ");
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain("proposedResidualDecisions");
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain("Objeto, unidades y lotes");
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain("Cesión, suspensión y datos personales");
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain("residualDependencies");
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain("setupResidualWizard");
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain('save.style.display=step===groups.length-1');
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).toContain('economic.initialPblVatIncludedCents');
    expect(LB103_AUTHORITATIVE_GENERATION_SCRIPT).not.toContain('totalUnits:"Según la relación de unidades');
  });
});
