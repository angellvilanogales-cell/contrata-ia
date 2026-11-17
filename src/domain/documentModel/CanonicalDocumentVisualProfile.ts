export const CANONICAL_DOCUMENT_VISUAL_PROFILE_VERSION = "LB105-VISUAL-PROFILE-V1" as const;

export interface CanonicalTextStyle {
  styleName: string;
  fontFamily: string;
  fontSizePt: number;
  fontWeight: "normal" | "bold";
  color: `#${string}`;
  alignment: "left" | "center" | "justify";
}

/**
 * Perfil propio y derivado de Contrata-IA para Memoria y PPT. No se aplica al
 * PCAP oficial ni pretende ser un manual corporativo oficial de la Junta.
 */
export const CANONICAL_MEMORY_PPT_VISUAL_PROFILE = {
  version: CANONICAL_DOCUMENT_VISUAL_PROFILE_VERSION,
  documents: ["MEMORY", "PPT"] as const,
  page: {
    format: "A4" as const,
    widthCm: 21,
    heightCm: 29.7,
    marginTopCm: 1.8,
    marginRightCm: 2,
    marginBottomCm: 1.8,
    marginLeftCm: 2,
  },
  palette: {
    body: "#000000",
    institutionalGreen: "#168253",
    secondary: "#4D4D4D",
    tableBorder: "#808080",
    tableHeaderBackground: "#E8F3EE",
  } as const,
  styles: {
    title: {styleName:"CI_LB105_Title",fontFamily:"Source Sans Pro",fontSizePt:14,fontWeight:"bold",color:"#168253",alignment:"center"},
    heading1: {styleName:"CI_LB105_Heading1",fontFamily:"Source Sans Pro",fontSizePt:12,fontWeight:"bold",color:"#168253",alignment:"left"},
    heading2: {styleName:"CI_LB105_Heading2",fontFamily:"Source Sans Pro",fontSizePt:11,fontWeight:"bold",color:"#000000",alignment:"left"},
    body: {styleName:"CI_LB105_Body",fontFamily:"Source Sans Pro",fontSizePt:10,fontWeight:"normal",color:"#000000",alignment:"justify"},
    table: {styleName:"CI_LB105_Table",fontFamily:"Source Sans Pro",fontSizePt:9,fontWeight:"normal",color:"#000000",alignment:"left"},
    footer: {styleName:"CI_LB105_Footer",fontFamily:"Source Sans Pro",fontSizePt:8,fontWeight:"normal",color:"#4D4D4D",alignment:"center"},
  } satisfies Readonly<Record<string, CanonicalTextStyle>>,
  paragraph: {lineHeightPercent:115,spaceAfterCm:0.18,headingKeepWithNext:true,widows:2,orphans:2},
  tables: {headerBold:true,repeatHeaderRows:true,avoidRowSplit:true},
  logoPolicy: {
    required: true,
    location: "HEADER_LEFT" as const,
    source: "VALIDATED_BRAND_ASSET_OR_OFFICIAL_TEMPLATE" as const,
    neverInferFromCaseExample: true,
    preserveAspectRatio: true,
    additionalFundingLogosOnlyWhenValidated: true,
  },
  footerPolicy: {pageNumberRequired:true,caseIdRequired:true,validationNoticeRequired:true},
  sourceBasis: [
    "VEIASA-WINDOWS-SERVER", "CADIZ-MOBILIARIO", "PANDA-ANTIVIRUS-AVRA",
    "AULAS-DIGITALES", "TABLETS-PLATAFORMA",
  ] as const,
} as const;

export const OFFICIAL_PCAP_VISUAL_POLICY = {
  mode: "PRESERVE_OFFICIAL_TEMPLATE" as const,
  mayReplaceGeneralStyles: false,
  mayReorderGeneralClauses: false,
  mayReplaceOfficialLogos: false,
  editableScope: "VERIFIED_VARIABLE_DESTINATIONS_ONLY" as const,
};
