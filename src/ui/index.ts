/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * UI Public API
 * ------------------------------------------------------------
 * Punto de entrada de la capa de presentación.
 *
 * Este módulo centraliza las exportaciones públicas de la UI
 * para facilitar su integración con la aplicación anfitriona,
 * independientemente del framework de arranque utilizado.
 *
 * IMPORTANTE
 * ----------
 * Este archivo:
 *
 * - No inicializa React.
 * - No realiza renderizado.
 * - No depende de Vite.
 * - No depende de Next.js.
 * - No depende de ningún bundler.
 *
 * La responsabilidad de montar la aplicación recaerá sobre la
 * infraestructura del proyecto que integre la capa UI.
 * ============================================================
 */

export { default as App } from "./App";

export * from "./types";
