import { ContractDocumentModelProfileRegistry } from "./ContractDocumentModelProfile";
import { DocumentType } from "./DocumentType";
import { TipoProcedimiento } from "../procedimiento/TipoProcedimiento";
import { ServicePcapDefinition } from "./definitions/ServicePcapDefinition";
import { ServicePptDefinition } from "./definitions/ServicePptDefinition";
import { SupplyPcapAnnexDefinition } from "./definitions/SupplyPcapAnnexDefinition";
import { SupplyPcapFullModelDefinition } from "./definitions/SupplyPcapFullModelDefinition";
import { SupplyPptDefinition } from "./definitions/SupplyPptDefinition";
import { WorksPcapDefinition } from "./definitions/WorksPcapDefinition";

export function createStandardContractDocumentProfiles(): ContractDocumentModelProfileRegistry {
  const registry = new ContractDocumentModelProfileRegistry();

  registry.register({
    id: "SERVICE-PCAP-OPEN-ELECTRONIC-2025-12",
    contractType: "SERVICE",
    documentType: DocumentType.PCAP,
    coverage: "FULL_MODEL",
    applicableProcedures: [TipoProcedimiento.ABIERTO],
    sourceIds: ["PCAP_SERVICES_OPEN_REAL_JDA_SOURCE", "REG-SERVICE-007_MAINTENANCE_SEVILLE"],
    definition: ServicePcapDefinition,
    generationAllowed: true,
    notes: [
      "Modelo lógico completo contrastado con PCAP real de servicios abierto basado en el modelo recomendado de la Comisión Consultiva.",
      "generationAllowed expresa aptitud lógica del perfil; la generación física permanece bloqueada mientras no exista ODT/DOCX general verificado en EditableTemplateAssetRegistry.",
      "Los campos del Anexo I deben proceder del expediente canónico y conservar validaciones y conflictos.",
    ],
  });

  registry.register({
    id: "SERVICE-PCAP-SIMPLIFIED-ORDINARY-CARL-2024",
    contractType: "SERVICE",
    documentType: DocumentType.PCAP,
    coverage: "FULL_MODEL",
    applicableProcedures: [TipoProcedimiento.ABIERTO_SIMPLIFICADO],
    sourceIds: ["CARL-2024-PCAP-SERVICE-SIMPLIFIED-ORDINARY", "REG-SERVICE-005_CARL"],
    definition: ServicePcapDefinition,
    generationAllowed: true,
    notes: [
      "Perfil lógico completo contrastado con el PCAP real ADM-2024-0004 de limpieza del CARL, tramitado por abierto simplificado ordinario.",
      "No constituye por sí solo plantilla física general: la fuente recuperada es PDF y el expediente contiene decisiones particulares que no deben heredarse.",
      "La selección automática solo puede usar este perfil cuando el procedimiento canónico sea ABIERTO_SIMPLIFICADO.",
    ],
  });

  registry.register({
    id: "SERVICE-PPT-STRUCTURAL-CLEANING",
    contractType: "SERVICE",
    documentType: DocumentType.PPT,
    coverage: "STRUCTURAL_MODEL",
    sourceIds: ["CARL-2024-PPT-SERVICE-CLEANING", "SAE-HUELVA-PPT-SERVICE-CLEANING", "FPE-5G-2024-PPT-SERVICE-TRAINING"],
    definition: ServicePptDefinition,
    generationAllowed: false,
    notes: [
      "Estructura contrastada con varios PPT reales y con subfamilias de servicio distintas: limpieza y formación profesional.",
      "La pluralidad de fuentes confirma bloques transversales, pero también impide promover un único PPT universal rígido: el contenido técnico depende del objeto concreto.",
    ],
  });

  // Perfil parcial histórico: se conserva primero para compatibilidad de consultas
  // genéricas mediante registry.find(). La selección canónica usa findAll() y filtra
  // por procedimiento/cobertura, por lo que el FULL_MODEL oficial ASA puede elegirse
  // sin convertir este Anexo I en modelo general de producción.
  registry.register({
    id: "SUPPLY-PCAP-ANNEX-I-JDA-2025-12",
    contractType: "SUPPLY",
    documentType: DocumentType.PCAP,
    coverage: "ANNEX_I_ONLY",
    sourceIds: ["jda:cccp:pcap:supply:asa:autofinanced:2025-12-17:odt", "CONTR-2026-240267_ANEXO_I"],
    definition: SupplyPcapAnnexDefinition,
    generationAllowed: false,
    notes: ["Perfil parcial conservado para flujos que trabajan exclusivamente sobre el Anexo I; no sustituye al perfil completo oficial."],
  });

  registry.register({
    id: "SUPPLY-PCAP-ASA-AUTOFINANCED-JDA-2025-12",
    contractType: "SUPPLY",
    documentType: DocumentType.PCAP,
    coverage: "FULL_MODEL",
    applicableProcedures: [TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO],
    sourceIds: ["jda:cccp:pcap:supply:asa:autofinanced:2025-12-17:odt"],
    definition: SupplyPcapFullModelDefinition,
    generationAllowed: true,
    notes: [
      "Modelo oficial general ODT acreditado para suministro mediante abierto simplificado abreviado, presentación electrónica y autofinanciación.",
      "La habilitación no se extiende a otras financiaciones ni procedimientos y no convierte Memoria/PPT de ferretería en modelos universales.",
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

  registry.register({
    id: "WORKS-PCAP-OPEN-STRUCTURAL-REAL-SOURCE",
    contractType: "WORKS",
    documentType: DocumentType.PCAP,
    coverage: "STRUCTURAL_MODEL",
    applicableProcedures: [TipoProcedimiento.ABIERTO],
    sourceIds: ["PCAP_WORKS_OPEN_REAL_USER_SOURCE", "LCSP_WORKS_231_246"],
    definition: WorksPcapDefinition,
    generationAllowed: false,
    notes: [
      "Existe fuente real de PCAP de obras que permite acreditar la familia y su estructura administrativa básica.",
      "No se habilita generación física hasta verificar y registrar el activo editable concreto, su huella de estilo y las secciones/anexos del modelo aplicable.",
      "El PPT de obras no se sustituye por esta estructura: debe provenir del proyecto y de las prescripciones técnicas específicas de la actuación.",
    ],
  });

  return registry;
}
