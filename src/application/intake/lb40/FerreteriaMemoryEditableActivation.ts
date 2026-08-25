export const FERRETERIA_MEMORY_V12_EDITABLE_SOURCE = {
  caseId: "CONTR/2026/240267",
  documentKind: "MEMORY",
  format: "ODT",
  sourceFileName: "04_Memoría Ferretería SSCC SAE V12_letrado.odt",
  contentHash: "sha256:36ed482048e19bc8b1f9c4fe1b8f1bd47eb81ac9e256dd4f0488e7bc97b8e4dc",
  styleFingerprint: "sha256:60bdf03935c18ee8c925e3184fc7bc864db873ffc7d32154098885b47e78448d",
  exactEditableSourceVerified: true,
} as const;

export const FERRETERIA_MEMORY_REQUIRED_CORRECTIONS = [
  {
    id: "estimated-value-da33",
    sourceIssue: "La V12 calcula 25.325,86 € sumando la prórroga y un 20 % sobre el PBL.",
    requiredDecision: "El VE validado es 21.793,15 €: presupuesto máximo DA 33.ª para toda la vigencia 18.160,96 € + modificación prevista al alza del 20 % (3.632,19 €). Las prórrogas no incrementan automáticamente dicho presupuesto máximo.",
  },
  {
    id: "no-new-articles",
    sourceIssue: "La V12 incluye como causa prevista la incorporación de artículos no contemplados.",
    requiredDecision: "La modificación DA 33.ª solo puede aumentar unidades de referencias ya incluidas, sin artículos nuevos ni precios unitarios nuevos.",
  },
  {
    id: "rolece-registration",
    sourceIssue: "La V12 afirma que el artículo 159.6 exime de inscripción registral.",
    requiredDecision: "El artículo 159.6 no contiene esa exención; en lo no previsto remite a la regulación general del abierto simplificado y resulta aplicable la regla del artículo 159.4.a), incluida la admisión de solicitud previa en los términos legales.",
  },
  {
    id: "specific-business-qualification",
    sourceIssue: "La V12 afirma que basta una declaración de habilitación empresarial correspondiente.",
    requiredDecision: "En este expediente no se exige habilitación empresarial o profesional específica, sin perjuicio de las autorizaciones generales legalmente necesarias.",
  },
] as const;

export const FERRETERIA_MEMORY_V13_CORRECTED_CANDIDATE = {
  caseId: "CONTR/2026/240267",
  sourceHash: FERRETERIA_MEMORY_V12_EDITABLE_SOURCE.contentHash,
  sourceStyleFingerprint: FERRETERIA_MEMORY_V12_EDITABLE_SOURCE.styleFingerprint,
  generatedCandidateHash: "sha256:36da0d5156e106a8e67a76cf14954b8981e98141308850ca88ea5cd5b3923486",
  correctionsApplied: FERRETERIA_MEMORY_REQUIRED_CORRECTIONS.map(item => item.id),
  humanAcceptanceRequired: true,
  productionReady: false,
} as const;
