import { describe, expect, it } from "vitest";
import {
  UniversalEditableTemplateAsset,
  UniversalEditableTemplateRendererPort,
  UniversalEditableTemplateStore,
  UniversalRenderedEditableDocument,
  auditUniversalEditableRendering,
  renderUniversalEditableDocuments,
} from "../src/application/intake/lb18/UniversalEditableTemplateRendering";
import { evaluateUniversalEditableDocumentPackageClosure } from "../src/application/intake/lb18/UniversalEditableDocumentPackageClosure";
import { UniversalDocumentMappingPackageResult } from "../src/application/intake/lb17/UniversalDocumentMappingPackage";

function mapping(): UniversalDocumentMappingPackageResult {
  return {
    ready: true,
    stage: "READY_FOR_RENDERING",
    contractType: "SERVICE",
    blockers: [],
    documents: [
      {
        documentKind: "DPCAF",
        template: {
          templateId: "service-dpcaf-official-v1",
          sourceId: "official:dpcaf:service:v1",
          contractType: "SERVICE",
          documentKind: "DPCAF",
          official: true,
        },
        facts: [
          {
            slotId: "valor-estimado",
            fieldKey: "estimatedValueCents",
            value: 182_399_114,
            evidenceStatus: "HUMAN_VALIDATED",
            sources: [{ kind: "PRIMARY_DOCUMENT", sourceId: "pcap-source" }],
            legalBasis: ["LCSP:art.101"],
            diagnostics: ["declared-value-preserved"],
          },
        ],
      },
      {
        documentKind: "PPT",
        template: {
          templateId: "service-ppt-official-v1",
          sourceId: "official:ppt:service:v1",
          contractType: "SERVICE",
          documentKind: "PPT",
          official: true,
        },
        facts: [
          {
            slotId: "cpv",
            fieldKey: "cpvMain",
            value: "50700000-2",
            evidenceStatus: "HUMAN_VALIDATED",
            sources: [{ kind: "PRIMARY_DOCUMENT", sourceId: "memory-source" }],
            legalBasis: [],
            diagnostics: [],
          },
        ],
      },
    ],
  };
}

const assets: UniversalEditableTemplateAsset[] = [
  {
    templateId: "service-dpcaf-official-v1",
    sourceId: "official:dpcaf:service:v1",
    documentKind: "DPCAF",
    format: "DOCX",
    mediaType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    contentHash: "sha256:dpcaf-source",
    styleFingerprint: "styles:dpcaf-v1",
    slotIds: ["valor-estimado"],
    editable: true,
  },
  {
    templateId: "service-ppt-official-v1",
    sourceId: "official:ppt:service:v1",
    documentKind: "PPT",
    format: "ODT",
    mediaType: "application/vnd.oasis.opendocument.text",
    contentHash: "sha256:ppt-source",
    styleFingerprint: "styles:ppt-v1",
    slotIds: ["cpv"],
    editable: true,
  },
];

class Store implements UniversalEditableTemplateStore {
  constructor(private readonly items: readonly UniversalEditableTemplateAsset[]) {}
  async get(templateId: string) { return this.items.find(item => item.templateId === templateId) ?? null; }
}

class Renderer implements UniversalEditableTemplateRendererPort {
  constructor(private readonly mutateStyle = false, private readonly dropSlot = false) {}

  async render(request: Parameters<UniversalEditableTemplateRendererPort["render"]>[0]): Promise<UniversalRenderedEditableDocument> {
    const encoded = new TextEncoder().encode(JSON.stringify(request.values));
    return {
      templateId: request.asset.templateId,
      sourceId: request.asset.sourceId,
      documentKind: request.asset.documentKind,
      format: request.asset.format,
      mediaType: request.asset.mediaType,
      originalContentHash: request.asset.contentHash,
      originalStyleFingerprint: request.asset.styleFingerprint,
      renderedContentHash: `sha256:rendered:${request.asset.templateId}`,
      renderedStyleFingerprint: this.mutateStyle ? `${request.asset.styleFingerprint}:changed` : request.asset.styleFingerprint,
      appliedSlots: this.dropSlot ? [] : request.values.map(value => value.slotId),
      bytes: encoded,
    };
  }
}

describe("Bloque 18 - renderizado editable sobre modelo oficial", () => {
  it("18.1 bloquea si falta el activo editable exacto del modelo oficial", async () => {
    const result = await renderUniversalEditableDocuments(mapping(), new Store(assets.slice(0, 1)), new Renderer());
    expect(result.ready).toBe(false);
    expect(result.stage).toBe("NEEDS_EDITABLE_TEMPLATE");
    expect(result.blockers.join(" ")).toContain("service-ppt-official-v1");
  });

  it("18.2 bloquea si el activo no conserva la identidad de fuente oficial", async () => {
    const bad = assets.map(asset => asset.documentKind === "DPCAF" ? { ...asset, sourceId: "otra-fuente" } : asset);
    const result = await renderUniversalEditableDocuments(mapping(), new Store(bad), new Renderer());
    expect(result.ready).toBe(false);
    expect(result.stage).toBe("INVALID_TEMPLATE_ASSET");
    expect(result.blockers.join(" ")).toContain("sourceId oficial");
  });

  it("18.3 renderiza únicamente los slots previamente autorizados por LB17", async () => {
    const result = await renderUniversalEditableDocuments(mapping(), new Store(assets), new Renderer());
    expect(result.ready).toBe(true);
    expect(result.stage).toBe("READY_FOR_DOCUMENT_AUDIT");
    expect(result.documents[0].appliedSlots).toEqual(["valor-estimado"]);
    expect(result.documents[1].appliedSlots).toEqual(["cpv"]);
  });

  it("18.4 rechaza cualquier cambio de huella de estilo", async () => {
    const rendered = await renderUniversalEditableDocuments(mapping(), new Store(assets), new Renderer(true));
    const audit = auditUniversalEditableRendering(mapping(), rendered);
    expect(audit.ready).toBe(false);
    expect(audit.blockers.join(" ")).toContain("ha alterado la huella de estilo");
  });

  it("18.4 rechaza pérdida o incorporación silenciosa de slots", async () => {
    const rendered = await renderUniversalEditableDocuments(mapping(), new Store(assets), new Renderer(false, true));
    const audit = auditUniversalEditableRendering(mapping(), rendered);
    expect(audit.ready).toBe(false);
    expect(audit.blockers.join(" ")).toContain("no ha aplicado exactamente los slots");
  });

  it("18.5 cierra el paquete editable con manifiesto trazable", async () => {
    const rendered = await renderUniversalEditableDocuments(mapping(), new Store(assets), new Renderer());
    const closure = evaluateUniversalEditableDocumentPackageClosure(mapping(), rendered, ["DPCAF", "PPT"]);
    expect(closure.ready).toBe(true);
    expect(closure.blockers).toEqual([]);
    expect(closure.manifest).toHaveLength(2);
    expect(closure.manifest[0]).toMatchObject({
      documentKind: "DPCAF",
      templateId: "service-dpcaf-official-v1",
      sourceId: "official:dpcaf:service:v1",
      styleFingerprint: "styles:dpcaf-v1",
      appliedSlots: ["valor-estimado"],
    });
  });

  it("18.5 no declara cierre si falta un documento requerido", async () => {
    const rendered = await renderUniversalEditableDocuments(mapping(), new Store(assets), new Renderer());
    const closure = evaluateUniversalEditableDocumentPackageClosure(mapping(), rendered, ["DPCAF", "PPT", "PCAP"]);
    expect(closure.ready).toBe(false);
    expect(closure.blockers.join(" ")).toContain("Falta el documento editable requerido PCAP");
  });
});
