/**
 * ============================================================
 * CONTRATA IA
 * CPVEngine
 * ============================================================
 *
 * Primer nivel del motor de selección CPV.
 *
 * Responsabilidades:
 *
 * - Normalizar texto
 * - Extraer palabras clave
 * - Consultar RepositorioCPV
 * - Ordenar candidatos
 *
 * ============================================================
 */

import { RepositorioCPV } from "../domain/conocimiento/RepositorioCPV";
import { ResultadoBusquedaCPV } from "../domain/conocimiento/ResultadoBusquedaCPV";

export class CPVEngine {

    constructor(
        private readonly repositorio: RepositorioCPV
    ) {}

    /**
     * Punto de entrada principal.
     */
    public async analizarObjeto(
        descripcion: string
    ): Promise<ResultadoBusquedaCPV[]> {

        const texto = this.normalizar(descripcion);

        const palabras = this.extraerPalabrasClave(texto);

        const candidatos =
            await this.buscarCandidatos(palabras);

        return this.ordenarPorConfianza(candidatos);

    }

    /**
     * Normaliza un texto.
     */
    private normalizar(texto: string): string {

        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s]/g, " ")
            .replace(/\s+/g, " ")
            .trim();

    }

    /**
     * Extrae palabras útiles.
     */
    private extraerPalabrasClave(
        texto: string
    ): string[] {

        const palabrasVacias = new Set([

            "de",
            "del",
            "la",
            "las",
            "el",
            "los",
            "para",
            "por",
            "con",
            "sin",
            "y",
            "e",
            "o",
            "u",
            "en",
            "un",
            "una",
            "unos",
            "unas"

        ]);

        return texto
            .split(" ")
            .filter(p => p.length > 2)
            .filter(p => !palabrasVacias.has(p));

    }

    /**
     * Busca candidatos.
     */
    private async buscarCandidatos(
        palabras: string[]
    ): Promise<ResultadoBusquedaCPV[]> {

        const resultados: ResultadoBusquedaCPV[] = [];

        for (const palabra of palabras) {

            const encontrados =
                await this.repositorio.buscarPorPalabraClave(
                    palabra
                );

            resultados.push(...encontrados);

        }

        return resultados;

    }

    /**
     * Ordena resultados.
     */
    private ordenarPorConfianza(
        resultados: ResultadoBusquedaCPV[]
    ): ResultadoBusquedaCPV[] {

        return resultados.sort(
            (a, b) => b.confianza - a.confianza
        );

    }

}
