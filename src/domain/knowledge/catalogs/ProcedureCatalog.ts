/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ProcedureCatalog
 * ------------------------------------------------------------
 * Catálogo responsable de determinar el procedimiento de
 * contratación aplicable.
 *
 * IMPORTANTE:
 * Este catálogo NO implementa todavía reglas jurídicas.
 *
 * En esta primera versión únicamente define la estructura que
 * utilizará el Knowledge Engine.
 *
 * Toda la lógica jurídica se incorporará progresivamente en
 * versiones posteriores.
 * ============================================================
 */

export interface ProcedureContext {

    contractType?: string;

    estimatedValue?: number;

    budget?: number;

    cpv?: string;

    sara?: boolean;

    emergency?: boolean;

    urgent?: boolean;

    reservedContract?: boolean;

}

export interface ProcedureResult {

    procedure?: string;

    publication?: string[];

    deadlines?: string[];

    mandatoryDocuments?: string[];

    observations?: string[];

    success: boolean;

}

export class ProcedureCatalog {

    /**
     * Nombre interno del catálogo.
     */
    public readonly id = "procedure-catalog";

    /**
     * Versión.
     */
    public readonly version = "0.1.0";

    /**
     * Descripción.
     */
    public readonly description =
        "Knowledge catalog responsible for contract procedure determination.";

    /**
     * Punto único de entrada.
     *
     * En futuras versiones este método aplicará las reglas de la
     * LCSP para determinar automáticamente:
     *
     * - Procedimiento
     * - Publicidad
     * - Plazos
     * - Documentación
     * - Observaciones
     */
    public resolve(
        context: ProcedureContext
    ): ProcedureResult {

        // -------------------------------------------------------
        // TODO
        //
        // Aplicar reglas jurídicas.
        //
        // Ejemplos:
        //
        // - Contrato menor
        // - Abierto
        // - Abierto simplificado
        // - Simplificado abreviado
        // - Restringido
        // - Negociado
        // - Diálogo competitivo
        // - Asociación para la innovación
        //
        // -------------------------------------------------------

        return {

            success: false,

            observations: [

                "Procedure rules not implemented yet."

            ]

        };

    }

}
