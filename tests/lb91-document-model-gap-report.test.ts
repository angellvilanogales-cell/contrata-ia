import { describe, expect, it } from "vitest";
import { createStandardContractDocumentProfiles } from "../src/domain/documentModel/StandardContractDocumentProfiles";
import { EditableTemplateAssetRegistry } from "../src/domain/documentModel/EditableTemplateAssetRegistry";
import { buildUniversalDocumentModelGapReport, hasCompleteEditableDocumentSet } from "../src/domain/documentModel/UniversalDocumentModelGapReport";

describe("LB91.22 - informe de huecos documentales", () => {
  it("explica por qué obras aún no puede generar el paquete completo", () => {
    const report = buildUniversalDocumentModelGapReport("WORKS", createStandardContractDocumentProfiles(), new EditableTemplateAssetRegistry());
    expect(report.find(item => item.document === "PCAP")?.profileStatus).toBe("PARTIAL");
    expect(report.find(item => item.document === "MEMORY")?.profileStatus).toBe("MISSING");
    expect(report.find(item => item.document === "PPT")?.profileStatus).toBe("MISSING");
    expect(hasCompleteEditableDocumentSet("WORKS", createStandardContractDocumentProfiles(), new EditableTemplateAssetRegistry())).toBe(false);
  });

  it("mantiene concesiones completamente bloqueadas documentalmente mientras no haya modelos acreditados", () => {
    const report = buildUniversalDocumentModelGapReport("CONCESSION", createStandardContractDocumentProfiles(), new EditableTemplateAssetRegistry());
    expect(report.every(item => item.profileStatus === "MISSING")).toBe(true);
  });

  it("distingue perfil completo de activo físico listo", () => {
    const report = buildUniversalDocumentModelGapReport("SERVICE", createStandardContractDocumentProfiles(), new EditableTemplateAssetRegistry());
    const pcap = report.find(item => item.document === "PCAP")!;
    expect(pcap.profileStatus).toBe("FULL");
    expect(pcap.physicalAssetStatus).toBe("MISSING");
  });
});
