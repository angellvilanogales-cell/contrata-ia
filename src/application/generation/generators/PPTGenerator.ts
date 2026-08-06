/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * PPT GENERATOR
 *
 * Generador del Pliego de Prescripciones Técnicas.
 *
 ******************************************************************************/

import { GenerationContext } from "../GenerationContext";
import { DocumentGenerator } from "../DocumentGenerationPipeline";

export class PPTGenerator
    implements DocumentGenerator {

    public readonly name =
        "PPT";

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

        const ppt = {

            titulo:

                "PLIEGO DE PRESCRIPCIONES TÉCNICAS",

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
                        ?.unidadPromotora,

                responsableContrato:

                    expediente.identificacion
                        ?.responsableContrato

            },

            objeto: {

                descripcion:

                    expediente.objeto
                        ?.descripcion,

                tipoContrato:

                    expediente.objeto
                        ?.tipoContrato,

                cpv:

                    expediente.objeto
                        ?.cpv

            },

            alcance:

                expediente.objeto
                    ?.alcance,

            especificacionesTecnicas:

                expediente.especificacionesTecnicas ?? [],

            requisitosFuncionales:

                expediente.requisitosFuncionales ?? [],

            requisitosTecnicos:

                expediente.requisitosTecnicos ?? [],

            nivelesServicio:

                expediente.sla ?? [],

            criteriosAceptacion:

                expediente.criteriosAceptacion ?? [],

            entregables:

                expediente.entregables ?? [],

            planificacion:

                expediente.planificacion ?? {},

            garantias:

                expediente.garantias ?? {},

            mantenimiento:

                expediente.mantenimiento ?? {},

            anexos:

                []

        };

        expediente.ppt =

            ppt;

        context.addDocument(

            this.name

        );

    }

}
