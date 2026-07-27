/**
 * CONTRATA IA
 * ---------------------------------------------------------
 * Fecha administrativa utilizada en el expediente.
 * ---------------------------------------------------------
 */

export class FechaAdministrativa {

    constructor(
        private readonly value: Date
    ) {

        if (!(value instanceof Date)) {
            throw new Error("Fecha no válida.");
        }

    }

    public getValue(): Date {
        return this.value;
    }

    public toISOString(): string {
        return this.value.toISOString();
    }

    public esAnteriorA(fecha: FechaAdministrativa): boolean {
        return this.value.getTime() < fecha.getValue().getTime();
    }

}
