/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * KnowledgePackCatalog
 * ------------------------------------------------------------
 * Registro central de todos los Knowledge Pack del sistema.
 *
 * RESPONSABILIDAD
 *
 * Este archivo constituye el único punto de acceso a los
 * paquetes de conocimiento disponibles.
 *
 * NO interpreta normativa.
 * NO ejecuta reglas.
 * NO toma decisiones.
 *
 * ============================================================
 */

import {
    KnowledgePack
} from "../models/KnowledgePack";

import {
    KP0001
} from "../packs/KP0001_ProcedimientoAdjudicacion";

/**
 * Catálogo oficial de Knowledge Packs.
 *
 * IMPORTANTE:
 * Todos los nuevos paquetes deberán registrarse aquí.
 */
export const KNOWLEDGE_PACK_CATALOG: ReadonlyArray<KnowledgePack> = [

    /**
     * KP-0001
     * Procedimiento de adjudicación.
     */
    KP0001

];

/**
 * Devuelve todos los paquetes registrados.
 */
export function getKnowledgePacks(): ReadonlyArray<KnowledgePack> {

    return KNOWLEDGE_PACK_CATALOG;

}

/**
 * Busca un Knowledge Pack por identificador.
 */
export function findKnowledgePack(
    id: string
): KnowledgePack | undefined {

    return KNOWLEDGE_PACK_CATALOG.find(
        knowledgePack => knowledgePack.metadata.id === id
    );

}

/**
 * Comprueba si existe un Knowledge Pack.
 */
export function hasKnowledgePack(
    id: string
): boolean {

    return KNOWLEDGE_PACK_CATALOG.some(
        knowledgePack => knowledgePack.metadata.id === id
    );

}

/**
 * Número total de paquetes registrados.
 */
export function knowledgePackCount(): number {

    return KNOWLEDGE_PACK_CATALOG.length;

}

/**
 * Devuelve todos los paquetes pertenecientes
 * a un dominio concreto.
 */
export function getKnowledgePacksByDomain(
    domain: string
): KnowledgePack[] {

    return KNOWLEDGE_PACK_CATALOG.filter(
        knowledgePack => knowledgePack.metadata.domain === domain
    );

}

/**
 * Devuelve únicamente los paquetes validados.
 */
export function getValidatedKnowledgePacks(): KnowledgePack[] {

    return KNOWLEDGE_PACK_CATALOG.filter(
        knowledgePack => knowledgePack.metadata.status === "validated"
    );

}

/**
 * Devuelve únicamente los paquetes en borrador.
 */
export function getDraftKnowledgePacks(): KnowledgePack[] {

    return KNOWLEDGE_PACK_CATALOG.filter(
        knowledgePack => knowledgePack.metadata.status === "draft"
    );

}
