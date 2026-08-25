import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

export interface VerifiedEditableAssetDescriptor {
  assetId: string;
  fileName: string;
  expectedSha256: string | null;
  mediaType: string;
  role: "OFFICIAL_MODEL" | "REAL_CASE_EDITABLE" | "DERIVED_ACCEPTED_CANDIDATE";
}

export interface VerifiedEditableAsset {
  descriptor: VerifiedEditableAssetDescriptor;
  bytes: Uint8Array;
  actualSha256: string;
}

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

/**
 * LB52 — almacén de activos editables verificados por identidad binaria.
 *
 * El renderer de producción no debe aceptar un fichero solo porque tenga el mismo nombre.
 * Cada descriptor productivo debe declarar SHA-256 y el store rechaza cualquier discrepancia.
 */
export class VerifiedEditableAssetStore {
  constructor(private readonly rootDir: string) {}

  readiness(descriptor: VerifiedEditableAssetDescriptor) {
    if (!descriptor.expectedSha256) {
      return {
        ready: false,
        blocker: `El activo ${descriptor.assetId} no tiene SHA-256 fuente validado.`,
      } as const;
    }
    return { ready: true, blocker: null } as const;
  }

  load(descriptor: VerifiedEditableAssetDescriptor): VerifiedEditableAsset {
    const readiness = this.readiness(descriptor);
    if (!readiness.ready) throw new Error(readiness.blocker ?? "Activo editable no verificable.");
    const absolutePath = path.resolve(this.rootDir, descriptor.fileName);
    const bytes = readFileSync(absolutePath);
    const actualSha256 = sha256(bytes);
    if (actualSha256 !== descriptor.expectedSha256) {
      throw new Error(`Hash SHA-256 inválido para ${descriptor.assetId}: esperado ${descriptor.expectedSha256}, obtenido ${actualSha256}.`);
    }
    return { descriptor, bytes, actualSha256 };
  }
}

export const FERRETERIA_V1_EDITABLE_ASSET_MANIFEST: readonly VerifiedEditableAssetDescriptor[] = [
  {
    assetId: "jda:cccp:pcap:supply:asa:autofinanced:2025-12-17:odt",
    fileName: "2025_12_17_pcap_suministro_abierto_simplificado_abreviado_autofinanciada.odt",
    expectedSha256: "45e1e6b16ec41d77206d3ef385c70f87c9120bb0ccce4e43d9a24d245812cadc",
    mediaType: "application/vnd.oasis.opendocument.text",
    role: "OFFICIAL_MODEL",
  },
  {
    assetId: "ferreteria:memory:v12:letrado:odt",
    fileName: "04_Memoría Ferretería SSCC SAE V12_letrado.odt",
    expectedSha256: "36ed482048e19bc8b1f9c4fe1b8f1bd47eb81ac9e256dd4f0488e7bc97b8e4dc",
    mediaType: "application/vnd.oasis.opendocument.text",
    role: "REAL_CASE_EDITABLE",
  },
  {
    assetId: "ferreteria:ppt:v6:odt",
    fileName: "PPT Feretería SSCC SAE V6.odt",
    expectedSha256: "c3f4199e3929718f278cc7d77c04d7e6082b79858e52ff193f1a79b17edd3f09",
    mediaType: "application/vnd.oasis.opendocument.text",
    role: "REAL_CASE_EDITABLE",
  },
] as const;

export function evaluateFerreteriaV1RuntimeAssetReadiness() {
  const pending = FERRETERIA_V1_EDITABLE_ASSET_MANIFEST.filter(asset => !asset.expectedSha256);
  return {
    assetCount: FERRETERIA_V1_EDITABLE_ASSET_MANIFEST.length,
    identityVerifiedDescriptors: FERRETERIA_V1_EDITABLE_ASSET_MANIFEST.filter(asset => Boolean(asset.expectedSha256)).map(asset => asset.assetId),
    pendingIdentityDescriptors: pending.map(asset => asset.assetId),
    readyForProductionRuntime: pending.length === 0,
    blockers: pending.map(asset => `Falta validar el SHA-256 fuente de ${asset.assetId} antes de permitir render productivo en runtime.`),
  } as const;
}
