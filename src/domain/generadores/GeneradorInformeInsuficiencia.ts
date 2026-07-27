/**
 * CONTRATA IA
 * ---------------------------------------------------------
 * Generador del informe de insuficiencia de medios.
 * ---------------------------------------------------------
 */

import { Expediente } from "../expediente/Expediente";
import { InformeInsuficienciaMedios } from "../documentos/InformeInsuficienciaMedios";

export interface GeneradorInformeInsuficiencia {

    generar(
        expediente: Expediente
    ): Promise<InformeInsuficienciaMedios>;

}
