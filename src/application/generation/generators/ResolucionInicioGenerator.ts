/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * RESOLUCIÓN DE INICIO GENERATOR
 *
 * Generador de la Resolución de Inicio del Expediente.
 *
 ******************************************************************************/

import { GenerationContext } from "../GenerationContext";
import { DocumentGenerator } from "../DocumentGenerationPipeline";

export class ResolucionInicioGenerator
    implements DocumentGenerator {

    public readonly name =
        "Resolución de Inicio";

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

        const resolucion = {

            titulo:
                "RESOLUCIÓN DE INICIO DEL EXPEDIENTE",

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

            responsableContrato:
                expediente.identificacion
                    ?.responsableContrato,

            objetoContrato:
                expediente.objeto
                    ?.descripcion,

            tipoContrato:
                expediente.objeto
                    ?.tipoContrato,

            cpv:
                expediente.objeto
                    ?.cpv,

            presupuestoBase:
                expediente.costEstimate
                    ?.base,

            valorEstimado:
                expediente.costEstimate
                    ?.valorEstimado,

            procedimiento:
                expediente.procedimiento
                    ?.tipo,

            tramitacion:
                expediente.procedimiento
                    ?.tramitacion,

            fundamentos: {

                necesidad:
                    expediente.necesidad
                        ?.descripcion,

                insuficienciaMedios:
                    expediente.necesidad
                        ?.insuficienciaMedios,

                interesPublico:
                    expediente.necesidad
                        ?.interesPublico

            },

            acuerdos: [

                "Iniciar el expediente de contratación.",

                "Incorporar la documentación preparatoria.",

                "Continuar la tramitación conforme a la LCSP."

            ],

            normativaAplicable:
                expediente.normativaAplicable ?? [],

            observaciones:
                context.warnings.map(

                    warning =>

                        warning.message

                )

        };

        expediente.resolucionInicio =
            resolucion;

        context.addDocument(

            this.name

        );

    }

}
