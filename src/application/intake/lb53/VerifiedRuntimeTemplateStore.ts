import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { UniversalEditableTemplateBinarySource, UniversalEditableTemplateBinaryStore } from "../lb23/UniversalOdtProductionRenderer";

export type V1DocumentAssetKind = "PCAP" | "MEMORIA" | "PPT";

export interface VerifiedRuntimeAssetDescriptor {
  kind: V1DocumentAssetKind;
  templateId: string;
  sourceId: string;
  fileName: string;
  sha256: string;
  required: boolean;
}

export const V1_RUNTIME_ASSET_MANIFEST: readonly VerifiedRuntimeAssetDescriptor[] = [
  {
    kind: "PCAP",
    templateId: "JDA-PCAP-SUPPLY-ASA-AUTOFINANCED-2025-12-17",
    sourceId: "jda:cccp:pcap:supply:asa:autofinanced:2025-12-17:odt",
    fileName: "2025_12_17_pcap_suministro_abierto_simplificado_abreviado_autofinanciada.odt",
    sha256: "45e1e6b16ec41d77206d3ef385c70f87c9120bb0ccce4e43d9a24d245812cadc",
    required: true,
  },
  {
    kind: "MEMORIA",
    templateId: "case:CONTR-2026-240267:memoria:v12:editable",
    sourceId: "case:CONTR-2026-240267:memoria:v12:editable",
    fileName: "04_Memoría Ferretería SSCC SAE V12_letrado.odt",
    sha256: "36ed482048e19bc8b1f9c4fe1b8f1bd47eb81ac9e256dd4f0488e7bc97b8e4dc",
    required: true,
  },
  {
    kind: "PPT",
    templateId: "case:CONTR-2026-240267:ppt:v6:editable",
    sourceId: "case:CONTR-2026-240267:ppt:v6:editable",
    fileName: "PPT Feretería SSCC SAE V6.odt",
    sha256: "c3f4199e3929718f278cc7d77c04d7e6082b79858e52ff193f1a79b17edd3f09",
    required: true,
  },
] as const;

function hash(bytes: Uint8Array): string { return createHash("sha256").update(bytes).digest("hex"); }

export class VerifiedRuntimeTemplateStore implements UniversalEditableTemplateBinaryStore {
  public constructor(private readonly root: string, private readonly manifest: readonly VerifiedRuntimeAssetDescriptor[] = V1_RUNTIME_ASSET_MANIFEST) {}

  public async get(templateId: string): Promise<UniversalEditableTemplateBinarySource | null> {
    const descriptor = this.manifest.find(item => item.templateId === templateId);
    if (!descriptor) return null;
    if (!/^[a-f0-9]{64}$/.test(descriptor.sha256)) return null;
    const file = path.join(this.root, descriptor.fileName);
    if (!fs.existsSync(file)) return null;
    const bytes = fs.readFileSync(file);
    if (hash(bytes) !== descriptor.sha256) throw new Error(`El activo ${descriptor.kind} existe pero su SHA-256 no coincide con la fuente verificada.`);
    return { templateId: descriptor.templateId, sourceId: descriptor.sourceId, bytes };
  }

  public inspect() {
    return this.manifest.map(descriptor => {
      const file = path.join(this.root, descriptor.fileName);
      const exists = fs.existsSync(file);
      const expectedHashKnown = /^[a-f0-9]{64}$/.test(descriptor.sha256);
      const actualHash = exists ? hash(fs.readFileSync(file)) : null;
      return {
        ...descriptor,
        exists,
        expectedHashKnown,
        actualHash,
        verified: exists && expectedHashKnown && actualHash === descriptor.sha256,
      };
    });
  }

  public packageReadiness() {
    const assets = this.inspect();
    const blockers = assets.filter(item => item.required && !item.verified).map(item => {
      if (!item.expectedHashKnown) return `${item.kind}: falta fijar el SHA-256 del binario editable exacto.`;
      if (!item.exists) return `${item.kind}: falta el activo ${item.fileName} en runtime.`;
      return `${item.kind}: el SHA-256 del activo runtime no coincide.`;
    });
    return { ready: blockers.length === 0, blockers, assets };
  }
}
