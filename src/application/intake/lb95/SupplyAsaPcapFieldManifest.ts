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
] as const;
