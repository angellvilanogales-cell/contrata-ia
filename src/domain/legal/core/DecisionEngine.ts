/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DecisionEngine
 * ------------------------------------------------------------
 * Orquestador principal del Motor Jurídico.
 *
 * Flujo:
 *
 * DecisionContext
 *      ↓
 * InferenceEngine
 *      ↓
 * LegalReasoner
 *      ↓
 * DecisionResult
 *
 * ============================================================
 */

import { DecisionContext } from "./DecisionContext";
import { DecisionResult } from "./DecisionResult";
import { InferenceEngine } from "./InferenceEngine";
import { InferenceRule } from "./InferenceRule";
import { Conflict } from "./Conflict";
import { LegalReasoner } from "./LegalReasoner";

export class DecisionEngine {

    constructor(

        private readonly inferenceEngine: InferenceEngine,

        private readonly legalReasoner: LegalReasoner

    ) {}

    /**
     * =====================================================
     * Ejecuta todo el proceso jurídico.
     * =====================================================
     */
    public execute(

        context: DecisionContext,

        rules: InferenceRule[],

        conflicts: Conflict[]

    ): DecisionResult {

        const inference =

            this.inferenceEngine.execute(

                context,

                rules

            );

        const reasoning =

            this.legalReasoner.reason(

                inference.result,

                conflicts

            );

        const decision: DecisionResult = {

            expediente: {

                id: context.expediente.id,

                organoContratacion:

                    context.administracion.organoContratacion,

                unidadPromotora:

                    context.administracion.unidadPromotora,

                fecha: new Date()

            },

            contrato: {

                tipoContrato:

                    context.contrato.tipoContrato ?? "",

                objeto:

                    context.expediente.objeto,

                valorEstimado:

                    context.importe.valorEstimado,

                duracionMeses:

                    context.contrato.duracionMeses ?? 0,

                divididoLotes:

                    context.contrato.divisionLotes ?? false

            },

            cpv: {

                principal: "",

                secundarios: [],

                descripcion: ""

            },

            procedimiento: {

                procedimiento: "",

                tramitacion: "",

                regulacionArmonizada: false

            },

            publicidad: {

                perfilContratante: false,

                plataformaContratacion: false,

                doue: false,

                boe: false,

                boja: false

            },

            plazos: {

                ofertasDias: 0,

                adjudicacionDias: 0,

                formalizacionDias: 0,

                subsanacionDias: 0

            },

            solvencia: {

                economica: false,

                tecnica: false,

                clasificacion: false

            },

            garantias: {

                provisional: false,

                definitiva: false

            },

            criterios: {

                precioPermitido: true,

                criteriosAutomaticos: true,

                juicioValor: false,

                calidadObligatoria: false

            },

            documentos: [],

            justificaciones:

                reasoning.legalJustifications,

            advertencias: [],

            trazabilidad: []

        };

        return decision;

    }

}
