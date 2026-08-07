import { UUID } from "../../domain/common/types";
import { ContractContextModel } from "../modules/contract-generator/ContractContext";

export enum DocumentType {
  JUSTIFICATION_MEMORY = "JUSTIFICATION_MEMORY",
  ECONOMIC_MEMORY = "ECONOMIC_MEMORY",
  TECHNICAL_REPORT = "TECHNICAL_REPORT",
  LEGAL_REPORT = "LEGAL_REPORT",
  LACK_OF_RESOURCES = "LACK_OF_RESOURCES",
  PPT = "PPT",
  PCAP = "PCAP",
  CONTRACT_NOTICE = "CONTRACT_NOTICE",
  APPROVAL_RESOLUTION = "APPROVAL_RESOLUTION",
  AWARD_PROPOSAL = "AWARD_PROPOSAL",
  AWARD_RESOLUTION = "AWARD_RESOLUTION",
  FORMALIZATION = "FORMALIZATION",
  EXECUTION_REPORT = "EXECUTION_REPORT",
  MODIFICATION_REPORT = "MODIFICATION_REPORT",
  PENALTY_REPORT = "PENALTY_REPORT",
  EXTENSION_REPORT = "EXTENSION_REPORT",
  RECEPTION_CERTIFICATE = "RECEPTION_CERTIFICATE",
  FINAL_SETTLEMENT = "FINAL_SETTLEMENT",
  ANNEX = "ANNEX",
  CUSTOM = "CUSTOM"
}

export enum DocumentFormat {
  DOCX = "DOCX",
  PDF = "PDF",
  HTML = "HTML",
  MARKDOWN = "MARKDOWN",
  JSON = "JSON",
  XML = "XML"
}

export enum DocumentStatus {
  CREATED = "CREATED",
  BUILDING = "BUILDING",
  VALIDATING = "VALIDATING",
  GENERATED = "GENERATED",
  EXPORTED = "EXPORTED",
  ERROR = "ERROR"
}

export interface DocumentSection {
  id: UUID;
  title: string;
  order: number;
  mandatory: boolean;
  generated: boolean;
  content: string;
}

export interface DocumentTable {
  id: UUID;
  title: string;
  headers: string[];
  rows: string[][];
}

export interface LegalReference {
  article: string;
  regulation: string;
  description: string;
}

export interface DocumentVariable {
  key: string;
  value: string;
}

export interface DocumentGeneratorConfiguration {
  automaticIndex: boolean;
  automaticNumbering: boolean;
  includeLegalReferences: boolean;
  includeHeader: boolean;
  includeFooter: boolean;
  validateBeforeExport: boolean;
  generateMetadata: boolean;
}

export interface GeneratedDocument {
  id: UUID;
  type: DocumentType;
  format: DocumentFormat;
  status: DocumentStatus;
  title: string;
  description: string;
  version: string;
  created: string;
  author: string;
  sections: DocumentSection[];
  tables: DocumentTable[];
  references: LegalReference[];
  variables: DocumentVariable[];
  content: string;
}

export interface GeneratorStatistics {
  generatedDocuments: number;
  exportedDocuments: number;
  totalSections: number;
  totalTables: number;
  averageGenerationMilliseconds: number;
}

export interface AdministrativeFile {
  id: UUID;
  expediente: string;
  generated: Date;
  documents: GeneratedDocument[];
  index: string[];
  metadata: Map<string, string>;
}

export interface AdministrativeAnnex {
  id: UUID;
  code: string;
  title: string;
  description?: string;
  content?: string;
}

export interface ExportResult {
  success: boolean;
  format: DocumentFormat;
  filename: string;
  mimeType: string;
  size: number;
  generated: Date;
  content: string;
}

export interface DocumentAuditEvent {
  id: UUID;
  timestamp: Date;
  action: string;
  documentId?: UUID;
  details?: Record<string, unknown>;
}

function valueAt(context: ContractContextModel, ...paths: string[]): string {
  const source = context as unknown as Record<string, unknown>;
  for (const path of paths) {
    const value = path.split(".").reduce<unknown>((current, key) => {
      if (current && typeof current === "object") {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, source);
    if (value !== undefined && value !== null && String(value).length > 0) return String(value);
  }
  return "";
}

export class DocumentGenerator {
  private context?: ContractContextModel;
  private readonly documents: GeneratedDocument[] = [];
  private readonly variables = new Map<string, string>();
  private readonly references: LegalReference[] = [];
  private readonly versions = new Map<UUID, string[]>();
  private readonly auditTrail: DocumentAuditEvent[] = [];
  private readonly documentCache = new Map<string, GeneratedDocument>();
  private configuration: DocumentGeneratorConfiguration;
  private statistics: GeneratorStatistics = {
    generatedDocuments: 0,
    exportedDocuments: 0,
    totalSections: 0,
    totalTables: 0,
    averageGenerationMilliseconds: 0
  };
  private administrativeFile?: AdministrativeFile;

  constructor(configuration?: Partial<DocumentGeneratorConfiguration>) {
    this.configuration = {
      automaticIndex: true,
      automaticNumbering: true,
      includeLegalReferences: true,
      includeHeader: true,
      includeFooter: true,
      validateBeforeExport: true,
      generateMetadata: true,
      ...configuration
    };
  }

  public initialize(context: ContractContextModel): void {
    this.context = context;
    this.variables.clear();
    this.references.length = 0;
    this.loadContextVariables();
    this.loadLegalReferences();
    this.audit("initialize");
  }

  public addVariable(key: string, value: string): void {
    this.variables.set(key, value);
  }

  public getVariable(key: string): string {
    return this.variables.get(key) ?? "";
  }

  public async generate(
    context: ContractContextModel,
    type: DocumentType,
    format: DocumentFormat
  ): Promise<GeneratedDocument> {
    const started = Date.now();
    this.initialize(context);
    const document = this.createDocument(type, format);
    document.status = DocumentStatus.BUILDING;

    if (this.configuration.includeHeader) {
      this.addSection(document, "CABECERA", [
        "JUNTA DE ANDALUCÍA",
        "CONSEJERÍA DE EMPLEO",
        this.getVariable("EXPEDIENTE"),
        this.getVariable("OBJETO")
      ].filter(Boolean).join("\n"));
    }

    if (this.configuration.automaticIndex) {
      this.addSection(document, "ÍNDICE", "<<AUTO_INDEX>>");
    }

    this.addSection(document, this.titleFor(type), this.bodyFor(type));

    if (this.configuration.includeLegalReferences) {
      document.references = [...this.references];
    }

    document.variables = [...this.variables].map(([key, value]) => ({ key, value }));
    document.content = document.sections.map(section => section.content).join("\n\n");
    document.status = this.configuration.validateBeforeExport ? DocumentStatus.VALIDATING : DocumentStatus.GENERATED;
    if (this.configuration.validateBeforeExport && !this.validateDocument(document)) {
      document.status = DocumentStatus.ERROR;
      throw new Error(`Documento inválido: ${document.type}`);
    }
    document.status = DocumentStatus.GENERATED;

    this.documents.push(document);
    this.versions.set(document.id, [document.version]);
    this.statistics.generatedDocuments++;
    this.statistics.totalSections += document.sections.length;
    this.statistics.totalTables += document.tables.length;
    this.statistics.averageGenerationMilliseconds =
      ((this.statistics.averageGenerationMilliseconds * (this.statistics.generatedDocuments - 1)) + (Date.now() - started)) /
      this.statistics.generatedDocuments;
    this.audit("generate", document.id, { type, format });
    return document;
  }

  public async generateAdministrativeFile(context: ContractContextModel): Promise<AdministrativeFile> {
    this.initialize(context);
    const types = [
      DocumentType.JUSTIFICATION_MEMORY,
      DocumentType.ECONOMIC_MEMORY,
      DocumentType.PPT,
      DocumentType.PCAP,
      DocumentType.LEGAL_REPORT,
      DocumentType.TECHNICAL_REPORT,
      DocumentType.LACK_OF_RESOURCES,
      DocumentType.APPROVAL_RESOLUTION,
      DocumentType.AWARD_PROPOSAL,
      DocumentType.AWARD_RESOLUTION,
      DocumentType.FORMALIZATION,
      DocumentType.ANNEX
    ];
    const documents: GeneratedDocument[] = [];
    for (const type of types) documents.push(await this.generate(context, type, DocumentFormat.DOCX));
    this.administrativeFile = {
      id: crypto.randomUUID(),
      expediente: this.getVariable("EXPEDIENTE"),
      generated: new Date(),
      documents,
      index: documents.map(document => document.title),
      metadata: new Map([
        ["EXPEDIENTE", this.getVariable("EXPEDIENTE")],
        ["CPV", this.getVariable("CPV")],
        ["OBJETO", this.getVariable("OBJETO")],
        ["ORGANO", this.getVariable("ORGANO")],
        ["PROCEDIMIENTO", this.getVariable("PROCEDIMIENTO")],
        ["VERSION", "1.0"],
        ["DOCUMENTOS", String(documents.length)]
      ])
    };
    return this.administrativeFile;
  }

  public getAdministrativeFile(): AdministrativeFile | undefined {
    return this.administrativeFile;
  }

  public async exportDocument(document: GeneratedDocument, format: DocumentFormat): Promise<ExportResult> {
    const content = this.render(document, format);
    this.statistics.exportedDocuments++;
    document.status = DocumentStatus.EXPORTED;
    return {
      success: true,
      format,
      filename: `${document.type}.${format.toLowerCase()}`,
      mimeType: this.mimeType(format),
      size: Buffer.byteLength(content, "utf8"),
      generated: new Date(),
      content
    };
  }

  public incrementVersion(document: GeneratedDocument): GeneratedDocument {
    const parts = document.version.split(".").map(Number);
    const major = Number.isFinite(parts[0]) ? parts[0] : 1;
    const minor = Number.isFinite(parts[1]) ? parts[1] + 1 : 1;
    document.version = `${major}.${minor}`;
    this.versions.set(document.id, [...(this.versions.get(document.id) ?? []), document.version]);
    this.audit("increment-version", document.id, { version: document.version });
    return document;
  }

  public getVersionHistory(documentId: UUID): string[] {
    return [...(this.versions.get(documentId) ?? [])];
  }

  public validateAdministrativeFile(): boolean {
    if (!this.administrativeFile) return false;
    return this.administrativeFile.documents.length > 0 &&
      this.administrativeFile.documents.every(document => this.validateDocument(document));
  }

  public getAuditTrail(): ReadonlyArray<DocumentAuditEvent> {
    return this.auditTrail;
  }

  public clearCache(): void {
    this.documentCache.clear();
  }

  public async generateOptimized(
    context: ContractContextModel,
    type: DocumentType,
    format: DocumentFormat
  ): Promise<GeneratedDocument> {
    const key = `${type}:${format}:${valueAt(context, "identification.id", "identification.fileNumber")}`;
    const cached = this.documentCache.get(key);
    if (cached) return cached;
    const generated = await this.generate(context, type, format);
    this.documentCache.set(key, generated);
    return generated;
  }

  public getGenerationMetrics(): GeneratorStatistics {
    return { ...this.statistics };
  }

  public recover(): boolean {
    return this.healthCheck();
  }

  public healthCheck(): boolean {
    return this.configuration !== undefined && this.statistics !== undefined;
  }

  public getEngineInformation(): Record<string, string> {
    return {
      name: DOCUMENT_GENERATOR_NAME,
      version: DOCUMENT_GENERATOR_VERSION,
      description: DOCUMENT_GENERATOR_DESCRIPTION
    };
  }

  public reset(): void {
    this.context = undefined;
    this.documents.length = 0;
    this.variables.clear();
    this.references.length = 0;
    this.administrativeFile = undefined;
    this.clearCache();
  }

  public dispose(): void {
    this.reset();
    this.versions.clear();
    this.auditTrail.length = 0;
  }

  public exportStatistics(): Record<string, unknown> {
    return {
      engine: this.getEngineInformation(),
      metrics: this.getGenerationMetrics(),
      auditEvents: this.auditTrail.length,
      versions: this.versions.size,
      cachedDocuments: this.documentCache.size
    };
  }

  public verifyIntegrity(): boolean {
    return this.healthCheck() && (!this.administrativeFile || this.validateAdministrativeFile());
  }

  private createDocument(type: DocumentType, format: DocumentFormat): GeneratedDocument {
    return {
      id: crypto.randomUUID(),
      type,
      format,
      status: DocumentStatus.CREATED,
      title: this.titleFor(type),
      description: this.configuration.generateMetadata ? `Documento generado automáticamente (${type})` : "",
      version: "1.0",
      created: new Date().toISOString(),
      author: "Asistente de Contratación Pública",
      sections: [],
      tables: [],
      references: [],
      variables: [],
      content: ""
    };
  }

  private addSection(document: GeneratedDocument, title: string, content: string): void {
    document.sections.push({
      id: crypto.randomUUID(),
      title,
      order: document.sections.length + 1,
      mandatory: true,
      generated: true,
      content
    });
  }

  private loadContextVariables(): void {
    if (!this.context) return;
    this.addVariable("EXPEDIENTE", valueAt(this.context, "identification.fileNumber", "identification.expedienteNumber"));
    this.addVariable("OBJETO", valueAt(this.context, "object.description", "object.title"));
    this.addVariable("CPV", valueAt(this.context, "object.cpv", "object.mainCPV"));
    this.addVariable("ORGANO", valueAt(this.context, "identification.contractingAuthority", "administration.authority.name"));
    this.addVariable("UNIDAD", valueAt(this.context, "identification.promotingUnit", "administration.promotingUnit.name"));
    this.addVariable("RESPONSABLE", valueAt(this.context, "identification.contractManager", "administration.contractManager.fullName"));
    this.addVariable("PROCEDIMIENTO", valueAt(this.context, "procedure.procedure", "procedure.procedureType"));
    this.addVariable("VALOR_ESTIMADO", valueAt(this.context, "economic.estimatedValue", "economicInformation.estimatedValue"));
  }

  private loadLegalReferences(): void {
    this.references.push(
      { article: "Artículo 1", regulation: "LCSP", description: "Objeto y finalidad de la Ley." },
      { article: "Artículo 28", regulation: "LCSP", description: "Necesidad e idoneidad." },
      { article: "Artículo 99", regulation: "LCSP", description: "Objeto del contrato." },
      { article: "Artículo 100", regulation: "LCSP", description: "Presupuesto base de licitación." },
      { article: "Artículo 101", regulation: "LCSP", description: "Valor estimado." },
      { article: "Artículo 116", regulation: "LCSP", description: "Expediente de contratación." }
    );
  }

  private titleFor(type: DocumentType): string {
    const titles: Partial<Record<DocumentType, string>> = {
      [DocumentType.JUSTIFICATION_MEMORY]: "Memoria justificativa",
      [DocumentType.ECONOMIC_MEMORY]: "Memoria económica",
      [DocumentType.TECHNICAL_REPORT]: "Informe técnico",
      [DocumentType.LEGAL_REPORT]: "Informe jurídico",
      [DocumentType.LACK_OF_RESOURCES]: "Informe de insuficiencia de medios",
      [DocumentType.PPT]: "Pliego de Prescripciones Técnicas",
      [DocumentType.PCAP]: "Pliego de Cláusulas Administrativas Particulares",
      [DocumentType.CONTRACT_NOTICE]: "Anuncio de licitación",
      [DocumentType.APPROVAL_RESOLUTION]: "Resolución de aprobación del expediente",
      [DocumentType.AWARD_PROPOSAL]: "Propuesta de adjudicación",
      [DocumentType.AWARD_RESOLUTION]: "Resolución de adjudicación",
      [DocumentType.FORMALIZATION]: "Documento de formalización",
      [DocumentType.ANNEX]: "Anexo"
    };
    return titles[type] ?? type;
  }

  private bodyFor(type: DocumentType): string {
    return [
      this.titleFor(type),
      `Expediente: ${this.getVariable("EXPEDIENTE")}`,
      `Objeto: ${this.getVariable("OBJETO")}`,
      `Procedimiento: ${this.getVariable("PROCEDIMIENTO")}`,
      "Documento generado como resultado de la información validada del expediente."
    ].join("\n");
  }

  private validateDocument(document: GeneratedDocument): boolean {
    return Boolean(document.id && document.type && document.format && document.sections.length > 0);
  }

  private render(document: GeneratedDocument, format: DocumentFormat): string {
    if (format === DocumentFormat.JSON) return JSON.stringify(document, null, 2);
    const body = document.content || document.sections.map(section => section.content).join("\n\n");
    if (format === DocumentFormat.HTML) return `<html><body><pre>${this.escapeHtml(body)}</pre></body></html>`;
    if (format === DocumentFormat.XML) return `<document><title>${this.escapeHtml(document.title)}</title><content>${this.escapeHtml(body)}</content></document>`;
    if (format === DocumentFormat.MARKDOWN) return `# ${document.title}\n\n${body}`;
    return body;
  }

  private escapeHtml(value: string): string {
    return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }

  private mimeType(format: DocumentFormat): string {
    const types: Record<DocumentFormat, string> = {
      [DocumentFormat.DOCX]: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      [DocumentFormat.PDF]: "application/pdf",
      [DocumentFormat.HTML]: "text/html",
      [DocumentFormat.MARKDOWN]: "text/markdown",
      [DocumentFormat.JSON]: "application/json",
      [DocumentFormat.XML]: "application/xml"
    };
    return types[format];
  }

  private audit(action: string, documentId?: UUID, details?: Record<string, unknown>): void {
    this.auditTrail.push({ id: crypto.randomUUID(), timestamp: new Date(), action, documentId, details });
  }
}

export class DocumentGeneratorFactory {
  public static create(): DocumentGenerator {
    return new DocumentGenerator();
  }

  public static createDefault(): DocumentGenerator {
    return new DocumentGenerator();
  }
}

export const DOCUMENT_GENERATOR_NAME = "ACP Document Generator";
export const DOCUMENT_GENERATOR_VERSION = "1.0.0";
export const DOCUMENT_GENERATOR_DESCRIPTION = "Motor inteligente de generación documental para expedientes de contratación pública.";
