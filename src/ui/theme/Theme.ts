/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * Theme
 * ------------------------------------------------------------
 * Sistema de diseño oficial de la interfaz de usuario.
 *
 * Este módulo centraliza todos los valores visuales utilizados
 * por la capa de presentación:
 *
 * - Colores
 * - Tipografía
 * - Espaciados
 * - Bordes
 * - Radios
 * - Sombras
 * - Tamaños
 * - Capas (z-index)
 * - Transiciones
 *
 * No contiene lógica de negocio.
 * No depende del dominio.
 * No depende del framework de arranque.
 * ============================================================
 */

/* ============================================================
 * Tipos
 * ============================================================ */

export interface ColorPalette {
    primary: string;
    primaryLight: string;
    primaryDark: string;

    secondary: string;

    success: string;
    warning: string;
    danger: string;
    info: string;

    background: string;
    surface: string;
    surfaceAlt: string;

    border: string;

    text: string;
    textSecondary: string;
    textDisabled: string;

    white: string;
    black: string;
}

export interface Typography {

    fontFamily: string;

    fontSize: {

        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
        xxl: string;

    };

    fontWeight: {

        light: number;
        regular: number;
        medium: number;
        semibold: number;
        bold: number;

    };

}

export interface Spacing {

    xxs: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;

}

export interface Radius {

    sm: number;
    md: number;
    lg: number;
    xl: number;
    round: number;

}

export interface Shadow {

    sm: string;
    md: string;
    lg: string;

}

export interface Layout {

    sidebarWidth: number;

    topbarHeight: number;

    footerHeight: number;

    contentMaxWidth: number;

}

export interface ZIndex {

    dropdown: number;

    sticky: number;

    overlay: number;

    modal: number;

    notification: number;

}

export interface Transition {

    fast: string;

    normal: string;

    slow: string;

}

export interface Theme {

    name: string;

    version: string;

    colors: ColorPalette;

    typography: Typography;

    spacing: Spacing;

    radius: Radius;

    shadow: Shadow;

    layout: Layout;

    zIndex: ZIndex;

    transition: Transition;

}

/* ============================================================
 * Theme oficial
 * ============================================================ */

export const theme: Theme = {

    name: "Contrata-IA",

    version: "1.0.0",

    colors: {

        primary: "#0066CC",

        primaryLight: "#2D8CFF",

        primaryDark: "#004C99",

        secondary: "#4B5563",

        success: "#2E7D32",

        warning: "#ED6C02",

        danger: "#D32F2F",

        info: "#0288D1",

        background: "#F5F7FA",

        surface: "#FFFFFF",

        surfaceAlt: "#EEF2F6",

        border: "#D7DEE8",

        text: "#1F2937",

        textSecondary: "#6B7280",

        textDisabled: "#9CA3AF",

        white: "#FFFFFF",

        black: "#000000"

    },

    typography: {

        fontFamily:
            "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",

        fontSize: {

            xs: "12px",

            sm: "13px",

            md: "14px",

            lg: "16px",

            xl: "20px",

            xxl: "28px"

        },

        fontWeight: {

            light: 300,

            regular: 400,

            medium: 500,

            semibold: 600,

            bold: 700

        }

    },

    spacing: {

        xxs: 2,

        xs: 4,

        sm: 8,

        md: 16,

        lg: 24,

        xl: 32,

        xxl: 48

    },

    radius: {

        sm: 2,

        md: 6,

        lg: 10,

        xl: 16,

        round: 9999

    },

    shadow: {

        sm: "0 1px 3px rgba(0,0,0,.10)",

        md: "0 4px 12px rgba(0,0,0,.12)",

        lg: "0 10px 30px rgba(0,0,0,.16)"

    },

    layout: {

        sidebarWidth: 280,

        topbarHeight: 64,

        footerHeight: 40,

        contentMaxWidth: 1600

    },

    zIndex: {

        dropdown: 100,

        sticky: 200,

        overlay: 500,

        modal: 1000,

        notification: 2000

    },

    transition: {

        fast: "120ms ease",

        normal: "220ms ease",

        slow: "350ms ease"

    }

};

/* ============================================================
 * Exportación por defecto
 * ============================================================ */

export default theme;
