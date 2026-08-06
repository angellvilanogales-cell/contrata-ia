/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * CRITERIOS ADJUDICACIÓN GENERATOR
 *
 * Generador del Informe de Criterios de Adjudicación.
 *
 ******************************************************************************/

import { GenerationContext } from "../GenerationContext";
import { DocumentGenerator } from "../DocumentGenerationPipeline";

export interface CriterioAdjudicacion {

    nombre: string;

    descripcion: string;

    ponderacion: number;

    tipo: "AUTOMATICO" | "JUICIO_VALOR";

}

export class CriteriosAdjudicacionGenerator
    implements DocumentGenerator {

    public readonly name =
        "Criterios de Adjudicación";

    /**************************************************************************
     *
     * Generación
     *
     **************************************************************************/

    public async generate(

        context: GenerationContext

    ): Promise<void> {

        const expediente =
            context.expediente as any;

        const criterios: CriterioAdjudicacion[] =

            expediente.criteriosAdjudicacion ?? [];

        const totalPonderacion =

            criterios.reduce(

                (total, criterio) =>

                    total + criterio.ponderacion,

                0

            );

        const automaticos =

            criterios.filter(

                criterio =>

                    criterio.tipo === "AUTOMATICO"

            );

        const juicioValor =

            criterios.filter(

                criterio =>

                    criterio.tipo === "JUICIO_VALOR"

            );

        const informe = {

            titulo:

                "INFORME DE CRITERIOS DE ADJUDICACIÓN",

            expediente:

                expediente.id,

            fecha:

                new Date()

                    .toISOString(),

            identificacion: {

                organoContratacion:

                    expediente.identificacion
                        ?.organoContratacion,

                unidadPromotora:

                    expediente.identificacion
                        ?.unidadPromotora

            },

            objetoContrato:

                expediente.objeto
                    ?.descripcion,

            criterios,

            resumen: {

                numeroCriterios:

                    criterios.length,

                totalPonderacion,

                criteriosAutomaticos:

                    automaticos.length,

                criteriosJuicioValor:

                    juicioValor.length

            },

            justificacion:

                expediente.justificacionCriterios ?? "",

            normativaAplicable:

                expediente.normativaAplicable ?? [],

            observaciones:

                context.warnings.map(

                    warning =>

                        warning.message

                )

        };

        expediente.informeCriteriosAdjudicacion =

            informe;

        context.addDocument(

            this.name

        );

    }

}
