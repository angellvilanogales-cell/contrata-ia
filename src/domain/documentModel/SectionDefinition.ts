/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * SectionDefinition
 * ------------------------------------------------------------
 * Define un epígrafe documental.
 *
 * Ejemplos:
 *
 * • Necesidad
 * • Objeto
 * • CPV
 * • Solvencia
 * • Garantías
 * • Lotes
 * • Procedimiento
 *
 * El generador únicamente rellenará
 * este modelo.
 *
 * ============================================================
 */

import { DocumentContext } from "../documental/DocumentContext";

export interface SectionDefinition {

    /**
     * Identificador.
     */

    id:string;

    /**
     * Número del epígrafe.
     */

    order:number;

    /**
     * Título.
     */

    title:string;

    /**
     * Descripción funcional.
     */

    description:string;

    /**
     * ¿Es obligatorio?
     */

    mandatory:boolean;

    /**
     * ¿Puede editarse?
     */

    editable:boolean;

    /**
     * ¿Puede reutilizarse?
     */

    reusable:boolean;

    /**
     * Clave reutilizable.
     *
     * Ejemplo:
     *
     * NEED
     *
     * OBJECT
     *
     * CPV
     *
     */

    reusableKey?:string;

    /**
     * Artículos LCSP relacionados.
     */

    legalArticles:string[];

    /**
     * Dependencias.
     */

    dependsOn:string[];

    /**
     * Exclusiones.
     */

    excludes:string[];

    /**
     * Prioridad.
     */

    priority:number;

    /**
     * Visibilidad.
     */

    isVisible(

        context:DocumentContext

    ):boolean;

    /**
     * ¿Debe renderizarse?
     */

    shouldRender(

        context:DocumentContext

    ):boolean;

}
