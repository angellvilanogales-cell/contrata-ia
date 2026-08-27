import { gateServiceGeneralTemplate } from "./ServiceGeneralTemplatePhysicalGate";
import { getServiceGeneralTemplate, type ServiceGeneralTemplateKind } from "./ServiceGeneralTemplateManifest";

export interface ServiceTemplateProvisioningInput {
  kind: ServiceGeneralTemplateKind;
  contentBase64: string;
}

export interface ServiceTemplateProvisioningResult {
  templateId: string;
  kind: "MEMORIA" | "PPT";
  sha256: string;
  byteLength: number;
  persisted: true;
}

function endpoint(value: string): string {
  const normalized = value.trim().replace(/\/+$/, "");
  if (!normalized.startsWith("https://")) throw new Error("El provisionado LB96 exige endpoint HTTPS.");
  return normalized;
}

function decode(value: string): Uint8Array {
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(value) || value.length % 4 !== 0) throw new Error("El archivo Service recibido no contiene base64 válido.");
  return Buffer.from(value, "base64");
}

/**
 * Único camino de alta de Memoria/PPT generales Service. Antes de enviar nada
 * al almacén durable ejecuta el gate físico completo: ODT, SHA, estilo, slots y
 * procedencia. Un binario distinto del acreditado queda bloqueado localmente.
 */
export async function provisionServiceTemplateAsset(
  input: ServiceTemplateProvisioningInput,
  environment: NodeJS.ProcessEnv = process.env,
): Promise<ServiceTemplateProvisioningResult> {
  const manifest = getServiceGeneralTemplate(input.kind);
  const persistenceUrl = environment.CONTRATA_IA_PERSISTENCE_URL?.trim();
  const token = environment.CONTRATA_IA_PERSISTENCE_TOKEN?.trim();
  if (!persistenceUrl || !token) throw new Error("Falta configuración de persistencia para provisionar activos LB96.");

  const bytes = decode(input.contentBase64);
  const gate = gateServiceGeneralTemplate(input.kind, bytes);
  if (!gate.ready) throw new Error(`Gate físico LB96 rechazado para ${input.kind}: ${gate.blockers.join(" | ")}`);

  const kind = input.kind === "MEMORY" ? "MEMORIA" : "PPT";
  const response = await fetch(`${endpoint(persistenceUrl)}/templates/${encodeURIComponent(manifest.templateId)}`, {
    method: "PUT",
    headers: {
      "content-type": "application/json; charset=utf-8",
      "x-contrata-ia-persistence-token": token,
      accept: "application/json",
    },
    body: JSON.stringify({
      kind,
      mediaType: manifest.mediaType,
      sha256: manifest.expectedSha256,
      styleFingerprint: manifest.expectedStyleFingerprint,
      provenance: {
        role: manifest.provenance,
        sourceAuthority: manifest.sourceAuthority,
        derivationVersion: "LB96-SERVICE-GENERAL-ODT-V1",
        officialModelClaimed: false,
        exactBinaryIdentityVerified: true,
        humanValidationRequired: true,
      },
      contentBase64: input.contentBase64,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Persistencia LB96 rechazó ${kind}: HTTP ${response.status}${body ? ` · ${body.slice(0, 300)}` : ""}`);
  }

  return {
    templateId: manifest.templateId,
    kind,
    sha256: manifest.expectedSha256,
    byteLength: bytes.byteLength,
    persisted: true,
  };
}
