/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * INFORME PROCEDIMIENTO GENERATOR
 *
 * Generador del Informe de Justificación del Procedimiento
 * de Adjudicación.
 *
 ******************************************************************************/

import { GenerationContext } from "../GenerationContext";
import { DocumentGenerator } from "../DocumentGenerationPipeline";

export class InformeProcedimientoGenerator
    implements DocumentGenerator {

    public readonly name =
        "Informe de Procedimiento de Adjudicación";

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

        const procedimiento = {

            titulo:
                "INFORME DE JUSTIFICACIÓN DEL PROCEDIMIENTO DE ADJUDICACIÓN",

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

            procedimientoSeleccionado: {

                tipo:
                    expediente.procedimiento
                        ?.tipo,

                tramitacion:
                    expediente.procedimiento
                        ?.tramitacion,

                regulacion:
                    expediente.procedimiento
                        ?.regulacion,

                justificacion:
                    expediente.procedimiento
                        ?.justificacion

            },

            publicidad: {

                perfilContratante:
                    true,

                plataformaContratacion:
                    expediente.procedimiento
                        ?.publicidad
                        ?.plataforma ?? true,

                doue:
                    expediente.procedimiento
                        ?.publicidad
                        ?.doue ?? false

            },

            plazos:
                expediente.procedimiento
                    ?.plazos ?? {},

            normativaAplicable:
                expediente.normativaAplicable ?? [],

            observaciones:
                context.warnings.map(

                    warning =>

                        warning.message

                )

        };

        expediente.informeProcedimiento =
            procedimiento;

        context.addDocument(

            this.name

        );

    }

}
