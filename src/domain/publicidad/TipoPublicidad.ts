/**
 * ============================================================
 * CONTRATA IA
 * TipoPublicidad
 * ============================================================
 *
 * Canales jurídicos de publicidad. Los valores PLACE se conservan por
 * compatibilidad histórica, pero los motores universales deben preferir
 * conceptos jurídicos neutros cuando la plataforma concreta depende del
 * órgano de contratación.
 * ============================================================
 */

export enum TipoPublicidad {
    NINGUNA = "NINGUNA",
    PERFIL_CONTRATANTE = "PERFIL_CONTRATANTE",
    PERFIL_CONTRATANTE_DOUE = "PERFIL_CONTRATANTE_DOUE",
    PLACE = "PLACE",
    DOUE = "DOUE",
    PLACE_DOUE = "PLACE_DOUE"
}
