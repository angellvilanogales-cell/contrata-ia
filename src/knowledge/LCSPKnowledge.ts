/**
 * ============================================================
 * CONTRATA IA
 * LCSPKnowledge
 * ============================================================
 *
 * Base de conocimiento jurídica.
 *
 * Punto único de acceso al conocimiento derivado de la
 * Ley 9/2017 de Contratos del Sector Público.
 *
 * Todos los motores del sistema consultarán esta clase.
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
     * Devuelve todas las preguntas que puede
     * formular CONTRATA IA.
     */
    public obtenerPreguntas(): string[] {

        const preguntas = new Set<string>();

        this.articulos.forEach(articulo => {

            articulo.preguntas.forEach(pregunta => {

                preguntas.add(pregunta);

            });

        });

        return Array.from(preguntas);

    }

    /**
     * Devuelve todas las reglas registradas.
     */
    public obtenerReglas(): string[] {

        const reglas = new Set<string>();

        this.articulos.forEach(articulo => {

            articulo.reglas.forEach(regla => {

                reglas.add(regla);

            });

        });

        return Array.from(reglas);

    }

    /**
     * Devuelve todos los motores que utilizan
     * la base de conocimiento.
     */
    public obtenerMotores(): string[] {

        const motores = new Set<string>();

        this.articulos.forEach(articulo => {

            articulo.motores.forEach(motor => {

                motores.add(motor);

            });

        });

        return Array.from(motores);

    }

    /**
     * Devuelve todos los documentos afectados
     * por la normativa.
     */
    public obtenerDocumentos(): string[] {

        const documentos = new Set<string>();

        this.articulos.forEach(articulo => {

            articulo.documentos.forEach(documento => {

                documentos.add(documento);

            });

        });

        return Array.from(documentos);

    }

    /**
     * Base inicial de conocimiento.
     *
     * Esta colección irá creciendo progresivamente hasta
     * representar el conocimiento jurídico necesario para
     * la toma automática de decisiones.
     */
    private readonly articulos: ArticuloLCSP[] = [

        {

            articulo: "28",

            titulo: "Necesidad e idoneidad",

            resumen:
                "Todo contrato debe responder a una necesidad pública debidamente justificada.",

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

                "¿Por qué no puede atenderse mediante medios propios?"

            ]

        },

        {

            articulo: "99",

            titulo: "Objeto del contrato",

            resumen:
                "El objeto del contrato deberá definirse de forma precisa y adecuada.",

            finalidad:
                "Determinar correctamente el objeto contractual.",

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

                "¿Cuál es el objeto exacto del contrato?",

                "¿Procede dividir el contrato en lotes?"

            ]

        },

        {

            articulo: "116",

            titulo: "Expediente de contratación",

            resumen:
                "El expediente deberá incorporar la documentación justificativa exigida por la LCSP.",

            finalidad:
                "Garantizar que el expediente contiene toda la documentación necesaria.",

            motores: [

                "DocumentEngine"

            ],

            documentos: [

                "Expediente",

                "MemoriaJustificativa",

                "InformeProcedimiento"

            ],

            reglas: [

                "Documentación",

                "Preparación"

            ],

            preguntas: [

                "¿Está completa la documentación del expediente?"

            ]

        }

    ];

}
