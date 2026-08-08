export type EventFeature =
  | "MULTI_EVENT"
  | "MULTI_LOT"
  | "MULTI_PROVINCE"
  | "VENUE"
  | "AUDIOVISUAL"
  | "STREAMING"
  | "PEOPLE"
  | "ACCESSIBILITY"
  | "CATERING"
  | "RESERVED_CATERING_LOT"
  | "TRAVEL"
  | "AWARDS"
  | "PERSONAL_DATA"
  | "INTELLECTUAL_PROPERTY";

export type EventAnswerId =
  | "eventOfficialNames"
  | "eventCount"
  | "publicPurposeAndNeed"
  | "datesOrTimeWindow"
  | "locationsAndNuts"
  | "lots"
  | "cpvByLotOrPrestacion"
  | "venue"
  | "expectedAttendance"
  | "creativeConcept"
  | "productionPlan"
  | "runOfShow"
  | "montageDismantling"
  | "soundLightingProjection"
  | "streamingRequirements"
  | "photoVideoRequirements"
  | "presenterSpeakersPerformers"
  | "supportStaff"
  | "signLanguageAccessibility"
  | "catering"
  | "expectedCovers"
  | "reservedCateringLot"
  | "travel"
  | "accommodation"
  | "awardsStatuettesGifts"
  | "licensesAuthorizations"
  | "insurance"
  | "intellectualProperty"
  | "personalDataProcessing"
  | "finalReportAndMetrics";

export interface EventQuestion {
  readonly id: EventAnswerId;
  readonly section: string;
  readonly label: string;
  readonly requirement: "REQUIRED" | "CONDITIONAL";
  readonly feature?: EventFeature;
  readonly factPolicy: "HUMAN_OR_SOURCE_REQUIRED" | "STRUCTURAL";
}

export interface EventTechnicalOutline {
  readonly family: "EVENT_SERVICES";
  readonly sections: readonly { heading: string; items: readonly string[] }[];
  readonly warnings: readonly string[];
  readonly readyForDocumentDraft: boolean;
}

const QUESTIONS: readonly EventQuestion[] = [
  { id: "eventOfficialNames", section: "Identificación", label: "Denominación oficial del evento o eventos", requirement: "REQUIRED", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "eventCount", section: "Identificación", label: "Número de eventos", requirement: "REQUIRED", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "publicPurposeAndNeed", section: "Necesidad", label: "Finalidad pública y necesidad concreta", requirement: "REQUIRED", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "datesOrTimeWindow", section: "Calendario", label: "Fechas o ventana temporal", requirement: "REQUIRED", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "locationsAndNuts", section: "Localización", label: "Localidades y NUTS por evento/lote", requirement: "REQUIRED", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "lots", section: "Lotes", label: "Lotes y prestaciones de cada lote", requirement: "REQUIRED", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "cpvByLotOrPrestacion", section: "Clasificación", label: "CPV por lote o prestación", requirement: "REQUIRED", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "creativeConcept", section: "Producción", label: "Concepto creativo e identidad del acto", requirement: "CONDITIONAL", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "productionPlan", section: "Producción", label: "Plan de producción y coordinación", requirement: "CONDITIONAL", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "runOfShow", section: "Producción", label: "Escaleta o secuencia técnica", requirement: "CONDITIONAL", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "montageDismantling", section: "Producción", label: "Montaje, desmontaje y logística", requirement: "CONDITIONAL", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "venue", section: "Espacio", label: "Espacio o sede del evento", requirement: "CONDITIONAL", feature: "VENUE", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "expectedAttendance", section: "Espacio", label: "Asistencia o aforo previsto", requirement: "CONDITIONAL", feature: "VENUE", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "soundLightingProjection", section: "Audiovisual", label: "Sonido, iluminación y proyección", requirement: "CONDITIONAL", feature: "AUDIOVISUAL", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "streamingRequirements", section: "Audiovisual", label: "Streaming y retransmisión", requirement: "CONDITIONAL", feature: "STREAMING", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "photoVideoRequirements", section: "Audiovisual", label: "Fotografía, vídeo y piezas audiovisuales", requirement: "CONDITIONAL", feature: "AUDIOVISUAL", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "presenterSpeakersPerformers", section: "Personal", label: "Presentación, ponentes o actuaciones", requirement: "CONDITIONAL", feature: "PEOPLE", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "supportStaff", section: "Personal", label: "Equipo de producción, auxiliares y coordinación", requirement: "CONDITIONAL", feature: "PEOPLE", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "signLanguageAccessibility", section: "Accesibilidad", label: "Lengua de signos y otras medidas de accesibilidad", requirement: "CONDITIONAL", feature: "ACCESSIBILITY", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "catering", section: "Catering", label: "Alcance del catering", requirement: "CONDITIONAL", feature: "CATERING", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "expectedCovers", section: "Catering", label: "Número estimado de servicios/cubiertos", requirement: "CONDITIONAL", feature: "CATERING", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "reservedCateringLot", section: "Catering", label: "Reserva social del lote de catering", requirement: "CONDITIONAL", feature: "RESERVED_CATERING_LOT", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "travel", section: "Viajes", label: "Traslados incluidos", requirement: "CONDITIONAL", feature: "TRAVEL", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "accommodation", section: "Viajes", label: "Alojamiento incluido", requirement: "CONDITIONAL", feature: "TRAVEL", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "awardsStatuettesGifts", section: "Premios", label: "Estatuillas, premios, obsequios o material corporativo", requirement: "CONDITIONAL", feature: "AWARDS", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "licensesAuthorizations", section: "Cumplimiento", label: "Licencias y autorizaciones necesarias", requirement: "CONDITIONAL", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "insurance", section: "Cumplimiento", label: "Seguros exigidos", requirement: "CONDITIONAL", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "intellectualProperty", section: "Cumplimiento", label: "Propiedad intelectual e imagen", requirement: "CONDITIONAL", feature: "INTELLECTUAL_PROPERTY", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "personalDataProcessing", section: "Cumplimiento", label: "Tratamiento de datos personales", requirement: "CONDITIONAL", feature: "PERSONAL_DATA", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" },
  { id: "finalReportAndMetrics", section: "Entregables", label: "Informe final, indicadores y entregables", requirement: "CONDITIONAL", factPolicy: "HUMAN_OR_SOURCE_REQUIRED" }
];

const FEATURE_ALWAYS_CONDITIONAL = new Set<EventAnswerId>([
  "creativeConcept", "productionPlan", "runOfShow", "montageDismantling", "licensesAuthorizations", "insurance", "finalReportAndMetrics"
]);

export function eventQuestions(features: readonly EventFeature[]): readonly EventQuestion[] {
  const enabled = new Set(features);
  return QUESTIONS.filter(question => question.requirement === "REQUIRED" || FEATURE_ALWAYS_CONDITIONAL.has(question.id) || (question.feature !== undefined && enabled.has(question.feature)));
}

function value(answers: Readonly<Partial<Record<EventAnswerId, unknown>>>, id: EventAnswerId): string {
  const raw = answers[id];
  if (raw === undefined || raw === null) return "";
  if (Array.isArray(raw)) return raw.map(String).map(item => item.trim()).filter(Boolean).join("; ");
  return String(raw).trim();
}

export function composeEventTechnicalOutline(
  features: readonly EventFeature[],
  answers: Readonly<Partial<Record<EventAnswerId, unknown>>>
): EventTechnicalOutline {
  const active = eventQuestions(features);
  const warnings: string[] = [];
  for (const question of active) {
    if (question.requirement === "REQUIRED" && !value(answers, question.id)) warnings.push(`Falta dato obligatorio de EVENT_SERVICES: ${question.label}.`);
    if (question.requirement === "CONDITIONAL" && question.feature && features.includes(question.feature) && !value(answers, question.id)) {
      warnings.push(`Dato técnico pendiente; no se puede inventar: ${question.label}.`);
    }
  }

  const section = (heading: string, ids: readonly EventAnswerId[]) => ({
    heading,
    items: ids.map(id => value(answers, id)).filter(Boolean)
  });

  const sections = [
    section("Objeto, eventos y finalidad", ["eventOfficialNames", "eventCount", "publicPurposeAndNeed"]),
    section("Calendario, localidades, lotes y CPV", ["datesOrTimeWindow", "locationsAndNuts", "lots", "cpvByLotOrPrestacion"]),
    section("Producción, montaje y logística", ["creativeConcept", "productionPlan", "runOfShow", "montageDismantling"]),
    section("Espacios y asistencia", ["venue", "expectedAttendance"]),
    section("Audiovisual, streaming, fotografía y vídeo", ["soundLightingProjection", "streamingRequirements", "photoVideoRequirements"]),
    section("Personal y accesibilidad", ["presenterSpeakersPerformers", "supportStaff", "signLanguageAccessibility"]),
    section("Catering", ["catering", "expectedCovers", "reservedCateringLot"]),
    section("Viajes y alojamiento", ["travel", "accommodation"]),
    section("Premios y material corporativo", ["awardsStatuettesGifts"]),
    section("Licencias, seguros, propiedad intelectual y datos", ["licensesAuthorizations", "insurance", "intellectualProperty", "personalDataProcessing"]),
    section("Entregables y control", ["finalReportAndMetrics"])
  ].filter(item => item.items.length > 0);

  return { family: "EVENT_SERVICES", sections, warnings, readyForDocumentDraft: warnings.length === 0 };
}
