import {describe,expect,it} from "vitest";
import {LB112_GUARANTEES_SCRIPT} from "../src/interfaces/lb103/LB112GuaranteesScript";
describe("LB112 · interfaz",()=>{
 it("explica y separa las garantías",()=>{for(const text of ["garantía provisional, definitiva, complementaria y plazo de garantía","máximo 3 %","máximo 5 %","Consultar BOE"])expect(LB112_GUARANTEES_SCRIPT).toContain(text);});
 it("persiste todas las decisiones después del consentimiento",()=>{for(const path of ["guarantees.provisionalGuaranteeRequired","guarantees.provisionalGuaranteePercent","guarantees.provisionalGuaranteeJustification","guarantees.definitiveGuaranteePercent","guarantees.definitiveGuaranteeRegime","guarantees.complementaryGuaranteePercent","guarantees.complementaryGuaranteeJustification","guarantees.warrantyPeriodMonths","guarantees.warrantyPeriodRegime"])expect(LB112_GUARANTEES_SCRIPT).toContain(`validate(id,"${path}"`);expect(LB112_GUARANTEES_SCRIPT).toContain("lb112-human-validation");});
});
