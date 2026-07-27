/**
 * CONTRATA IA
 * ---------------------------------------------------------
 * Entidad de dominio que representa un hecho administrativo.
 * Los hechos constituyen la base objetiva sobre la que el
 * Motor Jurídico generará las decisiones motivadas.
 * ---------------------------------------------------------
 */

import { TipoHecho } from "./TipoHecho";

export class HechoAdministrativo {

  constructor(

    public readonly id: string,

    public readonly tipo: TipoHecho,

    public readonly descripcion: string,

    public readonly valor: unknown,

    public readonly fechaCreacion: Date = new Date(),

    public vigente: boolean = true

  ) {

    if (id.trim().length === 0) {
      throw new Error("El identificador del hecho es obligatorio.");
    }

    if (descripcion.trim().length === 0) {
      throw new Error("La descripción del hecho es obligatoria.");
    }

  }

  public invalidar(): void {
    this.vigente = false;
  }

  public activar(): void {
    this.vigente = true;
  }

}
