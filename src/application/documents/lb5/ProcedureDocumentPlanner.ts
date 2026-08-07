import type { LB5CompositionOptions, LB5DocumentContext } from "./DocumentModel";

export type ProcedureDocumentResponsibility =
  | "CONTRATA_IA_GENERATES"
  | "CONTRATA_IA_CAN_DRAFT_ON_REQUEST"
  | "EXTERNAL_SYSTEM_GENERATES"
  | "EXTERNAL_AUTHORITY_OR_CONTROL_BODY"
  | "NOT_APPLICABLE";

export interface ProcedureDocumentPlanItem {
  readonly id: string;
  readonly title: string;
  readonly responsibility: ProcedureDocumentResponsibility;
  readonly required: boolean;
  readonly conditionalReason?: string;
  readonly sourceIds: readonly string[];
  readonly note: string;
}

export interface ProcedureDocumentPlan {
  readonly expedienteId: string;
  readonly phase: "PREPARATION_AND_INITIATION";
  readonly items: readonly ProcedureDocumentPlanItem[];
}

const LCSP = "LCSP-2017-CONSOLIDADA-2026";
const SAE_GUIDE = "SAE-GUIA-OPERATIVA-CONTRATACION";

export class ProcedureDocumentPlanner {
  public plan(context: LB5DocumentContext, options: LB5CompositionOptions): ProcedureDocumentPlan {
    const noDivision = context.normativeDecision.lots.result === "NO_DIVISION_PROPOSED";
    const items: ProcedureDocumentPlanItem[] = [
      {
        id: "MEMORIA_JUSTIFICATIVA",
        title: "Memoria justificativa",
        responsibility: "CONTRATA_IA_GENERATES",
        required: true,
        sourceIds: [LCSP, SAE_GUIDE],
        note: "Documento nuclear. Se compone con los bloques justificativos del expediente."
      },
      {
        id: "INFORME_NECESIDAD",
        title: "Informe de necesidad e idoneidad",
        responsibility: options.needPlacement === "STANDALONE" ? "CONTRATA_IA_GENERATES" : "NOT_APPLICABLE",
        required: options.needPlacement === "STANDALONE",
        conditionalReason: options.needPlacement === "IN_MEMORY" ? "El contenido se integra como epígrafe de la Memoria Justificativa." : undefined,
        sourceIds: [LCSP, SAE_GUIDE],
        note: "El contenido es exigible; su materialización como fichero autónomo depende de la opción documental adoptada."
      },
      {
        id: "INFORME_INSUFICIENCIA_MEDIOS",
        title: "Informe de insuficiencia de medios",
        responsibility: options.insufficiencyPlacement === "STANDALONE" ? "CONTRATA_IA_GENERATES" : "NOT_APPLICABLE",
        required: true,
        conditionalReason: options.insufficiencyPlacement === "IN_MEMORY" ? "El contenido se integra en la Memoria Justificativa del contrato de servicios." : undefined,
        sourceIds: [LCSP, SAE_GUIDE],
        note: "Para servicios debe justificarse con hechos de la unidad promotora; Contrata-IA no inventa la insuficiencia."
      },
      {
        id: "INFORME_LOTES",
        title: "Informe/epígrafe justificativo de división o no división en lotes",
        responsibility: noDivision ? "CONTRATA_IA_CAN_DRAFT_ON_REQUEST" : "CONTRATA_IA_CAN_DRAFT_ON_REQUEST",
        required: noDivision,
        conditionalReason: noDivision ? "Se ha propuesto no dividir; la motivación debe constar expresamente." : "Puede integrarse en Memoria o generarse aparte según criterio de tramitación.",
        sourceIds: [LCSP],
        note: "Se reutiliza el bloque LOTS y la misma motivación del expediente."
      },
      {
        id: "PCAP",
        title: "Pliego de Cláusulas Administrativas Particulares",
        responsibility: "CONTRATA_IA_GENERATES",
        required: true,
        sourceIds: [LCSP, "JA-MODELOS-PCAP"],
        note: "Proyecto editable contrastado con el modelo recomendado vigente correspondiente al procedimiento y financiación."
      },
      {
        id: "PPT",
        title: "Pliego de Prescripciones Técnicas Particulares",
        responsibility: "CONTRATA_IA_GENERATES",
        required: true,
        sourceIds: [LCSP, "JA-PCAP-LIMPIEZA-EJEMPLOS-USUARIO"],
        note: "Debe contener prestaciones, frecuencias, calidades y controles técnicos verificables."
      },
      {
        id: "PROPUESTA_INICIO",
        title: "Propuesta de inicio formal",
        responsibility: "CONTRATA_IA_CAN_DRAFT_ON_REQUEST",
        required: true,
        sourceIds: [SAE_GUIDE, LCSP],
        note: "Contrata-IA puede preparar el borrador reutilizando identificación, necesidad, objeto y procedimiento; requiere firma/impulso por la unidad competente."
      },
      {
        id: "SOLICITUD_EXISTENCIA_CREDITO",
        title: "Solicitud de existencia de crédito",
        responsibility: "CONTRATA_IA_CAN_DRAFT_ON_REQUEST",
        required: true,
        sourceIds: [SAE_GUIDE],
        note: "Requiere datos presupuestarios que no deben inventarse. El borrador solo puede cerrarse cuando consten aplicación, anualidades e importes."
      },
      {
        id: "CERTIFICADO_EXISTENCIA_CREDITO",
        title: "Certificado de existencia de crédito",
        responsibility: "EXTERNAL_SYSTEM_GENERATES",
        required: true,
        sourceIds: [SAE_GUIDE],
        note: "Documento producido por el sistema económico competente; Contrata-IA debe comprobar su incorporación, no falsificarlo."
      },
      {
        id: "RESERVA_CREDITO",
        title: "Reserva/retención de crédito",
        responsibility: "EXTERNAL_SYSTEM_GENERATES",
        required: true,
        sourceIds: [SAE_GUIDE],
        note: "Resguardo presupuestario generado en el módulo económico; se controla como evidencia externa del expediente."
      },
      {
        id: "ACUERDO_INICIO",
        title: "Acuerdo de inicio del expediente",
        responsibility: "CONTRATA_IA_CAN_DRAFT_ON_REQUEST",
        required: true,
        sourceIds: [LCSP, SAE_GUIDE],
        note: "Puede prepararse como borrador, pero la decisión y firma corresponden al órgano competente."
      },
      {
        id: "SOLICITUD_INFORME_JURIDICO",
        title: "Solicitud de informe a la Asesoría Jurídica",
        responsibility: "CONTRATA_IA_CAN_DRAFT_ON_REQUEST",
        required: true,
        sourceIds: [SAE_GUIDE],
        note: "El borrador debe relacionar la documentación remitida. El informe jurídico resultante pertenece al órgano de asesoramiento."
      },
      {
        id: "INFORME_ASESORIA_JURIDICA",
        title: "Informe de Asesoría Jurídica",
        responsibility: "EXTERNAL_AUTHORITY_OR_CONTROL_BODY",
        required: true,
        sourceIds: [SAE_GUIDE],
        note: "Contrata-IA no debe simular el dictamen de la Asesoría Jurídica; debe incorporarlo y procesar sus observaciones cuando exista."
      },
      {
        id: "RESOLUCION_URGENCIA",
        title: "Resolución de declaración de urgencia",
        responsibility: "NOT_APPLICABLE",
        required: false,
        conditionalReason: "LB-5 hereda del caso LB-4 una tramitación ordinaria; solo procede si concurren y se motivan los presupuestos legales de urgencia.",
        sourceIds: [LCSP, SAE_GUIDE],
        note: "No se genera en el caso de uso ordinario."
      }
    ];

    return { expedienteId: context.expedienteId, phase: "PREPARATION_AND_INITIATION", items };
  }
}
