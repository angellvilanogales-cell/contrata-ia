import { describe, expect, it } from "vitest";
import { composeEventTechnicalOutline, eventQuestions } from "../src/application/intake/lb7/EventServicesProfile";

describe("LB-7 EVENT_SERVICES documentary intake", () => {
  it("keeps guided intake conditional instead of asking every event question", () => {
    const base = eventQuestions([]);
    const audiovisual = eventQuestions(["AUDIOVISUAL", "STREAMING"]);
    expect(base.some(question => question.id === "eventOfficialNames")).toBe(true);
    expect(base.some(question => question.id === "catering")).toBe(false);
    expect(audiovisual.some(question => question.id === "soundLightingProjection")).toBe(true);
    expect(audiovisual.some(question => question.id === "streamingRequirements")).toBe(true);
    expect(audiovisual.some(question => question.id === "expectedCovers")).toBe(false);
  });

  it("activates reserved catering questions only for the relevant event configuration", () => {
    const questions = eventQuestions(["CATERING", "RESERVED_CATERING_LOT"]);
    expect(questions.some(question => question.id === "catering")).toBe(true);
    expect(questions.some(question => question.id === "expectedCovers")).toBe(true);
    expect(questions.some(question => question.id === "reservedCateringLot")).toBe(true);
  });

  it("warns instead of inventing missing technical facts", () => {
    const outline = composeEventTechnicalOutline(["VENUE", "AUDIOVISUAL", "CATERING"], {
      eventOfficialNames: "Gala institucional",
      eventCount: 1,
      publicPurposeAndNeed: "Celebración del acto institucional definido por la unidad promotora.",
      datesOrTimeWindow: "Segundo trimestre",
      locationsAndNuts: "Sevilla / ES618",
      lots: "Lote 1 organización; lote 2 catering",
      cpvByLotOrPrestacion: "79952000-2; 55320000-9"
    });
    expect(outline.readyForDocumentDraft).toBe(false);
    expect(outline.warnings.some(warning => warning.includes("Espacio o sede"))).toBe(true);
    expect(outline.warnings.some(warning => warning.includes("Asistencia o aforo"))).toBe(true);
    expect(outline.warnings.some(warning => warning.includes("catering"))).toBe(true);
  });

  it("builds an event-specific technical outline when factual inputs are supplied", () => {
    const outline = composeEventTechnicalOutline(["VENUE", "AUDIOVISUAL", "STREAMING", "ACCESSIBILITY"], {
      eventOfficialNames: "Premios de ejemplo",
      eventCount: 1,
      publicPurposeAndNeed: "Finalidad institucional aportada por la unidad promotora.",
      datesOrTimeWindow: "15 de octubre de 2026",
      locationsAndNuts: "Granada / ES614",
      lots: "Lote único",
      cpvByLotOrPrestacion: "79952000-2",
      venue: "Espacio definido en el expediente",
      expectedAttendance: "250 personas",
      soundLightingProjection: "Sonido, iluminación y proyección según inventario técnico",
      streamingRequirements: "Retransmisión en directo",
      photoVideoRequirements: "Reportaje fotográfico y vídeo resumen",
      signLanguageAccessibility: "Interpretación en lengua de signos"
    });
    expect(outline.family).toBe("EVENT_SERVICES");
    expect(outline.readyForDocumentDraft).toBe(true);
    expect(outline.sections.some(section => section.heading.includes("Audiovisual"))).toBe(true);
    expect(outline.sections.some(section => section.heading.includes("accesibilidad"))).toBe(true);
  });
});
