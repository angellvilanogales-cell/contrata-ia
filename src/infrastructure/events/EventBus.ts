/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * EVENT BUS
 *
 ******************************************************************************/

export interface Event{

    readonly id:string;

    readonly type:string;

    readonly timestamp:Date;

    readonly payload:unknown;

}

export interface EventHandler<T extends Event=Event>{

    handle(

        event:T

    ):Promise<void>|void;

}

export class EventBus{

    private readonly handlers=

        new Map<

            string,

            EventHandler[]

        >();

    /**************************************************************************
     *
     * Registro
     *
     **************************************************************************/

    public subscribe(

        eventType:string,

        handler:EventHandler

    ):void{

        const handlers=

            this.handlers.get(

                eventType

            )??

            [];

        handlers.push(

            handler

        );

        this.handlers.set(

            eventType,

            handlers

        );

    }

    /**************************************************************************
     *
     * Baja
     *
     **************************************************************************/

    public unsubscribe(

        eventType:string,

        handler:EventHandler

    ):void{

        const handlers=

            this.handlers.get(

                eventType

            );

        if(

            !handlers

        ){

            return;

        }

        this.handlers.set(

            eventType,

            handlers.filter(

                h=>h!==handler

            )

        );

    }

    /**************************************************************************
     *
     * Publicación
     *
     **************************************************************************/

    public async publish(

        event:Event

    ):Promise<void>{

        const handlers=

            this.handlers.get(

                event.type

            )??

            [];

        for(

            const handler

            of handlers

        ){

            await handler.handle(

                event

            );

        }

    }

    /**************************************************************************
     *
     * Limpieza
     *
     **************************************************************************/

    public clear():void{

        this.handlers.clear();

    }

    /**************************************************************************
     *
     * Información
     *
     **************************************************************************/

    public statistics(){

        return{

            registeredEvents:

                this.handlers.size,

            subscriptions:

                Array.from(

                    this.handlers.entries()

                ).map(

                    ([

                        type,

                        handlers

                    ])=>({

                        type,

                        handlers:

                            handlers.length

                    })

                )

        };

    }

}
