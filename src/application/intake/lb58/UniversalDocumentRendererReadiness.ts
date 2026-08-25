export type UniversalV1DocumentKind = "PCAP" | "MEMORIA" | "PPT";

export interface UniversalDocumentRendererCapability {
  kind: UniversalV1DocumentKind;
  protectedRendererReady: boolean;
  exactSourceIdentityVerified: boolean;
  physicalMappingReady: boolean;
  humanAcceptanceStillRequired: boolean;
  blockers: readonly string[];
}

/**
 * LB58/LB59 — estado explícito de los renderers del paquete universal V1.
 *
 * LB59 incorpora inventarios físicos source-backed y renderers protegidos para
 * Memoria V12 y PPT V6. La preparación técnica del renderer no equivale a
 * aceptación humana del documento ni a instalación de los bytes en un servidor.
 */
export const UNIVERSAL_V1_DOCUMENT_RENDERER_CAPABILITIES: Readonly<Record<UniversalV1DocumentKind, UniversalDocumentRendererCapability>> = {
  PCAP: {
    kind: "PCAP",
    protectedRendererReady: true,
    exactSourceIdentityVerified: true,
    physicalMappingReady: true,
    humanAcceptanceStillRequired: true,
    blockers: [],
  },
  MEMORIA: {
    kind: "MEMORIA",
    protectedRendererReady: true,
    exactSourceIdentityVerified: true,
    physicalMappingReady: true,
    humanAcceptanceStillRequired: true,
    blockers: [],
  },
  PPT: {
    kind: "PPT",
    protectedRendererReady: true,
    exactSourceIdentityVerified: true,
    physicalMappingReady: true,
    humanAcceptanceStillRequired: true,
    blockers: [],
  },
} as const;

export function universalV1ProtectedRendererState(): Readonly<Record<UniversalV1DocumentKind, boolean>> {
  return {
    PCAP: UNIVERSAL_V1_DOCUMENT_RENDERER_CAPABILITIES.PCAP.protectedRendererReady,
    MEMORIA: UNIVERSAL_V1_DOCUMENT_RENDERER_CAPABILITIES.MEMORIA.protectedRendererReady,
    PPT: UNIVERSAL_V1_DOCUMENT_RENDERER_CAPABILITIES.PPT.protectedRendererReady,
  };
}

export function universalV1RendererBlockers(): readonly string[] {
  return (Object.values(UNIVERSAL_V1_DOCUMENT_RENDERER_CAPABILITIES) as UniversalDocumentRendererCapability[])
    .flatMap(item => item.protectedRendererReady ? [] : item.blockers);
}
