/**
 * ============================================================
 * CONTRATA IA
 * LCSPKnowledge
 * ============================================================
 *
 * Base de conocimiento de la Ley 9/2017.
 *
 * NO almacena únicamente artículos.
 *
 * Almacena conocimiento reutilizable por todos los motores.
 *
 * ============================================================
 */

export interface ArticuloLCSP {

    articulo: string;

    titulo: string;

    resumen: string;

    motores: string[];

    documentos: string[];

    reglas: string[];

}

export class LCSPKnowledge {

    /**
     * Devuelve todos los artículos registrados.
     */
    public obtenerArticulos(): ArticuloLCSP[] {

        return this.articulos;

    }

    /**
     * Busca un artículo concreto.
     */
    public buscar(
        articulo: string
    ): ArticuloLCSP | undefined {

        return this.articulos.find(

            a => a.articulo === articulo

        );

    }

    /**
     * Devuelve todos los artículos
     * relacionados con un motor.
     */
    public buscarPorMotor(
        motor: string
    ): ArticuloLCSP[] {

        return this.articulos.filter(

            a => a.motores.includes(motor)

        );

    }

    /**
     * Base inicial.
     *
     * Crecerá progresivamente.
     */

    private readonly articulos: ArticuloLCSP[] = [

        {

            articulo: "28",

            titulo: "Necesidad e idoneidad",

            resumen:
                "Todo contrato deberá responder a una necesidad debidamente justificada.",

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

            ]

        },

        {

            articulo: "99",

            titulo: "Objeto del contrato",

            resumen:
                "El objeto deberá determinarse con precisión.",

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

            ]

        },

        {

            articulo: "116",

            titulo: "Expediente",

            resumen:
                "Contenido mínimo del expediente.",

            motores: [

                "DocumentEngine"

            ],

            documentos: [

                "Expediente"

            ],

            reglas: [

                "Documentación"

            ]

        }

    ];

}
