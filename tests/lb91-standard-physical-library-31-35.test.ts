import { describe, expect, it } from "vitest";
import { DocumentType } from "../src/domain/documentModel/DocumentType";
import { createStandardContractDocumentProfiles } from "../src/domain/documentModel/StandardContractDocumentProfiles";
import { createStandardEditableTemplateAssetRegistry } from "../src/domain/documentModel/StandardEditableTemplateAssetRegistry";

describe("LB91.31-35 - biblioteca física estándar", () => {
  it("habilita físicamente solo el PCAP general de suministro ASA acreditado", () => {
    const profiles = createStandardContractDocumentProfiles();
    const assets = createStandardEditableTemplateAssetRegistry();
    const supply = profiles.findAll("SUPPLY", DocumentType.PCAP).find(item => item.id === "SUPPLY-PCAP-ASA-AUTOFINANCED-JDA-2025-12")!;
    expect(supply.coverage).toBe("FULL_MODEL");
    expect(supply.generationAllowed).toBe(true);
    expect(assets.assess(supply).ready).toBe(true);
  });

  it("no presenta el PCAP de servicios como físicamente generable cuando solo hay PDF acreditado", () => {
    const profiles = createStandardContractDocumentProfiles();
    const assets = createStandardEditableTemplateAssetRegistry();
    const service = profiles.findAll("SERVICE", DocumentType.PCAP)[0];
    expect(service.coverage).toBe("FULL_MODEL");
    expect(service.generationAllowed).toBe(false);
    expect(assets.assess(service).ready).toBe(false);
  });

  it("mantiene obras en cobertura estructural y sin activo editable", () => {
    const profiles = createStandardContractDocumentProfiles();
    const assets = createStandardEditableTemplateAssetRegistry();
    const works = profiles.findAll("WORKS", DocumentType.PCAP)[0];
    expect(works.coverage).toBe("STRUCTURAL_MODEL");
    expect(works.generationAllowed).toBe(false);
    expect(assets.assess(works).ready).toBe(false);
  });
});
