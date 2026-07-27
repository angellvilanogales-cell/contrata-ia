/**
 * CONTRATA IA
 * ---------------------------------------------------------
 * Identificador único de un expediente.
 * ---------------------------------------------------------
 */

export class ExpedienteId {

    constructor(
        private readonly value: string
    ) {

        if (!value.trim()) {
            throw new Error("El identificador del expediente no puede estar vacío.");
        }

    }

    public getValue(): string {
        return this.value;
    }

    public equals(other: ExpedienteId): boolean {
        return this.value === other.value;
    }

    public toString(): string {
        return this.value;
    }

}
