/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DocumentContext
 * ------------------------------------------------------------
 * Contexto único utilizado por todos los generadores
 * documentales.
 *
 * Todos los documentos del expediente utilizarán este objeto
 * como única fuente de información.
 * ============================================================
 */

import {

    ResolverContext

} from "../framework/FrameworkTypes";

import {

    ProcedureResult

} from "../types/ProcedureResult";

import {

    ThresholdResult

} from "../types/ThresholdResult";

import {

    CPVResult

} from "../types/CPVResult";

import {

    SolvencyResult

} from "../types/SolvencyResult";

import {

    AwardCriteriaResult

} from "../types/AwardCriteriaResult";

import {

    PublicationResult

} from "../types/PublicationResult";

import {

    DeadlinesResult

} from "../types/DeadlinesResult";

import {

    LotsResult

} from "../types/LotsResult";

import {

    ContractTypeResult

} from "../types/ContractTypeResult";

export interface DocumentContext {

    /**
     * Contexto original.
     */

    request: ResolverContext;

    /**
     * Motor Jurídico.
     */

    procedure: ProcedureResult;

    thresholds: ThresholdResult;

    cpv: CPVResult;

    solvency: SolvencyResult;

    award: AwardCriteriaResult;

    publication: PublicationResult;

    deadlines: DeadlinesResult;

    lots: LotsResult;

    contractType: ContractTypeResult;

    /**
     * Metadatos documentales.
     */

    expedienteNumber: string;

    generatedAt: Date;

    version: string;

    language: string;

}

