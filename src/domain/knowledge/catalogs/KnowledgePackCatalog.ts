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
 * Este archivo constituye el único punto de registro de los
 * paquetes de conocimiento disponibles.
 *
 * NO contiene:
 *
 * • reglas
 * • decisiones
 * • lógica jurídica
 * • interpretación normativa
 *
 * Únicamente centraliza el acceso a todos los Knowledge Pack.
 *
 * ============================================================
 */

import { KnowledgePack } from "../models/KnowledgePack";

import { KP0001 } from "../packs/KP0001_ProcedimientoAdjudicacion";

/**
 * Catálogo oficial de Knowledge Packs.
 */
export const KNOWLEDGE_PACK_CATALOG: KnowledgePack[] = [

    /**
     * Procedimiento de adjudicación.
     */
    KP0001

];

/**
 * Devuelve todos los Knowledge Pack.
 */
export function getKnowledgePacks(): KnowledgePack[] {

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
 * Número de paquetes registrados.
 */
export function knowledgePackCount(): number {

    return KNOWLEDGE_PACK_CATALOG.length;

}
