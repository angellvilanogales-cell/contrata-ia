/**
 * ============================================================
 * CONTRATA IA
 * ExpedienteContexto
 * ============================================================
 *
 * Contexto compartido durante toda la generación
 * del expediente.
 *
 * Todos los motores leerán y escribirán sobre este
 * objeto para evitar pasar decenas de parámetros.
 *
 * ============================================================
 */

import { DecisionJuridica } from "../conocimiento/DecisionJuridica";
import { SolvenciaResultado } from "../solvencia/SolvenciaResultado";

export class ExpedienteContexto {

    /**
     * Datos introducidos por el usuario.
     */
    public objetoContrato = "";

    public necesidad = "";

    public valorEstimado = 0;

    public tipoContrato = "";

    /**
     * Resultados de los motores.
     */
    public cpv?: DecisionJuridica<string>;

    public procedimiento?: DecisionJuridica<string>;

    public publicidad?: DecisionJuridica<any>;

    public solvencia?: SolvenciaResultado;

    /**
     * Estado del expediente.
     */
    public advertencias: string[] = [];

    public errores: string[] = [];

    /**
     * Fecha de creación.
     */
    public fechaCreacion = new Date();

}
