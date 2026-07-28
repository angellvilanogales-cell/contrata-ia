/**
 * ============================================================
 * CONTRATA IA
 * ExpedienteContext
 * ============================================================
 *
 * Modelo unificado del expediente.
 *
 * Todos los motores del sistema experto trabajarán
 * sobre esta estructura.
 *
 * Cada motor leerá únicamente la información que
 * necesite y añadirá nuevos resultados al contexto.
 *
 * ============================================================
 */

import { TipoProcedimiento } from "../procedimiento/TipoProcedimiento";
import { CPVEntry } from "../cpv/CPVEntry";

export class ExpedienteContext {

    // =====================================================
    // IDENTIFICACIÓN
    // =====================================================

    public expediente?: string;

    public organoContratacion?: string;

    public unidadPromotora?: string;

    // =====================================================
    // OBJETO
    // =====================================================

    public objeto = "";

    public descripcion = "";

    public tipoContrato = "";

    // =====================================================
    // IMPORTE
    // =====================================================

    public valorEstimado = 0;

    public presupuestoBase = 0;

    public iva = 21;

    // =====================================================
    // DURACIÓN
    // =====================================================

    public duracionMeses = 0;

    public prorrogas = 0;

    // =====================================================
    // LOTES
    // =====================================================

    public divisionLotes = false;

    // =====================================================
    // PROCEDIMIENTO
    // =====================================================

    public procedimiento?: TipoProcedimiento;

    // =====================================================
    // CPV
    // =====================================================

    public cpvPrincipal?: CPVEntry;

    public cpvSecundarios: CPVEntry[] = [];

    // =====================================================
    // SOLVENCIA
    // =====================================================

    public solvencia?: string;

    // =====================================================
    // CRITERIOS
    // =====================================================

    public criterios: string[] = [];

    // =====================================================
    // PUBLICIDAD
    // =====================================================

    public publicidad?: string;

    // =====================================================
    // PLAZOS
    // =====================================================

    public plazoPresentacion?: number;

    // =====================================================
    // FINANCIACIÓN
    // =====================================================

    public financiacionEuropea = false;

    public fondosPRTR = false;

    // =====================================================
    // OBSERVACIONES
    // =====================================================

    public observaciones: string[] = [];

}
