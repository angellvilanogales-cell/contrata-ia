import { describe, expect, it } from "vitest";
import {
  auditJdaSupplyAsaAnexoIText,
  extractContractingAuthorityAnexoIText,
  FERRETERIA_FIRST_REAL_RENDER_AUDIT,
} from "../src/application/intake/lb35/JuntaSupplyAsaAnexoIResidualAudit";

describe("LB35 - auditoría residual posterior al render real del Anexo I", () => {
  it("bloquea decisiones del órgano de contratación que siguen como Sí/No o placeholder", () => {
    const result = auditJdaSupplyAsaAnexoIText(`
ANEXO I
CARACTERÍSTICAS DEL CONTRATO
Órgano de contratación: _______
Respuestas vinculantes sobre la aclaración de los pliegos: Sí/No
Posibilidad de variantes: No
Se exige habilitación empresarial o profesional: No
`);
    expect(result.ready).toBe(false);
    expect(result.blockers.join(" ")).toMatch(/Órgano de contratación/);
    expect(result.blockers.join(" ")).toMatch(/Respuestas vinculantes/);
    expect(result.blockers.join(" ")).not.toMatch(/Posibilidad de variantes: No —/);
  });

  it("considera resuelto un campo condicional cuando se materializa No procede", () => {
    const result = auditJdaSupplyAsaAnexoIText(`
ANEXO I
CARACTERÍSTICAS DEL CONTRATO
Descripción de los lotes: No procede.
En caso afirmativo, indicar: No procede.
Organismos de los que las personas licitadoras pueden obtener información: No procede.
Cesión del contrato: No
`);
    expect(result.ready).toBe(true);
    expect(result.blockers).toEqual([]);
  });

  it("aísla Anexo I y no confunde blancos de formularios de licitadores del Anexo II", () => {
    const xml = `
<office:text>
<text:p>ANEXO I</text:p><text:p>CARACTERÍSTICAS DEL CONTRATO</text:p>
<text:p>Órgano de contratación: Dirección Gerencia del Servicio Andaluz de Empleo</text:p>
<text:p>ANEXO II</text:p><text:p>DECLARACIÓN RESPONSABLE</text:p>
<text:p>D./Dª. __________________________</text:p>
</office:text>`;
    const anexo = extractContractingAuthorityAnexoIText(xml);
    expect(anexo).toContain("Dirección Gerencia");
    expect(anexo).not.toContain("D./Dª.");
    expect(auditJdaSupplyAsaAnexoIText(anexo).ready).toBe(true);
  });

  it("registra que el primer render real exige una segunda pasada de parametrización", () => {
    expect(FERRETERIA_FIRST_REAL_RENDER_AUDIT.caseId).toBe("CONTR/2026/240267");
    expect(FERRETERIA_FIRST_REAL_RENDER_AUDIT.status).toBe("REQUIRES_SECOND_RENDER");
    expect(FERRETERIA_FIRST_REAL_RENDER_AUDIT.rule).toBe("STYLE_AND_REGISTERED_SLOTS_ARE_NECESSARY_BUT_NOT_SUFFICIENT");
  });
});
