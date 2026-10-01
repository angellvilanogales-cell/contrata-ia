import { SUPPLY_ASA_ANNEX_I_RESIDUAL_DECISIONS } from "./SupplyAsaAnnexIResidualCompletion";

export const SUPPLY_ASA_PCAP_FIELD_MANIFEST = [
  {
    fieldPath: "processing.processingType",
    label: "Tramitación del expediente",
    control: "SELECT" as const,
    section: "PROCEDURE" as const,
    requiredForWorkflowReview: true,
    humanValidationRequired: true as const,
    options: ["ORDINARIA", "URGENTE"] as const,
    help: "El modelo oficial ASA materializa expresamente la tramitación ordinaria o urgente; debe declararse y validarse.",
  },
  {
    fieldPath: "administrative.pcapAnnexIResidualDecisions",
    label: "Decisiones restantes del Anexo I del PCAP",
    control: "TABLE" as const,
    section: "PROCEDURE" as const,
    requiredForWorkflowReview: false,
    humanValidationRequired: true as const,
    rows: SUPPLY_ASA_ANNEX_I_RESIDUAL_DECISIONS.map(({id,label,control})=>({id,label,control})),
    help: "Cumplimente cada decisión del órgano de contratación. Los condicionales no aplicables deben indicarse expresamente como «No procede».",
  },
] as const;
