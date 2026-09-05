import { describe, expect, it } from "vitest";
import { evaluateUniversalAdministrativePackage } from "../src/engines/UniversalAdministrativePackageGate";
import { createStandardContractDocumentProfiles } from "../src/domain/documentModel/StandardContractDocumentProfiles";
import { EditableTemplateAssetRegistry } from "../src/domain/documentModel/EditableTemplateAssetRegistry";
import { createUniversalExpedienteFromCanonical } from "../src/domain/expediente/UniversalExpedienteV13";
import { EvidenceField } from "../src/domain/expediente/EvidenceField";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";

const confirmed = <T>(key: string, value: T): EvidenceField<T> => ({ key, value, status: "SOURCE_CONFIRMED", sources: [{ kind: "PRIMARY_DOCUMENT", sourceId: "test" }], humanValidationRequired: false, humanValidated: false });

function supplyDraft() {
  return createUniversalExpedienteFromCanonical({
    id: "PKG",
    lifecycleState: EstadoExpediente.BORRADOR,
    fields: {
      contractType: confirmed("contractType", "SUPPLY" as const), object: confirmed("object", "Suministro"), cpvMain: confirmed("cpvMain", "44000000-0"), lots: confirmed("lots", [] as readonly string[]), estimatedValueCents: confirmed("estimatedValueCents", 100000), baseTenderBudgetCents: confirmed("baseTenderBudgetCents", 100000), procedure: confirmed("procedure", "ABIERTO"), durationMonths: confirmed("durationMonths", 12), extensionMonths: confirmed("extensionMonths", 0), modificationPercent: confirmed("modificationPercent", 0), awardCriteria: confirmed("awardCriteria", ["precio"] as readonly string[]), solvency: confirmed("solvency", [] as readonly string[]), publicity: confirmed("publicity", "perfil"),
    }, blockers: [], warnings: [],
  });
}

describe("LB91.21 - gate del paquete administrativo completo", () => {
  it("no considera listo un paquete por existir solo alguno de sus perfiles", () => {
    const result = evaluateUniversalAdministrativePackage(
      supplyDraft(), "SUPPLY", createStandardContractDocumentProfiles(), new EditableTemplateAssetRegistry(), [],
    );
    expect(result.ready).toBe(false);
    expect(result.documentReadiness.MEMORY).toBe(false);
    expect(result.documentReadiness.PCAP).toBe(false);
    expect(result.documentReadiness.PPT).toBe(false);
    expect(result.humanAcceptanceRequired).toBe(true);
  });

  it("bloquea tipo de paquete distinto del tipo canónico", () => {
    const result = evaluateUniversalAdministrativePackage(
      supplyDraft(), "SERVICE", createStandardContractDocumentProfiles(), new EditableTemplateAssetRegistry(), [],
    );
    expect(result.ready).toBe(false);
    expect(result.blockers.some(item => item.includes("expediente declara SUPPLY"))).toBe(true);
  });

  it("exige auditoría cruzada de los tres documentos además de la capacidad de render", () => {
    const result = evaluateUniversalAdministrativePackage(
      supplyDraft(), "SUPPLY", createStandardContractDocumentProfiles(), new EditableTemplateAssetRegistry(), [
        { document: "MEMORY", sourceId: "m", facts: { contractType: "SUPPLY" } },
        { document: "PCAP", sourceId: "p", facts: { contractType: "SUPPLY" } },
      ],
    );
    expect(result.blockers.some(item => item.includes("Falta documento obligatorio") && item.includes("PPT"))).toBe(true);
  });
});
