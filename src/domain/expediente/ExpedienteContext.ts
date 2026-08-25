/**
 * ============================================================
 * CONTRATA IA
 * ExpedienteContext
 * ============================================================
 *
 * Modelo de compatibilidad utilizado por motores heredados. Los datos que
 * procedan del expediente universal solo deben incorporarse cuando su evidencia
 * sea promocionable; la ausencia de dato no puede completarse por defecto.
 * ============================================================
 */

import { TipoProcedimiento } from "../procedimiento/TipoProcedimiento";
import { CPVEntry } from "../cpv/CPVEntry";

export class ExpedienteContext {

    public expediente?: string;
    public organoContratacion?: string;
    public unidadPromotora?: string;

    public objeto = "";
    public descripcion = "";
    public tipoContrato = "";

    public valorEstimado = 0;
    public presupuestoBase = 0;
    public iva = 21;

    /** Umbral SARA aplicable, aportado por fuente/regla versionada. */
    public umbralSara?: number;

    /** Sujeción a regulación armonizada ya determinada; nunca se presume. */
    public regulacionArmonizada?: boolean;

    public duracionMeses = 0;
    public prorrogas = 0;

    public divisionLotes = false;

    public procedimiento?: TipoProcedimiento;

    /** Datos necesarios para decidir modalidades simplificadas. */
    public prestacionesIntelectuales?: boolean;
    public porcentajeJuicioValor?: number;

    /** Justificación positiva necesaria para promover contrato menor. */
    public contratoMenorJustificado?: boolean;

    public cpvPrincipal?: CPVEntry;
    public cpvSecundarios: CPVEntry[] = [];

    public solvencia?: string;
    public criterios: string[] = [];
    public publicidad?: string;
    public plazoPresentacion?: number;

    public financiacionEuropea = false;
    public fondosPRTR = false;

    public observaciones: string[] = [];

}
