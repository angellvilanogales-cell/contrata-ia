/**
 * ============================================================
 * CONTRATA IA
 * ExpedienteTrace
 * ============================================================
 *
 * Traza completa del expediente.
 *
 * Almacena cronológicamente todas las decisiones
 * tomadas durante la construcción del expediente.
 *
 * Será utilizada para:
 *
 * • Auditoría
 * • Depuración
 * • Informe de generación
 * • Explicación al usuario
 * • Registro interno
 *
 * ============================================================
 */

import { DecisionLog } from "./DecisionLog";

export class ExpedienteTrace {

    /**
     * Historial completo de decisiones.
     */
    private readonly decisiones: DecisionLog[] = [];

    /**
     * Añade una nueva decisión.
     */
    public agregar(

        decision: DecisionLog

    ): void {

        this.decisiones.push(decision);

    }

    /**
     * Devuelve todas las decisiones.
     */
    public obtenerTodas(): readonly DecisionLog[] {

        return this.decisiones;

    }

    /**
     * Busca las decisiones de un motor.
     */
    public obtenerPorMotor(

        motor: string

    ): DecisionLog[] {

        return this.decisiones.filter(

            d => d.motor === motor

        );

    }

    /**
     * Número total de decisiones.
     */
    public total(): number {

        return this.decisiones.length;

    }

    /**
     * Elimina toda la traza.
     */
    public limpiar(): void {

        this.decisiones.length = 0;

    }

}
