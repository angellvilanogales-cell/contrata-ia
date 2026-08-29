import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { FERRETERIA_PCAP_FINAL_DOCUMENT, evaluateFerreteriaPcapFinalClosure } from "../src/application/intake/lb46/FerreteriaPcapFinalDocumentClosure";
import { LB102_PILOT_PACKAGE_CATALOG } from "../src/application/operations/lb102/LB102PilotPackageCatalog";

function source(path: string): string { return fs.readFileSync(path, "utf8"); }

describe("LB102 Ferretería: ruta física protegida del piloto", () => {
  it("reutiliza LB60 y no el finalizador parcial descubierto por la UAT", () => {
    const renderer = source("src/application/operations/lb102/FerreteriaPilotPcapRenderer.ts");
    expect(renderer).toContain("finalizeFerreteriaPcapRenderedOdt");
    expect(renderer).toContain("../../intake/lb60/FerreteriaPcapFinalPostProcessor");
    expect(renderer).not.toContain("sourceBackedFerreteriaDecision");
    expect(renderer).not.toContain("content.replace(/<text:p");
  });

  it("exige Memoria/PPT protegidos LB59 y bloquea si faltan los binarios fuente", () => {
    const generator = source("src/application/operations/lb102/FerreteriaPilotPackageGenerator.ts");
    expect(generator).toContain("renderFerreteriaProtectedMemory");
    expect(generator).toContain("renderFerreteriaProtectedPpt");
    expect(generator).toContain("MISSING_SOURCE");
    expect(generator).not.toContain("generateSupplyGeneralEvidenceDocuments");
  });

  it("el catálogo LB102 no permite fallback al paquete Supply general", () => {
    const catalog = source("src/application/operations/lb102/LB102PilotPackageCatalog.ts");
    expect(catalog).toContain("generateFerreteriaPilotPackage");
    expect(catalog).not.toContain("generateSupplyUserDocumentPackage");
    const ferreteria = LB102_PILOT_PACKAGE_CATALOG.find(item => item.id === "supply-ferreteria");
    expect(ferreteria?.profile).toBe("FERRETERIA_SUPPLY_ASA_DA33_LB102_PROTECTED");
  });

  it("mantiene el cierre PCAP final histórico como contrato de regresión", () => {
    expect(FERRETERIA_PCAP_FINAL_DOCUMENT.catalogueRows).toBe(98);
    expect(FERRETERIA_PCAP_FINAL_DOCUMENT.residualAuthorityPlaceholdersBlocked).toBe(true);
    expect(evaluateFerreteriaPcapFinalClosure().engineeringClosed).toBe(true);
    expect(evaluateFerreteriaPcapFinalClosure().productionReady).toBe(false);
  });
});
