import { describe, expect, it } from "vitest";
import {
  UNIVERSAL_V1_DOCUMENT_RENDERER_CAPABILITIES,
  universalV1ProtectedRendererState,
  universalV1RendererBlockers,
} from "../src/application/intake/lb58/UniversalDocumentRendererReadiness";

describe("LB58/LB59 - registro explícito de renderers universales V1", () => {
  it("reconoce los tres renderers protegidos tras cerrar inventarios físicos LB59", () => {
    expect(universalV1ProtectedRendererState()).toEqual({ PCAP: true, MEMORIA: true, PPT: true });
  });

  it("reconoce que las tres identidades fuente están verificadas", () => {
    expect(UNIVERSAL_V1_DOCUMENT_RENDERER_CAPABILITIES.PCAP.exactSourceIdentityVerified).toBe(true);
    expect(UNIVERSAL_V1_DOCUMENT_RENDERER_CAPABILITIES.MEMORIA.exactSourceIdentityVerified).toBe(true);
    expect(UNIVERSAL_V1_DOCUMENT_RENDERER_CAPABILITIES.PPT.exactSourceIdentityVerified).toBe(true);
  });

  it("cierra bloqueos de renderer sin falsificar aceptación humana", () => {
    expect(universalV1RendererBlockers()).toEqual([]);
    expect(Object.values(UNIVERSAL_V1_DOCUMENT_RENDERER_CAPABILITIES).every(item => item.physicalMappingReady)).toBe(true);
    expect(Object.values(UNIVERSAL_V1_DOCUMENT_RENDERER_CAPABILITIES).every(item => item.humanAcceptanceStillRequired)).toBe(true);
  });
});
