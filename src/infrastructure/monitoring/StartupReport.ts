/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * STARTUP REPORT
 *
 * Informe generado durante el arranque de la aplicación.
 *
 ******************************************************************************/

import { DiagnosticsService } from "./DiagnosticsService";

export interface StartupInformation {

    application: string;

    version: string;

    environment: string;

    startedAt: string;

    diagnostics: unknown;

}

export class StartupReport {

    constructor(

        private readonly diagnostics:

            DiagnosticsService,

        private readonly applicationName:

            string,

        private readonly version:

            string,

        private readonly environment:

            string

    ) {

    }

    /**************************************************************************
     *
     * Generación
     *
     **************************************************************************/

    public async generate()

        : Promise<StartupInformation> {

        return {

            application:

                this.applicationName,

            version:

                this.version,

            environment:

                this.environment,

            startedAt:

                new Date()

                    .toISOString(),

            diagnostics:

                await this.diagnostics.generate()

        };

    }

    /**************************************************************************
     *
     * Informe en texto
     *
     **************************************************************************/

    public async print()

        : Promise<string> {

        const report =

            await this.generate();

        return [

            "======================================",

            "ASISTENTE DE CONTRATACIÓN PÚBLICA",

            "======================================",

            "",

            `Aplicación : ${report.application}`,

            `Versión    : ${report.version}`,

            `Entorno    : ${report.environment}`,

            `Inicio     : ${report.startedAt}`,

            "",

            "Diagnóstico:",

            JSON.stringify(

                report.diagnostics,

                null,

                2

            ),

            "",

            "======================================"

        ].join("\n");

    }

}
