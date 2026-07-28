/**
 * ============================================================
 * CONTRATA IA
 * DecisionLog
 * ============================================================
 *
 * Registro cronológico de todas las decisiones
 * tomadas durante la generación del expediente.
 *
 * Este registro permitirá:
 *
 * • Auditoría
 * • Depuración
 * • Explicabilidad
 * • Generación automática de informes
 *
 * ============================================================
 */

import { DecisionJuridica } from "../conocimiento/DecisionJuridica";

export class DecisionLog {

    /**
     * Fecha de la decisión.
     */
    public readonly fecha = new Date();

    /**
     * Motor que genera la decisión.
     *
     * Ejemplo:
     * CPVEngine
     * ProcedimientoEngine
     * SolvenciaEngine
     */
    public motor = "";

    /**
     * Nombre de la decisión.
     */
    public decision = "";

    /**
     * Resultado jurídico.
     */
    public resultado?: DecisionJuridica<any>;

    /**
     * Tiempo empleado (ms).
     */
    public duracion = 0;

}
