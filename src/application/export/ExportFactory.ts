/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * EXPORT FACTORY
 *
 * Registro centralizado de exportadores.
 *
 ******************************************************************************/

import { ExportManager } from "./ExportManager";

import { DOCXExporter } from "./DOCXExporter";
import { PDFExporter } from "./PDFExporter";
import { HTMLExporter } from "./HTMLExporter";
import { MarkdownExporter } from "./MarkdownExporter";
import { JSONExporter } from "./JSONExporter";
import { XMLExporter } from "./XMLExporter";

export class ExportFactory {

    /**************************************************************************
     *
     * Crear ExportManager completo
     *
     **************************************************************************/

    public static create()

        : ExportManager {

        const manager =

            new ExportManager();

        manager.register(

            new DOCXExporter()

        );

        manager.register(

            new PDFExporter()

        );

        manager.register(

            new HTMLExporter()

        );

        manager.register(

            new MarkdownExporter()

        );

        manager.register(

            new JSONExporter()

        );

        manager.register(

            new XMLExporter()

        );

        return manager;

    }

}
