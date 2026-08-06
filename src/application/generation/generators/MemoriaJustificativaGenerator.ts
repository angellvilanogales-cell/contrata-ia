/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * MEMORIA JUSTIFICATIVA GENERATOR
 *
 * Generador de la Memoria Justificativa del expediente.
 *
 ******************************************************************************/

import { GenerationContext } from "../GenerationContext";
import { DocumentGenerator } from "../DocumentGenerationPipeline";

export class MemoriaJustificativaGenerator
    implements DocumentGenerator {

    public readonly name =
        "Memoria Justificativa";

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

        const memoria = {

            titulo:
                "MEMORIA JUSTIFICATIVA",

            expediente:

                expediente.id,

            fecha:

                new Date()
                    .toISOString(),

            organoContratacion:

                expediente.identificacion
                    ?.organoContratacion,

            unidadPromotora:

                expediente.identificacion
                    ?.unidadPromotora,

            responsable:

                expediente.identificacion
                    ?.responsableContrato,

            objeto:

                expediente.objeto
                    ?.descripcion,

            necesidad:

                expediente.necesidad
                    ?.descripcion,

            insuficienciaMedios:

                expediente.necesidad
                    ?.insuficienciaMedios,

            objetivos:

                expediente.necesidad
                    ?.objetivos,

            cpv:

                expediente.objeto
                    ?.cpv,

            tipoContrato:

                expediente.objeto
                    ?.tipoContrato,

            presupuesto:

                expediente.costEstimate,

            recomendacionesIA:

                context.aiResult,

            observaciones:

                []

        };

        expediente.memoria =
            memoria;

        context.addDocument(

            this.name

        );

    }

}
