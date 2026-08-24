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
 * LB58 — estado explícito de los renderers del paquete universal V1.
 *
 * No se deduce readiness por disponer de un ODT real o de una candidata corregida.
 * Un renderer productivo exige identidad binaria fuente, inventario físico reproducible
 * y, cuando corresponda, aceptación humana de la candidata documental corregida.
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
    protectedRendererReady: false,
    exactSourceIdentityVerified: true,
    physicalMappingReady: false,
    humanAcceptanceStillRequired: true,
    blockers: [
      "MEMORIA: falta cerrar el inventario físico reproducible que conecte la evidencia universal con los párrafos y tablas del ODT V12/V13.",
      "MEMORIA: la V13 corregida es candidata editable real, pero su aceptación humana sigue separada del cierre técnico del renderer.",
    ],
  },
  PPT: {
    kind: "PPT",
    protectedRendererReady: false,
    exactSourceIdentityVerified: true,
    physicalMappingReady: false,
    humanAcceptanceStillRequired: true,
    blockers: [
      "PPT: la identidad binaria del V6 ya está verificada, pero falta convertir su estructura real y el catálogo de 98 referencias en bindings físicos universales reproducibles.",
      "PPT: debe mantenerse protegida la regla de catálogo cerrado: variación de unidades sí; artículos nuevos o precios unitarios nuevos no mediante la modificación prevista.",
    ],
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
