/**
 * CONTRATA IA
 * ---------------------------------------------------------
 * Número administrativo del expediente.
 * Ejemplo:
 * CONTR 2026/000123
 * ---------------------------------------------------------
 */

export class NumeroExpediente {

    constructor(
        private readonly value: string
    ) {

        if (!value.trim()) {
            throw new Error("El número de expediente es obligatorio.");
        }

        if (value.length > 50) {
            throw new Error("Número de expediente demasiado largo.");
        }

    }

    public getValue(): string {
        return this.value;
    }

    public equals(other: NumeroExpediente): boolean {
        return this.value === other.value;
    }

    public toString(): string {
        return this.value;
    }

}
