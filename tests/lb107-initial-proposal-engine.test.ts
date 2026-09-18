import { describe, expect, it } from "vitest";
import { CPVEntry } from "../src/domain/cpv/CPVEntry";
import { createInitialProposal, loadProjectCpvCatalog } from "../src/application/intake/lb107/InitialProposalEngine";

const cpv = (codigo: string, descripcion: string): CPVEntry => Object.assign(new CPVEntry(), {
  codigo, descripcion, nivel: "DETALLE", activo: true, palabrasClave: [], sinonimos: [],
});

describe("LB107 · bloque inicial propuesto y validado por una persona", () => {
  it("propone suministro, CPV ordenados y motivaciones desde una única descripción", () => {
    const result = createInitialProposal(
      "Necesitamos adquirir artículos y materiales de ferretería para pequeñas reparaciones en edificios públicos.",
      [
        cpv("44316400-2", "Artículos de ferretería"),
        cpv("90911200-8", "Servicios de limpieza de edificios"),
        cpv("44316000-8", "Ferretería"),
      ],
    );
    expect(result.contractType.recommended).toBe("SUPPLY");
    expect(result.objectDraft).toMatch(/^Suministro de /);
    expect(result.needDraft).toContain("La Administración necesita");
    expect(result.cpvCandidates[0]).toMatchObject({ code: "44316400-2", suggestedRole: "PRIMARY" });
    expect(result.legalBasisByDecision.contractType.map(item => item.article)).toEqual(["12", "16", "17"]);
    expect(result.legalBasisByDecision.lots[0]?.relevantOfficialExcerpt).toContain("división en lotes");
    expect(result.humanValidationRequired).toBe(true);
    expect(result.productionReady).toBe(false);
  });

  it("propone servicio cuando predomina una prestación de hacer", () => {
    const result = createInitialProposal(
      "Se necesita un servicio de limpieza, mantenimiento higiénico y control de calidad de varias oficinas.",
      [cpv("90919200-4", "Servicios de limpieza de oficinas")],
    );
    expect(result.contractType.recommended).toBe("SERVICE");
    expect(result.objectDraft).toMatch(/^Servicio de /);
    expect(result.cpvCandidates[0]?.code).toBe("90919200-4");
  });

  it("propone lotes completos y editables cuando identifica prestaciones diferenciadas", () => {
    const result = createInitialProposal(
      "Formación lingüística del personal técnico en inglés, portugués y español como lengua extranjera. Orientación y acompañamiento grupal para personas beneficiarias del proyecto.",
      [cpv("80580000-3", "Provisión de cursos de idiomas")],
    );
    expect(result.lots.recommended).toBe(true);
    expect(result.lots.suggestedDefinitions).toEqual([
      expect.objectContaining({ name: expect.stringContaining("Formación lingüística"), description: expect.stringContaining("inglés") }),
      expect.objectContaining({ name: expect.stringContaining("Orientación y acompañamiento grupal"), description: expect.stringContaining("beneficiarias") }),
    ]);
  });

  it("carga el catálogo completo aportado y no la antigua lista de ejemplos", () => {
    const catalog = loadProjectCpvCatalog();
    expect(catalog.length).toBe(9454);
    expect(catalog.find(item => item.codigo === "44316400-2")?.descripcion).toBe("Artículos de ferretería");
    expect(catalog.find(item => item.codigo === "48761000-0")?.descripcion).toBe("Paquetes de software antivirus");
  });

  it("rechaza descripciones insuficientes en lugar de inventar el expediente", () => {
    expect(() => createInitialProposal("Comprar cosas", [])).toThrow(/más de detalle/);
  });
});
