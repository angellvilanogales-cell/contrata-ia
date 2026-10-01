import type { RealCaseRegressionEntry } from "./RealCaseRegressionCorpus";

export type RealCaseDifferenceCategory=
 | "ERROR_CONTRATA_IA"
 | "SOURCE_VARIANT"
 | "MODEL_VERSION_DIFFERENCE"
 | "SOURCE_CONFLICT"
 | "MISSING_SOURCE"
 | "HUMAN_DECISION_REQUIRED";

export interface RealCaseObservedValue{readonly key:string;readonly value:unknown;readonly status?:string;}
export interface RealCaseDifference{readonly key:string;readonly category:RealCaseDifferenceCategory;readonly sourceValue:unknown;readonly generatedValue:unknown;readonly detail:string;}

/** Comparador estricto: nunca decide una contradicción ni completa un hueco de fuente. */
export function compareRealCase(entry:RealCaseRegressionEntry,generated:readonly RealCaseObservedValue[]):readonly RealCaseDifference[]{
  const byKey=new Map(generated.map(x=>[x.key,x]));
  const differences:RealCaseDifference[]=[];
  for(const [key,sourceValue] of Object.entries(entry.invariants)){
    const observed=byKey.get(key);
    if(!observed){differences.push({key,category:"ERROR_CONTRATA_IA",sourceValue,generatedValue:undefined,detail:"El motor no materializa un invariante acreditado por la fuente."});continue;}
    if(observed.status==="SOURCE_CONFLICT"){
      differences.push({key,category:"SOURCE_CONFLICT",sourceValue,generatedValue:observed.value,detail:"La contradicción debe permanecer visible y sin resolución automática."});continue;
    }
    if(observed.status==="HUMAN_DECISION_REQUIRED"){
      differences.push({key,category:"HUMAN_DECISION_REQUIRED",sourceValue,generatedValue:observed.value,detail:"La decisión requiere validación humana expresa."});continue;
    }
    if(observed.value!==sourceValue)differences.push({key,category:"ERROR_CONTRATA_IA",sourceValue,generatedValue:observed.value,detail:"El resultado contradice un hecho congelado del expediente real."});
  }
  return differences;
}

export function hasBlockingRegressionDifference(differences:readonly RealCaseDifference[]):boolean{
  return differences.some(x=>x.category==="ERROR_CONTRATA_IA"||x.category==="SOURCE_CONFLICT"||x.category==="HUMAN_DECISION_REQUIRED");
}
