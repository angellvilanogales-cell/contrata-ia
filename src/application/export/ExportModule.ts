/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * EXPORT MODULE
 *
 * Fachada del subsistema completo de exportación.
 *
 ******************************************************************************/

import { ExportPipeline } from "./ExportPipeline";
import { ExportConfigurationManager } from "./ExportConfiguration";
import { ExportStatistics } from "./ExportStatistics";
import { ExportHistory } from "./ExportHistory";
import { ExportValidator } from "./ExportValidator";
import { ExportReportGenerator } from "./ExportReportGenerator";
import { ExportFormat } from "./DocumentExporter";

export class ExportModule {

    private readonly history =
        new ExportHistory();

    private readonly configuration =
        new ExportConfigurationManager();

    private readonly validator =
        new ExportValidator();

    private readonly statistics =
        new ExportStatistics(

            this.history

        );

    private readonly reports =
        new ExportReportGenerator(

            this.history

        );

    private readonly pipeline =
        new ExportPipeline();

    /**************************************************************************
     *
     * Exportación completa
     *
     **************************************************************************/

    public async exportExpediente(

        expedienteId: string,

        expediente: unknown,

        formats: ExportFormat[],

        destinationFolder: string,

        user = "SYSTEM"

    ) {

        return this.pipeline.execute(

            expedienteId,

            expediente,

            formats,

            destinationFolder,

            user

        );

    }

    /**************************************************************************
     *
     * Validación
     *
     **************************************************************************/

    public validate(

        expediente: unknown

    ) {

        return this.validator.validate(

            expediente

        );

    }

    /**************************************************************************
     *
     * Configuración
     *
     **************************************************************************/

    public configurationManager()

        : ExportConfigurationManager {

        return this.configuration;

    }

    /**************************************************************************
     *
     * Estadísticas
     *
     **************************************************************************/

    public statisticsService()

        : ExportStatistics {

        return this.statistics;

    }

    /**************************************************************************
     *
     * Informes
     *
     **************************************************************************/

    public reportGenerator()

        : ExportReportGenerator {

        return this.reports;

    }

    /**************************************************************************
     *
     * Historial
     *
     **************************************************************************/

    public exportHistory()

        : ExportHistory {

        return this.history;

    }

}
