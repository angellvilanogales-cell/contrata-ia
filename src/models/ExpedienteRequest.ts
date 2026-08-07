import type { ExpedienteContext } from "../domain/expediente/ExpedienteContext";

export interface ExpedienteRequest {
  expediente?: ExpedienteContext;
  expedienteId?: string;
  userId?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}
