/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * INFORME INSUFICIENCIA DE MEDIOS GENERATOR
 *
 * Generador del Informe de Insuficiencia de Medios.
 *
 ******************************************************************************/

import { GenerationContext } from "../GenerationContext";
import { DocumentGenerator } from "../DocumentGenerationPipeline";

export class InformeInsuficienciaMediosGenerator
    implements DocumentGenerator {

    public readonly name =
        "Informe de Insuficiencia de Medios";

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

        const informe = {

            titulo:
                "INFORME DE INSUFICIENCIA DE MEDIOS",

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

                responsable:
                    expediente.identificacion
                        ?.responsableContrato

            },

            objetoContrato:
                expediente.objeto
                    ?.descripcion,

            tipoContrato:
                expediente.objeto
                    ?.tipoContrato,

            cpv:
                expediente.objeto
                    ?.cpv,

            justificacion: {

                descripcion:

                    expediente.necesidad
                        ?.insuficienciaMedios,

                mediosDisponibles:

                    expediente.mediosPropios
                        ?.disponibles ?? [],

                limitaciones:

                    expediente.mediosPropios
                        ?.limitaciones ?? [],

                imposibilidadEjecucion:

                    expediente.mediosPropios
                        ?.justificacion ?? "",

                necesidadContratacionExterna:

                    true

            },

            normativaAplicable:

                expediente.normativaAplicable ?? [],

            observaciones:

                context.warnings.map(

                    warning =>

                        warning.message

                )

        };

        expediente.informeInsuficienciaMedios =
            informe;

        context.addDocument(

            this.name

        );

    }

}
