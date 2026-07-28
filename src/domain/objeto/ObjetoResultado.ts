/**
 * ============================================================
 * CONTRATA IA
 * ObjetoResultado
 * ============================================================
 *
 * Resultado obtenido tras analizar el objeto
 * del contrato conforme a la LCSP.
 *
 * Será utilizado por:
 *
 * • CPVEngine
 * • ProcedimientoEngine
 * • LotesEngine
 * • MemoriaEngine
 * • PCAPEngine
 *
 * ============================================================
 */

import { DecisionJuridica } from "../conocimiento/DecisionJuridica";

export class ObjetoResultado {

    /**
     * Objeto válido.
     */
    public valido = true;

    /**
     * Descripción normalizada.
     */
    public descripcionNormalizada = "";

    /**
     * CPV candidatos.
     */
    public cpv: string[] = [];

    /**
     * Tipo de contrato identificado.
     */
    public tipoContrato = "";

    /**
     * Riesgo de fraccionamiento.
     */
    public posibleFraccionamiento = false;

    /**
     * Debe analizarse división en lotes.
     */
    public requiereAnalisisLotes = true;

    /**
     * Advertencias detectadas.
     */
    public advertencias: string[] = [];

    /**
     * Errores detectados.
     */
    public errores: string[] = [];

    /**
     * Decisión jurídica generada.
     */
    public decision?: DecisionJuridica<string>;

}
