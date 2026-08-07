export interface ExportResult {
  format: string;
  success: boolean;
  fileName: string;
  generatedAt: string;
}

export interface DocumentExporter {
  readonly format: string;
  export(expediente: unknown): Promise<ExportResult>;
}

export class ExportManager {
  private readonly exporters: DocumentExporter[] = [];

  public register(exporter: DocumentExporter): void {
    this.exporters.push(exporter);
  }

  public async exportAll(expediente: unknown): Promise<ExportResult[]> {
    return Promise.all(this.exporters.map(exporter => exporter.export(expediente)));
  }

  public async export(format: string, expediente: unknown): Promise<ExportResult>;
  public async export(expediente: unknown): Promise<ExportResult[]>;
  public async export(formatOrExpediente: string | unknown, expediente?: unknown): Promise<ExportResult | ExportResult[]> {
    if (typeof formatOrExpediente === "string") {
      const exporter = this.exporters.find(item => item.format === formatOrExpediente);
      if (!exporter) throw new Error(`Exporter '${formatOrExpediente}' not registered.`);
      return exporter.export(expediente);
    }
    return this.exportAll(formatOrExpediente);
  }

  public prepareAdministrativePackage(expediente: unknown): Record<string, unknown> {
    return { expediente, formats: this.availableFormats(), preparedAt: new Date().toISOString() };
  }

  public availableFormats(): string[] { return this.exporters.map(exporter => exporter.format); }
  public count(): number { return this.exporters.length; }
}
