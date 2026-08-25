export interface DocumentoGenerado {
  nombre: string;
  obligatorio: boolean;
  generado: boolean;
  fundamento?: string;
  condicional?: boolean;
}

export interface DocumentEngineContext {
  contractType?: "SERVICE" | "SUPPLY" | "WORKS" | "CONCESSION" | "MIXED" | "OTHER";
}

/**
 * Inventario documental heredado saneado. No genera documentos ni declara el
 * expediente jurídicamente completo: únicamente identifica piezas mínimas o
 * condicionadas según datos ya conocidos.
 */
export class DocumentEngine {
  public obtenerDocumentos(contexto: DocumentEngineContext = {}): DocumentoGenerado[] {
    const documents: DocumentoGenerado[] = [
      {
        nombre: "Memoria Justificativa",
        obligatorio: true,
        generado: false,
        fundamento: "arts. 28 y 116 LCSP",
      },
      {
        nombre: "PCAP",
        obligatorio: true,
        generado: false,
        fundamento: "arts. 122 y concordantes LCSP",
      },
      {
        nombre: "PPT",
        obligatorio: true,
        generado: false,
        fundamento: "arts. 124 y concordantes LCSP",
      },
    ];

    documents.splice(1, 0, {
      nombre: "Informe de Insuficiencia de Medios",
      obligatorio: contexto.contractType === "SERVICE",
      generado: false,
      condicional: contexto.contractType !== "SERVICE",
      fundamento: "art. 116.4.f LCSP para contratos de servicios",
    });

    return documents;
  }

  public marcarGenerado(documento: DocumentoGenerado): DocumentoGenerado {
    return { ...documento, generado: true };
  }

  /**
   * Compatibilidad histórica: solo comprueba cobertura del inventario marcado
   * como obligatorio. No equivale a aprobación, fiscalización ni preparación
   * jurídica completa del expediente.
   */
  public expedienteCompleto(documentos: readonly DocumentoGenerado[]): boolean {
    return documentos.filter(documento => documento.obligatorio).every(documento => documento.generado);
  }
}
