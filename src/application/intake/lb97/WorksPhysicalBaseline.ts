export type WorksProcedure =
  | "ABIERTO"
  | "ABIERTO_SIMPLIFICADO_ORDINARIO"
  | "ABIERTO_SIMPLIFICADO_ABREVIADO"
  | "PROYECTO_Y_OBRA_ABIERTO"
  | "NEGOCIADO";
export type WorksFinancing = "AUTOFINANCED" | "EUROPEAN_FUNDS";

export interface WorksOfficialModelCandidate {
  id: string;
  procedure: WorksProcedure;
  financing: WorksFinancing;
  presentation: "ELECTRONIC";
  sourceAuthority: "JUNTA_ANDALUCIA_COMISION_CONSULTIVA_RECOMMENDED_MODEL";
  officialPortalUrl: string;
  officialOdtUrl: string;
  updateReference: "DECEMBER_2025";
  editableBinaryVerified: false;
  physicalPromotionReady: false;
}

export interface WorksPhysicalBaselineStatus {
  block: "LB97";
  objective: "VERTICAL_WORKS_PHYSICAL_OPERATIONAL";
  legalPreparationCoverage: true;
  officialModelCatalogueVerified: true;
  officialEditableBinaryRecovered: false;
  projectPreparationGateRequired: true;
  supervisionGateRequiredWhenApplicable: true;
  replanteoGateRequired: true;
  physicalPackageOperational: false;
  engineeringClosed: false;
  productionReady: false;
  humanValidationRequired: true;
  candidateModels: readonly WorksOfficialModelCandidate[];
  blockers: readonly string[];
}

const PORTAL = "https://www.juntadeandalucia.es/temas/contratacion-publica/gestion/comision-consultiva/paginas/pliegos.html";
const BASE = "https://www.juntadeandalucia.es/sites/default/files/inline-files/2026/02/";

function candidate(id: string, procedure: WorksProcedure, financing: WorksFinancing, fileName: string): WorksOfficialModelCandidate {
  return {
    id, procedure, financing, presentation: "ELECTRONIC",
    sourceAuthority: "JUNTA_ANDALUCIA_COMISION_CONSULTIVA_RECOMMENDED_MODEL",
    officialPortalUrl: PORTAL,
    officialOdtUrl: `${BASE}${fileName}`,
    updateReference: "DECEMBER_2025",
    editableBinaryVerified: false,
    physicalPromotionReady: false,
  };
}

/** Catálogo oficial Works visible actualmente en el portal de modelos recomendados de la Junta. */
export const LB97_WORKS_OFFICIAL_MODEL_CANDIDATES: readonly WorksOfficialModelCandidate[] = [
  candidate("JDA-PCAP-WORKS-OPEN-AUTOFINANCED-2025-12-17", "ABIERTO", "AUTOFINANCED", "2025_12_17_pcap_obras_abierto_autofinanciada.odt"),
  candidate("JDA-PCAP-WORKS-ASO-AUTOFINANCED-2025-12-17", "ABIERTO_SIMPLIFICADO_ORDINARIO", "AUTOFINANCED", "2025_12_17_pcap_obras_abierto_simplificado_ordinario%20_autofinanciada.odt"),
  candidate("JDA-PCAP-WORKS-ASA-AUTOFINANCED-2025-12-17", "ABIERTO_SIMPLIFICADO_ABREVIADO", "AUTOFINANCED", "2025_12_17_pcap_obras_abierto_simplificado_abreviado_autofinanciada.odt"),
  candidate("JDA-PCAP-WORKS-PROJECT-AND-WORKS-OPEN-AUTOFINANCED-2025-12-17", "PROYECTO_Y_OBRA_ABIERTO", "AUTOFINANCED", "2025_12_17_pcap_proyecto_obra_abierto_autofinanciada.odt"),
  candidate("JDA-PCAP-WORKS-NEGOTIATED-AUTOFINANCED-2025-12-17", "NEGOCIADO", "AUTOFINANCED", "2025_12_17_pcap_obras_negociado_autofinanciada.odt"),
  candidate("JDA-PCAP-WORKS-OPEN-EU-2025-12-17", "ABIERTO", "EUROPEAN_FUNDS", "2025_12_17_pcap_obras_abierto_ffee.odt"),
  candidate("JDA-PCAP-WORKS-ASO-EU-2025-12-17", "ABIERTO_SIMPLIFICADO_ORDINARIO", "EUROPEAN_FUNDS", "2025_12_17_pcap_obras_abierto_simplificado_ordinario_ffee.odt"),
  candidate("JDA-PCAP-WORKS-ASA-EU-2025-12-17", "ABIERTO_SIMPLIFICADO_ABREVIADO", "EUROPEAN_FUNDS", "2025_12_17_pcap_obras_abierto_simplificado_abreviado_ffee.odt"),
  candidate("JDA-PCAP-WORKS-PROJECT-AND-WORKS-OPEN-EU-2025-12-17", "PROYECTO_Y_OBRA_ABIERTO", "EUROPEAN_FUNDS", "2025_12_17_pcap_proyecto_obra_abierto_ffee.odt"),
  candidate("JDA-PCAP-WORKS-NEGOTIATED-EU-2025-12-17", "NEGOCIADO", "EUROPEAN_FUNDS", "2025_12_17_pcap_obras_negociado_ffee.odt"),
] as const;

export function evaluateWorksPhysicalBaseline(): WorksPhysicalBaselineStatus {
  return {
    block: "LB97",
    objective: "VERTICAL_WORKS_PHYSICAL_OPERATIONAL",
    legalPreparationCoverage: true,
    officialModelCatalogueVerified: true,
    officialEditableBinaryRecovered: false,
    projectPreparationGateRequired: true,
    supervisionGateRequiredWhenApplicable: true,
    replanteoGateRequired: true,
    physicalPackageOperational: false,
    engineeringClosed: false,
    productionReady: false,
    humanValidationRequired: true,
    candidateModels: LB97_WORKS_OFFICIAL_MODEL_CANDIDATES,
    blockers: [
      "Los modelos oficiales Works están catalogados por procedimiento y financiación, pero sus bytes aún no se han promovido.",
      "El paquete derivado Works no sustituye la autoridad del modelo oficial recomendado ni elimina la validación humana.",
      "Falta ejecutar un expediente Works completo con proyecto, supervisión cuando proceda, replanteo y auditoría cruzada.",
    ],
  };
}
