import { ContractDocumentModelProfileRegistry } from "./ContractDocumentModelProfile";
import { DocumentType } from "./DocumentType";
import { TipoProcedimiento } from "../procedimiento/TipoProcedimiento";
import { ServicePcapDefinition } from "./definitions/ServicePcapDefinition";
import { ServicePptDefinition } from "./definitions/ServicePptDefinition";
import { SupplyPcapAnnexDefinition } from "./definitions/SupplyPcapAnnexDefinition";
import { SupplyPptDefinition } from "./definitions/SupplyPptDefinition";

export function createStandardContractDocumentProfiles(): ContractDocumentModelProfileRegistry {
  const registry = new ContractDocumentModelProfileRegistry();

  registry.register({
    id: "SERVICE-PCAP-OPEN-ELECTRONIC-2025-12",
    contractType: "SERVICE",
    documentType: DocumentType.PCAP,
    coverage: "FULL_MODEL",
    applicableProcedures: [TipoProcedimiento.ABIERTO],
    sourceIds: ["PCAP_SERVICES_OPEN_2025_12", "REG-SERVICE-007_MAINTENANCE_SEVILLE"],
    definition: ServicePcapDefinition,
    generationAllowed: true,
    notes: [
      "Modelo completo contrastado con PCAP de servicios recomendado por la Comisión Consultiva de Contratación Pública.",
      "Su aplicación automática queda limitada al procedimiento abierto acreditado por la fuente del modelo.",
      "Los campos del Anexo I deben proceder del expediente canónico y conservar sus validaciones y conflictos.",
    ],
  });

  registry.register({
    id: "SERVICE-PPT-STRUCTURAL-CLEANING",
    contractType: "SERVICE",
    documentType: DocumentType.PPT,
    coverage: "STRUCTURAL_MODEL",
    sourceIds: ["PPT_SERVICE_CLEANING_CARL_2024", "PPT_SERVICE_CLEANING_SAE_HUELVA_2025"],
    definition: ServicePptDefinition,
    generationAllowed: false,
    notes: [
      "Estructura contrastada con varios PPT reales de limpieza.",
      "No se promueve como plantilla universal de servicios: el contenido técnico depende del objeto concreto.",
    ],
  });

  registry.register({
    id: "SUPPLY-PCAP-ANNEX-I-JDA-2025-12",
    contractType: "SUPPLY",
    documentType: DocumentType.PCAP,
    coverage: "ANNEX_I_ONLY",
    sourceIds: ["JDA-PCAP-SUPPLY-OSA-SELF-2025-12", "CONTR-2026-240267_ANEXO_I"],
    definition: SupplyPcapAnnexDefinition,
    generationAllowed: false,
    notes: [
      "La fuente disponible acredita el Anexo I parametrizable, no el clausulado general completo.",
      "No debe generarse un PCAP completo de suministros hasta registrar el modelo general oficial correspondiente.",
    ],
  });

  registry.register({
    id: "SUPPLY-PPT-STRUCTURAL-NEEDS-HARDWARE-2026",
    contractType: "SUPPLY",
    documentType: DocumentType.PPT,
    coverage: "STRUCTURAL_MODEL",
    sourceIds: ["PPT_FERRETERIA_SSCC_SAE_V6", "CONTR-2026-240267"],
    definition: SupplyPptDefinition,
    generationAllowed: false,
    notes: [
      "PPT completo para el caso de suministro sucesivo de ferretería, utilizado como patrón estructural de suministros por necesidades.",
      "No se considera plantilla universal para cualquier clase de suministro sin validar la adecuación técnica al objeto concreto.",
    ],
  });

  return registry;
}
