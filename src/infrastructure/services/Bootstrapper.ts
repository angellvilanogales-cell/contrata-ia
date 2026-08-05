/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * BOOTSTRAPPER
 *
 * Inicializa toda la infraestructura de la aplicación.
 *
 ******************************************************************************/

import { ApplicationContext } from "./ApplicationContext";

export class Bootstrapper {

    private readonly context: ApplicationContext;

    private initialized = false;

    constructor(

        context?: ApplicationContext

    ) {

        this.context =

            context ??

            new ApplicationContext();

    }

    /**************************************************************************
     *
     * Inicialización
     *
     **************************************************************************/

    public async initialize()

        : Promise<ApplicationContext> {

        if (

            this.initialized

        ) {

            return this.context;

        }

        this.context.initialize();

        this.initialized = true;

        return this.context;

    }

    /**************************************************************************
     *
     * Estado
     *
     **************************************************************************/

    public isInitialized()

        : boolean {

        return this.initialized;

    }

    public getContext()

        : ApplicationContext {

        if (

            !this.initialized

        ) {

            throw new Error(

                "Application has not been initialized."

            );

        }

        return this.context;

    }

    /**************************************************************************
     *
     * Reinicio
     *
     **************************************************************************/

    public async restart()

        : Promise<ApplicationContext> {

        await this.shutdown();

        this.initialized = false;

        return this.initialize();

    }

    /**************************************************************************
     *
     * Finalización
     *
     **************************************************************************/

    public async shutdown()

        : Promise<void> {

        if (

            !this.initialized

        ) {

            return;

        }

        this.context.dispose();

        this.initialized = false;

    }

    /**************************************************************************
     *
     * Diagnóstico
     *
     **************************************************************************/

    public diagnostics() {

        return {

            initialized:

                this.initialized,

            context:

                this.context.diagnostics()

        };

    }

}
