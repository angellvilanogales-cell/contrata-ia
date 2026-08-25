/**
 * ============================================================
 * CONTRATA IA
 * ObjetoEngine
 * ============================================================
 *
 * Analiza y normaliza el objeto sin invadir los dominios económico,
 * procedimental o documental. La necesidad se conecta con el artículo 28
 * LCSP y la definición/división del objeto con el artículo 99 LCSP.
 * ============================================================
 */

import { BaseEngine } from "./BaseEngine";
import { DecisionJuridica } from "../domain/conocimiento/DecisionJuridica";
import { ObjetoContrato } from "../domain/objeto/ObjetoContrato";
import { ObjetoResultado } from "../domain/objeto/ObjetoResultado";
import { ObjetoValidator } from "../domain/objeto/ObjetoValidator";

export class ObjetoEngine extends BaseEngine {

    private readonly validator = new ObjetoValidator();

    public async analizar(objeto: ObjetoContrato): Promise<ObjetoResultado> {

        const resultado = new ObjetoResultado();
        const errores = this.validator.validar(objeto);

        resultado.errores.push(...errores);
        resultado.valido = errores.length === 0;
        resultado.descripcionNormalizada = this.normalizar(objeto.descripcion);
        resultado.tipoContrato = objeto.tipoContrato;

        /*
         * Art. 99.3 LCSP: debe analizarse si la naturaleza o el objeto permiten
         * división en lotes. "Analizar" no equivale a imponer lotes y no depende
         * del importe. La decisión concreta permanece en el dominio de lotes.
         */
        resultado.requiereAnalisisLotes = true;

        if (objeto.valorEstimado > 0 || objeto.presupuestoBase > 0) {
            resultado.advertencias.push(
                "Los importes aportados no se utilizan para validar el objeto; deben comprobarse en el dominio económico correspondiente."
            );
        }

        resultado.decision = this.crearDecision(resultado);

        return resultado;

    }

    private normalizar(texto: string): string {
        return texto.trim().replace(/\s+/g, " ");
    }

    private crearDecision(resultado: ObjetoResultado): DecisionJuridica<string> {

        const decision = new DecisionJuridica<string>();

        decision.explicacion = resultado.valido
            ? "El objeto y la necesidad superan las validaciones iniciales; queda pendiente el análisis separado de lotes y del resto de dominios del expediente."
            : "El objeto o la necesidad presentan incidencias que deben corregirse antes de promover esta propuesta.";

        decision.articulos.push(
            "art. 28 LCSP",
            "art. 99 LCSP"
        );
        decision.normativa.push(
            "Ley 9/2017, de 8 de noviembre, de Contratos del Sector Público"
        );
        decision.reglasAplicadas.push(
            "OBJ-2026-NEED",
            "OBJ-2026-SCOPE",
            "OBJ-2026-LOTS-ANALYSIS"
        );

        if (resultado.valido) {
            decision.resultado = resultado.descripcionNormalizada;
            decision.confianza = 100;
        } else {
            decision.confianza = 0;
            decision.observaciones.push(...resultado.errores);
        }

        decision.observaciones.push(
            "El motor no decide por sí solo la división en lotes ni valida VE, PBL, precio o duración."
        );

        return decision;

    }

}
