import { RealTemplateSourceEvidence } from "../lb22/UniversalRealTemplateMappingRegistry";

/**
 * LB23.5 - descubrimiento de fuente oficial editable vigente en el portal de la
 * Junta de Andalucía. Se registra como original editable oficial descubierto,
 * pero NO se marca humanValidated: el alta productiva sigue exigiendo descarga,
 * hash, inspección física del paquete y validación humana de procedencia.
 */
export const JDA_SUPPLY_ASA_OFFICIAL_ODT_DISCOVERY: RealTemplateSourceEvidence = {
  sourceId: "jda:cccp:pcap:supply:asa:autofinanced:2025-12-17:odt",
  locator: "https://www.juntadeandalucia.es/sites/default/files/inline-files/2026/02/2025_12_17_pcap_suministro_abierto_simplificado_abreviado_autofinanciada.odt",
  fileName: "2025_12_17_pcap_suministro_abierto_simplificado_abreviado_autofinanciada.odt",
  mediaType: "application/vnd.oasis.opendocument.text",
  qualification: "OFFICIAL_EDITABLE_ORIGINAL",
  officialModelStatement: "Modelo de PCAP de suministro, procedimiento abierto simplificado abreviado, autofinanciado, publicado por la Junta de Andalucía en el catálogo de modelos recomendados por la Comisión Consultiva de Contratación Pública.",
  humanValidated: false,
  note: "Fuente localizada en el portal oficial. Antes de producción deben obtenerse los bytes, calcular SHA-256 y huella de estilo, verificar bindings físicos y validar humanamente la procedencia/versionado.",
};
