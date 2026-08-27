export interface WorksOfficialModelCandidate {
  id: string;
  procedure: "ABIERTO" | "ABIERTO_SIMPLIFICADO_ORDINARIO";
  financing: "AUTOFINANCED";
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

/**
 * Apertura LB97. El portal oficial de la Junta mantiene modelos recomendados
 * de PCAP de Obras en ODT para procedimiento abierto y abierto simplificado,
 * separados por financiación. Esta baseline registra solo los dos candidatos
 * autofinanciados inicialmente priorizados; registrar la URL no equivale a
 * acreditar el binario físico.
 *
 * La LCSP exige, como regla de preparación del contrato de obras, proyecto,
 * supervisión cuando proceda, aprobación y replanteo (arts. 231-236), y la
 * ejecución comienza con la comprobación del replanteo (art. 237). LB97 no
 * puede degradar estas actuaciones a simples campos opcionales de interfaz.
 */
export const LB97_WORKS_OFFICIAL_MODEL_CANDIDATES: readonly WorksOfficialModelCandidate[] = [
  {
    id: "JDA-PCAP-WORKS-OPEN-AUTOFINANCED-2025-12-17",
    procedure: "ABIERTO",
    financing: "AUTOFINANCED",
    presentation: "ELECTRONIC",
    sourceAuthority: "JUNTA_ANDALUCIA_COMISION_CONSULTIVA_RECOMMENDED_MODEL",
    officialPortalUrl: "https://www.juntadeandalucia.es/temas/contratacion-publica/gestion/comision-consultiva/paginas/pliegos.html",
    officialOdtUrl: "https://www.juntadeandalucia.es/sites/default/files/inline-files/2026/02/2025_12_17_pcap_obras_abierto_autofinanciada.odt",
    updateReference: "DECEMBER_2025",
    editableBinaryVerified: false,
    physicalPromotionReady: false,
  },
  {
    id: "JDA-PCAP-WORKS-ASO-AUTOFINANCED-2025-12-17",
    procedure: "ABIERTO_SIMPLIFICADO_ORDINARIO",
    financing: "AUTOFINANCED",
    presentation: "ELECTRONIC",
    sourceAuthority: "JUNTA_ANDALUCIA_COMISION_CONSULTIVA_RECOMMENDED_MODEL",
    officialPortalUrl: "https://www.juntadeandalucia.es/temas/contratacion-publica/gestion/comision-consultiva/paginas/pliegos.html",
    officialOdtUrl: "https://www.juntadeandalucia.es/sites/default/files/inline-files/2026/02/2025_12_17_pcap_obras_abierto_simplificado_ordinario%20_autofinanciada.odt",
    updateReference: "DECEMBER_2025",
    editableBinaryVerified: false,
    physicalPromotionReady: false,
  },
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
      "Falta recuperar y verificar físicamente al menos un ODT oficial Works antes de promoverlo al renderer.",
      "Falta integrar el paquete Works con proyecto, supervisión cuando proceda, aprobación y replanteo según el expediente.",
      "Falta probar generación y auditoría cruzada Works sobre un expediente de regresión acreditado.",
    ],
  };
}
