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
  readonly contentRequired: boolean;
  readonly standaloneDocumentRequired: boolean;
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
        contentRequired: true,
        standaloneDocumentRequired: true,
        sourceIds: [LCSP, SAE_GUIDE],
        note: "Documento nuclear. Se compone con los bloques justificativos del expediente."
      },
      {
        id: "INFORME_NECESIDAD",
        title: "Necesidad e idoneidad / Informe de necesidad",
        responsibility: options.needPlacement === "STANDALONE" ? "CONTRATA_IA_GENERATES" : "NOT_APPLICABLE",
        contentRequired: true,
        standaloneDocumentRequired: options.needPlacement === "STANDALONE",
        conditionalReason: options.needPlacement === "IN_MEMORY" ? "El contenido obligatorio se integra como epígrafe de la Memoria Justificativa; no se exige un fichero separado por esta configuración." : undefined,
        sourceIds: [LCSP, SAE_GUIDE],
        note: "Se separa la obligación de motivar la necesidad de la decisión formal de materializarla o no en un informe autónomo."
      },
      {
        id: "INFORME_INSUFICIENCIA_MEDIOS",
        title: "Insuficiencia de medios / Informe de insuficiencia",
        responsibility: options.insufficiencyPlacement === "STANDALONE" ? "CONTRATA_IA_GENERATES" : "NOT_APPLICABLE",
        contentRequired: true,
        standaloneDocumentRequired: options.insufficiencyPlacement === "STANDALONE",
        conditionalReason: options.insufficiencyPlacement === "IN_MEMORY" ? "El contenido justificativo se integra en la Memoria del contrato de servicios; no se crea un fichero separado." : undefined,
        sourceIds: [LCSP, SAE_GUIDE],
        note: "La insuficiencia debe basarse en hechos declarados por la unidad promotora; Contrata-IA no la inventa."
      },
      {
        id: "INFORME_LOTES",
        title: "Justificación de división o no división en lotes",
        responsibility: "CONTRATA_IA_CAN_DRAFT_ON_REQUEST",
        contentRequired: true,
        standaloneDocumentRequired: false,
        conditionalReason: noDivision ? "Se ha propuesto no dividir; la motivación debe constar expresamente, integrada o separada según el expediente." : "La valoración de lotes debe constar; puede integrarse en Memoria o documentarse aparte.",
        sourceIds: [LCSP],
        note: "Se reutiliza el bloque LOTS y la misma motivación del expediente; nunca se inventan motivos de no división."
      },
      {
        id: "PCAP",
        title: "Pliego de Cláusulas Administrativas Particulares",
        responsibility: "CONTRATA_IA_GENERATES",
        contentRequired: true,
        standaloneDocumentRequired: true,
        sourceIds: [LCSP, "JA-MODELOS-PCAP"],
        note: "Proyecto editable contrastado con el modelo recomendado vigente correspondiente al procedimiento y financiación."
      },
      {
        id: "PPT",
        title: "Pliego de Prescripciones Técnicas Particulares",
        responsibility: "CONTRATA_IA_GENERATES",
        contentRequired: true,
        standaloneDocumentRequired: true,
        sourceIds: [LCSP, "JA-PCAP-LIMPIEZA-EJEMPLOS-USUARIO"],
        note: "Debe contener prestaciones, frecuencias, calidades y controles técnicos verificables."
      },
      {
        id: "PROPUESTA_INICIO",
        title: "Propuesta de inicio formal",
        responsibility: "CONTRATA_IA_CAN_DRAFT_ON_REQUEST",
        contentRequired: true,
        standaloneDocumentRequired: true,
        sourceIds: [SAE_GUIDE, LCSP],
        note: "Contrata-IA puede preparar el borrador reutilizando identificación, necesidad, objeto y procedimiento; requiere firma/impulso por la unidad competente."
      },
      {
        id: "SOLICITUD_EXISTENCIA_CREDITO",
        title: "Solicitud de existencia de crédito",
        responsibility: "CONTRATA_IA_CAN_DRAFT_ON_REQUEST",
        contentRequired: true,
        standaloneDocumentRequired: true,
        sourceIds: [SAE_GUIDE],
        note: "Requiere datos presupuestarios que no deben inventarse. El borrador solo puede cerrarse cuando consten aplicación, anualidades e importes."
      },
      {
        id: "CERTIFICADO_EXISTENCIA_CREDITO",
        title: "Certificado de existencia de crédito",
        responsibility: "EXTERNAL_SYSTEM_GENERATES",
        contentRequired: true,
        standaloneDocumentRequired: true,
        sourceIds: [SAE_GUIDE],
        note: "Documento producido por el sistema económico competente; Contrata-IA debe comprobar su incorporación, no falsificarlo."
      },
      {
        id: "RESERVA_CREDITO",
        title: "Reserva/retención de crédito",
        responsibility: "EXTERNAL_SYSTEM_GENERATES",
        contentRequired: true,
        standaloneDocumentRequired: true,
        sourceIds: [SAE_GUIDE],
        note: "Resguardo presupuestario generado en el módulo económico; se controla como evidencia externa del expediente."
      },
      {
        id: "ACUERDO_INICIO",
        title: "Acuerdo de inicio del expediente",
        responsibility: "CONTRATA_IA_CAN_DRAFT_ON_REQUEST",
        contentRequired: true,
        standaloneDocumentRequired: true,
        sourceIds: [LCSP, SAE_GUIDE],
        note: "Puede prepararse como borrador, pero la decisión y firma corresponden al órgano competente."
      },
      {
        id: "SOLICITUD_INFORME_JURIDICO",
        title: "Solicitud de informe a la Asesoría Jurídica",
        responsibility: "CONTRATA_IA_CAN_DRAFT_ON_REQUEST",
        contentRequired: true,
        standaloneDocumentRequired: true,
        sourceIds: [SAE_GUIDE],
        note: "El borrador debe relacionar la documentación remitida. El informe jurídico resultante pertenece al órgano de asesoramiento."
      },
      {
        id: "INFORME_ASESORIA_JURIDICA",
        title: "Informe de Asesoría Jurídica",
        responsibility: "EXTERNAL_AUTHORITY_OR_CONTROL_BODY",
        contentRequired: true,
        standaloneDocumentRequired: true,
        sourceIds: [SAE_GUIDE],
        note: "Contrata-IA no debe simular el dictamen de la Asesoría Jurídica; debe incorporarlo y procesar sus observaciones cuando exista."
      },
      {
        id: "RESOLUCION_URGENCIA",
        title: "Resolución de declaración de urgencia",
        responsibility: "NOT_APPLICABLE",
        contentRequired: false,
        standaloneDocumentRequired: false,
        conditionalReason: "LB-5 hereda del caso LB-4 una tramitación ordinaria; solo procede si concurren y se motivan los presupuestos legales de urgencia.",
        sourceIds: [LCSP, SAE_GUIDE],
        note: "No se genera en el caso de uso ordinario."
      }
    ];

    return { expedienteId: context.expedienteId, phase: "PREPARATION_AND_INITIATION", items };
  }
}
