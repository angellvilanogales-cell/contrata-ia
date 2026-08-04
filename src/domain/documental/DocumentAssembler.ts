/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DocumentAssembler
 * ------------------------------------------------------------
 * Orquestador completo del expediente.
 *
 * Ejecuta:
 *
 * • Motor Jurídico
 * • Motor Documental
 *
 * Devuelve el expediente completo.
 *
 * ============================================================
 */

import { ExpedienteRequest } from "../models/ExpedienteRequest";

import { DocumentResult } from "./DocumentResult";

import { DocumentContext } from "./DocumentContext";

import { MemoryGenerator } from "./generators/MemoryGenerator";

import { PCAPGenerator } from "./generators/PCAPGenerator";

import { PPTGenerator } from "./generators/PPTGenerator";

export interface ExpedienteDocuments{

    memoria:DocumentResult;

    pcap:DocumentResult;

    ppt:DocumentResult;

}

export class DocumentAssembler{

    constructor(

        private readonly context:

            DocumentContext

    ){

    }

    /**
     * =====================================================
     * Generación completa.
     * =====================================================
     */

    public generate():

        ExpedienteDocuments{

        const memoria=

            new MemoryGenerator(

                this.context

            ).generate();

        const pcap=

            new PCAPGenerator(

                this.context

            ).generate();

        const ppt=

            new PPTGenerator(

                this.context

            ).generate();

        return{

            memoria,

            pcap,

            ppt

        };

    }

}

/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * Ampliación del DocumentAssembler
 * ------------------------------------------------------------
 * Genera el expediente completo.
 * ============================================================
 */

import { ResolutionGenerator } from "./generators/ResolutionGenerator";
import { AwardReportGenerator } from "./generators/AwardReportGenerator";
import { PublicationGenerator } from "./generators/PublicationGenerator";
import { NeedReportGenerator } from "./generators/NeedReportGenerator";
import { MeansInsufficiencyGenerator } from "./generators/MeansInsufficiencyGenerator";

export interface CompleteExpediente {

    memoria: DocumentResult;

    pcap: DocumentResult;

    ppt: DocumentResult;

    necesidad: DocumentResult;

    insuficienciaMedios: DocumentResult;

    informeAdjudicacion?: DocumentResult;

    resolucionInicio?: DocumentResult;

    anuncioLicitacion?: DocumentResult;

    indice: string[];

}

/**
 * =====================================================
 * Generación del expediente completo
 * =====================================================
 */

public generateComplete(): CompleteExpediente {

    const memoria =
        new MemoryGenerator(this.context).generate();

    const pcap =
        new PCAPGenerator(this.context).generate();

    const ppt =
        new PPTGenerator(this.context).generate();

    const necesidad =
        new NeedReportGenerator(this.context).generate();

    const insuficiencia =
        new MeansInsufficiencyGenerator(this.context).generate();

    const resolucion =
        new ResolutionGenerator(this.context).generate();

    const anuncio =
        new PublicationGenerator(this.context).generate();

    const adjudicacion =
        new AwardReportGenerator(this.context).generate();

    return {

        memoria,

        pcap,

        ppt,

        necesidad,

        insuficienciaMedios: insuficiencia,

        resolucionInicio: resolucion,

        anuncioLicitacion: anuncio,

        informeAdjudicacion: adjudicacion,

        indice: this.buildIndex([

            memoria,

            pcap,

            ppt,

            necesidad,

            insuficiencia,

            resolucion,

            anuncio,

            adjudicacion

        ])

    };

}

/**
 * =====================================================
 * Índice del expediente
 * =====================================================
 */

private buildIndex(

    docs: DocumentResult[]

): string[] {

    const index: string[] = [];

    for (const doc of docs) {

        index.push(doc.title);

    }

    return index;

}

/**
 * =====================================================
 * Validación documental
 * =====================================================
 */

public validate(

    expediente: CompleteExpediente

): string[] {

    const errors: string[] = [];

    if (!expediente.memoria.sections.length) {

        errors.push("La Memoria está vacía.");

    }

    if (!expediente.pcap.sections.length) {

        errors.push("El PCAP está vacío.");

    }

    if (!expediente.ppt.sections.length) {

        errors.push("El PPT está vacío.");

    }

    return errors;

}
