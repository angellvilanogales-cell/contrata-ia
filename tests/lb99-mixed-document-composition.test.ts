import { describe,expect,it } from "vitest";
import { evaluateMixedQualification } from "../src/application/intake/lb99/MixedQualificationGate";
import { buildMixedDocumentCompositionPlan } from "../src/application/intake/lb99/MixedDocumentCompositionPlan";

const components=[{id:"supply",contractType:"SUPPLY" as const,estimatedValueExVatCents:8_000_000,functionallyLinked:true,complementaryRelationship:true},{id:"service",contractType:"SERVICE" as const,estimatedValueExVatCents:2_000_000,functionallyLinked:true,complementaryRelationship:true}];

describe("LB99 composición documental",()=>{
  it("usa como base administrativa la familia que gobierna y conserva overlays secundarios",()=>{
    const qualification=evaluateMixedQualification({components,declaredPrincipalContractType:null,objectivelySeparable:null,singleContractChosen:null,nonConcessionThresholdExceeded:null,effectsRegimeSeparatedByComponent:true,worksElementValueCents:null,worksProjectAvailable:false,concessionViabilityStudyAvailable:false,concessionAnteprojectResolved:null});
    const plan=buildMixedDocumentCompositionPlan({qualification,components});
    expect(plan.ready).toBe(true);expect(plan.administrativeBaseFamily).toBe("SUPPLY");expect(plan.technicalOverlayFamilies).toEqual(["SERVICE"]);expect(plan.genericMixedTemplateAllowed).toBe(false);
  });
  it("exige subtipo físico cuando aparece una concesión",()=>{
    const c=[{id:"service",contractType:"SERVICE" as const,estimatedValueExVatCents:1_000_000,functionallyLinked:true,complementaryRelationship:true},{id:"concession",contractType:"CONCESSION" as const,estimatedValueExVatCents:10_000_000,functionallyLinked:true,complementaryRelationship:true}];
    const qualification=evaluateMixedQualification({components:c,declaredPrincipalContractType:"CONCESSION",objectivelySeparable:true,singleContractChosen:true,nonConcessionThresholdExceeded:false,effectsRegimeSeparatedByComponent:true,worksElementValueCents:null,worksProjectAvailable:false,concessionViabilityStudyAvailable:true,concessionAnteprojectResolved:false});
    const blocked=buildMixedDocumentCompositionPlan({qualification,components:c});expect(blocked.ready).toBe(false);expect(blocked.blockers.join(" ")).toContain("subtipo");
    const ready=buildMixedDocumentCompositionPlan({qualification,components:c,concessionSubtype:"SERVICE_CONCESSION"});expect(ready.ready).toBe(true);expect(ready.requiresConcessionViabilityOverlay).toBe(true);
  });
  it("marca overlay de proyecto para cualquier componente Works",()=>{
    const c=[{id:"works",contractType:"WORKS" as const,estimatedValueExVatCents:8_000_000,functionallyLinked:true,complementaryRelationship:true},{id:"service",contractType:"SERVICE" as const,estimatedValueExVatCents:2_000_000,functionallyLinked:true,complementaryRelationship:true}];
    const q=evaluateMixedQualification({components:c,declaredPrincipalContractType:"WORKS",objectivelySeparable:null,singleContractChosen:null,nonConcessionThresholdExceeded:null,effectsRegimeSeparatedByComponent:true,worksElementValueCents:8_000_000,worksProjectAvailable:true,concessionViabilityStudyAvailable:false,concessionAnteprojectResolved:null});
    const plan=buildMixedDocumentCompositionPlan({qualification:q,components:c});expect(plan.ready).toBe(true);expect(plan.requiresProjectOverlay).toBe(true);expect(plan.genericMixedTemplateAllowed).toBe(false);
  });
});
