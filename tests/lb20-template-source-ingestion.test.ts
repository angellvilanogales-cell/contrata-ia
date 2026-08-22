import { describe, expect, it } from "vitest";
import { UniversalOfficialTemplateRegistry } from "../src/application/intake/lb19/UniversalOfficialTemplateRegistry";
import {
  ingestUniversalTemplateSource,
  UniversalTemplateHumanClassification,
  UniversalTemplateSourceFile,
} from "../src/application/intake/lb20/UniversalTemplateSourceIngestion";
import {
  auditUniversalTemplateSourceInventory,
  bootstrapUniversalTemplateRegistry,
  evaluateUniversalTemplateProductionClosure,
} from "../src/application/intake/lb20/UniversalTemplateProductionBootstrap";

function docx(name = "DPCAF servicios.docx"): UniversalTemplateSourceFile {
  return {
    sourceId: "fuente-oficial",
    sourceLocator: `fuentes/${name}`,
    fileName: name,
    mediaType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    byteLength: 1000,
    contentHash: `sha256:${name}`,
    styleFingerprint: "style:v1",
    discoveredSlotIds: ["objeto", "valor-estimado"],
  };
}

const serviceDpcaf: UniversalTemplateHumanClassification = {
  sourceRole: "OFFICIAL_MODEL",
  officialSourceConfirmed: true,
  templateId: "dpcaf-service-v1",
  contractType: "SERVICE",
  documentKind: "DPCAF",
  effectiveFrom: "2026-01-01",
};

describe("Bloque 20 - ingesta física de modelos oficiales", () => {
  it("20.1 no confunde un PDF de ejemplo con un activo editable de producción", () => {
    const result = ingestUniversalTemplateSource({
      ...docx("PCAP suministro windows Veiasa.pdf"),
      mediaType: "application/pdf",
    }, {
      sourceRole: "OFFICIAL_MODEL",
      officialSourceConfirmed: true,
      templateId: "pcap-supply",
      contractType: "SUPPLY",
      documentKind: "PCAP",
      effectiveFrom: "2026-01-01",
    });
    expect(result.ready).toBe(false);
    expect(result.stage).toBe("NEEDS_EDITABLE_ORIGINAL");
  });

  it("20.1 conserva expresamente los ejemplos como referencia sin promoverlos", () => {
    const result = ingestUniversalTemplateSource(docx("ejemplo.docx"), {
      sourceRole: "EXAMPLE_REFERENCE",
      officialSourceConfirmed: false,
    });
    expect(result.ready).toBe(false);
    expect(result.stage).toBe("REFERENCE_ONLY");
    expect(result.record).toBeNull();
  });

  it("20.2 exige clasificación y confirmación humana aunque el archivo sea DOCX", () => {
    const result = ingestUniversalTemplateSource(docx(), {
      sourceRole: "UNKNOWN",
      officialSourceConfirmed: false,
    });
    expect(result.ready).toBe(false);
    expect(result.stage).toBe("NEEDS_HUMAN_CLASSIFICATION");
  });

  it("20.3 crea exclusivamente una declaración de fuente, nunca una validación automática", () => {
    const result = ingestUniversalTemplateSource(docx(), serviceDpcaf);
    expect(result.ready).toBe(true);
    expect(result.record?.status).toBe("SOURCE_DECLARED");
    expect(result.record?.contractType).toBe("SERVICE");
    expect(result.record?.documentKind).toBe("DPCAF");
  });

  it("20.4 incorpora resultados completos al registro pero siguen pendientes de validación LB19", () => {
    const ingestion = ingestUniversalTemplateSource(docx(), serviceDpcaf);
    const boot = bootstrapUniversalTemplateRegistry(new UniversalOfficialTemplateRegistry(), [ingestion]);
    expect(boot.blockers).toEqual([]);
    expect(boot.ingestedRegistryIds).toEqual(["dpcaf-service-v1@2026-01-01"]);
    expect(boot.registry.list()[0].status).toBe("SOURCE_DECLARED");
    const closure = evaluateUniversalTemplateProductionClosure(boot.registry, [
      { contractType: "SERVICE", procurementDate: "2026-08-22", requiredKinds: ["DPCAF"] },
    ]);
    expect(closure.ready).toBe(false);
    expect(closure.sourceDeclaredPendingValidation).toEqual(["dpcaf-service-v1@2026-01-01"]);
  });

  it("20.5 cierra producción solo después de validación humana y cobertura exacta", () => {
    const ingestion = ingestUniversalTemplateSource(docx(), serviceDpcaf);
    const boot = bootstrapUniversalTemplateRegistry(new UniversalOfficialTemplateRegistry(), [ingestion]);
    const validated = boot.registry.validateSource("dpcaf-service-v1@2026-01-01", "responsable-modelos", "Modelo contrastado con fuente oficial.");
    const closure = evaluateUniversalTemplateProductionClosure(validated, [
      { contractType: "SERVICE", procurementDate: "2026-08-22", requiredKinds: ["DPCAF"] },
    ]);
    expect(closure.ready).toBe(true);
    expect(closure.blockers).toEqual([]);
  });

  it("audita el inventario real aportado sin considerar editables los PCAP/PPT/memorias PDF", () => {
    const files = [
      "1 MEMORIA suministro windows Veiasa.pdf",
      "1 PCAP suministro windows Veiasa.pdf",
      "1 PPT suministro windows Veiasa.pdf",
      "2 Memoria Muebles juzgados Cádiz.pdf",
      "2 PCAP Muebles juzgados Cádiz.pdf",
      "2 PPT Muebles juzgados Cádiz.pdf",
      "3 Memoria suministro Tablets.pdf",
      "3 PCAP suministro Tablets.pdf",
      "3 PPT suministro Tablets.pdf",
      "05 Memo aulas digitales.pdf",
      "05 PCAP aulas digitales.pdf",
      "05 PPT aulas digitales.pdf",
      "06 Memoria Panda antivirus.pdf",
      "06 PCAP Panda antivirus.pdf",
      "06 PPT Panda antivirus.pdf",
    ];
    const audit = auditUniversalTemplateSourceInventory(files.map(fileName => ({
      sourceSet: "fuentes-proyecto-2026-08-22",
      fileName,
      mediaType: "application/pdf",
      editableCandidate: false,
      role: "REFERENCE_ONLY" as const,
      note: "Documento aportado como fuente/ejemplo; no acredita por sí solo un modelo editable oficial.",
    })));
    expect(audit.total).toBe(15);
    expect(audit.editableCandidates).toBe(0);
    expect(audit.referenceOnly).toBe(15);
    expect(audit.blockers).toEqual([]);
  });
});
