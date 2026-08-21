import { DocumentDefinition } from "./DocumentDefinition";
import { DocumentType } from "./DocumentType";
import { CanonicalContractType } from "../expediente/CanonicalExpedienteState";

export type DocumentModelCoverage = "FULL_MODEL" | "STRUCTURAL_MODEL" | "ANNEX_I_ONLY";

export interface ContractDocumentModelProfile {
  id: string;
  contractType: CanonicalContractType;
  documentType: DocumentType;
  coverage: DocumentModelCoverage;
  sourceIds: readonly string[];
  definition: DocumentDefinition;
  generationAllowed: boolean;
  notes: readonly string[];
}

export class ContractDocumentModelProfileRegistry {
  private readonly profiles = new Map<string, ContractDocumentModelProfile>();

  public register(profile: ContractDocumentModelProfile): void {
    this.profiles.set(profile.id, profile);
  }

  public all(): readonly ContractDocumentModelProfile[] {
    return [...this.profiles.values()];
  }

  public find(contractType: CanonicalContractType, documentType: DocumentType): ContractDocumentModelProfile | undefined {
    return this.all().find(
      profile => profile.contractType === contractType && profile.documentType === documentType,
    );
  }

  public canGenerateFullDocument(contractType: CanonicalContractType, documentType: DocumentType): boolean {
    const profile = this.find(contractType, documentType);
    return Boolean(profile && profile.coverage === "FULL_MODEL" && profile.generationAllowed);
  }
}
