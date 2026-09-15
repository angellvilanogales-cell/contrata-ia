import { describe,expect,it } from "vitest";
import { LB111_AWARD_CRITERIA_SCRIPT } from "../src/interfaces/lb103/LB111AwardCriteriaScript";
describe("LB111 · interfaz",()=>{
 it("expone normativa, estructura y propuesta editable",()=>{expect(LB111_AWARD_CRITERIA_SCRIPT).toContain("Las ponderaciones no vienen impuestas por la ley");expect(LB111_AWARD_CRITERIA_SCRIPT).toContain("COST o QUALITY");expect(LB111_AWARD_CRITERIA_SCRIPT).toContain("Artículo 85 RGLCAP");expect(LB111_AWARD_CRITERIA_SCRIPT).toContain("artículo 147.2 LCSP");});
 it("persiste criterios y reglas complementarias tras confirmar",()=>{for(const path of ["criteria.awardCriteria","criteria.judgmentCriteriaExist","criteria.singleCriterionMotivation","criteria.formulaJustification","criteria.abnormallyLowTenderParameters","criteria.tieBreakCriteria"])expect(LB111_AWARD_CRITERIA_SCRIPT).toContain(`validate(id,"${path}"`);expect(LB111_AWARD_CRITERIA_SCRIPT).toContain("lb111-human-validation");});
});
