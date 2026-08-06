/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * INFORME NECESIDAD GENERATOR
 *
 * Generador del Informe de Necesidad.
 *
 ******************************************************************************/

import { GenerationContext } from "../GenerationContext";
import { DocumentGenerator } from "../DocumentGenerationPipeline";

export class InformeNecesidadGenerator
    implements DocumentGenerator {

    public readonly name =
        "Informe de Necesidad";

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

                "INFORME DE NECESIDAD",

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

            objetoContrato:

                expediente.objeto
                    ?.descripcion,

            antecedentes:

                expediente.necesidad
                    ?.antecedentes ?? "",

            necesidad:

                expediente.necesidad
                    ?.descripcion,

            objetivos:

                expediente.necesidad
                    ?.objetivos ?? [],

            interesPublico:

                expediente.necesidad
                    ?.interesPublico ?? "",

            insuficienciaMedios:

                expediente.necesidad
                    ?.insuficienciaMedios,

            beneficiosEsperados:

                expediente.necesidad
                    ?.beneficiosEsperados ?? [],

            riesgosNoContratar:

                expediente.necesidad
                    ?.riesgosNoContratar ?? [],

            normativaAplicable:

                expediente.normativaAplicable ?? [],

            observaciones:

                context.warnings.map(

                    warning =>

                        warning.message

                )

        };

        expediente.informeNecesidad =
            informe;

        context.addDocument(

            this.name

        );

    }

}
