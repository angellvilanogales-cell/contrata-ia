import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { FERRETERIA_PCAP_FINAL_DOCUMENT, evaluateFerreteriaPcapFinalClosure } from "../src/application/intake/lb46/FerreteriaPcapFinalDocumentClosure";
import { LB102_PILOT_PACKAGE_CATALOG } from "../src/application/operations/lb102/LB102PilotPackageCatalog";

function source(path: string): string { return fs.readFileSync(path, "utf8"); }

describe("LB102 Ferretería: ruta física protegida del piloto", () => {
  it("conserva LB60 únicamente como cierre histórico, no como generador de la tríada post-Intervención", () => {
    const renderer = source("src/application/operations/lb102/FerreteriaPilotPcapRenderer.ts");
    expect(renderer).toContain("finalizeFerreteriaPcapRenderedOdt");
    expect(renderer).toContain("../../intake/lb60/FerreteriaPcapFinalPostProcessor");
    const generator = source("src/application/operations/lb102/FerreteriaPilotPackageGenerator.ts");
    expect(generator).not.toContain("renderFerreteriaPilotPcap");
  });

  it("mantiene el paquete indivisible y las regresiones de Intervención sobre la tríada validada", () => {
    const generator = source("src/application/operations/lb102/FerreteriaPilotPackageGenerator.ts");
    expect(generator).toContain("LB102_FERRETERIA_SOURCE_ASSETS");
    expect(generator).toContain("PCAP+MEMORIA+PPT");
    expect(generator).toContain("assertAtomicDocumentPackage");
    expect(generator).toContain("ferreteriaInterventionConsistencyAudit");
    expect(generator).toContain("canonicalSnapshot:LB102_SUPPLY_FERRETERIA");
    expect(generator).toContain("humanValidatedValues");
    expect(generator).not.toContain("generateSupplyGeneralEvidenceDocuments");
  });

  it("el catálogo LB102 no permite fallback y publica la revisión post-Intervención", () => {
    const catalog = source("src/application/operations/lb102/LB102PilotPackageCatalog.ts");
    expect(catalog).toContain("generateFerreteriaPilotPackage");
    expect(catalog).not.toContain("generateSupplyUserDocumentPackage");
    const ferreteria = LB102_PILOT_PACKAGE_CATALOG.find(item => item.id === "supply-ferreteria");
    expect(ferreteria?.profile).toBe("FERRETERIA_SUPPLY_ASA_LB102_POST_INTERVENCION_V2");
    expect(ferreteria?.atomicDocumentSet).toEqual(["PCAP","MEMORIA","PPT"]);
  });

  it("mantiene el cierre PCAP histórico solo como contrato de regresión", () => {
    expect(FERRETERIA_PCAP_FINAL_DOCUMENT.catalogueRows).toBe(98);
    expect(FERRETERIA_PCAP_FINAL_DOCUMENT.residualAuthorityPlaceholdersBlocked).toBe(true);
    expect(evaluateFerreteriaPcapFinalClosure().engineeringClosed).toBe(true);
    expect(evaluateFerreteriaPcapFinalClosure().productionReady).toBe(false);
  });
});
