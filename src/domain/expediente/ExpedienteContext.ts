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

    /**
     * Umbral SARA aplicable al órgano y tipo contractual en el momento
     * de tramitar el expediente. Se aporta como dato normativo versionado;
     * el motor no debe inventarlo cuando no esté disponible.
     */
    public umbralSara?: number;

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

    /**
     * Datos jurídicos necesarios para decidir procedimientos simplificados.
     * Se mantienen opcionales: ausencia de dato significa que el motor no
     * puede cerrar automáticamente esa alternativa.
     */
    public prestacionesIntelectuales?: boolean;

    public porcentajeJuicioValor?: number;

    /**
     * Para el contrato menor no basta la cuantía: debe existir una
     * justificación expresa de necesidad y de no alteración del objeto.
     */
    public contratoMenorJustificado?: boolean;

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
