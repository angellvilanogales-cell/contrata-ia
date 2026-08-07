import { TipoProcedimiento } from "../procedimiento/TipoProcedimiento";

export enum ContractType {
  OBRAS = "OBRAS",
  SUMINISTRO = "SUMINISTRO",
  SERVICIOS = "SERVICIOS",
  CONCESION_OBRAS = "CONCESION_OBRAS",
  CONCESION_SERVICIOS = "CONCESION_SERVICIOS",
  MIXTO = "MIXTO"
}

export { TipoProcedimiento as ProcedureType };

export enum ProcessingType {
  ORDINARIA = "ORDINARIA",
  URGENTE = "URGENTE",
  EMERGENCIA = "EMERGENCIA"
}
