import { createHash } from "node:crypto";
import { UniversalEditableTemplateRendererPort, UniversalEditableTemplateRenderRequest, UniversalRenderedEditableDocument } from "../lb18/UniversalEditableTemplateRendering";
import { OdtZipEntry, readOdtZip, writeOdtZip } from "./OdtPackageCodec";

export interface UniversalEditableTemplateBinarySource {
  templateId: string;
  sourceId: string;
  bytes: Uint8Array;
}

export interface UniversalEditableTemplateBinaryStore {
  get(templateId: string): Promise<UniversalEditableTemplateBinarySource | null>;
}

export interface UniversalOdtPhysicalSlotBinding {
  slotId: string;
  part: "content.xml" | "styles.xml";
  /** Fragmento XML exacto y único que ancla físicamente el hueco en el original. */
  xmlToken: string;
  /**
   * Subcadena dentro de xmlToken que se sustituye por el valor. Si se omite se
   * sustituye xmlToken completo (compatibilidad con bindings sintéticos LB23).
   * En modelos reales debe usarse para conservar el elemento/span y su estilo.
   */
  valueToken?: string;
  /**
   * TEXT es el modo por defecto y escapa XML. RAW_XML solo se admite con un
   * formatter explícito y sirve para sustituir un fragmento ODF completo por
   * otro fragmento estructural controlado. Nunca serializa entrada de usuario
   * directamente como XML.
   */
  escapeMode?: "TEXT" | "RAW_XML";
  sourceSection: string;
  sourceLabel: string;
}

export type UniversalTemplateValueFormatter = (value: unknown, sourceFieldKey: string) => string;

export interface UniversalOdtRendererConfiguration {
  bindingsByTemplateId: Readonly<Record<string, readonly UniversalOdtPhysicalSlotBinding[]>>;
  formattersBySlotId?: Readonly<Record<string, UniversalTemplateValueFormatter>>;
}

function sha256(bytes: Uint8Array | string): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function normalizeSha256(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (/^[a-f0-9]{64}$/.test(trimmed)) return `sha256:${trimmed}`;
  if (/^sha256:[a-f0-9]{64}$/.test(trimmed)) return trimmed;
  return null;
}

function xmlEscape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function defaultFormat(value: unknown, fieldKey: string): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error(`El campo ${fieldKey} contiene un número no finito.`);
    return String(value);
  }
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (Array.isArray(value) && value.every(item => ["string", "number", "boolean"].includes(typeof item))) {
    return value.map(item => typeof item === "boolean" ? (item ? "Sí" : "No") : String(item)).join(", ");
  }
  throw new Error(`El campo estructurado ${fieldKey} requiere un formateador documental explícito; no se serializa automáticamente.`);
}

function countOccurrences(text: string, token: string): number {
  if (!token.length) return 0;
  let count = 0;
  let cursor = 0;
  while ((cursor = text.indexOf(token, cursor)) >= 0) { count += 1; cursor += token.length; }
  return count;
}

function getEntry(entries: readonly OdtZipEntry[], name: string): OdtZipEntry {
  const entry = entries.find(item => item.name === name);
  if (!entry) throw new Error(`ODT inválido: falta ${name}.`);
  return entry;
}

function automaticStyles(contentXml: string): string {
  const match = contentXml.match(/<office:automatic-styles\b[\s\S]*?<\/office:automatic-styles>/);
  return match?.[0] ?? "";
}

export function computeOdtStyleFingerprint(entries: readonly OdtZipEntry[]): string {
  const styles = Buffer.from(getEntry(entries, "styles.xml").bytes).toString("utf8");
  const content = Buffer.from(getEntry(entries, "content.xml").bytes).toString("utf8");
  const settings = entries.find(item => item.name === "settings.xml");
  return sha256([styles, automaticStyles(content), settings ? Buffer.from(settings.bytes).toString("utf8") : ""].join("\n--CONTRATA-IA-STYLE-PART--\n"));
}

function validateOdt(entries: readonly OdtZipEntry[]): void {
  const mime = Buffer.from(getEntry(entries, "mimetype").bytes).toString("utf8").trim();
  if (mime !== "application/vnd.oasis.opendocument.text") throw new Error(`El activo no es un ODT de texto válido: mimetype=${mime}.`);
  getEntry(entries, "content.xml");
  getEntry(entries, "styles.xml");
  getEntry(entries, "META-INF/manifest.xml");
}

function replacePart(entries: readonly OdtZipEntry[], part: string, nextText: string): OdtZipEntry[] {
  return entries.map(entry => entry.name === part ? { ...entry, bytes: Buffer.from(nextText, "utf8") } : entry);
}

function validateBinding(binding: UniversalOdtPhysicalSlotBinding, partText: string): void {
  if (!binding.xmlToken.length || !binding.sourceSection.trim() || !binding.sourceLabel.trim()) {
    throw new Error(`Binding físico incompleto para ${binding.slotId}.`);
  }
  const occurrences = countOccurrences(partText, binding.xmlToken);
  if (occurrences !== 1) {
    throw new Error(`El anclaje físico de ${binding.slotId} aparece ${occurrences} veces en ${binding.part}; se exige coincidencia exacta y única.`);
  }
  const valueToken = binding.valueToken ?? binding.xmlToken;
  const valueOccurrences = countOccurrences(binding.xmlToken, valueToken);
  if (!valueToken.length || valueOccurrences !== 1) {
    throw new Error(`El valueToken de ${binding.slotId} debe aparecer exactamente una vez dentro de su anclaje físico.`);
  }
}

/**
 * Renderer ODT que modifica el paquete original sin regenerar estilos,
 * numeración ni estructura. En activos reales el binding usa un anclaje XML
 * único y un valueToken interior: se sustituye solo el texto del hueco y se
 * preservan los spans/estilos administrativos del modelo oficial.
 *
 * Para fragmentos ODF estructurados se permite RAW_XML únicamente cuando existe
 * un formatter explícito del slot. Ese formatter es responsable de devolver una
 * estructura cerrada y controlada; nunca se usa defaultFormat en RAW_XML.
 */
export class UniversalOdtProductionRenderer implements UniversalEditableTemplateRendererPort {
  public constructor(
    private readonly binaryStore: UniversalEditableTemplateBinaryStore,
    private readonly configuration: UniversalOdtRendererConfiguration,
  ) {}

  public async render(request: UniversalEditableTemplateRenderRequest): Promise<UniversalRenderedEditableDocument> {
    if (request.asset.format !== "ODT") throw new Error(`El renderer ODT no admite ${request.asset.format}.`);
    const source = await this.binaryStore.get(request.asset.templateId);
    if (!source) throw new Error(`No se encuentran bytes del original editable ${request.asset.templateId}.`);
    if (source.templateId !== request.asset.templateId || source.sourceId !== request.asset.sourceId) {
      throw new Error(`Los bytes recuperados no conservan la identidad del modelo oficial ${request.asset.templateId}.`);
    }

    const expectedContentHash = normalizeSha256(request.asset.contentHash);
    if (!expectedContentHash) throw new Error(`El activo ${request.asset.templateId} debe registrar un SHA-256 verificable antes de producción.`);
    const sourceHash = sha256(source.bytes);
    if (sourceHash !== expectedContentHash) throw new Error(`El SHA-256 del original editable ${request.asset.templateId} no coincide con el registro.`);

    let entries = readOdtZip(source.bytes);
    validateOdt(entries);
    const sourceStyleFingerprint = computeOdtStyleFingerprint(entries);
    const expectedStyleFingerprint = normalizeSha256(request.asset.styleFingerprint);
    if (!expectedStyleFingerprint) throw new Error(`El activo ${request.asset.templateId} debe registrar una huella de estilo SHA-256 verificable.`);
    if (sourceStyleFingerprint !== expectedStyleFingerprint) throw new Error(`La huella de estilo del original ${request.asset.templateId} no coincide con el registro.`);

    const bindings = this.configuration.bindingsByTemplateId[request.asset.templateId] ?? [];
    const bindingIds = bindings.map(binding => binding.slotId).sort();
    const assetIds = [...request.asset.slotIds].sort();
    if (JSON.stringify(bindingIds) !== JSON.stringify(assetIds)) {
      throw new Error(`El inventario físico de slots de ${request.asset.templateId} no coincide con el activo registrado.`);
    }

    const seenBindings = new Set<string>();
    for (const binding of bindings) {
      if (seenBindings.has(binding.slotId)) throw new Error(`Binding físico duplicado: ${binding.slotId}.`);
      seenBindings.add(binding.slotId);
      const partText = Buffer.from(getEntry(entries, binding.part).bytes).toString("utf8");
      validateBinding(binding, partText);
      if (binding.escapeMode === "RAW_XML" && !this.configuration.formattersBySlotId?.[binding.slotId]) {
        throw new Error(`El binding RAW_XML ${binding.slotId} exige un formateador explícito.`);
      }
    }

    const appliedSlots: string[] = [];
    for (const value of request.values) {
      const binding = bindings.find(item => item.slotId === value.slotId);
      if (!binding) throw new Error(`No existe binding físico para el slot ${value.slotId}.`);
      const explicitFormatter = this.configuration.formattersBySlotId?.[value.slotId];
      if (binding.escapeMode === "RAW_XML" && !explicitFormatter) {
        throw new Error(`El binding RAW_XML ${binding.slotId} no puede usar serialización automática.`);
      }
      const formatter = explicitFormatter ?? defaultFormat;
      const formattedValue = formatter(value.value, value.sourceFieldKey);
      const renderedValue = binding.escapeMode === "RAW_XML" ? formattedValue : xmlEscape(formattedValue);
      const entry = getEntry(entries, binding.part);
      const partText = Buffer.from(entry.bytes).toString("utf8");
      validateBinding(binding, partText);
      const valueToken = binding.valueToken ?? binding.xmlToken;
      const anchoredReplacement = binding.xmlToken.replace(valueToken, renderedValue);
      entries = replacePart(entries, binding.part, partText.replace(binding.xmlToken, anchoredReplacement));
      appliedSlots.push(value.slotId);
    }

    const renderedStyleFingerprint = computeOdtStyleFingerprint(entries);
    if (renderedStyleFingerprint !== sourceStyleFingerprint) {
      throw new Error(`El renderizado de ${request.asset.templateId} alteró la huella de estilo del modelo oficial.`);
    }

    const bytes = writeOdtZip(entries);
    return {
      templateId: request.asset.templateId,
      sourceId: request.asset.sourceId,
      documentKind: request.asset.documentKind,
      format: "ODT",
      mediaType: request.asset.mediaType,
      originalContentHash: sourceHash,
      originalStyleFingerprint: sourceStyleFingerprint,
      renderedContentHash: sha256(bytes),
      renderedStyleFingerprint,
      appliedSlots,
      bytes,
    };
  }
}

export function createInMemoryEditableTemplateBinaryStore(
  sources: readonly UniversalEditableTemplateBinarySource[],
): UniversalEditableTemplateBinaryStore {
  const byTemplate = new Map(sources.map(source => [source.templateId, source] as const));
  return { async get(templateId: string) { return byTemplate.get(templateId) ?? null; } };
}
