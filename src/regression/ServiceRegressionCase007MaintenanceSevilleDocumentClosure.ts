import { SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_FINE } from "./ServiceRegressionCase007MaintenanceSevilleFineExtraction";
import { SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_ECONOMICS } from "./ServiceRegressionCase007MaintenanceSevilleEconomics";
import { MAINTENANCE_007_ECONOMICS_REGRESSION_RESULT } from "./ServiceRegressionCase007MaintenanceSevilleEconomicsGuard";

export type Maintenance007ClosureStatus =
  | "CONFIRMED"
  | "CONFIRMED_SOURCE_DECLARATION"
  | "PENDING_SOURCE_EVIDENCE"
  | "BLOCKED_SOURCE_CONFLICT";

const fine = SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_FINE;
const economics = SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_ECONOMICS;

export const MAINTENANCE_007_DOCUMENT_CLOSURE_ITEMS = [
  { id: "MAINT-CLOSE-TYPE", label: "Tipo de contrato", value: fine.confirmed.contractType, status: "CONFIRMED", evidence: "Memoria + PCAP + PPT." },
  { id: "MAINT-CLOSE-PROCEDURE", label: "Procedimiento y SARA", value: `${fine.confirmed.procedure} · SARA`, status: "CONFIRMED", evidence: "Perímetro documental validado en 11.9.1 y protegido en 11.9.2." },
  { id: "MAINT-CLOSE-LOTS", label: "División en lotes", value: `${fine.confirmed.lotCount} lotes`, status: "CONFIRMED", evidence: "Nombres y número de lotes acreditados por la fuente." },
  { id: "MAINT-CLOSE-CPV", label: "CPV", value: fine.confirmed.cpvs.join(", "), status: "CONFIRMED", evidence: "Pluralidad de CPV técnicos acreditada." },
  { id: "MAINT-CLOSE-MEANS", label: "Insuficiencia de medios propios", value: "Sí", status: "CONFIRMED", evidence: "Justificación documental recuperada." },
  { id: "MAINT-CLOSE-GMAO", label: "GMAO como medio técnico", value: "Sí", status: "CONFIRMED", evidence: "Exigencia técnica recuperada." },
  { id: "MAINT-CLOSE-ECONOMICS", label: "PBL / VE / anualidades", value: "Valores declarados por lote y global protegidos", status: "CONFIRMED_SOURCE_DECLARATION", evidence: "Anexo I 2.A/2.B del PCAP; importes declarados preservados sin normalizar redondeos." },
  { id: "MAINT-CLOSE-EXTENSION", label: "Prórroga incorporada al VE", value: `${economics.estimatedValue.extensionMonths} meses`, status: "CONFIRMED_SOURCE_DECLARATION", evidence: "Valor declarado en 11.9.3 y protegido por 11.9.4." },
  { id: "MAINT-CLOSE-MODIFICATION", label: "Modificación prevista", value: `${economics.estimatedValue.modificationArticle204Percent} % · art. 204 LCSP`, status: "CONFIRMED_SOURCE_DECLARATION", evidence: "Porcentaje declarado en fuente económica; no se amplía su causa más allá de lo acreditado." },
  { id: "MAINT-CLOSE-AWARD", label: "Criterios de adjudicación", value: "No congelados", status: "PENDING_SOURCE_EVIDENCE", evidence: "Ponderaciones y fórmulas exactas siguen abiertas." },
  { id: "MAINT-CLOSE-JUDGEMENT", label: "Juicio de valor", value: "No congelado", status: "PENDING_SOURCE_EVIDENCE", evidence: "Existencia y alcance pendientes de evidencia primaria." },
  { id: "MAINT-CLOSE-GUARANTEE", label: "Garantías", value: "No congeladas", status: "PENDING_SOURCE_EVIDENCE", evidence: "Garantía definitiva y eventual complementaria pendientes." },
  { id: "MAINT-CLOSE-SOLVENCY", label: "Solvencia por lote", value: "No congelada", status: "PENDING_SOURCE_EVIDENCE", evidence: "Umbrales económicos y técnicos exactos pendientes." },
  { id: "MAINT-CLOSE-SUBROGATION", label: "Subrogación", value: "No congelada", status: "PENDING_SOURCE_EVIDENCE", evidence: "Existencia y régimen exacto pendientes." },
  { id: "MAINT-CLOSE-EXECUTION", label: "Condiciones especiales de ejecución", value: "No congeladas", status: "PENDING_SOURCE_EVIDENCE", evidence: "Redacción exacta pendiente." },
  { id: "MAINT-CLOSE-PENALTIES", label: "Penalidades", value: "No congeladas", status: "PENDING_SOURCE_EVIDENCE", evidence: "Régimen específico pendiente." },
  { id: "MAINT-CLOSE-LOT-LIMIT", label: "Máximo de lotes ofertables", value: "No resoluble automáticamente", status: "BLOCKED_SOURCE_CONFLICT", evidence: `${fine.blockedBySourceInconsistency.statementA} / ${fine.blockedBySourceInconsistency.statementB}` },
] as const satisfies readonly {
  id: string;
  label: string;
  value: string;
  status: Maintenance007ClosureStatus;
  evidence: string;
}[];

const counts = MAINTENANCE_007_DOCUMENT_CLOSURE_ITEMS.reduce(
  (acc, item) => {
    acc[item.status] += 1;
    return acc;
  },
  {
    CONFIRMED: 0,
    CONFIRMED_SOURCE_DECLARATION: 0,
    PENDING_SOURCE_EVIDENCE: 0,
    BLOCKED_SOURCE_CONFLICT: 0,
  } as Record<Maintenance007ClosureStatus, number>,
);

export const MAINTENANCE_007_DOCUMENT_CLOSURE_11_9_5 = {
  id: fine.id,
  step: "11.9.5",
  expediente: fine.expediente,
  status: "DOCUMENTARY_CLOSURE_WITH_OPEN_ITEMS_AND_SOURCE_CONFLICT",
  counts,
  items: MAINTENANCE_007_DOCUMENT_CLOSURE_ITEMS,
  economicGuardStatus: MAINTENANCE_007_ECONOMICS_REGRESSION_RESULT.status,
  sourceRoundingTreatment: MAINTENANCE_007_ECONOMICS_REGRESSION_RESULT.sourceRoundingGuard.treatment,
  closureRule: "CONFIRMED y CONFIRMED_SOURCE_DECLARATION se cierran solo en su alcance acreditado. PENDING_SOURCE_EVIDENCE permanece abierto. BLOCKED_SOURCE_CONFLICT impide convertir la contradicción de lotes en regla automática.",
  promotionRule: "NO_PROMOTION_WITHOUT_NEW_PRIMARY_EVIDENCE_AND_HUMAN_VALIDATION",
  humanValidationRequired: true,
} as const;

export type Maintenance007DocumentClosure = typeof MAINTENANCE_007_DOCUMENT_CLOSURE_11_9_5;
