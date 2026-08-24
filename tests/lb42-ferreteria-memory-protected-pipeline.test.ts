import { describe, expect, it } from "vitest";
import {
  FERRETERIA_MEMORY_PROTECTED_PROFILE,
  evaluateFerreteriaMemoryPipelineReadiness,
} from "../src/application/intake/lb42/FerreteriaMemoryProtectedPipeline";

describe("LB42 - pipeline protegido de Memoria justificativa", () => {
  it("mantiene prohibido el fallback legacy y exige aceptación humana", () => {
    expect(FERRETERIA_MEMORY_PROTECTED_PROFILE.legacyFallbackAllowed).toBe(false);
    expect(FERRETERIA_MEMORY_PROTECTED_PROFILE.humanAcceptanceRequired).toBe(true);
    expect(FERRETERIA_MEMORY_PROTECTED_PROFILE.mandatoryCorrectionIds).toEqual([
      "estimated-value-da33",
      "no-new-articles",
      "rolece-registration",
      "specific-business-qualification",
    ]);
  });

  it("exige verificar primero los bytes exactos de la fuente V12", () => {
    const result = evaluateFerreteriaMemoryPipelineReadiness({
      sourceBytesVerified: false,
      correctedCandidateBytesVerified: false,
      physicalMappingInventoryReady: false,
    });
    expect(result.ready).toBe(false);
    expect(result.stage).toBe("NEEDS_SOURCE_BYTES");
  });

  it("tras verificar fuente exige también la candidata V13 corregida", () => {
    const result = evaluateFerreteriaMemoryPipelineReadiness({
      sourceBytesVerified: true,
      correctedCandidateBytesVerified: false,
      physicalMappingInventoryReady: false,
    });
    expect(result.ready).toBe(false);
    expect(result.stage).toBe("NEEDS_CORRECTED_CANDIDATE");
  });

  it("no confunde una corrección puntual válida con un renderer universal", () => {
    const result = evaluateFerreteriaMemoryPipelineReadiness({
      sourceBytesVerified: true,
      correctedCandidateBytesVerified: true,
      physicalMappingInventoryReady: false,
    });
    expect(result.ready).toBe(false);
    expect(result.stage).toBe("READY_FOR_MAPPING_INVENTORY");
  });

  it("solo tras inventario físico queda lista para auditoría/aceptación humana", () => {
    const result = evaluateFerreteriaMemoryPipelineReadiness({
      sourceBytesVerified: true,
      correctedCandidateBytesVerified: true,
      physicalMappingInventoryReady: true,
    });
    expect(result.ready).toBe(true);
    expect(result.stage).toBe("AWAITING_HUMAN_ACCEPTANCE");
  });
});
