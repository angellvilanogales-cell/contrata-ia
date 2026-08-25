import { RealTemplateSourceEvidence } from "../lb22/UniversalRealTemplateMappingRegistry";

/**
 * Fuente oficial editable verificada físicamente el 23/08/2026.
 *
 * El original ODT fue aportado para la activación V1 y su propio contenido
 * identifica el documento como modelo recomendado por la Comisión Consultiva de
 * Contratación Pública, implementado sobre el modelo informado por la Asesoría
 * Jurídica (AJ-CHFE 2021/186) y actualizado en diciembre de 2025 conforme a la
 * sesión de 17/12/2025. La URL se conserva como localizador institucional.
 *
 * La validación de procedencia NO equivale por sí sola a activación productiva:
 * el runtime debe disponer de los bytes cuyo SHA-256 coincida con el manifiesto
 * verificado y superar huella de estilos y bindings físicos.
 */
export const JDA_SUPPLY_ASA_OFFICIAL_ODT_DISCOVERY: RealTemplateSourceEvidence = {
  sourceId: "jda:cccp:pcap:supply:asa:autofinanced:2025-12-17:odt",
  locator: "https://www.juntadeandalucia.es/sites/default/files/inline-files/2026/02/2025_12_17_pcap_suministro_abierto_simplificado_abreviado_autofinanciada.odt",
  fileName: "2025_12_17_pcap_suministro_abierto_simplificado_abreviado_autofinanciada.odt",
  mediaType: "application/vnd.oasis.opendocument.text",
  qualification: "OFFICIAL_EDITABLE_ORIGINAL",
  officialModelStatement: "Modelo de PCAP de suministro, procedimiento abierto simplificado abreviado, presentación electrónica de ofertas, actualizado en diciembre de 2025 y publicado por la Junta de Andalucía.",
  humanValidated: true,
  validatedBy: "SOURCE_REVIEW_2026-08-23_USER_SUPPLIED_OFFICIAL_ODT",
  note: "Original ODT inspeccionado físicamente. Identidad, SHA-256 y huella de estilo se registran en JuntaSupplyAsaOfficialActivation.ts; la puesta en producción sigue exigiendo disponibilidad de esos bytes exactos en el runtime.",
};
