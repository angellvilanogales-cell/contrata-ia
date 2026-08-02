/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * App
 * ------------------------------------------------------------
 * Componente raíz de la interfaz de usuario.
 *
 * Responsabilidades:
 *  - Inicializar la aplicación.
 *  - Proporcionar la estructura base de la UI.
 *  - Delegar la composición visual al MainLayout.
 *
 * IMPORTANTE
 * ----------
 * Este componente no contiene lógica de negocio ni depende del
 * dominio del sistema. Toda la funcionalidad se incorporará
 * progresivamente mediante componentes especializados.
 * ============================================================
 */

import React from "react";

/**
 * Componente principal de la aplicación.
 *
 * Temporalmente muestra una estructura básica mientras se
 * desarrollan los distintos módulos de la interfaz.
 *
 * En futuras releases este componente delegará la composición
 * completa en el MainLayout y el sistema de navegación.
 */
const App: React.FC = () => {
    return (
        <div
            className="contrataia-app"
            style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                backgroundColor: "#f5f7fa",
                color: "#1f2937",
                fontFamily:
                    "Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
            }}
        >
            <header
                style={{
                    padding: "24px 32px",
                    borderBottom: "1px solid #d1d5db",
                    backgroundColor: "#ffffff"
                }}
            >
                <h1
                    style={{
                        margin: 0,
                        fontSize: "2rem",
                        fontWeight: 700
                    }}
                >
                    CONTRATA-IA
                </h1>

                <p
                    style={{
                        marginTop: "8px",
                        color: "#6b7280"
                    }}
                >
                    Sistema experto para la generación de expedientes de
                    contratación pública.
                </p>
            </header>

            <main
                style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "48px"
                }}
            >
                <section
                    style={{
                        maxWidth: "900px",
                        width: "100%",
                        padding: "40px",
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
                    }}
                >
                    <h2>Interfaz de usuario</h2>

                    <p>
                        La infraestructura base de la interfaz se ha creado
                        correctamente.
                    </p>

                    <p>
                        En las siguientes releases se incorporarán:
                    </p>

                    <ul>
                        <li>Dashboard</li>
                        <li>Gestión de expedientes</li>
                        <li>Asistente paso a paso</li>
                        <li>Biblioteca documental</li>
                        <li>Árbol del expediente</li>
                        <li>Visor documental</li>
                        <li>Componentes reutilizables</li>
                    </ul>
                </section>
            </main>

            <footer
                style={{
                    padding: "16px",
                    textAlign: "center",
                    borderTop: "1px solid #d1d5db",
                    backgroundColor: "#ffffff",
                    color: "#6b7280",
                    fontSize: "0.9rem"
                }}
            >
                CONTRATA-IA · UI Foundation · Release R1A
            </footer>
        </div>
    );
};

export default App;
