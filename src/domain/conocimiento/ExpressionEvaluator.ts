/**
 * ============================================================
 * CONTRATA IA
 * ExpressionEvaluator
 * ============================================================
 *
 * Evaluador de expresiones utilizado por el
 * InferenceEngine.
 *
 * Permite interpretar las condiciones almacenadas
 * en los archivos JSON de reglas sin necesidad de
 * programarlas manualmente.
 *
 * Esta primera versión implementa únicamente los
 * operadores básicos.
 *
 * ============================================================
 */

export class ExpressionEvaluator {

    /**
     * Evalúa una expresión.
     */
    public evaluar(

        expresion: string,

        contexto: Record<string, any>

    ): boolean {

        const e = expresion.trim();

        if (e === "true") {

            return true;

        }

        if (e === "false") {

            return false;

        }

        return (

            this.evaluarMayorIgual(e, contexto)

            ?? this.evaluarMayor(e, contexto)

            ?? this.evaluarMenorIgual(e, contexto)

            ?? this.evaluarMenor(e, contexto)

            ?? this.evaluarIgual(e, contexto)

            ?? this.evaluarDistinto(e, contexto)

            ?? false

        );

    }

    /**
     * >
     */
    private evaluarMayor(

        e: string,

        c: Record<string, any>

    ): boolean | null {

        if (!e.includes(">") || e.includes(">=")) {

            return null;

        }

        const [izq, der] = e.split(">");

        return Number(c[izq.trim()]) > Number(der.trim());

    }

    /**
     * >=
     */
    private evaluarMayorIgual(

        e: string,

        c: Record<string, any>

    ): boolean | null {

        if (!e.includes(">=")) {

            return null;

        }

        const [izq, der] = e.split(">=");

        return Number(c[izq.trim()]) >= Number(der.trim());

    }

    /**
     * <
     */
    private evaluarMenor(

        e: string,

        c: Record<string, any>

    ): boolean | null {

        if (!e.includes("<") || e.includes("<=")) {

            return null;

        }

        const [izq, der] = e.split("<");

        return Number(c[izq.trim()]) < Number(der.trim());

    }

    /**
     * <=
     */
    private evaluarMenorIgual(

        e: string,

        c: Record<string, any>

    ): boolean | null {

        if (!e.includes("<=")) {

            return null;

        }

        const [izq, der] = e.split("<=");

        return Number(c[izq.trim()]) <= Number(der.trim());

    }

    /**
     * ==
     */
    private evaluarIgual(

        e: string,

        c: Record<string, any>

    ): boolean | null {

        if (!e.includes("==")) {

            return null;

        }

        const [izq, der] = e.split("==");

        const valor = der.trim()

            .replace(/'/g, "")

            .replace(/"/g, "");

        return String(c[izq.trim()]) === valor;

    }

    /**
     * !=
     */
    private evaluarDistinto(

        e: string,

        c: Record<string, any>

    ): boolean | null {

        if (!e.includes("!=")) {

            return null;

        }

        const [izq, der] = e.split("!=");

        const valor = der.trim()

            .replace(/'/g, "")

            .replace(/"/g, "");

        return String(c[izq.trim()]) !== valor;

    }

}
