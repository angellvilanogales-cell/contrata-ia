/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * PCAP GENERATOR
 *
 * Generador del Pliego de Cláusulas Administrativas Particulares.
 *
 ******************************************************************************/

import { GenerationContext } from "../GenerationContext";
import { DocumentGenerator } from "../DocumentGenerationPipeline";

export class PCAPGenerator
    implements DocumentGenerator {

    public readonly name =
        "PCAP";

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

        const pcap = {

            titulo:

                "PLIEGO DE CLÁUSULAS ADMINISTRATIVAS PARTICULARES",

            expediente:

                expediente.id,

            version:

                "1.0",

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
                        ?.cpv,

                divisionLotes:

                    expediente.objeto
                        ?.divisionLotes

            },

            presupuesto: {

                baseLicitacion:

                    expediente.costEstimate
                        ?.base,

                iva:

                    expediente.costEstimate
                        ?.iva,

                valorEstimado:

                    expediente.costEstimate
                        ?.valorEstimado

            },

            procedimiento: {

                tipo:

                    expediente.procedimiento
                        ?.tipo,

                tramitacion:

                    expediente.procedimiento
                        ?.tramitacion,

                regulacion:

                    expediente.procedimiento
                        ?.regulacion

            },

            solvencia:

                expediente.solvencia,

            criteriosAdjudicacion:

                expediente.criteriosAdjudicacion,

            condicionesEspeciales:

                expediente.condicionesEspeciales,

            penalidades:

                expediente.penalidades,

            modificaciones:

                expediente.modificaciones,

            anexos:

                []

        };

        expediente.pcap =
            pcap;

        context.addDocument(

            this.name

        );

    }

}
