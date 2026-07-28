/**
 * CONTRATA IA
 * =========================================================
 * Contrato administrativo.
 * =========================================================
 */

import { ObjetoContrato } from "./ObjetoContrato";
import { ValorEstimado } from "./ValorEstimado";
import { PresupuestoBaseLicitacion } from "./PresupuestoBaseLicitacion";

export class Contrato {

    constructor(

        public readonly objeto: ObjetoContrato,

        public readonly valorEstimado: ValorEstimado,

        public readonly presupuestoBase: PresupuestoBaseLicitacion

    ) {}

}
