/**
 * ============================================================
 * CONTRATA IA
 * ExpedienteValidator
 * ============================================================
 *
 * Validador central del expediente.
 *
 * Comprueba que todos los elementos obligatorios
 * existen antes de avanzar en el workflow.
 *
 * No toma decisiones jurídicas.
 *
 * Solo valida.
 *
 * ============================================================
 */

import { ExpedienteContext } from "../expediente/ExpedienteContext";

export interface ErrorValidacion {

    codigo: string;

    campo: string;

    mensaje: string;

}

export class ExpedienteValidator {

    /**
     * Ejecuta todas las validaciones.
     */
    public validar(

        expediente: ExpedienteContext

    ): ErrorValidacion[] {

        const errores: ErrorValidacion[] = [];

        this.validarObjeto(

            expediente,

            errores

        );

        this.validarCPV(

            expediente,

            errores

        );

        this.validarValorEstimado(

            expediente,

            errores

        );

        this.validarProcedimiento(

            expediente,

            errores

        );

        this.validarDuracion(

            expediente,

            errores

        );

        return errores;

    }

    /**
     * Objeto
     */
    private validarObjeto(

        expediente: ExpedienteContext,

        errores: ErrorValidacion[]

    ): void {

        if (

            !expediente.objeto ||

            expediente.objeto.trim() === ""

        ) {

            errores.push({

                codigo: "OBJ001",

                campo: "objeto",

                mensaje: "Debe indicarse el objeto del contrato."

            });

        }

    }

    /**
     * CPV
     */
    private validarCPV(

        expediente: ExpedienteContext,

        errores: ErrorValidacion[]

    ): void {

        if (

            !expediente.cpv ||

            expediente.cpv.length === 0

        ) {

            errores.push({

                codigo: "CPV001",

                campo: "cpv",

                mensaje: "Debe seleccionarse al menos un código CPV."

            });

        }

    }

    /**
     * Valor estimado
     */
    private validarValorEstimado(

        expediente: ExpedienteContext,

        errores: ErrorValidacion[]

    ): void {

        if (

            expediente.valorEstimado <= 0

        ) {

            errores.push({

                codigo: "VAL001",

                campo: "valorEstimado",

                mensaje: "El valor estimado debe ser mayor que cero."

            });

        }

    }

    /**
     * Procedimiento
     */
    private validarProcedimiento(

        expediente: ExpedienteContext,

        errores: ErrorValidacion[]

    ): void {

        if (

            !expediente.procedimiento

        ) {

            errores.push({

                codigo: "PRO001",

                campo: "procedimiento",

                mensaje: "Debe determinarse el procedimiento de adjudicación."

            });

        }

    }

    /**
     * Duración
     */
    private validarDuracion(

        expediente: ExpedienteContext,

        errores: ErrorValidacion[]

    ): void {

        if (

            expediente.duracionMeses <= 0

        ) {

            errores.push({

                codigo: "DUR001",

                campo: "duracion",

                mensaje: "Debe indicarse la duración del contrato."

            });

        }

    }

    /**
     * Devuelve true si todo es correcto.
     */
    public esValido(

        expediente: ExpedienteContext

    ): boolean {

        return this.validar(

            expediente

        ).length === 0;

    }

}
