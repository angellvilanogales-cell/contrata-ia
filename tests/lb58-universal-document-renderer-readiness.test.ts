import { describe, expect, it } from "vitest";
import {
  UNIVERSAL_V1_DOCUMENT_RENDERER_CAPABILITIES,
  universalV1ProtectedRendererState,
  universalV1RendererBlockers,
} from "../src/application/intake/lb58/UniversalDocumentRendererReadiness";

describe("LB58 - registro explícito de renderers universales V1", () => {
  it("mantiene PCAP listo sin elevar falsamente Memoria o PPT", () => {
    expect(universalV1ProtectedRendererState()).toEqual({ PCAP: true, MEMORIA: false, PPT: false });
  });

  it("reconoce que las tres identidades fuente están verificadas", () => {
    expect(UNIVERSAL_V1_DOCUMENT_RENDERER_CAPABILITIES.PCAP.exactSourceIdentityVerified).toBe(true);
    expect(UNIVERSAL_V1_DOCUMENT_RENDERER_CAPABILITIES.MEMORIA.exactSourceIdentityVerified).toBe(true);
    expect(UNIVERSAL_V1_DOCUMENT_RENDERER_CAPABILITIES.PPT.exactSourceIdentityVerified).toBe(true);
  });

  it("explica los bloqueos concretos de Memoria y PPT", () => {
    const blockers = universalV1RendererBlockers().join(" ");
    expect(blockers).toMatch(/MEMORIA:.*inventario físico/i);
    expect(blockers).toMatch(/PPT:.*98 referencias/i);
    expect(blockers).toMatch(/artículos nuevos.*precios unitarios nuevos/i);
  });
});
