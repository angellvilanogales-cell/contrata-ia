import { describe, expect, it } from "vitest";
import { EditableTemplateAssetRegistry } from "../src/domain/documentModel/EditableTemplateAssetRegistry";
import { createStandardContractDocumentProfiles } from "../src/domain/documentModel/StandardContractDocumentProfiles";
import { DocumentType } from "../src/domain/documentModel/DocumentType";

const sha = "a".repeat(64);
const style = `sha256:${"b".repeat(64)}`;

describe("LB91.18 - activos editables físicos", () => {
  it("no permite que un perfil estructural de obras se convierta en modelo físico por registrar un descriptor", () => {
    const profiles = createStandardContractDocumentProfiles();
    const profile = profiles.findAll("WORKS", DocumentType.PCAP)[0]!;
    const registry = new EditableTemplateAssetRegistry();
    registry.register({ profileId: profile.id, contractType: "WORKS", documentType: DocumentType.PCAP, templateId: "works-odt", sourceId: "PCAP_WORKS_OPEN_REAL_USER_SOURCE", mediaType: "ODT", sha256: sha, styleFingerprint: style, verified: true, active: true });
    const result = registry.assess(profile);
    expect(result.ready).toBe(false);
    expect(result.blockers.some(item => item.includes("modelo documental completo"))).toBe(true);
  });

  it("exige huellas criptográficas válidas", () => {
    const registry = new EditableTemplateAssetRegistry();
    expect(() => registry.register({ profileId: "x", contractType: "SERVICE", documentType: DocumentType.PCAP, templateId: "x", sourceId: "s", mediaType: "ODT", sha256: "bad", styleFingerprint: style, verified: true, active: true })).toThrow(/SHA-256/);
  });

  it("solo habilita un FULL_MODEL cuando perfil y activo están alineados, activos y verificados", () => {
    const profiles = createStandardContractDocumentProfiles();
    const profile = profiles.findAll("SERVICE", DocumentType.PCAP)[0]!;
    const registry = new EditableTemplateAssetRegistry();
    registry.register({ profileId: profile.id, contractType: "SERVICE", documentType: DocumentType.PCAP, templateId: "service-pcap-odt", sourceId: "PCAP_SERVICES_OPEN_2025_12", mediaType: "ODT", sha256: sha, styleFingerprint: style, verified: true, active: true });
    expect(registry.assess(profile).ready).toBe(true);
  });
});
