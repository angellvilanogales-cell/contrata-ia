export type AuditedAdministrativeDocument = "MEMORY" | "PCAP" | "PPT";

export interface UniversalDocumentFactSnapshot {
  document: AuditedAdministrativeDocument;
  facts: Readonly<Record<string, unknown>>;
  sourceId: string;
}

export interface UniversalCrossDocumentConflict {
  factKey: string;
  valuesByDocument: Partial<Record<AuditedAdministrativeDocument, unknown>>;
  sourceIds: readonly string[];
}

export interface UniversalCrossDocumentAuditResult {
  ready: boolean;
  comparedFacts: readonly string[];
  conflicts: readonly UniversalCrossDocumentConflict[];
  missingDocuments: readonly AuditedAdministrativeDocument[];
  blockers: readonly string[];
  humanValidationRequired: true;
}

const REQUIRED_DOCUMENTS: readonly AuditedAdministrativeDocument[] = ["MEMORY", "PCAP", "PPT"];

function stable(value: unknown): string {
  if (Array.isArray(value)) return JSON.stringify(value.map(item => JSON.parse(stable(item))));
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return JSON.stringify(Object.fromEntries(Object.keys(record).sort().map(key => [key, JSON.parse(stable(record[key]))])));
  }
  return JSON.stringify(value);
}

/**
 * Auditor genérico de hechos estructurados ya extraídos/renderizados.
 * No interpreta el texto libre de un pliego ni corrige discrepancias: si dos
 * documentos declaran un mismo hecho con valores distintos, bloquea el paquete.
 */
export function auditUniversalCrossDocuments(snapshots: readonly UniversalDocumentFactSnapshot[]): UniversalCrossDocumentAuditResult {
  const blockers: string[] = [];
  const conflicts: UniversalCrossDocumentConflict[] = [];
  const byDocument = new Map<AuditedAdministrativeDocument, UniversalDocumentFactSnapshot>();

  for (const snapshot of snapshots) {
    if (byDocument.has(snapshot.document)) blockers.push(`Documento duplicado en auditoría: ${snapshot.document}.`);
    else byDocument.set(snapshot.document, snapshot);
  }

  const missingDocuments = REQUIRED_DOCUMENTS.filter(document => !byDocument.has(document));
  for (const missing of missingDocuments) blockers.push(`Falta documento obligatorio para auditoría cruzada: ${missing}.`);

  const keyDocuments = new Map<string, UniversalDocumentFactSnapshot[]>();
  for (const snapshot of byDocument.values()) {
    for (const [key, value] of Object.entries(snapshot.facts)) {
      if (value === undefined || value === null) continue;
      const list = keyDocuments.get(key) ?? [];
      list.push(snapshot);
      keyDocuments.set(key, list);
    }
  }

  const comparedFacts: string[] = [];
  for (const [factKey, documents] of keyDocuments) {
    if (documents.length < 2) continue;
    comparedFacts.push(factKey);
    const signatures = new Map<string, UniversalDocumentFactSnapshot[]>();
    for (const document of documents) {
      const signature = stable(document.facts[factKey]);
      const list = signatures.get(signature) ?? [];
      list.push(document);
      signatures.set(signature, list);
    }
    if (signatures.size > 1) {
      const valuesByDocument: Partial<Record<AuditedAdministrativeDocument, unknown>> = {};
      for (const document of documents) valuesByDocument[document.document] = document.facts[factKey];
      const conflict: UniversalCrossDocumentConflict = {
        factKey,
        valuesByDocument,
        sourceIds: documents.map(document => document.sourceId),
      };
      conflicts.push(conflict);
      blockers.push(`Contradicción entre documentos en ${factKey}; no se resuelve automáticamente.`);
    }
  }

  if (comparedFacts.length === 0 && missingDocuments.length === 0) {
    blockers.push("Los tres documentos están presentes pero no comparten hechos estructurados comparables; no puede declararse auditoría cruzada efectiva.");
  }

  return {
    ready: blockers.length === 0,
    comparedFacts: comparedFacts.sort(),
    conflicts,
    missingDocuments,
    blockers,
    humanValidationRequired: true,
  };
}
