/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DocumentResult
 * ------------------------------------------------------------
 * Resultado común de cualquier documento generado.
 *
 * Todos los generadores devolverán exactamente este objeto,
 * independientemente de que generen una Memoria, un PCAP,
 * un PPT o una Resolución.
 * ============================================================
 */

export interface DocumentMetadata {

    id: string;

    documentType: string;

    title: string;

    version: string;

    language: string;

    generatedAt: Date;

    generatedBy: string;

}

export interface DocumentSection {

    id: string;

    title: string;

    order: number;

    content: string;

    editable: boolean;

}

export interface DocumentWarning {

    severity:

        | "INFO"
        | "WARNING"
        | "ERROR";

    message: string;

}

export interface DocumentReference {

    source: string;

    citation: string;

    article?: string;

}

export interface DocumentResult {

    /**
     * Información general
     */

    metadata: DocumentMetadata;

    /**
     * Documento estructurado
     */

    sections: DocumentSection[];

    /**
     * Texto completo
     */

    fullText: string;

    /**
     * Referencias normativas utilizadas
     */

    references: DocumentReference[];

    /**
     * Advertencias
     */

    warnings: DocumentWarning[];

    /**
     * Documento válido
     */

    valid: boolean;

}
