import {describe,expect,it} from "vitest";
import {LB115_PLANNED_MODIFICATION_SCRIPT} from "../src/interfaces/lb103/LB115PlannedModificationScript";

describe("LB115 · interfaz",()=>{
  it("muestra el fundamento y utiliza textos comprensibles en español",()=>{
    for(const x of ['prior.status!=="HUMAN_VALIDATED"',"Propuesta inicial del sistema","Artículo 204: modificaciones previstas","Reducción por estabilidad presupuestaria","Otra causa prevista, clara y verificable","No utilice códigos ni separadores","Límites legales aplicados automáticamente"]) expect(LB115_PLANNED_MODIFICATION_SCRIPT).toContain(x);
    for(const x of ["Tipos: BUDGET_STABILITY_DOWN","tipo | descripción","límites separados por"]) expect(LB115_PLANNED_MODIFICATION_SCRIPT).not.toContain(x);
  });
  it("solo ofrece la causa de la disposición adicional 33 cuando corresponde",()=>{
    for(const x of ['allowDa33=da33===true','if(allowDa33)','no se muestra porque no corresponde a este expediente']) expect(LB115_PLANNED_MODIFICATION_SCRIPT).toContain(x);
  });
  it("persiste siete componentes, informa del progreso y registra el consentimiento",()=>{
    for(const p of ["modificationPercent","economic.modificationAmountExVatCents","execution.plannedModificationRegime","execution.plannedModificationJustification","execution.plannedModificationProcedure","execution.plannedModificationNoNewUnitPrices","execution.plannedModificationValueEstimatedTreatment"]) expect(LB115_PLANNED_MODIFICATION_SCRIPT).toContain(p);
    expect(LB115_PLANNED_MODIFICATION_SCRIPT).toContain("Guardando decisión");
    expect(LB115_PLANNED_MODIFICATION_SCRIPT).toContain("lb115-human-validation");
  });
});
