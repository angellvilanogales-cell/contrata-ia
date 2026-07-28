/**
 * ============================================================
 * CONTRATA IA
 * DocumentEngine
 * ============================================================
 *
 * Motor responsable de coordinar la generación de toda la
 * documentación del expediente de contratación.
 *
 * No redacta documentos directamente; coordina los distintos
 * generadores especializados.
 *
 * Documentos previstos:
 *
 * • Memoria justificativa
 * • Memoria de insuficiencia de medios
 * • Informe del procedimiento
 * • Informe de solvencia
 * • Propuesta de criterios
 * • Propuesta de división en lotes
 * • PCAP
 * • PPT
 * • Resoluciones
 *
 * ============================================================
 */

import { Expediente } from "../domain/expediente/Expediente";

export interface DocumentoGenerado {

    nombre: string;

    contenido: string;

}

export class DocumentEngine {

    /**
     * Genera toda la documentación asociada
     * a un expediente.
     */
    public generarExpediente(
        expediente: Expediente
    ): DocumentoGenerado[] {

        this.validar(expediente);

        const documentos: DocumentoGenerado[] = [];

        documentos.push(
            this.generarMemoria(expediente)
        );

        documentos.push(
            this.generarInformeProcedimiento(expediente)
        );

        documentos.push(
            this.generarInformeSolvencia(expediente)
        );

        return documentos;

    }

    // =====================================================
    // VALIDACIÓN
    // =====================================================

    private validar(
        expediente: Expediente
    ): void {

        if (!expediente) {

            throw new Error(
                "Debe existir un expediente."
            );

        }

    }

    // =====================================================
    // MEMORIA
    // =====================================================

    private generarMemoria(
        expediente: Expediente
    ): DocumentoGenerado {

        return {

            nombre: "Memoria Justificativa",

            contenido: ""

        };

    }

    // =====================================================
    // PROCEDIMIENTO
    // =====================================================

    private generarInformeProcedimiento(
        expediente: Expediente
    ): DocumentoGenerado {

        return {

            nombre: "Informe del Procedimiento",

            contenido: ""

        };

    }

    // =====================================================
    // SOLVENCIA
    // =====================================================

    private generarInformeSolvencia(
        expediente: Expediente
    ): DocumentoGenerado {

        return {

            nombre: "Informe de Solvencia",

            contenido: ""

        };

    }

}
