/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * EXPEDIENTE REPOSITORY
 *
 ******************************************************************************/

import { JSONRepository } from "./JSONRepository";

export interface ExpedienteRecord {

    id: string;

    codigo: string;

    nombre: string;

    estado: string;

    fechaCreacion: string;

    fechaActualizacion: string;

    organoContratacion: string;

    unidadPromotora: string;

    responsableContrato: string;

    procedimiento: string;

    tipoContrato: string;

    cpvs: string[];

    presupuestoBase: number;

    valorEstimado: number;

    plazoMeses: number;

    workflow: {

        currentStep: string;

        status: string;

        progress: number;

    };

    metadata: Record<string, unknown>;

}

export class ExpedienteRepository

    extends JSONRepository<ExpedienteRecord> {

    constructor(

        storageDirectory = "./storage/expedientes"

    ) {

        super(

            storageDirectory,

            "expedientes.json"

        );

    }

    public async findByCodigo(

        codigo: string

    ): Promise<ExpedienteRecord | undefined> {

        const expedientes =

            await this.readAll();

        return expedientes.find(

            expediente =>

                expediente.codigo === codigo

        );

    }

    public async findByEstado(

        estado: string

    ): Promise<ReadonlyArray<ExpedienteRecord>> {

        const expedientes =

            await this.readAll();

        return expedientes.filter(

            expediente =>

                expediente.estado === estado

        );

    }

    public async findByProcedimiento(

        procedimiento: string

    ): Promise<ReadonlyArray<ExpedienteRecord>> {

        const expedientes =

            await this.readAll();

        return expedientes.filter(

            expediente =>

                expediente.procedimiento === procedimiento

        );

    }

    public async findByTipoContrato(

        tipo: string

    ): Promise<ReadonlyArray<ExpedienteRecord>> {

        const expedientes =

            await this.readAll();

        return expedientes.filter(

            expediente =>

                expediente.tipoContrato === tipo

        );

    }

    public async findByCPV(

        cpv: string

    ): Promise<ReadonlyArray<ExpedienteRecord>> {

        const expedientes =

            await this.readAll();

        return expedientes.filter(

            expediente =>

                expediente.cpvs.includes(

                    cpv

                )

        );

    }

    public async updateWorkflow(

        expedienteId: string,

        workflow: ExpedienteRecord["workflow"]

    ): Promise<void> {

        const expediente =

            await this.findById(

                expedienteId

            );

        if (

            !expediente

        ) {

            throw new Error(

                "Expediente no encontrado."

            );

        }

        expediente.workflow = workflow;

        expediente.fechaActualizacion =

            new Date().toISOString();

        await this.update(

            expediente.id,

            expediente

        );

    }

    public async search(

        text: string

    ): Promise<ReadonlyArray<ExpedienteRecord>> {

        const value =

            text.toLowerCase();

        const expedientes =

            await this.readAll();

        return expedientes.filter(

            expediente =>

                expediente.codigo

                    .toLowerCase()

                    .includes(value)

                ||

                expediente.nombre

                    .toLowerCase()

                    .includes(value)

        );

    }

}
