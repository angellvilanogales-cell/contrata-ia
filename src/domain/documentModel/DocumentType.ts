/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DocumentType
 * ------------------------------------------------------------
 * Catálogo oficial de documentos administrativos.
 *
 * Este enum identifica todos los documentos que pueden
 * formar parte de un expediente de contratación pública.
 *
 * Ninguna clase deberá utilizar cadenas ("strings")
 * para identificar documentos.
 *
 * ============================================================
 */

export enum DocumentType {

    /**
     * =====================================================
     * MEMORIA
     * =====================================================
     */

    MEMORY = "MEMORY",

    /**
     * =====================================================
     * INFORMES
     * =====================================================
     */

    NEED_REPORT = "NEED_REPORT",

    MEANS_INSUFFICIENCY_REPORT =
        "MEANS_INSUFFICIENCY_REPORT",

    MARKET_CONSULTATION_REPORT =
        "MARKET_CONSULTATION_REPORT",

    LEGAL_REPORT =
        "LEGAL_REPORT",

    ECONOMIC_REPORT =
        "ECONOMIC_REPORT",

    TECHNICAL_REPORT =
        "TECHNICAL_REPORT",

    AWARD_REPORT =
        "AWARD_REPORT",

    EVALUATION_REPORT =
        "EVALUATION_REPORT",

    /**
     * =====================================================
     * PLIEGOS
     * =====================================================
     */

    PCAP = "PCAP",

    PPT = "PPT",

    /**
     * =====================================================
     * RESOLUCIONES
     * =====================================================
     */

    START_RESOLUTION =
        "START_RESOLUTION",

    AWARD_RESOLUTION =
        "AWARD_RESOLUTION",

    FORMALIZATION_RESOLUTION =
        "FORMALIZATION_RESOLUTION",

    MODIFICATION_RESOLUTION =
        "MODIFICATION_RESOLUTION",

    TERMINATION_RESOLUTION =
        "TERMINATION_RESOLUTION",

    /**
     * =====================================================
     * PUBLICIDAD
     * =====================================================
     */

    CONTRACT_NOTICE =
        "CONTRACT_NOTICE",

    AWARD_NOTICE =
        "AWARD_NOTICE",

    FORMALIZATION_NOTICE =
        "FORMALIZATION_NOTICE",

    /**
     * =====================================================
     * DOCUMENTACIÓN CONTRACTUAL
     * =====================================================
     */

    CONTRACT = "CONTRACT",

    CONTRACT_MODIFICATION =
        "CONTRACT_MODIFICATION",

    /**
     * =====================================================
     * ANEXOS
     * =====================================================
     */

    ANNEX = "ANNEX",

    TEMPLATE = "TEMPLATE",

    /**
     * =====================================================
     * OTROS
     * =====================================================
     */

    CUSTOM = "CUSTOM"

}
