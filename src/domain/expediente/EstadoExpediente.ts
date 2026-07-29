/**
 * ============================================================
 * CONTRATA IA
 * EstadoExpediente
 * ============================================================
 *
 * Máquina oficial de estados del expediente.
 *
 * Ningún expediente podrá avanzar si no cumple
 * las validaciones correspondientes.
 *
 * ============================================================
 */

export enum EstadoExpediente {

    BORRADOR = "BORRADOR",

    IDENTIFICADO = "IDENTIFICADO",

    OBJETO_VALIDADO = "OBJETO_VALIDADO",

    CPV_VALIDADO = "CPV_VALIDADO",

    VALOR_VALIDADO = "VALOR_VALIDADO",

    PROCEDIMIENTO_VALIDADO = "PROCEDIMIENTO_VALIDADO",

    SOLVENCIA_VALIDADA = "SOLVENCIA_VALIDADA",

    PUBLICIDAD_VALIDADA = "PUBLICIDAD_VALIDADA",

    DOCUMENTACION_GENERADA = "DOCUMENTACION_GENERADA",

    REVISION_JURIDICA = "REVISION_JURIDICA",

    VALIDADO = "VALIDADO",

    LISTO_PARA_LICITAR = "LISTO_PARA_LICITAR",

    LICITACION_PUBLICADA = "LICITACION_PUBLICADA",

    ADJUDICADO = "ADJUDICADO",

    FORMALIZADO = "FORMALIZADO",

    EJECUCION = "EJECUCION",

    FINALIZADO = "FINALIZADO",

    ARCHIVADO = "ARCHIVADO"

}

export interface TransicionEstado {

    origen: EstadoExpediente;

    destino: EstadoExpediente;

}

export const TRANSICIONES_VALIDAS: TransicionEstado[] = [

    {

        origen: EstadoExpediente.BORRADOR,

        destino: EstadoExpediente.IDENTIFICADO

    },

    {

        origen: EstadoExpediente.IDENTIFICADO,

        destino: EstadoExpediente.OBJETO_VALIDADO

    },

    {

        origen: EstadoExpediente.OBJETO_VALIDADO,

        destino: EstadoExpediente.CPV_VALIDADO

    },

    {

        origen: EstadoExpediente.CPV_VALIDADO,

        destino: EstadoExpediente.VALOR_VALIDADO

    },

    {

        origen: EstadoExpediente.VALOR_VALIDADO,

        destino: EstadoExpediente.PROCEDIMIENTO_VALIDADO

    },

    {

        origen: EstadoExpediente.PROCEDIMIENTO_VALIDADO,

        destino: EstadoExpediente.SOLVENCIA_VALIDADA

    },

    {

        origen: EstadoExpediente.SOLVENCIA_VALIDADA,

        destino: EstadoExpediente.PUBLICIDAD_VALIDADA

    },

    {

        origen: EstadoExpediente.PUBLICIDAD_VALIDADA,

        destino: EstadoExpediente.DOCUMENTACION_GENERADA

    },

    {

        origen: EstadoExpediente.DOCUMENTACION_GENERADA,

        destino: EstadoExpediente.REVISION_JURIDICA

    },

    {

        origen: EstadoExpediente.REVISION_JURIDICA,

        destino: EstadoExpediente.VALIDADO

    },

    {

        origen: EstadoExpediente.VALIDADO,

        destino: EstadoExpediente.LISTO_PARA_LICITAR

    },

    {

        origen: EstadoExpediente.LISTO_PARA_LICITAR,

        destino: EstadoExpediente.LICITACION_PUBLICADA

    },

    {

        origen: EstadoExpediente.LICITACION_PUBLICADA,

        destino: EstadoExpediente.ADJUDICADO

    },

    {

        origen: EstadoExpediente.ADJUDICADO,

        destino: EstadoExpediente.FORMALIZADO

    },

    {

        origen: EstadoExpediente.FORMALIZADO,

        destino: EstadoExpediente.EJECUCION

    },

    {

        origen: EstadoExpediente.EJECUCION,

        destino: EstadoExpediente.FINALIZADO

    },

    {

        origen: EstadoExpediente.FINALIZADO,

        destino: EstadoExpediente.ARCHIVADO

    }

];

export function puedeTransicionar(

    origen: EstadoExpediente,

    destino: EstadoExpediente

): boolean {

    return TRANSICIONES_VALIDAS.some(

        t =>

            t.origen === origen &&

            t.destino === destino

    );

}
