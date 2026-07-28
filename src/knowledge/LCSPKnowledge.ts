/**
 * ============================================================
 * CONTRATA IA
 * LCSPKnowledge
 * ============================================================
 *
 * Base de conocimiento jurídica.
 *
 * Esta clase constituye el punto único de acceso al
 * conocimiento derivado de la Ley 9/2017.
 *
 * Los motores nunca accederán directamente a la normativa.
 * Siempre consultarán este componente.
 *
 * ============================================================
 */

export interface ArticuloLCSP {

    articulo: string;

    titulo: string;

    resumen: string;

    finalidad: string;

    motores: string[];

    documentos: string[];

    reglas: string[];

    preguntas: string[];

}

export class LCSPKnowledge {

    /**
     * Devuelve todos los artículos registrados.
     */
    public obtenerTodos(): ArticuloLCSP[] {

        return this.articulos;

    }

    /**
     * Busca un artículo concreto.
     */
    public buscarArticulo(
        articulo: string
    ): ArticuloLCSP | undefined {

        return this.articulos.find(

            a => a.articulo === articulo

        );

    }

    /**
     * Devuelve todos los artículos utilizados
     * por un motor.
     */
    public buscarPorMotor(
        motor: string
    ): ArticuloLCSP[] {

        return this.articulos.filter(

            a => a.motores.includes(motor)

        );

    }

    /**
     * Devuelve todos los artículos relacionados
     * con un documento.
     */
    public buscarPorDocumento(
        documento: string
    ): ArticuloLCSP[] {

        return this.articulos.filter(

            a => a.documentos.includes(documento)

        );

    }

    /**
     * Base inicial de conocimiento.
     *
     * Crecerá hasta convertirse en la representación
     * estructurada de la LCSP.
     */

    private readonly articulos: ArticuloLCSP[] = [

        {

            articulo: "28",

            titulo: "Necesidad e idoneidad",

            resumen:
                "Todo contrato debe responder a una necesidad pública.",

            finalidad:
                "Justificar la contratación.",

            motores: [

                "ProcedimientoEngine",

                "DocumentEngine"

            ],

            documentos: [

                "MemoriaJustificativa"

            ],

            reglas: [

                "Necesidad",

                "Idoneidad"

            ],

            preguntas: [

                "¿Qué necesidad pública se pretende satisfacer?",

                "¿Por qué no puede atenderse con medios propios?"

            ]

        },

        {

            articulo: "99",

            titulo: "Objeto del contrato",

            resumen:
                "El objeto debe definirse con precisión.",

            finalidad:
                "Delimitar el alcance del contrato.",

            motores: [

                "CPVEngine",

                "ProcedimientoEngine"

            ],

            documentos: [

                "PCAP",

                "PPT"

            ],

            reglas: [

                "Objeto",

                "CPV",

                "Lotes"

            ],

            preguntas: [

                "¿Cuál es el objeto del contrato?",

                "¿Puede dividirse en lotes?"

            ]

        }

    ];

}
