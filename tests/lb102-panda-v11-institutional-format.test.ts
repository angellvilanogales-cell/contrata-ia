import {describe,expect,it} from "vitest";
import {pandaInstitutionalParagraphFragment,reflowPandaSourceLines} from "../src/application/intake/lb102/PandaInstitutionalEvidenceFormatter";

describe("LB102 Panda V11 - formato institucional",()=>{
 it("recompone líneas partidas sin perder epígrafes ni metadatos",()=>{
  const out=reflowPandaSourceLines(["MEMORIA JUSTIFICATIVA","Código Expte. CONTR 2025 466864","1. NATURALEZA Y OBJETO DEL CONTRATO.","El contrato objeto de este expediente tiene naturaleza administrativa al intervenir","en el mismo una entidad del sector público.","2. TIPO DE CONTRATO.","Contrato de suministro."]);
  expect(out).toContain("MEMORIA JUSTIFICATIVA");expect(out).toContain("Código Expte. CONTR 2025 466864");expect(out).toContain("1. NATURALEZA Y OBJETO DEL CONTRATO.");expect(out).toContain("El contrato objeto de este expediente tiene naturaleza administrativa al intervenir en el mismo una entidad del sector público.");expect(out).toContain("2. TIPO DE CONTRATO.");
 });
 it("materializa jerarquía visual Source-backed en estilos institucionales",()=>{const xml=pandaInstitutionalParagraphFragment(["MEMORIA JUSTIFICATIVA","1. OBJETO DEL CONTRATO.","Código Expte. CONTR 2025 466864","Texto material de la memoria.","• Requisito técnico"]);expect(xml).toContain('style-name="CI_Title"');expect(xml).toContain('style-name="CI_Heading1"');expect(xml).toContain('style-name="CI_Meta"');expect(xml).toContain('style-name="CI_Body"');expect(xml).toContain('style-name="CI_Bullet"');});
});
