import {
  DocumentGenerator as CanonicalDocumentGenerator,
  DocumentType,
  DocumentFormat,
  GeneratedDocument
} from "../../documents/DocumentGenerator";
import { ContractContextModel } from "../contract-generator/ContractContext";
import { GeneratedFile } from "../contract-generator/GenerationResult";

export * from "../../documents/DocumentGenerator";

export class DocumentGenerator extends CanonicalDocumentGenerator {
  public async generate(context: ContractContextModel): Promise<GeneratedFile[]>;
  public async generate(context: ContractContextModel, type: DocumentType, format: DocumentFormat): Promise<GeneratedDocument>;
  public async generate(
    context: ContractContextModel,
    type?: DocumentType,
    format?: DocumentFormat
  ): Promise<GeneratedFile[] | GeneratedDocument> {
    if (type !== undefined && format !== undefined) {
      return super.generate(context, type, format);
    }

    const types = [
      DocumentType.JUSTIFICATION_MEMORY,
      DocumentType.ECONOMIC_MEMORY,
      DocumentType.TECHNICAL_REPORT,
      DocumentType.LEGAL_REPORT,
      DocumentType.PPT,
      DocumentType.PCAP
    ];
    const documents = [];
    for (const documentType of types) {
      documents.push(await super.generate(context, documentType, DocumentFormat.DOCX));
    }
    return documents.map(document => ({
      id: document.id,
      code: document.type,
      name: document.title,
      description: document.description,
      version: document.version,
      fileName: `${document.type}.docx`,
      extension: "docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      size: Buffer.byteLength(document.content, "utf8"),
      generatedAt: document.created,
      generatedBy: document.author,
      hash: "",
      digitallySigned: false
    }));
  }
}
