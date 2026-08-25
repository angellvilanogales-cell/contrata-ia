import { describe, expect, it } from "vitest";
import { FERRETERIA_MEMORY_PHYSICAL_MAPPING_SCOPE, evaluateFerreteriaMemoryProtectedReadiness } from "../src/application/intake/lb44/FerreteriaMemoryProtectedReadiness";

describe("LB44 - puerta protegida de Memoria", () => {
  it("bloquea si faltan bytes del V12 auténtico", () => {
    const result = evaluateFerreteriaMemoryProtectedReadiness({ sourceV12Bytes: null, correctedV13Bytes: null });
    expect(result.ready).toBe(false);
    expect(result.stage).toBe("NEEDS_SOURCE_BYTES");
  });

  it("bloquea una identidad V12 distinta", () => {
    const result = evaluateFerreteriaMemoryProtectedReadiness({ sourceV12Bytes: new Uint8Array([1,2,3]), correctedV13Bytes: null });
    expect(result.ready).toBe(false);
    expect(result.stage).toBe("SOURCE_IDENTITY_MISMATCH");
  });

  it("mantiene como alcance obligatorio todos los bloques documentales de la Memoria", () => {
    expect(FERRETERIA_MEMORY_PHYSICAL_MAPPING_SCOPE.sections).toHaveLength(9);
    expect(FERRETERIA_MEMORY_PHYSICAL_MAPPING_SCOPE.correctionsThatMustRemainProtected).toEqual([
      "estimated-value-da33",
      "no-new-articles",
      "rolece-registration",
      "specific-business-qualification",
    ]);
    expect(FERRETERIA_MEMORY_PHYSICAL_MAPPING_SCOPE.humanAcceptanceRequired).toBe(true);
  });
});
