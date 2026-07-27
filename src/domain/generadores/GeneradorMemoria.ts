/**
 * CONTRATA IA
 * ---------------------------------------------------------
 * Generador de Memoria Justificativa.
 *
 * Define el contrato que deberá implementar cualquier
 * componente capaz de generar automáticamente la memoria
 * justificativa del expediente.
 * ---------------------------------------------------------
 */

import { Expediente } from "../expediente/Expediente";
import { MemoriaJustificativa } from "../documentos/MemoriaJustificativa";

export interface GeneradorMemoria {

    generar(
        expediente: Expediente
    ): Promise<MemoriaJustificativa>;

}
