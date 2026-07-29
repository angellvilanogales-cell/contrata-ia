/**
 * ============================================================
 * CONTRATA IA
 * ExpedienteOrchestrator
 * ============================================================
 *
 * Orquestador principal del expediente.
 *
 * Coordina todos los motores expertos y controla
 * la ejecución completa del expediente.
 *
 * No contiene lógica jurídica.
 *
 * Su única responsabilidad es coordinar.
 *
 * ============================================================
 */

import { ExpedienteContext } from "../domain/expediente/ExpedienteContext";

import { EstadoExpediente } from "../domain/expediente/EstadoExpediente";

import { WorkflowExpediente } from "./WorkflowExpediente";

import { PlanDocumentalEngine } from "../domain/conocimiento/PlanDocumentalEngine";

import { KnowledgeQueryEngine } from "../domain/conocimiento/KnowledgeQueryEngine";

export class ExpedienteOrchestrator {

    private readonly workflow =

        new WorkflowExpediente();

    private readonly planDocumental =

        new PlanDocumentalEngine();

    private readonly knowledge =

        new KnowledgeQueryEngine();

    /**
     * Estado actual del expediente.
     */
    private estado: EstadoExpediente =

        EstadoExpediente.BORRADOR;

    /**
     * Devuelve el estado.
     */
    public obtenerEstado(): EstadoExpediente {

        return this.estado;

    }

    /**
     * Modifica el estado.
     */
    public establecerEstado(

        estado: EstadoExpediente

    ): void {

        this.estado = estado;

    }

    /**
     * Ejecuta el flujo completo.
     */
    public ejecutar(

        contexto: ExpedienteContext

    ): void {

        this.identificar(contexto);

        this.validarObjeto(contexto);

        this.validarCPV(contexto);

        this.validarValor(contexto);

        this.validarProcedimiento(contexto);

        this.validarSolvencia(contexto);

        this.validarPublicidad(contexto);

        this.generarDocumentacion(contexto);

        this.revisionJuridica(contexto);

    }

    /**
     * Identificación.
     */
    private identificar(

        contexto: ExpedienteContext

    ): void {

        this.estado =

            EstadoExpediente.IDENTIFICADO;

    }

    /**
     * Validación objeto.
     */
    private validarObjeto(

        contexto: ExpedienteContext

    ): void {

        this.estado =

            EstadoExpediente.OBJETO_VALIDADO;

    }

    /**
     * Validación CPV.
     */
    private validarCPV(

        contexto: ExpedienteContext

    ): void {

        this.estado =

            EstadoExpediente.CPV_VALIDADO;

    }

    /**
     * Validación valor.
     */
    private validarValor(

        contexto: ExpedienteContext

    ): void {

        this.estado =

            EstadoExpediente.VALOR_VALIDADO;

    }

    /**
     * Procedimiento.
     */
    private validarProcedimiento(

        contexto: ExpedienteContext

    ): void {

        this.estado =

            EstadoExpediente.PROCEDIMIENTO_VALIDADO;

    }

    /**
     * Solvencia.
     */
    private validarSolvencia(

        contexto: ExpedienteContext

    ): void {

        this.estado =

            EstadoExpediente.SOLVENCIA_VALIDADA;

    }

    /**
     * Publicidad.
     */
    private validarPublicidad(

        contexto: ExpedienteContext

    ): void {

        this.estado =

            EstadoExpediente.PUBLICIDAD_VALIDADA;

    }

    /**
     * Generación documental.
     */
    private generarDocumentacion(

        contexto: ExpedienteContext

    ): void {

        const plan =

            this.planDocumental.construirMemoria(

                contexto

            );

        for (const bloque of plan) {

            this.knowledge.obtenerTexto(

                `knowledge/snippets/${bloque.categoria.toLowerCase()}.yaml`,

                contexto

            );

        }

        this.estado =

            EstadoExpediente.DOCUMENTACION_GENERADA;

    }

    /**
     * Revisión jurídica.
     */
    private revisionJuridica(

        contexto: ExpedienteContext

    ): void {

        this.estado =

            EstadoExpediente.REVISION_JURIDICA;

    }

    /**
     * Devuelve el workflow.
     */
    public obtenerWorkflow(

        contexto: ExpedienteContext

    ) {

        return this.workflow.construir(

            contexto

        );

    }

}
