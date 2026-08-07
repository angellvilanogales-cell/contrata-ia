/** Resultado trazable de la decisión sobre publicidad del expediente. */
export interface PublicationDecision {
  publicationRequired?: boolean;
  contractorProfile?: boolean;
  doue?: boolean;
  boe?: boolean;
  boja?: boolean;
  medios?: string[];
  justificacion?: string;
  normativa?: string;
  articulo?: string;
  confidence?: number;
  [key: string]: unknown;
}
