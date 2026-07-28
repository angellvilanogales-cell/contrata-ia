/**
 * CONTRATA IA
 * =========================================================
 * Regla de clasificación CPV.
 *
 * Permitirá obtener automáticamente el código o códigos
 * CPV más adecuados para el objeto del contrato.
 * =========================================================
 */

import { Expediente } from "../expediente/Expediente";

export class ReglaCPV {

    public readonly nombre = "Clasificación CPV";

    public obtenerCodigos(
        expediente: Expediente
    ): string[] {

        // IMPLEMENTAR CON BASE DE CONOCIMIENTO CPV

        return [];

    }

}
