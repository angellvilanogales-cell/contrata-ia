/**
 * ============================================================
 * CONTRATA IA
 * WorkflowExpediente
 * ============================================================
 *
 * Orquesta la ejecución completa del expediente.
 *
 * Este componente representa el flujo oficial de
 * construcción de un expediente de contratación.
 *
 * ============================================================
 */

import { ExpedienteContext } from "../domain/expediente/ExpedienteContext";

export interface WorkflowPaso {

    id: string;

    nombre: string;

    obligatorio: boolean;

    completado: boolean;

}

export class WorkflowExpediente {

    public construir(

        contexto: ExpedienteContext

    ): WorkflowPaso[] {

        return [

            {

                id: "IDENTIFICACION",

                nombre: "Identificación del expediente",

                obligatorio: true,

                completado: false

            },

            {

                id: "OBJETO",

                nombre: "Objeto del contrato",

                obligatorio: true,

                completado: false

            },

            {

                id: "CPV",

                nombre: "Determinación CPV",

                obligatorio: true,

                completado: false

            },

            {

                id: "VALOR",

                nombre: "Valor estimado",

                obligatorio: true,

                completado: false

            },

            {

                id: "PROCEDIMIENTO",

                nombre: "Procedimiento",

                obligatorio: true,

                completado: false

            },

            {

                id: "SOLVENCIA",

                nombre: "Solvencia",

                obligatorio: true,

                completado: false

            },

            {

                id: "PUBLICIDAD",

                nombre: "Publicidad",

                obligatorio: true,

                completado: false

            },

            {

                id: "PLAZOS",

                nombre: "Plazos",

                obligatorio: true,

                completado: false

            },

            {

                id: "DOCUMENTACION",

                nombre: "Generación documental",

                obligatorio: true,

                completado: false

            },

            {

                id: "REVISION",

                nombre: "Revisión jurídica",

                obligatorio: true,

                completado: false

            }

        ];

    }

}
