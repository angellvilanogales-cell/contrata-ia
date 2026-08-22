import { describe, expect, it } from "vitest";
import {
  registryRecordToEditableAsset,
  registryRecordToOfficialDescriptor,
  UniversalOfficialTemplateRegistry,
  UniversalOfficialTemplateRegistryRecord,
} from "../src/application/intake/lb19/UniversalOfficialTemplateRegistry";
import {
  buildUniversalOfficialTemplateBundle,
  evaluateUniversalOfficialTemplateRegistryClosure,
} from "../src/application/intake/lb19/UniversalOfficialTemplateBundle";

function record(overrides: Partial<UniversalOfficialTemplateRegistryRecord> = {}): UniversalOfficialTemplateRegistryRecord {
  return {
    registryId: "service-dpcaf-2026-v1",
    templateId: "service-dpcaf-v1",
    sourceId: "official-dpcaf-service-2026",
    sourceLocator: "fuentes/modelos/servicios/dpcaf.docx",
    contractType: "SERVICE",
    documentKind: "DPCAF",
    format: "DOCX",
    mediaType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    contentHash: "sha256:dpcaf-v1",
    styleFingerprint: "style:dpcaf-v1",
    slotIds: ["objeto", "valor-estimado"],
    effectiveFrom: "2026-01-01",
    status: "SOURCE_DECLARED",
    ...overrides,
  };
}

function validated(overrides: Partial<UniversalOfficialTemplateRegistryRecord> = {}): UniversalOfficialTemplateRegistryRecord {
  return record({ status: "HUMAN_VALIDATED", validatedBy: "tecnico-contratacion", ...overrides });
}

describe("Bloque 19 - registro y versionado de modelos oficiales", () => {
  it("19.1 exige procedencia, huellas y vigencia antes de admitir un modelo", () => {
    expect(() => new UniversalOfficialTemplateRegistry([record({ sourceLocator: "" })])).toThrow(/sourceLocator vacío/);
    expect(() => new UniversalOfficialTemplateRegistry([record({ contentHash: "" })])).toThrow(/contentHash vacío/);
    expect(() => new UniversalOfficialTemplateRegistry([record({ effectiveTo: "2025-12-31" })])).toThrow(/anterior/);
  });

  it("19.1 ingiere como declaración de fuente y exige validación humana explícita para promover", () => {
    const registry = new UniversalOfficialTemplateRegistry().ingest(record());
    expect(registry.select("SERVICE", "DPCAF", "2026-08-22").ready).toBe(false);

    const promoted = registry.validateSource("service-dpcaf-2026-v1", "asesor técnico", "Modelo contrastado con la fuente oficial");
    const selected = promoted.select("SERVICE", "DPCAF", "2026-08-22");
    expect(selected.ready).toBe(true);
    expect(selected.record?.validatedBy).toBe("asesor técnico");
  });

  it("19.2 selecciona la versión exacta por fecha de tramitación sin usar versiones futuras", () => {
    const registry = new UniversalOfficialTemplateRegistry([
      validated({ registryId: "service-dpcaf-2025", templateId: "service-dpcaf-2025", contentHash: "sha256:2025", effectiveFrom: "2025-01-01", effectiveTo: "2025-12-31" }),
      validated({ registryId: "service-dpcaf-2026", templateId: "service-dpcaf-2026", contentHash: "sha256:2026", effectiveFrom: "2026-01-01" }),
    ]);
    expect(registry.select("SERVICE", "DPCAF", "2025-06-01").record?.registryId).toBe("service-dpcaf-2025");
    expect(registry.select("SERVICE", "DPCAF", "2026-06-01").record?.registryId).toBe("service-dpcaf-2026");
  });

  it("19.2 conserva como bloqueo un solape de versiones oficiales validadas", () => {
    const registry = new UniversalOfficialTemplateRegistry([
      validated({ registryId: "v1", templateId: "service-dpcaf-v1", contentHash: "sha256:v1", effectiveFrom: "2026-01-01" }),
      validated({ registryId: "v2", templateId: "service-dpcaf-v2", contentHash: "sha256:v2", effectiveFrom: "2026-06-01" }),
    ]);
    const result = registry.select("SERVICE", "DPCAF", "2026-08-22");
    expect(result.ready).toBe(false);
    expect(result.blockers.join(" ")).toContain("solape requiere resolución humana");
  });

  it("19.3 nunca convierte un registro no validado en descriptor oficial o activo editable", () => {
    expect(() => registryRecordToOfficialDescriptor(record())).toThrow(/no está validado humanamente/);
    expect(() => registryRecordToEditableAsset(record())).toThrow(/no está validado humanamente/);

    const source = validated();
    const descriptor = registryRecordToOfficialDescriptor(source);
    const asset = registryRecordToEditableAsset(source);
    expect(descriptor.official).toBe(true);
    expect(descriptor.locator).toBe(source.sourceLocator);
    expect(asset.contentHash).toBe(source.contentHash);
    expect(asset.styleFingerprint).toBe(source.styleFingerprint);
  });

  it("19.4 construye un único paquete vigente que alimenta directamente LB17 y LB18", async () => {
    const registry = new UniversalOfficialTemplateRegistry([
      validated(),
      validated({ registryId: "service-pcap-2026", templateId: "service-pcap-v1", sourceId: "official-pcap-service-2026", sourceLocator: "fuentes/modelos/servicios/pcap.docx", documentKind: "PCAP", contentHash: "sha256:pcap", styleFingerprint: "style:pcap", slotIds: ["procedimiento"] }),
      validated({ registryId: "service-ppt-2026", templateId: "service-ppt-v1", sourceId: "official-ppt-service-2026", sourceLocator: "fuentes/modelos/servicios/ppt.docx", documentKind: "PPT", contentHash: "sha256:ppt", styleFingerprint: "style:ppt", slotIds: ["cpv"] }),
      validated({ registryId: "service-memoria-2026", templateId: "service-memoria-v1", sourceId: "official-memoria-service-2026", sourceLocator: "fuentes/modelos/servicios/memoria.docx", documentKind: "MEMORIA", contentHash: "sha256:memoria", styleFingerprint: "style:memoria", slotIds: ["objeto"] }),
    ]);

    const built = buildUniversalOfficialTemplateBundle(registry, "SERVICE", "2026-08-22", ["MEMORIA", "DPCAF", "PCAP", "PPT"]);
    expect(built.ready).toBe(true);
    expect(built.bundle?.catalog.resolveBundle("SERVICE", ["MEMORIA", "DPCAF", "PCAP", "PPT"]).ready).toBe(true);
    expect((await built.bundle?.editableStore.get("service-dpcaf-v1"))?.editable).toBe(true);
  });

  it("19.5 cierra únicamente si hay exactamente una versión oficial validada por documento requerido", () => {
    const registry = new UniversalOfficialTemplateRegistry([
      validated(),
      validated({ registryId: "service-pcap-2026", templateId: "service-pcap-v1", sourceId: "official-pcap-service-2026", sourceLocator: "pcap.docx", documentKind: "PCAP", contentHash: "sha256:pcap", styleFingerprint: "style:pcap" }),
    ]);

    const ok = evaluateUniversalOfficialTemplateRegistryClosure(registry, "SERVICE", "2026-08-22", ["DPCAF", "PCAP"]);
    expect(ok.ready).toBe(true);
    expect(ok.selectedRegistryIds).toEqual(["service-dpcaf-2026-v1", "service-pcap-2026"]);

    const missing = evaluateUniversalOfficialTemplateRegistryClosure(registry, "SERVICE", "2026-08-22", ["DPCAF", "PCAP", "PPT"]);
    expect(missing.ready).toBe(false);
    expect(missing.blockers.join(" ")).toContain("No existe modelo oficial validado y vigente PPT");
  });

  it("19.5 permite retirar una versión y deja de seleccionarla", () => {
    const registry = new UniversalOfficialTemplateRegistry([validated()]).retire("service-dpcaf-2026-v1");
    expect(registry.select("SERVICE", "DPCAF", "2026-08-22").ready).toBe(false);
  });
});
