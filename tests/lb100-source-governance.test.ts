import fs from "node:fs";
import yaml from "js-yaml";
import { describe, expect, it } from "vitest";

type Registry={policy?:Record<string,unknown>;sources?:Array<Record<string,unknown>>};
const registry=yaml.load(fs.readFileSync("knowledge/sources/lb100-authoritative-sources.yaml","utf8")) as Registry;

describe("LB100 gobernanza de fuentes y gratuidad",()=>{
  it("fija LCSP BOE y catálogo Junta como autoridades productivas",()=>{
    const ids=new Set((registry.sources??[]).map(s=>s.id));
    expect(ids.has("BOE-LCSP-9-2017-CONSOLIDATED-2026-04-09")).toBe(true);
    expect(ids.has("JDA-RECOMMENDED-PCAP-MODELS-2025-12")).toBe(true);
  });
  it("no promociona ejemplos históricos no verificados ni modelos oficiales sin identidad binaria",()=>{
    expect(registry.policy?.unverifiedHistoricalKnowledgeMustRemainQuarantined).toBe(true);
    expect(registry.policy?.officialModelClaimRequiresExactBinaryVerification).toBe(true);
    expect(registry.policy?.humanValidationRequiredForMaterialDecisions).toBe(true);
  });
  it("mantiene la generación base sin SDK de IA de pago obligatorio",()=>{
    const pkg=JSON.parse(fs.readFileSync("package.json","utf8")) as {dependencies?:Record<string,string>;optionalDependencies?:Record<string,string>};
    const names=Object.keys({...pkg.dependencies,...pkg.optionalDependencies}).map(x=>x.toLowerCase());
    expect(names.some(name=>["openai","anthropic","cohere","mistral","groq","gemini","google-generative"].some(x=>name.includes(x)))).toBe(false);
  });
});
