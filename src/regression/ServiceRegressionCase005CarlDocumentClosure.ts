import { SERVICE_REGRESSION_CASE_005_CARL_FINE } from "./ServiceRegressionCase005CarlFineExtraction";
import { SERVICE_REGRESSION_CASE_005_CARL_ANNEX_I_CLOSURE } from "./ServiceRegressionCase005CarlAnnexIClosure";

export type CarlClosureStatus = "CONFIRMED" | "CONFIRMED_PARTIAL" | "PENDING_SOURCE_EVIDENCE" | "NOT_APPLICABLE";

export type CarlClosureItem = {
  id: string;
  label: string;
  status: CarlClosureStatus;
  value: string;
  evidence: string;
};

const f = SERVICE_REGRESSION_CASE_005_CARL_FINE.facts;
const a = SERVICE_REGRESSION_CASE_005_CARL_ANNEX_I_CLOSURE.confirmedFromSources;

export const CARL_DOCUMENT_CLOSURE_ITEMS: readonly CarlClosureItem[] = [
  { id: "CARL-CLOSE-CHARACTER", label: "Calificación contractual", status: "CONFIRMED", value: "Contrato mixto: 90 % servicios / 10 % suministros; prestación principal de servicios", evidence: "Memoria + extracción fina 11.8.2" },
  { id: "CARL-CLOSE-OBJECT", label: "Objeto principal", status: "CONFIRMED", value: "Limpieza de la sede del CARL", evidence: "Memoria + PPT" },
  { id: "CARL-CLOSE-PROCEDURE", label: "Procedimiento", status: "CONFIRMED", value: "Abierto simplificado ordinario", evidence: "Memoria + PCAP" },
  { id: "CARL-CLOSE-CPV", label: "CPV", status: "CONFIRMED", value: "90919200-4 principal; 39830000-9 y 42995000-7 accesorios", evidence: "PCAP" },
  { id: "CARL-CLOSE-LOTS", label: "División en lotes", status: "CONFIRMED", value: "No; único edificio y prestaciones interrelacionadas", evidence: "Memoria" },
  { id: "CARL-CLOSE-SARA", label: "Regulación armonizada", status: "CONFIRMED", value: "No", evidence: "Memoria / VE declarado" },
  { id: "CARL-CLOSE-DURATION", label: "Duración y prórroga", status: "CONFIRMED", value: `${f.initialDurationMonths} meses + prórroga máxima ${f.extensionMonths} meses`, evidence: "Memoria" },
  { id: "CARL-CLOSE-PBL", label: "PBL e IVA", status: "CONFIRMED", value: "44.170,33 € sin IVA; 9.275,77 € IVA; 53.446,10 € total", evidence: "Memoria" },
  { id: "CARL-CLOSE-VE", label: "Valor estimado", status: "CONFIRMED", value: "106.008,80 € sin IVA, como valor declarado por la fuente", evidence: "Memoria; no se generaliza su fórmula" },
  { id: "CARL-CLOSE-COSTS", label: "Estructura de costes", status: "CONFIRMED", value: "36.161,30 € directos; 8.009,03 € indirectos; coste laboral ref. 24.697,91 €", evidence: "Memoria" },
  { id: "CARL-CLOSE-PAYMENT", label: "Pago", status: "CONFIRMED", value: "Mensualidades naturales vencidas", evidence: "Memoria" },
  { id: "CARL-CLOSE-SUBROGATION", label: "Subrogación de personal", status: "CONFIRMED", value: "Sí", evidence: "PPT + Memoria" },
  { id: "CARL-CLOSE-CRITERIA", label: "Criterios de adjudicación", status: "CONFIRMED_PARTIAL", value: "100 puntos mediante fórmulas; oferta económica hasta 80 puntos", evidence: "Memoria; detalle de 20 puntos y fórmulas exactas pendiente" },
  { id: "CARL-CLOSE-MOD", label: "Modificación prevista", status: "CONFIRMED_PARTIAL", value: "Sí; 20 %", evidence: "Memoria; causa y redacción literal pendientes" },
  { id: "CARL-CLOSE-SOLVENCY", label: "Solvencia", status: "CONFIRMED_PARTIAL", value: "Exigida; detalle en Anexo I apartado 4", evidence: "PCAP; umbrales exactos pendientes" },
  { id: "CARL-CLOSE-PRICE-SYSTEM", label: "Sistema de determinación del precio", status: "PENDING_SOURCE_EVIDENCE", value: "Literalidad no congelada", evidence: "Requiere texto exacto del Anexo I" },
  { id: "CARL-CLOSE-GUARANTEES", label: "Garantías", status: "PENDING_SOURCE_EVIDENCE", value: "No congeladas", evidence: "Requiere texto exacto del Anexo I" },
  { id: "CARL-CLOSE-SPECIAL", label: "Condiciones especiales de ejecución", status: "PENDING_SOURCE_EVIDENCE", value: "No congeladas", evidence: "Requiere texto exacto del Anexo I" },
  { id: "CARL-CLOSE-PENALTIES", label: "Penalidades", status: "PENDING_SOURCE_EVIDENCE", value: "No congeladas", evidence: "Requiere texto exacto del Anexo I" },
  { id: "CARL-CLOSE-DA33", label: "DA 33.ª", status: "PENDING_SOURCE_EVIDENCE", value: "No congelada", evidence: "Requiere evidencia expresa del Anexo I" },
  { id: "CARL-CLOSE-JUDGEMENT", label: "Criterios sujetos a juicio de valor", status: "NOT_APPLICABLE", value: "No aplicable en la línea base: criterios identificados como cuantificables mediante fórmulas", evidence: "Memoria" },
  { id: "CARL-CLOSE-LOT-DETAIL", label: "Desglose por lotes", status: "NOT_APPLICABLE", value: "No aplicable: expediente sin división en lotes", evidence: "Memoria" },
  { id: "CARL-CLOSE-SARA-CONTROLS", label: "Controles específicos SARA", status: "NOT_APPLICABLE", value: "No aplicable: expediente no SARA", evidence: "Memoria" },
] as const;

const counts = CARL_DOCUMENT_CLOSURE_ITEMS.reduce((acc, item) => {
  acc[item.status] += 1;
  return acc;
}, { CONFIRMED: 0, CONFIRMED_PARTIAL: 0, PENDING_SOURCE_EVIDENCE: 0, NOT_APPLICABLE: 0 } as Record<CarlClosureStatus, number>);

export const CARL_DOCUMENT_CLOSURE_11_8_5 = {
  id: "REG-SERVICE-005",
  step: "11.8.5",
  expediente: SERVICE_REGRESSION_CASE_005_CARL_FINE.expediente,
  status: "DOCUMENTARY_CLOSURE_WITH_OPEN_ITEMS",
  items: CARL_DOCUMENT_CLOSURE_ITEMS,
  counts,
  closureRule: "El cierre documental no equivale a completitud total: los campos PENDING_SOURCE_EVIDENCE siguen abiertos y no pueden utilizarse como reglas congeladas, ni elevar el caso a golden.",
  promotionRule: "REG-SERVICE-005 solo podrá optar a una línea base documental completa cuando los pendientes materiales se resuelvan mediante fuente primaria y validación humana.",
  humanValidationRequired: true,
} as const;
