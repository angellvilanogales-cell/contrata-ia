/**
 * ============================================================
 * CONTRATA IA
 * ProcedimientoEngine
 * ============================================================
 *
 * Determina el procedimiento de adjudicación
 * conforme a la Ley 9/2017 de Contratos del
 * Sector Público.
 *
 * Esta primera versión implementa la lógica base
 * que posteriormente será sustituida por reglas
 * cargadas desde el banco de conocimiento.
 *
 * ============================================================
 */

import { BaseEngine } from "./BaseEngine";

import { DecisionJuridica } from "../domain/conocimiento/DecisionJuridica";

import { TipoProcedimiento } from "../domain/procedimiento/TipoProcedimiento";

export interface DatosProcedimiento {

    tipoContrato: string;

    valorEstimado: number;

}

export class ProcedimientoEngine extends BaseEngine {

    /**
     * Determina el procedimiento aplicable.
     */
    public determinar(

        datos: DatosProcedimiento

    ): DecisionJuridica<TipoProcedimiento> {

        const decision =

            new DecisionJuridica<TipoProcedimiento>();

        // ==========================================
        // CONTRATO MENOR
        // ==========================================

        if (

            this.esContratoMenor(datos)

        ) {

            decision.resultado =

                TipoProcedimiento.CONTRATO_MENOR;

            decision.confianza = 100;

            decision.articulos.push(

                "Artículo 118 LCSP"

            );

            decision.reglasAplicadas.push(

                "PROC-001"

            );

            decision.explicacion =

                "El valor estimado permite la utilización del contrato menor conforme al artículo 118 de la LCSP.";

            return decision;

        }

        // ==========================================
        // ABIERTO SIMPLIFICADO ABREVIADO
        // ==========================================

        if (

            this.esAbiertoSimplificadoAbreviado(datos)

        ) {

            decision.resultado =

                TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO;

            decision.confianza = 95;

            decision.articulos.push(

                "Artículo 159.6 LCSP"

            );

            decision.reglasAplicadas.push(

                "PROC-002"

            );

            decision.explicacion =

                "Procede el procedimiento abierto simplificado abreviado.";

            return decision;

        }

        // ==========================================
        // ABIERTO SIMPLIFICADO
        // ==========================================

        if (

            this.esAbiertoSimplificado(datos)

        ) {

            decision.resultado =

                TipoProcedimiento.ABIERTO_SIMPLIFICADO;

            decision.confianza = 90;

            decision.articulos.push(

                "Artículo 159 LCSP"

            );

            decision.reglasAplicadas.push(

                "PROC-003"

            );

            decision.explicacion =

                "Procede el procedimiento abierto simplificado.";

            return decision;

        }

        // ==========================================
        // ABIERTO
        // ==========================================

        decision.resultado =

            TipoProcedimiento.ABIERTO;

        decision.confianza = 80;

        decision.articulos.push(

            "Artículo 131 LCSP"

        );

        decision.reglasAplicadas.push(

            "PROC-004"

        );

        decision.explicacion =

            "Con carácter general procede el procedimiento abierto.";

        return decision;

    }

    /**
     * ------------------------------------------
     * Contrato menor.
     * ------------------------------------------
     *
     * NOTA:
     * Los umbrales se sustituirán posteriormente
     * por reglas externas.
     */
    private esContratoMenor(

        datos: DatosProcedimiento

    ): boolean {

        return datos.valorEstimado < 15000;

    }

    /**
     * ------------------------------------------
     * Artículo 159.6
     * ------------------------------------------
     */
    private esAbiertoSimplificadoAbreviado(

        datos: DatosProcedimiento

    ): boolean {

        return datos.valorEstimado <= 60000;

    }

    /**
     * ------------------------------------------
     * Artículo 159
     * ------------------------------------------
     */
    private esAbiertoSimplificado(

        datos: DatosProcedimiento

    ): boolean {

        return datos.valorEstimado <= 100000;

    }

}
