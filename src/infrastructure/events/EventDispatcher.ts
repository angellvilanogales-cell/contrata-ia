/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * EVENT DISPATCHER
 *
 ******************************************************************************/

import {

    Event,
    EventBus,
    EventHandler

} from "./EventBus";

export interface DispatchResult{

    eventId:string;

    eventType:string;

    handlers:number;

    successful:number;

    failed:number;

    duration:number;

}

export class EventDispatcher{

    private readonly handlers=

        new Map<string,EventHandler[]>();

    constructor(

        private readonly eventBus:EventBus

    ){

    }

    /**************************************************************************
     *
     * Registro
     *
     **************************************************************************/

    public register(

        eventType:string,

        handler:EventHandler

    ):void{

        const list=

            this.handlers.get(

                eventType

            )??

            [];

        list.push(

            handler

        );

        this.handlers.set(

            eventType,

            list

        );

        this.eventBus.subscribe(

            eventType,

            handler

        );

    }

    /**************************************************************************
     *
     * Publicación
     *
     **************************************************************************/

    public async dispatch(

        event:Event

    ):Promise<DispatchResult>{

        const started=

            Date.now();

        const handlers=

            this.handlers.get(

                event.type

            )??

            [];

        let successful=0;

        let failed=0;

        for(

            const handler

            of handlers

        ){

            try{

                await handler.handle(

                    event

                );

                successful++;

            }

            catch{

                failed++;

            }

        }

        return{

            eventId:

                event.id,

            eventType:

                event.type,

            handlers:

                handlers.length,

            successful,

            failed,

            duration:

                Date.now()-started

        };

    }

    /**************************************************************************
     *
     * Información
     *
     **************************************************************************/

    public registeredEvents()

        :string[]{

        return[

            ...this.handlers.keys()

        ];

    }

    public registeredHandlers(

        eventType:string

    ):number{

        return(

            this.handlers.get(

                eventType

            )?.length

            ??

            0

        );

    }

    /**************************************************************************
     *
     * Limpieza
     *
     **************************************************************************/

    public clear()

        :void{

        this.handlers.clear();

    }

}
