/**
 * ============================================================
 * CONTRATA IA
 * MemoriaJustificativaGenerator
 * ============================================================
 *
 * Generador de la Memoria Justificativa del expediente.
 *
 * La salida generada será posteriormente utilizada
 * para crear:
 *
 *  - DOCX
 *  - PDF
 *  - HTML
 *
 * ============================================================
 */

import { BaseDocumentGenerator } from "./BaseDocumentGenerator";

import { ExpedienteContext } from "../domain/expediente/ExpedienteContext";

export class MemoriaJustificativaGenerator extends BaseDocumentGenerator {

    /**
     * Genera la memoria justificativa.
     */
    public async generar(

        contexto: ExpedienteContext

    ): Promise<string> {

        const plantilla = `

# MEMORIA JUSTIFICATIVA

## 1. Objeto del contrato

{{OBJETO}}

## 2. Necesidad administrativa

{{NECESIDAD}}

## 3. Insuficiencia de medios

{{INSUFICIENCIA}}

## 4. Tipo de contrato

{{TIPO_CONTRATO}}

## 5. Código CPV

{{CPV}}

## 6. Valor estimado

{{VALOR}}

## 7. Procedimiento de adjudicación

{{PROCEDIMIENTO}}

## 8. Solvencia

{{SOLVENCIA}}

## 9. Publicidad

{{PUBLICIDAD}}

## 10. Duración

{{DURACION}}

`;

        return this.limpiar(

            this.reemplazarVariables(

                plantilla,

                {

                    OBJETO:

                        contexto.objeto,

                    NECESIDAD:

                        contexto.descripcion,

                    INSUFICIENCIA:

                        contexto.observaciones.join("\n"),

                    TIPO_CONTRATO:

                        contexto.tipoContrato,

                    CPV:

                        contexto.cpvPrincipal?.codigo ?? "",

                    VALOR:

                        contexto.valorEstimado,

                    PROCEDIMIENTO:

                        contexto.procedimiento ?? "",

                    SOLVENCIA:

                        contexto.solvencia ?? "",

                    PUBLICIDAD:

                        contexto.publicidad ?? "",

                    DURACION:

                        contexto.duracionMeses

                }

            )

        );

    }

}
