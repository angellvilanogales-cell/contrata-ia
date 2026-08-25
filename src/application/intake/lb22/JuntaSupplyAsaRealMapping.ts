import { RealTemplateMappingProfile, RealTemplateSourceEvidence } from "./UniversalRealTemplateMappingRegistry";

/**
 * Evidencia estructural revisada en las fuentes del proyecto. El PDF se
 * identifica como modelo recomendado por la Comisión Consultiva de Contratación
 * Pública para suministro mediante procedimiento abierto simplificado abreviado
 * con presentación electrónica de ofertas. No se declara aquí que exista el
 * original editable maestro: esa promoción requiere el activo DOCX/ODT original
 * y validación humana independiente.
 */
export const JDA_SUPPLY_ASA_REFERENCE_SOURCE: RealTemplateSourceEvidence = {
  sourceId: "source:jda-pcap-supply-asa-reference-v5",
  locator: "file-library/PCAP_suministro_abierto_simplificado_abreviado_autofinanciada (ferretería) V5.pdf",
  fileName: "PCAP_suministro_abierto_simplificado_abreviado_autofinanciada (ferretería) V5.pdf",
  mediaType: "application/pdf",
  qualification: "OFFICIAL_REFERENCE_PDF",
  officialModelStatement: "Modelo de PCAP recomendado por la Comisión Consultiva de Contratación Pública para suministro mediante procedimiento abierto simplificado abreviado - presentación electrónica de ofertas.",
  humanValidated: true,
  validatedBy: "SOURCE_REVIEW_LB22",
  note: "Acredita estructura y apartados; no constituye activo editable original de producción.",
};

/**
 * Perfil real de estructura del ANEXO I. Solo se mapean equivalencias que
 * existen en el expediente universal y cuya correspondencia documental se ha
 * podido verificar. No se inventan huecos para textos que el dominio todavía
 * no representa de forma exacta.
 *
 * Importante: la decisión de división en lotes se mapea a la pregunta expresa
 * "División en lotes: Sí/No". No se escribe nunca un supuesto "LOTE 1" cuando
 * divisionIntoLots=false; la descripción de lotes es contenido condicional y
 * requiere cobertura física propia cuando proceda.
 */
export const JDA_SUPPLY_ASA_PCAP_ANEXO_I_REFERENCE_PROFILE: RealTemplateMappingProfile = {
  profileId: "realmap:jda:supply:asa:pcap:anexo-i:reference-v5",
  contractType: "SUPPLY",
  documentKind: "PCAP",
  templateFamilyId: "JDA-PCAP-SUPPLY-ASA-ELECTRONIC",
  sourceId: JDA_SUPPLY_ASA_REFERENCE_SOURCE.sourceId,
  evidenceLocators: [
    "ANEXO I - CARACTERÍSTICAS DEL CONTRATO",
    "1. OBJETO DEL CONTRATO / 1.A INFORMACIÓN RELATIVA A LOS LOTES",
    "3. DURACIÓN Y PRÓRROGA",
    "6. APTITUD Y CAPACIDAD",
    "7. CRITERIOS DE ADJUDICACIÓN",
    "8. CONDICIONES ESPECIALES DE EJECUCIÓN",
  ],
  slots: [
    { slotId: "pcap.anexoI.1.objeto", fieldKey: "object", required: true, sourceSection: "ANEXO I / 1", sourceLabel: "Objeto del contrato" },
    { slotId: "pcap.anexoI.1.cpv", fieldKey: "cpvMain", required: true, sourceSection: "ANEXO I / 1", sourceLabel: "Código CPV" },
    { slotId: "pcap.anexoI.1A.divisionLotes", fieldKey: "lots.divisionIntoLots", required: true, sourceSection: "ANEXO I / 1.A", sourceLabel: "División en lotes" },
    { slotId: "pcap.anexoI.2.pbl", fieldKey: "baseTenderBudgetCents", required: true, sourceSection: "ANEXO I / 2", sourceLabel: "Presupuesto base de licitación" },
    { slotId: "pcap.anexoI.2.valorEstimado", fieldKey: "economic.legalEstimatedValueCents", required: true, sourceSection: "ANEXO I / 2", sourceLabel: "Valor estimado" },
    { slotId: "pcap.anexoI.3.duracion", fieldKey: "durationMonths", required: true, sourceSection: "ANEXO I / 3", sourceLabel: "Duración del contrato" },
    { slotId: "pcap.anexoI.3.prorrogas", fieldKey: "extensionMonths", required: true, sourceSection: "ANEXO I / 3", sourceLabel: "Prórroga" },
    { slotId: "pcap.anexoI.7.criterios", fieldKey: "criteria.awardCriteria", required: true, sourceSection: "ANEXO I / 7", sourceLabel: "Criterios de adjudicación" },
    { slotId: "pcap.anexoI.8.condicionesEspeciales", fieldKey: "execution.specialExecutionConditions", required: true, sourceSection: "ANEXO I / 8", sourceLabel: "Condiciones especiales de ejecución" },
  ],
};

export const JDA_SUPPLY_ASA_DERIVED_EDITABLE_EXAMPLE: RealTemplateSourceEvidence = {
  sourceId: "source:contrata-derived-supply-asa-odt",
  locator: "file-library/CONTR-2026-240267_PCAP_Oficial_Parametrizado_11-1_Contrata-IA.odt",
  fileName: "CONTR-2026-240267_PCAP_Oficial_Parametrizado_11-1_Contrata-IA.odt",
  mediaType: "application/vnd.oasis.opendocument.text",
  qualification: "DERIVED_EDITABLE_COPY",
  humanValidated: true,
  validatedBy: "SOURCE_REVIEW_LB22",
  note: "Copia editable derivada/parametrizada útil para contraste de estructura, pero no fuente maestra oficial.",
};
