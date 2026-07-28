/**
 * ============================================================
 * CONTRATA IA
 * CPVRepository
 * ============================================================
 *
 * Repositorio especializado para la gestión del catálogo CPV.
 *
 * Proporciona búsquedas por:
 *
 *  - Código
 *  - Descripción
 *  - Palabras clave
 *
 * Será utilizado por CPVEngine.
 *
 * ============================================================
 */

import { CPVEntry } from "./CPVEntry";

export class CPVRepository {

    private readonly registros: CPVEntry[] = [];

    /**
     * Sustituye completamente el catálogo.
     */
    public cargar(

        registros: CPVEntry[]

    ): void {

        this.registros.length = 0;

        this.registros.push(

            ...registros

        );

    }

    /**
     * Devuelve todos los CPV.
     */
    public obtenerTodos(): readonly CPVEntry[] {

        return this.registros;

    }

    /**
     * Busca un código exacto.
     */
    public buscarPorCodigo(

        codigo: string

    ): CPVEntry | undefined {

        return this.registros.find(

            cpv => cpv.codigo === codigo

        );

    }

    /**
     * Busca por texto en la descripción.
     */
    public buscarPorDescripcion(

        texto: string

    ): CPVEntry[] {

        const t = this.normalizar(texto);

        return this.registros.filter(

            cpv =>

                this.normalizar(

                    cpv.descripcion

                ).includes(t)

        );

    }

    /**
     * Busca por palabra clave.
     */
    public buscarPorPalabraClave(

        palabra: string

    ): CPVEntry[] {

        const p = this.normalizar(palabra);

        return this.registros.filter(

            cpv =>

                cpv.palabrasClave.some(

                    k =>

                        this.normalizar(k)

                            .includes(p)

                )

        );

    }

    /**
     * Busca por sinónimo.
     */
    public buscarPorSinonimo(

        palabra: string

    ): CPVEntry[] {

        const p = this.normalizar(palabra);

        return this.registros.filter(

            cpv =>

                cpv.sinonimos.some(

                    s =>

                        this.normalizar(s)

                            .includes(p)

                )

        );

    }

    /**
     * Número total de CPV.
     */
    public total(): number {

        return this.registros.length;

    }

    /**
     * Elimina todos los registros.
     */
    public limpiar(): void {

        this.registros.length = 0;

    }

    /**
     * Normalización interna.
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
