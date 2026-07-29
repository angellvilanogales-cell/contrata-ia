/**
 * ============================================================
 * CONTRATA IA
 * PlanDocumentalEngine
 * ============================================================
 *
 * Construye automáticamente la estructura lógica de
 * un documento administrativo.
 *
 * No genera texto.
 *
 * Decide QUÉ conocimiento debe incorporarse.
 *
 * ============================================================
 */

import { ExpedienteContext } from "../expediente/ExpedienteContext";

export interface DocumentoNodo {

    orden: number;

    nombre: string;

    categoria: string;

}

export class PlanDocumentalEngine {

    /**
     * Construye el plan documental de una
     * Memoria Justificativa.
     */
    public construirMemoria(

        contexto: ExpedienteContext

    ): DocumentoNodo[] {

        const plan: DocumentoNodo[] = [];

        let orden = 1;

        plan.push({

            orden: orden++,

            nombre: "Objeto",

            categoria: "OBJETO"

        });

        plan.push({

            orden: orden++,

            nombre: "Necesidad",

            categoria: "NECESIDAD_ADMINISTRATIVA"

        });

        plan.push({

            orden: orden++,

            nombre: "Insuficiencia de medios",

            categoria: "INSUFICIENCIA_MEDIOS"

        });

        plan.push({

            orden: orden++,

            nombre: "Tipo de contrato",

            categoria: "TIPO_CONTRATO"

        });

        plan.push({

            orden: orden++,

            nombre: "CPV",

            categoria: "CPV"

        });

        plan.push({

            orden: orden++,

            nombre: "Valor estimado",

            categoria: "VALOR"

        });

        plan.push({

            orden: orden++,

            nombre: "Procedimiento",

            categoria: "PROCEDIMIENTO"

        });

        plan.push({

            orden: orden++,

            nombre: "Publicidad",

            categoria: "PUBLICIDAD"

        });

        if (contexto.solvencia) {

            plan.push({

                orden: orden++,

                nombre: "Solvencia",

                categoria: "SOLVENCIA"

            });

        }

        if (contexto.divisionLotes !== undefined) {

            plan.push({

                orden: orden++,

                nombre: "División en lotes",

                categoria: "LOTES"

            });

        }

        if (contexto.duracionMeses) {

            plan.push({

                orden: orden++,

                nombre: "Duración",

                categoria: "DURACION"

            });

        }

        plan.push({

            orden: orden++,

            nombre: "Conclusión",

            categoria: "CONCLUSION"

        });

        return plan;

    }

}
