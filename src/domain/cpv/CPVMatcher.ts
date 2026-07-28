/**
 * ============================================================
 * CONTRATA IA
 * CPVMatcher
 * ============================================================
 *
 * Motor de búsqueda de códigos CPV.
 *
 * Compara el texto introducido por el usuario con
 * los CPV almacenados en el KnowledgeRepository y
 * devuelve los más relevantes.
 *
 * Esta primera versión utiliza coincidencias de
 * palabras clave.
 *
 * En futuras versiones se sustituirá por búsqueda
 * semántica mediante embeddings.
 *
 * ============================================================
 */

import { CPVEntry } from "./CPVEntry";

export interface CPVMatch {

    cpv: CPVEntry;

    puntuacion: number;

}

export class CPVMatcher {

    /**
     * Busca los mejores CPV.
     */
    public buscar(

        descripcion: string,

        cpvDisponibles: CPVEntry[],

        limite = 10

    ): CPVMatch[] {

        const texto = this.normalizar(descripcion);

        const resultado: CPVMatch[] = [];

        for (const cpv of cpvDisponibles) {

            const puntuacion = this.calcularPuntuacion(

                texto,

                cpv

            );

            if (puntuacion <= 0) {

                continue;

            }

            resultado.push({

                cpv,

                puntuacion

            });

        }

        return resultado

            .sort(

                (a, b) => b.puntuacion - a.puntuacion

            )

            .slice(

                0,

                limite

            );

    }

    /**
     * Calcula una puntuación para un CPV.
     */
    private calcularPuntuacion(

        texto: string,

        cpv: CPVEntry

    ): number {

        let puntos = 0;

        const descripcion = this.normalizar(

            cpv.descripcion

        );

        if (texto.includes(descripcion)) {

            puntos += 100;

        }

        for (const palabra of cpv.palabrasClave) {

            if (

                texto.includes(

                    this.normalizar(palabra)

                )

            ) {

                puntos += 15;

            }

        }

        for (const sinonimo of cpv.sinonimos) {

            if (

                texto.includes(

                    this.normalizar(sinonimo)

                )

            ) {

                puntos += 10;

            }

        }

        return puntos;

    }

    /**
     * Normaliza texto.
     */
    private normalizar(

        texto: string

    ): string {

        return texto

            .toLowerCase()

            .normalize("NFD")

            .replace(/[\u0300-\u036f]/g, "")

            .replace(/\s+/g, " ")

            .trim();

    }

}
