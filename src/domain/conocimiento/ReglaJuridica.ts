/**
 * ============================================================
 * CONTRATA IA
 * RuleEngine
 * ============================================================
 *
 * Gestor central de reglas jurídicas.
 *
 * NO interpreta normativa.
 *
 * NO toma decisiones.
 *
 * Únicamente administra las reglas que posteriormente
 * utilizarán los distintos motores.
 *
 * ============================================================
 */

import { ReglaJuridica } from "./ReglaJuridica";

export class RuleEngine {

    private readonly reglas: ReglaJuridica[] = [];

    /**
     * Registra una regla.
     */
    public registrar(
        regla: ReglaJuridica
    ): void {

        this.reglas.push(regla);

    }

    /**
     * Elimina una regla.
     */
    public eliminar(
        id: string
    ): void {

        const indice = this.reglas.findIndex(
            r => r.id === id
        );

        if (indice >= 0) {

            this.reglas.splice(indice, 1);

        }

    }

    /**
     * Devuelve todas las reglas.
     */
    public obtenerTodas(): ReglaJuridica[] {

        return [...this.reglas];

    }

    /**
     * Devuelve únicamente reglas activas.
     */
    public obtenerActivas(): ReglaJuridica[] {

        return this.reglas.filter(
            r => r.disponible()
        );

    }

    /**
     * Obtiene reglas de un motor.
     */
    public obtenerPorMotor(
        motor: string
    ): ReglaJuridica[] {

        return this.obtenerActivas()
            .filter(r => r.afectaMotor(motor))
            .sort(
                (a, b) =>
                    b.prioridad - a.prioridad
            );

    }

    /**
     * Busca una regla.
     */
    public obtenerPorId(
        id: string
    ): ReglaJuridica | undefined {

        return this.reglas.find(
            r => r.id === id
        );

    }

    /**
     * Número total de reglas.
     */
    public total(): number {

        return this.reglas.length;

    }

    /**
     * Elimina todas las reglas.
     */
    public limpiar(): void {

        this.reglas.length = 0;

    }

}
