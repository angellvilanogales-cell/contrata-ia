/**
 * ============================================================
 * CONTRATA IA
 * KnowledgeQueryEngine
 * ============================================================
 *
 * Motor encargado de localizar automáticamente
 * el conocimiento jurídico más adecuado.
 *
 * El conocimiento procede del Banco de Conocimiento.
 *
 * Nunca se consulta por identificadores.
 *
 * Siempre se consulta por contexto jurídico.
 *
 * ============================================================
 */

import * as fs from "fs";
import * as yaml from "js-yaml";

import { ExpedienteContext } from "../expediente/ExpedienteContext";

export interface Snippet {

    id: string;

    titulo: string;

    prioridad: number;

    aplica?: {

        contratos?: string[];

        procedimientos?: string[];

    };

    normativa?: string[];

    etiquetas?: string[];

    texto: string;

}

export class KnowledgeQueryEngine {

    /**
     * Carga un archivo YAML del Banco de Conocimiento.
     */
    private cargar(

        fichero: string

    ): Snippet[] {

        const contenido =

            fs.readFileSync(

                fichero,

                "utf8"

            );

        const documento: any =

            yaml.load(

                contenido

            );

        return documento.snippets ?? [];

    }

    /**
     * Busca el mejor snippet.
     */
    public buscar(

        fichero: string,

        contexto: ExpedienteContext

    ): Snippet | null {

        const snippets =

            this.cargar(

                fichero

            );

        const candidatos = snippets.filter(

            s => {

                if (

                    !s.aplica ||

                    !s.aplica.contratos ||

                    s.aplica.contratos.includes("TODOS")

                ) {

                    return true;

                }

                return s.aplica.contratos.includes(

                    contexto.tipoContrato

                );

            }

        );

        if (

            candidatos.length === 0

        ) {

            return null;

        }

        candidatos.sort(

            (

                a,

                b

            ) =>

                b.prioridad -

                a.prioridad

        );

        return candidatos[0];

    }

    /**
     * Devuelve únicamente el texto.
     */
    public obtenerTexto(

        fichero: string,

        contexto: ExpedienteContext

    ): string {

        const snippet =

            this.buscar(

                fichero,

                contexto

            );

        return snippet?.texto ?? "";

    }

}
