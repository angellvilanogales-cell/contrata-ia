/**
 * ============================================================
 * CONTRATA IA
 * LegalRule
 * ============================================================
 *
 * Regla jurídica completa.
 *
 * Representa una norma ejecutable derivada de la LCSP.
 *
 * Una regla está formada por:
 *
 * • Identificación
 * • Referencia normativa
 * • Prioridad
 * • Condiciones
 * • Acciones
 * • Motores afectados
 * • Documentos afectados
 *
 * ============================================================
 */

import { KnowledgeCondition } from "./KnowledgeCondition";
import { KnowledgeAction } from "./KnowledgeAction";

export enum RulePriority {

    VERY_LOW = 1,

    LOW = 2,

    NORMAL = 3,

    HIGH = 4,

    VERY_HIGH = 5

}

export interface LegalRule {

    /**
     * Identificador único.
     */
    id: string;

    /**
     * Nombre descriptivo.
     */
    nombre: string;

    /**
     * Artículo de la LCSP.
     */
    articulo: string;

    /**
     * Explicación jurídica.
     */
    descripcion: string;

    /**
     * Prioridad de evaluación.
     */
    prioridad: RulePriority;

    /**
     * Condiciones necesarias.
     */
    condiciones: KnowledgeCondition[];

    /**
     * Acciones a ejecutar.
     */
    acciones: KnowledgeAction[];

    /**
     * Motores afectados.
     */
    motores: string[];

    /**
     * Documentos afectados.
     */
    documentos: string[];

    /**
     * Permite activar o desactivar
     * temporalmente una regla.
     */
    activa: boolean;

}
