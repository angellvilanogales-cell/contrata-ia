import {describe,expect,it} from "vitest";
import {LB102_REAL_CASE_CORPUS,countExecutableRealCases,findRealCase,packageCompleteInSource,physicallyExecutableForPilot} from "../src/application/operations/lb102/RealCaseRegressionCorpus";
import {compareRealCase,hasBlockingRegressionDifference} from "../src/application/operations/lb102/RealCaseRegressionComparator";

describe("LB102 real-case regression corpus",()=>{
  it("mantiene los expedientes reales como regresión y nunca como modelo general",()=>{
    expect(LB102_REAL_CASE_CORPUS.length).toBeGreaterThanOrEqual(9);
    expect(LB102_REAL_CASE_CORPUS.every(x=>x.neverGeneralModel)).toBe(true);
    expect(LB102_REAL_CASE_CORPUS.every(packageCompleteInSource)).toBe(true);
  });
  it("acredita dos pipelines Supply y dos Service reales",()=>{
    expect(countExecutableRealCases("SUPPLY")).toBeGreaterThanOrEqual(2);
    expect(countExecutableRealCases("SERVICE")).toBeGreaterThanOrEqual(2);
    for(const id of ["REG-SUPPLY-001","REG-SUPPLY-002","REG-SERVICE-008","REG-SERVICE-009"]) expect(physicallyExecutableForPilot(findRealCase(id)!)).toBe(true);
  });
  it("impide heredar DA 33 a software, sanitario o tablets",()=>{
    expect(findRealCase("REG-SUPPLY-001")!.invariants.da33).toBe(true);
    for(const id of ["REG-SUPPLY-002","REG-SUPPLY-003","REG-SUPPLY-004","REG-SUPPLY-005"]) expect(findRealCase(id)!.invariants.da33).toBe(false);
  });
  it("conserva rasgos exclusivos de cada subfamilia",()=>{
    const panda=findRealCase("REG-SUPPLY-002")!;
    expect(panda.invariants.divisionIntoLots).toBe(false);expect(panda.invariants.durationMonths).toBe(36);expect(panda.invariants.cpvMain).toBe("48760000-3");expect(panda.invariants.partnerGoldRequired).toBe(true);
    expect(findRealCase("REG-SUPPLY-004")!.invariants.sanitary).toBe(true);expect(findRealCase("REG-SUPPLY-005")!.invariants.platformComponent).toBe(true);
    expect(findRealCase("REG-SERVICE-008")!.invariants.cpvMain).toBe("90911200-8");expect(findRealCase("REG-SERVICE-009")!.invariants.trainingEditions).toBe(84);
    expect(findRealCase("REG-SERVICE-005")!.invariants.subrogation).toBe(true);expect(findRealCase("REG-SERVICE-007")!.invariants.gmao).toBe(true);
  });
  it("clasifica como defecto una desviación del dato fuente",()=>{
    const panda=findRealCase("REG-SUPPLY-002")!;const diff=compareRealCase(panda,Object.entries(panda.invariants).map(([key,value])=>({key,value:key==="durationMonths"?12:value})));
    expect(diff.some(x=>x.key==="durationMonths"&&x.category==="ERROR_CONTRATA_IA")).toBe(true);expect(hasBlockingRegressionDifference(diff)).toBe(true);
  });
  it("no resuelve conflictos automáticamente",()=>{
    const maintenance=findRealCase("REG-SERVICE-007")!;const observed=Object.entries(maintenance.invariants).map(([key,value])=>({key,value,status:key==="lots"?"SOURCE_CONFLICT":undefined}));
    expect(compareRealCase(maintenance,observed).some(x=>x.category==="SOURCE_CONFLICT")).toBe(true);
  });
});
