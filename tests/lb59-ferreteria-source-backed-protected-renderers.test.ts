import { describe, expect, it } from "vitest";
import {
  FERRETERIA_MEMORY_PHYSICAL_BINDING_INVENTORY,
  FERRETERIA_MEMORY_TEMPLATE_ID,
  FERRETERIA_PPT_PHYSICAL_BINDING_INVENTORY,
  FERRETERIA_PPT_TEMPLATE_ID,
  evaluateFerreteriaProtectedRendererPhysicalClosure,
} from "../src/application/intake/lb59/FerreteriaSourceBackedProtectedRenderers";

describe("LB59 - renderers protegidos source-backed de Memoria y PPT", () => {
  it("cierra inventarios físicos sin anclajes duplicados", () => {
    const result = evaluateFerreteriaProtectedRendererPhysicalClosure();
    expect(result.ready).toBe(true);
    expect(result.blockers).toEqual([]);
    expect(result.memoryBindings).toBe(7);
    expect(result.pptBindings).toBe(3);
  });

  it("mantiene identidades runtime separadas para Memoria y PPT", () => {
    expect(FERRETERIA_MEMORY_TEMPLATE_ID).toBe("case:CONTR-2026-240267:memoria:v12:editable");
    expect(FERRETERIA_PPT_TEMPLATE_ID).toBe("case:CONTR-2026-240267:ppt:v6:editable");
  });

  it("mantiene explícitos los bindings jurídicos críticos", () => {
    expect(FERRETERIA_MEMORY_PHYSICAL_BINDING_INVENTORY.map(item => item.id)).toContain("memory.rolece");
    expect(FERRETERIA_MEMORY_PHYSICAL_BINDING_INVENTORY.map(item => item.id)).toContain("memory.estimated-value-table");
    expect(FERRETERIA_PPT_PHYSICAL_BINDING_INVENTORY.map(item => item.id)).toContain("ppt.catalogue-scope");
    expect(FERRETERIA_PPT_PHYSICAL_BINDING_INVENTORY.map(item => item.id)).toContain("ppt.catalogue-98-source-backed");
    expect(FERRETERIA_PPT_PHYSICAL_BINDING_INVENTORY.map(item => item.id)).toContain("ppt.footer-page-count-cache");
  });
});
