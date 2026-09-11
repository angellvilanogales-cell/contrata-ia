import { EditableTemplateAssetRegistry } from "./EditableTemplateAssetRegistry";
import { DocumentType } from "./DocumentType";

/** Biblioteca física general. Solo incluye activos administrativos realmente verificados. */
export function createStandardEditableTemplateAssetRegistry(): EditableTemplateAssetRegistry {
  const registry = new EditableTemplateAssetRegistry();
  registry.register({
    profileId: "SUPPLY-PCAP-ASA-AUTOFINANCED-JDA-2025-12",
    contractType: "SUPPLY",
    documentType: DocumentType.PCAP,
    templateId: "JDA-PCAP-SUPPLY-ASA-AUTOFINANCED-2025-12-17",
    sourceId: "jda:cccp:pcap:supply:asa:autofinanced:2025-12-17:odt",
    mediaType: "ODT",
    sha256: "45e1e6b16ec41d77206d3ef385c70f87c9120bb0ccce4e43d9a24d245812cadc",
    styleFingerprint: "sha256:9eb23463f4d56abd03531cb909206ef47d749054bf284087bd45867b39e6ceee",
    verified: true,
    active: true,
  });
  return registry;
}
