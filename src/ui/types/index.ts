/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * UI Types
 * ------------------------------------------------------------
 * Tipos e interfaces comunes para la capa de presentación.
 *
 * Este módulo constituye el punto central de definición de los
 * contratos utilizados por la interfaz de usuario.
 *
 * IMPORTANTE
 * ----------
 * - No contiene lógica de negocio.
 * - No depende del dominio.
 * - No depende del Knowledge Engine.
 * - No depende del Rule Engine.
 * - Solo define contratos para la UI.
 * ============================================================
 */

/**
 * Identificador único.
 */
export type Identifier = string;

/**
 * Ruta lógica de navegación.
 *
 * La implementación concreta de la navegación será incorporada
 * posteriormente mediante un adaptador, manteniendo desacoplada
 * la interfaz de usuario.
 */
export type RoutePath = string;

/**
 * Estado de carga de un componente.
 */
export enum LoadingState {
    Idle = "idle",
    Loading = "loading",
    Success = "success",
    Error = "error"
}

/**
 * Tamaños estándar utilizados por los componentes visuales.
 */
export enum ComponentSize {
    Small = "small",
    Medium = "medium",
    Large = "large"
}

/**
 * Niveles de severidad para mensajes de la interfaz.
 */
export enum MessageSeverity {
    Info = "info",
    Success = "success",
    Warning = "warning",
    Error = "error"
}

/**
 * Elemento del menú principal.
 */
export interface NavigationItem {

    /**
     * Identificador.
     */
    id: Identifier;

    /**
     * Texto mostrado.
     */
    title: string;

    /**
     * Ruta lógica.
     */
    route: RoutePath;

    /**
     * Icono asociado.
     *
     * El tipo concreto del icono se definirá
     * cuando se incorpore la biblioteca visual.
     */
    icon?: string;

    /**
     * Elementos hijos.
     */
    children?: NavigationItem[];

    /**
     * Indica si está habilitado.
     */
    enabled: boolean;

}

/**
 * Migas de pan.
 */
export interface BreadcrumbItem {

    /**
     * Identificador.
     */
    id: Identifier;

    /**
     * Texto.
     */
    label: string;

    /**
     * Ruta.
     */
    route: RoutePath;

}

/**
 * Información de una tarjeta del Dashboard.
 */
export interface DashboardCard {

    /**
     * Identificador.
     */
    id: Identifier;

    /**
     * Título.
     */
    title: string;

    /**
     * Valor mostrado.
     */
    value: string;

    /**
     * Descripción.
     */
    description: string;

}

/**
 * Estado visual de la aplicación.
 */
export interface UIState {

    /**
     * Ruta actual.
     */
    currentRoute: RoutePath;

    /**
     * Menú lateral expandido.
     */
    sidebarExpanded: boolean;

    /**
     * Estado general de carga.
     */
    loadingState: LoadingState;

}

/**
 * Contrato base de cualquier página.
 */
export interface PageProps {

    /**
     * Título de la página.
     */
    title: string;

}

/**
 * Contrato base de cualquier componente visual.
 */
export interface ComponentProps {

    /**
     * Clase CSS adicional.
     */
    className?: string;

}
