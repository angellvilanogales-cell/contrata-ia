import {describe,expect,it} from "vitest";
import {LB117_EXECUTION_RECEIPT_PAYMENT_SCRIPT} from "../src/interfaces/lb103/LB117ExecutionReceiptPaymentScript";

describe("LB117 · interfaz",()=>{
  it("reduce la pantalla principal a tres grupos de decisiones",()=>{
    for(const x of ["1. Responsable","2. Cómo y dónde se realizará la prestación","3. Pago","Revisar o modificar la propuesta detallada","Las funciones, la subsanación de defectos, la factura electrónica y el plazo ordinario de 30 días se redactarán automáticamente"]) expect(LB117_EXECUTION_RECEIPT_PAYMENT_SCRIPT).toContain(x);
  });
  it("adapta la propuesta a servicios y genera textos iniciales",()=>{
    for(const x of ['service=type==="SERVICE"',"Al tratarse de un servicio","Prestación periódica durante la vigencia","Seguimiento periódico mediante informes","Conformidad expresa del responsable"]) expect(LB117_EXECUTION_RECEIPT_PAYMENT_SCRIPT).toContain(x);
  });
  it("permite revisar seis textos y muestra progreso al confirmar",()=>{
    for(const p of ["administrative.contractManager","execution.contractManagerFunctions","execution.performanceMonitoringRegime","execution.receiptAndAcceptanceRegime","execution.invoiceSubmissionRegime","execution.paymentRegime"]) expect(LB117_EXECUTION_RECEIPT_PAYMENT_SCRIPT).toContain(p);
    expect(LB117_EXECUTION_RECEIPT_PAYMENT_SCRIPT).toContain("Puede modificar estos seis textos");
    expect(LB117_EXECUTION_RECEIPT_PAYMENT_SCRIPT).toContain("Guardando decisión");
    expect(LB117_EXECUTION_RECEIPT_PAYMENT_SCRIPT).toContain("lb117-human-validation");
  });
});
