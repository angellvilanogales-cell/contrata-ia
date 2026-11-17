import { DocumentType } from "../../domain/documentModel/DocumentType";
import {
  FinancingProfile,
  TechnicalDocumentFamily,
} from "../../domain/documentModel/DocumentarySourceEvidenceCatalogue";
import { UniversalTargetContractType } from "../../domain/capabilities/UniversalContractCoverage";

export interface UniversalDocumentAdaptiveQuestion {
  id: string;
  field: "financing" | "technicalFamily";
  question: string;
  help: string;
  blocking: true;
}

export interface UniversalDocumentAdaptiveState {
  contractType: UniversalTargetContractType;
  documentType: DocumentType;
  financing?: FinancingProfile;
  technicalFamily?: TechnicalDocumentFamily;
}

export interface UniversalDocumentAdaptiveAssessment {
  complete: boolean;
  context?: {
    financing: FinancingProfile;
    technicalFamily: TechnicalDocumentFamily;
  };
  next?: UniversalDocumentAdaptiveQuestion;
  blockers: readonly string[];
}

const ADMIN_DOCUMENTS = new Set<DocumentType>([DocumentType.PCAP, DocumentType.MEMORY]);

function defaultTechnicalFamily(contractType: UniversalTargetContractType, documentType: DocumentType): TechnicalDocumentFamily | undefined {
  if (documentType === DocumentType.PCAP) return "GENERAL_ADMINISTRATIVE";
  if (contractType === "WORKS" && documentType === DocumentType.PPT) return "WORKS_PROJECT";
  if (contractType === "CONCESSION" && documentType === DocumentType.PPT) return "CONCESSION_OPERATION";
  return undefined;
}

/**
 * LB91.47 — preguntas documentales mínimas. No pregunta por subfamilia cuando
 * el propio tipo de documento la fija de forma estructural (PCAP, obra o concesión).
 * Nunca deduce financiación a partir del órgano, objeto o ejercicio.
 */
export class UniversalDocumentAdaptivePreparation {
  public start(contractType: UniversalTargetContractType, documentType: DocumentType): UniversalDocumentAdaptiveState {
    return {
      contractType,
      documentType,
      technicalFamily: defaultTechnicalFamily(contractType, documentType),
    };
  }

  public applyAnswer(
    state: UniversalDocumentAdaptiveState,
    field: "financing" | "technicalFamily",
    value: FinancingProfile | TechnicalDocumentFamily,
  ): UniversalDocumentAdaptiveState {
    if (field === "financing") return { ...state, financing: value as FinancingProfile };
    return { ...state, technicalFamily: value as TechnicalDocumentFamily };
  }

  public assess(state: UniversalDocumentAdaptiveState): UniversalDocumentAdaptiveAssessment {
    if (!state.financing) {
      return {
        complete: false,
        blockers: [],
        next: {
          id: "document:financing",
          field: "financing",
          question: "¿Cuál es el perfil de financiación aplicable a este expediente?",
          help: "Indique autofinanciación, fondos europeos, otra financiación o desconocida. La aplicación no lo inferirá silenciosamente.",
          blocking: true,
        },
      };
    }

    if (!state.technicalFamily) {
      return {
        complete: false,
        blockers: [],
        next: {
          id: "document:technical-family",
          field: "technicalFamily",
          question: ADMIN_DOCUMENTS.has(state.documentType)
            ? "¿Qué subfamilia documental describe mejor la prestación?"
            : "¿Qué subfamilia técnica corresponde al documento?",
          help: "Ejemplos: limpieza, formación, mantenimiento o suministro por necesidades de catálogo. No se reutilizará un PPT técnico de otra subfamilia.",
          blocking: true,
        },
      };
    }

    return {
      complete: true,
      context: {
        financing: state.financing,
        technicalFamily: state.technicalFamily,
      },
      blockers: [],
    };
  }
}
