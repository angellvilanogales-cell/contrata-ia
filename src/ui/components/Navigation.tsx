/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * Navigation
 * ------------------------------------------------------------
 * Componentes de navegación de la aplicación.
 *
 * Este módulo concentra toda la infraestructura de navegación
 * de la interfaz de usuario.
 *
 * Contiene:
 *
 * - Sidebar
 * - TopBar
 * - Breadcrumb
 * - Toolbar
 * - Interfaces públicas
 * - Componentes auxiliares
 *
 * No contiene lógica de negocio.
 * No depende del dominio.
 * ============================================================
 */

import React, { ReactNode } from "react";

/* ============================================================
 * Interfaces
 * ============================================================ */

export interface NavigationItem {

    id: string;

    label: string;

    route: string;

    icon?: ReactNode;

    disabled?: boolean;

}

export interface SidebarProps {

    items: NavigationItem[];

    selectedRoute?: string;

    onNavigate?: (route: string) => void;

}

export interface TopBarProps {

    title: string;

    subtitle?: string;

    actions?: ReactNode;

}

export interface BreadcrumbItem {

    label: string;

    route?: string;

}

export interface BreadcrumbProps {

    items: BreadcrumbItem[];

}

/* ============================================================
 * Sidebar
 * ============================================================ */

export const Sidebar: React.FC<SidebarProps> = ({
    items,
    selectedRoute,
    onNavigate
}) => {

    return (

        <aside className="cia-sidebar">

            <div className="cia-sidebar-header">

                CONTRATA-IA

            </div>

            <nav>

                <ul className="cia-navigation-list">

                    {items.map(item => (

                        <li
                            key={item.id}
                            className={
                                item.route === selectedRoute
                                    ? "active"
                                    : ""
                            }
                        >

                            <button
                                type="button"
                                disabled={item.disabled}
                                onClick={() => onNavigate?.(item.route)}
                            >

                                {item.icon}

                                <span>

                                    {item.label}

                                </span>

                            </button>

                        </li>

                    ))}

                </ul>

            </nav>

        </aside>

    );

};

/* ============================================================
 * TopBar
 * ============================================================ */

export const TopBar: React.FC<TopBarProps> = ({
    title,
    subtitle,
    actions
}) => {

    return (

        <header className="cia-topbar">

            <div>

                <h1>{title}</h1>

                {subtitle && (

                    <p>{subtitle}</p>

                )}

            </div>

            <div>

                {actions}

            </div>

        </header>

    );

};

/* ============================================================
 * Breadcrumb
 * ============================================================ */

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {

    return (

        <nav
            className="cia-breadcrumb"
            aria-label="breadcrumb"
        >

            {items.map((item, index) => (

                <React.Fragment key={index}>

                    {index > 0 && (

                        <span className="separator">

                            /

                        </span>

                    )}

                    <span>

                        {item.label}

                    </span>

                </React.Fragment>

            ))}

        </nav>

    );

};

/* ============================================================
 * Toolbar
 * ============================================================ */

export interface ToolbarProps {

    children: ReactNode;

}

export const Toolbar: React.FC<ToolbarProps> = ({
    children
}) => (

    <section className="cia-toolbar">

        {children}

    </section>

);

/* ============================================================
 * Navegación por defecto
 * ============================================================ */

export const DEFAULT_NAVIGATION: NavigationItem[] = [

    {
        id: "dashboard",
        label: "Dashboard",
        route: "/"
    },

    {
        id: "contract-files",
        label: "Expedientes",
        route: "/contract-files"
    },

    {
        id: "wizard",
        label: "Crear expediente",
        route: "/wizard"
    },

    {
        id: "library",
        label: "Biblioteca",
        route: "/library"
    },

    {
        id: "documents",
        label: "Documentos",
        route: "/documents"
    },

    {
        id: "settings",
        label: "Configuración",
        route: "/settings"
    }

];
