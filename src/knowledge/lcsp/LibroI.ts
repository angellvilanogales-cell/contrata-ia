/**
 * ============================================================
 * CONTRATA IA
 * Libro I - Configuración General de la Contratación
 * ============================================================
 *
 * Este módulo contiene el conocimiento correspondiente al
 * Libro I de la Ley 9/2017.
 */

import { ArticuloLCSP } from "../LCSPKnowledge";

export const LibroI: ArticuloLCSP[] = [

    {

        articulo: "28",

        titulo: "Necesidad e idoneidad",

        resumen:
            "La contratación deberá responder a una necesidad pública debidamente justificada.",

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
            "El objeto del contrato deberá definirse de forma precisa y adecuada.",

        motores: [

            "CPVEngine",

            "DocumentEngine"

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

    }

];
