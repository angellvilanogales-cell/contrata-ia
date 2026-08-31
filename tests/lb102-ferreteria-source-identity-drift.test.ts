import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LB102_FERRETERIA_SOURCE_ASSETS } from "../src/application/intake/lb102/LB102PersistedPilotTemplateStores";
import { FERRETERIA_MEMORY_TEMPLATE_ID, FERRETERIA_PPT_TEMPLATE_ID } from "../src/application/intake/lb59/FerreteriaSourceBackedProtectedRenderers";

function sourceConstant(name: string): string {
  const sourcePath = path.resolve(process.cwd(), "src/application/intake/lb59/FerreteriaSourceBackedProtectedRenderers.ts");
  const source = fs.readFileSync(sourcePath, "utf8");
  const match = source.match(new RegExp(`const\\s+${name}\\s*=\\s*[\"']([^\"']+)[\"']`));
  if (!match?.[1]) throw new Error(`No se localiza ${name} en el renderer protegido LB59.`);
  return match[1];
}

describe("LB102 - identidad física Ferretería sin deriva", () => {
  it("usa en persistencia exactamente los SHA y huellas protegidos por LB59", () => {
    const memory = LB102_FERRETERIA_SOURCE_ASSETS.find(asset => asset.kind === "MEMORIA");
    const ppt = LB102_FERRETERIA_SOURCE_ASSETS.find(asset => asset.kind === "PPT");

    expect(memory).toBeDefined();
    expect(ppt).toBeDefined();
    expect(memory?.templateId).toBe(FERRETERIA_MEMORY_TEMPLATE_ID);
    expect(ppt?.templateId).toBe(FERRETERIA_PPT_TEMPLATE_ID);
    expect(memory?.sha256).toBe(sourceConstant("MEMORY_SOURCE_SHA"));
    expect(memory?.styleFingerprint).toBe(sourceConstant("MEMORY_SOURCE_STYLE"));
    expect(ppt?.sha256).toBe(sourceConstant("PPT_SOURCE_SHA"));
    expect(ppt?.styleFingerprint).toBe(sourceConstant("PPT_SOURCE_STYLE"));
  });

  it("mantiene procedencia de expediente real y no reclama oficialidad", () => {
    for (const asset of LB102_FERRETERIA_SOURCE_ASSETS) {
      expect(asset.sourceId).toContain("real-case:CONTR/2026/240267");
      expect(asset.provenanceRole).toBe("VALIDATED_REAL_CASE_SOURCE");
    }
  });
});
