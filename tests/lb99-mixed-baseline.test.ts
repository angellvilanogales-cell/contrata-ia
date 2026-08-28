import { describe,expect,it } from "vitest";
import { evaluateMixedPhysicalBaseline,LB99_MIXED_REAL_CASES } from "../src/application/intake/lb99/MixedPhysicalBaseline";

describe("LB99 baseline Mixed",()=>{
  it("conserva ejemplos reales en ambos sentidos suministro-servicio",()=>{expect(LB99_MIXED_REAL_CASES.some(x=>x.principalContractType==="SUPPLY")).toBe(true);expect(LB99_MIXED_REAL_CASES.some(x=>x.principalContractType==="SERVICE")).toBe(true);expect(LB99_MIXED_REAL_CASES.every(x=>x.generalizable===false&&x.genericTemplateAuthority===false)).toBe(true);});
  it("prohíbe plantilla mixta genérica y mantiene el compositor físico cerrado",()=>{const b=evaluateMixedPhysicalBaseline();expect(b.realSourceCoverage).toBe(true);expect(b.genericMixedTemplateAllowed).toBe(false);expect(b.physicalComposerReady).toBe(false);expect(b.engineeringClosed).toBe(false);expect(b.productionReady).toBe(false);});
});
