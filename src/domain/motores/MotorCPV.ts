/**
 * CONTRATA IA
 * ---------------------------------------------------------
 * Motor de clasificación CPV.
 *
 * Obtiene el código o los códigos CPV que mejor describen
 * el objeto del contrato y devuelve una propuesta motivada.
 * ---------------------------------------------------------
 */

export interface MotorCPV {

    obtenerCodigosCPV(
        objetoContrato: string
    ): Promise<string[]>;

}
