/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * MainLayout
 * ------------------------------------------------------------
 * Layout principal de la aplicación.
 *
 * Este componente representa la estructura visual común de
 * todas las pantallas de Contrata-IA.
 *
 * Responsabilidades:
 *
 * - Mostrar la barra superior.
 * - Mostrar el panel lateral.
 * - Mostrar el área principal.
 * - Mostrar el pie de aplicación.
 *
 * IMPORTANTE
 *
 * No contiene lógica de negocio.
 * No conoce el dominio.
 * No conoce ContractFile.
 * No conoce Knowledge Engine.
 * ============================================================
 */

import React, { ReactNode } from "react";

export interface MainLayoutProps {

    /**
     * Contenido principal.
     */
    children: ReactNode;

}

/**
 * Layout principal de la aplicación.
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {

    return (

        <div className="cia-layout">

            {/* ======================================================
                Barra superior
            ======================================================= */}

            <header className="cia-topbar">

                <div className="cia-logo">

                    CONTRATA-IA

                </div>

                <div className="cia-version">

                    UI Foundation

                </div>

            </header>

            {/* ======================================================
                Contenido principal
            ======================================================= */}

            <div className="cia-body">

                {/* ---------------------------------------------- */}
                {/* Panel lateral                                 */}
                {/* ---------------------------------------------- */}

                <aside className="cia-sidebar">

                    <nav>

                        <ul>

                            <li>Dashboard</li>

                            <li>Expedientes</li>

                            <li>Crear expediente</li>

                            <li>Biblioteca</li>

                            <li>Documentos</li>

                            <li>Configuración</li>

                        </ul>

                    </nav>

                </aside>

                {/* ---------------------------------------------- */}
                {/* Área principal                                */}
                {/* ---------------------------------------------- */}

                <main className="cia-content">

                    {children}

                </main>

            </div>

            {/* ======================================================
                Pie
            ======================================================= */}

            <footer className="cia-footer">

                CONTRATA-IA · Junta de Andalucía · Arquitectura Documental

            </footer>

        </div>

    );

};

export default MainLayout;
